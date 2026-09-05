import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { Calendar, Clock, Video, TrendingUp, BookOpen, CheckCircle, ArrowLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/Button";

const { width } = Dimensions.get("window");

export default function ClientDashboard() {
  const router = useRouter();

  const upcomingSessions = [
    {
      id: 1,
      therapist: "Dr. Sarah Johnson",
      type: "Video Session",
      date: "Today",
      time: "3:00 PM",
      status: "upcoming",
    },
    {
      id: 2,
      therapist: "Dr. Rajesh Kumar",
      type: "Chat Session",
      date: "Tomorrow",
      time: "10:00 AM",
      status: "scheduled",
    },
  ];

  const moodData = [
    { day: "Mon", mood: 7 },
    { day: "Tue", mood: 6 },
    { day: "Wed", mood: 8 },
    { day: "Thu", mood: 7 },
    { day: "Fri", mood: 9 },
    { day: "Sat", mood: 8 },
    { day: "Sun", mood: 9 },
  ];

  const [tasks, setTasks] = useState([
    { id: 1, title: "Daily gratitude journal", completed: true },
    { id: 2, title: "10-minute meditation", completed: true },
    { id: 3, title: "Evening walk", completed: false },
    { id: 4, title: "Read 20 pages", completed: false },
  ]);

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

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
            <Text style={styles.headerTitle}>My Journey</Text>
          </View>
          <Text style={styles.headerSubtitle}>Track your mental wellness progress</Text>
        </LinearGradient>

        <View style={styles.contentContainer}>
          {/* Streak Card */}
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.streakCard}
          >
            <LinearGradient
              colors={["#5F8B70", "#1C4966"]}
              style={styles.streakGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View>
                <Text style={styles.streakLabel}>Current Streak</Text>
                <Text style={styles.streakValue}>7 days 🔥</Text>
              </View>
              <View style={styles.streakIconBox}>
                <TrendingUp color="white" size={28} />
              </View>
            </LinearGradient>
          </MotiView>

          {/* Upcoming Sessions */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 100 }}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Upcoming Sessions</Text>
            <View style={styles.sessionsList}>
              {upcomingSessions.map((session, index) => (
                <View key={session.id} style={styles.sessionItem}>
                  <View style={styles.sessionHeader}>
                    <View>
                      <Text style={styles.sessionTherapist}>{session.therapist}</Text>
                      <Text style={styles.sessionType}>{session.type}</Text>
                    </View>
                    {session.status === "upcoming" && (
                      <View style={styles.badgeToday}>
                        <Text style={styles.badgeTodayText}>Today</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.sessionMetaRow}>
                    <View style={styles.metaCol}>
                      <Calendar color="#8FBDD7" size={14} />
                      <Text style={styles.metaText}>{session.date}</Text>
                    </View>
                    <View style={styles.metaCol}>
                      <Clock color="#8FBDD7" size={14} />
                      <Text style={styles.metaText}>{session.time}</Text>
                    </View>
                  </View>

                  {session.status === "upcoming" && (
                    <Button
                      onPress={() => router.push({ pathname: "/counselling/video" as any, params: { id: session.id, name: session.therapist } })}
                      style={styles.joinBtn}
                      size="sm"
                    >
                      <Video color="white" size={16} />
                      <Text style={{ marginLeft: 6, color: "white", fontWeight: "bold" }}>Join Session</Text>
                    </Button>
                  )}
                </View>
              ))}
            </View>
          </MotiView>

          {/* Mood Tracker */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Mood Tracker</Text>
            <View style={styles.chartContainer}>
              {moodData.map((item, index) => {
                const barHeight = item.mood * 10;
                return (
                  <View key={item.day} style={styles.chartCol}>
                    <MotiView
                      from={{ height: 0 }}
                      animate={{ height: barHeight }}
                      transition={{ type: "timing", duration: 800, delay: index * 50 }}
                    >
                      <LinearGradient
                        colors={["#5F8B70", "#1C4966"]}
                        style={styles.chartBar}
                      />
                    </MotiView>
                    <Text style={styles.chartDay}>{item.day}</Text>
                  </View>
                );
              })}
            </View>
          </MotiView>

          {/* Daily Tasks */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300 }}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Daily Tasks</Text>
              <Text style={styles.taskCounter}>
                {tasks.filter((t) => t.completed).length}/{tasks.length}
              </Text>
            </View>

            <View style={styles.taskList}>
              {tasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  onPress={() => toggleTask(task.id)}
                  style={styles.taskItem}
                  activeOpacity={0.8}
                >
                  <View style={[styles.taskCheck, task.completed && styles.taskChecked]}>
                    {task.completed && <CheckCircle color="white" size={16} />}
                  </View>
                  <Text style={[styles.taskText, task.completed && styles.taskTextCompleted]}>
                    {task.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </MotiView>

          {/* Journal entry card */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400 }}
            style={styles.journalCard}
          >
            <View style={styles.journalIconBox}>
              <BookOpen color="#1C4966" size={24} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.journalTitle}>Journal Entry</Text>
              <Text style={styles.journalDesc}>Reflect on your day</Text>
            </View>
            <Button size="sm" variant="outline" onPress={() => {}}>
              Write
            </Button>
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
  streakCard: {
    borderRadius: 24,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  streakGradient: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streakLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  streakValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  streakIconBox: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: 16,
  },
  taskCounter: {
    fontSize: 14,
    color: "#8FBDD7",
    fontWeight: "bold",
  },
  sessionsList: {
    gap: 12,
  },
  sessionItem: {
    backgroundColor: "rgba(143, 189, 215, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(143, 189, 215, 0.2)",
    padding: 16,
    borderRadius: 20,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  sessionTherapist: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1C4966",
  },
  sessionType: {
    fontSize: 12,
    color: "#5F8B70",
    marginTop: 2,
  },
  badgeToday: {
    backgroundColor: "rgba(92, 184, 92, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeTodayText: {
    color: "#5CB85C",
    fontSize: 10,
    fontWeight: "bold",
  },
  sessionMetaRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  metaCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: "#8FBDD7",
    fontWeight: "500",
  },
  joinBtn: {
    width: "100%",
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  chartCol: {
    alignItems: "center",
    flex: 1,
  },
  chartBar: {
    width: 14,
    borderRadius: 8,
    height: "100%",
  },
  chartDay: {
    fontSize: 11,
    color: "#8FBDD7",
    marginTop: 8,
    fontWeight: "500",
  },
  taskList: {
    gap: 12,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F5F7FA",
    borderRadius: 16,
    gap: 12,
  },
  taskCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#5CB85C",
    alignItems: "center",
    justifyContent: "center",
  },
  taskChecked: {
    backgroundColor: "#5CB85C",
    borderColor: "#5CB85C",
  },
  taskText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1C4966",
    flex: 1,
  },
  taskTextCompleted: {
    textDecorationLine: "line-through",
    color: "rgba(28, 73, 102, 0.4)",
  },
  journalCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(143, 189, 215, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(143, 189, 215, 0.2)",
    borderRadius: 20,
    padding: 16,
  },
  journalIconBox: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(143, 189, 215, 0.18)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  journalTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1C4966",
  },
  journalDesc: {
    fontSize: 12,
    color: "#5F8B70",
    marginTop: 2,
  },
});
