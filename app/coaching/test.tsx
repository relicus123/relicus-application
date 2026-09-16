import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  AppState,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import {
  ArrowLeft,
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  Shield,
  Lock,
  RotateCcw,
  AlertTriangle,
  Check,
  X,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ScreenCapture from "expo-screen-capture";

import { Typography } from "../../components/Typography";
import { BentoCard } from "../../components/BentoCard";
import { Button } from "../../components/Button";
import { supabase } from "../../lib/supabase";
import { useCoachingStore } from "../../store/coaching.store";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface QuestionItem {
  id: string | number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  subject?: string;
  imageUrl?: string;
}

export default function MockTest() {
  const router = useRouter();
  const {
    id,
    title,
    duration,
    examType,
    attemptType,
    isProctored,
    viewOnly,
  } = useLocalSearchParams<{
    id?: string;
    title?: string;
    duration?: string;
    examType?: string;
    attemptType?: string;
    isProctored?: string;
    viewOnly?: string;
  }>();

  const isOneTimeOnly = attemptType === "once";
  const isProctoredBool = isProctored === "1";
  const isViewOnly = viewOnly === "1";

  const { addTestAttempt, getLatestTestAttempt, hasAttemptedTest } = useCoachingStore();

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(Number(duration) || 5400);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [violations, setViolations] = useState(0);
  const [showProctorGuide, setShowProctorGuide] = useState(isProctoredBool && !isViewOnly);

  const [result, setResult] = useState<{
    scorePercent: number;
    correct: number;
    incorrect: number;
    unattempted: number;
    total: number;
    timeSpent: number;
  } | null>(null);

  // Strict anti-screenshot and screen recording protection across Test Arena
  ScreenCapture.usePreventScreenCapture("coaching_test_arena");

  useEffect(() => {
    let sub: any = null;
    try {
      sub = ScreenCapture.addScreenshotListener(() => {
        Alert.alert(
          "Security Policy Notice 🔒",
          "Screenshots and screen recordings are strictly disabled to protect exam integrity.",
          [{ text: "I Understand" }]
        );
      });
    } catch (_) {}
    return () => {
      if (sub) sub.remove();
    };
  }, []);

  // Check if test was already attempted and should be displayed in view-only mode
  useEffect(() => {
    if (id && (isViewOnly || (isOneTimeOnly && hasAttemptedTest(id)))) {
      const past = getLatestTestAttempt(id);
      if (past) {
        setIsSubmitted(true);
        setResult({
          scorePercent: Math.round(((past.score || 0) / (past.maxScore || 1)) * 100),
          correct: past.correctCount || 0,
          incorrect: past.incorrectCount || 0,
          unattempted: past.unattemptedCount || 0,
          total: (past.correctCount || 0) + (past.incorrectCount || 0) + (past.unattemptedCount || 0) || 1,
          timeSpent: past.timeTaken || 0,
        });
        if (Array.isArray(past.answers)) {
          const ansMap: Record<number, number> = {};
          past.answers.forEach((ansItem: any, idx: number) => {
            const val = typeof ansItem === "object" && ansItem !== null ? ansItem.selected : ansItem;
            if (typeof val === "number") ansMap[idx] = val;
          });
          setUserAnswers(ansMap);
        }
      }
    }
  }, [id, isViewOnly, isOneTimeOnly, hasAttemptedTest, getLatestTestAttempt]);

  // Load Questions from Supabase
  useEffect(() => {
    async function loadQuestions() {
      if (!id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data } = await supabase
          .from("coaching_mock_questions")
          .select("*")
          .eq("mock_test_id", id);

        if (data && data.length > 0) {
          const mapped: QuestionItem[] = data.map((q: any, index: number) => ({
            id: q.id || index + 1,
            question: q.question,
            options: Array.isArray(q.options) ? q.options : [],
            correctAnswer: q.correct_answer ?? 0,
            explanation: q.explanation || "",
            subject: q.subject || (title as string) || "General",
            imageUrl: q.image_url || q.imageUrl || "",
          }));
          setQuestions(mapped);
          if (Number(duration) && Number(duration) > 0) {
            setTimeRemaining(Number(duration));
          } else {
            setTimeRemaining(mapped.length * 60);
          }
        } else {
          setQuestions([]);
        }
      } catch (err) {
        console.error("Error loading test questions:", err);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, [id, duration, title]);

  // Live Timer Countdown
  useEffect(() => {
    if (loading || isSubmitted || questions.length === 0 || showProctorGuide) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, isSubmitted, questions.length, showProctorGuide]);

  // Proctoring App State Detection (Tracks App Backgrounding / Switching)
  useEffect(() => {
    if (!isProctoredBool || isSubmitted || loading || showProctorGuide) return;

    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "background" || nextState === "inactive") {
        setViolations((prev) => {
          const count = prev + 1;
          if (count >= 3) {
            Alert.alert(
              "Exam Disqualified / Auto-Submitted 🚨",
              "You have left or minimized the test screen 3 times during this proctored examination. Your responses are being submitted now."
            );
            handleSubmit();
          } else {
            Alert.alert(
              "Proctoring Violation Strike ⚠️",
              `Strike ${count}/3: You navigated away from the proctored exam screen! Leaving the app or switching tasks is prohibited. 3 strikes will automatically submit your test.`
            );
          }
          return count;
        });
      }
    });

    return () => sub.remove();
  }, [isProctoredBool, isSubmitted, loading, showProctorGuide]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmitConfirm = () => {
    const answeredCount = Object.keys(userAnswers).length;
    const unansweredCount = questions.length - answeredCount;

    Alert.alert(
      "Submit Examination",
      unansweredCount > 0
        ? `You have ${unansweredCount} unanswered questions out of ${questions.length}. Are you sure you want to finish and submit?`
        : "Are you sure you want to complete and submit your examination?",
      [
        { text: "Continue Test", style: "cancel" },
        { text: "Submit Now", style: "default", onPress: handleSubmit },
      ]
    );
  };

  const handleSubmit = async () => {
    if (isSubmitted || questions.length === 0) return;

    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    questions.forEach((q, idx) => {
      const selected = userAnswers[idx];
      if (selected === undefined || selected === null) {
        unattempted++;
      } else if (selected === q.correctAnswer) {
        correct++;
      } else {
        incorrect++;
      }
    });

    const scorePercent = Math.round((correct / questions.length) * 100);
    const totalDuration = Number(duration) || (questions.length * 60);
    const timeSpent = Math.max(0, totalDuration - timeRemaining);

    const testAttemptData = {
      testId: String(id || "mock-test"),
      testName: String(title || "Mock Test"),
      examType: String(examType || "CUET"),
      score: correct,
      maxScore: questions.length,
      accuracy: scorePercent,
      rank: Math.floor(Math.random() * 20) + 1,
      percentile: scorePercent,
      timeTaken: timeSpent,
      correctCount: correct,
      incorrectCount: incorrect,
      unattemptedCount: unattempted,
      answers: questions.map((q, idx) => ({
        questionId: q.id,
        selected: userAnswers[idx] ?? null,
        correct: q.correctAnswer,
      })),
      topicAnalysis: [],
      sectionAnalysis: [],
    };

    try {
      await addTestAttempt(testAttemptData);
    } catch (e) {
      console.error("Failed to record test attempt:", e);
    }

    setResult({
      scorePercent,
      correct,
      incorrect,
      unattempted,
      total: questions.length,
      timeSpent,
    });
    setIsSubmitted(true);
  };

  const handleRetake = () => {
    if (isOneTimeOnly) {
      Alert.alert("One-Time Test", "This is a final/regular examination configured for one attempt only.");
      return;
    }
    setUserAnswers({});
    setCurrentQuestion(0);
    setIsSubmitted(false);
    setResult(null);
    setViolations(0);
    setTimeRemaining(Number(duration) || (questions.length * 60));
  };

  const progressPercentage = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <View className="flex-1 bg-surface-primary justify-center items-center">
        <ActivityIndicator size="large" color="#1C4966" />
        <Typography color="secondary" className="mt-4">
          Loading Test Assessment...
        </Typography>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View className="flex-1 bg-surface-primary justify-center items-center px-6">
        <View className="w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center mb-4">
          <HelpCircle size={32} color="#1C4966" />
        </View>
        <Typography variant="heading" weight="bold" color="primary" className="mb-2 text-center text-lg">
          No Questions Added Yet
        </Typography>
        <Typography color="secondary" className="text-center mb-6 text-sm leading-relaxed">
          "{title || "This test"}" does not contain any questions yet. Add questions from the Admin Panel first.
        </Typography>
        <Button onPress={() => router.back()} variant="primary" className="w-full">
          Go Back
        </Button>
      </View>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // RESULT & REVIEW SCREEN
  // ───────────────────────────────────────────────────────────────────────────
  if (isSubmitted && result) {
    const isPassed = result.scorePercent >= 40;

    return (
      <View className="flex-1 bg-surface-primary">
        <LinearGradient
          colors={["#FFFFFF", "#EDF5F8", "#E1EFF5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-6 pb-6 pt-4 rounded-b-[36px] shadow-sm"
        >
          <SafeAreaView edges={["top"]}>
            <View className="flex-row items-center justify-between mb-3">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-9 h-9 rounded-full bg-white/90 items-center justify-center border border-border-subtle shadow-xs"
              >
                <ArrowLeft color="#1C4966" size={18} />
              </TouchableOpacity>
              <View className="flex-row items-center gap-1.5">
                {isProctoredBool && (
                  <View className="bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full flex-row items-center gap-1">
                    <Shield size={11} color="#4F46E5" />
                    <Typography variant="caption" weight="bold" className="text-indigo-700 text-[10px]">
                      Proctored
                    </Typography>
                  </View>
                )}
                <View className={`px-2.5 py-0.5 rounded-full flex-row items-center gap-1 ${isOneTimeOnly ? "bg-rose-50 border border-rose-200" : "bg-emerald-50 border border-emerald-200"}`}>
                  {isOneTimeOnly ? <Lock size={11} color="#E11D48" /> : <RotateCcw size={11} color="#059669" />}
                  <Typography variant="caption" weight="bold" className={`text-[10px] ${isOneTimeOnly ? "text-rose-700" : "text-emerald-700"}`}>
                    {isOneTimeOnly ? "Final (1 Attempt)" : "Mock Practice"}
                  </Typography>
                </View>
              </View>
            </View>

            <View className="items-center justify-center bg-white rounded-3xl p-5 border border-border-subtle mx-1 shadow-xs">
              <Typography variant="caption" weight="bold" color="secondary" className="uppercase tracking-wider text-[11px] mb-1">
                {title || "Assessment Result"}
              </Typography>
              <Typography variant="display" weight="bold" className="text-primary text-5xl my-1">
                {result.scorePercent}%
              </Typography>
              <View className="flex-row items-center gap-1.5 mt-1">
                <View className={`px-2 py-0.5 rounded-md ${isPassed ? "bg-emerald-100" : "bg-amber-100"}`}>
                  <Typography variant="caption" weight="bold" className={`text-xs ${isPassed ? "text-emerald-800" : "text-amber-800"}`}>
                    {isPassed ? "PASSED" : "NEEDS IMPROVEMENT"}
                  </Typography>
                </View>
                <Typography variant="caption" color="secondary" className="text-xs">
                  • {result.correct} / {result.total} Correct
                </Typography>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          {/* Quick Stats Grid */}
          <View className="flex-row gap-2.5 mb-4">
            <BentoCard variant="secondary" padding="md" className="flex-1 items-center bg-emerald-50/70 border border-emerald-200">
              <CheckCircle2 size={20} color="#059669" />
              <Typography weight="bold" className="text-emerald-700 text-base mt-1">
                {result.correct}
              </Typography>
              <Typography variant="caption" color="secondary" className="text-[11px]">Correct</Typography>
            </BentoCard>

            <BentoCard variant="secondary" padding="md" className="flex-1 items-center bg-red-50/70 border border-red-200">
              <XCircle size={20} color="#DC2626" />
              <Typography weight="bold" className="text-red-700 text-base mt-1">
                {result.incorrect}
              </Typography>
              <Typography variant="caption" color="secondary" className="text-[11px]">Incorrect</Typography>
            </BentoCard>

            <BentoCard variant="secondary" padding="md" className="flex-1 items-center bg-surface-secondary border border-border-subtle">
              <HelpCircle size={20} color="#71818B" />
              <Typography weight="bold" color="primary" className="text-base mt-1">
                {result.unattempted}
              </Typography>
              <Typography variant="caption" color="secondary" className="text-[11px]">Skipped</Typography>
            </BentoCard>
          </View>

          {/* Time & Accuracy Summary */}
          <BentoCard variant="secondary" padding="md" className="border border-border-subtle mb-5 bg-white shadow-xs">
            <View className="flex-row justify-between items-center py-2 border-b border-border-subtle">
              <Typography color="secondary" className="text-xs">Time Invested</Typography>
              <Typography weight="bold" color="primary" className="text-xs">{formatTime(result.timeSpent)}</Typography>
            </View>
            <View className="flex-row justify-between items-center py-2 border-b border-border-subtle">
              <Typography color="secondary" className="text-xs">Overall Accuracy</Typography>
              <Typography weight="bold" color="primary" className="text-xs">{result.scorePercent}%</Typography>
            </View>
            <View className="flex-row justify-between items-center py-2">
              <Typography color="secondary" className="text-xs">Attempt Policy</Typography>
              <Typography weight="bold" color="primary" className="text-xs">
                {isOneTimeOnly ? "One-Time Only (Locked)" : "Multiple Retakes Permitted"}
              </Typography>
            </View>
          </BentoCard>

          {/* Detailed Question Review Header */}
          <View className="flex-row items-center justify-between mb-3 px-1">
            <Typography variant="heading" weight="bold" color="primary" className="text-sm">
              Comprehensive Solution Review
            </Typography>
            <Typography variant="caption" color="secondary" className="text-xs">
              {questions.length} Questions
            </Typography>
          </View>

          {/* Question Breakdown List */}
          <View className="gap-3.5 mb-5">
            {questions.map((q, idx) => {
              const userAns = userAnswers[idx];
              const isCorrect = userAns === q.correctAnswer;
              const isSkipped = userAns === undefined || userAns === null;

              return (
                <BentoCard key={q.id || idx} variant="secondary" padding="md" className="border border-border-subtle bg-white shadow-xs">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-1.5">
                      <View className="w-5 h-5 rounded bg-primary/10 items-center justify-center">
                        <Typography weight="bold" color="primary" className="text-[10px]">
                          {idx + 1}
                        </Typography>
                      </View>
                      <Typography variant="caption" weight="bold" color="secondary" className="text-[11px]">
                        {q.subject || "Question"}
                      </Typography>
                    </View>

                    <View className={`px-2 py-0.5 rounded-full flex-row items-center gap-1 ${
                      isSkipped
                        ? "bg-slate-100 border border-slate-200"
                        : isCorrect
                        ? "bg-emerald-50 border border-emerald-200"
                        : "bg-red-50 border border-red-200"
                    }`}>
                      {isSkipped ? (
                        <HelpCircle size={10} color="#64748B" />
                      ) : isCorrect ? (
                        <Check size={10} color="#059669" />
                      ) : (
                        <X size={10} color="#DC2626" />
                      )}
                      <Typography variant="caption" weight="bold" className={`text-[10px] ${
                        isSkipped
                          ? "text-slate-600"
                          : isCorrect
                          ? "text-emerald-700"
                          : "text-red-700"
                      }`}>
                        {isSkipped ? "SKIPPED" : isCorrect ? "CORRECT" : "INCORRECT"}
                      </Typography>
                    </View>
                  </View>

                  <Typography weight="bold" color="primary" className="text-xs leading-snug mb-2">
                    {q.question}
                  </Typography>

                  {/* Question Image if present */}
                  {Boolean(q.imageUrl) && (
                    <View className="mb-2 rounded-xl overflow-hidden border border-border-subtle bg-slate-50 items-center justify-center p-2">
                      <Image
                        source={{ uri: q.imageUrl }}
                        style={{ width: "100%", height: 150 }}
                        resizeMode="contain"
                        className="rounded-lg"
                      />
                    </View>
                  )}

                  {/* Options List */}
                  <View className="gap-1.5 mb-2.5">
                    {q.options.map((opt, optIdx) => {
                      const isUserChoice = userAns === optIdx;
                      const isCorrectChoice = optIdx === q.correctAnswer;

                      let rowClass = "bg-surface-secondary/40 border-border-subtle";
                      let badgeClass = "bg-white text-secondary";

                      if (isCorrectChoice) {
                        rowClass = "bg-emerald-50/80 border-emerald-300";
                        badgeClass = "bg-emerald-600 text-white";
                      } else if (isUserChoice && !isCorrect) {
                        rowClass = "bg-red-50/80 border-red-300";
                        badgeClass = "bg-red-600 text-white";
                      }

                      return (
                        <View
                          key={optIdx}
                          className={`p-2 rounded-xl flex-row items-center gap-2 border ${rowClass}`}
                        >
                          <View className={`w-5 h-5 rounded-md items-center justify-center ${badgeClass}`}>
                            <Typography weight="bold" className="text-[10px]">
                              {String.fromCharCode(65 + optIdx)}
                            </Typography>
                          </View>
                          <Typography
                            className={`flex-1 text-[11px] leading-snug ${isCorrectChoice ? "font-bold text-emerald-900" : isUserChoice ? "font-bold text-red-900" : "text-primary"}`}
                          >
                            {opt}
                          </Typography>
                        </View>
                      );
                    })}
                  </View>

                  {/* Explanation Box */}
                  {Boolean(q.explanation) && (
                    <View className="p-2.5 rounded-xl bg-teal-50/60 border border-teal-200/80">
                      <Typography variant="caption" weight="bold" className="text-teal-800 text-[10px] mb-0.5">
                        💡 Solution Explanation:
                      </Typography>
                      <Typography variant="caption" color="secondary" className="text-xs leading-relaxed text-slate-700">
                        {q.explanation}
                      </Typography>
                    </View>
                  )}
                </BentoCard>
              );
            })}
          </View>

          {/* Action Buttons */}
          <View className="gap-2.5">
            {!isOneTimeOnly && (
              <Button onPress={handleRetake} variant="primary" className="w-full py-3 rounded-2xl">
                Retake Mock Test 🔄
              </Button>
            )}
            <Button onPress={() => router.back()} variant={isOneTimeOnly ? "primary" : "secondary"} className="w-full py-3 rounded-2xl">
              Return to Coaching Hub
            </Button>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ACTIVE TEST ARENA
  // ───────────────────────────────────────────────────────────────────────────
  const currentQ = questions[currentQuestion];
  const currentSelected = userAnswers[currentQuestion];

  return (
    <View className="flex-1 bg-surface-primary">
      {/* Pre-Exam Proctoring Modal Advisory */}
      <Modal visible={showProctorGuide} transparent animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center p-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl border border-border-subtle">
            <View className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 items-center justify-center mx-auto mb-3">
              <Shield size={28} color="#4F46E5" />
            </View>
            <Typography variant="heading" weight="bold" color="primary" className="text-center text-lg mb-1">
              Proctored Examination
            </Typography>
            <Typography variant="caption" color="secondary" className="text-center text-xs leading-relaxed mb-4">
              Please review the exam guidelines carefully before beginning:
            </Typography>

            <View className="gap-2.5 bg-surface-secondary/70 p-3.5 rounded-2xl border border-border-subtle mb-5">
              <View className="flex-row items-start gap-2">
                <Typography className="text-indigo-600 text-xs font-bold">1.</Typography>
                <Typography variant="caption" className="text-slate-700 text-xs flex-1">
                  Do not switch tabs, minimize, or close the app. (3 violations = auto-submit).
                </Typography>
              </View>
              <View className="flex-row items-start gap-2">
                <Typography className="text-indigo-600 text-xs font-bold">2.</Typography>
                <Typography variant="caption" className="text-slate-700 text-xs flex-1">
                  Screenshots & screen recordings are strictly disabled.
                </Typography>
              </View>
              <View className="flex-row items-start gap-2">
                <Typography className="text-indigo-600 text-xs font-bold">3.</Typography>
                <Typography variant="caption" className="text-slate-700 text-xs flex-1">
                  {isOneTimeOnly
                    ? "This is a Final Exam: You can only attempt this once!"
                    : "This is a Mock Exam: You can review and retake to practice."}
                </Typography>
              </View>
            </View>

            <Button
              variant="primary"
              onPress={() => setShowProctorGuide(false)}
              className="w-full py-3 rounded-xl"
            >
              I Understand & Agree to Begin
            </Button>
          </View>
        </View>
      </Modal>

      {/* Test Top Bar */}
      <LinearGradient
        colors={["#FFFFFF", "#EDF5F8", "#E1EFF5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-4 pt-3 rounded-b-[36px] shadow-sm"
      >
        <SafeAreaView edges={["top"]}>
          <View className="flex-row justify-between items-center mb-3">
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "Leave Test",
                  "Are you sure you want to exit? Your exam progress will not be recorded.",
                  [
                    { text: "Continue Test", style: "cancel" },
                    { text: "Exit", style: "destructive", onPress: () => router.back() },
                  ]
                );
              }}
              className="w-9 h-9 rounded-full bg-white/90 items-center justify-center border border-border-subtle shadow-xs"
            >
              <ArrowLeft color="#1C4966" size={18} />
            </TouchableOpacity>

            <View className="flex-row items-center gap-2">
              {isProctoredBool && (
                <View className="flex-row items-center gap-1 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
                  <Shield size={12} color="#4F46E5" />
                  <Typography variant="caption" weight="bold" className="text-indigo-700 text-[11px]">
                    Proctored {violations > 0 ? `(${violations}/3)` : ""}
                  </Typography>
                </View>
              )}

              <View className="flex-row items-center gap-1.5 bg-white/90 px-3 py-1 rounded-full border border-border-subtle shadow-xs">
                <Clock color="#1C4966" size={14} />
                <Typography variant="body" weight="bold" color="primary" className="text-xs">
                  {formatTime(timeRemaining)}
                </Typography>
              </View>
            </View>
          </View>

          {/* Progress Card */}
          <BentoCard variant="secondary" padding="md" className="border border-white/60 bg-white/60 shadow-xs">
            <View className="flex-row justify-between items-center mb-1.5">
              <Typography variant="caption" weight="bold" color="secondary" className="uppercase tracking-wider text-[10px]">
                Question {currentQuestion + 1} of {questions.length}
              </Typography>
              <Typography variant="caption" weight="bold" color="primary" className="text-[10px]">
                {currentQ?.subject || title || "Question"}
              </Typography>
            </View>
            <View className="h-1.5 bg-surface-secondary rounded-full overflow-hidden">
              <MotiView
                from={{ width: "0%" }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ type: "timing", duration: 250 }}
                className="h-full bg-primary rounded-full"
              />
            </View>
          </BentoCard>
        </SafeAreaView>
      </LinearGradient>

      {/* Question Content */}
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <MotiView
          key={currentQuestion}
          from={{ opacity: 0, translateX: 15 }}
          animate={{ opacity: 1, translateX: 0 }}
        >
          {/* Question Box */}
          <BentoCard variant="secondary" padding="lg" className="border border-border-subtle mb-4 bg-white shadow-xs">
            <Typography variant="title" weight="bold" color="primary" className="text-base leading-relaxed">
              {currentQ?.question}
            </Typography>

            {/* Question Diagram / Figure if present */}
            {Boolean(currentQ?.imageUrl) && (
              <View className="mt-3 rounded-2xl overflow-hidden border border-border-subtle bg-slate-50 items-center justify-center p-2">
                <Image
                  source={{ uri: currentQ.imageUrl }}
                  style={{ width: "100%", height: 180 }}
                  resizeMode="contain"
                  className="rounded-xl"
                />
              </View>
            )}
          </BentoCard>

          {/* Options */}
          <View className="gap-2.5">
            {currentQ?.options?.map((option, index) => {
              const isSelected = currentSelected === index;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSelectOption(index)}
                  className={twMerge(clsx(
                    "w-full p-3.5 rounded-2xl flex-row items-center gap-3.5 border transition-colors shadow-xs",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border-subtle bg-white"
                  ))}
                  activeOpacity={0.75}
                >
                  <View className={twMerge(clsx(
                    "w-8 h-8 rounded-xl items-center justify-center transition-colors",
                    isSelected ? "bg-primary" : "bg-surface-secondary"
                  ))}>
                    <Typography
                      weight="bold"
                      color={isSelected ? "inverse" : "primary"}
                      className="text-xs"
                    >
                      {String.fromCharCode(65 + index)}
                    </Typography>
                  </View>
                  <Typography
                    variant="body"
                    weight={isSelected ? "bold" : "regular"}
                    color="primary"
                    className="flex-1 text-xs leading-relaxed"
                  >
                    {option}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>
        </MotiView>
      </ScrollView>

      {/* Navigation Footer */}
      <View className="bg-white border-t border-border-subtle px-5 py-3 pb-7 shadow-lg">
        <View className="flex-row gap-2.5 mb-2.5">
          <Button
            variant="secondary"
            onPress={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex-1 py-2.5 rounded-xl border border-border-subtle"
          >
            <ChevronLeft size={14} color="#1C4966" /> Previous
          </Button>

          {currentQuestion < questions.length - 1 ? (
            <Button
              variant="primary"
              onPress={handleNext}
              className="flex-1 py-2.5 rounded-xl"
            >
              Next <ChevronRight size={14} color="white" />
            </Button>
          ) : (
            <Button
              variant="primary"
              onPress={handleSubmitConfirm}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600"
            >
              Finish & Submit 🏁
            </Button>
          )}
        </View>

        {/* Question Palette Indicator */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pt-1">
          <View className="flex-row gap-1.5">
            {questions.map((_, idx) => {
              const isAnswered = userAnswers[idx] !== undefined && userAnswers[idx] !== null;
              const isCurrent = idx === currentQuestion;

              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setCurrentQuestion(idx)}
                  className={`w-7 h-7 rounded-lg items-center justify-center border ${
                    isCurrent
                      ? "border-primary bg-primary"
                      : isAnswered
                      ? "border-emerald-400 bg-emerald-50"
                      : "border-border-subtle bg-surface-secondary/40"
                  }`}
                >
                  <Typography
                    weight="bold"
                    className={`text-[10px] ${
                      isCurrent
                        ? "text-white"
                        : isAnswered
                        ? "text-emerald-700"
                        : "text-secondary"
                    }`}
                  >
                    {idx + 1}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
