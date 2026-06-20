import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { ChevronDown, ChevronUp, ChevronRight, Award } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCoachingStore } from "../../store/coaching.store";
import { EXAM_CATEGORIES } from "../../constants/coaching/examCategories";
import { EXAMS } from "../../constants/coaching/exams";

export default function LearningScreen() {
  const router = useRouter();
  const { setSelectedExam } = useCoachingStore();
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({
    undergraduate: false,
    postgraduate: false,
    state: false,
  });

  const toggleCategory = (id: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectExam = (examType: string) => {
    setSelectedExam(examType as any);
    router.push({
      pathname: "/coaching/exam-info" as any,
      params: { examType },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#1C4966", "#5F8B70"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.headerTitle}>Entrance Coaching</Text>
          <Text style={styles.headerSubtitle}>Select an exam category to start preparation</Text>
        </LinearGradient>

        <View style={styles.contentContainer}>
          {EXAM_CATEGORIES.map((category) => {
            const isCollapsed = collapsedCategories[category.id];
            return (
              <View key={category.id} style={styles.categoryCard}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => toggleCategory(category.id)}
                  style={styles.categoryHeader}
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                    <Text style={styles.categoryDesc} numberOfLines={1}>{category.description}</Text>
                  </View>
                  {isCollapsed ? (
                    <ChevronDown size={20} color="#8FBDD7" />
                  ) : (
                    <ChevronUp size={20} color="#8FBDD7" />
                  )}
                </TouchableOpacity>

                {!isCollapsed && (
                  <View style={styles.examsList}>
                    {category.exams.map((examType) => {
                      const exam = EXAMS.find((e) => e.type === examType);
                      if (!exam) return null;
                      return (
                        <TouchableOpacity
                          key={examType}
                          activeOpacity={0.7}
                          onPress={() => handleSelectExam(examType)}
                          style={styles.examItem}
                        >
                          <View style={styles.examIconBox}>
                            <Text style={styles.examIcon}>{exam.icon}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.examName}>{exam.name}</Text>
                            <Text style={styles.examDesc}>{exam.description}</Text>
                          </View>
                          <ChevronRight size={18} color="#8FBDD7" />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 6,
  },
  contentContainer: {
    padding: 24,
    marginTop: -20,
    gap: 16,
  },
  categoryCard: {
    backgroundColor: "white",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(143, 189, 215, 0.05)",
    gap: 12,
  },
  categoryIcon: {
    fontSize: 22,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1C4966",
  },
  categoryDesc: {
    fontSize: 11,
    color: "#8FBDD7",
    marginTop: 2,
  },
  examsList: {
    padding: 16,
    gap: 12,
  },
  examItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(143, 189, 215, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(143, 189, 215, 0.15)",
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  examIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(143, 189, 215, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  examIcon: {
    fontSize: 20,
  },
  examName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1C4966",
  },
  examDesc: {
    fontSize: 12,
    color: "#5F8B70",
    marginTop: 2,
  },
});
