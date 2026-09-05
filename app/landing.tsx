import React, { useState, useEffect, useRef } from "react";
import { View, Dimensions, ScrollView, Pressable, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MotiView, AnimatePresence } from "moti";
import { Heart, GraduationCap, Sparkles, BookOpen, Users, ArrowRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { AppScreen } from "../components/AppScreen";
import { Typography } from "../components/Typography";
import { useAuthStore } from "../store/auth.store";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const { width } = Dimensions.get("window");

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
      />
      <Path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.26 21.36 7.33 24 12 24z"
      />
      <Path
        fill="#FBBC05"
        d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.26C.46 8.18 0 9.98 0 12s.46 3.82 1.26 5.42l4.02-3.13z"
      />
      <Path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.58l4.02 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
      />
    </Svg>
  );
}

export default function Landing() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const authStore = useAuthStore();

  const [mode, setMode] = useState<"login" | "signup">(
    params.initialMode === "login" ? "login" : "signup"
  );
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const banners = [
    {
      category: "Mental Health",
      title: "Book Therapy Sessions",
      description: "Connect 1-on-1 with licensed therapists & counsellors",
      icon: Heart,
      colors: ["#4f378a", "#6750a4"],
    },
    {
      category: "Entrance Coaching",
      title: "CUET, JEE & NEET Prep",
      description: "Expert guidance, mock tests & syllabus coverage",
      icon: GraduationCap,
      colors: ["#2563eb", "#1d4ed8"],
    },
    {
      category: "Skill Enhancement",
      title: "Skills Academy",
      description: "Industry certifications, AI tools & live masterclasses",
      icon: Sparkles,
      colors: ["#059669", "#047857"],
    },
    {
      category: "Academic & Career",
      title: "KnowNext Guidance",
      description: "Personalized roadmaps, college finder & tuition guidance",
      icon: BookOpen,
      colors: ["#d97706", "#b45309"],
    },
    {
      category: "Mindfulness",
      title: "Daily Wellness & Breathing",
      description: "Guided meditations, stress relief & daily streaks",
      icon: Users,
      colors: ["#7c3aed", "#5b21b6"],
    },
  ];

  // Auto-advance carousel banner every 4.5 seconds
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length]);

  const handleContinue = () => {
    if (phone && agreed) {
      if (mode === "signup" && (!username || !email)) {
        alert("Please fill in all fields");
        return;
      }
      router.push({
        pathname: "/otp",
        params: { mode, phone, username, email },
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await authStore.loginWithGoogle({
        email: "ashok.google@relicus.com",
        username: "ashok",
      });
      router.replace("/(tabs)/home");
    } catch (err: any) {
      alert("Google Sign-In error: " + (err?.message || "Please try again."));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <AppScreen backgroundColor="primary">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Top Header */}
        <View className="flex-row justify-between items-center px-6 pt-4 pb-3">
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 rounded-xl bg-primary items-center justify-center">
              <Sparkles color="#ffffff" size={16} strokeWidth={2.5} />
            </View>
            <Typography variant="heading" weight="bold" color="primary" className="text-2xl tracking-tight">
              Relicus
            </Typography>
          </View>
        </View>

        {/* Modern Featured Offering Card (Clean, no overlapping clunky arrows) */}
        <View className="px-6 mb-6">
          <TouchableOpacity
            activeOpacity={0.95}
            onPress={() =>
              setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1))
            }
          >
            <AnimatePresence exitBeforeEnter>
              <MotiView
                key={currentSlide}
                from={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: "timing", duration: 320 }}
                className="rounded-3xl overflow-hidden h-56 shadow-md"
              >
                <LinearGradient
                  colors={banners[currentSlide].colors as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="flex-1 p-6 justify-between"
                >
                  <View className="flex-row justify-between items-center">
                    <View className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                      <Typography
                        variant="caption"
                        weight="semibold"
                        color="white"
                        className="text-[11px] uppercase tracking-wider"
                      >
                        {banners[currentSlide].category}
                      </Typography>
                    </View>

                    <View className="w-10 h-10 rounded-2xl bg-white/15 items-center justify-center border border-white/20">
                      {(() => {
                        const Icon = banners[currentSlide].icon;
                        return <Icon color="white" size={20} strokeWidth={2} />;
                      })()}
                    </View>
                  </View>

                  <View>
                    <Typography
                      variant="title"
                      weight="bold"
                      color="white"
                      className="text-xl mb-1.5"
                    >
                      {banners[currentSlide].title}
                    </Typography>
                    <Typography
                      variant="body"
                      color="white"
                      className="text-sm opacity-90 leading-5"
                    >
                      {banners[currentSlide].description}
                    </Typography>
                  </View>
                </LinearGradient>
              </MotiView>
            </AnimatePresence>
          </TouchableOpacity>

          {/* Clean Pagination Dots */}
          <View className="flex-row justify-center items-center gap-1.5 mt-3">
            {banners.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setCurrentSlide(index)}
                hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              >
                <View
                  className={twMerge(
                    clsx(
                      "h-1.5 rounded-full transition-all",
                      index === currentSlide
                        ? "w-7 bg-primary"
                        : "w-2 bg-primary/25"
                    )
                  )}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Auth Box */}
        <View className="px-6 gap-5">
          {/* Sleek Segmented Switch */}
          <View className="bg-primary/5 p-1 rounded-2xl border border-primary/10 flex-row">
            <Pressable
              style={{ flex: 1 }}
              onPress={() => setMode("signup")}
            >
              <View
                className={twMerge(
                  clsx(
                    "py-3 items-center rounded-xl transition-all",
                    mode === "signup"
                      ? "bg-primary shadow-sm"
                      : "bg-transparent"
                  )
                )}
              >
                <Typography
                  weight="bold"
                  className={clsx(
                    "text-sm",
                    mode === "signup" ? "text-white" : "text-secondary"
                  )}
                >
                  Sign Up
                </Typography>
              </View>
            </Pressable>

            <Pressable
              style={{ flex: 1 }}
              onPress={() => setMode("login")}
            >
              <View
                className={twMerge(
                  clsx(
                    "py-3 items-center rounded-xl transition-all",
                    mode === "login"
                      ? "bg-primary shadow-sm"
                      : "bg-transparent"
                  )
                )}
              >
                <Typography
                  weight="bold"
                  className={clsx(
                    "text-sm",
                    mode === "login" ? "text-white" : "text-secondary"
                  )}
                >
                  Log In
                </Typography>
              </View>
            </Pressable>
          </View>

          {/* Google Sign In Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="flex-row items-center justify-center bg-white border border-border-subtle py-3.5 px-4 rounded-2xl shadow-sm"
          >
            {isGoogleLoading ? (
              <ActivityIndicator size="small" color="#4f378a" />
            ) : (
              <View className="flex-row items-center justify-center gap-3">
                <GoogleIcon size={20} />
                <Typography weight="semibold" color="primary" className="text-sm">
                  Continue with Google
                </Typography>
              </View>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center">
            <View className="flex-1 h-[1px] bg-primary/10" />
            <Typography
              variant="caption"
              color="secondary"
              className="mx-3 text-[11px] uppercase tracking-wider font-semibold opacity-70"
            >
              or continue with phone
            </Typography>
            <View className="flex-1 h-[1px] bg-primary/10" />
          </View>

          {/* Dynamic Signup Inputs */}
          <MotiView
            animate={{
              height: mode === "signup" ? 176 : 0,
              opacity: mode === "signup" ? 1 : 0,
            }}
            transition={{ type: "timing", duration: 250 }}
            className="overflow-hidden"
            pointerEvents={mode === "signup" ? "auto" : "none"}
          >
            <View className="gap-3.5">
              <Input
                label="Username"
                placeholder="Choose a username"
                value={username}
                onChangeText={setUsername}
              />
              <Input
                label="Email"
                keyboardType="email-address"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </MotiView>

          {/* Phone Input */}
          <Input
            label="Phone Number"
            keyboardType="phone-pad"
            placeholder="Enter your phone number"
            value={phone}
            onChangeText={setPhone}
          />

          {/* Checkbox agreement */}
          <Pressable
            onPress={() => setAgreed(!agreed)}
            style={{ width: "100%" }}
          >
            <View className="flex-row items-start gap-3 mt-1">
              <View
                className={twMerge(
                  clsx(
                    "w-5 h-5 rounded-md border-2 border-primary mt-0.5 items-center justify-center transition-all",
                    agreed ? "bg-primary" : "bg-white"
                  )
                )}
              >
                {agreed && <View className="w-2 h-2 rounded-sm bg-white" />}
              </View>
              <Typography
                variant="bodySecondary"
                color="primary"
                className="flex-1 text-xs leading-4 text-text-secondary"
              >
                I agree to the Terms & Conditions and Privacy Policy
              </Typography>
            </View>
          </Pressable>

          {/* Submit Button */}
          <Button
            onPress={handleContinue}
            disabled={!phone || !agreed}
            size="lg"
            className="w-full mt-2 rounded-2xl shadow-md py-4"
          >
            <View className="flex-row items-center justify-center gap-2">
              <Typography weight="bold" color="white" className="text-base">
                {mode === "signup" ? "Create Account" : "Log In"}
              </Typography>
              <ArrowRight color="#ffffff" size={18} strokeWidth={2.5} />
            </View>
          </Button>
        </View>
      </ScrollView>
    </AppScreen>
  );
}
