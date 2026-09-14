import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions, Image } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "../store/auth.store";

const { width, height } = Dimensions.get("window");

export default function Splash() {
  const router = useRouter();
  const currentUser = useAuthStore(state => state.currentUser);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentUser) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/intro" as any);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [currentUser, router]);

  return (
    <View className="flex-1 bg-surface-primary">
      <LinearGradient
        colors={["#FFFFFF", "#F7F9FB", "#EDF5F8"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Floating particles background mockup */}
        <View style={StyleSheet.absoluteFill}>
          {[...Array(12)].map((_, i) => (
            <MotiView
              key={i}
              className="absolute w-2 h-2 rounded-full bg-secondary/30"
              style={{
                left: `${Math.random() * 90}%`,
                top: `${Math.random() * 90}%`,
              }}
              from={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{
                type: 'timing',
                duration: 3000,
                loop: true,
                delay: Math.random() * 2000,
              }}
            />
          ))}
        </View>

        <View className="flex-1 items-center justify-center">
          <MotiView
            from={{ opacity: 0, scale: 0.85, translateY: 15 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 1000 }}
            className="items-center justify-center"
          >
            <Image
              source={require("../assets/Relicus Logo Files (1).png")}
              style={{ width: 180, height: 216 }}
              resizeMode="contain"
            />
          </MotiView>

          {/* Loader bar */}
          <MotiView
            from={{ width: 0 }}
            animate={{ width: 180 }}
            transition={{ type: "timing", duration: 2000, delay: 500 }}
            className="h-1 bg-border-subtle rounded-full overflow-hidden mt-8"
          >
            <LinearGradient
              colors={["#1C4966", "#8FBDD7"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </MotiView>
        </View>
      </LinearGradient>
    </View>
  );
}
