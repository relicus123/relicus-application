import React from "react";
import { View, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { Heart, GraduationCap, Sparkles } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppScreen } from "../components/AppScreen";
import { Typography } from "../components/Typography";
import { Button } from "../components/Button";
import { GlassSurface } from "../components/GlassSurface";

const { width } = Dimensions.get("window");

export default function AppIntro() {
  const router = useRouter();

  const phones = [
    {
      icon: Heart,
      label: "Counselling",
      colors: ["#e9ddff", "#cfbcff"],
      iconColor: "#4f378a",
    },
    {
      icon: GraduationCap,
      label: "Learning",
      colors: ["#f2ecf4", "#e6e0e9"],
      iconColor: "#494551",
    },
    {
      icon: Sparkles,
      label: "Mindfulness",
      colors: ["#ffdf93", "#e7c365"],
      iconColor: "#765b00",
    },
  ];

  return (
    <AppScreen backgroundColor="primary" className="items-center justify-center px-8 pb-12">
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 800 }}
        className="items-center mb-16 mt-12"
      >
        <MotiView
          from={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "timing", duration: 500, delay: 200 }}
        >
          <Typography variant="display" weight="bold" color="primary" className="mb-4 text-center tracking-tighter">
            Relicus
          </Typography>
        </MotiView>
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 500, delay: 400 }}
        >
          <Typography variant="title" weight="regular" color="secondary" className="text-center" style={{ maxWidth: width * 0.8 }}>
            One App. Multiple Growth Experiences.
          </Typography>
        </MotiView>
      </MotiView>

      <View className="flex-row gap-4 mb-16">
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
            <GlassSurface intensity={30} rounded="2xl" className="w-24 h-48 border-white/20 p-4 items-center justify-center">
              <LinearGradient
                colors={phone.colors as [string, string]}
                className="absolute inset-0 opacity-50"
              />
              <phone.icon color={phone.iconColor} size={40} strokeWidth={1.5} />
              <Typography variant="caption" weight="medium" className="text-center mt-4" style={{ color: phone.iconColor }}>
                {phone.label}
              </Typography>
            </GlassSurface>
          </MotiView>
        ))}
      </View>

      <View className="flex-1" />

      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500, delay: 1400 }}
        className="w-full"
      >
        <Button
          variant="primary"
          size="lg"
          onPress={() => router.push("/landing" as any)}
          className="w-full shadow-sm"
        >
          Get Started
        </Button>
      </MotiView>
    </AppScreen>
  );
}
