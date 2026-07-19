import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { MotiView } from "moti";
import {
  User,
  Bell,
  Lock,
  Award,
  ChevronRight,
  LogOut,
  Edit,
  X
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useAuthStore } from "../../store/auth.store";
import { useSkillsStore } from "../../store/skills.store";
import { Typography } from "../../components/Typography";
import { GlassSurface } from "../../components/GlassSurface";
import { BentoCard, BentoCardPressable } from "../../components/BentoCard";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export default function ProfileScreen() {
  const router = useRouter();
  
  const authStore = useAuthStore();
  const skillsStore = useSkillsStore();
  const user = authStore.currentUser;
  const userId = user?.id;

  const name = user?.username || "Guest";
  const email = user?.email || "No Email";
  const phone = user?.phone || "No Phone";

  const [isEditing, setIsEditing] = useState(false);

  const [tempName, setTempName] = useState(name);
  const [tempEmail, setTempEmail] = useState(email);
  const [tempPhone, setTempPhone] = useState(phone);

  const menuItems = [
    {
      icon: User,
      label: "Edit Profile",
      description: "Update your information",
      colors: ["#fdf7ff", "#e9ddff"],
      iconColor: "#4f378a",
      onPress: () => {
        setTempName(name);
        setTempEmail(email);
        setTempPhone(phone);
        setIsEditing(true);
      },
    },
    {
      icon: Bell,
      label: "Notifications",
      description: "Manage preferences",
      colors: ["#F0F7FF", "#DBEAFE"],
      iconColor: "#3B82F6",
      onPress: () => router.push("/notifications" as any),
    },
    {
      icon: Lock,
      label: "Privacy & Security",
      description: "Control your data",
      colors: ["#ECFDF5", "#D1FAE5"],
      iconColor: "#10B981",
      onPress: () => router.push("/profile/privacy" as any),
    },
    {
      icon: Award,
      label: "Certificates",
      description: "View achievements",
      colors: ["#FFF7ED", "#FFEDD5"],
      iconColor: "#F97316",
      onPress: () => {}, 
    }
  ];

  const enrolledCount = userId ? (skillsStore.enrolledCourseIds[userId] || []).length : 0;
  const certCount = userId ? (skillsStore.certificates[userId] || []).length : 0;

  const stats = [
    { label: "Courses", value: String(enrolledCount) },
    { label: "Certificates", value: String(certCount) },
  ];

  return (
    <View className="flex-1 bg-surface-primary">
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#fdf7ff", "#e9ddff", "#cfbcff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-6 pb-12 rounded-b-[40px] pt-8"
        >
          <SafeAreaView edges={["top"]}>
            <View className="flex-row justify-between items-center mb-8 mt-2">
              <Typography variant="title" weight="bold" color="primary">Profile</Typography>
              <TouchableOpacity 
                className="w-10 h-10 rounded-full bg-white/40 items-center justify-center relative border border-white/50"
                onPress={() => {
                  setTempName(name);
                  setTempEmail(email);
                  setTempPhone(phone);
                  setIsEditing(true);
                }}
              >
                <Edit color="#4f378a" size={20} />
              </TouchableOpacity>
            </View>

            <View className="items-center">
              <View className="w-24 h-24 rounded-full bg-white items-center justify-center mb-4 shadow-sm border border-black/5">
                <Typography variant="heading" weight="bold" color="primary" className="text-4xl">
                  {name[0]?.toUpperCase() || "U"}
                </Typography>
              </View>
              <Typography variant="title" weight="bold" color="primary" className="mb-1">{name}</Typography>
              <Typography variant="bodySecondary" color="secondary" className="mb-6">{email}</Typography>

              <View className="flex-row gap-3 w-full">
                {stats.map((stat, index) => (
                  <MotiView
                    key={stat.label}
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: index * 100 }}
                    className="flex-1"
                  >
                    <GlassSurface rounded="2xl" intensity={60} className="p-3 items-center border-white/50 bg-white/30">
                      <Typography variant="title" weight="bold" color="primary">{stat.value}</Typography>
                      <Typography variant="caption" color="secondary" className="mt-1">{stat.label}</Typography>
                    </GlassSurface>
                  </MotiView>
                ))}
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View className="px-6 mt-[-24px] gap-3">
          {menuItems.map((item, index) => (
            <MotiView
              key={item.label}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: index * 100 }}
            >
              <BentoCardPressable 
                variant="secondary"
                padding="md"
                onPress={item.onPress}
                className="flex-row items-center border border-border-subtle bg-surface-primary"
              >
                <LinearGradient
                  colors={item.colors}
                  className="w-12 h-12 rounded-xl items-center justify-center mr-4 border border-black/5"
                >
                  <item.icon color={item.iconColor} size={20} strokeWidth={2.5} />
                </LinearGradient>
                <View className="flex-1">
                  <Typography weight="bold" color="primary" className="mb-0.5">{item.label}</Typography>
                  <Typography variant="caption" color="secondary">{item.description}</Typography>
                </View>
                <ChevronRight color="#79747e" size={20} />
              </BentoCardPressable>
            </MotiView>
          ))}

          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 500 }}
          >
            <LinearGradient
              colors={["#fdf7ff", "#e9ddff"]}
              className="flex-row items-center p-5 rounded-3xl border border-primary/20 mt-2"
            >
              <View className="w-12 h-12 bg-primary rounded-xl items-center justify-center mr-4 shadow-sm">
                <Award color="white" size={24} strokeWidth={2.5} />
              </View>
              <View className="flex-1">
                <Typography weight="bold" color="primary" className="mb-0.5">Relicus Premium</Typography>
                <Typography variant="caption" color="secondary">Unlock exclusive features</Typography>
              </View>
              <Button size="sm" variant="primary" onPress={() => {}} className="px-4 py-2">
                Upgrade
              </Button>
            </LinearGradient>
          </MotiView>

          <TouchableOpacity 
            className="flex-row items-center justify-center gap-2 p-5 rounded-3xl bg-red-500/5 border border-red-500/10 mt-2"
            onPress={() => Alert.alert("Logout", "Are you sure you want to log out from Relicus?", [
              { text: "Cancel", style: "cancel" },
              { text: "Log Out", style: "destructive", onPress: () => {
                skillsStore.resetAll();
                authStore.logout();
                router.replace("/landing" as any);
              }}
            ])}
          >
            <LogOut color="#EF4444" size={20} />
            <Typography weight="bold" className="text-red-500">Logout</Typography>
          </TouchableOpacity>

          <View className="items-center mt-6">
            <Typography variant="caption" color="secondary" className="mb-1">Version 1.0.0</Typography>
            <Typography variant="caption" color="secondary" className="opacity-60">
              © 2026 Relicus. All rights reserved.
            </Typography>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isEditing}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditing(false)}
      >
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-white rounded-3xl p-6 shadow-sm"
          >
            <View className="flex-row justify-between items-center mb-6">
              <Typography variant="title" weight="bold" color="primary">Edit Profile</Typography>
              <TouchableOpacity onPress={() => setIsEditing(false)} className="p-2 bg-primary/5 rounded-full">
                <X color="#4f378a" size={20} />
              </TouchableOpacity>
            </View>
            
            <View className="gap-4">
              <Input
                label="Full Name"
                value={tempName}
                onChangeText={setTempName}
                placeholder="Enter your name"
              />
              
              <Input
                label="Email Address"
                keyboardType="email-address"
                value={tempEmail}
                onChangeText={setTempEmail}
                placeholder="Enter your email"
              />
              
              <Input
                label="Phone Number"
                keyboardType="phone-pad"
                value={tempPhone}
                onChangeText={setTempPhone}
                placeholder="Enter your phone number"
              />
            </View>
            
            <View className="flex-row gap-3 mt-6">
              <View className="flex-1">
                <Button
                  variant="outline"
                  onPress={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </View>
              <View className="flex-1">
                <Button
                  onPress={async () => {
                    try {
                      await authStore.updateProfile({
                        username: tempName,
                        email: tempEmail,
                        phone: tempPhone
                      });
                      setIsEditing(false);
                    } catch (error: any) {
                      Alert.alert("Update Failed", error.message);
                    }
                  }}
                >
                  Save
                </Button>
              </View>
            </View>
          </MotiView>
        </View>
      </Modal>
    </View>
  );
}
