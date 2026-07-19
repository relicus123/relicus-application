import React, { useMemo } from "react";
import { View, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Bell, Heart, GraduationCap, Sparkles, BookOpen, Users, ArrowRight } from "lucide-react-native";
import { MotiView } from "moti";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppContext } from "../../components/AppContext";
import { useSkillsStore } from "../../store/skills.store";
import { useAuthStore } from "../../store/auth.store";
import { Typography } from "../../components/Typography";
import { BentoCardPressable } from "../../components/BentoCard";
import { GlassSurface } from "../../components/GlassSurface";
import { IconButton } from "../../components/IconButton";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48 - 16) / 2; // Padding + gap adjustments for 2-column grid

export default function Home() {
  const router = useRouter();
  const { bookings } = useAppContext();
  const { enrolledCourseIds, courses, lessonProgress } = useSkillsStore();
  const { currentUser } = useAuthStore();
  const userId = currentUser?.id;
  const name = currentUser?.username || "Guest";

  const nextBooking = bookings.find((b) => b.status === "Upcoming");

  // Find first enrolled course that is not 100% completed
  const activeCourse = useMemo(() => {
    const userEnrolledIds = userId ? enrolledCourseIds[userId] || [] : [];
    if (userEnrolledIds.length === 0) return null;
    return courses
      .filter((c) => userEnrolledIds.includes(c.id))
      .find((c) => {
        const allLessons = c.modules.flatMap((m) => m.lessons);
        const total = allLessons.length;
        let sum = 0;
        allLessons.forEach(l => {
          sum += lessonProgress[`${userId}_${c.id}_${l.id}`]?.progress || 0;
        });
        const pct = total > 0 ? Math.round(sum / total) : 0;
        return pct < 100;
      }) || courses.find((c) => userEnrolledIds.includes(c.id));
  }, [enrolledCourseIds, courses, lessonProgress, userId]);

  const activeCourseProgress = useMemo(() => {
    if (!activeCourse || !userId) return 0;
    const allLessons = activeCourse.modules.flatMap((m) => m.lessons);
    const total = allLessons.length;
    let sum = 0;
    allLessons.forEach(l => {
      sum += lessonProgress[`${userId}_${activeCourse.id}_${l.id}`]?.progress || 0;
    });
    return total > 0 ? Math.round(sum / total) : 0;
  }, [activeCourse, lessonProgress, userId]);

  // Premium styled services list mapping colors from Web themeStyles
  const features = [
    {
      title: "Counselling",
      description: "Professional therapy support",
      icon: Heart,
      bg: "bg-[#FAF5FF]",
      border: "border-[#E9D5FF]",
      iconBg: "bg-[#F3E8FF]",
      iconColor: "#8B5CF6",
      titleColor: "text-[#4C1D95]",
      onPress: () => router.push("/(tabs)/sessions" as any),
    },
    {
      title: "Entrance Coaching",
      description: "CUET, JEE, NEET prep",
      icon: GraduationCap,
      bg: "bg-[#F0F7FF]",
      border: "border-[#BFDBFE]",
      iconBg: "bg-[#DBEAFE]",
      iconColor: "#3B82F6",
      titleColor: "text-[#1E3A8A]",
      onPress: () => router.push("/(tabs)/learning" as any),
    },
    {
      title: "Skills Academy",
      description: "Career development courses",
      icon: Sparkles,
      bg: "bg-[#ECFDF5]",
      border: "border-[#A7F3D0]",
      iconBg: "bg-[#D1FAE5]",
      iconColor: "#10B981",
      titleColor: "text-[#065F46]",
      onPress: () => router.push("/skills" as any),
    },
    {
      title: "KnowNext",
      description: "Career & college guidance",
      icon: BookOpen,
      bg: "bg-[#FFF7ED]",
      border: "border-[#FED7AA]",
      iconBg: "bg-[#FFEDD5]",
      iconColor: "#F97316",
      titleColor: "text-[#7C2D12]",
      onPress: () => router.push("/knowNext" as any),
    },
    {
      title: "Tuition Classes",
      description: "Interactive learning platform",
      icon: Users,
      bg: "bg-[#FDF4FF]",
      border: "border-[#F5D0FE]",
      iconBg: "bg-[#FAE8FF]",
      iconColor: "#C026D3",
      titleColor: "text-[#86198F]",
      onPress: () => router.push("/tuition" as any),
    },
    {
      title: "Mindfulness & Wellness",
      description: "Daily meditation & breathing practices",
      icon: Heart,
      bg: "bg-[#F0FDFA]",
      border: "border-[#99F6E4]",
      iconBg: "bg-[#CCFBF1]",
      iconColor: "#0D9488",
      titleColor: "text-[#115E59]",
      onPress: () => router.push("/mindfulness" as any),
    },
  ];

  return (
    <View className="flex-1 bg-surface-primary">
      <LinearGradient
        colors={["#fdf7ff", "#e9ddff", "#cfbcff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-10 rounded-b-[40px] pt-8"
      >
        <SafeAreaView edges={["top"]}>
          <View className="flex-row justify-between items-center mb-8">
            <View className="flex-row items-center gap-3">
              <GlassSurface rounded="full" intensity={40} className="w-12 h-12 items-center justify-center border-white/30 bg-primary/10">
                <Typography variant="heading" weight="bold" color="primary">
                  {name ? name[0].toUpperCase() : "R"}
                </Typography>
              </GlassSurface>
              <View>
                <Typography variant="caption" color="secondary">Welcome back,</Typography>
                <Typography variant="body" weight="semibold" color="primary">{name}</Typography>
              </View>
            </View>
            <TouchableOpacity 
              className="w-10 h-10 rounded-full bg-white/40 items-center justify-center relative border border-white/50"
              onPress={() => router.push("/notifications" as any)}
            >
              <Bell color="#4f378a" size={20} strokeWidth={2} />
              <View className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 border border-white" />
            </TouchableOpacity>
          </View>

          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <GlassSurface rounded="2xl" intensity={60} className="p-5 flex-row justify-between items-center border-white/50 bg-white/30">
              <View>
                <Typography variant="caption" color="secondary" className="mb-1">Your wellness journey</Typography>
                <Typography variant="title" weight="bold" color="primary">7 days streak 🔥</Typography>
              </View>
              <View className="items-end">
                <Typography variant="caption" color="secondary" className="mb-0.5">
                  {nextBooking ? `Next: ${nextBooking.practitioner}` : "Next Session"}
                </Typography>
                <Typography variant="bodySecondary" weight="semibold" color="primary">
                  {nextBooking ? `${nextBooking.date}, ${nextBooking.time}` : "None scheduled"}
                </Typography>
              </View>
            </GlassSurface>
          </MotiView>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        {/* Continue Learning Widget */}
        {activeCourse && (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="mb-8"
          >
            <BentoCardPressable 
              variant="secondary" 
              className="border-primary/10 bg-primary/5"
              padding="lg"
              onPress={() => {
                useSkillsStore.getState().selectCourse(activeCourse.id);
                useSkillsStore.getState().setActiveDashboardTab("curriculum");
                router.push({
                  pathname: "/skills/course-dashboard" as any,
                  params: { courseId: activeCourse.id },
                });
              }}
            >
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center gap-2">
                  <View className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <Typography variant="caption" weight="bold" color="primary" className="tracking-widest">
                    CONTINUE LEARNING
                  </Typography>
                </View>
                <View className="bg-white border border-primary/10 px-2.5 py-1 rounded-full">
                  <Typography variant="caption" weight="bold" color="primary">
                    {activeCourseProgress}% Completed
                  </Typography>
                </View>
              </View>
              <Typography variant="body" weight="bold" color="primary">{activeCourse.title}</Typography>
              <Typography variant="caption" color="secondary" className="mt-1 mb-4">Module curriculum & video lesson active</Typography>
              <View className="flex-row items-center gap-1.5">
                <Typography variant="caption" weight="bold" color="primary" className="tracking-wider uppercase">
                  Resume Lesson
                </Typography>
                <ArrowRight color="#4f378a" size={14} strokeWidth={2.5} />
              </View>
            </BentoCardPressable>
          </MotiView>
        )}

        <Typography variant="heading" weight="bold" color="primary" className="mb-4">Explore Services</Typography>

        {/* Grid for all services */}
        <View className="flex-row flex-wrap justify-between gap-y-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <MotiView
                key={feature.title}
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 50 }}
                style={{ width: CARD_WIDTH }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={feature.onPress}
                  className={twMerge(clsx(
                    "rounded-3xl border p-4 justify-between",
                    feature.bg,
                    feature.border
                  ))}
                  style={{ height: CARD_WIDTH * 1.15 }}
                >
                  <View>
                    <View className={twMerge(clsx("w-10 h-10 rounded-xl items-center justify-center mb-3", feature.iconBg))}>
                      <Icon color={feature.iconColor} size={20} strokeWidth={2.5} />
                    </View>
                    <Typography weight="bold" className={twMerge(clsx("mb-1 leading-tight", feature.titleColor))}>
                      {feature.title}
                    </Typography>
                    <Typography variant="caption" color="secondary" className="leading-tight opacity-80">
                      {feature.description}
                    </Typography>
                  </View>
                  <View className="flex-row justify-end mt-2">
                    <View className="w-7 h-7 rounded-full items-center justify-center" style={{ backgroundColor: feature.iconColor }}>
                      <ArrowRight color="white" size={14} strokeWidth={3} />
                    </View>
                  </View>
                </TouchableOpacity>
              </MotiView>
            );
          })}
        </View>


      </ScrollView>
    </View>
  );
}
