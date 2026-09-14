import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import {
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Award,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ScreenCapture from "expo-screen-capture";

import { Typography } from "../../components/Typography";
import { BentoCard } from "../../components/BentoCard";
import { Button } from "../../components/Button";
import { supabase } from "../../lib/supabase";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface PracticeQuestionItem {
  id: string | number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function ChapterPracticeScreen() {
  const router = useRouter();
  const { chapterId, chapterName, examType } = useLocalSearchParams<{
    chapterId?: string;
    chapterName?: string;
    examType?: string;
  }>();

  const [questions, setQuestions] = useState<PracticeQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  // Strict anti-screenshot and screen recording protection across Dedicated Practice Page
  ScreenCapture.usePreventScreenCapture("coaching_practice_page");

  useEffect(() => {
    let sub: any = null;
    try {
      sub = ScreenCapture.addScreenshotListener(() => {
        Alert.alert(
          "Security Policy Notice 🔒",
          "Screenshots and screen recordings are strictly disabled to protect learning materials.",
          [{ text: "I Understand" }]
        );
      });
    } catch (_) {}
    return () => {
      if (sub) sub.remove();
    };
  }, []);

  useEffect(() => {
    async function loadQuestions() {
      if (!chapterId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("coaching_practice_questions")
          .select("*")
          .eq("chapter_id", chapterId);

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped: PracticeQuestionItem[] = data.map((q: any, index: number) => {
            let rawOptions: string[] = [];
            if (Array.isArray(q.options)) {
              rawOptions = q.options;
            } else if (typeof q.options === "string") {
              try {
                const parsed = JSON.parse(q.options);
                if (Array.isArray(parsed)) rawOptions = parsed;
              } catch (_) {
                rawOptions = [q.options];
              }
            }

            const rawAns = q.correct_answer ?? q.correctAnswer;
            let correctIdx = 0;
            if (typeof rawAns === "number") {
              correctIdx = rawAns;
            } else if (typeof rawAns === "string") {
              const trimmed = rawAns.trim().toUpperCase();
              if (trimmed === "A" || trimmed === "0") correctIdx = 0;
              else if (trimmed === "B" || trimmed === "1") correctIdx = 1;
              else if (trimmed === "C" || trimmed === "2") correctIdx = 2;
              else if (trimmed === "D" || trimmed === "3") correctIdx = 3;
            }

            return {
              id: q.id || `q-${index}`,
              question: q.question || "",
              options: rawOptions,
              correctAnswer: correctIdx,
              explanation: q.explanation || "",
            };
          });

          setQuestions(mapped);
        } else {
          setQuestions([]);
        }
      } catch (err: any) {
        console.error("Error loading chapter practice questions:", err);
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [chapterId]);

  const attemptedCount = Object.keys(revealedAnswers).length;
  const correctCount = questions.filter((q, idx) => {
    const qKey = String(q.id || idx);
    return revealedAnswers[qKey] && selectedAnswers[qKey] === q.correctAnswer;
  }).length;

  const handleResetAll = () => {
    setSelectedAnswers({});
    setRevealedAnswers({});
  };

  const handleOptionSelect = (qKey: string, optIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qKey]: optIdx }));
    setRevealedAnswers((prev) => ({ ...prev, [qKey]: true }));
  };

  const handleRetryQuestion = (qKey: string) => {
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[qKey];
      return copy;
    });
    setRevealedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[qKey];
      return copy;
    });
  };

  return (
    <View className="flex-1 bg-surface-primary">
      {/* Header Banner */}
      <LinearGradient
        colors={["#FFFFFF", "#EDF5F8", "#E1EFF5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-4 pt-3 rounded-b-[28px] shadow-xs"
      >
        <SafeAreaView edges={["top"]}>
          <View className="flex-row items-center gap-3 mb-2">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-white/90 items-center justify-center border border-border-subtle shadow-xs"
              activeOpacity={0.8}
            >
              <ArrowLeft color="#1C4966" size={20} />
            </TouchableOpacity>

            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-0.5">
                {examType && (
                  <View className="bg-primary/10 px-2 py-0.5 rounded-md border border-primary/15">
                    <Typography variant="caption" weight="bold" color="primary" className="text-[11px]">
                      {examType}
                    </Typography>
                  </View>
                )}
                <View className="bg-white/80 px-2 py-0.5 rounded-md border border-border-subtle">
                  <Typography variant="caption" weight="bold" className="text-indigo-700 text-[10px]">
                    Practice & PYQs
                  </Typography>
                </View>
              </View>
              <Typography variant="title" weight="bold" color="primary" className="text-lg leading-snug">
                {chapterName || "Chapter Practice"}
              </Typography>
            </View>
          </View>

          {/* Progress / Stat Ribbon */}
          {questions.length > 0 && (
            <View className="flex-row items-center justify-between bg-white/90 px-3.5 py-2 rounded-xl border border-border-subtle/80 mt-1">
              <View className="flex-row items-center gap-2">
                <Award size={15} color="#1C4966" />
                <Typography variant="caption" color="secondary" className="text-xs">
                  Solved: <Typography weight="bold" color="primary">{attemptedCount} / {questions.length}</Typography>
                </Typography>
              </View>
              <View className="flex-row items-center gap-3">
                <Typography variant="caption" weight="bold" className="text-emerald-700 text-xs">
                  {correctCount} Correct
                </Typography>
                {attemptedCount > 0 && (
                  <TouchableOpacity onPress={handleResetAll} className="flex-row items-center gap-1">
                    <RotateCcw size={11} color="#64748B" />
                    <Typography variant="caption" className="text-secondary text-[11px]">
                      Reset
                    </Typography>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>

      {/* Main Content */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1C4966" />
          <Typography color="secondary" className="mt-4 text-xs">
            Loading practice questions...
          </Typography>
        </View>
      ) : questions.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-16 h-16 rounded-2xl bg-primary/10 items-center justify-center mb-4">
            <HelpCircle size={32} color="#1C4966" />
          </View>
          <Typography variant="heading" weight="bold" color="primary" className="mb-2 text-center text-base">
            No Practice Questions Yet
          </Typography>
          <Typography color="secondary" className="text-center mb-6 text-xs leading-relaxed max-w-[260px]">
            No previous year questions or chapter practice sets have been added for this chapter yet.
          </Typography>
          <Button onPress={() => router.back()} variant="primary" size="sm">
            Go Back
          </Button>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 18, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-3.5">
            {questions.map((q, qIdx) => {
              const qKey = String(q.id || qIdx);
              const selectedOpt = selectedAnswers[qKey];
              const isRevealed = revealedAnswers[qKey];
              const correctIdx = q.correctAnswer;

              return (
                <MotiView
                  key={qKey}
                  from={{ opacity: 0, translateY: 6 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: "timing", duration: 250, delay: qIdx * 40 }}
                >
                  <BentoCard
                    variant="secondary"
                    padding="md"
                    className="border border-border-subtle bg-white shadow-xs"
                  >
                    {/* Question Header */}
                    <View className="flex-row items-start gap-2 mb-3">
                      <View className="w-6 h-6 rounded-md bg-primary/10 items-center justify-center mt-0.5">
                        <Typography weight="bold" color="primary" className="text-[11px]">
                          {qIdx + 1}
                        </Typography>
                      </View>
                      <Typography weight="bold" color="primary" className="text-sm flex-1 leading-snug">
                        {q.question}
                      </Typography>
                    </View>

                    {/* Options */}
                    <View className="gap-2 mb-2">
                      {q.options.map((opt, optIdx) => {
                        const optionLabel = String.fromCharCode(65 + optIdx);
                        const isSelected = selectedOpt === optIdx;
                        const isCorrect = optIdx === correctIdx;

                        let optBg = "bg-surface-secondary/40 border-border-subtle";
                        let optTextColor = "text-primary";
                        let badgeBg = "bg-white text-secondary border border-border-subtle";

                        if (isRevealed) {
                          if (isCorrect) {
                            optBg = "bg-emerald-50 border-emerald-500";
                            optTextColor = "text-emerald-900 font-semibold";
                            badgeBg = "bg-emerald-500 text-white border-emerald-500";
                          } else if (isSelected && !isCorrect) {
                            optBg = "bg-rose-50 border-rose-400";
                            optTextColor = "text-rose-900";
                            badgeBg = "bg-rose-500 text-white border-rose-500";
                          }
                        } else if (isSelected) {
                          optBg = "bg-primary/10 border-primary";
                          optTextColor = "text-primary font-semibold";
                          badgeBg = "bg-primary text-white border-primary";
                        }

                        return (
                          <TouchableOpacity
                            key={optIdx}
                            activeOpacity={0.75}
                            onPress={() => handleOptionSelect(qKey, optIdx)}
                            className={twMerge(
                              clsx(
                                "flex-row items-center p-3 rounded-xl border transition-all",
                                optBg
                              )
                            )}
                          >
                            <View
                              className={twMerge(
                                clsx(
                                  "w-6 h-6 rounded-lg items-center justify-center mr-3 shadow-2xs",
                                  badgeBg
                                )
                              )}
                            >
                              <Typography variant="caption" weight="bold" className="text-xs">
                                {optionLabel}
                              </Typography>
                            </View>
                            <Typography
                              variant="caption"
                              className={twMerge(clsx("flex-1 text-xs leading-relaxed", optTextColor))}
                            >
                              {opt}
                            </Typography>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Answer Reveal & Explanation */}
                    {isRevealed && (
                      <View className="mt-2.5 pt-3 border-t border-border-subtle/80">
                        <View className="flex-row items-center justify-between mb-1.5">
                          <View className="flex-row items-center gap-1.5">
                            <CheckCircle size={14} color="#059669" />
                            <Typography variant="caption" weight="bold" className="text-emerald-700 text-xs">
                              Correct Answer: Option {String.fromCharCode(65 + correctIdx)}
                            </Typography>
                          </View>
                          <TouchableOpacity
                            onPress={() => handleRetryQuestion(qKey)}
                            className="flex-row items-center gap-1"
                          >
                            <RotateCcw size={10} color="#1C4966" />
                            <Typography variant="caption" weight="bold" color="primary" className="text-[10px]">
                              Retry
                            </Typography>
                          </TouchableOpacity>
                        </View>

                        {q.explanation ? (
                          <View className="bg-surface-secondary/60 p-2.5 rounded-lg border border-border-subtle/60 mt-1">
                            <Typography variant="caption" color="secondary" className="text-xs leading-relaxed">
                              {q.explanation}
                            </Typography>
                          </View>
                        ) : null}
                      </View>
                    )}
                  </BentoCard>
                </MotiView>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
