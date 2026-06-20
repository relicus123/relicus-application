import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { TuitionView, TuitionNavContext } from "../types";
import { MOCK_ASSESSMENTS } from "../../../constants/tuition/assessments";
import { useTuitionStore } from "../../../store/tuition.store";

interface ScreenProps {
  context: TuitionNavContext;
  onNavigate: (view: TuitionView, context?: TuitionNavContext) => void;
  onBack: () => void;
}

export function AssessmentCentre({ onNavigate, onBack }: ScreenProps) {
  const submitAssessment = useTuitionStore((s) => s.submitAssessment);

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Test Centre</Text>

      {/* Pending Tests */}
      <Text style={styles.sectionTitle}>Pending Tests</Text>
      {MOCK_ASSESSMENTS.filter(a => a.status === "Pending").map((test) => (
        <View key={test.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.testTitle}>{test.title}</Text>
            <Text style={styles.testType}>{test.type}</Text>
          </View>
          <Text style={styles.details}>{test.subject} • {test.durationMinutes} mins • {test.totalMarks} Marks</Text>
          <Text style={styles.dueDate}>Due: {new Date(test.dueDate).toLocaleDateString()}</Text>
          
          <TouchableOpacity 
            style={styles.startBtn} 
            onPress={() => submitAssessment(test.id, test.totalMarks * 0.9)} // Mock submit
          >
            <Text style={styles.startBtnText}>Start Test</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Analytics / Graded */}
      <Text style={styles.sectionTitle}>Completed Tests</Text>
      {MOCK_ASSESSMENTS.filter(a => a.status === "Graded").map((test) => (
        <View key={test.id} style={[styles.card, styles.gradedCard]}>
          <View style={styles.cardHeader}>
            <Text style={styles.testTitle}>{test.title}</Text>
            <Text style={styles.score}>{test.score} / {test.totalMarks}</Text>
          </View>
          <Text style={styles.details}>{test.subject}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#FFFFF0" },
  backButton: { marginBottom: 16 },
  backText: { color: "#007AFF", fontSize: 16 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, marginTop: 16 },
  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  gradedCard: { opacity: 0.8 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  testTitle: { fontSize: 16, fontWeight: "bold", color: "#333", flex: 1 },
  testType: { fontSize: 12, backgroundColor: "#E3F2FD", color: "#007AFF", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  score: { fontSize: 16, fontWeight: "bold", color: "#34C759" },
  details: { fontSize: 14, color: "#666", marginTop: 8 },
  dueDate: { fontSize: 12, color: "#FF3B30", marginTop: 4 },
  startBtn: { backgroundColor: "#007AFF", padding: 12, borderRadius: 8, marginTop: 16, alignItems: "center" },
  startBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});
