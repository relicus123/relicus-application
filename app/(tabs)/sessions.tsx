import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { Calendar, Clock, Video, TrendingUp, BookOpen, CheckCircle, PlusCircle, Heart } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/Button";
import { useAppContext } from "../../components/AppContext";

export default function SessionsScreen() {
  const router = useRouter();
  const { bookings } = useAppContext();

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
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#1C4966", "#5F8B70"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerBar}>
            <View>
              <Text style={styles.headerTitle}>My Sessions & Wellness</Text>
              <Text style={styles.headerSubtitle}>Track therapy appointments and progress</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/counselling/book" as any)}
              style={styles.bookBtn}
              activeOpacity={0.8}
            >
              <PlusCircle color="white" size={20} />
              <Text style={styles.bookBtnText}>Book</Text>
            </TouchableOpacity>
          </View>
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
                <Text style={styles.streakLabel}>Wellness Streak</Text>
                <Text style={styles.streakValue}>7 Days Consistent 🔥</Text>
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
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Upcoming Sessions</Text>
              <TouchableOpacity onPress={() => router.push("/counselling/book" as any)}>
                <Text style={styles.seeAllText}>New Booking</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sessionsList}>
              {bookings.map((session) => (
                <View key={session.id} style={styles.sessionItem}>
                  <View style={styles.sessionHeader}>
                    <View>
                      <Text style={styles.sessionTherapist}>{session.practitioner}</Text>
                      <Text style={styles.sessionType}>{session.specialty} • {session.mode}</Text>
                    </View>
                    {session.status === "Upcoming" && (
                      <View style={styles.badgeToday}>
                        <Text style={styles.badgeTodayText}>Upcoming</Text>
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

                  {session.status === "Upcoming" && (
                    <Button
                      onPress={() => router.push({ pathname: "/counselling/video" as any, params: { id: session.id, name: session.practitioner } })}
                      style={styles.joinBtn}
                      size="sm"
                    >
                      <Video color="white" size={16} />
                      <Text style={{ marginLeft: 6, color: "white", fontWeight: "bold" }}>Join Video Room</Text>
                    </Button>
                  )}
                </View>
              ))}

              {bookings.length === 0 && (
                <View style={{ alignItems: "center", paddingVertical: 20 }}>
                  <Heart size={36} color="#8FBDD7" />
                  <Text style={{ marginTop: 8, color: "#8FBDD7", fontWeight: "500" }}>No sessions booked yet</Text>
                </View>
              )}
            </View>
          </MotiView>

          {/* Mood Tracker */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Weekly Mood Tracker</Text>
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
              <Text style={styles.cardTitle}>Mindfulness Tasks</Text>
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

          {/* Journal Entry Card */}
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
              <Text style={styles.journalTitle}>Gratitude Journal</Text>
              <Text style={styles.journalDesc}>Express your reflections and mood</Text>
            </View>
            <Button size="sm" variant="outline" onPress={() => router.push("/mindfulness" as any)}>
              Open
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
    backgroundColor: "#FDF7FF",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 24,
    paddingBottom: 36,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 4,
  },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  bookBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13,
  },
  contentContainer: {
    padding: 20,
    marginTop: -16,
    gap: 16,
  },
  streakCard: {
    borderRadius: 24,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  streakGradient: {
    padding: 18,
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
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  streakIconBox: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.08)",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C4966",
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#5F8B70",
  },
  taskCounter: {
    fontSize: 13,
    color: "#8FBDD7",
    fontWeight: "bold",
  },
  sessionsList: {
    gap: 12,
  },
  sessionItem: {
    backgroundColor: "rgba(143, 189, 215, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(143, 189, 215, 0.2)",
    borderRadius: 18,
    padding: 14,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
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
    backgroundColor: "rgba(95, 139, 112, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeTodayText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#5F8B70",
  },
  sessionMetaRow: {
    flexDirection: "row",
    gap: 16,
    marginVertical: 8,
  },
  metaCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: "#1C4966",
  },
  joinBtn: {
    marginTop: 8,
    backgroundColor: "#1C4966",
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 110,
    marginTop: 12,
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
    gap: 10,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    gap: 12,
  },
  taskCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
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
    fontSize: 13,
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
    padding: 14,
  },
  journalIconBox: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(143, 189, 215, 0.18)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  journalTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1C4966",
  },
  journalDesc: {
    fontSize: 12,
    color: "#5F8B70",
    marginTop: 2,
  },
});
