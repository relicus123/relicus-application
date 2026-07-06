import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { useTuitionStore } from "../../../store/tuition.store";
import { LinearGradient } from "expo-linear-gradient";
import { GraduationCap } from "lucide-react-native";
import { Button } from "../../../components/Button";

export function SetupScreen() {
  const store = useTuitionStore();
  const [name, setName] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [board, setBoard] = useState("");

  const handleCreate = async () => {
    if (!name || !classLevel || !board) {
      alert("Please fill out all fields");
      return;
    }
    await store.createProfile(name, classLevel, board);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1C4966", "#5F8B70"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <GraduationCap size={48} color="#FFF" />
        <Text style={styles.title}>Welcome to Tuition!</Text>
        <Text style={styles.subtitle}>Let's set up your student profile</Text>
      </LinearGradient>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput 
            style={styles.input} 
            placeholder="E.g. Aarav Sharma" 
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Class / Grade</Text>
          <TextInput 
            style={styles.input} 
            placeholder="E.g. 10th Grade" 
            value={classLevel}
            onChangeText={setClassLevel}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Educational Board</Text>
          <TextInput 
            style={styles.input} 
            placeholder="E.g. CBSE, ICSE, State" 
            value={board}
            onChangeText={setBoard}
          />
        </View>

        <Button onPress={handleCreate} disabled={store.isLoading} style={styles.button}>
          {store.isLoading ? "Creating..." : "Create Profile"}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFF0",
  },
  header: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#E2E8F0",
    marginTop: 8,
  },
  form: {
    padding: 24,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C4966",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#FFF",
  },
  button: {
    marginTop: 12,
  },
});
