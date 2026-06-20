import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { MotiView, MotiText } from "moti";
import { Heart, GraduationCap, Sparkles } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function AppIntro() {
  const router = useRouter();

  const phones = [
    {
      icon: Heart,
      label: "Counselling",
      colors: ["#1C4966", "#5F8B70"],
    },
    {
      icon: GraduationCap,
      label: "Learning",
      colors: ["#5F8B70", "#8FBDD7"],
    },
    {
      icon: Sparkles,
      label: "Mindfulness",
      colors: ["#8FBDD7", "#DDEEE3"],
    },
  ];

  return (
    <LinearGradient
      colors={["#1C4966", "#5F8B70", "#8FBDD7"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 800 }}
        style={styles.header}
      >
        <MotiText
          from={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "timing", duration: 500, delay: 200 }}
          style={styles.title}
        >
          Relicus
        </MotiText>
        <MotiText
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 500, delay: 400 }}
          style={styles.subtitle}
        >
          One App. Multiple Growth Experiences.
        </MotiText>
      </MotiView>

      <View style={styles.phoneContainer}>
        {phones.map((phone, index) => (
          <MotiView
            key={phone.label}
            from={{ opacity: 0, translateY: 50 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              type: "timing",
              duration: 600,
              delay: 600 + index * 200,
            }}
          >
            <LinearGradient
              colors={phone.colors}
              style={styles.phoneMockup}
            >
              <phone.icon color="white" size={48} strokeWidth={1.5} />
              <Text style={styles.phoneLabel}>{phone.label}</Text>
            </LinearGradient>
          </MotiView>
        ))}
      </View>

      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: "timing", duration: 500, delay: 1400 }}
        style={styles.footer}
      >
        <TouchableOpacity
          onPress={() => router.push("/landing" as any)}
          activeOpacity={0.8}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </MotiView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 20,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    maxWidth: width * 0.8,
  },
  phoneContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 48,
  },
  phoneMockup: {
    width: 96,
    height: 192,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.2)",
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  phoneLabel: {
    color: "white",
    fontSize: 10,
    marginTop: 8,
    fontWeight: "500",
    textAlign: "center",
  },
  footer: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    backgroundColor: "white",
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 99,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonText: {
    color: "#1C4966",
    fontSize: 18,
    fontWeight: "bold",
  },
});
