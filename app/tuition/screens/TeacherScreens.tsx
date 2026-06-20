import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from "react-native";
import { useFocusEffect } from "expo-router";
import { TuitionView, TuitionNavContext } from "../types";
import { supabase } from "../../../lib/supabase";

interface ScreenProps {
  context: TuitionNavContext;
  onNavigate: (view: TuitionView, context?: TuitionNavContext) => void;
  onBack: () => void;
}

export function TeacherHub({ onNavigate, onBack }: ScreenProps) {
  const [teachers, setTeachers] = React.useState<any[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchTeachers = React.useCallback(async () => {
    try {
      const { data } = await supabase.from('tuition_teachers').select('*');
      if (data) setTeachers(data);
    } catch (e) {}
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchTeachers();
    }, [fetchTeachers])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTeachers();
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

      <Text style={styles.header}>My Teachers</Text>

      {teachers.map((teacher) => (
        <View key={teacher.id} style={styles.card}>
          <Image source={{ uri: teacher.avatar }} style={styles.avatar} />
          <View style={styles.info}>
            <Text style={styles.name}>{teacher.name}</Text>
            <Text style={styles.subjects}>{teacher.subjects.join(", ")}</Text>
            <Text style={styles.details}>⭐ {teacher.rating} • {teacher.experienceYears} Yrs Exp</Text>
          </View>
          <TouchableOpacity style={styles.chatBtn} onPress={() => onNavigate("teacherChat", { selectedTeacherId: teacher.id })}>
            <Text style={styles.chatBtnText}>Chat</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

export function TeacherChat({ context, onBack }: ScreenProps) {
  const [teacher, setTeacher] = React.useState<any>(null);
  React.useEffect(() => {
    async function fetchTeacher() {
      if (context.selectedTeacherId) {
        const { data } = await supabase.from('tuition_teachers').select('*').eq('id', context.selectedTeacherId).single();
        if (data) setTeacher(data);
      }
    }
    fetchTeacher();
  }, [context.selectedTeacherId]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.header}>Chat with {teacher?.name || "Teacher"}</Text>
      
      <View style={styles.chatArea}>
        <Text style={styles.placeholderText}>Chat interface mockup goes here...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#FFFFF0" },
  backButton: { marginBottom: 16 },
  backText: { color: "#007AFF", fontSize: 16 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 16 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "bold", color: "#333" },
  subjects: { fontSize: 14, color: "#666", marginTop: 2 },
  details: { fontSize: 12, color: "#888", marginTop: 4 },
  chatBtn: { backgroundColor: "#E3F2FD", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  chatBtnText: { color: "#007AFF", fontWeight: "bold" },
  chatArea: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF", borderRadius: 12, padding: 20 },
  placeholderText: { color: "#999", fontStyle: "italic" },
});
