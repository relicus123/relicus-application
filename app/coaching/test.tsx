import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
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
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

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
}

export default function MockTest() {
  const router = useRouter();
  const { id, title, duration, examType } = useLocalSearchParams<{
    id?: string;
    title?: string;
    duration?: string;
    examType?: string;
  }>();

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(Number(duration) || 1800);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<{
    scorePercent: number;
    correct: number;
    incorrect: number;
    unattempted: number;
    total: number;
    timeSpent: number;
  } | null>(null);

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

  useEffect(() => {
    if (loading || isSubmitted || questions.length === 0) return;
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
  }, [loading, isSubmitted, questions.length]);

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
      "Submit Mock Test",
      unansweredCount > 0
        ? `You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`
        : "Are you sure you want to finish and submit your test?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Submit", style: "default", onPress: handleSubmit },
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
      answers: questions.map((_, idx) => userAnswers[idx] ?? null),
      topicAnalysis: [],
      sectionAnalysis: [],
    };

    try {
      await useCoachingStore.getState().addTestAttempt(testAttemptData);
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

  const progressPercentage = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <View className="flex-1 bg-surface-primary justify-center items-center">
        <ActivityIndicator size="large" color="#1C4966" />
        <Typography color="secondary" className="mt-4">
          Loading Test Questions...
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
          "{title || "This test"}" does not contain any questions yet. Questions added in the coaching panel will appear here.
        </Typography>
        <Button onPress={() => router.back()} variant="primary" className="w-full">
          Go Back
        </Button>
      </View>
    );
  }

  // Result Screen
  if (isSubmitted && result) {
    return (
      <View className="flex-1 bg-surface-primary">
        <LinearGradient
          colors={["#FFFFFF", "#EDF5F8", "#E1EFF5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-6 pb-8 pt-8 rounded-b-[36px] shadow-sm"
        >
          <SafeAreaView edges={["top"]}>
            <View className="items-center mb-4">
              <View className="bg-emerald-500/10 px-3 py-1 rounded-full mb-2">
                <Typography variant="caption" weight="bold" className="text-emerald-700 text-xs">
                  TEST COMPLETED
                </Typography>
              </View>
              <Typography variant="heading" weight="bold" color="primary" className="text-xl text-center">
                {title || "Mock Test"}
              </Typography>
            </View>

            <View className="items-center justify-center bg-white rounded-3xl p-6 border border-border-subtle mx-2 shadow-xs">
              <Typography variant="caption" weight="bold" color="secondary" className="uppercase tracking-wider text-xs">
                Performance Score
              </Typography>
              <Typography variant="display" weight="bold" className="text-primary text-5xl my-2">
                {result.scorePercent}%
              </Typography>
              <Typography variant="caption" color="secondary" className="text-xs">
                {result.correct} of {result.total} Questions Correct
              </Typography>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View className="flex-row gap-2.5 mb-4">
            <BentoCard variant="secondary" padding="md" className="flex-1 items-center bg-emerald-50/70 border border-emerald-200">
              <CheckCircle2 size={22} color="#059669" />
              <Typography weight="bold" className="text-emerald-700 text-base mt-1">
                {result.correct}
              </Typography>
              <Typography variant="caption" color="secondary" className="text-[11px]">Correct</Typography>
            </BentoCard>

            <BentoCard variant="secondary" padding="md" className="flex-1 items-center bg-red-50/70 border border-red-200">
              <XCircle size={22} color="#DC2626" />
              <Typography weight="bold" className="text-red-700 text-base mt-1">
                {result.incorrect}
              </Typography>
              <Typography variant="caption" color="secondary" className="text-[11px]">Incorrect</Typography>
            </BentoCard>

            <BentoCard variant="secondary" padding="md" className="flex-1 items-center bg-surface-secondary border border-border-subtle">
              <HelpCircle size={22} color="#71818B" />
              <Typography weight="bold" color="primary" className="text-base mt-1">
                {result.unattempted}
              </Typography>
              <Typography variant="caption" color="secondary" className="text-[11px]">Skipped</Typography>
            </BentoCard>
          </View>

          <BentoCard variant="secondary" padding="md" className="border border-border-subtle mb-5 bg-white shadow-xs">
            <View className="flex-row justify-between items-center py-2.5 border-b border-border-subtle">
              <Typography color="secondary" className="text-sm">Time Spent</Typography>
              <Typography weight="bold" color="primary" className="text-sm">{formatTime(result.timeSpent)}</Typography>
            </View>
            <View className="flex-row justify-between items-center py-2.5">
              <Typography color="secondary" className="text-sm">Accuracy Rate</Typography>
              <Typography weight="bold" color="primary" className="text-sm">{result.scorePercent}%</Typography>
            </View>
          </BentoCard>

          <Button onPress={() => router.back()} variant="primary" className="w-full py-3.5 rounded-2xl">
            Return to Dashboard
          </Button>
        </ScrollView>
      </View>
    );
  }

  const currentQ = questions[currentQuestion];
  const currentSelected = userAnswers[currentQuestion];

  return (
    <View className="flex-1 bg-surface-primary">
      {/* Test Top Bar */}
      <LinearGradient
        colors={["#FFFFFF", "#EDF5F8", "#E1EFF5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-5 pt-3 rounded-b-[36px] shadow-sm"
      >
        <SafeAreaView edges={["top"]}>
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "Leave Test",
                  "Are you sure you want to exit? Your progress will not be saved.",
                  [
                    { text: "Continue Test", style: "cancel" },
                    { text: "Exit", style: "destructive", onPress: () => router.back() },
                  ]
                );
              }}
              className="w-10 h-10 rounded-full bg-white/80 items-center justify-center border border-border-subtle shadow-xs"
            >
              <ArrowLeft color="#1C4966" size={20} />
            </TouchableOpacity>

            <View className="flex-row items-center gap-2 bg-white/90 px-3.5 py-1.5 rounded-full border border-border-subtle shadow-xs">
              <Clock color="#1C4966" size={15} />
              <Typography variant="body" weight="bold" color="primary" className="text-xs">
                {formatTime(timeRemaining)}
              </Typography>
            </View>
          </View>

          {/* Progress Card */}
          <BentoCard variant="secondary" padding="md" className="border border-white/60 bg-white/60 shadow-xs">
            <View className="flex-row justify-between items-center mb-2">
              <Typography variant="caption" weight="bold" color="secondary" className="uppercase tracking-wider text-[11px]">
                Question {currentQuestion + 1} of {questions.length}
              </Typography>
              <Typography variant="caption" weight="bold" color="primary" className="text-[11px]">
                {currentQ?.subject || title || "Question"}
              </Typography>
            </View>
            <View className="h-2 bg-surface-secondary rounded-full overflow-hidden">
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
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        <MotiView
          key={currentQuestion}
          from={{ opacity: 0, translateX: 15 }}
          animate={{ opacity: 1, translateX: 0 }}
        >
          {/* Question Text Box */}
          <BentoCard variant="secondary" padding="lg" className="border border-border-subtle mb-4 bg-white shadow-xs">
            <Typography variant="title" weight="bold" color="primary" className="text-base leading-relaxed">
              {currentQ?.question}
            </Typography>
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
                    "w-9 h-9 rounded-xl items-center justify-center transition-colors",
                    isSelected ? "bg-primary" : "bg-surface-secondary"
                  ))}>
                    <Typography
                      weight="bold"
                      color={isSelected ? "inverse" : "primary"}
                      className="text-sm"
                    >
                      {String.fromCharCode(65 + index)}
                    </Typography>
                  </View>
                  <Typography
                    variant="body"
                    weight={isSelected ? "bold" : "regular"}
                    color="primary"
                    className="flex-1 text-sm leading-relaxed"
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
        <View className="flex-row gap-3 mb-3">
          <Button
            onPress={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
            className="flex-1 py-2.5 rounded-xl"
          >
            <View className="flex-row items-center justify-center gap-1">
              <ChevronLeft color={currentQuestion === 0 ? "#AAB5BB" : "#1C4966"} size={18} />
              <Typography weight="bold" color={currentQuestion === 0 ? "secondary" : "primary"} className="text-xs">
                Previous
              </Typography>
            </View>
          </Button>

          {currentQuestion < questions.length - 1 ? (
            <Button
              onPress={handleNext}
              variant="primary"
              className="flex-1 py-2.5 rounded-xl"
            >
              <View className="flex-row items-center justify-center gap-1">
                <Typography weight="bold" color="inverse" className="text-xs">Next</Typography>
                <ChevronRight color="white" size={18} />
              </View>
            </Button>
          ) : (
            <Button
              onPress={handleSubmitConfirm}
              variant="primary"
              className="flex-1 py-2.5 rounded-xl !bg-emerald-600"
            >
              <View className="flex-row items-center justify-center gap-1.5">
                <Flag color="white" size={16} />
                <Typography weight="bold" color="inverse" className="text-xs">Submit Test</Typography>
              </View>
            </Button>
          )}
        </View>

        {/* Question Number Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-1">
          <View className="flex-row gap-1.5">
            {questions.map((_, index) => {
              const isCurrent = index === currentQuestion;
              const isAnswered = userAnswers[index] !== undefined;

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => setCurrentQuestion(index)}
                  className={twMerge(clsx(
                    "w-8 h-8 rounded-lg items-center justify-center transition-colors border",
                    isCurrent
                      ? "bg-primary border-primary"
                      : isAnswered
                      ? "bg-emerald-500/20 border-emerald-500/40"
                      : "bg-surface-secondary border-border-subtle"
                  ))}
                >
                  <Typography
                    variant="caption"
                    weight="bold"
                    color={isCurrent ? "inverse" : (isAnswered ? "primary" : "secondary")}
                    className="text-[11px]"
                  >
                    {index + 1}
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
