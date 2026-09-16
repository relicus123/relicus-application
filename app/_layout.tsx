import React, { useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, AppState, Alert } from "react-native";
import { Stack, type ErrorBoundaryProps } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider } from "../components/AppContext";
import { useAuthStore } from "../store/auth.store";
import * as Linking from "expo-linking";
import { supabase } from "../lib/supabase";
import { handleIncomingAuthUrl } from "../lib/authHelper";
import { getOrCreateDeviceId, isCurrentDeviceActive } from "../lib/deviceService";
import { GlobalDialogHost } from "../components/CustomDialog";
import "../lib/customAlert";
import "../global.css";

if (typeof (StyleSheet as any).setFlag === "function") {
  (StyleSheet as any).setFlag("darkMode", "class");
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={{ flex: 1, backgroundColor: "#fdf7ff", justifyContent: "center", alignItems: "center", padding: 24 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", color: "#4f378a", marginBottom: 8 }}>
        Something went wrong
      </Text>
      <Text style={{ fontSize: 14, color: "#64748B", textAlign: "center", marginBottom: 24 }}>
        {error.message || "An unexpected error occurred."}
      </Text>
      <TouchableOpacity
        onPress={retry}
        style={{ backgroundColor: "#4f378a", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
        activeOpacity={0.8}
      >
        <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 15 }}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // 1. Initial hydration from local storage
    useAuthStore.getState().hydrate();

    // 2. Global listener for Supabase auth events
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[Auth Event]:", event, !!session?.user);
      if (session?.user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED")) {
        await useAuthStore.getState().hydrate();
      } else if (event === "SIGNED_OUT") {
        useAuthStore.setState({ currentUser: null });
      }
    });

    // 3. Deep link listeners to catch incoming OAuth callback on mobile
    const onUrlEvent = async ({ url }: { url: string }) => {
      if (url) {
        await handleIncomingAuthUrl(url);
      }
    };

    const sub = Linking.addEventListener("url", onUrlEvent);

    Linking.getInitialURL().then((url) => {
      if (url) onUrlEvent({ url });
    });

    return () => {
      authListener?.subscription?.unsubscribe();
      sub.remove();
    };
  }, []);

  const currentUser = useAuthStore((s) => s.currentUser);

  // Monitor device session evictions in Realtime & on AppState foreground resume
  useEffect(() => {
    if (!currentUser?.id) return;

    let channel: any = null;

    getOrCreateDeviceId().then((currentDeviceId) => {
      channel = supabase
        .channel(`device_eviction_${currentUser.id}_${currentDeviceId}`)
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "user_devices",
            filter: `user_id=eq.${currentUser.id}`,
          },
          async (payload: any) => {
            if (payload?.old?.device_id === currentDeviceId) {
              Alert.alert(
                "Logged Out on This Device",
                "Your account was accessed on another device (maximum 2 devices allowed). You have been signed out."
              );
              await useAuthStore.getState().logout();
            }
          }
        )
        .subscribe();
    });

    const appStateSub = AppState.addEventListener("change", async (nextAppState) => {
      if (nextAppState === "active" && useAuthStore.getState().currentUser) {
        const active = await isCurrentDeviceActive();
        if (!active) {
          Alert.alert(
            "Logged Out on This Device",
            "Your account is active on 2 other devices. You have been signed out."
          );
          await useAuthStore.getState().logout();
        }
      }
    });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      appStateSub.remove();
    };
  }, [currentUser?.id]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#fdf7ff" },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="intro" />
            <Stack.Screen name="landing" />
            <Stack.Screen name="(tabs)" />
          </Stack>
          <GlobalDialogHost />
          <StatusBar style="auto" />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

