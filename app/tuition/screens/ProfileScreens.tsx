import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { TuitionView, TuitionNavContext } from "../types";
import { useTuitionStore } from "../../../store/tuition.store";

interface ScreenProps {
  context: TuitionNavContext;
  onNavigate: (view: TuitionView, context?: TuitionNavContext) => void;
  onBack: () => void;
}

export function ProfileDashboard({ onNavigate, onBack }: ScreenProps) {
  const student = useTuitionStore(s => s.student);
  const [showParentAuth, setShowParentAuth] = useState(false);

  if (showParentAuth) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setShowParentAuth(false)} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Parent Access</Text>
        <Text style={styles.subtext}>Enter PIN to access parent dashboard</Text>
        <TouchableOpacity style={styles.btn} onPress={() => onNavigate("parentDashboard")}>
          <Text style={styles.btnText}>Login (Mock)</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.profileHeader}>
        <Image source={{ uri: student.avatar }} style={styles.avatarLarge} />
        <Text style={styles.nameLarge}>{student.name}</Text>
        <Text style={styles.classLarge}>{student.classLevel} • {student.board}</Text>
      </View>

      <Text style={styles.sectionTitle}>Enrolled Subjects</Text>
      <View style={styles.tagsContainer}>
        {student.enrolledSubjects.map(sub => (
          <View key={sub} style={styles.tag}>
            <Text style={styles.tagText}>{sub}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Parent Controls</Text>
      <TouchableOpacity style={styles.parentBtn} onPress={() => setShowParentAuth(true)}>
        <Text style={styles.parentBtnText}>Access Parent Dashboard 👨‍👩‍👧</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export function ParentDashboard({ onBack }: ScreenProps) {
  const parent = useTuitionStore(s => s.parent);
  const student = useTuitionStore(s => s.student);

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Parent Dashboard</Text>
      <Text style={styles.welcome}>Welcome, {parent.name}</Text>

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>{student.name}'s Performance</Text>
        <Text style={styles.statLine}>Attendance: {student.attendancePercent}%</Text>
        <Text style={styles.statLine}>Current Rank: #{student.rank}</Text>
      </View>

      <View style={styles.feeCard}>
        <Text style={styles.statsTitle}>Fee Management</Text>
        <Text style={styles.statLine}>Status: <Text style={parent.feeStatus === "Paid" ? {color: "green"} : {color: "red"}}>{parent.feeStatus}</Text></Text>
        <Text style={styles.statLine}>Next Due: {new Date(parent.nextFeeDueDate).toLocaleDateString()}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#FFFFF0" },
  backButton: { marginBottom: 16 },
  backText: { color: "#007AFF", fontSize: 16 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  subtext: { fontSize: 14, color: "#666", marginBottom: 24 },
  profileHeader: { alignItems: "center", marginBottom: 32, marginTop: 16 },
  avatarLarge: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  nameLarge: { fontSize: 22, fontWeight: "bold", color: "#333" },
  classLarge: { fontSize: 16, color: "#666", marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, marginTop: 16 },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 24 },
  tag: { backgroundColor: "#E3F2FD", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 },
  tagText: { color: "#007AFF", fontWeight: "600" },
  parentBtn: { backgroundColor: "#FFF", borderColor: "#007AFF", borderWidth: 1, padding: 16, borderRadius: 12, alignItems: "center" },
  parentBtnText: { color: "#007AFF", fontWeight: "bold", fontSize: 16 },
  btn: { backgroundColor: "#007AFF", padding: 16, borderRadius: 12, alignItems: "center" },
  btnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  welcome: { fontSize: 16, color: "#666", marginBottom: 24 },
  statsCard: { backgroundColor: "#FFF", padding: 16, borderRadius: 12, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  feeCard: { backgroundColor: "#FFF8DC", padding: 16, borderRadius: 12, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  statsTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 12, color: "#333" },
  statLine: { fontSize: 14, color: "#444", marginBottom: 8 },
});
