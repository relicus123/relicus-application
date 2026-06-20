import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { MotiView, AnimatePresence } from "moti";
import { Heart, GraduationCap, Sparkles, BookOpen, Users, ChevronLeft, ChevronRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { SafeAreaView } from "react-native-safe-area-context";

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
      colors: ["#1C4966", "#5F8B70"],
    },
    {
      title: "CUET Coaching",
      description: "Expert guidance for entrance exams",
      icon: GraduationCap,
      colors: ["#5F8B70", "#8FBDD7"],
    },
    {
      title: "Skill Enhancement",
      description: "Learn new skills at your pace",
      icon: Sparkles,
      colors: ["#8FBDD7", "#DDEEE3"],
    },
    {
      title: "KnowNext",
      description: "Personalized learning experience",
      icon: BookOpen,
      colors: ["#5F8B70", "#1C4966"],
    },
    {
      title: "Mindfulness Activities",
      description: "Daily meditation and wellness",
      icon: Users,
      colors: ["#DDEEE3", "#8FBDD7"],
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>Relicus</Text>
          <View style={styles.notificationIcon}>
            <View style={styles.notificationDot} />
          </View>
        </View>

        <View style={styles.bannerContainer}>
          <AnimatePresence exitBeforeEnter>
            <MotiView
              key={currentSlide}
              from={{ opacity: 0, translateX: 50 }}
              animate={{ opacity: 1, translateX: 0 }}
              exit={{ opacity: 0, translateX: -50 }}
              transition={{ type: "timing", duration: 300 }}
              style={styles.bannerWrapper}
            >
              <LinearGradient
                colors={banners[currentSlide].colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.banner}
              >
                {(() => {
                  const Icon = banners[currentSlide].icon;
                  return <Icon color="white" size={64} strokeWidth={1.5} />;
                })()}
                <Text style={styles.bannerTitle}>{banners[currentSlide].title}</Text>
                <Text style={styles.bannerDesc}>{banners[currentSlide].description}</Text>
              </LinearGradient>
            </MotiView>
          </AnimatePresence>

          <TouchableOpacity onPress={prevSlide} style={[styles.navButton, styles.leftNav]}>
            <ChevronLeft color="#1C4966" size={24} />
          </TouchableOpacity>
          <TouchableOpacity onPress={nextSlide} style={[styles.navButton, styles.rightNav]}>
            <ChevronRight color="#1C4966" size={24} />
          </TouchableOpacity>

          <View style={styles.pagination}>
            {banners.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentSlide ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.modeToggle}>
            <TouchableOpacity 
              style={[styles.modeBtn, mode === "signup" && styles.modeBtnActive]}
              onPress={() => setMode("signup")}
            >
              <Text style={[styles.modeText, mode === "signup" && styles.modeTextActive]}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modeBtn, mode === "login" && styles.modeBtnActive]}
              onPress={() => setMode("login")}
            >
              <Text style={[styles.modeText, mode === "login" && styles.modeTextActive]}>Log In</Text>
            </TouchableOpacity>
          </View>

          {mode === "signup" && (
            <>
              <Input
                label="Username"
                placeholder="Choose a username"
                value={username}
                onChangeText={setUsername}
              />
              <Input
                label="Email"
                type="email-address"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
              />
            </>
          )}

          <Input
            label="Phone Number"
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChangeText={setPhone}
          />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAgreed(!agreed)}
            style={styles.checkboxContainer}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxChecked]} />
            <Text style={styles.checkboxLabel}>
              I agree to the Terms & Conditions and Privacy Policy
            </Text>
          </TouchableOpacity>

          <Button
            onPress={handleContinue}
            disabled={!phone || !agreed}
            size="lg"
            style={styles.submitButton}
          >
            Continue
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFF0",
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1C4966",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(143, 189, 215, 0.2)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationDot: {
    width: 8,
    height: 8,
    backgroundColor: "#D9534F",
    borderRadius: 4,
  },
  bannerContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
    position: "relative",
  },
  bannerWrapper: {
    borderRadius: 24,
    overflow: "hidden",
    height: 256,
  },
  banner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  bannerDesc: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  navButton: {
    position: "absolute",
    top: "50%",
    marginTop: -20,
    width: 40,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  leftNav: {
    left: 32,
  },
  rightNav: {
    right: 32,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 32,
    backgroundColor: "#1C4966",
  },
  inactiveDot: {
    width: 8,
    backgroundColor: "rgba(28, 73, 102, 0.3)",
  },
  form: {
    paddingHorizontal: 24,
    gap: 24,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#1C4966",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#1C4966",
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: "#1C4966",
  },
  submitButton: {
    width: "100%",
  },
  modeToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(28, 73, 102, 0.05)",
    padding: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  modeBtnActive: {
    backgroundColor: "#1C4966",
  },
  modeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8FBDD7",
  },
  modeTextActive: {
    color: "white",
  },
});
