import React, { useState } from "react";
import { View, Alert, Image } from "react-native";
import { useTuitionStore } from "../../../store/tuition.store";
import { LinearGradient } from "expo-linear-gradient";
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
      Alert.alert("Missing Information", "Please fill out all fields.");
      return;
    }
    await store.createProfile(name, classLevel, board);
  };

  return (
    <View className="flex-1 bg-surface-primary">
      <LinearGradient
        colors={["#FFFFFF", "#EDF5F8", "#E1EFF5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-8 pt-10 items-center rounded-b-[40px]"
      >
        <SafeAreaView edges={["top"]} className="items-center">
          <View className="w-36 h-36 rounded-3xl bg-white shadow-lg shadow-black/10 border-2 border-white overflow-hidden items-center justify-center p-1.5 mb-4">
            <Image
              source={require("../../../assets/illustrations/tuition_student.jpg")}
              style={{ width: "100%", height: "100%", borderRadius: 20 }}
              resizeMode="contain"
            />
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
