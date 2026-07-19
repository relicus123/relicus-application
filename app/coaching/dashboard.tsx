import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator
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
  CheckCircle,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCoachingStore } from "../../store/coaching.store";
import { supabase } from "../../lib/supabase";
import { Typography } from "../../components/Typography";
import { GlassSurface } from "../../components/GlassSurface";
import { BentoCard, BentoCardPressable } from "../../components/BentoCard";
import { Button } from "../../components/Button";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export default function CoachingDashboard() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const examType = params.examType as string;

  const [exam, setExam] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [mockTests, setMockTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  React.useEffect(() => {
    async function fetchExam() {
      try {
        const { data: examData } = await supabase
          .from("coaching_exams")
          .select("*")
          .eq("id", examType)
          .single();
        if (examData) setExam(examData);

        const { data: subjectsData } = await supabase
          .from("coaching_subjects")
          .select("*")
          .eq("exam_id", examType);
        if (subjectsData) setSubjects(subjectsData);

        const { data: liveData } = await supabase
          .from("coaching_live_classes")
          .select("*")
          .eq("exam_id", examType);
        if (liveData) setLiveClasses(liveData);

        const { data: testsData } = await supabase
          .from("coaching_mock_tests")
          .select("*")
          .eq("exam_id", examType);
        if (testsData) setMockTests(testsData);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchExam();
  }, [examType]);

  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  React.useEffect(() => {
    if (subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects]);

  React.useEffect(() => {
    if (!selectedSubjectId) return;
    async function fetchChapters() {
      const { data } = await supabase.from("coaching_chapters").select("*").eq("subject_id", selectedSubjectId);
      if (data) setChapters(data);
    }
    fetchChapters();
  }, [selectedSubjectId]);
  
  const [activeTab, setActiveTab] = useState<"overview" | "chapters" | "live" | "tests" | "pyqs" | "doubt" | "analytics">("overview");

  const [doubtText, setDoubtText] = useState("");
  const { doubts, addDoubt, learningStreak, testAttempts, addTestAttempt, fetchCoachingData } = useCoachingStore();

  React.useEffect(() => {
    fetchCoachingData();
  }, [fetchCoachingData]);

  const handleBack = () => {
    router.back();
  };

  const handleAddDoubt = async () => {
    if (!doubtText.trim()) return;
    await addDoubt({
      id: Math.random().toString(),
      examType: examType as any,
      title: `${selectedSubjectId} Doubt`,
      description: doubtText,
      status: "open",
      createdAt: new Date().toISOString(),
      responses: [],
    });
    setDoubtText("");
    alert("Your doubt has been submitted to the Doubt Desk!");
  };

  const handleStartTest = async (testName: string) => {
    const score = Math.floor(Math.random() * 40) + 60; // Mock score 60-100%
    await addTestAttempt({
      testId: Math.random().toString(),
      testName: testName,
      examType: examType as any,
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
    return doubts.filter((d) => d.examType === examType && d.title.startsWith(selectedSubjectId));
  }, [doubts, examType, selectedSubjectId]);

  const activeSubjectName = subjects.find(s => s.id === selectedSubjectId)?.name || "";

  if (loading) {
    return (
      <View className="flex-1 bg-surface-primary justify-center items-center">
        <ActivityIndicator size="large" color="#4f378a" />
        <Typography color="secondary" className="mt-4">Loading Exam Details...</Typography>
      </View>
    );
  }

  if (!exam) {
    return (
      <View className="flex-1 bg-surface-primary justify-center items-center px-6">
        <Typography color="secondary" className="mb-4">Exam details not found.</Typography>
        <Button onPress={handleBack} variant="primary" className="w-full">
          Go Back
        </Button>
      </View>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "chapters", label: "Chapters", icon: BookOpen },
    { id: "live", label: "Live", icon: Video },
    { id: "tests", label: "Mock Tests", icon: Award },
    { id: "pyqs", label: "PYQs", icon: FileText },
    { id: "doubt", label: "Doubts Desk", icon: MessageSquare },
    { id: "analytics", label: "Analytics", icon: BarChart },
  ];

  return (
    <View className="flex-1 bg-surface-primary">
      <LinearGradient
        colors={["#fdf7ff", "#e9ddff", "#cfbcff"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-6 pt-8 rounded-b-[40px]"
      >
        <SafeAreaView edges={["top"]}>
          <View className="flex-row items-center gap-4 mb-6">
            <TouchableOpacity 
              onPress={handleBack}
              className="w-10 h-10 rounded-full bg-white/40 items-center justify-center border border-white/50"
            >
              <ArrowLeft color="#4f378a" size={20} />
            </TouchableOpacity>
            <View className="flex-1">
              <Typography variant="title" weight="bold" color="primary">{exam.name} Prep Hub</Typography>
              <Typography variant="caption" color="secondary">Streak: {learningStreak} days 🔥</Typography>
            </View>
          </View>

          {subjects.length > 0 && (
            <View>
              <Typography variant="caption" weight="bold" color="secondary" className="mb-3 opacity-80 uppercase tracking-wider">
                Active Stream / Subject
              </Typography>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
                <View className="flex-row gap-3">
                  {subjects.map((subject) => {
                    const active = selectedSubjectId === subject.id;
                    return (
                      <TouchableOpacity
                        key={subject.id}
                        onPress={() => setSelectedSubjectId(subject.id)}
                        className={twMerge(clsx(
                          "px-5 py-2.5 rounded-full border border-white/40 flex-row items-center",
                          active ? "bg-white border-white/60 shadow-sm" : "bg-white/30"
                        ))}
                      >
                        <Typography 
                          variant="body" 
                          weight="bold" 
                          color="primary"
                          className={clsx(active ? "opacity-100" : "opacity-70")}
                        >
                          {subject.name}
                        </Typography>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>

      <View className="bg-surface-primary border-b border-border-subtle py-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6" contentContainerStyle={{ paddingRight: 48 }}>
          <View className="flex-row gap-2">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id as any)}
                  className={twMerge(clsx(
                    "px-4 py-2 rounded-xl flex-row items-center gap-2",
                    active ? "bg-primary" : "bg-primary/5"
                  ))}
                >
                  <tab.icon color={active ? "white" : "#4f378a"} size={16} />
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
          </View>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        {activeTab === "overview" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="gap-4">
            <BentoCard variant="secondary" padding="md" className="border border-border-subtle">
              <Typography variant="heading" weight="bold" color="primary" className="mb-4">Daily Study Goals</Typography>
              <View className="flex-row gap-3 items-center mb-3">
                <CheckCircle size={20} color="#10B981" />
                <Typography color="secondary" className="flex-1">Complete 1 chapter video lesson in {activeSubjectName}</Typography>
              </View>
              <View className="flex-row gap-3 items-center">
                <HelpCircle size={20} color="#3B82F6" />
                <Typography color="secondary" className="flex-1">Attempt a practice quiz on {activeSubjectName}</Typography>
              </View>
            </BentoCard>

            <BentoCard variant="secondary" padding="md" className="border border-border-subtle">
              <Typography variant="heading" weight="bold" color="primary" className="mb-1">Syllabus Coverage</Typography>
              <Typography variant="caption" color="secondary" className="mb-4">Active Subject: {activeSubjectName}</Typography>
              <View className="h-2.5 bg-border-subtle rounded-full overflow-hidden mb-2">
                <View className="h-full bg-accent-primary rounded-full w-[45%]" />
              </View>
              <Typography variant="caption" weight="bold" color="primary">45% of Syllabus Covered</Typography>
            </BentoCard>
          </MotiView>
        )}

        {activeTab === "chapters" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="gap-4">
            {chapters.length > 0 ? chapters.map((chapter, idx) => (
              <BentoCard key={chapter.id} variant="secondary" padding="md" className="border border-border-subtle">
                <View className="flex-row justify-between items-center mb-4">
                  <Typography variant="heading" weight="bold" color="primary">{chapter.name}</Typography>
                  <View className="bg-green-500/10 px-2 py-1 rounded-lg">
                    <Typography variant="caption" weight="bold" className="text-green-600">Progress: {chapter.progress}%</Typography>
                  </View>
                </View>
                <BentoCardPressable variant="flat" padding="sm" className="flex-row items-center border border-border-subtle bg-surface-primary">
                  <BookOpen size={16} color="#4f378a" className="mr-3" />
                  <Typography weight="bold" color="primary" className="flex-1">View Study Materials</Typography>
                  <ChevronRight size={16} color="#79747e" />
                </BentoCardPressable>
              </BentoCard>
            )) : <Typography color="secondary" className="text-center py-8">No chapters available for {activeSubjectName}.</Typography>}
          </MotiView>
        )}

        {activeTab === "live" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="gap-4">
            {liveClasses.length > 0 ? liveClasses.map((cls, idx) => (
              <BentoCard key={cls.id} variant="secondary" padding="md" className="border border-border-subtle flex-row items-center">
                <View className="flex-1 pr-4">
                  <Typography variant="caption" weight="bold" color="secondary" className="mb-1 text-accent-primary uppercase tracking-wider">{activeSubjectName}</Typography>
                  <Typography variant="heading" weight="bold" color="primary" className="mb-2">{cls.topic}</Typography>
                  <Typography variant="caption" color="secondary">{new Date(cls.scheduled_time).toLocaleString()}</Typography>
                </View>
                <Button 
                  size="sm" 
                  variant={cls.status === 'ongoing' ? "primary" : "outline"}
                >
                  {cls.status === 'ongoing' ? 'Join' : 'Notify'}
                </Button>
              </BentoCard>
            )) : <Typography color="secondary" className="text-center py-8">No live classes scheduled.</Typography>}
          </MotiView>
        )}

        {activeTab === "tests" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="gap-4">
            {mockTests.length > 0 ? mockTests.map((test) => (
              <BentoCard key={test.id} variant="secondary" padding="md" className="border border-border-subtle flex-row items-center">
                <View className="flex-1 pr-4">
                  <Typography variant="heading" weight="bold" color="primary" className="mb-1">{test.name}</Typography>
                  <Typography variant="caption" color="secondary">{test.questions_count} Questions • {Math.round(test.duration / 60)} Minutes</Typography>
                </View>
                <Button 
                  size="sm" 
                  onPress={() => handleStartTest(test.name)}
                >
                  Start
                </Button>
              </BentoCard>
            )) : <Typography color="secondary" className="text-center py-8">No mock tests available.</Typography>}
          </MotiView>
        )}

        {activeTab === "pyqs" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="gap-3">
            {[2025, 2024, 2023, 2022].map((year) => (
              <BentoCardPressable 
                key={year} 
                variant="secondary" 
                padding="md" 
                className="flex-row items-center border border-border-subtle"
                onPress={() => alert(`Downloading PDF: PYQ ${year} Paper...`)}
              >
                <LinearGradient
                  colors={["#fdf7ff", "#e9ddff"]}
                  className="w-10 h-10 rounded-lg items-center justify-center mr-4"
                >
                  <FileText size={18} color="#4f378a" />
                </LinearGradient>
                <Typography weight="bold" color="primary" className="flex-1">{activeSubjectName} - PYQ Paper {year}</Typography>
                <Typography variant="caption" color="secondary" weight="bold" className="text-accent-primary">PDF 📥</Typography>
              </BentoCardPressable>
            ))}
          </MotiView>
        )}

        {activeTab === "doubt" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="gap-4">
            <BentoCard variant="secondary" padding="md" className="border border-border-subtle">
              <Typography variant="heading" weight="bold" color="primary" className="mb-2">Ask a Doubt</Typography>
              <Typography variant="caption" color="secondary" className="mb-4">Write your question below. An expert mentor will answer within 24 hours.</Typography>
              <View className="flex-row gap-3">
                <TextInput
                  placeholder="Type your question..."
                  placeholderTextColor="#79747e"
                  value={doubtText}
                  onChangeText={setDoubtText}
                  className="flex-1 bg-white border border-border-subtle rounded-xl px-4 py-3 font-inter text-primary text-base"
                />
                <TouchableOpacity 
                  onPress={handleAddDoubt} 
                  className="w-12 h-12 bg-primary rounded-xl items-center justify-center shadow-sm"
                >
                  <Send size={18} color="white" />
                </TouchableOpacity>
              </View>
            </BentoCard>

            <View className="mt-4 gap-3">
              <Typography variant="heading" weight="bold" color="primary" className="mb-2">Doubts Queue</Typography>
              {currentDoubts.length > 0 ? (
                currentDoubts.map((doubt) => (
                  <BentoCard key={doubt.id} variant="secondary" padding="md" className="border border-border-subtle bg-white">
                    <Typography weight="bold" color="primary" className="mb-3">{doubt.description}</Typography>
                    <View className="flex-row justify-between items-center pt-3 border-t border-border-subtle">
                      <View className="bg-orange-500/10 px-2 py-1 rounded-md">
                        <Typography variant="caption" weight="bold" className="text-orange-600">Status: {doubt.status.toUpperCase()}</Typography>
                      </View>
                      <Typography variant="caption" color="secondary">{new Date(doubt.createdAt).toLocaleDateString()}</Typography>
                    </View>
                  </BentoCard>
                ))
              ) : (
                <Typography color="secondary" className="text-center py-4">No doubts submitted yet for {activeSubjectName}.</Typography>
              )}
            </View>
          </MotiView>
        )}

        {activeTab === "analytics" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="gap-4">
            <Typography variant="heading" weight="bold" color="primary" className="mb-2">Test History</Typography>
            {testAttempts.length > 0 ? (
              <View className="gap-3">
                {testAttempts.map((attempt) => (
                  <BentoCard key={attempt.testId} variant="secondary" padding="md" className="border border-border-subtle flex-row items-center bg-white">
                    <View className="flex-1">
                      <Typography weight="bold" color="primary" className="mb-1">{attempt.testName}</Typography>
                      <Typography variant="caption" color="secondary">{new Date(attempt.date).toLocaleDateString()}</Typography>
                    </View>
                    <View className="items-end">
                      <Typography variant="heading" weight="bold" className="text-accent-primary">{attempt.score}%</Typography>
                      <Typography variant="caption" color="secondary">Score</Typography>
                    </View>
                  </BentoCard>
                ))}
              </View>
            ) : (
              <Typography color="secondary" className="text-center py-8">No tests attempted yet. Go to Mock Tests tab and try an exam!</Typography>
            )}
          </MotiView>
        )}
      </ScrollView>
    </View>
  );
}
