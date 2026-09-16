import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MotiView } from "moti";
import {
  User,
  Bell,
  Lock,
  Shield,
  ChevronRight,
  LogOut,
  Edit,
  X,
  GraduationCap,
  Smartphone,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useAuthStore } from "../../store/auth.store";
import { useSkillsStore } from "../../store/skills.store";
import { useCoachingStore } from "../../store/coaching.store";
import {
  fetchUserDevices,
  revokeDevice,
  getOrCreateDeviceId,
  type UserDevice,
} from "../../lib/deviceService";
import { Typography } from "../../components/Typography";
import { GlassSurface } from "../../components/GlassSurface";
import { BentoCard, BentoCardPressable } from "../../components/BentoCard";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export default function ProfileScreen() {
  const router = useRouter();
  
  const authStore = useAuthStore();
  const skillsStore = useSkillsStore();
  const coachingStore = useCoachingStore();
  const user = authStore.currentUser;
  const userId = user?.id;

  const name = user?.username || "Guest";
  const email = user?.email || "No Email";
  const phone = user?.phone || "No Phone";

  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [tempName, setTempName] = useState(name);
  const [tempEmail, setTempEmail] = useState(email);
  const [tempPhone, setTempPhone] = useState(phone);

  const [showDevicesModal, setShowDevicesModal] = useState(false);
  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>("");
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const loadDevices = async () => {
    setLoadingDevices(true);
    try {
      const [devs, curId] = await Promise.all([
        fetchUserDevices(),
        getOrCreateDeviceId(),
      ]);
      setDevices(devs);
      setCurrentDeviceId(curId);
    } catch (e) {
      console.warn("Failed to load devices:", e);
    } finally {
      setLoadingDevices(false);
    }
  };

  useEffect(() => {
    coachingStore.fetchCoachingData().then(() => {
      coachingStore.recordDailyActivity();
    });
  }, []);

  const testAttempts = coachingStore.testAttempts || [];
  const learningStreak = coachingStore.learningStreak ?? 0;

  const avgScore = testAttempts.length > 0
    ? Math.round(
        testAttempts.reduce(
          (acc, t) => acc + (Number(t.score) / (Number(t.maxScore) || 100)) * 100,
          0
        ) / testAttempts.length
      )
    : 0;

  const stats = [
    { label: "Mocks Taken", value: String(testAttempts.length) },
    { label: "Avg Score", value: testAttempts.length > 0 ? `${avgScore}%` : "-" },
    { label: "Day Streak", value: `${learningStreak}🔥` },
  ];

  const menuItems = [
    {
      icon: User,
      label: "Edit Profile",
      description: "Update your information",
      colors: ["#FFFFFF", "#EDF5F8"],
      iconColor: "#1C4966",
      onPress: () => {
        setTempName(name);
        setTempEmail(email);
        setTempPhone(phone);
        setIsEditing(true);
      },
    },
    {
      icon: Smartphone,
      label: "Devices & Security",
      description: "Manage your 2 active logged-in devices",
      colors: ["#F0FDF4", "#DCFCE7"],
      iconColor: "#15803D",
      onPress: () => {
        setShowDevicesModal(true);
        loadDevices();
      },
    },
    {
      icon: Bell,
      label: "Notifications",
      description: "Faculty announcements & alerts",
      colors: ["#F0F7FF", "#DBEAFE"],
      iconColor: "#1C4966",
      onPress: () => router.push("/(tabs)/notifications" as any),
    },
    {
      icon: Shield,
      label: "Privacy Policy",
      description: "Terms, privacy & student data protection",
      colors: ["#F0F7FF", "#DBEAFE"],
      iconColor: "#1C4966",
      onPress: () => router.push("/profile/privacy" as any),
    },
  ];

  return (
    <View className="flex-1 bg-surface-primary">
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#FFFFFF", "#EDF5F8", "#E1EFF5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-6 pb-12 rounded-b-[40px] pt-8"
        >
          <SafeAreaView edges={["top"]}>
            <View className="flex-row justify-between items-center mb-8 mt-2">
              <Typography variant="title" weight="bold" color="primary">Profile</Typography>
              <TouchableOpacity 
                className="w-10 h-10 rounded-full bg-white/70 items-center justify-center relative border border-border-subtle"
                onPress={() => {
                  setTempName(name);
                  setTempEmail(email);
                  setTempPhone(phone);
                  setIsEditing(true);
                }}
              >
                <Edit color="#1C4966" size={20} />
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
                <ChevronRight color="#71818B" size={20} />
              </BentoCardPressable>
            </MotiView>
          ))}

          {/* Entrance Coaching Mock Test History */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 350 }}
          >
            <BentoCard variant="secondary" padding="lg" className="border border-border-subtle bg-white mt-1">
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center gap-2">
                  <GraduationCap size={20} color="#1C4966" />
                  <Typography variant="heading" weight="bold" color="primary">Mock Test History</Typography>
                </View>
                <TouchableOpacity onPress={() => router.push("/(tabs)/learning" as any)}>
                  <Typography variant="caption" weight="bold" color="primary">Prep Hub →</Typography>
                </TouchableOpacity>
              </View>

              {testAttempts.length === 0 ? (
                <View className="py-4 items-center">
                  <Typography variant="caption" color="secondary" className="text-center mb-3">
                    No mock tests completed yet. Test your preparation with instant grading!
                  </Typography>
                  <Button size="sm" variant="primary" onPress={() => router.push("/(tabs)/learning" as any)}>
                    Take a Mock Test
                  </Button>
                </View>
              ) : (
                <View className="gap-2.5">
                  {testAttempts.slice(0, 5).map((attempt: any, i: number) => (
                    <View key={attempt.id || i} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex-row justify-between items-center">
                      <View className="flex-1 mr-2">
                        <Typography weight="bold" color="primary" numberOfLines={1}>{attempt.testName || "Mock Test"}</Typography>
                        <Typography variant="caption" color="secondary" className="text-[10px]">
                          {attempt.date ? new Date(attempt.date).toLocaleDateString() : "Recent"} • {attempt.examType || "Entrance"}
                        </Typography>
                      </View>
                      <View className="items-end">
                        <View className="bg-emerald-100 px-2 py-0.5 rounded-full mb-0.5">
                          <Typography variant="caption" weight="bold" className="text-emerald-700 text-xs">
                            {attempt.score}/{attempt.maxScore || 100} ({Math.round(attempt.accuracy || 0)}%)
                          </Typography>
                        </View>
                        <Typography variant="caption" color="secondary" className="text-[9px]">Score</Typography>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </BentoCard>
          </MotiView>

          <TouchableOpacity 
            className="flex-row items-center justify-center gap-2 p-5 rounded-3xl bg-red-500/5 border border-red-500/10 mt-2"
            onPress={() => setShowLogoutModal(true)}
            activeOpacity={0.8}
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
                <X color="#1C4966" size={20} />
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

      {/* Custom Universal Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => !isLoggingOut && setShowLogoutModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(15, 23, 42, 0.7)", justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              width: "100%",
              maxWidth: 350,
              backgroundColor: "#FFFFFF",
              borderRadius: 24,
              padding: 24,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.25,
              shadowRadius: 24,
              elevation: 12,
            }}
          >
            <View style={{ width: 56, height: 56, borderRadius: 20, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center", marginBottom: 14, borderWidth: 1, borderColor: "#FECACA" }}>
              <LogOut color="#DC2626" size={26} strokeWidth={2.4} />
            </View>

            <Text style={{ fontSize: 19, fontWeight: "800", color: "#0F172A", marginBottom: 8, textAlign: "center" }}>
              Log Out of Relicus?
            </Text>

            <Text style={{ fontSize: 13, color: "#475569", textAlign: "center", lineHeight: 18, marginBottom: 22, paddingHorizontal: 4 }}>
              Are you sure you want to log out? You will need to sign in again to access your courses, mock tests, and roadmaps.
            </Text>

            <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
              <TouchableOpacity
                onPress={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 14,
                  backgroundColor: "#F8FAFC",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                }}
                activeOpacity={0.8}
              >
                <Text style={{ color: "#475569", fontWeight: "700", fontSize: 14 }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  if (isLoggingOut) return;
                  setIsLoggingOut(true);
                  try {
                    skillsStore.resetAll();
                    await authStore.logout();
                  } catch (err) {
                    console.warn("Logout error:", err);
                  } finally {
                    setIsLoggingOut(false);
                    setShowLogoutModal(false);
                    router.replace({ pathname: "/landing", params: { logout: "true" } } as any);
                  }
                }}
                disabled={isLoggingOut}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 14,
                  backgroundColor: "#DC2626",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                activeOpacity={0.85}
              >
                {isLoggingOut ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 14 }}>
                    Log Out
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </MotiView>
        </View>
      </Modal>

      {/* Devices & Active Sessions Management Modal */}
      <Modal
        visible={showDevicesModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDevicesModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(15, 23, 42, 0.7)", justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}>
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              width: "100%",
              maxWidth: 420,
              backgroundColor: "#FFFFFF",
              borderRadius: 24,
              padding: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.25,
              shadowRadius: 24,
              elevation: 12,
            }}
          >
            {/* Header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#DCFCE7", alignItems: "center", justifyContent: "center" }}>
                  <Smartphone color="#15803D" size={22} />
                </View>
                <View>
                  <Text style={{ fontSize: 17, fontWeight: "800", color: "#0F172A" }}>
                    Logged In Devices
                  </Text>
                  <Text style={{ fontSize: 12, color: "#64748B" }}>
                    {devices.length}/2 Active Devices
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowDevicesModal(false)}
                style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" }}
              >
                <X color="#64748B" size={18} />
              </TouchableOpacity>
            </View>

            {/* Info notice */}
            <View style={{ backgroundColor: "#F8FAFC", borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: "#E2E8F0" }}>
              <Text style={{ fontSize: 12, color: "#475569", lineHeight: 17 }}>
                Relicus limits each student account to <Text style={{ fontWeight: "700" }}>2 active devices</Text>. Logging in from a 3rd device automatically signs out your oldest session.
              </Text>
            </View>

            {/* Device List */}
            {loadingDevices ? (
              <View style={{ paddingVertical: 32, alignItems: "center" }}>
                <ActivityIndicator size="small" color="#1C4966" />
                <Text style={{ marginTop: 8, fontSize: 12, color: "#64748B" }}>Checking active devices...</Text>
              </View>
            ) : devices.length === 0 ? (
              <View style={{ paddingVertical: 24, alignItems: "center" }}>
                <Text style={{ fontSize: 13, color: "#64748B" }}>No active devices recorded yet.</Text>
              </View>
            ) : (
              <View style={{ gap: 10, marginBottom: 16 }}>
                {devices.map((device) => {
                  const isCurrent = device.device_id === currentDeviceId;
                  const isRevoking = revokingId === device.device_id;
                  const formattedDate = new Date(device.last_active_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <View
                      key={device.id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: 14,
                        borderRadius: 16,
                        backgroundColor: isCurrent ? "#F0FDF4" : "#F8FAFC",
                        borderWidth: 1,
                        borderColor: isCurrent ? "#BBF7D0" : "#E2E8F0",
                      }}
                    >
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
                          <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }} numberOfLines={1}>
                            {device.device_name || "Unknown Device"}
                          </Text>
                          {isCurrent && (
                            <View style={{ backgroundColor: "#22C55E", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                              <Text style={{ fontSize: 10, fontWeight: "800", color: "#FFFFFF" }}>THIS DEVICE</Text>
                            </View>
                          )}
                        </View>
                        <Text style={{ fontSize: 11, color: "#64748B" }}>
                          Active: {formattedDate}
                        </Text>
                      </View>

                      {!isCurrent && (
                        <TouchableOpacity
                          disabled={isRevoking}
                          onPress={() => {
                            Alert.alert(
                              "Log Out Device?",
                              `Disconnect ${device.device_name || "this device"} from your account?`,
                              [
                                { text: "Cancel", style: "cancel" },
                                {
                                  text: "Log Out",
                                  style: "destructive",
                                  onPress: async () => {
                                    setRevokingId(device.device_id);
                                    await revokeDevice(device.device_id);
                                    setRevokingId(null);
                                    loadDevices();
                                  },
                                },
                              ]
                            );
                          }}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 10,
                            backgroundColor: "#FEE2E2",
                            borderWidth: 1,
                            borderColor: "#FECACA",
                          }}
                        >
                          {isRevoking ? (
                            <ActivityIndicator size="small" color="#DC2626" />
                          ) : (
                            <Text style={{ fontSize: 12, fontWeight: "700", color: "#DC2626" }}>Log Out</Text>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setShowDevicesModal(false)}
              style={{
                width: "100%",
                paddingVertical: 12,
                borderRadius: 14,
                backgroundColor: "#1C4966",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 8,
              }}
              activeOpacity={0.85}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 14 }}>
                Done
              </Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      </Modal>
    </View>
  );
}
