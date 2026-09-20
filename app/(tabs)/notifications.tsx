import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Text,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import {
  Bell,
  GraduationCap,
  Megaphone,
  Sparkles,
  MessageSquare,
  FileText,
  ArrowLeft,
  CheckCheck,
  ChevronRight,
  Clock,
  X,
  ExternalLink,
  Inbox,
  ShieldAlert,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Typography } from "../../components/Typography";
import { Button } from "../../components/Button";
import { useNotificationsStore, AppNotification } from "../../store/notifications.store";

// Helper to format ISO strings to relative time
const formatTimeAgo = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "Recent";
  }
};

interface NotificationCategoryInfo {
  tag: string;
  badgeBg: string;
  badgeBorder: string;
  iconColor: string;
  tagBg: string;
  tagColor: string;
  icon: any;
  route: string;
  actionText: string;
}

function getCategoryInfo(notification: AppNotification): NotificationCategoryInfo {
  const text = `${notification.title} ${notification.message}`.toLowerCase();

  // Exams / Mock Tests / Entrance
  if (
    text.includes("exam") ||
    text.includes("cuet") ||
    text.includes("jee") ||
    text.includes("neet") ||
    text.includes("test") ||
    text.includes("mock")
  ) {
    return {
      tag: "EXAM UPDATE",
      badgeBg: "#EDF5F8",
      badgeBorder: "#C9D9E2",
      iconColor: "#1C4966",
      tagBg: "#EDF5F8",
      tagColor: "#1C4966",
      icon: GraduationCap,
      route: "/coaching/dashboard",
      actionText: "Open Coaching Hub",
    };
  }

  // Skills / Courses / Certifications
  if (
    text.includes("course") ||
    text.includes("skill") ||
    text.includes("certificate") ||
    text.includes("assignment")
  ) {
    return {
      tag: "SKILL ACADEMY",
      badgeBg: "#E8F4EE",
      badgeBorder: "#C2E2D2",
      iconColor: "#059669",
      tagBg: "#E8F4EE",
      tagColor: "#059669",
      icon: Sparkles,
      route: "/(tabs)/skills",
      actionText: "Open Skill Academy",
    };
  }

  // Career / KnowNext
  if (
    text.includes("college") ||
    text.includes("career") ||
    text.includes("roadmap") ||
    text.includes("scholarship") ||
    text.includes("knownext")
  ) {
    return {
      tag: "KNOW NEXT",
      badgeBg: "#FFF7ED",
      badgeBorder: "#FED7AA",
      iconColor: "#EA580C",
      tagBg: "#FFF7ED",
      tagColor: "#EA580C",
      icon: FileText,
      route: "/(tabs)/knownext",
      actionText: "Explore Know Next",
    };
  }

  // Q&A / Doubts / Messages
  if (
    text.includes("doubt") ||
    text.includes("q&a") ||
    text.includes("message") ||
    notification.type === "message"
  ) {
    return {
      tag: "DOUBT DESK",
      badgeBg: "#F5F3FF",
      badgeBorder: "#DDD6FE",
      iconColor: "#7C3AED",
      tagBg: "#F5F3FF",
      tagColor: "#7C3AED",
      icon: MessageSquare,
      route: "/coaching/dashboard",
      actionText: "Open Doubt Desk",
    };
  }

  // Announcements
  if (
    text.includes("announcement") ||
    notification.id.startsWith("ann-")
  ) {
    return {
      tag: "ANNOUNCEMENT",
      badgeBg: "#FEF3C7",
      badgeBorder: "#FDE68A",
      iconColor: "#D97706",
      tagBg: "#FEF3C7",
      tagColor: "#D97706",
      icon: Megaphone,
      route: "/coaching/dashboard",
      actionText: "View Announcement",
    };
  }

  // General Update
  return {
    tag: "NOTICE",
    badgeBg: "#EDF5F8",
    badgeBorder: "#DCE5EA",
    iconColor: "#1C4966",
    tagBg: "#EDF5F8",
    tagColor: "#1C4966",
    icon: Bell,
    route: "/coaching/dashboard",
    actionText: "View Details",
  };
}

type FilterTab = "all" | "unread" | "exams" | "announcements";

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, markAllAsRead, markAsRead, fetchLiveNotifications } =
    useNotificationsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [selectedNotification, setSelectedNotification] =
    useState<AppNotification | null>(null);

  useEffect(() => {
    fetchLiveNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLiveNotifications();
    setRefreshing(false);
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case "unread":
        return notifications.filter((n) => n.unread);
      case "exams":
        return notifications.filter((n) => {
          const text = `${n.title} ${n.message}`.toLowerCase();
          return (
            text.includes("exam") ||
            text.includes("cuet") ||
            text.includes("test") ||
            text.includes("jee") ||
            text.includes("neet")
          );
        });
      case "announcements":
        return notifications.filter((n) => {
          const text = `${n.title} ${n.message}`.toLowerCase();
          return text.includes("announcement") || n.id.startsWith("ann-");
        });
      case "all":
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  const navigateToNotification = (notification: AppNotification) => {
    const info = getCategoryInfo(notification);
    if (info.route.includes("/coaching/dashboard")) {
      let targetExam = notification.examId;
      if (!targetExam) {
        const text = `${notification.title} ${notification.message}`.toLowerCase();
        if (text.includes("cuet")) targetExam = "CUET PG";
        else if (text.includes("jee")) targetExam = "JEE";
        else if (text.includes("neet")) targetExam = "NEET";
      }

      router.push({
        pathname: "/coaching/dashboard" as any,
        params: targetExam ? { examType: targetExam } : undefined,
      });
    } else {
      router.push(info.route as any);
    }
  };

  const handleCardPress = (notification: AppNotification) => {
    markAsRead(notification.id);

    // If message is an announcement or has extended content, show detailed modal
    if (
      notification.id.startsWith("ann-") ||
      notification.title.toLowerCase().includes("announcement") ||
      notification.message.length > 70
    ) {
      setSelectedNotification(notification);
    } else {
      navigateToNotification(notification);
    }
  };

  const handleModalAction = () => {
    if (!selectedNotification) return;
    const notif = selectedNotification;
    setSelectedNotification(null);
    navigateToNotification(notif);
  };

  const selectedInfo = selectedNotification
    ? getCategoryInfo(selectedNotification)
    : null;

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* =================================================================== */}
      {/* 1. TOP HEADER                                                       */}
      {/* =================================================================== */}
      <View className="bg-white border-b border-[#E5EDF2] pb-3 pt-2">
        <SafeAreaView edges={["top"]}>
          <View className="px-5 pt-2 flex-row items-center justify-between">
            {/* Left: Back Button + Title */}
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace("/(tabs)/home");
                  }
                }}
                className="w-10 h-10 rounded-full bg-[#F1F5F9] items-center justify-center border border-[#E2E8F0]"
                accessibilityLabel="Go Back"
              >
                <ArrowLeft size={20} color="#172F3D" strokeWidth={2.4} />
              </TouchableOpacity>

              <View>
                <View className="flex-row items-center gap-2">
                  <Typography variant="heading" weight="bold" className="text-xl text-[#172F3D]">
                    Notifications
                  </Typography>
                  {unreadCount > 0 && (
                    <View className="bg-[#1C4966] px-2 py-0.5 rounded-full">
                      <Text className="text-[11px] font-bold text-white">
                        {unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
                <Typography variant="caption" className="text-xs text-[#71818B]">
                  Stay updated with exams, classes & alerts
                </Typography>
              </View>
            </View>

            {/* Right: Mark All As Read */}
            {unreadCount > 0 && (
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={markAllAsRead}
                className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EDF5F8] border border-[#DCE5EA]"
              >
                <CheckCheck size={14} color="#1C4966" strokeWidth={2.4} />
                <Text className="text-xs font-bold text-[#1C4966]">
                  Read All
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* =================================================================== */}
          {/* 2. FILTER PILLS                                                     */}
          {/* =================================================================== */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, gap: 8 }}
          >
            {[
              { key: "all", label: `All (${notifications.length})` },
              { key: "unread", label: `Unread (${unreadCount})` },
              { key: "exams", label: "Exams" },
              { key: "announcements", label: "Announcements" },
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  activeOpacity={0.75}
                  onPress={() => setActiveTab(tab.key as FilterTab)}
                  className={`px-3.5 py-1.5 rounded-full border ${
                    isActive
                      ? "bg-[#1C4966] border-[#1C4966]"
                      : "bg-white border-[#E2E8F0]"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      isActive ? "text-white" : "text-[#5A6F7D]"
                    }`}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </View>

      {/* =================================================================== */}
      {/* 3. NOTIFICATIONS LIST                                               */}
      {/* =================================================================== */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1C4966"
          />
        }
      >
        {filteredNotifications.length === 0 ? (
          <View className="items-center justify-center py-16 px-6">
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="w-44 h-44 rounded-3xl bg-white border border-[#E5EDF2] shadow-sm items-center justify-center p-2 mb-4 overflow-hidden"
            >
              <Image
                source={require("../../assets/illustrations/empty_notifications.jpg")}
                style={{ width: "100%", height: "100%", borderRadius: 20 }}
                resizeMode="contain"
              />
            </MotiView>
            <Typography variant="heading" weight="bold" className="text-lg text-[#172F3D] mb-1">
              No notifications here
            </Typography>
            <Typography variant="bodySecondary" className="text-sm text-[#71818B] text-center max-w-xs leading-5">
              {activeTab === "unread"
                ? "You've read all your notifications! Check back later for new updates."
                : "When new exam roadmaps, doubt answers, or announcements are posted, they'll show up here."}
            </Typography>
          </View>
        ) : (
          <View className="gap-3">
            {filteredNotifications.map((notification, index) => {
              const info = getCategoryInfo(notification);
              const IconComp = info.icon;

              return (
                <MotiView
                  key={notification.id}
                  from={{ opacity: 0, translateY: 10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: Math.min(index * 60, 300) }}
                >
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => handleCardPress(notification)}
                    className={`bg-white rounded-2xl p-4 border shadow-sm ${
                      notification.unread
                        ? "border-[#1C4966]/20 bg-white"
                        : "border-[#E5EDF2] bg-white/80"
                    }`}
                  >
                    {/* Header Row: Category Badge + Timestamp + Unread Dot */}
                    <View className="flex-row items-center justify-between mb-2.5">
                      <View className="flex-row items-center gap-2">
                        {/* Icon Badge */}
                        <View
                          style={{
                            backgroundColor: info.badgeBg,
                            borderColor: info.badgeBorder,
                          }}
                          className="w-8 h-8 rounded-lg items-center justify-center border"
                        >
                          <IconComp size={16} color={info.iconColor} strokeWidth={2.4} />
                        </View>

                        {/* Tag Pill */}
                        <View
                          style={{ backgroundColor: info.tagBg }}
                          className="px-2 py-0.5 rounded-md"
                        >
                          <Text
                            style={{ color: info.tagColor }}
                            className="text-[10px] font-bold tracking-wider"
                          >
                            {info.tag}
                          </Text>
                        </View>
                      </View>

                      {/* Timestamp & Unread Dot */}
                      <View className="flex-row items-center gap-2">
                        <View className="flex-row items-center gap-1">
                          <Clock size={11} color="#94A3B8" />
                          <Text className="text-[11.5px] text-[#94A3B8]">
                            {formatTimeAgo(notification.timestamp)}
                          </Text>
                        </View>
                        {notification.unread && (
                          <View className="w-2.5 h-2.5 rounded-full bg-[#1C4966]" />
                        )}
                      </View>
                    </View>

                    {/* Title */}
                    <Typography
                      weight="bold"
                      className="text-[15px] text-[#172F3D] mb-1 leading-snug"
                    >
                      {notification.title}
                    </Typography>

                    {/* Message Body */}
                    <Typography
                      variant="bodySecondary"
                      numberOfLines={3}
                      className="text-[13px] text-[#5A6F7D] leading-5 mb-3"
                    >
                      {notification.message}
                    </Typography>

                    {/* Footer Row: Action Button / Redirection Link */}
                    <View className="flex-row items-center justify-between pt-2 border-t border-[#F1F5F9]">
                      <View className="flex-row items-center gap-1.5">
                        <Text className="text-xs font-bold text-[#1C4966]">
                          {info.actionText}
                        </Text>
                        <ChevronRight size={14} color="#1C4966" strokeWidth={2.5} />
                      </View>
                      <Text className="text-[11px] font-medium text-[#94A3B8]">
                        Tap to open
                      </Text>
                    </View>
                  </TouchableOpacity>
                </MotiView>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* =================================================================== */}
      {/* 4. NOTIFICATION DETAIL & ACTION MODAL                                */}
      {/* =================================================================== */}
      <Modal
        visible={!!selectedNotification}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedNotification(null)}
      >
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className="w-full max-w-[380px] bg-white rounded-3xl p-6 border border-[#E5EDF2] shadow-2xl">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between mb-4">
              {selectedInfo && (
                <View className="flex-row items-center gap-2.5">
                  <View
                    style={{
                      backgroundColor: selectedInfo.badgeBg,
                      borderColor: selectedInfo.badgeBorder,
                    }}
                    className="w-10 h-10 rounded-xl items-center justify-center border"
                  >
                    <selectedInfo.icon
                      size={20}
                      color={selectedInfo.iconColor}
                      strokeWidth={2.4}
                    />
                  </View>
                  <View>
                    <Text
                      style={{ color: selectedInfo.tagColor }}
                      className="text-[11px] font-bold tracking-wider"
                    >
                      {selectedInfo.tag}
                    </Text>
                    <Text className="text-[11px] text-[#94A3B8]">
                      {selectedNotification &&
                        formatTimeAgo(selectedNotification.timestamp)}
                    </Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                onPress={() => setSelectedNotification(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                className="w-8 h-8 rounded-full bg-black/5 items-center justify-center"
              >
                <X size={16} color="#71818B" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <Typography
              variant="heading"
              weight="bold"
              className="text-lg text-[#172F3D] mb-2 leading-snug"
            >
              {selectedNotification?.title}
            </Typography>

            <ScrollView style={{ maxHeight: 220 }} className="mb-6">
              <Typography
                variant="bodySecondary"
                className="text-sm text-[#5A6F7D] leading-6"
              >
                {selectedNotification?.message}
              </Typography>
            </ScrollView>

            {/* Action Redirection Button */}
            <View className="gap-2.5">
              <Button
                variant="primary"
                size="md"
                onPress={handleModalAction}
                className="w-full py-3.5"
              >
                <View className="flex-row items-center justify-center gap-2">
                  <Typography weight="bold" color="white" className="text-sm">
                    {selectedInfo?.actionText}
                  </Typography>
                  <ExternalLink size={15} color="#FFFFFF" strokeWidth={2.2} />
                </View>
              </Button>

              <TouchableOpacity
                onPress={() => setSelectedNotification(null)}
                className="py-2 items-center justify-center"
              >
                <Typography weight="medium" className="text-sm text-[#71818B]">
                  Dismiss
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
