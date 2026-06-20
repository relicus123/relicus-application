import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/intro" as any);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1C4966", "#5F8B70", "#8FBDD7"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Floating particles background mockup */}
        <View style={StyleSheet.absoluteFill}>
          {[...Array(12)].map((_, i) => (
            <MotiView
              key={i}
              style={[
                styles.particle,
                {
                  left: `${Math.random() * 90}%`,
                  top: `${Math.random() * 90}%`,
                },
              ]}
              from={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{
                duration: 2000,
                loop: true,
                delay: Math.random() * 2000,
              }}
            />
          ))}
        </View>

        <View style={styles.logoContainer}>
          <MotiView
            from={{ opacity: 0, scale: 0.5, rotate: "-180deg" }}
            animate={{ opacity: 1, scale: 1, rotate: "0deg" }}
            transition={{ type: "timing", duration: 1200 }}
          >
            <Text style={styles.logoText}>Relicus</Text>
          </MotiView>

          {/* Loader bar */}
          <MotiView
            from={{ width: 0 }}
            animate={{ width: 180 }}
            transition={{ type: "timing", duration: 2000, delay: 500 }}
            style={styles.loaderBar}
          >
            <LinearGradient
              colors={["#ffffff", "#8FBDD7"]}
              style={styles.loaderFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </MotiView>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C4966",
  },
  gradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  particle: {
    position: "absolute",
    width: 6,
    height: 6,
    backgroundColor: "white",
    borderRadius: 3,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 60,
    fontWeight: "bold",
    color: "white",
    letterSpacing: -1.5,
    marginBottom: 24,
    textShadowColor: "rgba(0, 0, 0, 0.15)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  loaderBar: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 2,
    overflow: "hidden",
  },
  loaderFill: {
    height: "100%",
    width: "100%",
  },
});
