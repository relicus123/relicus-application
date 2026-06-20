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

export function MaterialLibrary({ onNavigate, onBack }: ScreenProps) {
  const [materials, setMaterials] = React.useState<any[]>([]);

  const [refreshing, setRefreshing] = React.useState(false);

  const fetchMaterials = React.useCallback(async () => {
    try {
      const { data } = await supabase.from('tuition_materials').select('*');
      if (data) setMaterials(data);
    } catch (e) {}
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchMaterials();
    }, [fetchMaterials])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMaterials();
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

      <Text style={styles.header}>Study Materials</Text>

      {materials.map((mat) => (
        <View key={mat.id} style={styles.card}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{mat.type === "Video" ? "🎥" : "📄"}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.title}>{mat.title}</Text>
            <Text style={styles.details}>{mat.subject} • {mat.type} • {mat.size || mat.duration}</Text>
          </View>
          <TouchableOpacity style={styles.downloadBtn}>
            <Text style={styles.downloadBtnText}>Open</Text>
          </TouchableOpacity>
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
  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F0F8FF", justifyContent: "center", alignItems: "center", marginRight: 16 },
  icon: { fontSize: 20 },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: "bold", color: "#333" },
  details: { fontSize: 12, color: "#666", marginTop: 4 },
  downloadBtn: { backgroundColor: "#E3F2FD", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  downloadBtnText: { color: "#007AFF", fontWeight: "bold" },
});
