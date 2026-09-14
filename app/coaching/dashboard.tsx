import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
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
  ChevronDown,
  Play,
  Trash2,
  Send,
  HelpCircle,
  CheckCircle,
  Bell,
  Calendar,
  Sparkles,
  Flame,
  Target,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCoachingStore } from "../../store/coaching.store";
import { supabase } from "../../lib/supabase";
import { Typography } from "../../components/Typography";
import { BentoCard, BentoCardPressable } from "../../components/BentoCard";
import { Button } from "../../components/Button";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as ScreenCapture from "expo-screen-capture";
import { toTitleCase } from "../../constants/coaching/examFormatter";
import { CoachingVideoPlayerModal } from "../../components/coaching/CoachingVideoPlayerModal";
import { CoachingPDFViewerModal } from "../../components/coaching/CoachingPDFViewerModal";
import { getExamDataset } from "./data/examRegistry";

export default function CoachingDashboard() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const examType = (params.examType as string) || "EAMCET";

  const {
    exams,
    subjectsByExam,
    chaptersBySubject,
    liveClassesByExam,
    mockTestsByExam,
    fetchExamDashboard,
    fetchChapters,
    doubts,
    addDoubt,
    learningStreak,
    testAttempts,
    fetchCoachingData,
    notesByExam,
    clearTestAttempts,
  } = useCoachingStore();

  const exam = exams.find((e) => e.id?.toLowerCase() === examType.toLowerCase()) || null;
  const examTitle = toTitleCase(exam?.full_name || exam?.id || examType);
  const examBadge = exam?.id || examType;

  // Fallback to local offline dataset if database has not yet seeded or network is offline
  const localDataset = useMemo(() => {
    try {
      return getExamDataset(examType as any);
    } catch {
      return null;
    }
  }, [examType]);

  // Deduplicate subjects cleanly by ID and normalized name (with fallback)
  const rawSubjects = (subjectsByExam[examType] && subjectsByExam[examType].length > 0)
    ? subjectsByExam[examType]
    : (localDataset?.subjects || []);

  const subjects = useMemo(() => {
    const seenIds = new Set<string>();
    const seenNames = new Set<string>();
    return rawSubjects.filter((s: any) => {
      if (!s || !s.id) return false;
      const normName = (s.name || "").toLowerCase().trim();
      if (seenIds.has(s.id) || seenNames.has(normName)) return false;
      seenIds.add(s.id);
      seenNames.add(normName);
      return true;
    });
  }, [rawSubjects]);

  const liveClasses = liveClassesByExam[examType] || [];
  const mockTests = (mockTestsByExam[examType] && mockTestsByExam[examType].length > 0)
    ? mockTestsByExam[examType]
    : (localDataset?.mockTests || []);
  const allExamNotes = notesByExam[examType] || [];

  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [loading, setLoading] = useState(!exam && subjects.length === 0);

  useEffect(() => {
    async function loadData() {
      if (!exam && subjects.length === 0) {
        setLoading(true);
      }
      await fetchExamDashboard(examType, true);
      setLoading(false);
    }
    loadData();
  }, [examType]);

  // Keep selectedSubjectId synchronized with valid subjects list
  useEffect(() => {
    if (subjects.length > 0) {
      if (!selectedSubjectId || !subjects.some((s) => s.id === selectedSubjectId)) {
        setSelectedSubjectId(subjects[0].id);
      }
    }
  }, [subjects, selectedSubjectId]);

  useEffect(() => {
    if (selectedSubjectId) {
      fetchChapters(selectedSubjectId);
    }
  }, [selectedSubjectId, fetchChapters]);

  const dbChapters = (selectedSubjectId && chaptersBySubject[selectedSubjectId]) || [];
  const chapters = dbChapters.length > 0
    ? dbChapters
    : (localDataset?.chapters?.filter((c: any) => c.subjectId === selectedSubjectId || c.subject === selectedSubjectId) || []);

  const currentNotes = useMemo(() => {
    return allExamNotes.filter((n: any) => n.chapter?.subject_id === selectedSubjectId || !selectedSubjectId);
  }, [allExamNotes, selectedSubjectId]);

  const [activeTab, setActiveTab] = useState<"overview" | "chapters" | "live" | "tests" | "doubt" | "analytics">("overview");
  const [doubtText, setDoubtText] = useState("");
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // In-App Secure Video & PDF Player States
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [activeVideoChapter, setActiveVideoChapter] = useState<any>(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);

  const [activePdfNote, setActivePdfNote] = useState<any>(null);
  const [activePdfChapterName, setActivePdfChapterName] = useState<string>("");
  const [pdfModalVisible, setPdfModalVisible] = useState(false);

  // Strict anti-screenshot and screen recording protection across Preparation Hub
  ScreenCapture.usePreventScreenCapture("coaching_preparation_hub");

  useEffect(() => {
    let sub: any = null;
    try {
      sub = ScreenCapture.addScreenshotListener(() => {
        Alert.alert(
          "Security Policy Notice 🔒",
          "Screenshots and screen recordings are strictly disabled on the Preparation Hub to protect learning materials.",
          [{ text: "I Understand" }]
        );
      });
    } catch (_) {}
    return () => {
      if (sub) sub.remove();
    };
  }, []);

  const handleOpenVideo = (video: any, chapter: any) => {
    if (!video.url) {
      Alert.alert("Video Lesson", "No video URL specified for this lesson.");
      return;
    }
    setActiveVideo(video);
    setActiveVideoChapter(chapter);
    setVideoModalVisible(true);
  };

  const handleOpenPdf = (note: any, chapterName?: string) => {
    if (!note.pdf_url) {
      Alert.alert("Document", "No PDF document attached to this revision note.");
      return;
    }
    setActivePdfNote(note);
    setActivePdfChapterName(chapterName || note.chapter?.name || "");
    setPdfModalVisible(true);
  };

  useEffect(() => {
    fetchCoachingData();
  }, [fetchCoachingData]);

  useEffect(() => {
    if (examType) {
      supabase
        .from("coaching_announcements")
        .select("*")
        .eq("exam_id", examType)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          if (data) setAnnouncements(data);
        });
    }
  }, [examType]);

  const handleToggleVideoWatched = async (video: any) => {
    const newWatched = !video.is_watched;
    try {
      await supabase
        .from("coaching_videos")
        .update({ is_watched: newWatched })
        .eq("id", video.id);

      if (selectedSubjectId) {
        fetchChapters(selectedSubjectId, true);
      }
    } catch {}
  };

  const handleBack = () => {
    router.back();
  };

  const handleAddDoubt = async () => {
    if (!doubtText.trim()) return;
    try {
      await addDoubt({
        id: Math.random().toString(),
        examType: examType as any,
        title: `${activeSubjectName} Doubt`,
        description: doubtText,
        status: "open",
        createdAt: new Date().toISOString(),
        responses: [],
      });
      setDoubtText("");
      Alert.alert("Submitted", "Your doubt has been submitted to the Doubt Desk!");
    } catch (err: any) {
      Alert.alert("Submission Failed", err?.message || "Could not submit doubt. Please try again.");
    }
  };

  const handleStartTest = (test: any) => {
    const questionCount = test.questions_count ?? test.questions?.length ?? 0;
    if (questionCount === 0) {
      Alert.alert(
        "No Questions Added",
        `"${test.name}" does not have any questions yet. Please add questions to this test from the Admin Panel first.`
      );
      return;
    }
    router.push({
      pathname: "/coaching/test" as any,
      params: {
        id: test.id,
        title: test.name,
        duration: String(test.duration || 1800),
        examType: examType,
      },
    });
  };

  const activeSubjectObj = subjects.find((s) => s.id === selectedSubjectId);
  const activeSubjectName = activeSubjectObj ? toTitleCase(activeSubjectObj.name) : "General";

  const currentDoubts = useMemo(() => {
    return doubts.filter((d) => d.examType === examType && (!selectedSubjectId || d.title.startsWith(activeSubjectName)));
  }, [doubts, examType, selectedSubjectId, activeSubjectName]);

  // REAL dynamic syllabus progress calculation (0% if newly enrolled)
  const coveragePercent = useMemo(() => {
    if (!chapters || chapters.length === 0) return 0;
    const totalProgress = chapters.reduce((sum: number, ch: any) => sum + (Number(ch.progress) || 0), 0);
    return Math.min(100, Math.max(0, Math.round(totalProgress / chapters.length)));
  }, [chapters]);

  // Real streak calculation (clean string)
  const streakText = learningStreak > 0 ? `Streak: ${learningStreak} days 🔥` : "Day 1 🔥";

  if (loading) {
    return (
      <View className="flex-1 bg-surface-primary justify-center items-center">
        <ActivityIndicator size="large" color="#1C4966" />
        <Typography color="secondary" className="mt-4 text-sm">Loading Preparation Hub...</Typography>
      </View>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "chapters", label: "Chapters", icon: BookOpen },
    { id: "live", label: "Live", icon: Video },
    { id: "tests", label: "Mock Tests", icon: Award },
    { id: "doubt", label: "Doubts Desk", icon: MessageSquare },
    { id: "analytics", label: "Analytics", icon: BarChart },
  ];

  return (
    <View className="flex-1 bg-surface-primary">
      {/* Header Banner */}
      <LinearGradient
        colors={["#FFFFFF", "#EDF5F8", "#E1EFF5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pb-5 pt-3 rounded-b-[32px] shadow-xs"
      >
        <SafeAreaView edges={["top"]}>
          {/* Top Bar */}
          <View className="flex-row items-center gap-3.5 mb-3">
            <TouchableOpacity
              onPress={handleBack}
              className="w-10 h-10 rounded-full bg-white/90 items-center justify-center border border-border-subtle shadow-xs"
              activeOpacity={0.8}
            >
              <ArrowLeft color="#1C4966" size={20} />
            </TouchableOpacity>

            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-1 flex-wrap">
                <View className="bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/15">
                  <Typography variant="caption" weight="bold" color="primary" className="text-xs">
                    {examBadge}
                  </Typography>
                </View>
                <View className="flex-row items-center gap-1 bg-white/80 px-2.5 py-0.5 rounded-md border border-border-subtle">
                  <Flame size={12} color="#D97706" />
                  <Typography variant="caption" weight="bold" className="text-amber-800 text-[11px]">
                    {streakText}
                  </Typography>
                </View>
              </View>

              <Typography variant="title" weight="bold" color="primary" className="text-xl leading-snug">
                Preparation Hub
              </Typography>
              <Typography variant="caption" color="secondary" numberOfLines={2} className="text-xs leading-tight mt-0.5">
                {examTitle}
              </Typography>
            </View>
          </View>

          {/* Subject Streams Horizontal Selector (Deduplicated) */}
          {subjects.length > 0 && (
            <View className="mt-2">
              <Typography variant="caption" weight="medium" color="secondary" className="mb-2 text-xs">
                Select Stream / Subject:
              </Typography>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
                <View className="flex-row gap-2">
                  {subjects.map((subject) => {
                    const active = selectedSubjectId === subject.id;
                    const cleanSubName = toTitleCase(subject.name);
                    return (
                      <Pressable
                        key={subject.id}
                        onPress={() => setSelectedSubjectId(subject.id)}
                        className={twMerge(clsx(
                          "px-4 py-2 rounded-xl border flex-row items-center gap-1.5 transition-colors shadow-2xs",
                          active
                            ? "bg-primary border-primary"
                            : "bg-white/90 border-border-subtle"
                        ))}
                      >
                        <Typography
                          variant="caption"
                          weight="bold"
                          color={active ? "inverse" : "primary"}
                          className="text-xs"
                        >
                          {cleanSubName}
                        </Typography>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>

      {/* Tabs Selector */}
      <View className="bg-surface-primary border-b border-border-subtle/80 py-2.5">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5" contentContainerStyle={{ paddingRight: 40 }}>
          <View className="flex-row gap-2">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id as any)}
                  className={twMerge(clsx(
                    "px-3.5 py-2 rounded-xl flex-row items-center gap-1.5 transition-colors",
                    active
                      ? "bg-primary shadow-xs"
                      : "bg-white border border-border-subtle"
                  ))}
                >
                  <tab.icon color={active ? "white" : "#1C4966"} size={14} />
                  <Typography
                    variant="caption"
                    weight="bold"
                    color={active ? "inverse" : "primary"}
                    className="text-xs"
                  >
                    {tab.label}
                  </Typography>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Main Tab Content */}
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="gap-3.5">
            {/* Announcements (if any) */}
            {announcements.length > 0 && (
              <BentoCard variant="secondary" padding="md" className="border border-border-subtle bg-white shadow-xs">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2">
                    <Bell size={17} color="#1C4966" />
                    <Typography variant="heading" weight="bold" color="primary" className="text-sm">
                      Faculty Announcements
                    </Typography>
                  </View>
                  <View className="bg-primary/10 px-2 py-0.5 rounded-full">
                    <Typography variant="caption" weight="bold" color="primary" className="text-[10px]">
                      {announcements.length} New
                    </Typography>
                  </View>
                </View>
                <View className="gap-2">
                  {announcements.map((ann: any) => (
                    <View key={ann.id} className="p-3 bg-surface-secondary/60 rounded-xl border border-border-subtle">
                      <View className="flex-row justify-between items-start mb-1">
                        <Typography weight="bold" color="primary" className="flex-1 mr-2 text-xs">{ann.title}</Typography>
                        <Typography variant="caption" color="secondary" className="text-[10px]">
                          {new Date(ann.created_at).toLocaleDateString()}
                        </Typography>
                      </View>
                      <Typography variant="caption" color="secondary" className="leading-relaxed text-[11px]">
                        {ann.content}
                      </Typography>
                    </View>
                  ))}
                </View>
              </BentoCard>
            )}

            {/* Real Dynamic Syllabus Coverage Card */}
            <BentoCard variant="secondary" padding="lg" className="border border-border-subtle bg-white shadow-xs">
              <View className="flex-row justify-between items-center mb-1">
                <View className="flex-row items-center gap-2">
                  <Target size={18} color="#1C4966" />
                  <Typography variant="heading" weight="bold" color="primary" className="text-base">
                    Syllabus Coverage
                  </Typography>
                </View>
                <View className="bg-primary/10 px-2.5 py-0.5 rounded-full">
                  <Typography variant="caption" weight="bold" color="primary" className="text-xs">
                    {coveragePercent}%
                  </Typography>
                </View>
              </View>

              <Typography variant="caption" color="secondary" className="mb-3 text-xs">
                Active Subject: {activeSubjectName} • {chapters.length} {chapters.length === 1 ? "Chapter" : "Chapters"}
              </Typography>

              {/* Dynamic Progress Bar */}
              <View className="h-2.5 bg-surface-secondary rounded-full overflow-hidden mb-2.5">
                <View
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${coveragePercent}%` }}
                />
              </View>

              <Typography variant="caption" color="secondary" className="text-xs leading-relaxed">
                {coveragePercent === 0
                  ? "You just started coaching! Open chapter lessons to begin building your progress."
                  : `${coveragePercent}% of ${activeSubjectName} curriculum completed.`}
              </Typography>

              {chapters.length > 0 && (
                <TouchableOpacity
                  onPress={() => setActiveTab("chapters")}
                  className="mt-3.5 pt-3 border-t border-border-subtle/70 flex-row items-center justify-between"
                  activeOpacity={0.7}
                >
                  <Typography weight="bold" color="primary" className="text-xs">
                    Open {activeSubjectName} Chapters
                  </Typography>
                  <ChevronRight size={14} color="#1C4966" />
                </TouchableOpacity>
              )}
            </BentoCard>

            {/* Quick Action Navigation Grid */}
            <View className="flex-row flex-wrap gap-2.5">
              <TouchableOpacity
                onPress={() => setActiveTab("chapters")}
                className="w-[48%] bg-white p-3.5 rounded-2xl border border-border-subtle shadow-xs"
                activeOpacity={0.8}
              >
                <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center mb-2">
                  <BookOpen size={16} color="#1C4966" />
                </View>
                <Typography weight="bold" color="primary" className="text-xs mb-0.5">Chapters</Typography>
                <Typography variant="caption" color="secondary" className="text-[10px]">
                  {chapters.length} available
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab("tests")}
                className="w-[48%] bg-white p-3.5 rounded-2xl border border-border-subtle shadow-xs"
                activeOpacity={0.8}
              >
                <View className="w-8 h-8 rounded-xl bg-amber-500/10 items-center justify-center mb-2">
                  <Award size={16} color="#D97706" />
                </View>
                <Typography weight="bold" color="primary" className="text-xs mb-0.5">Mock Tests</Typography>
                <Typography variant="caption" color="secondary" className="text-[10px]">
                  {mockTests.length} practice sets
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab("chapters")}
                className="w-[48%] bg-white p-3.5 rounded-2xl border border-border-subtle shadow-xs"
                activeOpacity={0.8}
              >
                <View className="w-8 h-8 rounded-xl bg-indigo-500/10 items-center justify-center mb-2">
                  <FileText size={16} color="#4338CA" />
                </View>
                <Typography weight="bold" color="primary" className="text-xs mb-0.5">Revision Notes</Typography>
                <Typography variant="caption" color="secondary" className="text-[10px]">
                  {currentNotes.length} documents
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab("doubt")}
                className="w-[48%] bg-white p-3.5 rounded-2xl border border-border-subtle shadow-xs"
                activeOpacity={0.8}
              >
                <View className="w-8 h-8 rounded-xl bg-emerald-500/10 items-center justify-center mb-2">
                  <MessageSquare size={16} color="#059669" />
                </View>
                <Typography weight="bold" color="primary" className="text-xs mb-0.5">Doubt Desk</Typography>
                <Typography variant="caption" color="secondary" className="text-[10px]">
                  Ask faculty
                </Typography>
              </TouchableOpacity>
            </View>

            {/* Daily Study Goals Card */}
            <BentoCard variant="secondary" padding="lg" className="border border-border-subtle bg-white shadow-xs">
              <Typography variant="heading" weight="bold" color="primary" className="text-base mb-3">
                Daily Study Goals
              </Typography>
              <View className="flex-row gap-3 items-center mb-2.5 bg-surface-secondary/40 p-3 rounded-xl border border-border-subtle/50">
                <CheckCircle size={16} color="#059669" />
                <Typography color="secondary" className="flex-1 text-xs leading-relaxed">
                  Complete chapter lessons in {activeSubjectName}
                </Typography>
              </View>
              <View className="flex-row gap-3 items-center bg-surface-secondary/40 p-3 rounded-xl border border-border-subtle/50">
                <HelpCircle size={16} color="#1C4966" />
                <Typography color="secondary" className="flex-1 text-xs leading-relaxed">
                  Attempt a practice mock quiz on {activeSubjectName}
                </Typography>
              </View>
            </BentoCard>
          </MotiView>
        )}

        {/* CHAPTERS TAB */}
        {activeTab === "chapters" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="gap-3">
            {chapters.length > 0 ? (
              chapters.map((chapter: any) => {
                const isExpanded = expandedChapterId === chapter.id;
                const chapterVideos = chapter.videos || [];
                const chapterNotes = chapter.notes || [];
                const chapterQuestions = chapter.practiceQuestions || chapter.practice_questions || [];
                const cleanChName = toTitleCase(chapter.name);

                return (
                  <BentoCard key={chapter.id} variant="secondary" padding="md" className="border border-border-subtle bg-white shadow-xs">
                    <View className="flex-row justify-between items-center mb-2.5">
                      <Typography weight="bold" color="primary" className="flex-1 mr-2 text-sm leading-snug">
                        {cleanChName}
                      </Typography>
                      <View className="bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                        <Typography variant="caption" weight="bold" className="text-emerald-700 text-[10px]">
                          {chapter.progress || 0}% Done
                        </Typography>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => setExpandedChapterId(isExpanded ? null : chapter.id)}
                      className="flex-row items-center justify-between py-2 px-3 rounded-xl bg-surface-secondary/80 border border-border-subtle"
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center gap-2">
                        <BookOpen size={15} color="#1C4966" />
                        <Typography weight="bold" color="primary" className="text-xs">
                          {isExpanded ? "Hide Resources" : "Study Materials & Questions"}
                        </Typography>
                      </View>
                      <View className="flex-row items-center gap-1.5">
                        <Typography variant="caption" color="secondary" className="text-[11px]">
                          {chapterVideos.length} v • {chapterNotes.length} n{chapterQuestions.length > 0 ? ` • ${chapterQuestions.length} q` : ""}
                        </Typography>
                        {isExpanded ? <ChevronDown size={15} color="#1C4966" /> : <ChevronRight size={15} color="#1C4966" />}
                      </View>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View className="mt-3.5 pt-3 border-t border-border-subtle gap-3">
                        {/* Video Lectures */}
                        <View>
                          <View className="flex-row items-center gap-1.5 mb-2">
                            <Video size={14} color="#1C4966" />
                            <Typography weight="bold" color="primary" className="text-xs">Video Lessons</Typography>
                          </View>
                          {chapterVideos.length > 0 ? (
                            <View className="gap-2">
                              {chapterVideos.map((v: any) => (
                                <TouchableOpacity
                                  key={v.id}
                                  onPress={() => handleOpenVideo(v, chapter)}
                                  className="flex-row items-center justify-between p-2.5 rounded-xl bg-surface-secondary/50 border border-border-subtle active:bg-surface-secondary"
                                >
                                  <View className="flex-1 mr-2">
                                    <Typography weight="bold" color="primary" numberOfLines={1} className="text-xs">
                                      {v.title}
                                    </Typography>
                                    <Typography variant="caption" color="secondary" className="text-[10px]">
                                      {v.duration || "Video Lesson"}
                                    </Typography>
                                  </View>
                                  <View className="flex-row items-center gap-1.5">
                                    {v.is_watched && (
                                      <View className="flex-row items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                        <CheckCircle size={10} color="#059669" />
                                        <Typography variant="caption" weight="bold" className="text-emerald-700 text-[10px]">Watched</Typography>
                                      </View>
                                    )}
                                    <View className="flex-row items-center gap-1 bg-primary px-2.5 py-1 rounded-lg">
                                      <Play size={10} color="white" fill="white" />
                                      <Typography variant="caption" weight="bold" color="inverse" className="text-[10px]">Play</Typography>
                                    </View>
                                  </View>
                                </TouchableOpacity>
                              ))}
                            </View>
                          ) : (
                            <Typography variant="caption" color="secondary" className="italic px-1 text-xs">
                              No video lessons uploaded for this chapter yet.
                            </Typography>
                          )}
                        </View>

                        {/* Study Materials & Notes */}
                        <View>
                          <View className="flex-row items-center gap-1.5 mb-2">
                            <FileText size={14} color="#1C4966" />
                            <Typography weight="bold" color="primary" className="text-xs">Revision Notes & PDFs</Typography>
                          </View>
                          {chapterNotes.length > 0 ? (
                            <View className="gap-2">
                              {chapterNotes.map((n: any) => (
                                <TouchableOpacity
                                  key={n.id}
                                  onPress={() => handleOpenPdf(n, chapter.name)}
                                  className="flex-row items-center justify-between p-2.5 rounded-xl bg-surface-secondary/50 border border-border-subtle active:bg-surface-secondary"
                                >
                                  <View className="flex-1 mr-2">
                                    <Typography weight="bold" color="primary" numberOfLines={1} className="text-xs">{n.title}</Typography>
                                    <Typography variant="caption" color="secondary" className="text-[10px]">{n.size || "PDF Document"}</Typography>
                                  </View>
                                  <View className="bg-primary/10 px-2.5 py-1 rounded-lg">
                                    <Typography variant="caption" weight="bold" color="primary" className="text-[10px]">Open 📥</Typography>
                                  </View>
                                </TouchableOpacity>
                              ))}
                            </View>
                          ) : (
                            <Typography variant="caption" color="secondary" className="italic px-1 text-xs">
                              No revision notes uploaded for this chapter yet.
                            </Typography>
                          )}
                        </View>

                        {/* Chapter Practice Questions & PYQs Navigation Card */}
                        <View>
                          <View className="flex-row items-center justify-between mb-2">
                            <View className="flex-row items-center gap-1.5">
                              <HelpCircle size={14} color="#1C4966" />
                              <Typography weight="bold" color="primary" className="text-xs">Practice Questions & PYQs</Typography>
                            </View>
                            {chapterQuestions.length > 0 && (
                              <View className="bg-primary/10 px-2 py-0.5 rounded-full">
                                <Typography variant="caption" weight="bold" color="primary" className="text-[10px]">
                                  {chapterQuestions.length} {chapterQuestions.length === 1 ? "Question" : "Questions"}
                                </Typography>
                              </View>
                            )}
                          </View>

                          <TouchableOpacity
                            onPress={() => {
                              router.push({
                                pathname: "/coaching/practice" as any,
                                params: {
                                  chapterId: chapter.id,
                                  chapterName: cleanChName,
                                  examType: examType,
                                },
                              });
                            }}
                            className="flex-row items-center justify-between p-3 rounded-xl bg-surface-secondary/60 border border-border-subtle active:bg-surface-secondary"
                            activeOpacity={0.7}
                          >
                            <View className="flex-1 mr-2">
                              <Typography weight="bold" color="primary" numberOfLines={1} className="text-xs">
                                {cleanChName} Practice Questions
                              </Typography>
                              <Typography variant="caption" color="secondary" className="text-[10px]">
                                {chapterQuestions.length > 0
                                  ? `${chapterQuestions.length} questions available • PYQ & Practice`
                                  : "No questions uploaded yet"}
                              </Typography>
                            </View>
                            <View className="flex-row items-center gap-1 bg-primary px-3 py-1.5 rounded-lg">
                              <Typography variant="caption" weight="bold" color="inverse" className="text-[10px]">
                                Practice 📝
                              </Typography>
                              <ChevronRight size={12} color="white" />
                            </View>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </BentoCard>
                );
              })
            ) : (
              <BentoCard variant="secondary" padding="lg" className="border border-border-subtle bg-white items-center py-10 shadow-xs">
                <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center mb-3">
                  <BookOpen size={22} color="#1C4966" />
                </View>
                <Typography weight="bold" color="primary" className="text-sm mb-1 text-center">
                  No Chapters Published Yet
                </Typography>
                <Typography variant="caption" color="secondary" className="text-center text-xs mb-4 max-w-[260px] leading-relaxed">
                  Study chapters for {activeSubjectName} are currently being configured by the coaching faculty.
                </Typography>
                {mockTests.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => setActiveTab("tests")}
                  >
                    Take a Mock Test
                  </Button>
                )}
              </BentoCard>
            )}
          </MotiView>
        )}

        {/* LIVE TAB */}
        {activeTab === "live" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="gap-3">
            {liveClasses.length > 0 ? (
              liveClasses.map((cls: any) => (
                <BentoCard key={cls.id} variant="secondary" padding="md" className="border border-border-subtle bg-white flex-row items-center shadow-xs">
                  <View className="flex-1 pr-3">
                    <Typography variant="caption" weight="bold" color="primary" className="mb-0.5 text-xs uppercase tracking-wider">
                      {activeSubjectName}
                    </Typography>
                    <Typography weight="bold" color="primary" className="text-sm mb-1">{cls.topic}</Typography>
                    <Typography variant="caption" color="secondary" className="text-xs">{new Date(cls.scheduled_time).toLocaleString()}</Typography>
                  </View>
                  <Button 
                    size="sm" 
                    variant={cls.status === "ongoing" ? "primary" : "outline"}
                    onPress={() => {
                      if (cls.url) {
                        Linking.openURL(cls.url).catch(() => Alert.alert("Error", "Could not open broadcast URL."));
                      } else {
                        Alert.alert("Live Session", "Stream link will become active when session begins.");
                      }
                    }}
                  >
                    {cls.status === "ongoing" ? "🔴 Join Live" : "View Stream"}
                  </Button>
                </BentoCard>
              ))
            ) : (
              <BentoCard variant="secondary" padding="lg" className="border border-border-subtle bg-white items-center py-10 shadow-xs">
                <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center mb-3">
                  <Video size={22} color="#1C4966" />
                </View>
                <Typography weight="bold" color="primary" className="text-sm mb-1 text-center">
                  No Live Classes Scheduled
                </Typography>
                <Typography variant="caption" color="secondary" className="text-center text-xs">
                  Upcoming faculty sessions for {activeSubjectName} will appear here.
                </Typography>
              </BentoCard>
            )}
          </MotiView>
        )}

        {/* MOCK TESTS TAB */}
        {activeTab === "tests" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="gap-3">
            {mockTests.length > 0 ? (
              mockTests.map((test: any) => (
                <BentoCard key={test.id} variant="secondary" padding="md" className="border border-border-subtle bg-white flex-row items-center shadow-xs">
                  <View className="flex-1 pr-3">
                    <Typography weight="bold" color="primary" className="text-sm mb-1">{test.name}</Typography>
                    <Typography variant="caption" color="secondary" className="text-xs">
                      {test.questions_count ?? 0} Questions • {Math.round((test.duration || 1800) / 60)} Mins
                    </Typography>
                  </View>
                  <Button 
                    size="sm" 
                    variant="primary"
                    onPress={() => handleStartTest(test)}
                  >
                    Start Test
                  </Button>
                </BentoCard>
              ))
            ) : (
              <BentoCard variant="secondary" padding="lg" className="border border-border-subtle bg-white items-center py-10 shadow-xs">
                <View className="w-12 h-12 rounded-2xl bg-amber-500/10 items-center justify-center mb-3">
                  <Award size={22} color="#D97706" />
                </View>
                <Typography weight="bold" color="primary" className="text-sm mb-1 text-center">
                  No Mock Tests Found
                </Typography>
                <Typography variant="caption" color="secondary" className="text-center text-xs">
                  Mock assessments will appear here when configured.
                </Typography>
              </BentoCard>
            )}
          </MotiView>
        )}


        {/* DOUBT DESK TAB */}
        {activeTab === "doubt" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="gap-3.5">
            <BentoCard variant="secondary" padding="md" className="border border-border-subtle bg-white shadow-xs">
              <Typography variant="heading" weight="bold" color="primary" className="text-base mb-1">
                Ask a Doubt
              </Typography>
              <Typography variant="caption" color="secondary" className="mb-3 text-xs">
                Post your question to faculty mentors.
              </Typography>
              <View className="flex-row gap-2">
                <TextInput
                  placeholder={`Question about ${activeSubjectName}...`}
                  placeholderTextColor="#87959D"
                  value={doubtText}
                  onChangeText={setDoubtText}
                  className="flex-1 bg-surface-secondary/60 border border-border-subtle rounded-xl px-3.5 py-2 text-xs text-text-primary"
                />
                <TouchableOpacity 
                  onPress={handleAddDoubt} 
                  className="w-10 h-10 bg-primary rounded-xl items-center justify-center shadow-xs"
                >
                  <Send size={15} color="white" />
                </TouchableOpacity>
              </View>
            </BentoCard>

            <View className="gap-2">
              <Typography variant="heading" weight="bold" color="primary" className="text-xs">
                Your Doubt Queue
              </Typography>
              {currentDoubts.length > 0 ? (
                currentDoubts.map((doubt: any) => (
                  <BentoCard key={doubt.id} variant="secondary" padding="md" className="border border-border-subtle bg-white shadow-xs">
                    <Typography weight="bold" color="primary" className="text-xs mb-1.5">{doubt.description}</Typography>
                    <View className="flex-row justify-between items-center pt-2 border-t border-border-subtle">
                      <View className={`px-2 py-0.5 rounded-md ${doubt.status?.toLowerCase() === 'resolved' ? 'bg-emerald-500/15' : 'bg-amber-500/10'}`}>
                        <Typography variant="caption" weight="bold" className={`text-[10px] ${doubt.status?.toLowerCase() === 'resolved' ? 'text-emerald-800' : 'text-amber-800'}`}>
                          STATUS: {doubt.status?.toUpperCase() || 'OPEN'}
                        </Typography>
                      </View>
                      <Typography variant="caption" color="secondary" className="text-[10px]">
                        {new Date(doubt.createdAt).toLocaleDateString()}
                      </Typography>
                    </View>
                    {doubt.responses && Array.isArray(doubt.responses) && doubt.responses.length > 0 && (
                      <View className="mt-2.5 pt-2 border-t border-border-subtle/80 bg-teal-500/5 p-2.5 rounded-xl border border-teal-500/20">
                        <Typography variant="caption" weight="bold" className="text-teal-800 text-[10px] mb-1">
                          Mentor Answer:
                        </Typography>
                        {doubt.responses.map((resp: any, idx: number) => (
                          <Typography key={idx} variant="caption" color="primary" className="text-xs text-text-primary">
                            {resp.message || resp.response || String(resp)}
                          </Typography>
                        ))}
                      </View>
                    )}
                  </BentoCard>
                ))
              ) : (
                <Typography color="secondary" className="text-center py-4 text-xs">
                  No doubts submitted yet for {activeSubjectName}.
                </Typography>
              )}
            </View>
          </MotiView>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="gap-3.5">
            <View className="flex-row justify-between items-center">
              <Typography variant="heading" weight="bold" color="primary" className="text-sm">
                Mock Test History
              </Typography>
              {testAttempts.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      "Clear History",
                      "Are you sure you want to clear test attempts?",
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "Clear", style: "destructive", onPress: () => clearTestAttempts() },
                      ]
                    );
                  }}
                  className="flex-row items-center gap-1 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-200"
                >
                  <Trash2 size={12} color="#EF4444" />
                  <Typography variant="caption" weight="bold" className="text-red-500 text-[10px]">Clear</Typography>
                </TouchableOpacity>
              )}
            </View>
            {testAttempts.length > 0 ? (
              <View className="gap-2">
                {testAttempts.map((attempt: any) => (
                  <BentoCard key={attempt.testId || attempt.id} variant="secondary" padding="md" className="border border-border-subtle flex-row items-center bg-white shadow-xs">
                    <View className="flex-1">
                      <Typography weight="bold" color="primary" className="text-xs mb-0.5">{attempt.testName}</Typography>
                      <Typography variant="caption" color="secondary" className="text-[10px]">{new Date(attempt.date || Date.now()).toLocaleDateString()}</Typography>
                    </View>
                    <View className="items-end">
                      <Typography variant="heading" weight="bold" className="text-primary text-sm">{attempt.score}%</Typography>
                      <Typography variant="caption" color="secondary" className="text-[9px]">Score</Typography>
                    </View>
                  </BentoCard>
                ))}
              </View>
            ) : (
              <BentoCard variant="secondary" padding="lg" className="border border-border-subtle bg-white items-center py-10 shadow-xs">
                <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center mb-3">
                  <BarChart size={22} color="#1C4966" />
                </View>
                <Typography weight="bold" color="primary" className="text-sm mb-1 text-center">
                  No Tests Attempted Yet
                </Typography>
                <Typography variant="caption" color="secondary" className="text-center text-xs">
                  Attempt a mock test to track your analytics and percentile.
                </Typography>
              </BentoCard>
            )}
          </MotiView>
        )}
      </ScrollView>

      {/* In-App DRM Video Player Modal */}
      <CoachingVideoPlayerModal
        visible={videoModalVisible}
        video={activeVideo}
        chapter={activeVideoChapter}
        onClose={() => {
          setVideoModalVisible(false);
          setActiveVideo(null);
          setActiveVideoChapter(null);
        }}
        onVideoWatched={(videoId, newWatched, chapterProgress) => {
          if (selectedSubjectId) {
            fetchChapters(selectedSubjectId, true);
          }
        }}
      />

      {/* In-App Protected PDF Viewer Modal */}
      <CoachingPDFViewerModal
        visible={pdfModalVisible}
        note={activePdfNote}
        chapterName={activePdfChapterName}
        onClose={() => {
          setPdfModalVisible(false);
          setActivePdfNote(null);
        }}
      />
    </View>
  );
}
