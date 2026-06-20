import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { Calendar, Users, FileText, Video, Clock, TrendingUp, ArrowLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/Button";

const { width } = Dimensions.get("window");

export default function TherapistDashboard() {
  const router = useRouter();

  const todayAppointments = [
    {
      id: 1,
      client: "John Doe",
      time: "09:00 AM",
      type: "Video",
      status: "upcoming",
    },
    {
      id: 2,
      client: "Jane Smith",
      time: "11:00 AM",
      type: "Chat",
      status: "upcoming",
    },
    {
      id: 3,
      client: "Mike Johnson",
      time: "02:00 PM",
      type: "Phone",
      status: "completed",
    },
    {
      id: 4,
      client: "Sarah Williams",
      time: "04:00 PM",
      type: "Video",
      status: "upcoming",
    },
  ];

  const stats = [
    { label: "Today's Sessions", value: "4", icon: Calendar, colors: ["#1C4966", "#5F8B70"] },
    { label: "Total Clients", value: "32", icon: Users, colors: ["#5F8B70", "#8FBDD7"] },
    { label: "This Week", value: "18", icon: TrendingUp, colors: ["#8FBDD7", "#DDEEE3"] },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#1C4966", "#5F8B70"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerBar}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ArrowLeft color="white" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Therapist Panel</Text>
          </View>
          <Text style={styles.headerSubtitle}>Dr. Sarah Johnson</Text>
        </LinearGradient>

        <View style={styles.contentContainer}>
          {/* Stats Grid */}
          <View style={styles.statsRow}>
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const isDarkText = stat.colors[1] === "#DDEEE3";
              return (
                <MotiView
                  key={stat.label}
                  from={{ opacity: 0, translateY: 15 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: index * 100 }}
                  style={styles.statCol}
                >
                  <LinearGradient
                    colors={stat.colors}
                    style={styles.statGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Icon color={isDarkText ? "#1C4966" : "white"} size={20} style={{ opacity: 0.85 }} />
                    <Text style={[styles.statValue, { color: isDarkText ? "#1C4966" : "white" }]}>
                      {stat.value}
                    </Text>
                    <Text style={[styles.statLabel, { color: isDarkText ? "#1C4966" : "rgba(255,255,255,0.9)" }]}>
                      {stat.label}
                    </Text>
                  </LinearGradient>
                </MotiView>
              );
            })}
          </View>

          {/* Today's Appointments */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300 }}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Today's Appointments</Text>
              <Text style={styles.cardMeta}>
                {todayAppointments.filter((a) => a.status === "upcoming").length} upcoming
              </Text>
            </View>

            <View style={styles.appointmentList}>
              {todayAppointments.map((appointment) => {
                const isCompleted = appointment.status === "completed";
                const initials = appointment.client
                  .split(" ")
                  .map((n) => n[0])
                  .join("");

                return (
                  <View
                    key={appointment.id}
                    style={[
                      styles.appointmentItem,
                      isCompleted ? styles.completedItem : styles.upcomingItem,
                    ]}
                  >
                    <View style={styles.appointmentRow}>
                      <View style={styles.avatarMini}>
                        <Text style={styles.avatarMiniText}>{initials}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.clientName}>{appointment.client}</Text>
                        <Text style={styles.clientMeta}>{appointment.type} Session</Text>
                      </View>

                      {isCompleted ? (
                        <View style={styles.badgeCompleted}>
                          <Text style={styles.badgeCompletedText}>Completed</Text>
                        </View>
                      ) : (
                        <View style={styles.timeBadge}>
                          <Clock color="#1C4966" size={14} />
                          <Text style={styles.timeBadgeText}>{appointment.time}</Text>
                        </View>
                      )}
                    </View>

                    {!isCompleted && (
                      <View style={styles.actionRow}>
                        <Button
                          size="sm"
                          onPress={() => router.push({ pathname: "/counselling/video" as any, params: { id: String(appointment.id), name: appointment.client } })}
                          style={styles.actionBtn}
                        >
                          Join Call
                        </Button>
                        <Button size="sm" variant="outline" onPress={() => {}} style={styles.actionBtn}>
                          Notes
                        </Button>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </MotiView>

          {/* Quick Actions Grid */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400 }}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity style={styles.gridBtn} activeOpacity={0.8}>
                <LinearGradient colors={["#1C4966", "#5F8B70"]} style={styles.btnGradient}>
                  <Users color="white" size={24} />
                  <Text style={styles.btnTitle}>Client List</Text>
                  <Text style={styles.btnDesc}>View all clients</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.gridBtn} activeOpacity={0.8}>
                <LinearGradient colors={["#5F8B70", "#8FBDD7"]} style={styles.btnGradient}>
                  <FileText color="white" size={24} />
                  <Text style={styles.btnTitle}>Case Notes</Text>
                  <Text style={styles.btnDesc}>Session records</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.gridBtn} activeOpacity={0.8}>
                <LinearGradient colors={["#8FBDD7", "#DDEEE3"]} style={styles.btnGradient}>
                  <Video color="#1C4966" size={24} />
                  <Text style={[styles.btnTitle, { color: "#1C4966" }]}>Recordings</Text>
                  <Text style={[styles.btnDesc, { color: "rgba(28, 73, 102, 0.8)" }]}>Past sessions</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.gridBtn} activeOpacity={0.8}>
                <LinearGradient colors={["#5F8B70", "#1C4966"]} style={styles.btnGradient}>
                  <Calendar color="white" size={24} />
                  <Text style={styles.btnTitle}>Schedule</Text>
                  <Text style={styles.btnDesc}>Manage calendar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </MotiView>

          {/* Pending Alerts Banner */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 500 }}
            style={styles.bannerAlert}
          >
            <View style={styles.alertIconBox}>
              <FileText color="white" size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Pending Follow-Ups</Text>
              <Text style={styles.alertDesc}>3 clients need review feedback</Text>
            </View>
            <Button size="sm" onPress={() => {}}>Review</Button>
          </MotiView>
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
    paddingBottom: 40,
  },
  header: {
    padding: 24,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.85)",
    marginLeft: 60,
  },
  contentContainer: {
    padding: 24,
    marginTop: -20,
    gap: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  statCol: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  statGradient: {
    padding: 16,
    height: 110,
    justifyContent: "space-between",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "500",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C4966",
  },
  cardMeta: {
    fontSize: 12,
    color: "#8FBDD7",
    fontWeight: "500",
  },
  appointmentList: {
    gap: 12,
  },
  appointmentItem: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  upcomingItem: {
    backgroundColor: "rgba(143, 189, 215, 0.05)",
    borderColor: "rgba(143, 189, 215, 0.2)",
  },
  completedItem: {
    backgroundColor: "#F5F7FA",
    borderColor: "transparent",
    opacity: 0.65,
  },
  appointmentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarMini: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DDEEE3",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarMiniText: {
    color: "#1C4966",
    fontWeight: "bold",
    fontSize: 14,
  },
  clientName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1C4966",
  },
  clientMeta: {
    fontSize: 12,
    color: "#5F8B70",
    marginTop: 2,
  },
  badgeCompleted: {
    backgroundColor: "rgba(92, 184, 92, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeCompletedText: {
    color: "#5CB85C",
    fontSize: 10,
    fontWeight: "bold",
  },
  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeBadgeText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1C4966",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(28, 73, 102, 0.05)",
    paddingTop: 12,
  },
  actionBtn: {
    flex: 1,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  gridBtn: {
    width: "48%",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  btnGradient: {
    padding: 16,
    height: 110,
    justifyContent: "flex-end",
  },
  btnTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "white",
    marginTop: 12,
    marginBottom: 2,
  },
  btnDesc: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.8)",
  },
  bannerAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(28, 73, 102, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.1)",
    borderRadius: 20,
    padding: 16,
  },
  alertIconBox: {
    width: 44,
    height: 44,
    backgroundColor: "#1C4966",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1C4966",
  },
  alertDesc: {
    fontSize: 12,
    color: "#5F8B70",
    marginTop: 2,
  },
});
