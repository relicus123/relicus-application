import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
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
  HelpCircle,
  Play,
  Check,
  Send,
  Download,
} from "lucide-react-native";

import { useSkillsStore, Module, Lesson, Assignment, Quiz } from "../../store/skills.store";

const { width } = Dimensions.get("window");

export default function CourseDashboardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const courseId = params.courseId as string;

  const store = useSkillsStore();
  const course = useMemo(() => store.courses.find((c) => c.id === courseId), [courseId, store.courses]);
  const activeTab = store.activeDashboardTab;

  // Local state
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(0);
  const [githubUrl, setGithubUrl] = useState("");
  const [doubtText, setDoubtText] = useState("");

  // Quiz state
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleBack = () => {
    store.selectCourse(null);
    router.back();
  };

  const handlePlayLesson = (lesson: Lesson, moduleId: string) => {
    // Play video simulation: update progress to 100 & mark completed
    store.updateLessonProgress(courseId, lesson.id, 100, true);
    store.addLearningHours(0.5); // Add 30 mins
    alert(`Simulating Video Lecture: "${lesson.title}" has been watched completely! 0.5 hours added to Analytics.`);
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizFinished(false);
  };

  const handleAnswerOption = (index: number) => {
    if (selectedAnswer !== null) return; // Answered already
    setSelectedAnswer(index);
    setShowExplanation(true);
    if (index === activeQuiz!.questions[currentQuestionIdx].correctAnswerIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    if (currentQuestionIdx + 1 < activeQuiz!.questions.length) {
      setCurrentQuestionIdx((i) => i + 1);
    } else {
      setQuizFinished(true);
      // Log quiz score & update store
      store.addLearningHours(0.25);
      store.logActivity("Quiz Passed", `Scored ${score + (selectedAnswer === activeQuiz!.questions[currentQuestionIdx].correctAnswerIndex ? 1 : 0)}/${activeQuiz!.questions.length} in ${activeQuiz!.title}`);
    }
  };

  const handleSubmitAssignment = (assignmentId: string) => {
    if (!githubUrl.trim()) return;
    store.submitAssignment({
      courseId,
      assignmentId,
      type: "github",
      content: githubUrl,
      status: "Submitted",
    });
    setGithubUrl("");
    alert("Assignment submitted successfully!");
  };

  const handleAddDoubt = () => {
    if (!doubtText.trim()) return;
    store.addDoubt({
      courseId,
      question: doubtText,
      status: "Pending",
    });
    setDoubtText("");
    alert("Doubt submitted to course Q&A panel!");
  };

  if (!course) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Course details not found.</Text>
        <TouchableOpacity onPress={handleBack} style={styles.btn}>
          <Text style={styles.btnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const courseSubmissions = store.submissions.filter((s) => s.courseId === courseId);
  const courseDoubts = store.doubts.filter((d) => d.courseId === courseId);

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
            <Text style={styles.headerTitle} numberOfLines={1}>{course.title}</Text>
            <Text style={styles.headerSubtitle}>By {course.instructor}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {[
            { id: "overview", label: "Overview" },
            { id: "curriculum", label: "Curriculum" },
            { id: "assignments", label: "Assignments" },
            { id: "quizzes", label: "Quizzes" },
            { id: "doubt", label: "Doubts Desk" },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => store.setActiveDashboardTab(tab.id as any)}
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Render Active Tab Contents */}
        {activeTab === "overview" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Course Description</Text>
              <Text style={styles.overviewText}>{course.description}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>What you will learn</Text>
              {course.objectives.map((objective, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <Check size={14} color="#5F8B70" style={{ marginTop: 2 }} />
                  <Text style={styles.bulletText}>{objective}</Text>
                </View>
              ))}
            </View>
          </MotiView>
        )}

        {activeTab === "curriculum" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Modules picker */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {course.modules.map((mod, index) => {
                const active = selectedModuleIdx === index;
                return (
                  <TouchableOpacity
                    key={mod.id}
                    onPress={() => setSelectedModuleIdx(index)}
                    style={[styles.modulePickerChip, active && styles.modulePickerChipActive]}
                  >
                    <Text style={[styles.modulePickerChipText, active && styles.modulePickerChipTextActive]}>
                      Module {index + 1}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Selected Module Detail */}
            {course.modules[selectedModuleIdx] && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{course.modules[selectedModuleIdx].title}</Text>
                <Text style={styles.subText}>{course.modules[selectedModuleIdx].description}</Text>

                <Text style={[styles.cardTitle, { marginTop: 20 }]}>Lectures</Text>
                <View style={{ gap: 12 }}>
                  {course.modules[selectedModuleIdx].lessons.map((lesson) => {
                    const progressKey = `${courseId}_${lesson.id}`;
                    const isCompleted = store.lessonProgress[progressKey]?.completed;

                    return (
                      <View key={lesson.id} style={styles.lessonItem}>
                        <TouchableOpacity
                          onPress={() => handlePlayLesson(lesson, course.modules[selectedModuleIdx].id)}
                          style={styles.lessonPlayBtn}
                        >
                          <Play size={14} color="white" fill="white" />
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.lessonTitle}>{lesson.title}</Text>
                          <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                        </View>
                        {isCompleted && (
                          <View style={styles.completedBadge}>
                            <Text style={styles.completedBadgeText}>Completed</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </MotiView>
        )}

        {activeTab === "assignments" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {course.modules.flatMap((m) => m.assignments).map((assignment) => {
              const submission = courseSubmissions.find((s) => s.assignmentId === assignment.id);

              return (
                <View key={assignment.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{assignment.title}</Text>
                  <Text style={styles.overviewText}>{assignment.instructions}</Text>

                  <View style={styles.cardDivider} />

                  {submission ? (
                    <View style={styles.submissionBox}>
                      <Text style={styles.submissionStatus}>Status: {submission.status}</Text>
                      {submission.grade && (
                        <Text style={styles.submissionGrade}>Grade: {submission.grade}</Text>
                      )}
                      {submission.feedback && (
                        <Text style={styles.submissionFeedback}>Feedback: {submission.feedback}</Text>
                      )}
                    </View>
                  ) : (
                    <View style={styles.submissionForm}>
                      <Text style={styles.metaLabel}>SUBMIT PROJECTS (GITHUB / TEXT LINK)</Text>
                      <TextInput
                        placeholder="Enter GitHub URL or project details..."
                        placeholderTextColor="#8FBDD7"
                        value={githubUrl}
                        onChangeText={setGithubUrl}
                        style={styles.githubInput}
                      />
                      <TouchableOpacity
                        onPress={() => handleSubmitAssignment(assignment.id)}
                        style={[styles.btn, { marginTop: 12 }]}
                      >
                        <Text style={styles.btnText}>Submit Assignment</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </MotiView>
        )}

        {activeTab === "quizzes" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {activeQuiz ? (
              <View style={styles.card}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                  <Text style={styles.cardTitle}>{activeQuiz.title}</Text>
                  {!quizFinished && (
                    <Text style={styles.subText}>
                      Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}
                    </Text>
                  )}
                </View>

                {!quizFinished ? (
                  <View>
                    <Text style={styles.quizQuestion}>
                      {activeQuiz.questions[currentQuestionIdx].question}
                    </Text>
                    <View style={{ gap: 8, marginTop: 16 }}>
                      {activeQuiz.questions[currentQuestionIdx].options.map((option, index) => {
                        const isSelected = selectedAnswer === index;
                        const isCorrect = index === activeQuiz.questions[currentQuestionIdx].correctAnswerIndex;
                        let optionStyle: any = styles.optionBtn;
                        let optionTextStyle: any = styles.optionBtnText;

                        if (selectedAnswer !== null) {
                          if (isCorrect) {
                            optionStyle = [styles.optionBtn, styles.optionBtnCorrect];
                            optionTextStyle = [styles.optionBtnText, styles.optionBtnTextCorrect];
                          } else if (isSelected) {
                            optionStyle = [styles.optionBtn, styles.optionBtnIncorrect];
                            optionTextStyle = [styles.optionBtnText, styles.optionBtnTextIncorrect];
                          }
                        }

                        return (
                          <TouchableOpacity
                            key={index}
                            onPress={() => handleAnswerOption(index)}
                            disabled={selectedAnswer !== null}
                            style={optionStyle}
                          >
                            <Text style={optionTextStyle}>{option}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {showExplanation && (
                      <View style={styles.explanationBox}>
                        <Text style={styles.explanationTitle}>Explanation</Text>
                        <Text style={styles.explanationText}>
                          {activeQuiz.questions[currentQuestionIdx].explanation}
                        </Text>
                        <TouchableOpacity onPress={handleNextQuestion} style={[styles.btn, { marginTop: 12 }]}>
                          <Text style={styles.btnText}>
                            {currentQuestionIdx + 1 < activeQuiz.questions.length ? "Next Question" : "Finish Quiz"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={{ alignItems: "center", paddingVertical: 20 }}>
                    <Award size={40} color="#F1C40F" />
                    <Text style={[styles.cardTitle, { marginTop: 12 }]}>Quiz Completed!</Text>
                    <Text style={styles.overviewText}>
                      Your score: {score} out of {activeQuiz.questions.length} correct.
                    </Text>
                    <TouchableOpacity onPress={() => setActiveQuiz(null)} style={[styles.btn, { marginTop: 20, width: 140 }]}>
                      <Text style={styles.btnText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              course.modules.flatMap((m) => m.quizzes).map((quiz) => (
                <View key={quiz.id} style={styles.card}>
                  <Text style={styles.cardTitle}>{quiz.title}</Text>
                  <Text style={styles.subText}>{quiz.type.toUpperCase()} QUIZ • {quiz.questions.length} questions</Text>
                  <TouchableOpacity onPress={() => handleStartQuiz(quiz)} style={[styles.btn, { marginTop: 12 }]}>
                    <Text style={styles.btnText}>Start Quiz</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </MotiView>
        )}

        {activeTab === "doubt" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Doubt Desk Q&A</Text>
              <Text style={styles.subText}>Submit doubts here to get answers from course instructors.</Text>
              <View style={styles.doubtInputRow}>
                <TextInput
                  placeholder="Ask a question..."
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
              <Text style={styles.cardTitle}>Questions Queue</Text>
              {courseDoubts.length > 0 ? (
                courseDoubts.map((d) => (
                  <View key={d.id} style={styles.doubtItem}>
                    <Text style={styles.doubtQuestion}>{d.question}</Text>
                    <Text style={styles.doubtStatusText}>Status: {d.status.toUpperCase()}</Text>
                    {d.responses && d.responses.map((r, idx) => (
                      <View key={idx} style={styles.doubtResponseBox}>
                        <Text style={styles.responseAuthor}>{r.author}</Text>
                        <Text style={styles.responseText}>{r.message}</Text>
                      </View>
                    ))}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No doubts submitted yet for this course.</Text>
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
  overviewText: {
    fontSize: 13,
    color: "#5F8B70",
    lineHeight: 18,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  bulletText: {
    fontSize: 13,
    color: "#5F8B70",
    flex: 1,
  },
  modulePickerChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.15)",
    marginRight: 8,
  },
  modulePickerChipActive: {
    backgroundColor: "#5F8B70",
    borderColor: "#5F8B70",
  },
  modulePickerChipText: {
    fontSize: 12,
    color: "#5F8B70",
    fontWeight: "bold",
  },
  modulePickerChipTextActive: {
    color: "white",
  },
  lessonItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(143, 189, 215, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(143, 189, 215, 0.15)",
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  lessonPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#1C4966",
    alignItems: "center",
    justifyContent: "center",
  },
  lessonTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1C4966",
  },
  lessonDuration: {
    fontSize: 11,
    color: "#8FBDD7",
    marginTop: 2,
  },
  completedBadge: {
    backgroundColor: "rgba(92, 184, 92, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  completedBadgeText: {
    color: "#5CB85C",
    fontSize: 10,
    fontWeight: "bold",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#F5F7FA",
    marginVertical: 12,
  },
  submissionBox: {
    backgroundColor: "rgba(95, 139, 112, 0.06)",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(95, 139, 112, 0.15)",
  },
  submissionStatus: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1C4966",
  },
  submissionGrade: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#5CB85C",
    marginTop: 6,
  },
  submissionFeedback: {
    fontSize: 12,
    color: "#5F8B70",
    marginTop: 6,
    lineHeight: 16,
  },
  submissionForm: {
    gap: 8,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#8FBDD7",
  },
  githubInput: {
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.15)",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    color: "#1C4966",
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
    fontSize: 13,
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
    marginBottom: 12,
  },
  doubtQuestion: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1C4966",
  },
  doubtStatusText: {
    fontSize: 10,
    color: "#F0AD4E",
    fontWeight: "bold",
    marginTop: 6,
  },
  doubtResponseBox: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "rgba(28, 73, 102, 0.05)",
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  responseAuthor: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1C4966",
  },
  responseText: {
    fontSize: 12,
    color: "#5F8B70",
    marginTop: 4,
  },
  quizQuestion: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1C4966",
    lineHeight: 20,
  },
  optionBtn: {
    backgroundColor: "rgba(143, 189, 215, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(143, 189, 215, 0.2)",
    borderRadius: 12,
    padding: 14,
  },
  optionBtnCorrect: {
    backgroundColor: "rgba(92, 184, 92, 0.12)",
    borderColor: "#5CB85C",
  },
  optionBtnIncorrect: {
    backgroundColor: "rgba(217, 83, 79, 0.12)",
    borderColor: "#D9534F",
  },
  optionBtnText: {
    fontSize: 13,
    color: "#1C4966",
    fontWeight: "600",
  },
  optionBtnTextCorrect: {
    color: "#5CB85C",
  },
  optionBtnTextIncorrect: {
    color: "#D9534F",
  },
  explanationBox: {
    marginTop: 16,
    backgroundColor: "rgba(143, 189, 215, 0.08)",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(143, 189, 215, 0.15)",
  },
  explanationTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1C4966",
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 12,
    color: "#5F8B70",
    lineHeight: 16,
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
});
