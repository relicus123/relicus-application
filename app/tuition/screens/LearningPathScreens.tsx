import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useFocusEffect } from "expo-router";
import { TuitionView, TuitionNavContext } from "../types";
import { supabase } from "../../../lib/supabase";

interface ScreenProps {
  context: TuitionNavContext;
  onNavigate: (view: TuitionView, context?: TuitionNavContext) => void;
  onBack: () => void;
}

export function LearningPath({ onNavigate, onBack }: ScreenProps) {
  const [classes, setClasses] = React.useState<any[]>([]);
  const [syllabus, setSyllabus] = React.useState<any[]>([]);

  const [refreshing, setRefreshing] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    try {
      const [clsRes, sylRes] = await Promise.all([
        supabase.from('tuition_classes').select('*'),
        supabase.from('tuition_syllabus').select('*').order('chapterNumber', { ascending: true })
      ]);
      if (clsRes.data) setClasses(clsRes.data);
      if (sylRes.data) setSyllabus(sylRes.data);
    } catch (e) {}
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />}
    >
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Learning Path</Text>

      {/* Upcoming Classes */}
      <Text style={styles.sectionTitle}>Upcoming Classes</Text>
      {classes.filter(c => c.status === "Upcoming").map((cls) => (
        <View key={cls.id} style={styles.classCard}>
          <View>
            <Text style={styles.classTitle}>{cls.title}</Text>
            <Text style={styles.classSub}>{cls.subject} • {new Date(cls.startTime || cls.schedule).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          <TouchableOpacity style={styles.joinBtn}>
            <Text style={styles.joinBtnText}>Join</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Syllabus Roadmap */}
      <Text style={styles.sectionTitle}>Syllabus Roadmap</Text>
      <View style={styles.roadmapContainer}>
        {syllabus.map((topic, idx) => (
          <View key={topic.id} style={styles.roadmapItem}>
            <View style={[styles.timelineDot, topic.status === "Completed" ? styles.dotCompleted : styles.dotPending]} />
            {idx !== syllabus.length - 1 && <View style={styles.timelineLine} />}
            <View style={styles.roadmapContent}>
              <Text style={styles.topicTitle}>Ch {topic.chapterNumber || idx + 1}: {topic.title}</Text>
              <Text style={styles.topicStatus}>{topic.status} ({topic.progressPercent || 0}%)</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#FFFFF0" },
  backButton: { marginBottom: 16 },
  backText: { color: "#007AFF", fontSize: 16 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, marginTop: 16 },
  classCard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  classTitle: { fontSize: 16, fontWeight: "bold" },
  classSub: { fontSize: 14, color: "#666", marginTop: 4 },
  joinBtn: { backgroundColor: "#007AFF", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  joinBtnText: { color: "#FFF", fontWeight: "bold" },
  roadmapContainer: { paddingLeft: 8, marginTop: 8 },
  roadmapItem: { flexDirection: "row", marginBottom: 24, position: "relative" },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4, zIndex: 2 },
  dotCompleted: { backgroundColor: "#34C759" },
  dotPending: { backgroundColor: "#D1D1D6" },
  timelineLine: { position: "absolute", left: 5, top: 16, bottom: -24, width: 2, backgroundColor: "#E5E5EA", zIndex: 1 },
  roadmapContent: { marginLeft: 16, flex: 1 },
  topicTitle: { fontSize: 16, fontWeight: "bold" },
  topicStatus: { fontSize: 14, color: "#666", marginTop: 4 },
});
