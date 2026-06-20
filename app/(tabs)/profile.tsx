import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
} from "react-native";
import { MotiView } from "moti";
import {
  User,
  Bell,
  Lock,
  Award,
  Clock,
  LogOut,
  ChevronRight,
  Edit,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useAppContext } from "../../components/AppContext";
import { useAuthStore } from "../../store/auth.store";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const router = useRouter();
  
  const { updateProfile, bookings } = useAppContext();
  const authStore = useAuthStore();
  const user = authStore.currentUser;

  const name = user?.username || "Guest";
  const email = user?.email || "No Email";
  const phone = user?.phone || "No Phone";

  const [isEditing, setIsEditing] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [tempName, setTempName] = useState(name);
  const [tempEmail, setTempEmail] = useState(email);
  const [tempPhone, setTempPhone] = useState(phone);

  const bookingHistory = bookings;

  const menuItems = [
    {
      icon: User,
      label: "Edit Profile",
      description: "Update your information",
      colors: ["#1C4966", "#5F8B70"],
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
      colors: ["#5F8B70", "#8FBDD7"],
      onPress: () => router.push("/notifications" as any),
    },
    {
      icon: Lock,
      label: "Privacy & Security",
      description: "Control your data",
      colors: ["#8FBDD7", "#DDEEE3"],
      onPress: () => router.push("/profile/privacy" as any),
    },
    {
      icon: Award,
      label: "Certificates",
      description: "View achievements",
      colors: ["#5F8B70", "#1C4966"],
      onPress: () => {}, // certificates will see later
    },
    {
      icon: Clock,
      label: "Session History",
      description: "Past appointments",
      colors: ["#1C4966", "#8FBDD7"],
      onPress: () => setIsHistoryOpen(true),
    },
  ];

  const stats = [
    { label: "Sessions", value: "24" },
    { label: "Courses", value: "5" },
    { label: "Certificates", value: "3" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={["#1C4966", "#5F8B70"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => {
                setTempName(name);
                setTempEmail(email);
                setTempPhone(phone);
                setIsEditing(true);
              }}
            >
              <Edit color="white" size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{name[0]?.toUpperCase() || "U"}</Text>
            </View>
            <Text style={styles.userName}>{name}</Text>
            <Text style={styles.userEmail}>{email}</Text>

            <View style={styles.statsRow}>
              {stats.map((stat, index) => (
                <MotiView
                  key={stat.label}
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: index * 100 }}
                  style={styles.statBox}
                >
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </MotiView>
              ))}
            </View>
          </View>
        </LinearGradient>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <MotiView
              key={item.label}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: index * 100 }}
            >
              <TouchableOpacity 
                style={styles.menuItem} 
                activeOpacity={0.7}
                onPress={item.onPress}
              >
                <LinearGradient
                  colors={item.colors}
                  style={styles.menuIconContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <item.icon color="white" size={20} />
                </LinearGradient>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuDesc}>{item.description}</Text>
                </View>
                <ChevronRight color="#8FBDD7" size={20} />
              </TouchableOpacity>
            </MotiView>
          ))}

          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 500 }}
          >
            <LinearGradient
              colors={["#F0F4F8", "#FFFFFF"]}
              style={styles.premiumCard}
            >
              <View style={styles.premiumIconContainer}>
                <Award color="white" size={24} />
              </View>
              <View style={styles.premiumTextContainer}>
                <Text style={styles.premiumTitle}>Relicus Premium</Text>
                <Text style={styles.premiumDesc}>Unlock exclusive features</Text>
              </View>
              <Button size="sm" onPress={() => {}}>Upgrade</Button>
            </LinearGradient>
          </MotiView>

          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => Alert.alert("Logout", "Are you sure you want to log out from Relicus?", [
              { text: "Cancel", style: "cancel" },
              { text: "Log Out", style: "destructive", onPress: () => {
                authStore.logout();
                router.replace("/landing" as any);
              }}
            ])}
          >
            <LogOut color="#D9534F" size={20} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
            <Text style={styles.copyrightText}>
              © 2026 Relicus. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isEditing}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditing(false)}
      >
        <View style={styles.modalOverlay}>
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>Edit Profile</Text>
            
            <Input
              label="Full Name"
              value={tempName}
              onChangeText={setTempName}
              placeholder="Enter your name"
            />
            
            <Input
              label="Email Address"
              type="email"
              value={tempEmail}
              onChangeText={setTempEmail}
              placeholder="Enter your email"
            />
            
            <Input
              label="Phone Number"
              type="tel"
              value={tempPhone}
              onChangeText={setTempPhone}
              placeholder="Enter your phone number"
            />
            
            <View style={styles.modalButtons}>
              <Button
                variant="outline"
                style={styles.modalButton}
                onPress={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                style={styles.modalButton}
                onPress={() => {
                  updateProfile(tempName, tempEmail, tempPhone);
                  setIsEditing(false);
                }}
              >
                Save
              </Button>
            </View>
          </MotiView>
        </View>
      </Modal>

      {/* Session History Modal */}
      <Modal
        visible={isHistoryOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsHistoryOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={[styles.modalContent, { maxHeight: "80%" }]}
          >
            <View style={styles.historyHeader}>
              <Text style={styles.modalTitle}>Session History</Text>
              <TouchableOpacity onPress={() => setIsHistoryOpen(false)} style={styles.closeHeaderBtn}>
                <Text style={styles.closeHeaderBtnText}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.historyScroll}>
              {bookingHistory.map((booking, index) => (
                <MotiView
                  key={booking.id}
                  from={{ opacity: 0, translateY: 10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: index * 100 }}
                  style={styles.historyItem}
                >
                  <View style={styles.historyItemTop}>
                    <View>
                      <Text style={styles.bookingPractitioner}>{booking.practitioner}</Text>
                      <Text style={styles.bookingSpecialty}>{booking.specialty}</Text>
                    </View>
                    <View style={[
                      styles.statusTag,
                      booking.status === "Upcoming" ? styles.statusUpcoming : styles.statusCompleted
                    ]}>
                      <Text style={[
                        styles.statusTagText,
                        booking.status === "Upcoming" ? styles.statusUpcomingText : styles.statusCompletedText
                      ]}>{booking.status}</Text>
                    </View>
                  </View>

                  <View style={styles.historyItemDivider} />

                  <View style={styles.historyItemBottom}>
                    <Text style={styles.bookingMetaText}>{booking.date} • {booking.time}</Text>
                    <Text style={styles.bookingModeText}>{booking.mode}</Text>
                  </View>
                </MotiView>
              ))}
            </ScrollView>

            <Button
              style={{ marginTop: 16 }}
              onPress={() => setIsHistoryOpen(false)}
            >
              Done
            </Button>
          </MotiView>
        </View>
      </Modal>
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
    padding: 24,
    paddingBottom: 64,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  editButton: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    alignItems: "center",
  },
  avatarContainer: {
    width: 100,
    height: 100,
    backgroundColor: "white",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#1C4966",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  menuContainer: {
    padding: 24,
    marginTop: -40,
    gap: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 2,
  },
  menuDesc: {
    fontSize: 13,
    color: "#8FBDD7",
  },
  premiumCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.1)",
    marginTop: 8,
  },
  premiumIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "#1C4966",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  premiumTextContainer: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 2,
  },
  premiumDesc: {
    fontSize: 13,
    color: "#5F8B70",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 20,
    borderRadius: 24,
    backgroundColor: "rgba(217, 83, 79, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(217, 83, 79, 0.1)",
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#D9534F",
  },
  footer: {
    alignItems: "center",
    marginTop: 24,
  },
  versionText: {
    fontSize: 14,
    color: "#8FBDD7",
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: "rgba(143, 189, 215, 0.6)",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(28, 73, 102, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#FFFFF0",
    borderRadius: 24,
    padding: 24,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  closeHeaderBtn: {
    padding: 4,
  },
  closeHeaderBtnText: {
    color: "#5F8B70",
    fontWeight: "bold",
    fontSize: 16,
  },
  historyScroll: {
    width: "100%",
  },
  historyItem: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
  },
  historyItemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  bookingPractitioner: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 2,
  },
  bookingSpecialty: {
    fontSize: 12,
    color: "#5F8B70",
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusUpcoming: {
    backgroundColor: "rgba(28, 73, 102, 0.1)",
  },
  statusCompleted: {
    backgroundColor: "rgba(95, 139, 112, 0.15)",
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  statusUpcomingText: {
    color: "#1C4966",
  },
  statusCompletedText: {
    color: "#5F8B70",
  },
  historyItemDivider: {
    height: 1,
    backgroundColor: "rgba(28, 73, 102, 0.05)",
    marginVertical: 12,
  },
  historyItemBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bookingMetaText: {
    fontSize: 12,
    color: "#8FBDD7",
  },
  bookingModeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1C4966",
  },
});
