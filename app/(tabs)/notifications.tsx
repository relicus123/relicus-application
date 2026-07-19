import React from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MotiView } from "moti";
import {
  Bell,
  Calendar,
  CheckCircle,
  AlertCircle,
  MessageCircle,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Typography } from "../../components/Typography";
import { GlassSurface } from "../../components/GlassSurface";
import { BentoCard } from "../../components/BentoCard";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useNotificationsStore, AppNotification } from "../../store/notifications.store";
import { useEffect } from "react";

// Helper to format ISO strings to relative time
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

// Helper for dynamic colors/icons
const getNotificationStyle = (type: AppNotification["type"]) => {
  switch (type) {
    case "appointment":
      return { icon: Calendar, colors: ["#fdf7ff", "#e9ddff"], iconColor: "#4f378a" };
    case "learning":
      return { icon: Bell, colors: ["#F0F7FF", "#DBEAFE"], iconColor: "#3B82F6" };
    case "system":
      return { icon: CheckCircle, colors: ["#ECFDF5", "#D1FAE5"], iconColor: "#10B981" };
    case "message":
      return { icon: MessageCircle, colors: ["#FAF5FF", "#F3E8FF"], iconColor: "#8B5CF6" };
    case "alert":
      return { icon: AlertCircle, colors: ["#FFF7ED", "#FFEDD5"], iconColor: "#F97316" };
    default:
      return { icon: Bell, colors: ["#f3f4f6", "#e5e7eb"], iconColor: "#6b7280" };
  }
};

export default function NotificationsScreen() {
  const { notifications, markAllAsRead, markAsRead, addNotification } = useNotificationsStore();

  // For testing purposes: Add demo data if empty on first load
  useEffect(() => {
    if (notifications.length === 0) {
      addNotification({
        type: "system",
        title: "Welcome to Relicus",
        message: "Your profile has been created successfully.",
      });
    }
  }, []);
  return (
    <View className="flex-1 bg-surface-primary">
      <LinearGradient
        colors={["#fdf7ff", "#e9ddff", "#cfbcff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-12 rounded-b-[40px] pt-8"
      >
        <SafeAreaView edges={["top"]}>
          <View className="flex-row justify-between items-center mb-4 mt-2">
            <View className="flex-row items-center gap-4">
              <GlassSurface rounded="full" intensity={40} className="w-12 h-12 items-center justify-center border-white/30 bg-primary/10">
                <Bell color="#4f378a" size={24} strokeWidth={2.5} />
              </GlassSurface>
              <View>
                <Typography variant="title" weight="bold" color="primary">Notifications</Typography>
                <Typography variant="caption" color="secondary">Your recent updates</Typography>
              </View>
            </View>
            <TouchableOpacity 
              className="bg-white/40 border border-white/50 px-3 py-2 rounded-xl"
              onPress={markAllAsRead}
            >
              <Typography variant="caption" weight="bold" color="primary">Mark all read</Typography>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-4">
          {notifications.map((notification, index) => {
            const style = getNotificationStyle(notification.type);
            return (
              <MotiView
                key={notification.id}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: index * 100 }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => markAsRead(notification.id)}
                >
                  <BentoCard 
                    variant={notification.unread ? "elevated" : "secondary"} 
                    padding="md" 
                    className={twMerge(clsx("flex-row items-center border", notification.unread ? "border-primary/20 bg-white" : "border-border-subtle bg-surface-primary"))}
                  >
                    <LinearGradient
                      colors={style.colors}
                      className="w-12 h-12 rounded-xl items-center justify-center mr-4 border border-black/5"
                    >
                      <style.icon color={style.iconColor} size={20} strokeWidth={2.5} />
                    </LinearGradient>

                    <View className="flex-1">
                      <View className="flex-row justify-between items-center mb-1">
                        <Typography weight="bold" color="primary" className="text-base">{notification.title}</Typography>
                        <Typography variant="caption" color="secondary">{formatTimeAgo(notification.timestamp)}</Typography>
                      </View>
                      <Typography variant="caption" color="secondary" numberOfLines={2} className="opacity-90">
                        {notification.message}
                      </Typography>
                    </View>

                    {notification.unread && (
                      <View className="w-2.5 h-2.5 rounded-full bg-red-500 ml-3 border border-white" />
                    )}
                  </BentoCard>
                </TouchableOpacity>
              </MotiView>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
