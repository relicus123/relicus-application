import React, { useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, AppState, Alert, BackHandler, Platform } from "react-native";
import { Stack, useRouter, usePathname, type ErrorBoundaryProps } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider } from "../components/AppContext";
import { useAuthStore } from "../store/auth.store";
import * as Linking from "expo-linking";
import { supabase } from "../lib/supabase";
import { handleIncomingAuthUrl } from "../lib/authHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getOrCreateDeviceId, isCurrentDeviceActive, registerCurrentDevice } from "../lib/deviceService";
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

function RootNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const onBackPress = () => {
      // 1. Pop the LIFO navigation stack if possible
      if (router.canGoBack()) {
        router.back();
        return true;
      }

      // 2. If we are on any page other than Home, navigate back to Home
      const isHome = pathname === "/(tabs)/home" || pathname === "/" || pathname === "/home";
      if (!isHome) {
        router.replace("/(tabs)/home");
        return true;
      }

      // 3. We are on Home and history is empty -> allow Android to exit
      return false;
    };

    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [pathname, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#fdf7ff" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="intro" />
      <Stack.Screen name="landing" />
      <Stack.Screen name="(tabs)" />
    </Stack>
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

    let isMounted = true;
    let channel: any = null;

    getOrCreateDeviceId().then(async (currentDeviceId) => {
      if (!isMounted) return;

      const channelName = `device_eviction_${currentUser.id}_${currentDeviceId}`;

      // Remove any pre-existing channel with this name (e.g. from Fast Refresh or re-renders)
      const existingChannel = supabase.getChannels().find((c) => c.topic === `realtime:${channelName}`);
      if (existingChannel) {
        await supabase.removeChannel(existingChannel);
      }

      if (!isMounted) return;

      channel = supabase
        .channel(channelName)
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
      if (nextAppState === "active") {
        const user = useAuthStore.getState().currentUser;
        if (!user?.id) return;

        const active = await isCurrentDeviceActive();
        if (!active) {
          const deviceId = await getOrCreateDeviceId();
          const wasRegistered = await AsyncStorage.getItem(`device_registered_${user.id}`);
          const { count } = await supabase
            .from("user_devices")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id);

          const deviceCount = count || 0;

          if (wasRegistered === deviceId && deviceCount >= 2) {
            Alert.alert(
              "Logged Out on This Device",
              "Your account is active on 2 other devices. You have been signed out."
            );
            await AsyncStorage.removeItem(`device_registered_${user.id}`);
            await useAuthStore.getState().logout();
          } else {
            await registerCurrentDevice();
          }
        }
      }
    });

    return () => {
      isMounted = false;
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
          <RootNavigation />
          <GlobalDialogHost />
          <StatusBar style="auto" />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

