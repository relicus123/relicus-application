import React, { useRef, useState } from "react";
import {
  View,
  Dimensions,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useRouter } from "expo-router";
import { MotiView, AnimatePresence } from "moti";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Typography } from "../components/Typography";
import { Button } from "../components/Button";

const { width, height } = Dimensions.get("window");

interface SlideItem {
  id: string;
  tag: string;
  headline: string;
  subheadline: string;
  image: any;
  accent: string;
  tagBg: string;
  artGlow: string;
  highlight?: string;
}

export default function AppIntro() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<SlideItem>>(null);

  // 1st: Coaching, 2nd: Skills Academy, 3rd: KnowNext, 4th: Counselling
  const slides: SlideItem[] = [
    {
      id: "coaching",
      tag: "CUET & ENTRANCE EXAMS",
      headline: "Ace Your Entrance Exams",
      subheadline:
        "Structured coaching, interactive live classes, chapter-wise test series, and real-time performance analytics.",
      image: require("../assets/coaching.png"),
      accent: "#1C4966",
      tagBg: "#D8ECF6",
      artGlow: "#EBF5FA",
      highlight: "Active Now",
    },
    {
      id: "skills-academy",
      tag: "CAREER MASTERY",
      headline: "Master Practical Skills",
      subheadline:
        "Industry-led masterclasses, practical tech & creative bootcamps, and verified career-ready certifications.",
      image: require("../assets/skill acadamy.png"),
      accent: "#287A5A",
      tagBg: "#D4EFE3",
      artGlow: "#EAF6F0",
      highlight: "Upcoming",
    },
    {
      id: "knownext",
      tag: "ACADEMIC GUIDANCE",
      headline: "Navigate Your Future",
      subheadline:
        "Personalized college admissions roadmaps, tailored tuition plans, and step-by-step career path mentorship.",
      image: require("../assets/knownext.png"),
      accent: "#C99545",
      tagBg: "#F9E8D1",
      artGlow: "#FDF5EA",
      highlight: "Upcoming",
    },
    {
      id: "counselling",
      tag: "MENTAL WELLNESS",
      headline: "Holistic Mind & Wellness",
      subheadline:
        "Confidential 1-on-1 therapy, emotional wellness check-ins, and compassionate psychological guidance.",
      image: require("../assets/councling.png"),
      accent: "#1C4966",
      tagBg: "#DFEAF0",
      artGlow: "#F0F5F8",
      highlight: "Web Portal",
    },
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / width);
    if (index !== activeIndex && index >= 0 && index < slides.length) {
      setActiveIndex(index);
    }
  };

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      const nextIdx = activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIdx, animated: true });
      setActiveIndex(nextIdx);
    } else {
      router.push("/landing" as any);
    }
  };

  const handleSkip = () => {
    router.push("/landing" as any);
  };

  const isLastSlide = activeIndex === slides.length - 1;

  const renderSlide = ({ item }: { item: SlideItem }) => (
    <View style={[styles.slideContainer, { width }]}>
      {/* 3D Illustration Canvas Area */}
      <View className="items-center justify-center flex-1 max-h-[340px]">
        <View
          style={[styles.artBackdrop, { backgroundColor: item.artGlow }]}
        >
          <Image
            source={item.image}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Slide Text Content */}
      <View className="items-center px-8 pb-4">
        {/* Category Pill Tag */}
        <View className="flex-row items-center gap-1.5 mb-3">
          <View
            style={[styles.tagPill, { backgroundColor: item.tagBg }]}
          >
            <Typography
              variant="caption"
              weight="bold"
              style={{
                color: item.accent,
                fontSize: 10.5,
                letterSpacing: 1,
              }}
            >
              {item.tag}
            </Typography>
          </View>

          {item.highlight && (
            <View className="bg-white px-2.5 py-1 rounded-full border border-black/5">
              <Typography
                variant="caption"
                weight="bold"
                className="text-[10px] text-[#71818B]"
              >
                {item.highlight}
              </Typography>
            </View>
          )}
        </View>

        {/* Headline */}
        <Typography
          variant="title"
          weight="bold"
          className="text-center text-[25px] leading-8 font-black text-[#172F3D] mb-2"
        >
          {item.headline}
        </Typography>

        {/* Subheadline */}
        <Typography
          variant="body"
          className="text-center text-[13.5px] leading-[20px] text-[#60727F] max-w-[320px]"
        >
          {item.subheadline}
        </Typography>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#F7F9FB]">
      <LinearGradient
        colors={["#FFFFFF", "#F7F9FB", "#EDF5F8"]}
        className="absolute inset-0"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView className="flex-1 justify-between">
        {/* Top Header Bar */}
        <View className="flex-row items-center justify-between px-6 pt-2 pb-1">
          {/* Logo Mark + Brand Name */}
          <View className="flex-row items-center gap-2.5">
            <View style={styles.brandIconMini}>
              <Image
                source={require("../assets/relicus-icon.png")}
                style={{ width: 26, height: 26 }}
                resizeMode="contain"
              />
            </View>
            <View>
              <Typography
                variant="body"
                weight="bold"
                className="text-[15px] tracking-[1.5px] font-black text-[#1C4966]"
              >
                RELICUS
              </Typography>
              <Typography
                variant="caption"
                className="text-[8.5px] tracking-[1px] uppercase text-[#71818B] font-semibold"
              >
                Growth Ecosystem
              </Typography>
            </View>
          </View>

          {/* Skip Button */}
          {!isLastSlide ? (
            <TouchableOpacity
              onPress={handleSkip}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              className="py-1 px-2.5 rounded-full bg-black/5"
            >
              <Typography
                variant="caption"
                weight="semibold"
                className="text-xs text-[#5A6F7D]"
              >
                Skip
              </Typography>
            </TouchableOpacity>
          ) : (
            <View className="w-12" />
          )}
        </View>

        {/* Central Horizontal Paging FlatList */}
        <View className="flex-1 justify-center">
          <FlatList
            ref={flatListRef}
            data={slides}
            renderItem={renderSlide}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            onMomentumScrollEnd={handleScroll}
            scrollEventThrottle={16}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
          />
        </View>

        {/* Bottom Navigation & Action Section */}
        <View className="px-6 pb-4 pt-2">
          {/* Pagination Indicators */}
          <View className="flex-row items-center justify-center gap-1.5 mb-5">
            {slides.map((slide, idx) => {
              const isActive = idx === activeIndex;
              return (
                <TouchableOpacity
                  key={slide.id}
                  onPress={() => {
                    flatListRef.current?.scrollToIndex({
                      index: idx,
                      animated: true,
                    });
                    setActiveIndex(idx);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                >
                  <View
                    style={[
                      styles.pageDot,
                      {
                        width: isActive ? 26 : 7,
                        backgroundColor: isActive ? "#1C4966" : "#D2DEE5",
                      },
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Action CTA Button */}
          <View style={styles.ctaButtonWrapper}>
            <Button
              variant="primary"
              size="lg"
              onPress={handleNext}
              className="w-full py-4 rounded-2xl"
            >
              <View className="flex-row items-center justify-center gap-2">
                <Typography weight="bold" color="white" className="text-base">
                  {isLastSlide ? "Get Started" : "Continue"}
                </Typography>
                <ArrowRight color="#ffffff" size={18} strokeWidth={2.5} />
              </View>
            </Button>
          </View>

          {/* Log In Link */}
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

          {/* Trust Footnote */}
          <View className="flex-row items-center justify-center gap-1.5 mt-3 opacity-70">
            <ShieldCheck color="#71818B" size={12} />
            <Typography
              variant="caption"
              color="secondary"
              className="text-[11px]"
            >
              Trusted by 10,000+ students & professionals
            </Typography>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  brandIconMini: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5EDF2",
    shadowColor: "#1C4966",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  slideContainer: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  artBackdrop: {
    width: Math.min(width * 0.8, 300),
    height: Math.min(width * 0.8, 300),
    borderRadius: Math.min(width * 0.8, 300) / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#1C4966",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  heroImage: {
    width: "88%",
    height: "88%",
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 20,
  },
  pageDot: {
    height: 7,
    borderRadius: 4,
  },
  ctaButtonWrapper: {
    width: "100%",
    borderRadius: 16,
    shadowColor: "#1C4966",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
});

