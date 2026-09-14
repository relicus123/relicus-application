import React from "react";
import { View, TouchableOpacity, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { SafeAreaView } from "react-native-safe-area-context";
import { 
  ArrowLeft, 
  Sparkles, 
  GraduationCap, 
  Clock, 
  CheckCircle2 
} from "lucide-react-native";

import { Typography } from "./Typography";
import { BentoCard } from "./BentoCard";
import { Button } from "./Button";

interface ComingSoonScreenProps {
  title: string;
  subtitle?: string;
  tagline?: string;
  feature?: "skills" | "knowNext" | "default";
  hideBack?: boolean;
  illustration?: any;
}

const DEFAULT_ILLUSTRATIONS = {
  skills: require("../assets/illustrations/relicus_rocket.jpg"),
  knowNext: require("../assets/illustrations/career_guidance.jpg"),
  default: require("../assets/illustrations/relicus_rocket.jpg"),
};

export function ComingSoonScreen({
  title,
  subtitle,
  tagline = "We are on the way!",
  feature = "default",
  hideBack = false,
  illustration,
}: ComingSoonScreenProps) {
  const router = useRouter();

  const isSkills = feature === "skills";
  const isKnowNext = feature === "knowNext";

  const heroImage =
    illustration ||
    (isSkills
      ? DEFAULT_ILLUSTRATIONS.skills
      : isKnowNext
      ? DEFAULT_ILLUSTRATIONS.knowNext
      : DEFAULT_ILLUSTRATIONS.default);

  const defaultSubtitle = isSkills
    ? "We're curating top-tier masterclasses, industry-certified mentors, and practical hands-on projects. See you very soon!"
    : isKnowNext
    ? "Intelligent career roadmaps, college trackers, and scholarship guidance are being prepared for your bright future. See you soon!"
    : "Exciting learning tools and personalized student resources are on the way. Stay tuned!";

  return (
    <View className="flex-1 bg-surface-primary">
      <LinearGradient
        colors={["#FFFFFF", "#EDF5F8", "#E1EFF5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-8 pt-4 rounded-b-[40px]"
      >
        <SafeAreaView edges={["top"]}>
          {/* Header Bar */}
          <View className={`flex-row items-center ${hideBack ? "justify-end" : "justify-between"} mb-4`}>
            {!hideBack && (
              <TouchableOpacity
                onPress={() => {
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace("/(tabs)/home");
                  }
                }}
                className="w-10 h-10 rounded-full bg-white/80 items-center justify-center border border-border-subtle shadow-sm"
                activeOpacity={0.8}
              >
                <ArrowLeft color="#1C4966" size={20} />
              </TouchableOpacity>
            )}

            <View className="flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-primary/20 shadow-xs">
              <Sparkles size={13} color="#1C4966" />
              <Typography variant="caption" weight="bold" color="primary">
                COMING SOON
              </Typography>
            </View>
          </View>

          {/* Hero Illustration */}
          <MotiView
            from={{ opacity: 0, scale: 0.9, translateY: 10 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="items-center"
          >
            <MotiView
              from={{ translateY: -4 }}
              animate={{ translateY: 4 }}
              transition={{
                loop: true,
                type: "timing",
                duration: 2500,
                repeatReverse: true,
              }}
              className="items-center justify-center mb-4"
            >
              <View className="w-52 h-52 rounded-[32px] bg-white shadow-xl shadow-primary/10 border-2 border-white overflow-hidden items-center justify-center p-2">
                <Image
                  source={heroImage}
                  style={{ width: "100%", height: "100%", borderRadius: 24 }}
                  resizeMode="contain"
                />
              </View>
            </MotiView>

            <Typography
              variant="display"
              weight="bold"
              color="primary"
              className="text-center text-2xl font-extrabold mb-1.5"
            >
              {tagline}
            </Typography>

            <Typography
              variant="heading"
              weight="bold"
              color="primary"
              className="text-center text-accent-primary mb-2 text-xl"
            >
              {title}
            </Typography>

            <Typography
              color="secondary"
              className="text-center px-4 leading-relaxed text-sm max-w-sm"
            >
              {subtitle || defaultSubtitle}
            </Typography>
          </MotiView>
        </SafeAreaView>
      </LinearGradient>

      {/* Content Body */}
      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 150 }}
          className="gap-4"
        >
          {/* Highlights Card */}
          <BentoCard variant="secondary" padding="lg" className="border border-border-subtle bg-white">
            <Typography variant="heading" weight="bold" color="primary" className="mb-4">
              What's Arriving Next
            </Typography>

            {isSkills ? (
              <View className="gap-3">
                <View className="flex-row items-center gap-3">
                  <CheckCircle2 size={18} color="#10B981" />
                  <Typography color="secondary" className="flex-1 font-medium">
                    Certified tech, creative, and business courses
                  </Typography>
                </View>
                <View className="flex-row items-center gap-3">
                  <CheckCircle2 size={18} color="#10B981" />
                  <Typography color="secondary" className="flex-1 font-medium">
                    Interactive project reviews & certificates
                  </Typography>
                </View>
                <View className="flex-row items-center gap-3">
                  <CheckCircle2 size={18} color="#10B981" />
                  <Typography color="secondary" className="flex-1 font-medium">
                    1-on-1 industry mentor sessions
                  </Typography>
                </View>
              </View>
            ) : isKnowNext ? (
              <View className="gap-3">
                <View className="flex-row items-center gap-3">
                  <CheckCircle2 size={18} color="#10B981" />
                  <Typography color="secondary" className="flex-1 font-medium">
                    Personalized AI career roadmaps & salaries
                  </Typography>
                </View>
                <View className="flex-row items-center gap-3">
                  <CheckCircle2 size={18} color="#10B981" />
                  <Typography color="secondary" className="flex-1 font-medium">
                    Top universities, cutoff tracker & ratings
                  </Typography>
                </View>
                <View className="flex-row items-center gap-3">
                  <CheckCircle2 size={18} color="#10B981" />
                  <Typography color="secondary" className="flex-1 font-medium">
                    National scholarship eligibility alerts
                  </Typography>
                </View>
              </View>
            ) : (
              <View className="gap-3">
                <View className="flex-row items-center gap-3">
                  <CheckCircle2 size={18} color="#10B981" />
                  <Typography color="secondary" className="flex-1 font-medium">
                    Personalized study recommendations
                  </Typography>
                </View>
              </View>
            )}
          </BentoCard>

          {/* Active Module Banner */}
          <BentoCard variant="secondary" padding="lg" className="border border-border-strong bg-surface-subtle">
            <View className="flex-row items-center gap-3 mb-2">
              <View className="w-10 h-10 rounded-xl bg-primary items-center justify-center">
                <GraduationCap size={20} color="white" />
              </View>
              <View className="flex-1">
                <Typography weight="bold" color="primary">Entrance Coaching is Live!</Typography>
                <Typography variant="caption" color="secondary">
                  CUET, JEE, NEET syllabus, video lessons & mock tests
                </Typography>
              </View>
            </View>
            <Typography variant="caption" color="secondary" className="leading-relaxed mt-1">
              While we finalize this module, your full Entrance Coaching suite is 100% active and ready.
            </Typography>
          </BentoCard>

          {/* Action CTAs */}
          <View className="gap-3 mt-2">
            <Button
              onPress={() => router.push("/(tabs)/learning" as any)}
              variant="primary"
              className="w-full shadow-md"
            >
              <View className="flex-row items-center justify-center gap-2 py-0.5">
                <GraduationCap size={18} color="white" />
                <Typography weight="bold" color="inverse">
                  Explore Entrance Coaching
                </Typography>
              </View>
            </Button>

            <Button
              onPress={() => router.push("/(tabs)/home" as any)}
              variant="flat"
              className="w-full border border-border-subtle"
            >
              <Typography weight="bold" color="primary">
                Return to Home
              </Typography>
            </Button>
          </View>
        </MotiView>
      </ScrollView>
    </View>
  );
}
