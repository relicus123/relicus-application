import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { supabase } from "./supabase";

export interface UserDevice {
  id: string;
  user_id: string;
  device_id: string;
  device_name: string;
  platform: string;
  last_active_at: string;
  created_at: string;
}

const DEVICE_ID_KEY = "relicus_device_unique_id";
let cachedDeviceId: string | null = null;

/**
 * Retrieves or generates a persistent, unique identifier for this physical/browser device.
 * Persists in SecureStore (mobile) and AsyncStorage (web/fallback) so it survives restarts.
 */
export async function getOrCreateDeviceId(): Promise<string> {
  if (cachedDeviceId) {
    return cachedDeviceId;
  }

  try {
    // 1. Check Native SecureStore
    if (Platform.OS !== "web") {
      try {
        const secureId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
        if (secureId) {
          cachedDeviceId = secureId;
          return secureId;
        }
      } catch (e) {
        // SecureStore may fail in certain emulators or environments; fallback cleanly
      }
    }

    // 2. Check AsyncStorage fallback
    const asyncId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (asyncId) {
      cachedDeviceId = asyncId;
      return asyncId;
    }

    // 3. Generate a fresh UUID-like identifier
    const randomSegment = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const timeSegment = Date.now().toString(36);
    const newId = `relicus_${Platform.OS}_${timeSegment}_${randomSegment}`;

    // 4. Save to storage
    cachedDeviceId = newId;
    try {
      await AsyncStorage.setItem(DEVICE_ID_KEY, newId);
      if (Platform.OS !== "web") {
        await SecureStore.setItemAsync(DEVICE_ID_KEY, newId).catch(() => {});
      }
    } catch (e) {
      console.warn("[DeviceService] Failed to persist device ID:", e);
    }

    return newId;
  } catch (error) {
    console.error("[DeviceService] Error resolving device ID:", error);
    const fallbackId = `fallback_${Date.now()}`;
    cachedDeviceId = fallbackId;
    return fallbackId;
  }
}

/**
 * Returns user-friendly metadata for display and auditing.
 */
export async function getDeviceMetadata(): Promise<{
  deviceId: string;
  deviceName: string;
  platform: string;
}> {
  const deviceId = await getOrCreateDeviceId();
  const platform = Platform.OS;

  let deviceName = Constants.deviceName;
  if (!deviceName) {
    if (platform === "ios") {
      deviceName = "Apple Device";
    } else if (platform === "android") {
      deviceName = "Android Device";
    } else {
      deviceName = "Web Browser";
    }
  }

  return {
    deviceId,
    deviceName: `${deviceName} (${platform})`,
    platform,
  };
}

/**
 * Registers or updates this device with Supabase using the server-side RPC function.
 * If user exceeds 2 devices, the oldest device is evicted automatically.
 */
export async function registerCurrentDevice(): Promise<{
  success: boolean;
  action?: string;
  kickedCount?: number;
  error?: string;
}> {
  try {
    // 1. Verify user session exists before calling RPC to avoid unauthenticated errors
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    const { deviceId, deviceName, platform } = await getDeviceMetadata();

    const { data, error } = await supabase.rpc("register_device_session", {
      p_device_id: deviceId,
      p_device_name: deviceName,
      p_platform: platform,
      p_max_devices: 2,
    });

    if (error) {
      if (!error.message.includes("User not authenticated")) {
        console.warn("[DeviceService] register_device_session RPC error:", error.message);
      }
      return { success: false, error: error.message };
    }

    console.log("[DeviceService] Device registered successfully:", data);
    await AsyncStorage.setItem(`device_registered_${userId}`, deviceId);

    return {
      success: true,
      action: data?.action,
      kickedCount: data?.kicked_count || 0,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Unknown device registration error" };
  }
}

/**
 * Verifies if the current device is still an active registered device for the user.
 * Returns false if this device was evicted because a 3rd device logged in.
 */
export async function isCurrentDeviceActive(): Promise<boolean> {
  try {
    const deviceId = await getOrCreateDeviceId();
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;

    if (!userId) {
      return false;
    }

    const { data, error } = await supabase
      .from("user_devices")
      .select("id")
      .eq("user_id", userId)
      .eq("device_id", deviceId)
      .maybeSingle();

    if (error) {
      console.warn("[DeviceService] Error checking device status:", error.message);
      // On network/db errors, don't mistakenly boot the user
      return true;
    }

    return !!data;
  } catch (err) {
    console.warn("[DeviceService] Error in isCurrentDeviceActive:", err);
    return true;
  }
}

/**
 * Removes current device row on explicit user logout.
 */
export async function removeCurrentDevice(): Promise<void> {
  try {
    const deviceId = await getOrCreateDeviceId();
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;

    if (userId) {
      await AsyncStorage.removeItem(`device_registered_${userId}`);
      if (deviceId) {
        await supabase
          .from("user_devices")
          .delete()
          .eq("user_id", userId)
          .eq("device_id", deviceId);
      }
    }
  } catch (err) {
    console.warn("[DeviceService] Failed to remove device on logout:", err);
  }
}

/**
 * Fetches all registered devices for the current user.
 */
export async function fetchUserDevices(): Promise<UserDevice[]> {
  try {
    const { data, error } = await supabase
      .from("user_devices")
      .select("*")
      .order("last_active_at", { ascending: false });

    if (error) {
      console.warn("[DeviceService] Error fetching user devices:", error.message);
      return [];
    }

    return (data as UserDevice[]) || [];
  } catch (err) {
    console.warn("[DeviceService] fetchUserDevices unexpected error:", err);
    return [];
  }
}

/**
 * Revokes a remote device session by deleting its record.
 */
export async function revokeDevice(deviceId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("user_devices")
      .delete()
      .eq("device_id", deviceId);

    if (error) {
      console.warn("[DeviceService] Error revoking device:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[DeviceService] revokeDevice unexpected error:", err);
    return false;
  }
}
