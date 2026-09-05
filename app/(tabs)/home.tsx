import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Heart,
  GraduationCap,
  Sparkles,
  BookOpen,
  Calendar,
  Flame,
  Check,
  ArrowRight,
  ChevronRight,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  CloudRain,
  Cloud,
  MapPin,
  CheckSquare,
  BarChart,
  Wind,
  Smile,
} from "lucide-react-native";
import { MotiView } from "moti";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../store/auth.store";
import DynamicSkyHeader, {
  SkyTime,
  SkyWeather,
} from "../../components/DynamicSkyHeader";
import { useLiveWeather } from "../../lib/weatherService";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 32 - 12) / 2; // 2 column layout with 16px screen padding & 12px gap

export default function Home() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const rawName = currentUser?.username || "Ashok";
  const displayName = useMemo(() => {
    if (!rawName) return "Ashok";
    return rawName
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }, [rawName]);

  // Live Location & Real-Time Weather Service
  const { weatherData, refreshWeather } = useLiveWeather();

  // Mode cycling:
  // Index 0: Live Auto (automatically synced to user's real location + weather + device clock)
  // Index 1-5: Manual preview modes so user can preview any scene on demand
  const [skyModeIndex, setSkyModeIndex] = useState<number>(0);

  const skyModes = useMemo(
    () => [
      { label: "Live", isAuto: true, time: weatherData.time, weather: weatherData.weather },
      { label: "Sunrise", isAuto: false, time: "morning" as SkyTime, weather: "clear" as SkyWeather },
      { label: "Sunny Noon", isAuto: false, time: "afternoon" as SkyTime, weather: "clear" as SkyWeather },
      { label: "Sunset", isAuto: false, time: "evening" as SkyTime, weather: "clear" as SkyWeather },
      { label: "Starry Night", isAuto: false, time: "night" as SkyTime, weather: "clear" as SkyWeather },
      { label: "Rainy", isAuto: false, time: "afternoon" as SkyTime, weather: "rain" as SkyWeather },
    ],
    [weatherData]
  );

  const currentSkyMode = skyModes[skyModeIndex];

  const { activeSkyTime, activeSkyWeather, pillLabel } = useMemo(() => {
    if (!currentSkyMode.isAuto) {
      return {
        activeSkyTime: currentSkyMode.time,
        activeSkyWeather: currentSkyMode.weather,
        pillLabel: currentSkyMode.label,
      };
    }

    // Live Automatic Mode: Uses real location, temperature, & WMO weather
    const time = weatherData.time;
    const weather = weatherData.weather;
    const city = weatherData.city || "Live";
    const temp = weatherData.temperature !== null ? `${weatherData.temperature}°C` : "";
    const pill = temp ? `${city} ${temp}` : city;

    return {
      activeSkyTime: time,
      activeSkyWeather: weather,
      pillLabel: pill,
    };
  }, [currentSkyMode, weatherData]);

  const greeting = useMemo(() => {
    if (activeSkyTime === "morning") return "Good morning,";
    if (activeSkyTime === "afternoon") return "Good afternoon,";
    if (activeSkyTime === "evening") return "Good evening,";
    return "Peaceful night,";
  }, [activeSkyTime]);

  const todayStr = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
    };
    return new Date().toLocaleDateString("en-US", options);
  }, []);

  const firstName = displayName ? displayName.split(" ")[0] : "Ashok";

  const learningSlides = useMemo(
    () => [
      {
        tag: "ENTRANCE COACHING",
        title: `Keep Going, ${firstName}!`,
        quote: "Consistency today creates opportunities tomorrow.",
        buttonText: "Continue Learning",
        route: "/(tabs)/learning",
      },
      {
        tag: "SKILL ENHANCEMENT",
        title: `Master Skills, ${firstName}!`,
        quote: "Small daily steps lead to giant leaps in your career.",
        buttonText: "Browse Courses",
        route: "/skills",
      },
      {
        tag: "MINDFULNESS & CALM",
        title: `Find Your Calm, ${firstName}!`,
        quote: "A peaceful mind is a student's greatest superpower.",
        buttonText: "Start Breathing",
        route: "/mindfulness",
      },
      {
        tag: "COUNSELLING & THERAPY",
        title: `Here For You, ${firstName}!`,
        quote: "You don't have to carry it all alone. We're here.",
        buttonText: "Book a Session",
        route: "/(tabs)/sessions",
      },
    ],
    [firstName]
  );
  const [activeSlide, setActiveSlide] = useState<number>(0);

  // Auto-cycle through the 4 learning slides
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % learningSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [learningSlides.length]);

  const cycleSkyMode = () => {
    setSkyModeIndex((prev) => (prev + 1) % skyModes.length);
  };

  const WeatherIconComponent = useMemo(() => {
    if (activeSkyWeather === "rain") return CloudRain;
    if (activeSkyWeather === "cloudy") return Cloud;
    if (activeSkyTime === "morning") return Sunrise;
    if (activeSkyTime === "afternoon") return Sun;
    if (activeSkyTime === "evening") return Sunset;
    return Moon;
  }, [activeSkyTime, activeSkyWeather]);

  return (
    <View style={styles.rootContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ================================================================= */}
        {/* 1. DYNAMIC SKY HORIZON HEADER (MORNING / NOON / NIGHT / RAIN)     */}
        {/* ================================================================= */}
        <View style={styles.scenicHeader}>
          {/* Dynamic Vector Sky Component */}
          <DynamicSkyHeader
            time={activeSkyTime}
            weather={activeSkyWeather}
          />

          {/* Top User Greeting & Status Bar */}
          <SafeAreaView
            edges={["top"]}
            style={styles.greetingSafeArea}
            pointerEvents="box-none"
          >
            {/* Top Bar: Weather & Date Badges on Left, Profile Avatar on Right */}
            <View style={styles.topUtilityRow}>
              <View style={styles.pillsCluster}>
                {/* Weather & Sky Mode Selector Pill */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={cycleSkyMode}
                  onLongPress={refreshWeather}
                  style={styles.weatherPill}
                >
                  {currentSkyMode.isAuto && (
                    <MapPin size={10} color="#67E8F9" strokeWidth={2.4} />
                  )}
                  <WeatherIconComponent size={12} color="#FFFFFF" strokeWidth={2.4} />
                  <Text style={styles.weatherPillText} numberOfLines={1}>
                    {pillLabel}
                  </Text>
                </TouchableOpacity>

                {/* Date Pill */}
                <View style={styles.datePill}>
                  <Calendar size={11} color="#FFFFFF" strokeWidth={2.2} />
                  <Text style={styles.datePillText} numberOfLines={1}>{todayStr}</Text>
                </View>
              </View>

              {/* Profile Avatar with Glowing Gradient Ring */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push("/(tabs)/profile")}
                style={styles.avatarContainer}
              >
                <LinearGradient
                  colors={["#D946EF", "#8B5CF6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatarRing}
                >
                  <View style={styles.avatarInner}>
                    <Text style={styles.avatarLetter}>
                      {displayName ? displayName[0].toUpperCase() : "A"}
                    </Text>
                  </View>
                </LinearGradient>
                {/* Online Indicator Dot */}
                <View style={styles.avatarStatusDot} />
              </TouchableOpacity>
            </View>

            {/* Greeting Hero Section - Now has full width on the left */}
            <View style={styles.greetingHeroBlock}>
              <Text style={styles.greetingPreText}>{greeting}</Text>
              <Text style={styles.greetingNameText} numberOfLines={1} ellipsizeMode="tail">
                {displayName} 👋
              </Text>
              <Text style={styles.greetingSubText} numberOfLines={2}>
                A healthier, brighter you every day.
              </Text>
            </View>
          </SafeAreaView>
        </View>

        {/* ================================================================= */}
        {/* 2. LEARNING JOURNEY HERO BANNER & QUICK ACTIONS                   */}
        {/* ================================================================= */}
        <View style={styles.heroCardOverlapWrapper}>
          {/* Main Hero Card: Learning Journey with student artwork & quote */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 400 }}
            style={styles.learningHeroCard}
          >
            {/* Right Background Artwork Image */}
            <Image
              source={require("../../assets/home/learning_journey_banner.jpg")}
              style={styles.learningBannerImg}
              resizeMode="cover"
            />

            {/* Gradient Mask to ensure high-contrast legibility for text */}
            <LinearGradient
              colors={[
                "#FFFFFF",
                "#FFFFFF",
                "rgba(255, 255, 255, 0.95)",
                "rgba(255, 255, 255, 0.65)",
                "rgba(255, 255, 255, 0.0)",
              ]}
              start={{ x: 0.38, y: 0 }}
              end={{ x: 0.68, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />

            {/* Content Column */}
            <View style={styles.learningHeroContent}>
              <Text style={styles.learningTagText}>
                {learningSlides[activeSlide].tag}
              </Text>
              <Text style={styles.learningHeroTitle}>
                {learningSlides[activeSlide].title}
              </Text>
              <Text style={styles.learningHeroQuote}>
                "{learningSlides[activeSlide].quote}"
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push(learningSlides[activeSlide].route as any)}
                style={styles.continueLearningBtn}
              >
                <Text style={styles.continueLearningBtnText}>
                  {learningSlides[activeSlide].buttonText}
                </Text>
                <ArrowRight color="#FFFFFF" size={13} strokeWidth={2.6} />
              </TouchableOpacity>

              {/* Carousel Pagination Indicator Dots */}
              <View style={styles.carouselDotsRow}>
                {learningSlides.map((_, dotIdx) => (
                  <TouchableOpacity
                    key={dotIdx}
                    activeOpacity={0.7}
                    onPress={() => setActiveSlide(dotIdx)}
                    style={[
                      styles.carouselDot,
                      activeSlide === dotIdx && styles.carouselDotActive,
                    ]}
                  />
                ))}
              </View>
            </View>
          </MotiView>

          {/* 4-Item Quick Actions Card: Daily Relicus Student & Wellness Habits */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 450, delay: 100 }}
            style={styles.quickActionsCard}
          >
            {/* 1. Daily Breathe */}
            <TouchableOpacity
              activeOpacity={0.78}
              onPress={() => router.push("/mindfulness" as any)}
              style={styles.quickActionItem}
            >
              <View style={[styles.quickActionIconBox, { backgroundColor: "#ECFDF5" }]}>
                <Wind color="#059669" size={20} strokeWidth={2.2} />
              </View>
              <Text style={styles.quickActionTitle} numberOfLines={1}>
                Daily Breathe
              </Text>
              <Text style={styles.quickActionSubtitle} numberOfLines={1}>
                3-min calm
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.quickActionDivider} />

            {/* 2. My Sessions */}
            <TouchableOpacity
              activeOpacity={0.78}
              onPress={() => router.push("/(tabs)/sessions" as any)}
              style={styles.quickActionItem}
            >
              <View style={[styles.quickActionIconBox, { backgroundColor: "#F5F3FF" }]}>
                <Calendar color="#7C3AED" size={20} strokeWidth={2.2} />
              </View>
              <Text style={styles.quickActionTitle} numberOfLines={1}>
                My Sessions
              </Text>
              <Text style={styles.quickActionSubtitle} numberOfLines={1}>
                Therapy & class
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.quickActionDivider} />

            {/* 3. Mock Tests */}
            <TouchableOpacity
              activeOpacity={0.78}
              onPress={() => router.push("/(tabs)/learning" as any)}
              style={styles.quickActionItem}
            >
              <View style={[styles.quickActionIconBox, { backgroundColor: "#FFF7ED" }]}>
                <CheckSquare color="#EA580C" size={20} strokeWidth={2.2} />
              </View>
              <Text style={styles.quickActionTitle} numberOfLines={1}>
                Mock Tests
              </Text>
              <Text style={styles.quickActionSubtitle} numberOfLines={1}>
                Practice & test
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.quickActionDivider} />

            {/* 4. Mood Journal */}
            <TouchableOpacity
              activeOpacity={0.78}
              onPress={() => router.push("/mindfulness" as any)}
              style={styles.quickActionItem}
            >
              <View style={[styles.quickActionIconBox, { backgroundColor: "#FFF1F2" }]}>
                <Smile color="#E11D48" size={20} strokeWidth={2.2} />
              </View>
              <Text style={styles.quickActionTitle} numberOfLines={1}>
                Mood Journal
              </Text>
              <Text style={styles.quickActionSubtitle} numberOfLines={1}>
                Daily check-in
              </Text>
            </TouchableOpacity>
          </MotiView>
        </View>

        {/* ================================================================= */}
        {/* 3. EXPLORE SERVICES SECTION (2x2 Grid with Real Design Assets)    */}
        {/* ================================================================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Explore Services</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/skills" as any)}
            style={styles.seeAllBtn}
          >
            <Text style={styles.seeAllText}>See All</Text>
            <ChevronRight color="#7C3AED" size={15} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* 2-Column Grid */}
        <View style={styles.servicesGrid}>
          {/* 1. Counselling */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push("/(tabs)/sessions" as any)}
            style={[styles.serviceCard, styles.counsellingCard]}
          >
            {/* Real Pastel Armchair Illustration Behind Text */}
            <Image
              source={require("../../assets/home/counselling_illust.png")}
              style={styles.serviceCardImg}
              resizeMode="contain"
            />
            <View style={[styles.serviceIconCircle, { backgroundColor: "#F3E8FF" }]}>
              <Heart color="#8B5CF6" size={18} strokeWidth={2.4} />
            </View>
            <Text style={[styles.serviceTitle, { color: "#1E1B4B" }]}>
              Counselling
            </Text>
            <Text style={styles.serviceSubtitle}>
              Professional therapy support
            </Text>
            <View style={styles.actionLinkRow}>
              <Text style={[styles.actionLinkText, { color: "#7C3AED" }]}>
                Get Support
              </Text>
              <ArrowRight color="#7C3AED" size={12} strokeWidth={2.5} />
            </View>
          </TouchableOpacity>

          {/* 2. Entrance Coaching */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push("/(tabs)/learning" as any)}
            style={[styles.serviceCard, styles.coachingCard]}
          >
            {/* Real Pastel Books Illustration Behind Text */}
            <Image
              source={require("../../assets/home/coaching_illust.png")}
              style={styles.serviceCardImg}
              resizeMode="contain"
            />
            <View style={[styles.serviceIconCircle, { backgroundColor: "#DBEAFE" }]}>
              <GraduationCap color="#2563EB" size={18} strokeWidth={2.4} />
            </View>
            <Text style={[styles.serviceTitle, { color: "#1E1B4B" }]}>
              Entrance Coaching
            </Text>
            <Text style={styles.serviceSubtitle}>
              CUET, JEE, NEET prep
            </Text>
            <View style={styles.actionLinkRow}>
              <Text style={[styles.actionLinkText, { color: "#2563EB" }]}>
                Start Learning
              </Text>
              <ArrowRight color="#2563EB" size={12} strokeWidth={2.5} />
            </View>
          </TouchableOpacity>

          {/* 3. Skills Academy */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push("/skills" as any)}
            style={[styles.serviceCard, styles.skillsCard]}
          >
            {/* Real Pastel Growth Chart Illustration Behind Text */}
            <Image
              source={require("../../assets/home/skills_illust.png")}
              style={styles.serviceCardImg}
              resizeMode="contain"
            />
            <View style={[styles.serviceIconCircle, { backgroundColor: "#DCFCE7" }]}>
              <Sparkles color="#16A34A" size={18} strokeWidth={2.4} />
            </View>
            <Text style={[styles.serviceTitle, { color: "#1E1B4B" }]}>
              Skills Academy
            </Text>
            <Text style={styles.serviceSubtitle}>
              Career development courses
            </Text>
            <View style={styles.actionLinkRow}>
              <Text style={[styles.actionLinkText, { color: "#16A34A" }]}>
                Build Skills
              </Text>
              <ArrowRight color="#16A34A" size={12} strokeWidth={2.5} />
            </View>
          </TouchableOpacity>

          {/* 4. KnowNext */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => router.push("/knowNext" as any)}
            style={[styles.serviceCard, styles.knownextCard]}
          >
            {/* Real Pastel Lightbulb Illustration Behind Text */}
            <Image
              source={require("../../assets/home/knownext_illust.png")}
              style={styles.serviceCardImg}
              resizeMode="contain"
            />
            <View style={[styles.serviceIconCircle, { backgroundColor: "#FFEDD5" }]}>
              <BookOpen color="#EA580C" size={18} strokeWidth={2.4} />
            </View>
            <Text style={[styles.serviceTitle, { color: "#1E1B4B" }]}>
              KnowNext
            </Text>
            <Text style={styles.serviceSubtitle}>
              Tuition, career & college guidance
            </Text>
            <View style={styles.actionLinkRow}>
              <Text style={[styles.actionLinkText, { color: "#EA580C" }]}>
                Explore Now
              </Text>
              <ArrowRight color="#EA580C" size={12} strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ================================================================= */}
        {/* 4. WIDE MINDFULNESS BANNER (REAL DESIGN ASSET)                    */}
        {/* ================================================================= */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/mindfulness" as any)}
          style={styles.bottomMindfulnessBanner}
        >
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerHeadline}>
              A calm mind{"\n"}creates a brighter future.
            </Text>
            <Text style={styles.bannerSubhead}>
              Take care. You're doing great!
            </Text>
          </View>
          {/* Real Meditating Girl Illustration */}
          <Image
            source={require("../../assets/home/meditation_illust.png")}
            style={styles.bannerImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Styles                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 36,
  },

  /* 1. Header Styles */
  scenicHeader: {
    height: 260,
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },
  greetingSafeArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  topUtilityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  pillsCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  weatherPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.28)",
  },
  weatherPillText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
  },
  datePillText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  greetingHeroBlock: {
    maxWidth: "70%",
    alignItems: "flex-start",
  },
  greetingPreText: {
    color: "rgba(255, 255, 255, 0.88)",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  greetingNameText: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginTop: 2,
    marginBottom: 3,
    textShadowColor: "rgba(0, 0, 0, 0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  greetingSubText: {
    color: "rgba(255, 255, 255, 0.82)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  avatarContainer: {
    position: "relative",
  },
  avatarRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInner: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
    backgroundColor: "#2E1552",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  avatarStatusDot: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#1E143B",
  },
  headerScenicImg: {
    position: "absolute",
    right: 0,
    bottom: 24,
    width: 250,
    height: 94,
  },

  /* 2. Learning Journey Hero Card */
  heroCardOverlapWrapper: {
    paddingHorizontal: 16,
    marginTop: -28,
  },
  learningHeroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.9)",
    shadowColor: "#2E1A56",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
    minHeight: 185,
  },
  learningBannerImg: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "56%",
    height: "100%",
  },
  learningHeroContent: {
    width: "58%",
    paddingVertical: 18,
    paddingLeft: 16,
    paddingRight: 6,
    zIndex: 2,
    justifyContent: "center",
  },
  learningTagText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#6D28D9",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  learningHeroTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1E1B4B",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  learningHeroQuote: {
    fontSize: 11.5,
    color: "#64748B",
    lineHeight: 16,
    marginBottom: 14,
  },
  continueLearningBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#6D28D9",
    paddingHorizontal: 15,
    paddingVertical: 8.5,
    borderRadius: 18,
    gap: 6,
    shadowColor: "#6D28D9",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  continueLearningBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  carouselDotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 14,
  },
  carouselDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#DDD6FE",
  },
  carouselDotActive: {
    width: 16,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#6D28D9",
  },

  /* Quick Actions Strip */
  quickActionsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.9)",
    shadowColor: "#2E1A56",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  quickActionItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 2,
  },
  quickActionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },
  quickActionTitle: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#1E293B",
    textAlign: "center",
  },
  quickActionSubtitle: {
    fontSize: 9.5,
    color: "#64748B",
    textAlign: "center",
    marginTop: 2,
  },
  quickActionDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#F1F5F9",
  },

  /* 3. Explore Services Styles */
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#7C3AED",
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    gap: 12,
  },
  serviceCard: {
    width: CARD_WIDTH,
    height: 168,
    borderRadius: 24,
    padding: 15,
    borderWidth: 1,
    position: "relative",
    overflow: "hidden",
  },
  counsellingCard: {
    backgroundColor: "#F7F5FE",
    borderColor: "#EDE9FE",
  },
  coachingCard: {
    backgroundColor: "#F0F7FF",
    borderColor: "#DBEAFE",
  },
  skillsCard: {
    backgroundColor: "#F0FDF4",
    borderColor: "#DCFCE7",
  },
  knownextCard: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FFEDD5",
  },
  serviceIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 3,
  },
  serviceSubtitle: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 15,
    marginBottom: 10,
    maxWidth: "68%",
  },
  actionLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: "auto",
    zIndex: 2,
  },
  actionLinkText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  serviceCardImg: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 95,
    height: 95,
    borderBottomRightRadius: 24,
  },

  /* 4. Bottom Mindfulness Banner */
  bottomMindfulnessBanner: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: "#D4CDFC",
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
    minHeight: 104,
  },
  bannerTextCol: {
    flex: 1,
    paddingRight: 140,
    zIndex: 2,
  },
  bannerHeadline: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#24144B",
    lineHeight: 20,
  },
  bannerSubhead: {
    fontSize: 11,
    color: "#473582",
    marginTop: 4,
    fontWeight: "500",
  },
  bannerImage: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 170,
    height: "100%",
  },
});
