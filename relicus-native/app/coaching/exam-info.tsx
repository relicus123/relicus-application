import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, ArrowRight, CheckCircle, Info, List, Star, Briefcase } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCoachingStore } from "../../store/coaching.store";
import { EXAMS } from "../../constants/coaching/exams";
import { getExamInfo } from "../../constants/coaching/examInfo";

const { width } = Dimensions.get("window");

export default function ExamInfoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const examType = params.examType as string;

  const exam = useMemo(() => EXAMS.find((e) => e.type === examType), [examType]);
  const info = useMemo(() => getExamInfo(examType as any), [examType]);

  const handleStart = () => {
    router.push({
      pathname: "/coaching/dashboard" as any,
      params: { examType },
    });
  };

  if (!exam || !info) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Exam details not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.btn}>
          <Text style={styles.btnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#1C4966", "#5F8B70"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft color="white" size={24} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerSubtitle}>Exam Overview</Text>
              <Text style={styles.headerTitle} numberOfLines={1}>{exam.name}</Text>
            </View>
          </View>
          
          <View style={styles.difficultyRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                color={i < info.difficultyLevel ? "#F1C40F" : "rgba(255, 255, 255, 0.3)"}
                fill={i < info.difficultyLevel ? "#F1C40F" : "transparent"}
              />
            ))}
            <Text style={styles.difficultyText}>
              {info.difficultyLevel === 5 ? "Very Hard" : info.difficultyLevel === 4 ? "Hard" : "Moderate"}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.contentContainer}>
          {/* Tagline / Overview */}
          <View style={styles.card}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Info size={18} color="#1C4966" />
              <Text style={styles.cardHeaderTitle}>About the Exam</Text>
            </View>
            <Text style={styles.tagline}>{info.tagline}</Text>
            <Text style={styles.overviewText}>{info.overview}</Text>
          </View>

          {/* Eligibility */}
          <View style={styles.card}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <CheckCircle size={18} color="#5F8B70" />
              <Text style={styles.cardHeaderTitle}>Eligibility Criteria</Text>
            </View>
            {info.eligibility.map((crit, idx) => (
              <View key={idx} style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✔</Text>
                <Text style={styles.bulletText}>{crit}</Text>
              </View>
            ))}
          </View>

          {/* Exam Pattern */}
          <View style={styles.card}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <List size={18} color="#1C4966" />
              <Text style={styles.cardHeaderTitle}>Exam Pattern</Text>
            </View>
            {info.examPattern.map((pattern, idx) => (
              <View key={idx} style={styles.patternBox}>
                <Text style={styles.patternSectionTitle}>{pattern.section}</Text>
                <View style={styles.patternGrid}>
                  <View style={styles.patternStat}>
                    <Text style={styles.patternStatVal}>{pattern.questions}</Text>
                    <Text style={styles.patternStatLabel}>Questions</Text>
                  </View>
                  <View style={styles.patternStat}>
                    <Text style={styles.patternStatVal}>{pattern.marks}</Text>
                    <Text style={styles.patternStatLabel}>Marks</Text>
                  </View>
                  <View style={styles.patternStat}>
                    <Text style={styles.patternStatVal}>{pattern.duration}</Text>
                    <Text style={styles.patternStatLabel}>Duration</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Career Opportunities */}
          <View style={styles.card}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Briefcase size={18} color="#1C4966" />
              <Text style={styles.cardHeaderTitle}>Career Scope</Text>
            </View>
            {info.careerOpportunities.map((op, idx) => (
              <View key={idx} style={styles.bulletItem}>
                <Text style={styles.bulletDot}>✦</Text>
                <Text style={styles.bulletText}>{op}</Text>
              </View>
            ))}
          </View>

          {/* Start CTA */}
          <TouchableOpacity onPress={handleStart} style={styles.btn}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={styles.btnText}>Start Preparation</Text>
              <ArrowRight size={16} color="white" />
            </View>
          </TouchableOpacity>
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
    paddingBottom: 40,
  },
  header: {
    padding: 24,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  difficultyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    marginLeft: 52,
  },
  difficultyText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  contentContainer: {
    padding: 24,
    marginTop: -20,
    gap: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1C4966",
  },
  tagline: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 8,
  },
  overviewText: {
    fontSize: 13,
    color: "#5F8B70",
    lineHeight: 18,
  },
  bulletItem: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  bulletDot: {
    color: "#5F8B70",
  },
  bulletText: {
    fontSize: 13,
    color: "#5F8B70",
    flex: 1,
  },
  patternBox: {
    backgroundColor: "rgba(143, 189, 215, 0.05)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(143, 189, 215, 0.15)",
    marginBottom: 10,
  },
  patternSectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 10,
  },
  patternGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  patternStat: {
    alignItems: "center",
  },
  patternStatVal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1C4966",
  },
  patternStatLabel: {
    fontSize: 10,
    color: "#8FBDD7",
    marginTop: 2,
  },
  btn: {
    backgroundColor: "#1C4966",
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    color: "#8FBDD7",
    textAlign: "center",
    marginBottom: 16,
  },
});
