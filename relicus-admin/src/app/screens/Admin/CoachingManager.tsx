import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import * as XLSX from "xlsx";
import { 
  Plus, Trash2, Edit2, GraduationCap, Video, FileText, Check, AlertCircle, X, 
  Sparkles, Book, Calendar, MessageSquare, Star, ArrowRight, Layers, Megaphone,
  FileSpreadsheet, Download, Upload, Send, HelpCircle, User
} from "lucide-react";

export function CoachingManager() {
  const [exams, setExams] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [coachingDoubts, setCoachingDoubts] = useState<any[]>([]);
  const [loadingDoubts, setLoadingDoubts] = useState(false);
  const [doubtReplyText, setDoubtReplyText] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  // Selection states
  const [selectedExam, setSelectedExam] = useState<any | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<any | null>(null);
  const [selectedMockTest, setSelectedMockTest] = useState<any | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<"exam" | "categories" | "add-exam">("exam");
  const [activeTab, setActiveTab] = useState<"info" | "syllabus" | "mocktests" | "live" | "announcements" | "feedbacks" | "doubts">("info");

  // Error/Success alerts
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [categoryForm, setCategoryForm] = useState({ id: "", title: "", description: "", icon: "🎓" });
  const [examForm, setExamForm] = useState({
    id: "",
    fullName: "",
    tagline: "",
    overview: "",
    nextExamDate: "2027-05-01",
    difficultyLevel: 3,
    categoryId: "undergraduate",
    eligibility: "",
    careerOpportunities: "",
    syllabusTopics: "",
  });

  const [subjectForm, setSubjectForm] = useState({ id: "", name: "", icon: "📐", color: "bg-blue-500" });
  const [chapterForm, setChapterForm] = useState({ id: "", name: "" });
  const [videoForm, setVideoForm] = useState({ id: "", title: "", duration: "15:00", url: "" });
  const [noteForm, setNoteForm] = useState({ id: "", title: "", size: "1.5 MB", pdfUrl: "" });
  const [practiceForm, setPracticeForm] = useState({ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: 0, explanation: "" });

  const [mockForm, setMockForm] = useState({ id: "", name: "", duration: 1800 });
  const [questionForm, setQuestionForm] = useState({ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: 0, explanation: "", topic: "" });

  const [liveForm, setLiveForm] = useState({ topic: "", scheduledTime: "", duration: 60, url: "", status: "scheduled" });
  const [announcementForm, setAnnouncementForm] = useState({ title: "", content: "" });

  // Toggle modes
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isAddingPractice, setIsAddingPractice] = useState(false);
  const [isAddingMock, setIsAddingMock] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  // Editing ID states
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingPracticeId, setEditingPracticeId] = useState<string | null>(null);
  const [editingMockId, setEditingMockId] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingLiveId, setEditingLiveId] = useState<string | null>(null);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);

  // Bulk Excel Question Upload States
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkTarget, setBulkTarget] = useState<"mock" | "practice">("mock");
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);
  const [bulkFileName, setBulkFileName] = useState("");
  const [isImporting, setIsImporting] = useState(false);



  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (activeTab === "doubts") {
      loadCoachingDoubts();
    }
  }, [activeTab, selectedExam]);

  const loadAllData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      // If Supabase credentials are missing, keep empty data
      if (!supabase || !supabase.auth || !import.meta.env.VITE_SUPABASE_URL) {
        if (showLoading) setLoading(false);
        return null;
      }

      // Fetch all data from Supabase directly
      const [
        { data: examsData, error: examsError },
        { data: categoriesData, error: categoriesError },
        { data: announcementsData, error: announcementsError },
        { data: liveClassesData, error: liveClassesError },
        { data: feedbacksData, error: feedbacksError }
      ] = await Promise.all([
        supabase.from("coaching_exams").select(`
          *,
          subjects:coaching_subjects(*),
          chapters:coaching_chapters(*),
          mockTests:coaching_mock_tests(*)
        `),
        supabase.from("coaching_exam_categories").select("*"),
        supabase.from("coaching_announcements").select("*"),
        supabase.from("coaching_live_classes").select("*"),
        supabase.from("coaching_exam_feedbacks").select("*")
      ]);

      if (examsError) throw examsError;
      if (categoriesError) throw categoriesError;
      if (announcementsError) throw announcementsError;
      if (liveClassesError) throw liveClassesError;
      if (feedbacksError) throw feedbacksError;

      const freshExams = examsData || [];
      const freshCategories = categoriesData || [];
      const freshAnnouncements = announcementsData || [];
      const freshLiveClasses = liveClassesData || [];
      const freshFeedbacks = feedbacksData || [];

      setExams(freshExams);
      setCategories(freshCategories);
      setAnnouncements(freshAnnouncements);
      setLiveClasses(freshLiveClasses);
      setFeedbacks(freshFeedbacks);
      
      // Auto select first exam if available
      if (freshExams.length > 0 && !selectedExam) {
        setSelectedExam(freshExams[0]);
        fillExamForm(freshExams[0]);
      }

      return {
        exams: freshExams,
        categories: freshCategories,
        announcements: freshAnnouncements,
        liveClasses: freshLiveClasses,
        feedbacks: freshFeedbacks
      };
    } catch (err: any) {
      setError("Failed to load data: " + err.message);
      return null;
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const refreshSelectedChapter = async (chapterId: string) => {
    try {
      const [{ data: vData }, { data: nData }, { data: pData }] = await Promise.all([
        supabase.from("coaching_videos").select("*").eq("chapter_id", chapterId),
        supabase.from("coaching_notes").select("*").eq("chapter_id", chapterId),
        supabase.from("coaching_practice_questions").select("*").eq("chapter_id", chapterId),
      ]);
      setSelectedChapter((prev: any) => {
        if (!prev || prev.id !== chapterId) return prev;
        return {
          ...prev,
          videos: vData || [],
          notes: nData || [],
          practiceQuestions: pData || [],
        };
      });
    } catch (e) {
      console.error("Error refreshing chapter resources:", e);
    }
  };

  const refreshSelectedMockTest = async (mockId: string) => {
    try {
      const { data: qData } = await supabase
        .from("coaching_mock_questions")
        .select("*")
        .eq("mock_test_id", mockId);
      setSelectedMockTest((prev: any) => {
        if (!prev || prev.id !== mockId) return prev;
        return {
          ...prev,
          questions: qData || [],
        };
      });
    } catch (e) {
      console.error("Error refreshing mock test questions:", e);
    }
  };

  const loadCoachingDoubts = async () => {
    setLoadingDoubts(true);
    try {
      let query = supabase
        .from("coaching_doubts")
        .select("*")
        .order("created_at", { ascending: false });
      
      const { data, error: err } = await query;
      if (err) throw err;
      setCoachingDoubts(data || []);
    } catch (err: any) {
      console.error("Failed to load coaching doubts:", err);
    } finally {
      setLoadingDoubts(false);
    }
  };

  const handleReplyCoachingDoubt = async (doubtId: string) => {
    const text = doubtReplyText[doubtId]?.trim();
    if (!text) return;

    const currentDoubt = coachingDoubts.find((d) => d.id === doubtId);
    const existing = Array.isArray(currentDoubt?.responses) ? currentDoubt.responses : [];
    const updated = [
      ...existing,
      {
        author: "Relicus Mentor",
        message: text,
        createdAt: new Date().toISOString(),
      },
    ];

    try {
      const { error: updErr } = await supabase
        .from("coaching_doubts")
        .update({
          responses: updated,
          response: text,
          status: "Resolved",
        })
        .eq("id", doubtId);

      if (updErr) throw updErr;

      setDoubtReplyText((prev) => ({ ...prev, [doubtId]: "" }));
      setSuccess("Reply sent and doubt marked as Resolved!");
      await loadCoachingDoubts();
    } catch (err: any) {
      setError("Failed to reply to doubt: " + err.message);
    }
  };

  const fillExamForm = (ex: any) => {
    let catId = ex.categoryId || ex.category_id || "undergraduate";
    if (categories.length > 0 && !categories.some(c => c.id === catId)) {
      catId = categories[0].id;
    }
    setExamForm({
      id: ex.id || "",
      fullName: ex.fullName || ex.full_name || "",
      tagline: ex.tagline || "",
      overview: ex.overview || "",
      nextExamDate: ex.nextExamDate || ex.next_exam_date || "2027-05-01",
      difficultyLevel: ex.difficultyLevel || ex.difficulty_level || 3,
      categoryId: catId,
      eligibility: Array.isArray(ex.eligibility) ? ex.eligibility.join(", ") : "",
      careerOpportunities: Array.isArray(ex.careerOpportunities) || Array.isArray(ex.career_opportunities) ? (ex.careerOpportunities || ex.career_opportunities).join(", ") : "",
      syllabusTopics: Array.isArray(ex.syllabusTopics) || Array.isArray(ex.syllabus_topics) ? (ex.syllabusTopics || ex.syllabus_topics).join(", ") : "",
    });
  };

  const handleSelectExam = (ex: any) => {
    setSelectedExam(ex);
    fillExamForm(ex);
    setSelectedSubject(null);
    setSelectedChapter(null);
    setSelectedMockTest(null);
    setViewMode("exam");
  };

  // ── Category Operations ───────────────────────────────────────────────────
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.id || !categoryForm.title) return;

    const currentId = editingCategoryId;
    const catPayload = {
      id: categoryForm.id,
      title: categoryForm.title,
      description: categoryForm.description,
      icon: categoryForm.icon,
      sequence_number: categories.length + 1
    };

    // Instant local state update
    if (currentId) {
      setCategories(prev => prev.map(c => c.id === currentId ? { ...c, ...catPayload } : c));
      setSuccess(`Category "${categoryForm.title}" updated successfully.`);
    } else {
      setCategories(prev => [...prev, catPayload]);
      setSuccess(`Category "${categoryForm.title}" added successfully.`);
    }

    setCategoryForm({ id: "", title: "", description: "", icon: "🎓" });
    setEditingCategoryId(null);
    setIsAddingCategory(false);

    try {
      if (currentId) {
        const { error: catErr } = await supabase
          .from("coaching_exam_categories")
          .update({
            title: catPayload.title,
            description: catPayload.description,
            icon: catPayload.icon
          })
          .eq("id", currentId);
        if (catErr) throw catErr;
      } else {
        const { error: catErr } = await supabase
          .from("coaching_exam_categories")
          .insert(catPayload);
        if (catErr) throw catErr;
      }
      loadAllData(false);
    } catch (err: any) {
      setError(err.message);
      loadAllData(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryTitle: string) => {
    const linkedExams = exams.filter(
      (ex: any) => ex.categoryId === categoryId || ex.category_id === categoryId
    );

    let confirmMsg = `Are you sure you want to delete the category "${categoryTitle}"?`;
    if (linkedExams.length > 0) {
      confirmMsg += `\n\nWarning: ${linkedExams.length} exam(s) are currently associated with this category. Deleting it will detach them from this category.`;
    }

    if (!window.confirm(confirmMsg)) return;

    // Instant local state update
    setCategories(prev => prev.filter((c: any) => c.id !== categoryId));
    setSuccess(`Category "${categoryTitle}" deleted successfully.`);

    if (examForm.categoryId === categoryId) {
      const remaining = categories.filter((c: any) => c.id !== categoryId);
      setExamForm(prev => ({
        ...prev,
        categoryId: remaining.length > 0 ? remaining[0].id : ""
      }));
    }

    try {
      if (linkedExams.length > 0) {
        await supabase
          .from("coaching_exams")
          .update({ category_id: null })
          .eq("category_id", categoryId);
      }

      const { error: delErr } = await supabase
        .from("coaching_exam_categories")
        .delete()
        .eq("id", categoryId);

      if (delErr) throw delErr;
      loadAllData(false);
    } catch (err: any) {
      setError("Failed to delete category: " + err.message);
      loadAllData(false);
    }
  };

  // ── Exam Operations ───────────────────────────────────────────────────────
  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    const eligibilityArr = examForm.eligibility.split(",").map(s => s.trim()).filter(Boolean);
    const careersArr = examForm.careerOpportunities.split(",").map(s => s.trim()).filter(Boolean);
    const syllabusArr = examForm.syllabusTopics.split(",").map(s => s.trim()).filter(Boolean);

    try {
      if (viewMode === "add-exam") {
        const newExamObj = {
          id: examForm.id,
          fullName: examForm.fullName,
          tagline: examForm.tagline,
          overview: examForm.overview,
          nextExamDate: examForm.nextExamDate,
          difficultyLevel: Number(examForm.difficultyLevel),
          categoryId: examForm.categoryId,
          eligibility: eligibilityArr,
          careerOpportunities: careersArr,
          syllabusTopics: syllabusArr,
          subjects: [],
          mockTests: [],
          chapters: []
        };

        // Instant local state update
        setExams(prev => [...prev, newExamObj]);
        setSelectedExam(newExamObj);
        setViewMode("exam");
        setSuccess(`Exam ${examForm.id} registered.`);

        const { error: examErr } = await supabase
          .from("coaching_exams")
          .insert({
            id: examForm.id,
            full_name: examForm.fullName,
            tagline: examForm.tagline,
            overview: examForm.overview,
            next_exam_date: examForm.nextExamDate,
            difficulty_level: Number(examForm.difficultyLevel),
            category_id: examForm.categoryId,
            eligibility: eligibilityArr,
            career_opportunities: careersArr,
            syllabus_topics: syllabusArr
          });
        if (examErr) throw examErr;

        await supabase.from("coaching_notifications").insert({
          title: "New Exam Added",
          message: `The exam ${examForm.id} (${examForm.fullName}) is now open for preparation!`,
          category: "assignment",
          exam_id: examForm.id
        });

        loadAllData(false);
      } else {
        // Edit existing exam
        const updatedFields = {
          fullName: examForm.fullName,
          full_name: examForm.fullName,
          tagline: examForm.tagline,
          overview: examForm.overview,
          nextExamDate: examForm.nextExamDate,
          next_exam_date: examForm.nextExamDate,
          difficultyLevel: Number(examForm.difficultyLevel),
          difficulty_level: Number(examForm.difficultyLevel),
          categoryId: examForm.categoryId,
          category_id: examForm.categoryId,
          eligibility: eligibilityArr,
          careerOpportunities: careersArr,
          career_opportunities: careersArr,
          syllabusTopics: syllabusArr,
          syllabus_topics: syllabusArr
        };

        // Instant local state update
        setSelectedExam(prev => prev ? ({ ...prev, ...updatedFields }) : prev);
        setExams(prev => prev.map(ex => ex.id === selectedExam.id ? { ...ex, ...updatedFields } : ex));
        setSuccess(`Exam ${selectedExam.id} profile updated.`);

        const { error: examErr } = await supabase
          .from("coaching_exams")
          .update({
            full_name: examForm.fullName,
            tagline: examForm.tagline,
            overview: examForm.overview,
            next_exam_date: examForm.nextExamDate,
            difficulty_level: Number(examForm.difficultyLevel),
            category_id: examForm.categoryId,
            eligibility: eligibilityArr,
            career_opportunities: careersArr,
            syllabus_topics: syllabusArr
          })
          .eq("id", selectedExam.id);
        if (examErr) throw examErr;

        loadAllData(false);
      }
    } catch (err: any) {
      setError(err.message);
      loadAllData(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!window.confirm(`Are you sure you want to delete the exam ${examId}?`)) return;

    // Instant local state update
    setExams(prev => prev.filter(ex => ex.id !== examId));
    setSelectedExam(null);
    setSuccess(`Exam ${examId} deleted.`);

    try {
      const { error: delErr } = await supabase
        .from("coaching_exams")
        .delete()
        .eq("id", examId);
      if (delErr) throw delErr;
      loadAllData(false);
    } catch (err: any) {
      setError(err.message);
      loadAllData(false);
    }
  };

  // ── Subject Operations ────────────────────────────────────────────────────
  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;

    const currentSubId = editingSubjectId;
    const subName = subjectForm.name;
    const subIcon = subjectForm.icon;
    const subColor = subjectForm.color;

    try {
      if (currentSubId) {
        // Instant local state update
        setSelectedExam(prev => {
          if (!prev) return prev;
          const updatedSubs = (prev.subjects || []).map((s: any) =>
            s.id === currentSubId ? { ...s, name: subName, icon: subIcon, color: subColor } : s
          );
          return { ...prev, subjects: updatedSubs };
        });
        setExams(prev => prev.map(ex => {
          if (ex.id !== selectedExam.id) return ex;
          const updatedSubs = (ex.subjects || []).map((s: any) =>
            s.id === currentSubId ? { ...s, name: subName, icon: subIcon, color: subColor } : s
          );
          return { ...ex, subjects: updatedSubs };
        }));
        if (selectedSubject?.id === currentSubId) {
          setSelectedSubject((prev: any) => prev ? ({ ...prev, name: subName, icon: subIcon, color: subColor }) : null);
        }
        setSuccess("Subject updated successfully.");

        setIsAddingSubject(false);
        setEditingSubjectId(null);
        setSubjectForm({ id: "", name: "", icon: "📐", color: "bg-blue-500" });

        const { error: subErr } = await supabase
          .from("coaching_subjects")
          .update({
            name: subName,
            icon: subIcon,
            color: subColor,
          })
          .eq("id", currentSubId);
        if (subErr) throw subErr;
      } else {
        const subId = subjectForm.id || `sub-${Math.random().toString(36).substr(2, 9)}`;
        const newSub = {
          id: subId,
          exam_id: selectedExam.id,
          name: subName,
          icon: subIcon,
          color: subColor,
          chapters_count: 0,
          mock_tests_count: 0,
          chaptersCount: 0,
          mockTestsCount: 0
        };

        // Instant local state update
        setSelectedExam(prev => prev ? ({ ...prev, subjects: [...(prev.subjects || []), newSub] }) : prev);
        setExams(prev => prev.map(ex => ex.id === selectedExam.id ? ({ ...ex, subjects: [...(ex.subjects || []), newSub] }) : ex));
        setSuccess("Subject created.");

        setIsAddingSubject(false);
        setEditingSubjectId(null);
        setSubjectForm({ id: "", name: "", icon: "📐", color: "bg-blue-500" });

        const { error: subErr } = await supabase
          .from("coaching_subjects")
          .insert({
            id: subId,
            exam_id: selectedExam.id,
            name: subName,
            icon: subIcon,
            color: subColor,
            chapters_count: 0,
            mock_tests_count: 0
          });
        if (subErr) throw subErr;
      }
      loadAllData(false);
    } catch (err: any) {
      setError(err.message);
      loadAllData(false);
    }
  };

  const handleDeleteSubject = async (subId: string, subName: string) => {
    if (!window.confirm(`Are you sure you want to delete the subject "${subName}"? All chapters and questions inside this subject will also be deleted.`)) return;

    // Instant local state update
    setSelectedExam(prev => {
      if (!prev) return prev;
      return { ...prev, subjects: (prev.subjects || []).filter((s: any) => s.id !== subId) };
    });
    setExams(prev => prev.map(ex => {
      if (ex.id !== selectedExam?.id) return ex;
      return { ...ex, subjects: (ex.subjects || []).filter((s: any) => s.id !== subId) };
    }));
    if (selectedSubject?.id === subId) {
      setSelectedSubject(null);
      setSelectedChapter(null);
    }
    setSuccess(`Subject "${subName}" deleted.`);

    try {
      const { error: delErr } = await supabase
        .from("coaching_subjects")
        .delete()
        .eq("id", subId);
      if (delErr) throw delErr;
      loadAllData(false);
    } catch (err: any) {
      setError("Failed to delete subject: " + err.message);
      loadAllData(false);
    }
  };

  // ── Chapter & Content Operations ─────────────────────────────────────────
  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam || !selectedSubject) return;

    const currentChId = editingChapterId;
    const chName = chapterForm.name;

    try {
      if (currentChId) {
        // Instant local state update
        setSelectedExam(prev => {
          if (!prev) return prev;
          const nextChs = (prev.chapters || []).map((ch: any) =>
            ch.id === currentChId ? { ...ch, name: chName } : ch
          );
          return { ...prev, chapters: nextChs };
        });
        setExams(prev => prev.map(ex => {
          if (ex.id !== selectedExam.id) return ex;
          return {
            ...ex,
            chapters: (ex.chapters || []).map((ch: any) =>
              ch.id === currentChId ? { ...ch, name: chName } : ch
            )
          };
        }));
        if (selectedChapter?.id === currentChId) {
          setSelectedChapter((prev: any) => prev ? ({ ...prev, name: chName }) : null);
        }
        setSuccess("Chapter updated successfully.");

        setIsAddingChapter(false);
        setEditingChapterId(null);
        setChapterForm({ id: "", name: "" });

        const { error: chErr } = await supabase
          .from("coaching_chapters")
          .update({ name: chName })
          .eq("id", currentChId);
        if (chErr) throw chErr;
      } else {
        const chId = chapterForm.id || `ch-${Math.random().toString(36).substr(2, 9)}`;
        const newCh = {
          id: chId,
          exam_id: selectedExam.id,
          subject_id: selectedSubject.id,
          name: chName,
          progress: 0
        };

        // Instant local state update
        setSelectedExam(prev => prev ? ({ ...prev, chapters: [...(prev.chapters || []), newCh] }) : prev);
        setExams(prev => prev.map(ex => ex.id === selectedExam.id ? ({ ...ex, chapters: [...(ex.chapters || []), newCh] }) : ex));
        setSelectedSubject((prev: any) => {
          if (!prev) return prev;
          const count = (prev.chaptersCount || prev.chapters_count || 0) + 1;
          return { ...prev, chaptersCount: count, chapters_count: count };
        });
        setSuccess("Chapter added to subject.");

        setIsAddingChapter(false);
        setEditingChapterId(null);
        setChapterForm({ id: "", name: "" });

        const { error: chErr } = await supabase
          .from("coaching_chapters")
          .insert({
            id: chId,
            exam_id: selectedExam.id,
            subject_id: selectedSubject.id,
            name: chName,
            progress: 0
          });
        if (chErr) throw chErr;

        // Update subject counts in DB
        await supabase
          .from("coaching_subjects")
          .update({ chapters_count: (selectedSubject.chaptersCount || selectedSubject.chapters_count || 0) + 1 })
          .eq("id", selectedSubject.id);
      }
      loadAllData(false);
    } catch (err: any) {
      setError(err.message);
      loadAllData(false);
    }
  };

  const handleDeleteChapter = async (chId: string, chName: string) => {
    if (!window.confirm(`Are you sure you want to delete chapter "${chName}"? All videos, notes, and questions inside will be deleted.`)) return;

    // Instant local state update
    setSelectedExam(prev => {
      if (!prev) return prev;
      return { ...prev, chapters: (prev.chapters || []).filter((ch: any) => ch.id !== chId) };
    });
    setExams(prev => prev.map(ex => {
      if (ex.id !== selectedExam?.id) return ex;
      return { ...ex, chapters: (ex.chapters || []).filter((ch: any) => ch.id !== chId) };
    }));
    if (selectedChapter?.id === chId) {
      setSelectedChapter(null);
    }
    if (selectedSubject) {
      setSelectedSubject((prev: any) => {
        if (!prev) return prev;
        const count = Math.max(0, (prev.chaptersCount || prev.chapters_count || 1) - 1);
        return { ...prev, chaptersCount: count, chapters_count: count };
      });
    }
    setSuccess(`Chapter "${chName}" deleted.`);

    try {
      const { error: delErr } = await supabase
        .from("coaching_chapters")
        .delete()
        .eq("id", chId);
      if (delErr) throw delErr;

      if (selectedSubject) {
        const currentCount = (selectedSubject.chaptersCount || selectedSubject.chapters_count || 1);
        await supabase
          .from("coaching_subjects")
          .update({ chapters_count: Math.max(0, currentCount - 1) })
          .eq("id", selectedSubject.id);
      }
      loadAllData(false);
    } catch (err: any) {
      setError("Failed to delete chapter: " + err.message);
      loadAllData(false);
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam || !selectedChapter) return;

    const currentVidId = editingVideoId;
    const vTitle = videoForm.title;
    const vDuration = videoForm.duration;
    const vUrl = videoForm.url || "https://www.w3schools.com/html/mov_bbb.mp4";

    if (currentVidId) {
      // Instant local update
      setSelectedChapter((prev: any) => ({
        ...prev,
        videos: (prev?.videos || []).map((v: any) =>
          v.id === currentVidId ? { ...v, title: vTitle, duration: vDuration, url: vUrl } : v
        )
      }));
      setSuccess("Video updated successfully.");
    } else {
      const vidId = videoForm.id || `v-${Math.random().toString(36).substr(2, 9)}`;
      const newVideo = {
        id: vidId,
        chapter_id: selectedChapter.id,
        title: vTitle,
        duration: vDuration,
        url: vUrl,
        is_watched: false
      };
      // Instant local update
      setSelectedChapter((prev: any) => ({
        ...prev,
        videos: [...(prev?.videos || []), newVideo]
      }));
      setSuccess("Video added to chapter.");
    }

    setIsAddingVideo(false);
    setEditingVideoId(null);
    setVideoForm({ id: "", title: "", duration: "15:00", url: "" });

    try {
      if (currentVidId) {
        const { error: vErr } = await supabase
          .from("coaching_videos")
          .update({
            title: vTitle,
            duration: vDuration,
            url: vUrl,
          })
          .eq("id", currentVidId);
        if (vErr) throw vErr;
      } else {
        const vidId = videoForm.id || `v-${Math.random().toString(36).substr(2, 9)}`;
        const { error: vErr } = await supabase
          .from("coaching_videos")
          .insert({
            id: vidId,
            chapter_id: selectedChapter.id,
            title: vTitle,
            duration: vDuration,
            url: vUrl,
            is_watched: false
          });
        if (vErr) throw vErr;
      }
      refreshSelectedChapter(selectedChapter.id);
    } catch (err: any) {
      setError(err.message);
      refreshSelectedChapter(selectedChapter.id);
    }
  };

  const handleDeleteVideo = async (vidId: string, vidTitle: string) => {
    if (!window.confirm(`Delete video "${vidTitle}"?`)) return;

    // Instant local update
    setSelectedChapter((prev: any) => ({
      ...prev,
      videos: (prev?.videos || []).filter((v: any) => v.id !== vidId)
    }));
    setSuccess("Video deleted.");

    try {
      const { error: delErr } = await supabase
        .from("coaching_videos")
        .delete()
        .eq("id", vidId);
      if (delErr) throw delErr;
      if (selectedChapter) refreshSelectedChapter(selectedChapter.id);
    } catch (err: any) {
      setError("Failed to delete video: " + err.message);
      if (selectedChapter) refreshSelectedChapter(selectedChapter.id);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam || !selectedChapter) return;

    const currentNoteId = editingNoteId;
    const nTitle = noteForm.title;
    const nSize = noteForm.size;
    const nPdf = noteForm.pdfUrl || "https://arxiv.org/pdf/quant-ph/0410100.pdf";

    if (currentNoteId) {
      // Instant local update
      setSelectedChapter((prev: any) => ({
        ...prev,
        notes: (prev?.notes || []).map((n: any) =>
          n.id === currentNoteId ? { ...n, title: nTitle, size: nSize, pdf_url: nPdf } : n
        )
      }));
      setSuccess("Revision note updated successfully.");
    } else {
      const noteId = noteForm.id || `n-${Math.random().toString(36).substr(2, 9)}`;
      const newNote = {
        id: noteId,
        chapter_id: selectedChapter.id,
        title: nTitle,
        size: nSize,
        pdf_url: nPdf,
        is_bookmarked: false
      };
      // Instant local update
      setSelectedChapter((prev: any) => ({
        ...prev,
        notes: [...(prev?.notes || []), newNote]
      }));
      setSuccess("Revision notes added.");
    }

    setIsAddingNote(false);
    setEditingNoteId(null);
    setNoteForm({ id: "", title: "", size: "1.5 MB", pdfUrl: "" });

    try {
      if (currentNoteId) {
        const { error: nErr } = await supabase
          .from("coaching_notes")
          .update({
            title: nTitle,
            size: nSize,
            pdf_url: nPdf,
          })
          .eq("id", currentNoteId);
        if (nErr) throw nErr;
      } else {
        const noteId = noteForm.id || `n-${Math.random().toString(36).substr(2, 9)}`;
        const { error: nErr } = await supabase
          .from("coaching_notes")
          .insert({
            id: noteId,
            chapter_id: selectedChapter.id,
            title: nTitle,
            size: nSize,
            pdf_url: nPdf,
            is_bookmarked: false
          });
        if (nErr) throw nErr;
      }
      refreshSelectedChapter(selectedChapter.id);
    } catch (err: any) {
      setError(err.message);
      refreshSelectedChapter(selectedChapter.id);
    }
  };

  const handleDeleteNote = async (noteId: string, noteTitle: string) => {
    if (!window.confirm(`Delete revision note "${noteTitle}"?`)) return;

    // Instant local update
    setSelectedChapter((prev: any) => ({
      ...prev,
      notes: (prev?.notes || []).filter((n: any) => n.id !== noteId)
    }));
    setSuccess("Revision note deleted.");

    try {
      const { error: delErr } = await supabase
        .from("coaching_notes")
        .delete()
        .eq("id", noteId);
      if (delErr) throw delErr;
      if (selectedChapter) refreshSelectedChapter(selectedChapter.id);
    } catch (err: any) {
      setError("Failed to delete note: " + err.message);
      if (selectedChapter) refreshSelectedChapter(selectedChapter.id);
    }
  };

  const handleAddPractice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam || !selectedChapter) return;

    const currentPracticeId = editingPracticeId;
    const pQuestion = practiceForm.question;
    const pOptions = [practiceForm.optionA, practiceForm.optionB, practiceForm.optionC, practiceForm.optionD];
    const pCorrect = practiceForm.correctAnswer;
    const pExpl = practiceForm.explanation;

    if (currentPracticeId) {
      // Instant local update
      setSelectedChapter((prev: any) => ({
        ...prev,
        practiceQuestions: (prev?.practiceQuestions || []).map((p: any) =>
          p.id === currentPracticeId ? { ...p, question: pQuestion, options: pOptions, correct_answer: pCorrect, explanation: pExpl } : p
        )
      }));
      setSuccess("Practice question updated.");
    } else {
      const tempId = `pq-${Math.random().toString(36).substr(2, 9)}`;
      const newPQ = {
        id: tempId,
        chapter_id: selectedChapter.id,
        question: pQuestion,
        options: pOptions,
        correct_answer: pCorrect,
        explanation: pExpl
      };
      // Instant local update
      setSelectedChapter((prev: any) => ({
        ...prev,
        practiceQuestions: [...(prev?.practiceQuestions || []), newPQ]
      }));
      setSuccess("Practice question added.");
    }

    setIsAddingPractice(false);
    setEditingPracticeId(null);
    setPracticeForm({ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: 0, explanation: "" });

    try {
      if (currentPracticeId) {
        const { error: prErr } = await supabase
          .from("coaching_practice_questions")
          .update({
            question: pQuestion,
            options: pOptions,
            correct_answer: pCorrect,
            explanation: pExpl
          })
          .eq("id", currentPracticeId);
        if (prErr) throw prErr;
      } else {
        const { error: prErr } = await supabase
          .from("coaching_practice_questions")
          .insert({
            chapter_id: selectedChapter.id,
            question: pQuestion,
            options: pOptions,
            correct_answer: pCorrect,
            explanation: pExpl
          });
        if (prErr) throw prErr;
      }
      refreshSelectedChapter(selectedChapter.id);
    } catch (err: any) {
      setError(err.message);
      refreshSelectedChapter(selectedChapter.id);
    }
  };

  const handleDeletePractice = async (pracId: string) => {
    if (!window.confirm("Delete this practice question?")) return;

    // Instant local update
    setSelectedChapter((prev: any) => ({
      ...prev,
      practiceQuestions: (prev?.practiceQuestions || []).filter((p: any) => p.id !== pracId)
    }));
    setSuccess("Practice question deleted.");

    try {
      const { error: delErr } = await supabase
        .from("coaching_practice_questions")
        .delete()
        .eq("id", pracId);
      if (delErr) throw delErr;
      if (selectedChapter) refreshSelectedChapter(selectedChapter.id);
    } catch (err: any) {
      setError("Failed to delete question: " + err.message);
      if (selectedChapter) refreshSelectedChapter(selectedChapter.id);
    }
  };

  // ── Live Classes Operations ───────────────────────────────────────────────
  const handleScheduleLive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;

    const currentLiveId = editingLiveId;
    const lTopic = liveForm.topic;
    const lTime = new Date(liveForm.scheduledTime).toISOString();
    const lDuration = Number(liveForm.duration);
    const lUrl = liveForm.url || "https://youtube.com/live";
    const lStatus = liveForm.status;

    if (currentLiveId) {
      // Instant local state update
      setLiveClasses(prev => prev.map((l: any) =>
        l.id === currentLiveId ? { ...l, topic: lTopic, scheduled_time: lTime, scheduledTime: liveForm.scheduledTime, duration: lDuration, url: lUrl, status: lStatus } : l
      ));
      setSuccess("Live session schedule updated.");
    } else {
      const tempLiveId = `live-${Math.random().toString(36).substr(2, 9)}`;
      const newLive = {
        id: tempLiveId,
        exam_id: selectedExam.id,
        subject_id: selectedExam.subjects?.[0]?.id || "math",
        topic: lTopic,
        scheduled_time: lTime,
        scheduledTime: liveForm.scheduledTime,
        duration: lDuration,
        url: lUrl,
        status: lStatus
      };
      // Instant local state update
      setLiveClasses(prev => [newLive, ...prev]);
      setSuccess("Live class scheduled successfully.");
    }

    setEditingLiveId(null);
    setLiveForm({ topic: "", scheduledTime: "", duration: 60, url: "", status: "scheduled" });

    try {
      if (currentLiveId) {
        const { error: liveErr } = await supabase
          .from("coaching_live_classes")
          .update({
            topic: lTopic,
            scheduled_time: lTime,
            duration: lDuration,
            url: lUrl,
            status: lStatus
          })
          .eq("id", currentLiveId);
        if (liveErr) throw liveErr;
      } else {
        const newLivePayload = {
          exam_id: selectedExam.id,
          subject_id: selectedExam.subjects?.[0]?.id || "math",
          topic: lTopic,
          scheduled_time: lTime,
          duration: lDuration,
          url: lUrl,
          status: lStatus
        };
        const { error: liveErr } = await supabase
          .from("coaching_live_classes")
          .insert(newLivePayload);
        if (liveErr) throw liveErr;

        await supabase.from("coaching_notifications").insert({
          title: "Live Class Scheduled",
          message: `New class for ${selectedExam.id}: "${lTopic}"`,
          category: "live",
          exam_id: selectedExam.id
        });
      }
    } catch (err: any) {
      setError(err.message);
      loadAllData(false);
    }
  };

  const handleDeleteLive = async (liveId: string, topic: string) => {
    if (!window.confirm(`Delete live class "${topic}"?`)) return;

    // Instant local state update
    setLiveClasses(prev => prev.filter((l: any) => l.id !== liveId));
    setSuccess("Live class deleted.");
    if (editingLiveId === liveId) {
      setEditingLiveId(null);
      setLiveForm({ topic: "", scheduledTime: "", duration: 60, url: "", status: "scheduled" });
    }

    try {
      const { error: delErr } = await supabase
        .from("coaching_live_classes")
        .delete()
        .eq("id", liveId);
      if (delErr) throw delErr;
    } catch (err: any) {
      setError("Failed to delete live class: " + err.message);
      loadAllData(false);
    }
  };

  // ── Announcements Operations ──────────────────────────────────────────────
  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;

    const currentAnnId = editingAnnouncementId;
    const aTitle = announcementForm.title;
    const aContent = announcementForm.content;

    if (currentAnnId) {
      // Instant local state update
      setAnnouncements(prev => prev.map((a: any) =>
        a.id === currentAnnId ? { ...a, title: aTitle, content: aContent } : a
      ));
      setSuccess("Announcement updated.");
    } else {
      const tempAnnId = `ann-${Math.random().toString(36).substr(2, 9)}`;
      const newAnn = {
        id: tempAnnId,
        title: aTitle,
        content: aContent,
        exam_id: selectedExam.id,
        created_at: new Date().toISOString()
      };
      // Instant local state update
      setAnnouncements(prev => [newAnn, ...prev]);
      setSuccess("Announcement published.");
    }

    setEditingAnnouncementId(null);
    setAnnouncementForm({ title: "", content: "" });

    try {
      if (currentAnnId) {
        const { error: annErr } = await supabase
          .from("coaching_announcements")
          .update({
            title: aTitle,
            content: aContent,
          })
          .eq("id", currentAnnId);
        if (annErr) throw annErr;
      } else {
        const { error: annErr } = await supabase
          .from("coaching_announcements")
          .insert({
            title: aTitle,
            content: aContent,
            exam_id: selectedExam.id
          });
        if (annErr) throw annErr;

        await supabase.from("coaching_notifications").insert({
          title: "New Announcement",
          message: aTitle,
          category: "announcement",
          exam_id: selectedExam.id
        });
      }
    } catch (err: any) {
      setError(err.message);
      loadAllData(false);
    }
  };

  const handleDeleteAnnouncement = async (annId: string, title: string) => {
    if (!window.confirm(`Delete announcement "${title}"?`)) return;

    // Instant local state update
    setAnnouncements(prev => prev.filter((a: any) => a.id !== annId));
    setSuccess("Announcement deleted.");
    if (editingAnnouncementId === annId) {
      setEditingAnnouncementId(null);
      setAnnouncementForm({ title: "", content: "" });
    }

    try {
      const { error: delErr } = await supabase
        .from("coaching_announcements")
        .delete()
        .eq("id", annId);
      if (delErr) throw delErr;
    } catch (err: any) {
      setError("Failed to delete announcement: " + err.message);
      loadAllData(false);
    }
  };

  // ── Mock Tests Builder Operations ──────────────────────────────────────────
  const handleAddMockTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;

    const currentMockId = editingMockId;
    const mName = mockForm.name;
    const mDuration = Number(mockForm.duration);

    try {
      if (currentMockId) {
        // Instant local state update
        setSelectedExam(prev => {
          if (!prev) return prev;
          const nextMocks = (prev.mockTests || []).map((m: any) =>
            m.id === currentMockId ? { ...m, name: mName, duration: mDuration } : m
          );
          return { ...prev, mockTests: nextMocks };
        });
        setExams(prev => prev.map(ex => {
          if (ex.id !== selectedExam.id) return ex;
          return {
            ...ex,
            mockTests: (ex.mockTests || []).map((m: any) =>
              m.id === currentMockId ? { ...m, name: mName, duration: mDuration } : m
            )
          };
        }));
        if (selectedMockTest?.id === currentMockId) {
          setSelectedMockTest((prev: any) => prev ? ({ ...prev, name: mName, duration: mDuration }) : null);
        }
        setSuccess("Mock test updated.");

        setIsAddingMock(false);
        setEditingMockId(null);
        setMockForm({ id: "", name: "", duration: 1800 });

        const { error: mockErr } = await supabase
          .from("coaching_mock_tests")
          .update({
            name: mName,
            duration: mDuration,
          })
          .eq("id", currentMockId);
        if (mockErr) throw mockErr;
      } else {
        const mockId = mockForm.id || `mock-${Math.random().toString(36).substr(2, 9)}`;
        const newMock = {
          id: mockId,
          exam_id: selectedExam.id,
          name: mName,
          duration: mDuration,
          questions_count: 0
        };

        // Instant local state update
        setSelectedExam(prev => prev ? ({ ...prev, mockTests: [...(prev.mockTests || []), newMock] }) : prev);
        setExams(prev => prev.map(ex => ex.id === selectedExam.id ? ({ ...ex, mockTests: [...(ex.mockTests || []), newMock] }) : ex));
        setSuccess("Mock test created.");

        setIsAddingMock(false);
        setEditingMockId(null);
        setMockForm({ id: "", name: "", duration: 1800 });

        const { error: mockErr } = await supabase
          .from("coaching_mock_tests")
          .insert(newMock);
        if (mockErr) throw mockErr;
      }
      loadAllData(false);
    } catch (err: any) {
      setError(err.message);
      loadAllData(false);
    }
  };

  const handleDeleteMockTest = async (mockId: string, mockName: string) => {
    if (!window.confirm(`Delete mock test "${mockName}" and all of its questions?`)) return;

    // Instant local state update
    setSelectedExam(prev => {
      if (!prev) return prev;
      return { ...prev, mockTests: (prev.mockTests || []).filter((m: any) => m.id !== mockId) };
    });
    setExams(prev => prev.map(ex => {
      if (ex.id !== selectedExam?.id) return ex;
      return { ...ex, mockTests: (ex.mockTests || []).filter((m: any) => m.id !== mockId) };
    }));
    if (selectedMockTest?.id === mockId) {
      setSelectedMockTest(null);
    }
    setSuccess(`Mock test "${mockName}" deleted.`);

    try {
      const { error: delErr } = await supabase
        .from("coaching_mock_tests")
        .delete()
        .eq("id", mockId);
      if (delErr) throw delErr;
      loadAllData(false);
    } catch (err: any) {
      setError("Failed to delete mock test: " + err.message);
      loadAllData(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam || !selectedMockTest) return;

    const currentQId = editingQuestionId;
    const qText = questionForm.question;
    const qOptions = [questionForm.optionA, questionForm.optionB, questionForm.optionC, questionForm.optionD];
    const qCorrect = questionForm.correctAnswer;
    const qExpl = questionForm.explanation;
    const qTopic = questionForm.topic;

    if (currentQId) {
      // Instant local state update
      setSelectedMockTest((prev: any) => ({
        ...prev,
        questions: (prev?.questions || []).map((q: any) =>
          q.id === currentQId ? { ...q, question: qText, options: qOptions, correct_answer: qCorrect, explanation: qExpl, topic: qTopic } : q
        )
      }));
      setSuccess("Mock question updated.");
    } else {
      const tempQId = `mq-${Math.random().toString(36).substr(2, 9)}`;
      const newQuestion = {
        id: tempQId,
        mock_test_id: selectedMockTest.id,
        question: qText,
        options: qOptions,
        correct_answer: qCorrect,
        explanation: qExpl,
        subject: selectedExam.subjects?.[0]?.name || "General",
        topic: qTopic
      };
      // Instant local state update
      setSelectedMockTest((prev: any) => ({
        ...prev,
        questions: [...(prev?.questions || []), newQuestion],
        questions_count: (prev?.questions_count || prev?.questions?.length || 0) + 1
      }));
      setSuccess("Question added to test.");
    }

    setIsAddingQuestion(false);
    setEditingQuestionId(null);
    setQuestionForm({ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: 0, explanation: "", topic: "" });

    try {
      if (currentQId) {
        const { error: qErr } = await supabase
          .from("coaching_mock_questions")
          .update({
            question: qText,
            options: qOptions,
            correct_answer: qCorrect,
            explanation: qExpl,
            topic: qTopic
          })
          .eq("id", currentQId);
        if (qErr) throw qErr;
      } else {
        const newQuestionPayload = {
          mock_test_id: selectedMockTest.id,
          question: qText,
          options: qOptions,
          correct_answer: qCorrect,
          explanation: qExpl,
          subject: selectedExam.subjects?.[0]?.name || "General",
          topic: qTopic
        };
        const { error: qErr } = await supabase
          .from("coaching_mock_questions")
          .insert(newQuestionPayload);
        if (qErr) throw qErr;

        const { count } = await supabase
          .from("coaching_mock_questions")
          .select("*", { count: "exact", head: true })
          .eq("mock_test_id", selectedMockTest.id);

        await supabase
          .from("coaching_mock_tests")
          .update({ questions_count: count || 0 })
          .eq("id", selectedMockTest.id);
      }
      refreshSelectedMockTest(selectedMockTest.id);
    } catch (err: any) {
      setError(err.message);
      refreshSelectedMockTest(selectedMockTest.id);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!window.confirm("Delete this question?")) return;

    // Instant local state update
    setSelectedMockTest((prev: any) => ({
      ...prev,
      questions: (prev?.questions || []).filter((q: any) => q.id !== qId),
      questions_count: Math.max(0, (prev?.questions_count || prev?.questions?.length || 1) - 1)
    }));
    setSuccess("Question deleted.");

    try {
      const { error: delErr } = await supabase
        .from("coaching_mock_questions")
        .delete()
        .eq("id", qId);
      if (delErr) throw delErr;

      const { count } = await supabase
        .from("coaching_mock_questions")
        .select("*", { count: "exact", head: true })
        .eq("mock_test_id", selectedMockTest.id);

      await supabase
        .from("coaching_mock_tests")
        .update({ questions_count: count || 0 })
        .eq("id", selectedMockTest.id);

      refreshSelectedMockTest(selectedMockTest.id);
    } catch (err: any) {
      setError("Failed to delete question: " + err.message);
      refreshSelectedMockTest(selectedMockTest.id);
    }
  };

  // ── Bulk Excel / CSV Operations ─────────────────────────────────────────────
  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        "Question": "What is the primary function of the hippocampus in human memory?",
        "Option A": "Consolidation of short-term memory to long-term memory",
        "Option B": "Regulation of body temperature and hunger",
        "Option C": "Primary visual cortex processing",
        "Option D": "Reflexive motor coordination",
        "Correct Answer": "A",
        "Explanation": "The hippocampus is essential for transferring information from short-term to long-term storage.",
        "Topic": "Cognitive Psychology"
      },
      {
        "Question": "Which neurotransmitter is primarily involved in motor control and Parkinson's disease?",
        "Option A": "Serotonin",
        "Option B": "Dopamine",
        "Option C": "GABA",
        "Option D": "Acetylcholine",
        "Correct Answer": "B",
        "Explanation": "Dopamine deficiency in the substantia nigra leads to the symptoms of Parkinson's disease.",
        "Topic": "Neuropsychology"
      },
      {
        "Question": "According to Piaget, in which stage does a child develop object permanence?",
        "Option A": "Sensorimotor Stage",
        "Option B": "Preoperational Stage",
        "Option C": "Concrete Operational Stage",
        "Option D": "Formal Operational Stage",
        "Correct Answer": "A",
        "Explanation": "Object permanence develops around 8 months of age in the sensorimotor stage.",
        "Topic": "Developmental Psychology"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions_Template");
    XLSX.writeFile(wb, "Relicus_Questions_Bulk_Template.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[] = XLSX.utils.sheet_to_json(ws);

        const parsed = data.map((row: any, index: number) => {
          const question = row["Question"] || row["question"] || row["QUESTION"] || row["Question Text"] || "";
          const optionA = String(row["Option A"] || row["OptionA"] || row["optionA"] || row["A"] || "");
          const optionB = String(row["Option B"] || row["OptionB"] || row["optionB"] || row["B"] || "");
          const optionC = String(row["Option C"] || row["OptionC"] || row["optionC"] || row["C"] || "");
          const optionD = String(row["Option D"] || row["OptionD"] || row["optionD"] || row["D"] || "");
          
          let rawAnswer = String(row["Correct Answer"] || row["CorrectAnswer"] || row["Answer"] || row["correct_answer"] || row["Correct"] || "A").trim().toUpperCase();
          let correctAnswer = 0;
          if (rawAnswer === "B" || rawAnswer === "1" || rawAnswer === "2") correctAnswer = rawAnswer === "1" ? 0 : 1;
          if (rawAnswer === "C" || rawAnswer === "3") correctAnswer = 2;
          if (rawAnswer === "D" || rawAnswer === "4") correctAnswer = 3;
          if (rawAnswer === "A" || rawAnswer === "0") correctAnswer = 0;

          const explanation = row["Explanation"] || row["explanation"] || row["Solution"] || "";
          const topic = row["Topic"] || row["topic"] || "General";

          return {
            id: `imp-${index}-${Math.random().toString(36).substr(2, 6)}`,
            question,
            options: [optionA, optionB, optionC, optionD],
            correctAnswer,
            explanation,
            topic
          };
        }).filter(q => q.question && q.options[0]);

        setParsedQuestions(parsed);
        if (parsed.length === 0) {
          setError("No valid questions found in this sheet. Please check headers: Question, Option A, Option B, Option C, Option D, Correct Answer, Explanation.");
        } else {
          setSuccess(`Successfully parsed ${parsed.length} questions from ${file.name}. Review below and confirm import.`);
        }
      } catch (err: any) {
        setError("Failed to parse file: " + err.message);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleConfirmBulkImport = async () => {
    if (parsedQuestions.length === 0) return;
    setIsImporting(true);

    try {
      if (bulkTarget === "mock") {
        if (!selectedMockTest) throw new Error("No mock test selected.");

        const rowsToInsert = parsedQuestions.map(q => ({
          mock_test_id: selectedMockTest.id,
          question: q.question,
          options: q.options,
          correct_answer: q.correctAnswer,
          explanation: q.explanation,
          topic: q.topic,
          subject: selectedExam?.subjects?.[0]?.name || "General"
        }));

        const { error: insErr } = await supabase
          .from("coaching_mock_questions")
          .insert(rowsToInsert);

        if (insErr) throw insErr;

        const { count } = await supabase
          .from("coaching_mock_questions")
          .select("*", { count: "exact", head: true })
          .eq("mock_test_id", selectedMockTest.id);

        await supabase
          .from("coaching_mock_tests")
          .update({ questions_count: count || rowsToInsert.length })
          .eq("id", selectedMockTest.id);

        await refreshSelectedMockTest(selectedMockTest.id);
        setSuccess(`Imported ${rowsToInsert.length} questions into "${selectedMockTest.name}"!`);
      } else {
        if (!selectedChapter) throw new Error("No chapter selected.");

        const rowsToInsert = parsedQuestions.map(q => ({
          chapter_id: selectedChapter.id,
          question: q.question,
          options: q.options,
          correct_answer: q.correctAnswer,
          explanation: q.explanation
        }));

        const { error: insErr } = await supabase
          .from("coaching_practice_questions")
          .insert(rowsToInsert);

        if (insErr) throw insErr;

        await refreshSelectedChapter(selectedChapter.id);
        setSuccess(`Imported ${rowsToInsert.length} practice questions into "${selectedChapter.name}"!`);
      }

      await loadAllData(false);
      setBulkModalOpen(false);
      setParsedQuestions([]);
      setBulkFileName("");
    } catch (err: any) {
      setError("Failed to import questions: " + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  // Helper values
  const examFeedbacks = feedbacks.filter((f: any) => f.exam_id === selectedExam?.id);
  const avgRating = examFeedbacks.length > 0 
    ? (examFeedbacks.reduce((acc, curr) => acc + curr.rating, 0) / examFeedbacks.length).toFixed(1)
    : "No ratings";

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-100">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-teal-500" /> Relicus Entrance Coaching Manager
          </h2>
          <p className="text-sm text-slate-500">Add exams, structure subjects/chapters, push announcements, schedule live webinars, and inspect reviews.</p>
        </div>
        <div className="flex gap-2">

          <button
            onClick={() => { setViewMode("categories"); setIsAddingCategory(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold"
          >
            <Layers className="h-4 w-4" /> Categories
          </button>
          <button
            onClick={() => {
              setExamForm({ id: "", fullName: "", tagline: "", overview: "", nextExamDate: "2027-05-01", difficultyLevel: 3, categoryId: "undergraduate", eligibility: "", careerOpportunities: "", syllabusTopics: "" });
              setViewMode("add-exam");
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" /> New Exam
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-rose-500"><X className="h-4 w-4" /></button>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
          <Check className="h-5 w-5 shrink-0" />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-auto text-emerald-500"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Categories View Mode */}
      {viewMode === "categories" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Category Management</h3>
            <button
              onClick={() => setViewMode("exam")}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Back to Exams
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1 p-5 border rounded-2xl bg-slate-50/50 dark:bg-slate-850/40">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-sm">{editingCategoryId ? "Edit Category" : "Add New Category"}</h4>
                {editingCategoryId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategoryId(null);
                      setCategoryForm({ id: "", title: "", description: "", icon: "🎓" });
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
              <form onSubmit={handleSaveCategory} className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Unique Code ID</label>
                  <input
                    type="text" required placeholder="e.g. undergraduate, medical"
                    value={categoryForm.id}
                    disabled={!!editingCategoryId}
                    onChange={e => setCategoryForm({ ...categoryForm, id: e.target.value })}
                    className="w-full rounded-xl border p-2 text-xs bg-white dark:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Title</label>
                  <input
                    type="text" required placeholder="e.g. Undergrad Exams"
                    value={categoryForm.title}
                    onChange={e => setCategoryForm({ ...categoryForm, title: e.target.value })}
                    className="w-full rounded-xl border p-2 text-xs bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Description</label>
                  <textarea
                    placeholder="Short category description..." rows={2}
                    value={categoryForm.description}
                    onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full rounded-xl border p-2 text-xs bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Icon Emoji</label>
                  <input
                    type="text" placeholder="e.g. 🎓"
                    value={categoryForm.icon}
                    onChange={e => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                    className="w-full rounded-xl border p-2 text-xs bg-white dark:bg-slate-800"
                  />
                </div>
                <button type="submit" className="w-full py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700">
                  {editingCategoryId ? "Update Category" : "Create Category"}
                </button>
              </form>
            </div>

            <div className="md:col-span-2 space-y-3">
              <h4 className="font-semibold text-sm">Active Categories ({categories.length})</h4>
              {categories.length === 0 ? (
                <div className="p-8 border border-dashed rounded-2xl text-center text-slate-400 text-xs">
                  No categories found. Create one using the form on the left.
                </div>
              ) : (
                <div className="grid gap-3">
                  {categories.map((cat: any) => {
                    const linkedCount = exams.filter(
                      (ex: any) => ex.categoryId === cat.id || ex.category_id === cat.id
                    ).length;

                    return (
                      <div key={cat.id} className="group flex justify-between items-center p-4 border rounded-2xl bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xl shrink-0 p-2 bg-slate-100 dark:bg-slate-700/60 rounded-xl">{cat.icon || "🎓"}</span>
                          <div className="min-w-0">
                            <span className="font-bold text-sm block truncate text-slate-800 dark:text-slate-100">{cat.title}</span>
                            {cat.description && (
                              <span className="text-xs text-slate-400 block truncate mt-0.5">{cat.description}</span>
                            )}
                            {linkedCount > 0 && (
                              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium block mt-1">
                                {linkedCount} {linkedCount === 1 ? "exam" : "exams"} linked
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full font-mono">{cat.id}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setCategoryForm({
                                id: cat.id,
                                title: cat.title,
                                description: cat.description || "",
                                icon: cat.icon || "🎓"
                              });
                              setEditingCategoryId(cat.id);
                            }}
                            title={`Edit ${cat.title}`}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id, cat.title)}
                            title={`Delete ${cat.title}`}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add New Exam Form Mode */}
      {viewMode === "add-exam" && (
        <form onSubmit={handleSaveExam} className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="text-lg font-bold">Register New Exam Intake</h3>
            <button type="button" onClick={() => setViewMode("exam")} className="text-xs text-slate-500 font-bold">Cancel</button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400">Exam Code ID (Uppercase)</label>
              <input
                type="text" required placeholder="e.g. JEE, NEET, EAMCET"
                value={examForm.id}
                onChange={e => setExamForm({ ...examForm, id: e.target.value.toUpperCase() })}
                className="w-full rounded-xl border p-2.5 text-xs bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400">Exam Category Alignment</label>
              <select
                value={examForm.categoryId}
                onChange={e => setExamForm({ ...examForm, categoryId: e.target.value })}
                className="w-full rounded-xl border p-2.5 text-xs bg-white dark:bg-slate-800"
              >
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400">Full Exam Name</label>
              <input
                type="text" required placeholder="e.g. Joint Entrance Examination"
                value={examForm.fullName}
                onChange={e => setExamForm({ ...examForm, fullName: e.target.value })}
                className="w-full rounded-xl border p-2.5 text-xs bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400">Tagline Description</label>
              <input
                type="text" placeholder="e.g. Your gateway to IITs and NITs"
                value={examForm.tagline}
                onChange={e => setExamForm({ ...examForm, tagline: e.target.value })}
                className="w-full rounded-xl border p-2.5 text-xs bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400">Expected Exam Date</label>
              <input
                type="date"
                value={examForm.nextExamDate}
                onChange={e => setExamForm({ ...examForm, nextExamDate: e.target.value })}
                className="w-full rounded-xl border p-2.5 text-xs bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400">Difficulty Index (1 = Easy, 5 = Extreme)</label>
              <select
                value={examForm.difficultyLevel}
                onChange={e => setExamForm({ ...examForm, difficultyLevel: Number(e.target.value) })}
                className="w-full rounded-xl border p-2.5 text-xs bg-white dark:bg-slate-800"
              >
                <option value={1}>1 (Easy)</option>
                <option value={2}>2 (Medium-Easy)</option>
                <option value={3}>3 (Moderate)</option>
                <option value={4}>4 (Hard)</option>
                <option value={5}>5 (Very Hard / Competitive)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400">Overview Description</label>
            <textarea
              placeholder="Provide a general summary of the exam, sections, structure..." rows={3}
              value={examForm.overview}
              onChange={e => setExamForm({ ...examForm, overview: e.target.value })}
              className="w-full rounded-xl border p-2.5 text-xs bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400">Eligibility Criteria (Comma separated)</label>
            <input
              type="text" placeholder="e.g. Class 12 (PCM) with 75%+, Max 3 consecutive attempts"
              value={examForm.eligibility}
              onChange={e => setExamForm({ ...examForm, eligibility: e.target.value })}
              className="w-full rounded-xl border p-2.5 text-xs bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400">Career Paths & Opportunities (Comma separated)</label>
            <input
              type="text" placeholder="e.g. Graduate Engineer, Research Scientist, Entrepreneurship"
              value={examForm.careerOpportunities}
              onChange={e => setExamForm({ ...examForm, careerOpportunities: e.target.value })}
              className="w-full rounded-xl border p-2.5 text-xs bg-white dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400">Syllabus Highlights (Comma separated)</label>
            <input
              type="text" placeholder="e.g. Calculus, Mechanics, Electrodynamics, Organic Chemistry"
              value={examForm.syllabusTopics}
              onChange={e => setExamForm({ ...examForm, syllabusTopics: e.target.value })}
              className="w-full rounded-xl border p-2.5 text-xs bg-white dark:bg-slate-800"
            />
          </div>

          <button type="submit" className="w-full py-3 bg-teal-600 text-white rounded-2xl text-xs font-bold">
            Create Exam Profile
          </button>
        </form>
      )}

      {/* Main Interactive Manager Layout */}
      {viewMode === "exam" && (
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Left Panel: Exams Selector */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wide text-slate-400">Select Exam</h3>
            {loading ? (
              <p className="text-xs">Fetching dynamic list...</p>
            ) : (
              <div className="space-y-1.5">
                {exams.map((ex) => (
                  <div key={ex.id} className="relative group">
                    <button
                      onClick={() => handleSelectExam(ex)}
                      className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                        selectedExam?.id === ex.id
                          ? "bg-teal-50 text-teal-800 dark:bg-teal-950/20 dark:text-teal-400"
                          : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{ex.icon || "⚙️"}</span>
                        <span>{ex.id}</span>
                      </span>
                      <span className="block text-[10px] font-normal text-slate-400">{ex.fullName || ex.full_name}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteExam(ex.id)}
                      className="absolute right-2 top-3 p-1.5 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50 rounded-lg dark:hover:bg-rose-950/30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel: Content Configurator */}
          <div className="lg:col-span-3 space-y-6">
            {selectedExam ? (
              <div className="space-y-6">
                {/* Horizontal tabs */}
                <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto scrollbar-none">
                  {(["info", "syllabus", "mocktests", "live", "announcements", "feedbacks", "doubts"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => { setActiveTab(tab); setSelectedSubject(null); setSelectedChapter(null); }}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        activeTab === tab
                          ? "border-teal-500 text-teal-600 dark:text-teal-400"
                          : "border-transparent text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {tab === "doubts" && <HelpCircle className="h-3.5 w-3.5" />}
                      {tab === "info" ? "Profile" : tab === "syllabus" ? "Syllabus & Chapters" : tab === "mocktests" ? "Mock Tests" : tab === "live" ? "Live Classes" : tab === "announcements" ? "Announcements" : tab === "feedbacks" ? "Reviews & Stars" : "Doubt Desk"}
                    </button>
                  ))}
                </div>

                {/* TAB 1: Profile Editing */}
                {activeTab === "info" && (
                  <form onSubmit={handleSaveExam} className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
                    <h4 className="text-base font-extrabold">Edit Exam Overview - {selectedExam.id}</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400">Full Exam Name</label>
                        <input
                          type="text" required
                          value={examForm.fullName}
                          onChange={e => setExamForm({ ...examForm, fullName: e.target.value })}
                          className="w-full rounded-xl border p-2.5 text-xs bg-white dark:bg-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400">Expected Exam Date</label>
                        <input
                          type="date"
                          value={examForm.nextExamDate}
                          onChange={e => setExamForm({ ...examForm, nextExamDate: e.target.value })}
                          className="w-full rounded-xl border p-2.5 text-xs bg-white dark:bg-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400">Tagline Description</label>
                        <input
                          type="text"
                          value={examForm.tagline}
                          onChange={e => setExamForm({ ...examForm, tagline: e.target.value })}
                          className="w-full rounded-xl border p-2.5 text-xs bg-white dark:bg-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400">Difficulty Index</label>
                        <select
                          value={examForm.difficultyLevel}
                          onChange={e => setExamForm({ ...examForm, difficultyLevel: Number(e.target.value) })}
                          className="w-full rounded-xl border p-2.5 text-xs bg-white dark:bg-slate-800"
                        >
                          <option value={1}>1 (Easy)</option>
                          <option value={2}>2 (Medium-Easy)</option>
                          <option value={3}>3 (Moderate)</option>
                          <option value={4}>4 (Hard)</option>
                          <option value={5}>5 (Very Hard)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400">Exam Category Alignment</label>
                      <select
                        value={examForm.categoryId}
                        onChange={e => setExamForm({ ...examForm, categoryId: e.target.value })}
                        className="w-full rounded-xl border p-2.5 text-xs bg-white dark:bg-slate-800"
                      >
                        {categories.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400">Overview Description</label>
                      <textarea
                        rows={4}
                        value={examForm.overview}
                        onChange={e => setExamForm({ ...examForm, overview: e.target.value })}
                        className="w-full rounded-xl border p-2.5 text-xs bg-white dark:bg-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400">Eligibility Criteria (Comma separated)</label>
                      <input
                        type="text"
                        value={examForm.eligibility}
                        onChange={e => setExamForm({ ...examForm, eligibility: e.target.value })}
                        className="w-full rounded-xl border p-2.5 text-xs bg-white dark:bg-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400">Career Opportunities (Comma separated)</label>
                      <input
                        type="text"
                        value={examForm.careerOpportunities}
                        onChange={e => setExamForm({ ...examForm, careerOpportunities: e.target.value })}
                        className="w-full rounded-xl border p-2.5 text-xs bg-white dark:bg-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400">Syllabus Highlights (Comma separated)</label>
                      <input
                        type="text"
                        value={examForm.syllabusTopics}
                        onChange={e => setExamForm({ ...examForm, syllabusTopics: e.target.value })}
                        className="w-full rounded-xl border p-2.5 text-xs bg-white dark:bg-slate-800"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button type="submit" className="px-5 py-2.5 bg-teal-600 text-white rounded-2xl text-xs font-bold">
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}

                {/* TAB 2: Subjects, Chapters, Video, Notes & Assignments Builder */}
                {activeTab === "syllabus" && (
                  <div className="grid gap-6 md:grid-cols-3">
                    {/* Subjects Column */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-xs uppercase text-slate-400">
                          {editingSubjectId ? "Edit Subject" : "Subjects"}
                        </h4>
                        <button
                          onClick={() => {
                            setSubjectForm({ id: "", name: "", icon: "📐", color: "bg-blue-500" });
                            setEditingSubjectId(null);
                            setIsAddingSubject(prev => !prev);
                          }}
                          className="text-teal-600 hover:text-teal-700"
                          title="Add Subject"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {isAddingSubject && (
                        <form onSubmit={handleAddSubject} className="p-3 border rounded-xl bg-slate-50/50 space-y-2 dark:bg-slate-800/40">
                          <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
                            <span>{editingSubjectId ? "Update Subject" : "New Subject"}</span>
                            {editingSubjectId && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAddingSubject(false);
                                  setEditingSubjectId(null);
                                  setSubjectForm({ id: "", name: "", icon: "📐", color: "bg-blue-500" });
                                }}
                                className="text-slate-400 hover:text-slate-600 text-[10px]"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                          <input
                            type="text" required placeholder="Subject Name"
                            value={subjectForm.name}
                            onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })}
                            className="w-full rounded-lg border p-2 text-[11px] bg-white dark:bg-slate-900"
                          />
                          <div className="flex gap-1.5">
                            <input
                              type="text" placeholder="Icon (e.g. 📐)"
                              value={subjectForm.icon}
                              onChange={e => setSubjectForm({ ...subjectForm, icon: e.target.value })}
                              className="w-1/2 rounded-lg border p-2 text-[11px] bg-white dark:bg-slate-900"
                            />
                            <select
                              value={subjectForm.color}
                              onChange={e => setSubjectForm({ ...subjectForm, color: e.target.value })}
                              className="w-1/2 rounded-lg border p-2 text-[11px] bg-white dark:bg-slate-900 font-mono"
                            >
                              <option value="bg-blue-500">Blue</option>
                              <option value="bg-emerald-500">Emerald</option>
                              <option value="bg-orange-500">Orange</option>
                              <option value="bg-purple-500">Purple</option>
                              <option value="bg-rose-500">Rose</option>
                            </select>
                          </div>
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setIsAddingSubject(false);
                                setEditingSubjectId(null);
                                setSubjectForm({ id: "", name: "", icon: "📐", color: "bg-blue-500" });
                              }}
                              className="px-2 py-1 text-[10px] border rounded"
                            >
                              Cancel
                            </button>
                            <button type="submit" className="px-2.5 py-1 text-[10px] bg-teal-600 text-white rounded font-bold">
                              {editingSubjectId ? "Update" : "Save"}
                            </button>
                          </div>
                        </form>
                      )}

                      <div className="space-y-1">
                        {(selectedExam.subjects || []).length === 0 ? (
                          <p className="text-xs text-slate-400 py-4 text-center">No subjects yet. Click + to add.</p>
                        ) : (
                          (selectedExam.subjects || []).map((sub: any) => (
                            <div
                              key={sub.id}
                              className={`group relative w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                                selectedSubject?.id === sub.id ? "bg-slate-100 dark:bg-slate-800 text-teal-600" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => { setSelectedSubject(sub); setSelectedChapter(null); }}
                                className="flex-1 text-left flex items-center gap-1.5 truncate"
                              >
                                <span>{sub.icon || "📐"}</span>
                                <span className="truncate">{sub.name}</span>
                              </button>
                              <div className="flex items-center gap-1 shrink-0 ml-2">
                                <span className="text-[10px] text-slate-400 font-normal group-hover:hidden">
                                  {(selectedExam.chapters || []).filter((ch: any) => ch.subject_id === sub.id).length} ch
                                </span>
                                <div className="hidden group-hover:flex items-center gap-0.5">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSubjectForm({ id: sub.id, name: sub.name, icon: sub.icon || "📐", color: sub.color || "bg-blue-500" });
                                      setEditingSubjectId(sub.id);
                                      setIsAddingSubject(true);
                                    }}
                                    className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                                    title="Edit Subject"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteSubject(sub.id, sub.name);
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                    title="Delete Subject"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Chapters Column */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-xs uppercase text-slate-400">
                          {editingChapterId ? "Edit Chapter" : "Chapters"}
                        </h4>
                        {selectedSubject && (
                          <button
                            onClick={() => {
                              setChapterForm({ id: "", name: "" });
                              setEditingChapterId(null);
                              setIsAddingChapter(prev => !prev);
                            }}
                            className="text-teal-600 hover:text-teal-700"
                            title="Add Chapter"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {isAddingChapter && (
                        <form onSubmit={handleAddChapter} className="p-3 border rounded-xl bg-slate-50/50 space-y-2 dark:bg-slate-800/40">
                          <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
                            <span>{editingChapterId ? "Update Chapter" : "New Chapter"}</span>
                            {editingChapterId && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAddingChapter(false);
                                  setEditingChapterId(null);
                                  setChapterForm({ id: "", name: "" });
                                }}
                                className="text-slate-400 hover:text-slate-600 text-[10px]"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                          <input
                            type="text" required placeholder="Chapter Title"
                            value={chapterForm.name}
                            onChange={e => setChapterForm({ ...chapterForm, name: e.target.value })}
                            className="w-full rounded-lg border p-2 text-[11px] bg-white dark:bg-slate-900"
                          />
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setIsAddingChapter(false);
                                setEditingChapterId(null);
                                setChapterForm({ id: "", name: "" });
                              }}
                              className="px-2 py-1 text-[10px] border rounded"
                            >
                              Cancel
                            </button>
                            <button type="submit" className="px-2.5 py-1 text-[10px] bg-teal-600 text-white rounded font-bold">
                              {editingChapterId ? "Update" : "Save"}
                            </button>
                          </div>
                        </form>
                      )}

                      {selectedSubject ? (
                        <div className="space-y-1">
                          {(selectedExam.chapters || []).filter((ch: any) => ch.subject_id === selectedSubject.id).length === 0 ? (
                            <p className="text-xs text-slate-400 py-4 text-center">No chapters in {selectedSubject.name} yet. Click + to add.</p>
                          ) : (
                            (selectedExam.chapters || []).filter((ch: any) => ch.subject_id === selectedSubject.id).map((ch: any) => (
                              <div
                                key={ch.id}
                                className={`group relative w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                                  selectedChapter?.id === ch.id ? "bg-slate-100 dark:bg-slate-800 text-indigo-500" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedChapter(ch);
                                    refreshSelectedChapter(ch.id);
                                  }}
                                  className="flex-1 text-left truncate"
                                >
                                  <span className="truncate">{ch.name}</span>
                                </button>
                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                  <span className="text-[9px] text-slate-400 font-mono group-hover:hidden">
                                    {(ch.videos || []).length} v | {(ch.notes || []).length} n
                                  </span>
                                  <div className="hidden group-hover:flex items-center gap-0.5">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setChapterForm({ id: ch.id, name: ch.name });
                                        setEditingChapterId(ch.id);
                                        setIsAddingChapter(true);
                                      }}
                                      className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                                      title="Edit Chapter"
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteChapter(ch.id, ch.name);
                                      }}
                                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                      title="Delete Chapter"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">Select a subject on the left to configure chapters.</p>
                      )}
                    </div>

                    {/* Chapter Media & Questions Builder */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
                      <h4 className="font-extrabold text-xs uppercase text-slate-400">Chapter Resources</h4>

                      {selectedChapter ? (
                        <div className="space-y-6">
                          {/* Videos Section */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center border-b pb-1">
                              <span className="text-xs font-bold text-slate-500 flex items-center gap-1"><Video className="h-3.5 w-3.5" /> Videos</span>
                              <button
                                onClick={() => {
                                  setVideoForm({ id: "", title: "", duration: "15:00", url: "" });
                                  setEditingVideoId(null);
                                  setIsAddingVideo(prev => !prev);
                                }}
                                className="text-[10px] font-bold text-teal-600 hover:underline"
                              >
                                {isAddingVideo && !editingVideoId ? "Close" : "+ Add Video"}
                              </button>
                            </div>

                            {isAddingVideo && (
                              <form onSubmit={handleAddVideo} className="p-3 border rounded-xl bg-slate-50/50 space-y-2 dark:bg-slate-800/40">
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                                  <span>{editingVideoId ? "Edit Video" : "New Video"}</span>
                                  {editingVideoId && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setIsAddingVideo(false);
                                        setEditingVideoId(null);
                                        setVideoForm({ id: "", title: "", duration: "15:00", url: "" });
                                      }}
                                      className="text-slate-400 hover:text-slate-600 text-[9px]"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                </div>
                                <input
                                  type="text" required placeholder="Video Title"
                                  value={videoForm.title}
                                  onChange={e => setVideoForm({ ...videoForm, title: e.target.value })}
                                  className="w-full rounded-lg border p-1.5 text-[10px] bg-white dark:bg-slate-900"
                                />
                                <input
                                  type="text" placeholder="Duration (e.g., 20:15)"
                                  value={videoForm.duration}
                                  onChange={e => setVideoForm({ ...videoForm, duration: e.target.value })}
                                  className="w-full rounded-lg border p-1.5 text-[10px] bg-white dark:bg-slate-900"
                                />
                                <input
                                  type="text" required placeholder="YouTube URL or Video Link"
                                  value={videoForm.url}
                                  onChange={e => setVideoForm({ ...videoForm, url: e.target.value })}
                                  className="w-full rounded-lg border p-1.5 text-[10px] bg-white dark:bg-slate-900"
                                />
                                <div className="flex justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsAddingVideo(false);
                                      setEditingVideoId(null);
                                      setVideoForm({ id: "", title: "", duration: "15:00", url: "" });
                                    }}
                                    className="px-2 py-0.5 text-[9px] border rounded"
                                  >
                                    Cancel
                                  </button>
                                  <button type="submit" className="px-2.5 py-0.5 text-[9px] bg-teal-600 text-white rounded font-bold">
                                    {editingVideoId ? "Update" : "Add"}
                                  </button>
                                </div>
                              </form>
                            )}

                            <div className="space-y-1">
                              {(selectedChapter.videos || []).length === 0 ? (
                                <p className="text-[11px] text-slate-400 py-1 italic">No videos added yet.</p>
                              ) : (
                                (selectedChapter.videos || []).map((v: any) => (
                                  <div key={v.id} className="group text-[11px] flex justify-between items-center py-1 border-b last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-1 rounded">
                                    <span className="truncate pr-2">{v.title}</span>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <span className="text-slate-400 font-mono text-[10px]">{v.duration}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setVideoForm({ id: v.id, title: v.title, duration: v.duration, url: v.url });
                                          setEditingVideoId(v.id);
                                          setIsAddingVideo(true);
                                        }}
                                        className="p-1 text-slate-400 hover:text-indigo-600"
                                        title="Edit Video"
                                      >
                                        <Edit2 className="h-3 w-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteVideo(v.id, v.title)}
                                        className="p-1 text-slate-400 hover:text-rose-600"
                                        title="Delete Video"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Notes Section */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center border-b pb-1">
                              <span className="text-xs font-bold text-slate-500 flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Revision Notes</span>
                              <button
                                onClick={() => {
                                  setNoteForm({ id: "", title: "", size: "1.5 MB", pdfUrl: "" });
                                  setEditingNoteId(null);
                                  setIsAddingNote(prev => !prev);
                                }}
                                className="text-[10px] font-bold text-teal-600 hover:underline"
                              >
                                {isAddingNote && !editingNoteId ? "Close" : "+ Add Note"}
                              </button>
                            </div>

                            {isAddingNote && (
                              <form onSubmit={handleAddNote} className="p-3 border rounded-xl bg-slate-50/50 space-y-2 dark:bg-slate-800/40">
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                                  <span>{editingNoteId ? "Edit Revision Note" : "New Revision Note"}</span>
                                  {editingNoteId && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setIsAddingNote(false);
                                        setEditingNoteId(null);
                                        setNoteForm({ id: "", title: "", size: "1.5 MB", pdfUrl: "" });
                                      }}
                                      className="text-slate-400 hover:text-slate-600 text-[9px]"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                </div>
                                <input
                                  type="text" required placeholder="Note Title"
                                  value={noteForm.title}
                                  onChange={e => setNoteForm({ ...noteForm, title: e.target.value })}
                                  className="w-full rounded-lg border p-1.5 text-[10px] bg-white dark:bg-slate-900"
                                />
                                <input
                                  type="text" placeholder="File Size (e.g., 2.3 MB)"
                                  value={noteForm.size}
                                  onChange={e => setNoteForm({ ...noteForm, size: e.target.value })}
                                  className="w-full rounded-lg border p-1.5 text-[10px] bg-white dark:bg-slate-900"
                                />
                                <input
                                  type="text" required placeholder="PDF Document URL"
                                  value={noteForm.pdfUrl}
                                  onChange={e => setNoteForm({ ...noteForm, pdfUrl: e.target.value })}
                                  className="w-full rounded-lg border p-1.5 text-[10px] bg-white dark:bg-slate-900"
                                />
                                <div className="flex justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsAddingNote(false);
                                      setEditingNoteId(null);
                                      setNoteForm({ id: "", title: "", size: "1.5 MB", pdfUrl: "" });
                                    }}
                                    className="px-2 py-0.5 text-[9px] border rounded"
                                  >
                                    Cancel
                                  </button>
                                  <button type="submit" className="px-2.5 py-0.5 text-[9px] bg-teal-600 text-white rounded font-bold">
                                    {editingNoteId ? "Update" : "Add"}
                                  </button>
                                </div>
                              </form>
                            )}

                            <div className="space-y-1">
                              {(selectedChapter.notes || []).length === 0 ? (
                                <p className="text-[11px] text-slate-400 py-1 italic">No notes added yet.</p>
                              ) : (
                                (selectedChapter.notes || []).map((n: any) => (
                                  <div key={n.id} className="group text-[11px] flex justify-between items-center py-1 border-b last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-1 rounded">
                                    <span className="truncate pr-2">{n.title}</span>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <span className="text-slate-400 font-mono text-[10px]">{n.size}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setNoteForm({ id: n.id, title: n.title, size: n.size, pdfUrl: n.pdf_url || n.pdfUrl || "" });
                                          setEditingNoteId(n.id);
                                          setIsAddingNote(true);
                                        }}
                                        className="p-1 text-slate-400 hover:text-indigo-600"
                                        title="Edit Note"
                                      >
                                        <Edit2 className="h-3 w-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteNote(n.id, n.title)}
                                        className="p-1 text-slate-400 hover:text-rose-600"
                                        title="Delete Note"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Practice Questions Section */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center border-b pb-1">
                              <span className="text-xs font-bold text-slate-500 flex items-center gap-1"><Book className="h-3.5 w-3.5" /> PYQ & Practice</span>
                              <div className="flex items-center gap-1.5">
                                <button 
                                  onClick={() => { setBulkTarget("practice"); setParsedQuestions([]); setBulkModalOpen(true); }}
                                  className="flex items-center gap-1 px-2 py-0.5 text-[9px] bg-indigo-50 text-indigo-600 rounded-md font-bold hover:bg-indigo-100"
                                >
                                  <FileSpreadsheet className="h-3 w-3" /> Import Excel
                                </button>
                                <button
                                  onClick={() => {
                                    setPracticeForm({ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: 0, explanation: "" });
                                    setEditingPracticeId(null);
                                    setIsAddingPractice(prev => !prev);
                                  }}
                                  className="text-[10px] font-bold text-teal-600 hover:underline"
                                >
                                  {isAddingPractice && !editingPracticeId ? "Close" : "+ Add Q"}
                                </button>
                              </div>
                            </div>

                            {isAddingPractice && (
                              <form onSubmit={handleAddPractice} className="p-3 border rounded-xl bg-slate-50/50 space-y-2 dark:bg-slate-800/40">
                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                                  <span>{editingPracticeId ? "Edit Practice Question" : "New Practice Question"}</span>
                                  {editingPracticeId && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setIsAddingPractice(false);
                                        setEditingPracticeId(null);
                                        setPracticeForm({ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: 0, explanation: "" });
                                      }}
                                      className="text-slate-400 hover:text-slate-600 text-[9px]"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                </div>
                                <input
                                  type="text" required placeholder="Question content"
                                  value={practiceForm.question}
                                  onChange={e => setPracticeForm({ ...practiceForm, question: e.target.value })}
                                  className="w-full rounded-lg border p-1.5 text-[10px] bg-white dark:bg-slate-900"
                                />
                                <div className="grid grid-cols-2 gap-1">
                                  <input type="text" required placeholder="A" value={practiceForm.optionA} onChange={e => setPracticeForm({ ...practiceForm, optionA: e.target.value })} className="border p-1 text-[9px] bg-white dark:bg-slate-900 rounded" />
                                  <input type="text" required placeholder="B" value={practiceForm.optionB} onChange={e => setPracticeForm({ ...practiceForm, optionB: e.target.value })} className="border p-1 text-[9px] bg-white dark:bg-slate-900 rounded" />
                                  <input type="text" required placeholder="C" value={practiceForm.optionC} onChange={e => setPracticeForm({ ...practiceForm, optionC: e.target.value })} className="border p-1 text-[9px] bg-white dark:bg-slate-900 rounded" />
                                  <input type="text" required placeholder="D" value={practiceForm.optionD} onChange={e => setPracticeForm({ ...practiceForm, optionD: e.target.value })} className="border p-1 text-[9px] bg-white dark:bg-slate-900 rounded" />
                                </div>
                                <select
                                  value={practiceForm.correctAnswer}
                                  onChange={e => setPracticeForm({ ...practiceForm, correctAnswer: Number(e.target.value) })}
                                  className="w-full rounded border p-1 text-[10px] bg-white dark:bg-slate-900"
                                >
                                  <option value={0}>Correct: A</option>
                                  <option value={1}>Correct: B</option>
                                  <option value={2}>Correct: C</option>
                                  <option value={3}>Correct: D</option>
                                </select>
                                <input
                                  type="text" placeholder="Explanation description"
                                  value={practiceForm.explanation}
                                  onChange={e => setPracticeForm({ ...practiceForm, explanation: e.target.value })}
                                  className="w-full rounded-lg border p-1.5 text-[10px] bg-white dark:bg-slate-900"
                                />
                                <div className="flex justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsAddingPractice(false);
                                      setEditingPracticeId(null);
                                      setPracticeForm({ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: 0, explanation: "" });
                                    }}
                                    className="px-2 py-0.5 text-[9px] border rounded"
                                  >
                                    Cancel
                                  </button>
                                  <button type="submit" className="px-2.5 py-0.5 text-[9px] bg-teal-600 text-white rounded font-bold">
                                    {editingPracticeId ? "Update" : "Add"}
                                  </button>
                                </div>
                              </form>
                            )}

                            <div className="space-y-1">
                              {(selectedChapter.practiceQuestions || []).length === 0 ? (
                                <p className="text-[11px] text-slate-400 py-1 italic">No questions added yet.</p>
                              ) : (
                                (selectedChapter.practiceQuestions || []).map((q: any, i: number) => (
                                  <div key={q.id || i} className="group text-[11px] flex justify-between items-center py-1.5 border-b last:border-0 text-slate-600 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-1 rounded">
                                    <span className="truncate pr-2 flex-1">
                                      <span className="font-bold text-teal-600 mr-1">Q{i+1}:</span> {q.question}
                                    </span>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setPracticeForm({
                                            question: q.question,
                                            optionA: q.options?.[0] || "",
                                            optionB: q.options?.[1] || "",
                                            optionC: q.options?.[2] || "",
                                            optionD: q.options?.[3] || "",
                                            correctAnswer: q.correct_answer ?? q.correctAnswer ?? 0,
                                            explanation: q.explanation || ""
                                          });
                                          setEditingPracticeId(q.id);
                                          setIsAddingPractice(true);
                                        }}
                                        className="p-1 text-slate-400 hover:text-indigo-600"
                                        title="Edit Question"
                                      >
                                        <Edit2 className="h-3 w-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeletePractice(q.id)}
                                        className="p-1 text-slate-400 hover:text-rose-600"
                                        title="Delete Question"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">Select a chapter to configure videos, notes, and assignments.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: Mock Tests & Questions Builder */}
                {activeTab === "mocktests" && (
                  <div className="grid gap-6 md:grid-cols-3">
                    {/* Mock sets list */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-xs uppercase text-slate-400">
                          {editingMockId ? "Edit Test Set" : "Test Sets"}
                        </h4>
                        <button
                          onClick={() => {
                            setMockForm({ id: "", name: "", duration: 1800 });
                            setEditingMockId(null);
                            setIsAddingMock(prev => !prev);
                          }}
                          className="text-teal-600 hover:text-teal-700"
                          title="Add Test Set"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {isAddingMock && (
                        <form onSubmit={handleAddMockTest} className="p-3 border rounded-xl bg-slate-50/50 space-y-2 dark:bg-slate-800/40">
                          <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
                            <span>{editingMockId ? "Update Test Set" : "New Test Set"}</span>
                            {editingMockId && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAddingMock(false);
                                  setEditingMockId(null);
                                  setMockForm({ id: "", name: "", duration: 1800 });
                                }}
                                className="text-slate-400 hover:text-slate-600 text-[10px]"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                          <input
                            type="text" required placeholder="Test Name"
                            value={mockForm.name}
                            onChange={e => setMockForm({ ...mockForm, name: e.target.value })}
                            className="w-full rounded-lg border p-2 text-[11px] bg-white dark:bg-slate-900"
                          />
                          <input
                            type="number" required placeholder="Duration in seconds (e.g. 1800)"
                            value={mockForm.duration}
                            onChange={e => setMockForm({ ...mockForm, duration: Number(e.target.value) })}
                            className="w-full rounded-lg border p-2 text-[11px] bg-white dark:bg-slate-900"
                          />
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setIsAddingMock(false);
                                setEditingMockId(null);
                                setMockForm({ id: "", name: "", duration: 1800 });
                              }}
                              className="px-2 py-1 text-[10px] border rounded"
                            >
                              Cancel
                            </button>
                            <button type="submit" className="px-2.5 py-1 text-[10px] bg-teal-600 text-white rounded font-bold">
                              {editingMockId ? "Update" : "Save"}
                            </button>
                          </div>
                        </form>
                      )}

                      <div className="space-y-1">
                        {(selectedExam.mockTests || []).length === 0 ? (
                          <p className="text-xs text-slate-400 py-4 text-center">No mock tests yet. Click + to create one.</p>
                        ) : (
                          (selectedExam.mockTests || []).map((t: any) => (
                            <div
                              key={t.id}
                              className={`group relative w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                                selectedMockTest?.id === t.id ? "bg-slate-100 dark:bg-slate-800 text-indigo-500" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMockTest(t);
                                  refreshSelectedMockTest(t.id);
                                }}
                                className="flex-1 text-left truncate"
                              >
                                <span className="truncate">{t.name}</span>
                              </button>
                              <div className="flex items-center gap-1 shrink-0 ml-2">
                                <span className="text-[10px] text-slate-400 font-normal group-hover:hidden">
                                  {(t.questions_count ?? t.questions?.length ?? 0)} Qs
                                </span>
                                <div className="hidden group-hover:flex items-center gap-0.5">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMockForm({ id: t.id, name: t.name, duration: t.duration });
                                      setEditingMockId(t.id);
                                      setIsAddingMock(true);
                                    }}
                                    className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                                    title="Edit Test Set"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteMockTest(t.id, t.name);
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                    title="Delete Test Set"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Questions Builder */}
                    <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
                      {selectedMockTest ? (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">Questions in: {selectedMockTest.name}</h4>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleDownloadTemplate}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300"
                                title="Download ready-to-fill Excel template"
                              >
                                <Download className="h-3.5 w-3.5" /> Template
                              </button>
                              <button
                                onClick={() => { setBulkTarget("mock"); setParsedQuestions([]); setBulkModalOpen(true); }}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-xs"
                              >
                                <FileSpreadsheet className="h-3.5 w-3.5" /> Import Excel
                              </button>
                              <button
                                onClick={() => {
                                  setQuestionForm({ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: 0, explanation: "", topic: "" });
                                  setEditingQuestionId(null);
                                  setIsAddingQuestion(prev => !prev);
                                }}
                                className="flex items-center gap-1 text-xs font-bold text-teal-600"
                              >
                                <Plus className="h-4 w-4" /> {isAddingQuestion && !editingQuestionId ? "Close Form" : "Add Question"}
                              </button>
                            </div>
                          </div>

                          {isAddingQuestion && (
                            <form onSubmit={handleAddQuestion} className="p-4 border rounded-2xl bg-slate-50/50 space-y-3 dark:bg-slate-800/40">
                              <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                <span>{editingQuestionId ? "Edit Question" : "New Question"}</span>
                                {editingQuestionId && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsAddingQuestion(false);
                                      setEditingQuestionId(null);
                                      setQuestionForm({ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: 0, explanation: "", topic: "" });
                                    }}
                                    className="text-slate-400 hover:text-slate-600 text-[10px]"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                              <input
                                type="text" required placeholder="Question description text"
                                value={questionForm.question}
                                onChange={e => setQuestionForm({ ...questionForm, question: e.target.value })}
                                className="w-full rounded-xl border p-2 text-xs bg-white dark:bg-slate-900"
                              />
                              <div className="grid gap-2 md:grid-cols-2">
                                <input type="text" required placeholder="Option A" value={questionForm.optionA} onChange={e => setQuestionForm({ ...questionForm, optionA: e.target.value })} className="rounded-xl border p-2 text-xs bg-white dark:bg-slate-900" />
                                <input type="text" required placeholder="Option B" value={questionForm.optionB} onChange={e => setQuestionForm({ ...questionForm, optionB: e.target.value })} className="rounded-xl border p-2 text-xs bg-white dark:bg-slate-900" />
                                <input type="text" required placeholder="Option C" value={questionForm.optionC} onChange={e => setQuestionForm({ ...questionForm, optionC: e.target.value })} className="rounded-xl border p-2 text-xs bg-white dark:bg-slate-900" />
                                <input type="text" required placeholder="Option D" value={questionForm.optionD} onChange={e => setQuestionForm({ ...questionForm, optionD: e.target.value })} className="rounded-xl border p-2 text-xs bg-white dark:bg-slate-900" />
                              </div>
                              <div className="grid gap-2 md:grid-cols-2">
                                <select
                                  value={questionForm.correctAnswer}
                                  onChange={e => setQuestionForm({ ...questionForm, correctAnswer: Number(e.target.value) })}
                                  className="rounded-xl border p-2 text-xs bg-white dark:bg-slate-900"
                                >
                                  <option value={0}>Correct: A</option>
                                  <option value={1}>Correct: B</option>
                                  <option value={2}>Correct: C</option>
                                  <option value={3}>Correct: D</option>
                                </select>
                                <input
                                  type="text" placeholder="Topic Tag (e.g. Optics)"
                                  value={questionForm.topic}
                                  onChange={e => setQuestionForm({ ...questionForm, topic: e.target.value })}
                                  className="rounded-xl border p-2 text-xs bg-white dark:bg-slate-900"
                                />
                              </div>
                              <input
                                type="text" placeholder="Answer Explanation description"
                                value={questionForm.explanation}
                                onChange={e => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                                className="w-full rounded-xl border p-2 text-xs bg-white dark:bg-slate-900"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsAddingQuestion(false);
                                    setEditingQuestionId(null);
                                    setQuestionForm({ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: 0, explanation: "", topic: "" });
                                  }}
                                  className="px-3 py-1 text-xs border rounded-lg"
                                >
                                  Cancel
                                </button>
                                <button type="submit" className="px-3 py-1 bg-teal-600 text-white rounded-lg text-xs font-bold">
                                  {editingQuestionId ? "Update Question" : "Save Question"}
                                </button>
                              </div>
                            </form>
                          )}

                          <div className="space-y-4 max-h-96 overflow-y-auto">
                            {(selectedMockTest.questions || []).length === 0 ? (
                              <p className="text-xs text-slate-400 text-center py-8 italic">No questions in this test set yet. Add via form or import Excel.</p>
                            ) : (
                              (selectedMockTest.questions || []).map((q: any, idx: number) => (
                                <div key={q.id || idx} className="p-4 border rounded-2xl space-y-2 bg-white dark:bg-slate-800 relative group">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] uppercase font-bold text-teal-600">Question {idx+1} {q.topic ? `• ${q.topic}` : ""}</span>
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setQuestionForm({
                                            question: q.question,
                                            optionA: q.options?.[0] || "",
                                            optionB: q.options?.[1] || "",
                                            optionC: q.options?.[2] || "",
                                            optionD: q.options?.[3] || "",
                                            correctAnswer: q.correct_answer ?? q.correctAnswer ?? 0,
                                            explanation: q.explanation || "",
                                            topic: q.topic || ""
                                          });
                                          setEditingQuestionId(q.id);
                                          setIsAddingQuestion(true);
                                        }}
                                        className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                                        title="Edit Question"
                                      >
                                        <Edit2 className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteQuestion(q.id)}
                                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                        title="Delete Question"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{q.question}</p>
                                  <div className="grid gap-1 md:grid-cols-2 text-[10px] text-slate-500">
                                    {q.options?.map((opt: string, optIdx: number) => (
                                      <span key={optIdx} className={optIdx === q.correctAnswer || optIdx === q.correct_answer ? "text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded" : "px-1.5 py-0.5"}>
                                        {String.fromCharCode(65 + optIdx)}. {opt}
                                      </span>
                                    ))}
                                  </div>
                                  {q.explanation && (
                                    <p className="text-[10px] text-slate-400 italic pt-1 border-t">Exp: {q.explanation}</p>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 text-center py-10">Select a mock test on the left list to load question cards.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: Live Classes scheduling */}
                {activeTab === "live" && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <form onSubmit={handleScheduleLive} className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                          <Video className="h-4 w-4 text-red-500" />
                          {editingLiveId ? "Edit Live Session Schedule" : "Schedule Live Session"}
                        </h4>
                        {editingLiveId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingLiveId(null);
                              setLiveForm({ topic: "", scheduledTime: "", duration: 60, url: "", status: "scheduled" });
                            }}
                            className="text-xs text-slate-400 hover:text-slate-600"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400">Topic Title</label>
                        <input
                          type="text" required placeholder="e.g. Calculus Limits Mastery class"
                          value={liveForm.topic}
                          onChange={e => setLiveForm({ ...liveForm, topic: e.target.value })}
                          className="w-full rounded-xl border p-2.5 text-xs bg-white dark:bg-slate-800"
                        />
                      </div>
                      <div className="grid gap-3 grid-cols-2">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400">Schedule Date-Time</label>
                          <input
                            type="datetime-local" required
                            value={liveForm.scheduledTime}
                            onChange={e => setLiveForm({ ...liveForm, scheduledTime: e.target.value })}
                            className="w-full rounded-xl border p-2.5 text-xs bg-white dark:bg-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-400">Duration (mins)</label>
                          <input
                            type="number" required
                            value={liveForm.duration}
                            onChange={e => setLiveForm({ ...liveForm, duration: Number(e.target.value) })}
                            className="w-full rounded-xl border p-2.5 text-xs bg-white dark:bg-slate-800"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400">Broadcast URL</label>
                        <input
                          type="text" placeholder="YouTube Live or Video Stream URL"
                          value={liveForm.url}
                          onChange={e => setLiveForm({ ...liveForm, url: e.target.value })}
                          className="w-full rounded-xl border p-2.5 text-xs bg-white dark:bg-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400">Status</label>
                        <select
                          value={liveForm.status}
                          onChange={e => setLiveForm({ ...liveForm, status: e.target.value })}
                          className="w-full rounded-xl border p-2.5 text-xs bg-white dark:bg-slate-800"
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="ongoing">Live Now</option>
                          <option value="recorded">Recorded playback</option>
                        </select>
                      </div>
                      <button type="submit" className="w-full py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-colors">
                        {editingLiveId ? "Update Live Stream Schedule" : "Publish Live Stream Schedule"}
                      </button>
                    </form>

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3">
                      <h4 className="font-extrabold text-sm">Active Scheduled Classes</h4>
                      <div className="space-y-2">
                        {liveClasses.filter((l: any) => l.exam_id === selectedExam.id).length === 0 ? (
                          <p className="text-xs text-slate-400 py-6 text-center italic">No live classes scheduled for this exam yet.</p>
                        ) : (
                          liveClasses.filter((l: any) => l.exam_id === selectedExam.id).map((l: any) => (
                            <div key={l.id} className="p-3 border rounded-xl flex items-center justify-between text-xs bg-slate-50/30 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                              <div>
                                <span className="font-bold block">{l.topic}</span>
                                <span className="text-slate-400 font-mono text-[10px]">
                                  {new Date(l.scheduled_time || l.scheduledTime).toLocaleString()} ({l.duration} mins)
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  l.status === "ongoing" ? "bg-red-100 text-red-700 animate-pulse" : "bg-blue-150 text-blue-700"
                                }`}>{l.status}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLiveForm({
                                      topic: l.topic,
                                      scheduledTime: l.scheduled_time ? new Date(l.scheduled_time).toISOString().slice(0, 16) : "",
                                      duration: l.duration || 60,
                                      url: l.url || "",
                                      status: l.status || "scheduled"
                                    });
                                    setEditingLiveId(l.id);
                                  }}
                                  className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                                  title="Edit Live Class"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLive(l.id, l.topic)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                  title="Delete Live Class"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: Announcements publishing */}
                {activeTab === "announcements" && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <form onSubmit={handlePublishAnnouncement} className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                          <Megaphone className="h-4 w-4 text-indigo-500" />
                          {editingAnnouncementId ? "Edit Announcement" : "Post New Announcement"}
                        </h4>
                        {editingAnnouncementId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAnnouncementId(null);
                              setAnnouncementForm({ title: "", content: "" });
                            }}
                            className="text-xs text-slate-400 hover:text-slate-600"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400">Announcement Title</label>
                        <input
                          type="text" required placeholder="e.g. Physics Practice Mock Sheet Live"
                          value={announcementForm.title}
                          onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                          className="w-full rounded-xl border p-2.5 text-xs bg-white dark:bg-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400">Announcement Details</label>
                        <textarea
                          required placeholder="Detailed announcement content..." rows={5}
                          value={announcementForm.content}
                          onChange={e => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                          className="w-full rounded-xl border p-2.5 text-xs bg-white dark:bg-slate-800"
                        />
                      </div>
                      <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors">
                        {editingAnnouncementId ? "Update Announcement" : "Publish Announcement"}
                      </button>
                    </form>

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3">
                      <h4 className="font-extrabold text-sm">Published Announcements</h4>
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                        {announcements.filter((a: any) => a.exam_id === selectedExam.id).length === 0 ? (
                          <p className="text-xs text-slate-400 py-6 text-center italic">No announcements published for this exam yet.</p>
                        ) : (
                          announcements.filter((a: any) => a.exam_id === selectedExam.id).map((a: any) => (
                            <div key={a.id} className="p-4 border rounded-2xl bg-slate-50/20 dark:bg-slate-800/20 space-y-1 relative group">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400 font-mono">{new Date(a.created_at || a.createdAt).toLocaleDateString()}</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAnnouncementForm({ title: a.title, content: a.content });
                                      setEditingAnnouncementId(a.id);
                                    }}
                                    className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                                    title="Edit Announcement"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAnnouncement(a.id, a.title)}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                    title="Delete Announcement"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                              <span className="font-bold block text-xs">{a.title}</span>
                              <p className="text-[11px] text-slate-500 leading-relaxed">{a.content}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 6: Reviews & Stars viewer */}
                {activeTab === "feedbacks" && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
                    <div className="flex justify-between items-center border-b pb-3">
                      <h4 className="font-bold text-base">User Reviews & Satisfaction Rating</h4>
                      <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-xl text-yellow-600 text-sm font-bold dark:bg-yellow-950/20 dark:text-yellow-400">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>Average: {avgRating}</span>
                      </div>
                    </div>

                    {examFeedbacks.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-10">No reviews submitted by users for this exam yet.</p>
                    ) : (
                      <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {examFeedbacks.map((f: any) => (
                          <div key={f.id} className="p-4 border rounded-2xl bg-slate-50/20 dark:bg-slate-850/10 space-y-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-600 dark:text-slate-300">{f.user_name || f.user_email || "Student"}</span>
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`h-3 w-3 ${i < f.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-500 italic">"{f.comment || f.review_text || "No review text provided."}"</p>
                            <span className="block text-[9px] text-slate-400 font-mono text-right">{new Date(f.created_at).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 7: Doubt Desk viewer & responder */}
                {activeTab === "doubts" && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-6">
                    <div className="flex justify-between items-center border-b pb-3">
                      <div>
                        <h4 className="font-bold text-base flex items-center gap-2">
                          <HelpCircle className="h-5 w-5 text-teal-600" /> Coaching Doubt Desk
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Review questions posted by students for {selectedExam?.fullName || selectedExam?.id} and respond with mentor guidance.
                        </p>
                      </div>
                      <button
                        onClick={loadCoachingDoubts}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold rounded-xl text-slate-600 dark:text-slate-300 transition"
                      >
                        Refresh
                      </button>
                    </div>

                    {loadingDoubts ? (
                      <p className="text-xs text-slate-400 text-center py-10">Loading student doubts...</p>
                    ) : coachingDoubts.filter(d => !d.exam_type || !selectedExam?.id || d.exam_type.toLowerCase() === selectedExam?.id.toLowerCase()).length === 0 ? (
                      <div className="text-center py-12 space-y-2">
                        <Check className="h-10 w-10 text-emerald-500 mx-auto" />
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">All clear!</p>
                        <p className="text-xs text-slate-400">No student doubts pending for {selectedExam?.fullName || selectedExam?.id}.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                        {coachingDoubts
                          .filter(d => !d.exam_type || !selectedExam?.id || d.exam_type.toLowerCase() === selectedExam?.id.toLowerCase())
                          .map((doubt: any) => (
                          <div key={doubt.id} className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/40 dark:bg-slate-850/20 space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    doubt.status?.toLowerCase() === 'resolved'
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                      : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                                  }`}>
                                    {doubt.status?.toUpperCase() || 'OPEN'}
                                  </span>
                                  <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400">
                                    {doubt.title || "Coaching Doubt"}
                                  </span>
                                </div>
                                
                                {/* Doubt Raiser Profile */}
                                <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold pt-1">
                                  <User className="h-3.5 w-3.5 text-slate-400" />
                                  <span>Doubt Raiser:</span>
                                  <span className="text-indigo-600 dark:text-indigo-400">{doubt.user_name || doubt.user_email || "Student"}</span>
                                  {doubt.user_email && doubt.user_email !== doubt.user_name && (
                                    <span className="text-slate-400 text-[11px]">({doubt.user_email})</span>
                                  )}
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(doubt.created_at).toLocaleString()}
                              </span>
                            </div>

                            {/* Question / Description */}
                            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 font-medium whitespace-pre-wrap">
                              {doubt.description || doubt.question}
                            </div>

                            {/* Existing Faculty Responses */}
                            {((Array.isArray(doubt.responses) && doubt.responses.length > 0) || doubt.response) && (
                              <div className="pl-4 border-l-2 border-teal-400 space-y-2 pt-1">
                                <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">Faculty Replies</span>
                                {Array.isArray(doubt.responses) && doubt.responses.map((resp: any, idx: number) => (
                                  <div key={idx} className="bg-teal-50/50 dark:bg-teal-950/20 p-2.5 rounded-xl border border-teal-100 dark:border-teal-900/40">
                                    <p className="text-[10px] font-bold text-teal-800 dark:text-teal-300">{resp.author || "Faculty Mentor"}:</p>
                                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">{resp.message || resp.response || String(resp)}</p>
                                  </div>
                                ))}
                                {!Array.isArray(doubt.responses) && doubt.response && (
                                  <div className="bg-teal-50/50 dark:bg-teal-950/20 p-2.5 rounded-xl border border-teal-100 dark:border-teal-900/40">
                                    <p className="text-[10px] font-bold text-teal-800 dark:text-teal-300">Faculty Mentor:</p>
                                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">{doubt.response}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Reply Input */}
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-800">
                              <input
                                type="text"
                                placeholder="Type answer/guidance for the student..."
                                value={doubtReplyText[doubt.id] || ""}
                                onChange={(e) => setDoubtReplyText({ ...doubtReplyText, [doubt.id]: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleReplyCoachingDoubt(doubt.id);
                                }}
                                className="flex-1 rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                              />
                              <button
                                onClick={() => handleReplyCoachingDoubt(doubt.id)}
                                className="flex items-center gap-1 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 transition shadow-xs"
                              >
                                <Send className="h-3.5 w-3.5" /> Reply & Resolve
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center h-64 dark:border-slate-800 dark:bg-slate-900">
                <GraduationCap className="mb-4 h-12 w-12 text-slate-300" />
                <p className="text-sm font-semibold text-slate-400">Select an exam intake from the left listing selector to configure chapters, mock tests, live classes, and announcements.</p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Bulk Excel Upload Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-3 shrink-0">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
                  Bulk Import Questions via Excel / CSV
                </h3>
                <p className="text-xs text-slate-400">
                  Target: <span className="font-bold text-teal-600">{bulkTarget === "mock" ? selectedMockTest?.name : selectedChapter?.name}</span>
                </p>
              </div>
              <button onClick={() => setBulkModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Template Download / Instructions */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/40 border border-indigo-100 dark:border-slate-700/50 flex items-center justify-between shrink-0">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300">Need the standard spreadsheet format?</p>
                <p className="text-[11px] text-slate-500">Includes columns: Question, Option A, Option B, Option C, Option D, Correct Answer, Explanation, Topic.</p>
              </div>
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-600 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50"
              >
                <Download className="h-4 w-4" /> Download Template
              </button>
            </div>

            {/* File Picker */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center space-y-2 bg-slate-50/30 dark:bg-slate-850/30 shrink-0">
              <Upload className="h-8 w-8 text-slate-400 mx-auto" />
              <div>
                <label className="cursor-pointer px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 inline-block shadow-xs">
                  Choose Excel (.xlsx) or CSV File
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {bulkFileName ? (
                <p className="text-xs font-bold text-teal-600 mt-1">Selected: {bulkFileName}</p>
              ) : (
                <p className="text-[11px] text-slate-400">Supports .xlsx, .xls, and .csv files</p>
              )}
            </div>

            {/* Parsed Preview Table */}
            {parsedQuestions.length > 0 && (
              <div className="flex-1 overflow-hidden flex flex-col space-y-2 min-h-[160px]">
                <div className="flex justify-between items-center shrink-0">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Parsed Questions Preview ({parsedQuestions.length} Found)
                  </span>
                  <span className="text-[10px] text-slate-400">Ready to save into database</span>
                </div>
                <div className="flex-1 overflow-y-auto border rounded-xl divide-y text-xs">
                  {parsedQuestions.map((q, idx) => (
                    <div key={q.id || idx} className="p-3 bg-white dark:bg-slate-800/50 space-y-1">
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200">Q{idx + 1}: {q.question}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 shrink-0 ml-2">
                          Key: {String.fromCharCode(65 + q.correctAnswer)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500">
                        <span>A: {q.options[0]}</span>
                        <span>B: {q.options[1]}</span>
                        <span>C: {q.options[2]}</span>
                        <span>D: {q.options[3]}</span>
                      </div>
                      {q.explanation && (
                        <p className="text-[10px] text-slate-400 italic">Exp: {q.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t shrink-0">
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                className="px-4 py-2 border rounded-xl text-xs font-bold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkImport}
                disabled={parsedQuestions.length === 0 || isImporting}
                className="px-5 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
              >
                {isImporting ? "Saving to Database..." : `Confirm & Import ${parsedQuestions.length} Questions`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default CoachingManager;
