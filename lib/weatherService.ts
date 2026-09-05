import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SkyTime, SkyWeather } from "../components/DynamicSkyHeader";

export interface LiveWeatherResult {
  city: string;
  temperature: number | null;
  time: SkyTime;
  weather: SkyWeather;
  conditionDescription: string;
  isAuto: boolean;
}

const CACHE_KEY = "relicus_live_weather_cache";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Calculates current time-of-day category from local device clock
 */
export function getLocalClockSkyTime(): SkyTime {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 20) return "evening";
  return "night";
}

/**
 * Map WMO weather code & is_day to SkyWeather, SkyTime, and human-friendly label
 */
function parseWmoWeather(
  code: number,
  isDay: number
): { weather: SkyWeather; time: SkyTime; description: string } {
  const localClockTime = getLocalClockSkyTime();
  // If API reports night (is_day === 0) and it's late or early, use night
  const time: SkyTime = isDay === 0 ? "night" : localClockTime;

  // Rain codes: Drizzle (51-55), Rain (61-65), Freezing Rain (66-67), Showers (80-82), Thunderstorm (95-99)
  const isRain = [51, 53, 55, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code);
  // Cloudy / Overcast / Fog (2, 3, 45, 48)
  const isCloudy = [2, 3, 45, 48].includes(code);

  let weather: SkyWeather = "clear";
  let description = time === "night" ? "Clear Night" : "Clear Sky";

  if (isRain) {
    weather = "rain";
    if ([95, 96, 99].includes(code)) {
      description = "Thunderstorm";
    } else if ([80, 81, 82].includes(code)) {
      description = "Rain Showers";
    } else {
      description = "Rainy";
    }
  } else if (isCloudy) {
    weather = "cloudy";
    description = [45, 48].includes(code) ? "Misty" : "Partly Cloudy";
  } else {
    if (time === "morning") description = "Morning Sun";
    else if (time === "afternoon") description = "Sunny";
    else if (time === "evening") description = "Sunset";
    else description = "Starry Night";
  }

  return { weather, time, description };
}

/**
 * Fetch live location via IP and real-time weather from Open-Meteo
 */
export async function fetchLiveWeather(): Promise<LiveWeatherResult> {
  const defaultLocalTime = getLocalClockSkyTime();

  try {
    // 1. IP Geolocation (Zero permissions, works immediately on device & emulator)
    const geoResponse = await fetch("https://ipwho.is/", {
      headers: { Accept: "application/json" },
    });

    let latitude = 17.385;
    let longitude = 78.4867;
    let city = "Hyderabad";

    if (geoResponse.ok) {
      const geoData = await geoResponse.json();
      if (geoData.success) {
        city = geoData.city || geoData.region || "Local";
        latitude = geoData.latitude;
        longitude = geoData.longitude;
      }
    }

    // 2. Open-Meteo Live Weather API (Free, high precision, no API key required)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day&timezone=auto`;
    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      throw new Error(`Weather API returned status ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();
    const current = weatherData.current;

    if (!current) {
      throw new Error("No current weather data returned");
    }

    const parsed = parseWmoWeather(current.weather_code, current.is_day);
    const temp = Math.round(current.temperature_2m);

    const result: LiveWeatherResult = {
      city,
      temperature: temp,
      time: parsed.time,
      weather: parsed.weather,
      conditionDescription: parsed.description,
      isAuto: true,
    };

    // Cache the successful result
    try {
      await AsyncStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), data: result })
      );
    } catch {
      // ignore storage errors
    }

    return result;
  } catch (err) {
    console.log("[weatherService] Fallback to device clock:", err);
    // Graceful offline fallback based on device's local clock
    return {
      city: "Current",
      temperature: null,
      time: defaultLocalTime,
      weather: "clear",
      conditionDescription:
        defaultLocalTime === "night"
          ? "Night"
          : defaultLocalTime === "morning"
          ? "Morning"
          : defaultLocalTime === "afternoon"
          ? "Afternoon"
          : "Evening",
      isAuto: true,
    };
  }
}

/**
 * Hook to manage live location weather with cache + auto refresh
 */
export function useLiveWeather() {
  const initialLocalTime = getLocalClockSkyTime();

  const [weatherData, setWeatherData] = useState<LiveWeatherResult>({
    city: "",
    temperature: null,
    time: initialLocalTime,
    weather: "clear",
    conditionDescription:
      initialLocalTime === "night"
        ? "Night"
        : initialLocalTime === "morning"
        ? "Morning"
        : initialLocalTime === "afternoon"
        ? "Afternoon"
        : "Evening",
    isAuto: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const refreshWeather = useCallback(async () => {
    setIsLoading(true);
    try {
      const live = await fetchLiveWeather();
      setWeatherData(live);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      try {
        // Read cached weather first for instant UI response
        const cachedRaw = await AsyncStorage.getItem(CACHE_KEY);
        if (cachedRaw) {
          const { timestamp, data } = JSON.parse(cachedRaw);
          // If valid within TTL and still matches local night/day clock
          const currentLocalTime = getLocalClockSkyTime();
          if (Date.now() - timestamp < CACHE_TTL_MS && data.time === currentLocalTime) {
            if (isMounted) setWeatherData(data);
          }
        }
      } catch {
        // ignore cache read errors
      }

      // Always fetch fresh in background
      if (isMounted) {
        refreshWeather();
      }
    }

    loadInitial();

    // Auto-refresh every 20 minutes
    const interval = setInterval(() => {
      refreshWeather();
    }, 20 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [refreshWeather]);

  return {
    weatherData,
    isLoading,
    refreshWeather,
    setWeatherData,
  };
}
