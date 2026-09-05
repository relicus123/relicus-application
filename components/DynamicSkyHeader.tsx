import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  RadialGradient,
  Stop,
  Path,
  Circle,
  G,
  Line,
} from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export type SkyTime = "morning" | "afternoon" | "evening" | "night";
export type SkyWeather = "clear" | "cloudy" | "rain";

interface DynamicSkyHeaderProps {
  time: SkyTime;
  weather?: SkyWeather;
  city?: string;
  temperature?: number | null;
  subtitle?: string;
  showQuote?: boolean;
}

export default function DynamicSkyHeader({
  time,
  weather = "clear",
  subtitle,
  showQuote = false,
}: DynamicSkyHeaderProps) {
  // Theme palettes for different times and weather
  const skyTheme = useMemo(() => {
    if (weather === "rain") {
      return {
        gradient: ["#0F172A", "#1E293B", "#334155", "#475569"] as const,
        sunColor: "#94A3B8",
        hillsFront: "#0A0F1D",
        hillsMid: "#131C31",
        hillsBack: "#1F2C4A",
        quote: subtitle || "Every storm passes • Keep going",
      };
    }

    if (weather === "cloudy") {
      if (time === "night") {
        return {
          gradient: ["#0B081C", "#171233", "#251F4E", "#38316B"] as const,
          moonColor: "#FEF08A",
          hillsFront: "#090618",
          hillsMid: "#130E29",
          hillsBack: "#1E173D",
          quote: subtitle || "Peaceful Night • Rest & Reflect",
        };
      }
      return {
        gradient: ["#1E293B", "#334155", "#475569", "#64748B"] as const,
        sunColor: "#FDE047",
        hillsFront: "#0F172A",
        hillsMid: "#1E293B",
        hillsBack: "#334155",
        quote: subtitle || "Find calm in the clouds • Small Steps",
      };
    }

    switch (time) {
      case "morning":
        return {
          gradient: ["#1E1038", "#4A184D", "#831843", "#C2410C", "#F97316"] as const,
          sunColor: "#FDE047",
          hillsFront: "#1B0B2E",
          hillsMid: "#3B1148",
          hillsBack: "#5B195E",
          quote: subtitle || "Rise & Shine • Small Steps Big Progress",
        };
      case "afternoon":
        return {
          gradient: ["#0284C7", "#0EA5E9", "#38BDF8", "#7DD3FC"] as const,
          sunColor: "#FACC15",
          hillsFront: "#064E3B",
          hillsMid: "#047857",
          hillsBack: "#059669",
          quote: subtitle || "Embrace Today • Big Progress",
        };
      case "evening":
        return {
          gradient: ["#1E0E3E", "#3B0764", "#701A75", "#9D174D", "#EA580C"] as const,
          sunColor: "#FB923C",
          hillsFront: "#160A2C",
          hillsMid: "#31104D",
          hillsBack: "#4C1D6E",
          quote: subtitle || "Small Steps Big Progress",
        };
      case "night":
      default:
        return {
          gradient: ["#0B061A", "#150C33", "#22134F", "#341B6E"] as const,
          moonColor: "#FEF08A",
          hillsFront: "#080415",
          hillsMid: "#140A2E",
          hillsBack: "#1F1043",
          quote: subtitle || "Rest & Reflect • Small Steps Big Progress",
        };
    }
  }, [time, weather, subtitle]);

  return (
    <View style={styles.container}>
      {/* 1. Deep Atmospheric Sky Gradient */}
      <LinearGradient
        colors={skyTheme.gradient as unknown as string[]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* 2. Vector SVG Sky & Horizon Elements */}
      <Svg
        width={SCREEN_WIDTH}
        height={260}
        viewBox="0 0 400 260"
        style={StyleSheet.absoluteFillObject}
        preserveAspectRatio="xMidYMid slice"
      >
        <Defs>
          {/* Celestial Glow Gradients */}
          <RadialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <Stop offset="35%" stopColor="#FDE047" stopOpacity="0.8" />
            <Stop offset="70%" stopColor="#F59E0B" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </RadialGradient>

          <RadialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.95" />
            <Stop offset="45%" stopColor="#FEF08A" stopOpacity="0.65" />
            <Stop offset="80%" stopColor="#FACC15" stopOpacity="0.2" />
            <Stop offset="100%" stopColor="#FACC15" stopOpacity="0" />
          </RadialGradient>

          {/* Hills Gradients */}
          <SvgGradient id="gradHillBack" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={skyTheme.hillsBack} stopOpacity="0.85" />
            <Stop offset="100%" stopColor={skyTheme.hillsBack} stopOpacity="0.98" />
          </SvgGradient>

          <SvgGradient id="gradHillMid" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={skyTheme.hillsMid} stopOpacity="0.9" />
            <Stop offset="100%" stopColor={skyTheme.hillsMid} stopOpacity="1" />
          </SvgGradient>

          <SvgGradient id="gradHillFront" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={skyTheme.hillsFront} stopOpacity="0.95" />
            <Stop offset="100%" stopColor={skyTheme.hillsFront} stopOpacity="1" />
          </SvgGradient>
        </Defs>

        {/* ------------------------------------------------------------- */}
        {/* A. Celestial Body (Sun / Moon / Overcast)                     */}
        {/* ------------------------------------------------------------- */}
        {time === "night" && weather !== "rain" && (
          <G>
            {/* Twinkling Stars */}
            <Circle cx="35" cy="45" r="1.5" fill="#FFFFFF" opacity="0.85" />
            <Circle cx="75" cy="25" r="1.2" fill="#FFFFFF" opacity="0.6" />
            <Circle cx="115" cy="60" r="1.8" fill="#FFFFFF" opacity="0.9" />
            <Circle cx="155" cy="35" r="1" fill="#FFFFFF" opacity="0.5" />
            <Circle cx="195" cy="50" r="1.6" fill="#FFFFFF" opacity="0.75" />
            <Circle cx="235" cy="20" r="1.4" fill="#FFFFFF" opacity="0.8" />
            <Circle cx="345" cy="40" r="1.5" fill="#FFFFFF" opacity="0.7" />
            <Circle cx="380" cy="70" r="1.2" fill="#FFFFFF" opacity="0.6" />
            <Circle cx="295" cy="65" r="1.4" fill="#FFFFFF" opacity="0.5" />

            {/* Glowing Moon Halo & Crescent Moon */}
            <Circle cx="280" cy="148" r="46" fill="url(#moonGlow)" />
            <Circle cx="280" cy="148" r="26" fill="#FFFBEB" />
            <Circle cx="286" cy="144" r="22" fill="#22134F" opacity="0.9" />
          </G>
        )}

        {(time === "morning" || time === "evening") && weather !== "rain" && (
          <G>
            {/* Rising/Setting Horizon Sun */}
            <Circle cx="275" cy="162" r="58" fill="url(#sunGlow)" />
            <Circle cx="275" cy="162" r="25" fill="#FFFBEB" />
          </G>
        )}

        {time === "afternoon" && weather !== "rain" && (
          <G>
            {/* Bright Daytime Sun */}
            <Circle cx="285" cy="122" r="50" fill="url(#sunGlow)" />
            <Circle cx="285" cy="122" r="22" fill="#FEF08A" />
          </G>
        )}

        {/* ------------------------------------------------------------- */}
        {/* B. Floating Clouds                                            */}
        {/* ------------------------------------------------------------- */}
        {weather === "rain" ? (
          /* Heavy Rain Clouds */
          <G opacity="0.75">
            <Path
              d="M 160 140 Q 185 125 210 140 Q 235 130 255 145 Q 270 160 240 165 L 140 165 Q 120 155 160 140 Z"
              fill="#475569"
            />
            <Path
              d="M 240 130 Q 270 115 300 130 Q 330 120 350 140 Q 365 155 330 160 L 220 160 Q 200 150 240 130 Z"
              fill="#334155"
            />
          </G>
        ) : weather === "cloudy" ? (
          /* Multi-layer Overcast / Cloudy Sky */
          <G opacity={time === "night" ? "0.45" : "0.75"}>
            <Path
              d="M 110 140 Q 130 125 150 140 Q 170 130 185 145 Q 195 155 175 160 L 100 160 Q 85 150 110 140 Z"
              fill="#FFFFFF"
            />
            <Path
              d="M 200 150 Q 220 138 240 148 Q 260 142 275 155 Q 280 165 260 168 L 195 168 Q 185 160 200 150 Z"
              fill="#E2E8F0"
            />
            <Path
              d="M 290 135 Q 312 122 332 135 Q 350 128 365 142 Q 375 155 350 158 L 285 158 Q 270 150 290 135 Z"
              fill="#CBD5E1"
            />
          </G>
        ) : (
          /* Clear / Light Floating Clouds */
          <G opacity={time === "night" ? "0.22" : "0.55"}>
            <Path
              d="M 210 155 Q 225 145 240 155 Q 255 150 265 160 Q 270 170 255 170 L 205 170 Q 195 165 210 155 Z"
              fill="#FFFFFF"
            />
            <Path
              d="M 300 145 Q 315 135 330 145 Q 345 140 355 150 Q 360 160 345 160 L 295 160 Q 285 155 300 145 Z"
              fill="#FFFFFF"
            />
          </G>
        )}

        {/* ------------------------------------------------------------- */}
        {/* C. Layered Rolling Mountain Ridges & Horizon                  */}
        {/* ------------------------------------------------------------- */}
        {/* Back Mountain Ridge */}
        <Path
          d="M -20 260 L -20 188 Q 60 150 140 180 T 300 165 T 440 185 L 440 260 Z"
          fill="url(#gradHillBack)"
        />

        {/* Mid Mountain Ridge */}
        <Path
          d="M -20 260 L -20 205 Q 80 175 180 200 T 360 180 T 440 210 L 440 260 Z"
          fill="url(#gradHillMid)"
        />

        {/* Front Mountain Ridge */}
        <Path
          d="M -20 260 L -20 225 Q 90 200 200 220 T 400 205 L 440 220 L 440 260 Z"
          fill="url(#gradHillFront)"
        />

        {/* Pine Tree Silhouettes on Ridges */}
        <G fill={skyTheme.hillsFront} opacity="0.85">
          <Path d="M 130 220 L 135 208 L 140 220 Z M 131 216 L 135 204 L 139 216 Z" />
          <Path d="M 145 222 L 150 206 L 155 222 Z M 146 216 L 150 202 L 154 216 Z" />
          <Path d="M 162 225 L 166 212 L 170 225 Z" />
          <Path d="M 300 215 L 304 202 L 308 215 Z" />
          <Path d="M 312 218 L 317 205 L 322 218 Z" />
          <Path d="M 325 220 L 330 208 L 335 220 Z" />
        </G>

        {/* ------------------------------------------------------------- */}
        {/* D. Falling Rain Streaks (If Weather is Rain)                  */}
        {/* ------------------------------------------------------------- */}
        {weather === "rain" && (
          <G stroke="#BAE6FD" strokeWidth="1.5" strokeLinecap="round" opacity="0.65">
            <Line x1="180" y1="160" x2="170" y2="185" />
            <Line x1="220" y1="150" x2="210" y2="175" />
            <Line x1="250" y1="170" x2="240" y2="195" />
            <Line x1="280" y1="155" x2="270" y2="180" />
            <Line x1="310" y1="165" x2="300" y2="190" />
            <Line x1="340" y1="150" x2="330" y2="175" />
            <Line x1="370" y1="160" x2="360" y2="185" />
            <Line x1="200" y1="180" x2="190" y2="205" />
            <Line x1="240" y1="190" x2="230" y2="215" />
            <Line x1="290" y1="185" x2="280" y2="210" />
            <Line x1="330" y1="180" x2="320" y2="205" />
          </G>
        )}
      </Svg>

      {/* 3. Motivational Horizon Script */}
      {showQuote && (
        <View style={styles.quoteBox} pointerEvents="none">
          <Text style={styles.scriptQuoteText}>{skyTheme.quote}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  quoteBox: {
    position: "absolute",
    bottom: 34,
    right: 18,
    alignItems: "flex-end",
    maxWidth: 225,
  },
  scriptQuoteText: {
    color: "rgba(255, 255, 255, 0.92)",
    fontSize: 12,
    fontWeight: "700",
    fontStyle: "italic",
    textAlign: "right",
    letterSpacing: 0.3,
    textShadowColor: "rgba(0, 0, 0, 0.45)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
