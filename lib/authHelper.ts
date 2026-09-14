import * as Linking from "expo-linking";
import { Alert, Platform } from "react-native";
import { supabase } from "./supabase";
import { useAuthStore } from "../store/auth.store";
import { formatAuthError } from "./errorHandler";

let lastProcessedUrl: string | null = null;

export function resetLastProcessedUrl() {
  lastProcessedUrl = null;
}

/**
 * Parses and processes incoming OAuth redirect URLs on native devices.
 * Extracts PKCE codes (?code=...) or implicit tokens (#access_token=...)
 * and synchronizes with Supabase Auth session and the Zustand auth store.
 */
export async function handleIncomingAuthUrl(url: string): Promise<boolean> {
  if (!url || url === lastProcessedUrl) return false;
  lastProcessedUrl = url;

  try {
    console.log("[Auth] Incoming deep link URL:", url);

    // 1. Check for error in redirect URL
    if (url.includes("error_description=")) {
      const match = url.match(/error_description=([^&]+)/);
      const desc = match ? decodeURIComponent(match[1].replace(/\+/g, " ")) : "OAuth Error";
      console.warn("[Auth] OAuth error description:", desc);
      Alert.alert("Google Sign-In Issue", formatAuthError(desc));
      return false;
    }

    // 2. Extract PKCE authorization code
    let code: string | null = null;
    if (url.includes("?")) {
      const searchStr = url.split("?")[1].split("#")[0];
      const searchParams = new URLSearchParams(searchStr);
      code = searchParams.get("code");
    }

    // 3. Extract tokens if present in hash or query
    let accessToken: string | null = null;
    let refreshToken: string | null = null;

    if (url.includes("#")) {
      const hashParams = new URLSearchParams(url.split("#")[1] || "");
      accessToken = hashParams.get("access_token");
      refreshToken = hashParams.get("refresh_token");
    }

    if (!accessToken && url.includes("?")) {
      const searchParams = new URLSearchParams(url.split("?")[1].split("#")[0] || "");
      accessToken = searchParams.get("access_token");
      refreshToken = searchParams.get("refresh_token");
    }

    // 4. Exchange PKCE code
    if (code) {
      console.log("[Auth] Exchanging PKCE code for session...");
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("[Auth] PKCE exchange error:", error.message);
        return false;
      }
      if (data?.session) {
        console.log("[Auth] PKCE session established successfully!");
        if (Platform.OS === "web" && typeof window !== "undefined" && window.history) {
          window.history.replaceState(null, "", window.location.pathname);
        }
        await useAuthStore.getState().hydrate();
        return true;
      }
    }

    // 5. Explicit session tokens
    if (accessToken && refreshToken) {
      console.log("[Auth] Setting session from redirect tokens...");
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) {
        console.error("[Auth] setSession error:", error.message);
        return false;
      }
      if (data?.session) {
        console.log("[Auth] Session established from tokens!");
        if (Platform.OS === "web" && typeof window !== "undefined" && window.history) {
          window.history.replaceState(null, "", window.location.pathname);
        }
        await useAuthStore.getState().hydrate();
        return true;
      }
    }
  } catch (err) {
    console.error("[Auth] Unexpected error processing auth URL:", err);
  }

  return false;
}
