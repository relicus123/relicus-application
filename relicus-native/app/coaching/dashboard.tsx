import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import {
  ArrowLeft,
  BookOpen,
  Video,
  Award,
  FileText,
  MessageSquare,
  BarChart,
  ChevronRight,
  Send,
  HelpCircle,
  Clock,
  CheckCircle,
} from "lucide-react-native";

import { useCoachingStore } from "../../store/coaching.store";
import { EXAMS } from "../../constants/coaching/exams";

const { width } = Dimensions.get("window");

// Mock exam streams definitions
const EXAM_STREAMS: Record<string, string[]> = {
  "UGC-NET": ["Computer Science", "Commerce", "Management", "English", "Education"],
  GATE: ["Computer Science", "Electronics", "Mechanical", "Civil", "Electrical"],
  JEE: ["Mathematics", "Physics", "Chemistry"],
  NEET: ["Biology", "Physics", "Chemistry"],
  CUET: ["Domain Subjects", "General Test", "Languages"],
  EAMCET: ["Mathematics", "Physics", "Chemistry"],
  ICET: ["Analytical Ability", "Mathematical Ability", "Communication Ability"],
};

export default function CoachingDashboard() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const examType = params.examType as string;

  const exam = useMemo(() => EXAMS.find((e) => e.type === examType), [examType]);
  const streams = useMemo(() => EXAM_STREAMS[examType] || [], [examType]);

  const [selectedStream, setSelectedStream] = useState(streams[0] || "");
  const [activeTab, setActiveTab] = useState<"overview" | "chapters" | "live" | "tests" | "pyqs" | "doubt" | "analytics">("overview");

  const [doubtText, setDoubtText] = useState("");
  const { doubts, addDoubt, learningStreak, testAttempts, addTestAttempt } = useCoachingStore();

  const handleBack = () => {
    router.back();
  };

  const handleAddDoubt = () => {
    if (!doubtText.trim()) return;
    addDoubt({
      id: Math.random().toString(),
      examType: examType as any,
      title: `${selectedStream} Doubt`,
      description: doubtText,
      status: "open",
      createdAt: new Date().toISOString(),
      responses: [],
    });
    setDoubtText("");
    alert("Your doubt has been submitted to the Doubt Desk!");
  };

  const handleStartTest = (testName: string) => {
    const score = Math.floor(Math.random() * 40) + 60; // Mock score 60-100%
    addTestAttempt({
      id: Math.random().toString(),
      testId: Math.random().toString(),
      testName: testName,
      examType: examType as any,
      date: new Date().toISOString(),
      score,
      maxScore: 100,
      accuracy: score,
      rank: Math.floor(Math.random() * 50) + 1,
      percentile: score,
      timeTaken: 5400,
      correctCount: score,
      incorrectCount: 100 - score,
      unattemptedCount: 0,
      answers: [],
      topicAnalysis: [],
      sectionAnalysis: [],
    });
    alert(`Mock test complete! You scored ${score}%`);
  };

  const currentDoubts = useMemo(() => {
    return doubts.filter((d) => d.examType === examType && d.title.startsWith(selectedStream));
  }, [doubts, examType, selectedStream]);

  if (!exam) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Exam details not found.</Text>
        <TouchableOpacity onPress={handleBack} style={styles.btn}>
          <Text style={styles.btnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFF0" }}>
      {/* Header */}
      <LinearGradient
        colors={["#1C4966", "#5F8B70"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{exam.name} Prep Hub</Text>
            <Text style={styles.headerSubtitle}>Streak: {learningStreak} days 🔥</Text>
          </View>
        </View>

        {/* Stream Selector */}
        {streams.length > 0 && (
          <View style={styles.streamSelector}>
            <Text style={styles.streamSelectorLabel}>Active Stream / Subject:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.streamScroll}>
              {streams.map((stream) => {
                const active = selectedStream === stream;
                return (
                  <TouchableOpacity
                    key={stream}
                    onPress={() => setSelectedStream(stream)}
                    style={[styles.streamChip, active && styles.streamChipActive]}
                  >
                    <Text style={[styles.streamChipText, active && styles.streamChipTextActive]}>
                      {stream}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </LinearGradient>

      {/* Tabs list */}
      <View style={styles.tabsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {[
            { id: "overview", label: "Overview", icon: BookOpen },
            { id: "chapters", label: "Chapters", icon: BookOpen },
            { id: "live", label: "Live", icon: Video },
            { id: "tests", label: "Mock Tests", icon: Award },
            { id: "pyqs", label: "PYQs", icon: FileText },
            { id: "doubt", label: "Doubts Desk", icon: MessageSquare },
            { id: "analytics", label: "Analytics", icon: BarChart },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id as any)}
                style={[styles.tabChip, active && styles.tabChipActive]}
              >
                <Text style={[styles.tabChipText, active && styles.tabChipTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Render Tab Contents */}
        {activeTab === "overview" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Daily Study Goals</Text>
              <View style={styles.goalRow}>
                <CheckCircle size={18} color="#5F8B70" />
                <Text style={styles.goalText}>Complete 1 chapter video lesson in {selectedStream}</Text>
              </View>
              <View style={styles.goalRow}>
                <HelpCircle size={18} color="#8FBDD7" />
                <Text style={styles.goalText}>Attempt a practice quiz on {selectedStream}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Syllabus Coverage</Text>
              <Text style={styles.subText}>Active Subject: {selectedStream}</Text>
              <View style={styles.progressBarWrapper}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: "45%" }]} />
                </View>
                <Text style={styles.progressPercentText}>45% of Syllabus Covered</Text>
              </View>
            </View>
          </MotiView>
        )}

        {activeTab === "chapters" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {["Unit 1: Foundations & Core Concepts", "Unit 2: Intermediate Theory & Structures", "Unit 3: Applications & Solving Methods", "Unit 4: Advanced Systems & Case Studies"].map((unit, idx) => (
              <View key={unit} style={styles.card}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={styles.cardTitle}>{unit}</Text>
                  <Text style={styles.badgeText}>Completed {idx === 0 ? "100%" : idx === 1 ? "40%" : "0%"}</Text>
                </View>
                <View style={{ marginTop: 12, gap: 10 }}>
                  {[`Topic ${idx * 3 + 1}: Core principles & history`, `Topic ${idx * 3 + 2}: Analysis frameworks`, `Topic ${idx * 3 + 3}: Practical labs`].map((topic) => (
                    <TouchableOpacity key={topic} style={styles.listItem}>
                      <BookOpen size={16} color="#1C4966" />
                      <Text style={styles.listItemText}>{topic}</Text>
                      <ChevronRight size={14} color="#8FBDD7" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </MotiView>
        )}

        {activeTab === "live" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Upcoming Live Classes</Text>
              <View style={styles.classCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.classSubject}>{selectedStream}</Text>
                  <Text style={styles.classTopic}>Syllabus Core Concepts - Masterclass</Text>
                  <Text style={styles.classTime}>Today, 4:00 PM</Text>
                </View>
                <TouchableOpacity style={styles.joinBtn}>
                  <Text style={styles.joinBtnText}>Join</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.classCard, { marginTop: 12 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.classSubject}>{selectedStream}</Text>
                  <Text style={styles.classTopic}>Previous Year Question Solving Seminar</Text>
                  <Text style={styles.classTime}>Tomorrow, 11:00 AM</Text>
                </View>
                <TouchableOpacity style={[styles.joinBtn, { backgroundColor: "#8FBDD7" }]}>
                  <Text style={styles.joinBtnText}>Notify</Text>
                </TouchableOpacity>
              </View>
            </View>
          </MotiView>
        )}

        {activeTab === "tests" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Practice Mock Exams</Text>
              {[`Full Mock Test 1 - ${selectedStream}`, `Full Mock Test 2 - ${selectedStream}`, `Subjective Unit Test 1 - ${selectedStream}`].map((testName) => (
                <View key={testName} style={styles.testCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.testName}>{testName}</Text>
                    <Text style={styles.testMeta}>100 Questions • 180 Minutes</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleStartTest(testName)} style={styles.startTestBtn}>
                    <Text style={styles.startTestBtnText}>Start</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </MotiView>
        )}

        {activeTab === "pyqs" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Previous Year Question Papers</Text>
              {[2025, 2024, 2023, 2022].map((year) => (
                <TouchableOpacity key={year} style={styles.listItem} onPress={() => alert(`Downloading PDF: PYQ ${year} Paper...`)}>
                  <FileText size={16} color="#5F8B70" />
                  <Text style={styles.listItemText}>{selectedStream} - PYQ Paper {year}</Text>
                  <Text style={{ fontSize: 11, color: "#8FBDD7" }}>PDF 📥</Text>
                </TouchableOpacity>
              ))}
            </View>
          </MotiView>
        )}

        {activeTab === "doubt" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Ask a Doubt</Text>
              <Text style={styles.subText}>Write your question below. An expert mentor will answer within 24 hours.</Text>
              <View style={styles.doubtInputRow}>
                <TextInput
                  placeholder="Type your question..."
                  placeholderTextColor="#8FBDD7"
                  value={doubtText}
                  onChangeText={setDoubtText}
                  style={styles.doubtInput}
                />
                <TouchableOpacity onPress={handleAddDoubt} style={styles.sendDoubtBtn}>
                  <Send size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Doubts Queue</Text>
              {currentDoubts.length > 0 ? (
                currentDoubts.map((doubt) => (
                  <View key={doubt.id} style={styles.doubtItem}>
                    <Text style={styles.doubtQuestion}>{doubt.description}</Text>
                    <View style={styles.doubtMetaRow}>
                      <Text style={styles.doubtStatusText}>Status: {doubt.status.toUpperCase()}</Text>
                      <Text style={styles.doubtTimeText}>{new Date(doubt.createdAt).toLocaleDateString()}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No doubts submitted yet for {selectedStream}.</Text>
              )}
            </View>
          </MotiView>
        )}

        {activeTab === "analytics" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Test History</Text>
              {testAttempts.length > 0 ? (
                testAttempts.map((attempt) => (
                  <View key={attempt.testId} style={styles.testAttemptItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.testAttemptName}>{attempt.testName}</Text>
                      <Text style={styles.testAttemptDate}>{new Date(attempt.date).toLocaleDateString()}</Text>
                    </View>
                    <Text style={styles.testAttemptScore}>{attempt.score}%</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No tests attempted yet. Go to Mock Tests tab and try an exam!</Text>
              )}
            </View>
          </MotiView>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 44,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
  },
  streamSelector: {
    marginTop: 16,
  },
  streamSelectorLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#DDEEE3",
    marginBottom: 8,
  },
  streamScroll: {
    gap: 8,
  },
  streamChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    marginRight: 8,
  },
  streamChipActive: {
    backgroundColor: "white",
    borderColor: "white",
  },
  streamChipText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  streamChipTextActive: {
    color: "#1C4966",
  },
  tabsRow: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.08)",
  },
  tabsScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(143, 189, 215, 0.1)",
    marginRight: 8,
  },
  tabChipActive: {
    backgroundColor: "#1C4966",
  },
  tabChipText: {
    fontSize: 12,
    color: "#1C4966",
    fontWeight: "bold",
  },
  tabChipTextActive: {
    color: "white",
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 12,
  },
  subText: {
    fontSize: 12,
    color: "#8FBDD7",
    marginBottom: 8,
  },
  goalRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  goalText: {
    fontSize: 13,
    color: "#5F8B70",
    flex: 1,
  },
  progressBarWrapper: {
    marginTop: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#F5F7FA",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#5F8B70",
    borderRadius: 4,
  },
  progressPercentText: {
    fontSize: 11,
    color: "#8FBDD7",
    marginTop: 6,
    fontWeight: "bold",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#5CB85C",
    backgroundColor: "rgba(92, 184, 92, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(143, 189, 215, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(143, 189, 215, 0.15)",
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  listItemText: {
    flex: 1,
    fontSize: 13,
    color: "#1C4966",
    fontWeight: "600",
  },
  classCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(143, 189, 215, 0.06)",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(143, 189, 215, 0.15)",
  },
  classSubject: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#5F8B70",
  },
  classTopic: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1C4966",
    marginTop: 4,
  },
  classTime: {
    fontSize: 12,
    color: "#8FBDD7",
    marginTop: 4,
  },
  joinBtn: {
    backgroundColor: "#1C4966",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  joinBtnText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  testCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.1)",
    padding: 16,
    borderRadius: 20,
    marginBottom: 10,
  },
  testName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1C4966",
  },
  testMeta: {
    fontSize: 11,
    color: "#8FBDD7",
    marginTop: 4,
  },
  startTestBtn: {
    backgroundColor: "#5F8B70",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  startTestBtnText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  doubtInputRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  doubtInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.15)",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    color: "#1C4966",
  },
  sendDoubtBtn: {
    width: 44,
    height: 44,
    backgroundColor: "#1C4966",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  doubtItem: {
    backgroundColor: "rgba(28, 73, 102, 0.02)",
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.08)",
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  doubtQuestion: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1C4966",
  },
  doubtMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  doubtStatusText: {
    fontSize: 10,
    color: "#F0AD4E",
    fontWeight: "bold",
  },
  doubtTimeText: {
    fontSize: 10,
    color: "#8FBDD7",
  },
  testAttemptItem: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#F5F7FA",
    paddingVertical: 10,
  },
  testAttemptName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1C4966",
  },
  testAttemptDate: {
    fontSize: 11,
    color: "#8FBDD7",
    marginTop: 2,
  },
  testAttemptScore: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#5F8B70",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 13,
    color: "#8FBDD7",
    textAlign: "center",
  },
  btn: {
    backgroundColor: "#1C4966",
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});
