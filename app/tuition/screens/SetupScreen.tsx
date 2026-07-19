import React, { useState } from "react";
import { View } from "react-native";
import { useTuitionStore } from "../../../store/tuition.store";
import { LinearGradient } from "expo-linear-gradient";
import { GraduationCap } from "lucide-react-native";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { Typography } from "../../../components/Typography";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <View className="flex-1 bg-surface-primary">
      <LinearGradient
        colors={["#fdf7ff", "#e9ddff", "#cfbcff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-12 pt-16 items-center rounded-b-[40px]"
      >
        <SafeAreaView edges={["top"]}>
          <View className="bg-white/40 p-4 rounded-full border border-white/50 mb-4 items-center">
            <GraduationCap size={40} color="#4f378a" strokeWidth={1.5} />
          </View>
          <Typography variant="heading" weight="bold" color="primary" className="text-center">
            Welcome to Tuition!
          </Typography>
          <Typography variant="body" color="secondary" className="text-center mt-2">
            Let's set up your student profile
          </Typography>
        </SafeAreaView>
      </LinearGradient>

      <View className="flex-1 px-6 pt-8 gap-4">
        <Input
          label="Full Name"
          placeholder="E.g. Aarav Sharma"
          value={name}
          onChangeText={setName}
        />
        <Input
          label="Class / Grade"
          placeholder="E.g. 10th Grade"
          value={classLevel}
          onChangeText={setClassLevel}
        />
        <Input
          label="Educational Board"
          placeholder="E.g. CBSE, ICSE, State"
          value={board}
          onChangeText={setBoard}
        />
        
        <View className="mt-4">
          <Button 
            onPress={handleCreate} 
            loading={store.isLoading}
            variant="primary"
          >
            {store.isLoading ? "Creating..." : "Create Profile"}
          </Button>
        </View>
      </View>
    </View>
  );
}
