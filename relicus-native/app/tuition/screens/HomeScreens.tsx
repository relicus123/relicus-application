import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { TuitionView, TuitionNavContext } from "../types";
import { useTuitionStore } from "../../../store/tuition.store";

interface ScreenProps {
  context: TuitionNavContext;
  onNavigate: (view: TuitionView, context?: TuitionNavContext) => void;
  onBack: () => void;
  onReset: (view: TuitionView, context?: TuitionNavContext) => void;
}

export function HomeDashboard({ onNavigate }: ScreenProps) {
  const student = useTuitionStore((s) => s.student);

  return (
    <ScrollView style={styles.container}>
      {/* Header / Welcome */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {student.name.split(" ")[0]} 👋</Text>
          <Text style={styles.subtext}>{student.classLevel} | {student.board}</Text>
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>🔥 {student.streakDays} Days</Text>
        </View>
      </View>

      {/* Daily Quote / Task */}
      <View style={styles.quoteCard}>
        <Text style={styles.quoteText}>"Success is the sum of small efforts, repeated day in and day out."</Text>
        <Text style={styles.quoteAuthor}>- Robert Collier</Text>
      </View>

      {/* Progress Dashboard */}
      <Text style={styles.sectionTitle}>Your Progress</Text>
      <View style={styles.progressRow}>
        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>Attendance</Text>
          <Text style={styles.progressValue}>{student.attendancePercent}%</Text>
        </View>
        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>Total Points</Text>
          <Text style={styles.progressValue}>⭐ {student.totalPoints}</Text>
        </View>
        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>Leaderboard Rank</Text>
          <Text style={styles.progressValue}>#{student.rank}</Text>
        </View>
      </View>

      {/* Quick Actions Grid */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.grid}>
        <TouchableOpacity style={styles.gridItem} onPress={() => onNavigate("learningPath")}>
          <Text style={styles.gridIcon}>📚</Text>
          <Text style={styles.gridText}>Classes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridItem} onPress={() => onNavigate("myTeachers")}>
          <Text style={styles.gridIcon}>👨‍🏫</Text>
          <Text style={styles.gridText}>Teachers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridItem} onPress={() => onNavigate("testCentre")}>
          <Text style={styles.gridIcon}>📝</Text>
          <Text style={styles.gridText}>Tests</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridItem} onPress={() => onNavigate("studyMaterials")}>
          <Text style={styles.gridIcon}>📁</Text>
          <Text style={styles.gridText}>Materials</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridItem} onPress={() => onNavigate("aiAssistant")}>
          <Text style={styles.gridIcon}>🤖</Text>
          <Text style={styles.gridText}>AI Tutor</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.gridItem} onPress={() => onNavigate("profile")}>
          <Text style={styles.gridIcon}>👤</Text>
          <Text style={styles.gridText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  streakBadge: {
    backgroundColor: "#FFEFD5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    color: "#FF8C00",
    fontWeight: "bold",
  },
  quoteCard: {
    backgroundColor: "#F0F8FF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  quoteText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#4682B4",
  },
  quoteAuthor: {
    fontSize: 12,
    color: "#4682B4",
    marginTop: 8,
    textAlign: "right",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  progressCard: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  progressLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  progressValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E8B57",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "30%",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gridIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  gridText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
});
