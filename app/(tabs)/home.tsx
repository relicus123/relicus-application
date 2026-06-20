import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Bell, Heart, GraduationCap, Sparkles, BookOpen, Users, ArrowRight } from "lucide-react-native";
import { MotiView } from "moti";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppContext } from "../../components/AppContext";
import { useSkillsStore } from "../../store/skills.store";
import { useAuthStore } from "../../store/auth.store";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48 - 12) / 2; // Padding + gap adjustments for 2-column grid

export default function Home() {
  const router = useRouter();
  const { name, bookings } = useAppContext();
  const { enrolledCourseIds, courses, lessonProgress } = useSkillsStore();
  const { currentUser } = useAuthStore();
  const userId = currentUser?.id;

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
      bg: "#FAF5FF",
      border: "#E9D5FF",
      iconBg: "#F3E8FF",
      iconColor: "#8B5CF6",
      titleColor: "#4C1D95",
      onPress: () => router.push("/(tabs)/sessions" as any),
    },
    {
      title: "Entrance Coaching",
      description: "CUET, JEE, NEET prep",
      icon: GraduationCap,
      bg: "#F0F7FF",
      border: "#BFDBFE",
      iconBg: "#DBEAFE",
      iconColor: "#3B82F6",
      titleColor: "#1E3A8A",
      onPress: () => router.push("/(tabs)/learning" as any),
    },
    {
      title: "Skills Academy",
      description: "Career development courses",
      icon: Sparkles,
      bg: "#ECFDF5",
      border: "#A7F3D0",
      iconBg: "#D1FAE5",
      iconColor: "#10B981",
      titleColor: "#065F46",
      onPress: () => router.push("/skills" as any),
    },
    {
      title: "KnowNext",
      description: "Career & college guidance",
      icon: BookOpen,
      bg: "#FFF7ED",
      border: "#FED7AA",
      iconBg: "#FFEDD5",
      iconColor: "#F97316",
      titleColor: "#7C2D12",
      onPress: () => router.push("/knowNext" as any),
    },
    {
      title: "Tuition Classes",
      description: "Interactive learning platform",
      icon: Users,
      bg: "#FDF4FF",
      border: "#F5D0FE",
      iconBg: "#FAE8FF",
      iconColor: "#C026D3",
      titleColor: "#86198F",
      onPress: () => router.push("/tuition" as any),
    },
    {
      title: "Mindfulness & Wellness",
      description: "Daily meditation, breathing practices & affirmations",
      icon: Users,
      bg: "#F0FDFA",
      border: "#99F6E4",
      iconBg: "#CCFBF1",
      iconColor: "#0D9488",
      titleColor: "#115E59",
      onPress: () => router.push("/mindfulness" as any),
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1C4966", "#5F8B70"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <View style={styles.userProfile}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{name[0]?.toUpperCase() || "R"}</Text>
              </View>
              <View>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.userName}>{name}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.bellButton} onPress={() => router.push("/notifications" as any)}>
              <Bell color="white" size={20} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>

          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.streakCard}
          >
            <View>
              <Text style={styles.streakLabel}>Your wellness journey</Text>
              <Text style={styles.streakTitle}>7 days streak 🔥</Text>
            </View>
            <View style={styles.nextSession}>
              <Text style={styles.sessionLabel}>
                {nextBooking ? `Next: ${nextBooking.practitioner}` : "Next Session"}
              </Text>
              <Text style={styles.sessionTime}>
                {nextBooking ? `${nextBooking.date}, ${nextBooking.time}` : "None scheduled"}
              </Text>
            </View>
          </MotiView>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Continue Learning Widget */}
        {activeCourse && (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            style={styles.continueLearningCard}
          >
            <View style={styles.continueHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={styles.pulseDot} />
                <Text style={styles.continueLabel}>CONTINUE LEARNING</Text>
              </View>
              <View style={styles.continueBadge}>
                <Text style={styles.continueBadgeText}>{activeCourseProgress}% Completed</Text>
              </View>
            </View>
            <Text style={styles.continueCourseTitle}>{activeCourse.title}</Text>
            <Text style={styles.continueCourseInstructor}>Module curriculum & video lesson active</Text>
            <TouchableOpacity
              onPress={() => {
                useSkillsStore.getState().selectCourse(activeCourse.id);
                useSkillsStore.getState().setActiveDashboardTab("curriculum");
                router.push({
                  pathname: "/skills/course-dashboard" as any,
                  params: { courseId: activeCourse.id },
                });
              }}
              style={styles.resumeBtn}
            >
              <Text style={styles.resumeBtnText}>Resume Lesson</Text>
              <ArrowRight color="#1C4966" size={14} />
            </TouchableOpacity>
          </MotiView>
        )}

        <Text style={styles.sectionTitle}>Explore Services</Text>

        {/* Grid for all services except the last one (Mindfulness) */}
        <View style={styles.gridContainer}>
          {features.slice(0, features.length - 1).map((feature, index) => {
            const Icon = feature.icon;
            return (
              <MotiView
                key={feature.title}
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 50 }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={feature.onPress}
                  style={[
                    styles.gridCard,
                    { backgroundColor: feature.bg, borderColor: feature.border },
                  ]}
                >
                  <View>
                    <View style={[styles.gridIconContainer, { backgroundColor: feature.iconBg }]}>
                      <Icon color={feature.iconColor} size={22} strokeWidth={2} />
                    </View>
                    <Text style={[styles.gridTitle, { color: feature.titleColor }]}>
                      {feature.title}
                    </Text>
                    <Text style={styles.gridDescription}>{feature.description}</Text>
                  </View>
                  <View style={styles.gridFooter}>
                    <View style={[styles.gridArrow, { backgroundColor: feature.iconColor }]}>
                      <ArrowRight color="white" size={14} />
                    </View>
                  </View>
                </TouchableOpacity>
              </MotiView>
            );
          })}
        </View>

        {/* Full-width Card for Mindfulness */}
        {(() => {
          const feature = features[features.length - 1];
          const Icon = feature.icon;
          return (
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 200 }}
              style={{ marginTop: 12 }}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={feature.onPress}
                style={[
                  styles.fullWidthCard,
                  { backgroundColor: feature.bg, borderColor: feature.border },
                ]}
              >
                <View style={styles.fullWidthLeft}>
                  <View style={[styles.gridIconContainer, { backgroundColor: feature.iconBg }]}>
                    <Icon color={feature.iconColor} size={24} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.gridTitle, { color: feature.titleColor }]}>
                      {feature.title}
                    </Text>
                    <Text style={styles.gridDescription}>{feature.description}</Text>
                  </View>
                </View>
                <View style={[styles.gridArrow, { backgroundColor: feature.iconColor }]}>
                  <ArrowRight color="white" size={16} />
                </View>
              </TouchableOpacity>
            </MotiView>
          );
        })()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFF0",
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  userProfile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  welcomeText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
  },
  userName: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  bellButton: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    backgroundColor: "#D9534F",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#1C4966",
  },
  streakCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  streakLabel: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 12,
    marginBottom: 4,
  },
  streakTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  nextSession: {
    alignItems: "flex-end",
  },
  sessionLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 10,
    marginBottom: 2,
  },
  sessionTime: {
    color: "white",
    fontWeight: "600",
  },
  scrollContent: {
    padding: 24,
    paddingTop: 28,
    paddingBottom: 48,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 16,
  },
  continueLearningCard: {
    backgroundColor: "rgba(28, 73, 102, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.1)",
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  continueHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#5F8B70",
  },
  continueLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#5F8B70",
    letterSpacing: 1.5,
  },
  continueBadge: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  continueBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#1C4966",
  },
  continueCourseTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1C4966",
    marginTop: 12,
  },
  continueCourseInstructor: {
    fontSize: 11,
    color: "#8FBDD7",
    marginTop: 4,
  },
  resumeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 16,
  },
  resumeBtnText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#1C4966",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  gridCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.15,
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  gridIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: "bold",
    lineHeight: 18,
    marginBottom: 4,
  },
  gridDescription: {
    fontSize: 11,
    color: "#737373",
    lineHeight: 14,
  },
  gridFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  gridArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidthCard: {
    width: "100%",
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fullWidthLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  arrowText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
