import React from "react";
import { View, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { Typography } from "../../components/Typography";

export default function SessionsScreen() {
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-surface-primary">
      <WebView 
        source={{ uri: "https://www.relicus.in" }} 
        style={{ flex: 1 }} 
        startInLoadingState={true}
        renderLoading={() => (
          <View className="absolute inset-0 items-center justify-center bg-surface-primary">
            <ActivityIndicator size="large" color="#4f378a" />
            <Typography color="secondary" className="mt-4">Loading Relicus...</Typography>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
