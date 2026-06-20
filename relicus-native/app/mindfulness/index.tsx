import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { Wind, Heart, Activity, BookOpen, Smile, CheckSquare, Play, Pause, ArrowLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/Button";

const { width } = Dimensions.get("window");

export default function Mindfulness() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [moodText, setMoodText] = useState("");

  const activities = [
    {
      title: "Meditation",
      icon: Wind,
      description: "5-minute guided session",
      duration: "5 min",
      colors: ["#8FBDD7", "#DDEEE3"],
    },
    {
      title: "Breathing",
      icon: Heart,
      description: "Deep breathing exercise",
      duration: "3 min",
      colors: ["#DDEEE3", "#5F8B70"],
    },
    {
      title: "Yoga",
      icon: Activity,
      description: "Morning yoga routine",
      duration: "15 min",
      colors: ["#5F8B70", "#8FBDD7"],
    },
  ];

  const affirmations = [
    "I am capable and strong",
    "Today is full of possibilities",
    "I choose peace and calm",
  ];

  const todoItems = [
    { id: 1, text: "Morning meditation", completed: true },
    { id: 2, text: "Gratitude journaling", completed: true },
    { id: 3, text: "Evening walk", completed: false },
    { id: 4, text: "Read before bed", completed: false },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#8FBDD7", "#DDEEE3"]}
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
              <ArrowLeft color="#1C4966" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mindfulness</Text>
          </View>
          <Text style={styles.headerSubtitle}>Find your inner peace</Text>
        </LinearGradient>

        <View style={styles.contentContainer}>
          {/* Audio Player Card */}
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.playerCard}
          >
            <View style={styles.playerContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.playerLabel}>Currently Playing</Text>
                <Text style={styles.playerTitle}>Ocean Waves</Text>
                <View style={styles.progressBarRow}>
                  <Text style={styles.progressTimeText}>12:34</Text>
                  <View style={styles.progressBar}>
                    <View style={styles.progressBarFill} />
                  </View>
                  <Text style={styles.progressTimeText}>20:00</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setIsPlaying(!isPlaying)}
                style={styles.playBtn}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#8FBDD7", "#5F8B70"]}
                  style={styles.playGradient}
                >
                  {isPlaying ? (
                    <Pause color="white" size={28} fill="white" />
                  ) : (
                    <Play color="white" size={28} fill="white" />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </MotiView>

          {/* Daily Activities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Activities</Text>
            <View style={styles.activitiesList}>
              {activities.map((activity, index) => {
                const Icon = activity.icon;
                const isDarkText = activity.colors[0] === "#8FBDD7" || activity.colors[0] === "#DDEEE3";
                return (
                  <MotiView
                    key={activity.title}
                    from={{ opacity: 0, translateY: 15 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: index * 100 }}
                    style={styles.activityCol}
                  >
                    <LinearGradient
                      colors={activity.colors}
                      style={styles.activityGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.activityRow}>
                        <View style={styles.activityIconBox}>
                          <Icon color="#1C4966" size={24} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.activityTitle, { color: "#1C4966" }]}>
                            {activity.title}
                          </Text>
                          <Text style={[styles.activityDesc, { color: "rgba(28, 73, 102, 0.85)" }]}>
                            {activity.description}
                          </Text>
                        </View>
                        <Button
                          size="sm"
                          variant="outline"
                          onPress={() => {}}
                          style={styles.durationBtn}
                        >
                          {activity.duration}
                        </Button>
                      </View>
                    </LinearGradient>
                  </MotiView>
                );
              })}
            </View>
          </View>

          {/* Daily Affirmations */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 350 }}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Smile color="#5F8B70" size={20} />
              <Text style={styles.cardTitleInline}>Daily Affirmations</Text>
            </View>
            <View style={styles.affirmationsList}>
              {affirmations.map((affirmation, index) => (
                <View key={index} style={styles.affirmationItem}>
                  <Text style={styles.affirmationText}>{affirmation}</Text>
                </View>
              ))}
            </View>
          </MotiView>

          {/* Mood Journal */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 450 }}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <BookOpen color="#5F8B70" size={20} />
              <Text style={styles.cardTitleInline}>Mood Journal</Text>
            </View>
            <TextInput
              value={moodText}
              onChangeText={setMoodText}
              placeholder="How are you feeling today?"
              placeholderTextColor="#8FBDD7"
              multiline
              numberOfLines={4}
              style={styles.journalInput}
            />
            <Button
              onPress={() => {
                setMoodText("");
              }}
              style={styles.saveBtn}
            >
              Save Entry
            </Button>
          </MotiView>

          {/* Today's Tasks */}
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 550 }}
            style={styles.card}
          >
            <View style={styles.cardHeaderSpace}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <CheckSquare color="#5F8B70" size={20} />
                <Text style={styles.cardTitleInline}>Today's Tasks</Text>
              </View>
              <Text style={styles.todoCounter}>
                {todoItems.filter((i) => i.completed).length}/{todoItems.length}
              </Text>
            </View>

            <View style={styles.todoList}>
              {todoItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.todoItem}
                  activeOpacity={0.8}
                >
                  <View style={[styles.todoCheck, item.completed && styles.todoChecked]} />
                  <Text style={[styles.todoText, item.completed && styles.todoTextCompleted]}>
                    {item.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1C4966",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(28, 73, 102, 0.8)",
    marginLeft: 60,
  },
  contentContainer: {
    padding: 24,
    marginTop: -20,
    gap: 16,
  },
  playerCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
  },
  playerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  playerLabel: {
    fontSize: 12,
    color: "rgba(28, 73, 102, 0.6)",
    marginBottom: 4,
  },
  playerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 12,
  },
  progressBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressTimeText: {
    fontSize: 11,
    color: "rgba(28, 73, 102, 0.6)",
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#DDEEE3",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    width: "50%",
    height: "100%",
    backgroundColor: "#8FBDD7",
    borderRadius: 2,
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    marginLeft: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  playGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C4966",
    paddingHorizontal: 4,
  },
  activitiesList: {
    gap: 12,
  },
  activityCol: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  activityGradient: {
    padding: 16,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  activityIconBox: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  activityDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  durationBtn: {
    backgroundColor: "white",
    borderColor: "transparent",
    paddingHorizontal: 12,
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
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  cardHeaderSpace: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardTitleInline: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C4966",
  },
  todoCounter: {
    fontSize: 14,
    color: "rgba(28, 73, 102, 0.6)",
    fontWeight: "500",
  },
  affirmationsList: {
    gap: 10,
  },
  affirmationItem: {
    padding: 12,
    backgroundColor: "rgba(221, 238, 227, 0.3)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  affirmationText: {
    color: "#1C4966",
    fontWeight: "600",
    fontSize: 14,
    textAlign: "center",
  },
  journalInput: {
    backgroundColor: "#FFFFF0",
    borderWidth: 2,
    borderColor: "#DDEEE3",
    borderRadius: 16,
    padding: 16,
    minHeight: 110,
    fontSize: 15,
    color: "#1C4966",
    textAlignVertical: "top",
    marginBottom: 12,
  },
  saveBtn: {
    width: "100%",
  },
  todoList: {
    gap: 12,
  },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F5F7FA",
    borderRadius: 16,
    gap: 12,
  },
  todoCheck: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#5F8B70",
  },
  todoChecked: {
    backgroundColor: "#5F8B70",
  },
  todoText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1C4966",
    flex: 1,
  },
  todoTextCompleted: {
    textDecorationLine: "line-through",
    color: "rgba(28, 73, 102, 0.4)",
  },
});
