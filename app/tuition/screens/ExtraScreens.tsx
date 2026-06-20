import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { TuitionView, TuitionNavContext } from "../types";

interface ScreenProps {
  context: TuitionNavContext;
  onNavigate: (view: TuitionView, context?: TuitionNavContext) => void;
  onBack: () => void;
}

export function AIAssistant({ onBack }: ScreenProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.header}>AI Tutor</Text>
      
      <ScrollView style={styles.chatContainer}>
        <View style={styles.aiBubble}>
          <Text style={styles.chatText}>Hi there! I am your AI Tutor. Need help understanding a concept or solving a problem?</Text>
        </View>
      </ScrollView>
      
      <View style={styles.inputArea}>
        <TextInput style={styles.input} placeholder="Ask a question..." placeholderTextColor="#999" />
        <TouchableOpacity style={styles.sendBtn}>
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#FFFFF0" },
  backButton: { marginBottom: 16 },
  backText: { color: "#007AFF", fontSize: 16 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  chatContainer: { flex: 1, marginBottom: 16 },
  aiBubble: { backgroundColor: "#E3F2FD", padding: 16, borderRadius: 12, maxWidth: "80%", alignSelf: "flex-start" },
  chatText: { color: "#333", fontSize: 16 },
  inputArea: { flexDirection: "row", alignItems: "center" },
  input: { flex: 1, backgroundColor: "#FFF", padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#DDD", marginRight: 12 },
  sendBtn: { backgroundColor: "#007AFF", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 },
  sendBtnText: { color: "#FFF", fontWeight: "bold" },
});
