import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  RefreshControl,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import {
  ArrowLeft,
  BookOpen,
  Award,
  Check,
  Send,
  Download,
  Star,
  Play,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Typography } from "../../components/Typography";
import { BentoCard } from "../../components/BentoCard";
import { Button } from "../../components/Button";
import { useSkillsStore, Lesson, Quiz } from "../../store/skills.store";
import { useAuthStore } from "../../store/auth.store";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const DynamicDuration = ({ videoUrl }: { videoUrl: string }) => {
  const [durationText, setDurationText] = useState("Loading...");
  const fetchVideoDuration = useSkillsStore(s => s.fetchVideoDuration);

  useEffect(() => {
    fetchVideoDuration("dummy", videoUrl).then((d: string) => {
      setDurationText(d !== "Video" ? `${d} mins` : "Video Lecture");
    });
  }, [videoUrl, fetchVideoDuration]);

  return <Typography variant="caption" color="secondary" className="text-[11px] mt-0.5">{durationText}</Typography>;
};

export default function CourseDashboardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const courseId = params.courseId as string;

  const store = useSkillsStore();
  const authStore = useAuthStore();
  const userId = authStore.currentUser?.id;
  const course = useMemo(() => store.courses.find((c) => c.id === courseId), [courseId, store.courses]);
  const activeTab = store.activeDashboardTab;

  const [refreshing, setRefreshing] = useState(false);

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

  useFocusEffect(
    useCallback(() => {
      // Refresh course data silently when screen comes to focus
      store.fetchCourses();
      store.fetchDoubts();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await store.fetchCourses();
    await store.fetchDoubts();
    setRefreshing(false);
  };

  const handleBack = () => {
    store.selectCourse(null);
    router.back();
  };

  const handlePlayLesson = (lesson: Lesson, moduleId: string) => {
    router.push({
      pathname: "/skills/video-player" as any,
      params: { 
        courseId,
        lessonId: lesson.id,
        videoUrl: lesson.videoUrl,
        lessonTitle: lesson.title
      },
    });
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
      const passed = (score / activeQuiz!.questions.length) >= 0.5;
      store.saveQuizProgress(courseId, activeQuiz!.id, score, passed);
      store.addLearningHours(0.25);
      store.logActivity("Quiz Passed", `Scored ${score}/${activeQuiz!.questions.length} in ${activeQuiz!.title}`);
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
      <View className="flex-1 bg-surface-primary items-center justify-center p-8">
        <Typography variant="body" color="secondary" className="mb-4">Course details not found.</Typography>
        <Button onPress={handleBack} variant="primary">Go Back</Button>
      </View>
    );
  }

  const courseSubmissions = store.submissions.filter((s) => s.courseId === courseId);
  const courseDoubts = store.doubts.filter((d) => d.courseId === courseId);

  return (
    <View className="flex-1 bg-surface-primary">
      {/* Header */}
      <LinearGradient
        colors={["#fdf7ff", "#e9ddff", "#cfbcff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-6 pt-10"
      >
        <SafeAreaView edges={["top"]}>
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              onPress={handleBack}
              className="w-10 h-10 rounded-full bg-white/40 items-center justify-center border border-white/50"
              activeOpacity={0.7}
            >
              <ArrowLeft color="#4f378a" size={20} />
            </TouchableOpacity>
            <View className="flex-1">
              <Typography variant="heading" weight="bold" color="primary" numberOfLines={1}>{course.title}</Typography>
              <Typography variant="caption" color="secondary">By {course.instructor}</Typography>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Tabs */}
      <View className="bg-white border-b border-border-subtle">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
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
                className={twMerge(clsx(
                  "px-4 py-2 rounded-full",
                  active ? "bg-primary" : "bg-primary/5"
                ))}
              >
                <Typography 
                  variant="caption" 
                  weight="bold" 
                  color={active ? "inverse" : "primary"}
                >
                  {tab.label}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f378a" />
          }
      >
        {/* Render Active Tab Contents */}
        {activeTab === "overview" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="gap-4">
            <BentoCard variant="secondary" padding="lg" className="bg-white border border-border-subtle shadow-sm">
              <Typography variant="body" weight="bold" color="primary" className="mb-3">Course Description</Typography>
              <Typography variant="caption" color="secondary" className="leading-5">{course.description}</Typography>
            </BentoCard>

            <BentoCard variant="secondary" padding="lg" className="bg-white border border-border-subtle shadow-sm">
              <Typography variant="body" weight="bold" color="primary" className="mb-3">What you will learn</Typography>
              <View className="gap-2">
                {course.objectives.map((objective, idx) => (
                  <View key={idx} className="flex-row gap-2">
                    <Check size={16} color="#6b4fa3" className="mt-0.5" />
                    <Typography variant="caption" color="secondary" className="flex-1 leading-5">{objective}</Typography>
                  </View>
                ))}
              </View>
            </BentoCard>

            {/* Rate this Course */}
            <BentoCard variant="secondary" padding="lg" className="bg-white border border-border-subtle shadow-sm">
              <Typography variant="body" weight="bold" color="primary">Rate this Course</Typography>
              <Typography variant="caption" color="secondary" className="mt-1">How would you rate your learning experience?</Typography>
              <View className="flex-row gap-3 mt-3">
                {[1, 2, 3, 4, 5].map((starIdx) => {
                  const userReview = store.reviews.find(r => r.courseId === courseId && r.userId === userId);
                  const isFilled = userReview && userReview.rating >= starIdx;
                  return (
                    <TouchableOpacity 
                      key={starIdx} 
                      onPress={() => {
                        if (!userId) return;
                        store.submitReview({
                          id: `rev-${Math.random()}`,
                          courseId,
                          userId,
                          rating: starIdx,
                          comment: "",
                          date: new Date().toISOString()
                        });
                      }}
                    >
                      <Star 
                        size={32} 
                        color={isFilled ? "#F1C40F" : "#E2E8F0"} 
                        fill={isFilled ? "#F1C40F" : "transparent"} 
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </BentoCard>
          </MotiView>
        )}

        {activeTab === "curriculum" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Modules picker */}
            {course.modules && course.modules.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 -mx-4" contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
                {course.modules.map((mod, index) => {
                  const active = selectedModuleIdx === index;
                  return (
                    <TouchableOpacity
                      key={mod.id}
                      onPress={() => setSelectedModuleIdx(index)}
                      className={twMerge(clsx(
                        "px-4 py-2 rounded-full border",
                        active 
                          ? "bg-[#6b4fa3] border-[#6b4fa3]" 
                          : "bg-white border-border-subtle"
                      ))}
                    >
                      <Typography 
                        variant="caption" 
                        weight="bold" 
                        color={active ? "inverse" : "secondary"}
                      >
                        Module {index + 1}
                      </Typography>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : null}

            {/* Selected Module Detail */}
            {course.modules && course.modules.length > 0 && course.modules[selectedModuleIdx] ? (
              <BentoCard variant="secondary" padding="lg" className="bg-white border border-border-subtle shadow-sm">
                <Typography variant="body" weight="bold" color="primary">{course.modules[selectedModuleIdx].title}</Typography>
                <Typography variant="caption" color="secondary" className="mt-1">{course.modules[selectedModuleIdx].description}</Typography>

                <Typography variant="body" weight="bold" color="primary" className="mt-5 mb-3">Lectures</Typography>
                <View className="gap-3">
                  {course.modules[selectedModuleIdx].lessons.map((lesson) => {
                    const progressKey = `${userId}_${courseId}_${lesson.id}`;
                    const isCompleted = store.lessonProgress[progressKey]?.completed;

                    return (
                      <View key={lesson.id} className="flex-row items-center bg-white border border-border-subtle rounded-2xl p-3 shadow-sm gap-3">
                        <TouchableOpacity
                          onPress={() => handlePlayLesson(lesson, course.modules[selectedModuleIdx].id)}
                          className="w-24 h-16 rounded-xl overflow-hidden relative"
                        >
                          {lesson.thumbnail && String(lesson.thumbnail).trim().startsWith('http') ? (
                            <Image source={{ uri: String(lesson.thumbnail).trim() }} className="w-full h-full" resizeMode="cover" />
                          ) : (
                            <View className="w-full h-full bg-primary/20" />
                          )}
                          <View className="absolute inset-0 bg-black/30 items-center justify-center">
                            <Play size={16} color="white" fill="white" />
                          </View>
                        </TouchableOpacity>
                        
                        <View className="flex-1 py-1">
                          <Typography variant="caption" weight="bold" color="primary" numberOfLines={2}>{lesson.title}</Typography>
                          <DynamicDuration videoUrl={lesson.videoUrl} />
                          {/* Mini Progress Bar */}
                          <View className="w-full h-1 bg-surface-secondary rounded-full mt-1.5 overflow-hidden">
                            <View className="h-full bg-[#6b4fa3]" style={{ width: `${store.lessonProgress[progressKey]?.progress || 0}%` }} />
                          </View>
                        </View>
                        {isCompleted && (
                          <View className="bg-[#10B981]/10 px-2 py-1 rounded-md">
                            <Typography variant="caption" weight="bold" className="text-[#10B981] text-[10px]">Completed</Typography>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </BentoCard>
            ) : (
              <BentoCard variant="secondary" padding="lg" className="bg-white border border-border-subtle shadow-sm items-center py-10">
                <BookOpen size={48} color="#4f378a" className="mb-4 opacity-50" />
                <Typography variant="body" weight="bold" color="primary">Curriculum Coming Soon</Typography>
                <Typography variant="caption" color="secondary" className="text-center mt-2">The instructor has not added any modules or lectures to this course yet. Check back later!</Typography>
              </BentoCard>
            )}
          </MotiView>
        )}

        {activeTab === "assignments" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="gap-4">
            {course.modules.flatMap((m) => m.assignments).map((assignment) => {
              const submission = courseSubmissions.find((s) => s.assignmentId === assignment.id);

              return (
                <BentoCard key={assignment.id} variant="secondary" padding="lg" className="bg-white border border-border-subtle shadow-sm">
                  <Typography variant="body" weight="bold" color="primary">{assignment.title}</Typography>
                  <Typography variant="caption" color="secondary" className="mt-1 leading-5">{assignment.instructions}</Typography>

                  {assignment.downloadUrl ? (
                    <TouchableOpacity onPress={() => Linking.openURL(assignment.downloadUrl)} className="mt-3 flex-row items-center gap-1.5">
                      <Download size={16} color="#4f378a" />
                      <Typography variant="caption" weight="bold" color="primary">Download Resources / View Link</Typography>
                    </TouchableOpacity>
                  ) : null}

                  <View className="h-[1px] bg-border-subtle my-4" />

                  {submission ? (
                    <View className="bg-primary/5 p-3.5 rounded-2xl border border-primary/10">
                      <Typography variant="caption" weight="bold" color="primary">Status: {submission.status}</Typography>
                      {submission.grade && (
                        <Typography variant="caption" weight="bold" className="text-[#10B981] mt-1.5">Grade: {submission.grade}</Typography>
                      )}
                      {submission.feedback && (
                        <Typography variant="caption" color="secondary" className="mt-1.5 leading-4">Feedback: {submission.feedback}</Typography>
                      )}
                    </View>
                  ) : (
                    <View className="gap-2">
                      <Typography variant="caption" weight="bold" color="secondary" className="text-[10px]">SUBMIT PROJECTS (GITHUB / TEXT LINK)</Typography>
                      <TextInput
                        placeholder="Enter GitHub URL or project details..."
                        placeholderTextColor="#79747e"
                        value={githubUrl}
                        onChangeText={setGithubUrl}
                        className="border border-border-subtle rounded-xl px-3 h-11 text-[13px] text-text-primary bg-white"
                      />
                      <Button
                        onPress={() => handleSubmitAssignment(assignment.id)}
                        variant="primary"
                        className="mt-1"
                      >
                        Submit Assignment
                      </Button>
                    </View>
                  )}
                </BentoCard>
              );
            })}
          </MotiView>
        )}

        {activeTab === "quizzes" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="gap-4">
            {activeQuiz ? (
              <BentoCard variant="secondary" padding="lg" className="bg-white border border-border-subtle shadow-sm">
                <View className="flex-row justify-between mb-3">
                  <Typography variant="body" weight="bold" color="primary">{activeQuiz.title}</Typography>
                  {!quizFinished && (
                    <Typography variant="caption" color="secondary">
                      Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}
                    </Typography>
                  )}
                </View>

                {!quizFinished ? (
                  <View>
                    <Typography variant="body" weight="bold" color="primary" className="leading-5">
                      {activeQuiz.questions[currentQuestionIdx].question}
                    </Typography>
                    <View className="gap-2 mt-4">
                      {activeQuiz.questions[currentQuestionIdx].options.map((option, index) => {
                        const isSelected = selectedAnswer === index;
                        const isCorrect = index === activeQuiz.questions[currentQuestionIdx].correctAnswerIndex;
                        let optionStyle = "bg-surface-secondary border border-border-subtle";
                        let optionTextStyle = "text-text-primary";

                        if (selectedAnswer !== null) {
                          if (isCorrect) {
                            optionStyle = "bg-[#10B981]/10 border-[#10B981]";
                            optionTextStyle = "text-[#10B981]";
                          } else if (isSelected) {
                            optionStyle = "bg-[#EF4444]/10 border-[#EF4444]";
                            optionTextStyle = "text-[#EF4444]";
                          }
                        }

                        return (
                          <TouchableOpacity
                            key={index}
                            onPress={() => handleAnswerOption(index)}
                            disabled={selectedAnswer !== null}
                            className={twMerge(clsx("p-3.5 rounded-xl", optionStyle))}
                          >
                            <Typography variant="caption" weight="bold" className={optionTextStyle}>{option}</Typography>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {showExplanation && (
                      <View className="mt-4 bg-primary/5 p-3.5 rounded-2xl border border-primary/10">
                        <Typography variant="caption" weight="bold" color="primary" className="mb-1">Explanation</Typography>
                        <Typography variant="caption" color="secondary" className="leading-4">
                          {activeQuiz.questions[currentQuestionIdx].explanation}
                        </Typography>
                        <Button onPress={handleNextQuestion} variant="primary" className="mt-3">
                          {currentQuestionIdx + 1 < activeQuiz.questions.length ? "Next Question" : "Finish Quiz"}
                        </Button>
                      </View>
                    )}
                  </View>
                ) : (
                  <View className="items-center py-5">
                    <Award size={40} color="#F1C40F" />
                    <Typography variant="body" weight="bold" color="primary" className="mt-3">Quiz Completed!</Typography>
                    <Typography variant="caption" color="secondary" className="mt-1">
                      Your score: {score} out of {activeQuiz.questions.length} correct.
                    </Typography>
                    <Button onPress={() => setActiveQuiz(null)} variant="primary" className="mt-5 px-8">
                      Close
                    </Button>
                  </View>
                )}
              </BentoCard>
            ) : (
              course.modules.flatMap((m) => m.quizzes).map((quiz) => {
                const quizStateKey = `${userId}_${courseId}_${quiz.id}`;
                const progress = store.quizProgress[quizStateKey];

                return (
                  <BentoCard key={quiz.id} variant="secondary" padding="lg" className="bg-white border border-border-subtle shadow-sm">
                    <View className="flex-row justify-between items-center">
                      <Typography variant="body" weight="bold" color="primary">{quiz.title}</Typography>
                      {progress && (
                        <View className={twMerge(clsx("px-3 py-1 rounded-xl", progress.passed ? "bg-[#10B981]/10" : "bg-[#EF4444]/10"))}>
                          <Typography variant="caption" weight="bold" className={twMerge(clsx("text-[12px]", progress.passed ? "text-[#10B981]" : "text-[#EF4444]"))}>
                            Score: {progress.score}/{quiz.questions.length}
                          </Typography>
                        </View>
                      )}
                    </View>
                    <Typography variant="caption" color="secondary" className="mt-1">{quiz.type.toUpperCase()} QUIZ • {quiz.questions.length} questions</Typography>
                    <Button onPress={() => handleStartQuiz(quiz)} variant="primary" className="mt-3">
                      {progress ? "Retake Quiz" : "Start Quiz"}
                    </Button>
                  </BentoCard>
                );
              })
            )}
          </MotiView>
        )}

        {activeTab === "doubt" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="gap-4">
            <BentoCard variant="secondary" padding="lg" className="bg-white border border-border-subtle shadow-sm">
              <Typography variant="body" weight="bold" color="primary">Doubt Desk Q&A</Typography>
              <Typography variant="caption" color="secondary" className="mt-1">Submit doubts here to get answers from course instructors.</Typography>
              <View className="flex-row gap-2 mt-3">
                <TextInput
                  placeholder="Ask a question..."
                  placeholderTextColor="#79747e"
                  value={doubtText}
                  onChangeText={setDoubtText}
                  className="flex-1 border border-border-subtle rounded-xl px-3 h-11 text-[13px] text-text-primary bg-white"
                />
                <TouchableOpacity onPress={handleAddDoubt} className="w-11 h-11 bg-primary rounded-xl items-center justify-center">
                  <Send size={16} color="white" />
                </TouchableOpacity>
              </View>
            </BentoCard>

            <BentoCard variant="secondary" padding="lg" className="bg-white border border-border-subtle shadow-sm">
              <Typography variant="body" weight="bold" color="primary" className="mb-3">Questions Queue</Typography>
              {courseDoubts.length > 0 ? (
                courseDoubts.map((d) => (
                  <View key={d.id} className="bg-surface-secondary border border-border-subtle p-3.5 rounded-2xl mb-3">
                    <Typography variant="caption" weight="bold" color="primary">{d.question}</Typography>
                    <Typography variant="caption" weight="bold" className="text-[#F59E0B] text-[10px] mt-1.5">Status: {d.status.toUpperCase()}</Typography>
                    {d.responses && d.responses.map((r, idx) => (
                      <View key={idx} className="bg-white border border-border-subtle p-3 rounded-xl mt-2">
                        <Typography variant="caption" weight="bold" color="primary" className="text-[11px]">{r.author}</Typography>
                        <Typography variant="caption" color="secondary" className="mt-1">{r.message}</Typography>
                      </View>
                    ))}
                  </View>
                ))
              ) : (
                <Typography variant="caption" color="secondary" className="text-center py-4">No doubts submitted yet for this course.</Typography>
              )}
            </BentoCard>
          </MotiView>
        )}
      </ScrollView>
    </View>
  );
}
