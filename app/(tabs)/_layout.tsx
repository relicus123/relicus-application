import React from "react";
import { Tabs } from "expo-router";
import { Home, MessageSquare, GraduationCap, Bell, User } from "lucide-react-native";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4f378a", // primary
        tabBarInactiveTintColor: "#79747e", // secondary
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fdf7ff", // surface-primary
          borderTopWidth: 1,
          borderTopColor: "rgba(103, 80, 164, 0.1)", // primary with low opacity
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontFamily: "Inter-Medium",
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home color={color} size={22} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="sessions"
        options={{
          title: "Sessions",
          tabBarIcon: ({ color }) => <MessageSquare color={color} size={22} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="learning"
        options={{
          title: "Coaching",
          tabBarIcon: ({ color }) => <GraduationCap color={color} size={22} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color }) => <Bell color={color} size={22} strokeWidth={2.5} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User color={color} size={22} strokeWidth={2.5} />,
        }}
      />
    </Tabs>
  );
}
