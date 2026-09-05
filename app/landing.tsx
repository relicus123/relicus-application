import React, { useState } from "react";
import { View, Dimensions, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { MotiView, AnimatePresence } from "moti";
import { Heart, GraduationCap, Sparkles, BookOpen, Users, ChevronLeft, ChevronRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { AppScreen } from "../components/AppScreen";
import { Typography } from "../components/Typography";
import { GlassSurface } from "../components/GlassSurface";
import { IconButton } from "../components/IconButton";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const { width } = Dimensions.get("window");

export default function Landing() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      title: "Book Therapy Sessions",
      description: "Connect with licensed therapists",
      icon: Heart,
      colors: ["#4f378a", "#6750a4"],
    },
    {
      title: "CUET Coaching",
      description: "Expert guidance for entrance exams",
      icon: GraduationCap,
      colors: ["#63597c", "#494551"],
    },
    {
      title: "Skill Enhancement",
      description: "Learn new skills at your pace",
      icon: Sparkles,
      colors: ["#765b00", "#c9a74d"],
    },
    {
      title: "KnowNext",
      description: "Personalized learning experience",
      icon: BookOpen,
      colors: ["#4f378a", "#cfbcff"],
    },
    {
      title: "Mindfulness Activities",
      description: "Daily meditation and wellness",
      icon: Users,
      colors: ["#c9a74d", "#765b00"],
    },
  ];

  const handleContinue = () => {
    if (phone && agreed) {
      if (mode === "signup" && (!username || !email)) {
        alert("Please fill in all fields");
        return;
      }
      router.push({
        pathname: "/otp",
        params: { mode, phone, username, email }
      });
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  return (
    <AppScreen backgroundColor="primary">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center px-6 py-6">
          <Typography variant="heading" weight="bold" color="primary">Relicus</Typography>
        </View>

        <View className="px-6 mb-8 relative">
          <AnimatePresence exitBeforeEnter>
            <MotiView
              key={currentSlide}
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "timing", duration: 300 }}
              className="rounded-3xl overflow-hidden h-64"
            >
              <LinearGradient
                colors={banners[currentSlide].colors as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="flex-1 items-center justify-center p-8"
              >
                {(() => {
                  const Icon = banners[currentSlide].icon;
                  return <Icon color="white" size={64} strokeWidth={1.5} />;
                })()}
                <Typography variant="title" weight="bold" color="white" className="mt-4 mb-2 text-center">
                  {banners[currentSlide].title}
                </Typography>
                <Typography variant="body" color="white" className="text-center opacity-90">
                  {banners[currentSlide].description}
                </Typography>
              </LinearGradient>
            </MotiView>
          </AnimatePresence>

          <IconButton
            icon={<ChevronLeft color="#1d1b20" size={24} />}
            variant="glass"
            size="md"
            onPress={prevSlide}
            className="absolute left-8 top-1/2 -mt-6 bg-white/90"
          />
          <IconButton
            icon={<ChevronRight color="#1d1b20" size={24} />}
            variant="glass"
            size="md"
            onPress={nextSlide}
            className="absolute right-8 top-1/2 -mt-6 bg-white/90"
          />

          <View className="flex-row justify-center gap-2 mt-4">
            {banners.map((_, index) => (
              <View
                key={index}
                className={twMerge(
                  clsx(
                    "h-2 rounded-full",
                    index === currentSlide ? "w-8 bg-primary" : "w-2 bg-primary/20"
                  )
                )}
              />
            ))}
          </View>
        </View>

        <View className="px-6 gap-6">
          <GlassSurface rounded="xl" intensity={40} className="p-1">
            <View className="flex-row">
              <Pressable 
                style={{ flex: 1 }}
                onPress={() => setMode("signup")}
              >
                <View className={twMerge(clsx("py-3 items-center rounded-lg", mode === "signup" && "bg-primary"))}>
                  <Typography weight="semibold" color={mode === "signup" ? "white" : "secondary"}>Sign Up</Typography>
                </View>
              </Pressable>
              <Pressable 
                style={{ flex: 1 }}
                onPress={() => setMode("login")}
              >
                <View className={twMerge(clsx("py-3 items-center rounded-lg", mode === "login" && "bg-primary"))}>
                  <Typography weight="semibold" color={mode === "login" ? "white" : "secondary"}>Log In</Typography>
                </View>
              </Pressable>
            </View>
          </GlassSurface>

          <MotiView
            animate={{ height: mode === "signup" ? 180 : 0, opacity: mode === "signup" ? 1 : 0 }}
            transition={{ type: "timing", duration: 300 }}
            className="overflow-hidden"
            pointerEvents={mode === "signup" ? "auto" : "none"}
          >
            <View className="gap-4">
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

          <Input
            label="Phone Number"
            keyboardType="phone-pad"
            placeholder="Enter your phone number"
            value={phone}
            onChangeText={setPhone}
          />

          <Pressable
            onPress={() => setAgreed(!agreed)}
            style={{ width: '100%' }}
          >
            <View className="flex-row items-start gap-3">
              <View className={twMerge(clsx(
                "w-5 h-5 rounded border-2 border-primary mt-1 items-center justify-center",
                agreed && "bg-primary"
              ))}>
                {agreed && <View className="w-2 h-2 rounded-sm bg-white" />}
              </View>
              <Typography variant="bodySecondary" color="primary" className="flex-1">
                I agree to the Terms & Conditions and Privacy Policy
              </Typography>
            </View>
          </Pressable>

          <Button
            onPress={handleContinue}
            disabled={!phone || !agreed}
            size="lg"
            className="w-full mt-4"
          >
            Continue
          </Button>
        </View>
      </ScrollView>
    </AppScreen>
  );
}
