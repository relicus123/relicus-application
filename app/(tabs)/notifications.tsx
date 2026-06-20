import React from "react";
import {
  View,
  Text,
  StyleSheet,
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

export default function NotificationsScreen() {
  const notifications = [
    {
      id: 1,
      type: "appointment",
      title: "Session Reminder",
      message: "Your session with Dr. Sarah starts in 30 minutes.",
      time: "25m ago",
      icon: Calendar,
      colors: ["#1C4966", "#5F8B70"],
      unread: true,
    },
    {
      id: 2,
      type: "learning",
      title: "New Course Available",
      message: "Check out the new CUET Mathematics crash course.",
      time: "2h ago",
      icon: Bell,
      colors: ["#5F8B70", "#8FBDD7"],
      unread: true,
    },
    {
      id: 3,
      type: "system",
      title: "Profile Verified",
      message: "Your identity documents have been successfully verified.",
      time: "5h ago",
      icon: CheckCircle,
      colors: ["#5F8B70", "#1C4966"],
      unread: false,
    },
    {
      id: 4,
      type: "message",
      title: "New Message",
      message: "Dr. Rajesh Kumar sent you a follow-up note.",
      time: "1d ago",
      icon: MessageCircle,
      colors: ["#8FBDD7", "#DDEEE3"],
      unread: false,
    },
    {
      id: 5,
      type: "alert",
      title: "Payment Success",
      message: "Payment for 'Mock Test Series' was successful.",
      time: "2d ago",
      icon: AlertCircle,
      colors: ["#1C4966", "#8FBDD7"],
      unread: false,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity>
            <Text style={styles.markReadText}>Mark all as read</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          {notifications.map((notification, index) => (
            <MotiView
              key={notification.id}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ delay: index * 100 }}
              style={[
                styles.notificationCard,
                notification.unread && styles.unreadCard,
              ]}
            >
              <LinearGradient
                colors={notification.colors}
                style={styles.iconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <notification.icon color="white" size={20} />
              </LinearGradient>

              <View style={styles.contentContainer}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                </View>
                <Text style={styles.notificationMessage} numberOfLines={2}>
                  {notification.message}
                </Text>
              </View>

              {notification.unread && <View style={styles.unreadDot} />}
            </MotiView>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFF0",
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    paddingTop: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1C4966",
  },
  markReadText: {
    fontSize: 14,
    color: "#5F8B70",
    fontWeight: "600",
  },
  listContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
  },
  unreadCard: {
    backgroundColor: "white",
    borderColor: "rgba(95, 139, 112, 0.2)",
    elevation: 4,
    shadowColor: "#1C4966",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C4966",
  },
  notificationTime: {
    fontSize: 12,
    color: "#8FBDD7",
  },
  notificationMessage: {
    fontSize: 14,
    color: "#5F8B70",
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D9534F",
    marginLeft: 12,
  },
});
