import React from "react";
import { View, Dimensions, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { Heart, GraduationCap, Sparkles, Compass, ArrowRight, ShieldCheck } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Typography } from "../components/Typography";
import { Button } from "../components/Button";

const { width } = Dimensions.get("window");

export default function AppIntro() {
  const router = useRouter();

  const pillars = [
    {
      icon: Heart,
      title: "Counselling",
      badge: "Therapy",
      description: "Web portal & therapy support",
      bgGradient: ["#FAF5FF", "#F3E8FF"] as [string, string],
      borderColor: "#E9D5FF",
      iconColor: "#7C3AED",
      iconBg: "#EDE9FE",
    },
    {
      icon: GraduationCap,
      title: "Coaching",
      badge: "CUET & Exams",
      description: "Structured test prep & mocks",
      bgGradient: ["#EFF6FF", "#DBEAFE"] as [string, string],
      borderColor: "#BFDBFE",
      iconColor: "#2563EB",
      iconBg: "#DBEAFE",
    },
    {
      icon: Sparkles,
      title: "Skills Academy",
      badge: "Careers",
      description: "Masterclasses & certificates",
      bgGradient: ["#ECFDF5", "#D1FAE5"] as [string, string],
      borderColor: "#A7F3D0",
      iconColor: "#059669",
      iconBg: "#D1FAE5",
    },
    {
      icon: Compass,
      title: "KnowNext",
      badge: "Guidance",
      description: "Tuition & college roadmaps",
      bgGradient: ["#FFF7ED", "#FFEDD5"] as [string, string],
      borderColor: "#FED7AA",
      iconColor: "#EA580C",
      iconBg: "#FFEDD5",
    },
  ];

  return (
    <View className="flex-1 bg-surface-primary">
      <LinearGradient
        colors={["#FAF5FF", "#F3EEFF", "#FDF7FF"]}
        className="absolute inset-0"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView className="flex-1 justify-between px-6 py-4">
        {/* Top Header Section */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 700 }}
          className="items-center pt-2"
        >
          {/* Brand Emblem */}
          <View className="w-14 h-14 rounded-2xl bg-primary/10 items-center justify-center border border-primary/20 mb-3 shadow-sm">
            <LinearGradient
              colors={["#6750A4", "#4F378A"]}
              className="w-10 h-10 rounded-xl items-center justify-center"
            >
              <Sparkles color="#ffffff" size={22} strokeWidth={2} />
            </LinearGradient>
          </View>

          <Typography
            variant="display"
            weight="bold"
            color="primary"
            className="tracking-tight text-center text-4xl"
          >
            Relicus
          </Typography>

          <Typography
            variant="title"
            weight="semibold"
            color="primary"
            className="text-center mt-2 text-lg"
          >
            One App. Multiple Growth Experiences.
          </Typography>

          <Typography
            variant="caption"
            color="secondary"
            className="text-center mt-1 max-w-[280px]"
          >
            Empowering your academic success, career mastery, and mental wellness in one unified platform.
          </Typography>
        </MotiView>

        {/* 4 Pillars Grid Showcase */}
        <View className="my-auto py-4">
          <View className="flex-row flex-wrap justify-between gap-y-3.5">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <MotiView
                  key={pillar.title}
                  from={{ opacity: 0, scale: 0.92, translateY: 20 }}
                  animate={{ opacity: 1, scale: 1, translateY: 0 }}
                  transition={{
                    type: "timing",
                    duration: 500,
                    delay: 200 + index * 100,
                  }}
                  style={{ width: (width - 48 - 12) / 2 }}
                >
                  <LinearGradient
                    colors={pillar.bgGradient}
                    style={{ borderColor: pillar.borderColor }}
                    className="rounded-2xl border p-3.5 min-h-[128px] justify-between shadow-sm"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View
                        style={{ backgroundColor: pillar.iconBg }}
                        className="w-9 h-9 rounded-xl items-center justify-center"
                      >
                        <Icon color={pillar.iconColor} size={20} strokeWidth={2} />
                      </View>
                      <View className="bg-white/80 px-2 py-0.5 rounded-full border border-black/5">
                        <Typography
                          variant="caption"
                          weight="semibold"
                          style={{ color: pillar.iconColor, fontSize: 10 }}
                        >
                          {pillar.badge}
                        </Typography>
                      </View>
                    </View>

                    <View>
                      <Typography
                        variant="body"
                        weight="bold"
                        color="primary"
                        className="text-sm font-semibold"
                        numberOfLines={1}
                      >
                        {pillar.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="secondary"
                        className="text-xs mt-0.5 opacity-80"
                        numberOfLines={2}
                      >
                        {pillar.description}
                      </Typography>
                    </View>
                  </LinearGradient>
                </MotiView>
              );
            })}
          </View>
        </View>

        {/* Bottom CTA Section */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600, delay: 600 }}
          className="w-full pb-2"
        >
          <Button
            variant="primary"
            size="lg"
            onPress={() => router.push("/landing" as any)}
            className="w-full py-4 rounded-2xl shadow-md"
          >
            <View className="flex-row items-center justify-center gap-2">
              <Typography weight="bold" color="white" className="text-base">
                Get Started
              </Typography>
              <ArrowRight color="#ffffff" size={18} strokeWidth={2.5} />
            </View>
          </Button>

          <View className="flex-row justify-center items-center gap-1.5 mt-3.5">
            <Typography variant="bodySecondary" color="secondary">
              Already have an account?
            </Typography>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/landing" as any,
                  params: { initialMode: "login" },
                })
              }
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Typography variant="bodySecondary" weight="bold" color="primary">
                Log In
              </Typography>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-center gap-1 mt-3 opacity-60">
            <ShieldCheck color="#79747e" size={12} />
            <Typography variant="caption" color="secondary" className="text-[11px]">
              Trusted by 10,000+ students & professionals
            </Typography>
          </View>
        </MotiView>
      </SafeAreaView>
    </View>
  );
}
