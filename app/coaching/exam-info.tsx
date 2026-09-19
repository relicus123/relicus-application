import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Info,
  List,
  Star,
  Briefcase,
  X,
  Send,
  Calendar,
  Layers,
  Video,
  FileText,
  MessageSquare,
  Award,
  BookOpen,
  Lock,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

import { Typography } from "../../components/Typography";
import { BentoCard } from "../../components/BentoCard";
import { Button } from "../../components/Button";
import { useAuthStore } from "../../store/auth.store";
import { useCoachingStore } from "../../store/coaching.store";
import { toTitleCase } from "../../constants/coaching/examFormatter";

export default function ExamInfoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const examType = params.examType as string;

  const {
    exams,
    userEnrollments,
    fetchUserEnrollment,
    requestCourseEnrollment,
    userAllowedCategoryIds,
    fetchUserCategoryAccess,
  } = useCoachingStore();
  const currentUser = useAuthStore((s) => s.currentUser);
  const cachedExam = exams.find((e) => e.id === examType);

  const [exam, setExam] = useState<any>(cachedExam || null);
  const [loading, setLoading] = useState(!cachedExam);
  const [refreshing, setRefreshing] = useState(false);
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);

  const enrollmentStatus = userEnrollments[examType]?.status || "none";
  const isAdmin = currentUser?.role === "admin";
  const examCategoryId = exam?.category_id || exam?.categoryId;
  const hasCategoryAccess = Boolean(examCategoryId && userAllowedCategoryIds.includes(examCategoryId));
  const hasAccess = isAdmin || hasCategoryAccess || enrollmentStatus === "active";

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchExam = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("coaching_exams")
        .select("*")
        .eq("id", examType)
        .maybeSingle();

      if (data) setExam(data);
    } catch (err) {
      console.error("Error fetching exam:", err);
    } finally {
      setLoading(false);
    }
  }, [examType]);

  useFocusEffect(
    useCallback(() => {
      fetchUserEnrollment(examType);
      fetchUserCategoryAccess();
      if (!cachedExam) {
        fetchExam();
      } else {
        (async () => {
          try {
            const { data } = await supabase
              .from("coaching_exams")
              .select("*")
              .eq("id", examType)
              .maybeSingle();
            if (data) setExam(data);
          } catch {}
        })();
      }
    }, [examType, cachedExam, fetchExam, fetchUserEnrollment, fetchUserCategoryAccess])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchExam(), fetchUserEnrollment(examType), fetchUserCategoryAccess()]);
    setRefreshing(false);
  };

  const handleStart = () => {
    router.push({
      pathname: "/coaching/dashboard" as any,
      params: { examType },
    });
  };

  const handleRequestAccess = async () => {
    setIsRequestingAccess(true);
    const res = await requestCourseEnrollment(examType, currentUser?.username, currentUser?.email);
    setIsRequestingAccess(false);
    if (res.success) {
      Alert.alert(
        "Request Submitted! 🎉",
        "Your access request to this coaching program has been sent to the Admin team. Once approved, all video lectures, study materials, and tests will be unlocked for you."
      );
    } else {
      Alert.alert("Request Failed", res.error || "Could not submit access request. Please try again.");
    }
  };

  const handleSubmitReview = async () => {
    if (!userRating) {
      Alert.alert("Rating Required", "Please select a star rating.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const { error } = await supabase.from("coaching_exam_feedbacks").insert({
        exam_id: examType,
        user_id: currentUser?.id || null,
        user_name: currentUser?.username || currentUser?.email?.split("@")[0] || "Student",
        rating: userRating,
        comment: userComment.trim() || "Great curriculum and study resources!",
      });

      if (error) throw error;

      Alert.alert("Review Submitted", "Thank you! Your rating and feedback have been received.");
      setShowReviewModal(false);
      setUserComment("");
      setUserRating(5);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading && !exam) {
    return (
      <View className="flex-1 bg-surface-primary justify-center items-center">
        <ActivityIndicator size="large" color="#1C4966" />
        <Typography color="secondary" className="mt-4">Loading Exam Details...</Typography>
      </View>
    );
  }

  if (!exam) {
    return (
      <View className="flex-1 bg-surface-primary justify-center items-center px-6">
        <Typography color="secondary" className="mb-4">Exam details not found.</Typography>
        <Button onPress={() => router.back()} variant="primary" className="w-full">
          Go Back
        </Button>
      </View>
    );
  }

  // Parse helper for lists that can be arrays, comma-separated strings, or JSON strings
  const parseList = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return parsed.filter(Boolean);
        } catch {}
      }
      return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  // Extract clean, single-sentence tagline (defensively strips any accidental table/field dumps)
  const getCleanTagline = (raw?: string) => {
    if (!raw) return "";
    const clean = raw.split(/(?:Expected Exam Date|\t|\r?\n|Difficulty Index|Overview Description)/i)[0].trim();
    return clean.length > 160 ? clean.slice(0, 160) + "..." : clean;
  };

  const cleanTitle = toTitleCase(exam.full_name || exam.id);
  const examDifficulty = Number(exam.difficulty_level) || 3;
  const examOverview = (exam.overview || "").trim();
  const cleanTagline = getCleanTagline(exam.tagline);
  const eligibility = parseList(exam.eligibility);
  const careers = parseList(exam.career_opportunities);
  const syllabusHighlights = parseList(exam.syllabus_topics);
  const examPattern = Array.isArray(exam.pattern) ? exam.pattern : [];

  return (
    <View className="flex-1 bg-surface-primary">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1C4966" />}
      >
        {/* Hero Header */}
        <LinearGradient
          colors={["#FFFFFF", "#EDF5F8", "#E1EFF5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-6 pb-6 pt-3 rounded-b-[32px] shadow-xs"
        >
          <SafeAreaView edges={["top"]}>
            {/* Top Navigation Bar */}
            <View className="flex-row items-center justify-between mb-3.5">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-white/90 items-center justify-center border border-border-subtle shadow-xs"
                activeOpacity={0.8}
              >
                <ArrowLeft color="#1C4966" size={20} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowReviewModal(true)}
                className="flex-row items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-full border border-border-subtle shadow-xs"
                activeOpacity={0.8}
              >
                <Star size={13} color="#F59E0B" fill="#F59E0B" />
                <Typography variant="caption" weight="bold" color="primary">Rate Exam</Typography>
              </TouchableOpacity>
            </View>

            {/* Badges Row */}
            <View className="flex-row items-center gap-2 mb-2.5 flex-wrap">
              <View className="bg-primary/10 px-3 py-1 rounded-lg border border-primary/15">
                <Typography variant="caption" weight="bold" color="primary" className="text-xs">
                  {exam.id}
                </Typography>
              </View>
              {exam.next_exam_date && (
                <View className="flex-row items-center gap-1.5 bg-white/90 px-3 py-1 rounded-lg border border-border-subtle shadow-2xs">
                  <Calendar size={12} color="#71818B" />
                  <Typography variant="caption" weight="medium" color="secondary" className="text-[11px]">
                    Target: {exam.next_exam_date}
                  </Typography>
                </View>
              )}
            </View>

            {/* Exam Title */}
            <Typography variant="title" weight="bold" color="primary" className="text-xl leading-snug mb-1.5">
              {cleanTitle}
            </Typography>

            {/* Clean Tagline */}
            {cleanTagline ? (
              <Typography color="secondary" className="text-sm leading-relaxed mb-3">
                {cleanTagline}
              </Typography>
            ) : null}

            {/* Difficulty Rating Bar */}
            <View className="flex-row items-center justify-between pt-2.5 border-t border-border-subtle/70">
              <Typography variant="caption" weight="medium" color="secondary">
                Difficulty Index: <Typography variant="caption" weight="bold" color="primary">{examDifficulty}/5 (Moderate)</Typography>
              </Typography>
              <View className="flex-row items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    color={i < examDifficulty ? "#F59E0B" : "#CBD5E1"}
                    fill={i < examDifficulty ? "#F59E0B" : "transparent"}
                  />
                ))}
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Content Body */}
        <View className="px-5 pt-4 gap-3.5">
          {/* Enrollment & Course Access Banner */}
          {hasAccess ? (
            <View className="flex-row items-center gap-2.5 bg-emerald-50 border border-emerald-200/80 p-3.5 rounded-2xl">
              <View className="w-8 h-8 rounded-xl bg-emerald-100 items-center justify-center">
                <CheckCircle2 size={18} color="#059669" />
              </View>
              <View className="flex-1">
                <Typography variant="caption" weight="bold" className="text-emerald-950 text-xs">
                  Enrolled Student • Full Access Granted
                </Typography>
                <Typography variant="caption" className="text-emerald-700 text-[10px]">
                  All video lessons, study materials, and tests are unlocked for your preparation.
                </Typography>
              </View>
            </View>
          ) : enrollmentStatus === "pending" ? (
            <View className="flex-row items-center gap-2.5 bg-amber-50 border border-amber-200/80 p-3.5 rounded-2xl">
              <View className="w-8 h-8 rounded-xl bg-amber-100 items-center justify-center">
                <Clock size={18} color="#D97706" />
              </View>
              <View className="flex-1">
                <Typography variant="caption" weight="bold" className="text-amber-950 text-xs">
                  Access Request Pending Admin Approval
                </Typography>
                <Typography variant="caption" className="text-amber-800 text-[10px]">
                  Your request has been submitted to the admin. You will receive an in-app notification once approved.
                </Typography>
              </View>
            </View>
          ) : enrollmentStatus === "rejected" ? (
            <View className="flex-row items-center gap-2.5 bg-rose-50 border border-rose-200/80 p-3.5 rounded-2xl">
              <View className="w-8 h-8 rounded-xl bg-rose-100 items-center justify-center">
                <ShieldAlert size={18} color="#E11D48" />
              </View>
              <View className="flex-1">
                <Typography variant="caption" weight="bold" className="text-rose-950 text-xs">
                  Access Request Declined
                </Typography>
                <Typography variant="caption" className="text-rose-800 text-[10px]">
                  Your request was not approved. Tap below to re-submit or contact admin support.
                </Typography>
              </View>
            </View>
          ) : (
            <View className="flex-row items-center gap-2.5 bg-sky-50 border border-sky-200/80 p-3.5 rounded-2xl">
              <View className="w-8 h-8 rounded-xl bg-sky-100 items-center justify-center">
                <Lock size={18} color="#0284C7" />
              </View>
              <View className="flex-1">
                <Typography variant="caption" weight="bold" className="text-sky-950 text-xs">
                  Course Access Approval Required
                </Typography>
                <Typography variant="caption" className="text-sky-800 text-[10px]">
                  This program requires admin permission. Tap "Request Course Access" below to get enrolled.
                </Typography>
              </View>
            </View>
          )}

          {/* About The Exam Card */}
          <BentoCard variant="secondary" padding="lg" className="border border-border-subtle bg-white shadow-xs">
            <View className="flex-row items-center gap-2.5 mb-2.5">
              <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                <Info size={16} color="#1C4966" />
              </View>
              <Typography variant="heading" weight="bold" color="primary" className="text-base">
                About the Exam
              </Typography>
            </View>

            <Typography color="secondary" className="leading-relaxed text-sm">
              {examOverview || "A state-level entrance examination for admission to undergraduate engineering and other professional courses. Comprehensive preparation course covering all sectional chapters, video lectures, and practice mock tests."}
            </Typography>

            {exam.next_exam_date && (
              <View className="flex-row items-center justify-between mt-3 p-3 rounded-xl bg-surface-secondary/70 border border-border-subtle">
                <Typography variant="caption" weight="medium" color="secondary">Upcoming Target Date</Typography>
                <Typography variant="caption" weight="bold" color="primary">{exam.next_exam_date}</Typography>
              </View>
            )}
          </BentoCard>

          {/* Preparation Modules Included (Clean 2x2 Grid) */}
          <BentoCard variant="secondary" padding="lg" className="border border-border-subtle bg-white shadow-xs">
            <Typography variant="heading" weight="bold" color="primary" className="text-base mb-3">
              Preparation Modules Included
            </Typography>
            <View className="flex-row flex-wrap gap-2.5">
              <View className="w-[48%] flex-row items-center gap-2.5 bg-surface-secondary/60 p-3 rounded-xl border border-border-subtle/60">
                <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
                  <Video size={15} color="#1C4966" />
                </View>
                <View className="flex-1">
                  <Typography weight="bold" color="primary" className="text-xs">Video Lessons</Typography>
                  <Typography variant="caption" color="secondary" className="text-[10px]">Lectures</Typography>
                </View>
              </View>

              <View className="w-[48%] flex-row items-center gap-2.5 bg-surface-secondary/60 p-3 rounded-xl border border-border-subtle/60">
                <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
                  <Award size={15} color="#1C4966" />
                </View>
                <View className="flex-1">
                  <Typography weight="bold" color="primary" className="text-xs">Mock Tests</Typography>
                  <Typography variant="caption" color="secondary" className="text-[10px]">CBT Series</Typography>
                </View>
              </View>

              <View className="w-[48%] flex-row items-center gap-2.5 bg-surface-secondary/60 p-3 rounded-xl border border-border-subtle/60">
                <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
                  <FileText size={15} color="#1C4966" />
                </View>
                <View className="flex-1">
                  <Typography weight="bold" color="primary" className="text-xs">Revision Notes</Typography>
                  <Typography variant="caption" color="secondary" className="text-[10px]">PDF Summary</Typography>
                </View>
              </View>

              <View className="w-[48%] flex-row items-center gap-2.5 bg-surface-secondary/60 p-3 rounded-xl border border-border-subtle/60">
                <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
                  <MessageSquare size={15} color="#1C4966" />
                </View>
                <View className="flex-1">
                  <Typography weight="bold" color="primary" className="text-xs">Doubt Desk</Typography>
                  <Typography variant="caption" color="secondary" className="text-[10px]">Faculty Help</Typography>
                </View>
              </View>
            </View>
          </BentoCard>

          {/* Eligibility Criteria (Clean Card List) */}
          {eligibility.length > 0 && (
            <BentoCard variant="secondary" padding="lg" className="border border-border-subtle bg-white shadow-xs">
              <View className="flex-row items-center gap-2.5 mb-3">
                <View className="w-8 h-8 rounded-xl bg-emerald-50 items-center justify-center">
                  <Check size={16} color="#059669" strokeWidth={2.5} />
                </View>
                <Typography variant="heading" weight="bold" color="primary" className="text-base">
                  Eligibility Criteria
                </Typography>
              </View>
              <View className="gap-2">
                {eligibility.map((crit: string, idx: number) => (
                  <View
                    key={idx}
                    className="flex-row items-start gap-2.5 p-2.5 rounded-xl bg-surface-secondary/40 border border-border-subtle/50"
                  >
                    <View className="w-4 h-4 rounded-full bg-emerald-500/15 items-center justify-center mt-0.5">
                      <Check size={10} color="#059669" strokeWidth={3} />
                    </View>
                    <Typography color="secondary" className="flex-1 text-xs leading-relaxed font-medium">
                      {crit}
                    </Typography>
                  </View>
                ))}
              </View>
            </BentoCard>
          )}

          {/* Syllabus Highlights (Clean Wrapped Chips) */}
          {syllabusHighlights.length > 0 && (
            <BentoCard variant="secondary" padding="lg" className="border border-border-subtle bg-white shadow-xs">
              <View className="flex-row items-center gap-2.5 mb-3">
                <View className="w-8 h-8 rounded-xl bg-indigo-50 items-center justify-center">
                  <BookOpen size={16} color="#4338CA" />
                </View>
                <Typography variant="heading" weight="bold" color="primary" className="text-base">
                  Syllabus Highlights
                </Typography>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {syllabusHighlights.map((topic: string, idx: number) => {
                  const cleanTopic = topic.replace(/^[•\s\-\*]+/, "").trim();
                  return (
                    <View
                      key={idx}
                      className="bg-indigo-50/70 border border-indigo-200/60 px-3 py-1.5 rounded-xl"
                    >
                      <Typography variant="caption" weight="medium" className="text-indigo-900 text-xs">
                        {cleanTopic}
                      </Typography>
                    </View>
                  );
                })}
              </View>
            </BentoCard>
          )}

          {/* Exam Pattern (Clean Sections) */}
          {examPattern.length > 0 && (
            <BentoCard variant="secondary" padding="lg" className="border border-border-subtle bg-white shadow-xs">
              <View className="flex-row items-center gap-2.5 mb-3">
                <View className="w-8 h-8 rounded-xl bg-primary/10 items-center justify-center">
                  <Layers size={16} color="#1C4966" />
                </View>
                <Typography variant="heading" weight="bold" color="primary" className="text-base">
                  Exam Pattern
                </Typography>
              </View>
              <View className="gap-2.5">
                {examPattern.map((pattern: any, idx: number) => (
                  <View key={idx} className="bg-surface-secondary/70 rounded-xl p-3 border border-border-subtle">
                    <Typography weight="bold" color="primary" className="text-xs mb-1.5">{pattern.section}</Typography>
                    <View className="flex-row justify-between items-center bg-white py-1.5 px-3 rounded-lg border border-border-subtle">
                      <View className="flex-row items-center gap-1.5">
                        <Typography variant="caption" color="secondary">Questions:</Typography>
                        <Typography variant="caption" weight="bold" color="primary">{pattern.questions}</Typography>
                      </View>
                      <View className="w-[1px] h-3 bg-border-subtle" />
                      <View className="flex-row items-center gap-1.5">
                        <Typography variant="caption" color="secondary">Marks:</Typography>
                        <Typography variant="caption" weight="bold" color="primary">{pattern.marks}</Typography>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </BentoCard>
          )}

          {/* Career Opportunities (Clean 2-Column Badges) */}
          {careers.length > 0 && (
            <BentoCard variant="secondary" padding="lg" className="border border-border-subtle bg-white shadow-xs">
              <View className="flex-row items-center gap-2.5 mb-3">
                <View className="w-8 h-8 rounded-xl bg-amber-50 items-center justify-center">
                  <Briefcase size={16} color="#D97706" />
                </View>
                <Typography variant="heading" weight="bold" color="primary" className="text-base">
                  Career Scope & Opportunities
                </Typography>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {careers.map((op: string, idx: number) => {
                  const cleanCareer = op.replace(/^[•\s\-\*]+/, "").trim();
                  return (
                    <View
                      key={idx}
                      className="flex-row items-center gap-1.5 bg-amber-50/70 border border-amber-200/60 px-3 py-1.5 rounded-xl"
                    >
                      <View className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <Typography variant="caption" weight="medium" className="text-amber-950 text-xs">
                        {cleanCareer}
                      </Typography>
                    </View>
                  );
                })}
              </View>
            </BentoCard>
          )}
        </View>
      </ScrollView>

      {/* Docked Bottom CTA Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white/95 border-t border-border-subtle px-6 py-3 pb-7 shadow-lg">
        {hasAccess ? (
          <Button
            onPress={handleStart}
            variant="primary"
            className="w-full py-3.5 rounded-2xl shadow-sm"
          >
            <View className="flex-row items-center justify-center gap-2">
              <Typography weight="bold" color="inverse" className="text-sm">Start Preparation</Typography>
              <ArrowRight size={16} color="white" />
            </View>
          </Button>
        ) : (
          <View className="gap-2">
            <Button
              onPress={handleStart}
              variant="primary"
              className="w-full py-3.5 rounded-2xl shadow-sm bg-primary"
            >
              <View className="flex-row items-center justify-center gap-2">
                <Video size={16} color="white" />
                <Typography weight="bold" color="inverse" className="text-sm">Explore & Watch Free Demo 🎬</Typography>
              </View>
            </Button>

            {enrollmentStatus === "pending" ? (
              <View className="py-2 px-3 rounded-xl bg-amber-50 border border-amber-200 flex-row items-center justify-center gap-1.5">
                <Clock size={14} color="#D97706" />
                <Typography weight="bold" className="text-amber-900 text-xs">Full Course Access: Pending Approval</Typography>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleRequestAccess}
                disabled={isRequestingAccess}
                className="py-1.5 items-center justify-center flex-row gap-1.5"
                activeOpacity={0.7}
              >
                {isRequestingAccess ? (
                  <ActivityIndicator size="small" color="#1C4966" />
                ) : (
                  <>
                    <Lock size={13} color="#1C4966" />
                    <Typography weight="bold" color="primary" className="text-xs underline">
                      {enrollmentStatus === "rejected" ? "Re-request Full Course Access 🔄" : "Request Full Course Access 🚀"}
                    </Typography>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 gap-4">
            <View className="flex-row justify-between items-center border-b border-border-subtle pb-3">
              <Typography variant="heading" weight="bold" color="primary">Rate & Review Exam</Typography>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <X size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Typography variant="caption" color="secondary">
              Share your feedback for {cleanTitle}.
            </Typography>

            {/* Stars selector */}
            <View className="flex-row justify-center gap-3 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setUserRating(star)}
                  className="p-1"
                >
                  <Star
                    size={36}
                    color={star <= userRating ? "#F59E0B" : "#CBD5E1"}
                    fill={star <= userRating ? "#F59E0B" : "transparent"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View className="gap-1">
              <Typography variant="caption" weight="bold" color="secondary">Your Review & Comments</Typography>
              <TextInput
                value={userComment}
                onChangeText={setUserComment}
                placeholder="Share your thoughts about this exam course..."
                multiline
                numberOfLines={4}
                className="w-full border border-border-subtle rounded-2xl p-3 text-sm bg-slate-50"
                textAlignVertical="top"
              />
            </View>

            <Button
              onPress={handleSubmitReview}
              variant="primary"
              className="w-full py-3.5"
              disabled={isSubmittingReview}
            >
              {isSubmittingReview ? (
                <ActivityIndicator color="white" />
              ) : (
                <View className="flex-row items-center justify-center gap-2">
                  <Send size={16} color="white" />
                  <Typography weight="bold" color="inverse">Submit Review</Typography>
                </View>
              )}
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}
