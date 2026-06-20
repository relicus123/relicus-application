import { StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider } from "../components/AppContext";
import "../global.css";

if (typeof (StyleSheet as any).setFlag === "function") {
  (StyleSheet as any).setFlag("darkMode", "class");
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#FFFFF0" },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="intro" />
        </Stack>
        <StatusBar style="auto" />
      </AppProvider>
    </SafeAreaProvider>
  );
}
