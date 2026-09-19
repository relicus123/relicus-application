import React, { useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { Home, Sparkles, GraduationCap, Compass, User } from "lucide-react-native";
import { Platform, View } from "react-native";
import { useAuthStore } from "../../store/auth.store";

export default function TabLayout() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.currentUser);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    if (isHydrated && !currentUser) {
      router.replace("/landing" as any);
    }
  }, [isHydrated, currentUser]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1C4966",
        tabBarInactiveTintColor: "#71818B",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#DCE5EA",
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: "center" }}>
              <Home color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="skills"
        options={{
          href: null,
          title: "Skill Academy",
          tabBarIcon: ({ color, focused }) => (
            <Sparkles color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="learning"
        options={{
          title: "Coaching",
          tabBarIcon: ({ color, focused }) => (
            <GraduationCap color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="knownext"
        options={{
          href: null,
          title: "Know Next",
          tabBarIcon: ({ color, focused }) => (
            <Compass color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <User color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
