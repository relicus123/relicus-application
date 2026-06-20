import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { useCoachingStore } from "../EntranceCoaching/store/coaching.store";
import { 
  Plus, Trash2, GraduationCap, Video, FileText, Check, AlertCircle, X, 
  Sparkles, Book, Calendar, MessageSquare, Star, ArrowRight, Layers, Megaphone
} from "lucide-react";

export function CoachingManager() {
  const store = useCoachingStore();
  const [exams, setExams] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection states
  const [selectedExam, setSelectedExam] = useState<any | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<any | null>(null);
  const [selectedMockTest, setSelectedMockTest] = useState<any | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<"exam" | "categories" | "add-exam">("exam");
  const [activeTab, setActiveTab] = useState<"info" | "syllabus" | "mocktests" | "live" | "announcements" | "feedbacks">("info");

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



  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await store.loadCoachingData();
      const st = useCoachingStore.getState();
      setExams(st.exams || []);
      setCategories(st.categories || []);
      setAnnouncements(st.announcements || []);
      setLiveClasses(st.liveClasses || []);
      setFeedbacks(st.feedbacks || []);
      
      // Auto select first exam if available
      if (st.exams && st.exams.length > 0 && !selectedExam) {
        setSelectedExam(st.exams[0]);
        fillExamForm(st.exams[0]);
      }
    } catch (err: any) {
      setError("Failed to load data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillExamForm = (ex: any) => {
    setExamForm({
      id: ex.id || "",
      fullName: ex.fullName || ex.full_name || "",
      tagline: ex.tagline || "",
      overview: ex.overview || "",
      nextExamDate: ex.nextExamDate || ex.next_exam_date || "2027-05-01",
      difficultyLevel: ex.difficultyLevel || ex.difficulty_level || 3,
      categoryId: ex.categoryId || ex.category_id || "undergraduate",
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

    try {
        const { error: catErr } = await supabase
          .from("coaching_exam_categories")
          .insert({
            id: categoryForm.id,
            title: categoryForm.title,
            description: categoryForm.description,
            icon: categoryForm.icon,
            sequence_number: categories.length + 1
          });
        if (catErr) throw catErr;
      setSuccess(`Category "${categoryForm.title}" added successfully.`);
      setCategoryForm({ id: "", title: "", description: "", icon: "🎓" });
      setIsAddingCategory(false);
      await loadAllData();
    } catch (err: any) {
      setError(err.message);
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

          // Also insert a global user notification in Database
          await supabase.from("coaching_notifications").insert({
            title: "New Exam Added",
            message: `The exam ${examForm.id} (${examForm.fullName}) is now open for preparation!`,
            category: "assignment",
            exam_id: examForm.id
          });

        setSuccess(`Exam ${examForm.id} registered.`);
        setViewMode("exam");
        await loadAllData();
        const fresh = useCoachingStore.getState().exams.find(ex => ex.id === examForm.id);
        if (fresh) setSelectedExam(fresh);
      } else {
        // Edit existing exam
        const updatedFields = {
          fullName: examForm.fullName,
          tagline: examForm.tagline,
          overview: examForm.overview,
          nextExamDate: examForm.nextExamDate,
          difficultyLevel: Number(examForm.difficultyLevel),
          categoryId: examForm.categoryId,
          eligibility: eligibilityArr,
          careerOpportunities: careersArr,
          syllabusTopics: syllabusArr
        };

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

        setSuccess(`Exam ${selectedExam.id} profile updated.`);
        await loadAllData();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!window.confirm(`Are you sure you want to delete the exam ${examId}?`)) return;

    try {
        const { error: delErr } = await supabase
          .from("coaching_exams")
          .delete()
          .eq("id", examId);
        if (delErr) throw delErr;
      setSuccess(`Exam ${examId} deleted.`);
      setSelectedExam(null);
      await loadAllData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ── Subject Operations ────────────────────────────────────────────────────
  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;

    const subId = subjectForm.id || `sub-${Math.random().toString(36).substr(2, 9)}`;
    const newSub = {
      id: subId,
      exam_id: selectedExam.id,
      name: subjectForm.name,
      icon: subjectForm.icon,
      color: subjectForm.color,
      chaptersCount: 0,
      mockTestsCount: 0
    };

    try {
        const { error: subErr } = await supabase
          .from("coaching_subjects")
          .insert({
            id: newSub.id,
            exam_id: newSub.exam_id,
            name: newSub.name,
            icon: newSub.icon,
            color: newSub.color
          });
        if (subErr) throw subErr;

      setSuccess("Subject created.");
      setIsAddingSubject(false);
      setSubjectForm({ id: "", name: "", icon: "📐", color: "bg-blue-500" });
      await loadAllData();
      const updatedExam = useCoachingStore.getState().exams.find(ex => ex.id === selectedExam.id);
      setSelectedExam(updatedExam);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ── Chapter & Content Operations ─────────────────────────────────────────
  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam || !selectedSubject) return;

    const chId = chapterForm.id || `ch-${Math.random().toString(36).substr(2, 9)}`;
    const newChapter = {
      id: chId,
      subject_id: selectedSubject.id,
      name: chapterForm.name,
      progress: 0,
      videos: [],
      notes: [],
      assignments: [],
      practiceQuestions: []
    };

    try {
        const { error: chErr } = await supabase
          .from("coaching_chapters")
          .insert({
            id: newChapter.id,
            subject_id: newChapter.subject_id,
            name: newChapter.name,
            progress: 0
          });
        if (chErr) throw chErr;
        
        // Update subject counts
        await supabase
          .from("coaching_subjects")
          .update({ chapters_count: (selectedSubject.chaptersCount || 0) + 1 })
          .eq("id", selectedSubject.id);

      setSuccess("Chapter added to subject.");
      setIsAddingChapter(false);
      setChapterForm({ id: "", name: "" });
      await loadAllData();
      const updatedExam = useCoachingStore.getState().exams.find(ex => ex.id === selectedExam.id);
      setSelectedExam(updatedExam);
      setSelectedSubject(updatedExam.subjects.find((s: any) => s.id === selectedSubject.id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam || !selectedChapter) return;

    const vidId = videoForm.id || `v-${Math.random().toString(36).substr(2, 9)}`;
    const newVid = {
      id: vidId,
      chapter_id: selectedChapter.id,
      title: videoForm.title,
      duration: videoForm.duration,
      url: videoForm.url || "https://www.w3schools.com/html/mov_bbb.mp4",
      is_watched: false
    };

    try {
        const { error: vErr } = await supabase
          .from("coaching_videos")
          .insert({
            id: newVid.id,
            chapter_id: newVid.chapter_id,
            title: newVid.title,
            duration: newVid.duration,
            url: newVid.url,
            is_watched: false
          });
        if (vErr) throw vErr;

      setSuccess("Video added to chapter.");
      setIsAddingVideo(false);
      setVideoForm({ id: "", title: "", duration: "15:00", url: "" });
      await loadAllData();
      const updatedExam = useCoachingStore.getState().exams.find(ex => ex.id === selectedExam.id);
      setSelectedExam(updatedExam);
      setSelectedChapter(updatedExam.chapters.find((ch: any) => ch.id === selectedChapter.id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam || !selectedChapter) return;

    const noteId = noteForm.id || `n-${Math.random().toString(36).substr(2, 9)}`;
    const newNote = {
      id: noteId,
      chapter_id: selectedChapter.id,
      title: noteForm.title,
      size: noteForm.size,
      pdf_url: noteForm.pdfUrl || "https://arxiv.org/pdf/quant-ph/0410100.pdf",
      is_bookmarked: false
    };

    try {
        const { error: nErr } = await supabase
          .from("coaching_notes")
          .insert({
            id: newNote.id,
            chapter_id: newNote.chapter_id,
            title: newNote.title,
            size: newNote.size,
            pdf_url: newNote.pdf_url,
            is_bookmarked: false
          });
        if (nErr) throw nErr;

      setSuccess("Revision notes added.");
      setIsAddingNote(false);
      setNoteForm({ id: "", title: "", size: "1.5 MB", pdfUrl: "" });
      await loadAllData();
      const updatedExam = useCoachingStore.getState().exams.find(ex => ex.id === selectedExam.id);
      setSelectedExam(updatedExam);
      setSelectedChapter(updatedExam.chapters.find((ch: any) => ch.id === selectedChapter.id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddPractice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam || !selectedChapter) return;

    const newPractice = {
      id: `prac-${Math.random().toString(36).substr(2, 9)}`,
      chapter_id: selectedChapter.id,
      question: practiceForm.question,
      options: [practiceForm.optionA, practiceForm.optionB, practiceForm.optionC, practiceForm.optionD],
      correct_answer: practiceForm.correctAnswer,
      explanation: practiceForm.explanation
    };

    try {
        const { error: prErr } = await supabase
          .from("coaching_practice_questions")
          .insert({
            chapter_id: newPractice.chapter_id,
            question: newPractice.question,
            options: newPractice.options,
            correct_answer: newPractice.correct_answer,
            explanation: newPractice.explanation
          });
        if (prErr) throw prErr;

      setSuccess("Practice question added.");
      setIsAddingPractice(false);
      setPracticeForm({ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: 0, explanation: "" });
      await loadAllData();
      const updatedExam = useCoachingStore.getState().exams.find(ex => ex.id === selectedExam.id);
      setSelectedExam(updatedExam);
      setSelectedChapter(updatedExam.chapters.find((ch: any) => ch.id === selectedChapter.id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ── Live Classes Operations ───────────────────────────────────────────────
  const handleScheduleLive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;

    const newLive = {
      id: `live-${Math.random().toString(36).substr(2, 9)}`,
      exam_id: selectedExam.id,
      subject_id: selectedExam.subjects?.[0]?.id || "math",
      topic: liveForm.topic,
      scheduled_time: new Date(liveForm.scheduledTime).toISOString(),
      duration: Number(liveForm.duration),
      url: liveForm.url || "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      status: liveForm.status
    };

    try {
        const { error: liveErr } = await supabase
          .from("coaching_live_classes")
          .insert({
            exam_id: newLive.exam_id,
            subject_id: newLive.subject_id,
            topic: newLive.topic,
            scheduled_time: newLive.scheduled_time,
            duration: newLive.duration,
            url: newLive.url,
            status: newLive.status
          });
        if (liveErr) throw liveErr;

        // DB User notification
        await supabase.from("coaching_notifications").insert({
          title: "Live Class Scheduled",
          message: `New class for ${selectedExam.id}: "${newLive.topic}"`,
          category: "live",
          exam_id: selectedExam.id
        });

      setSuccess("Live class scheduled successfully.");
      setLiveForm({ topic: "", scheduledTime: "", duration: 60, url: "", status: "scheduled" });
      await loadAllData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ── Announcements Operations ──────────────────────────────────────────────
  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;

    const newAnn = {
      id: `ann-${Math.random().toString(36).substr(2, 9)}`,
      exam_id: selectedExam.id,
      title: announcementForm.title,
      content: announcementForm.content,
      created_at: new Date().toISOString()
    };

    try {
        const { error: annErr } = await supabase
          .from("coaching_announcements")
          .insert({
            title: newAnn.title,
            content: newAnn.content,
            exam_id: newAnn.exam_id
          });
        if (annErr) throw annErr;

        // DB User notification
        await supabase.from("coaching_notifications").insert({
          title: "New Announcement",
          message: newAnn.title,
          category: "announcement",
          exam_id: selectedExam.id
        });

      setSuccess("Announcement published.");
      setAnnouncementForm({ title: "", content: "" });
      await loadAllData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ── Mock Tests Builder Operations ──────────────────────────────────────────
  const handleAddMockTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;

    const newMock = {
      id: mockForm.id || `mock-${Math.random().toString(36).substr(2, 9)}`,
      exam_id: selectedExam.id,
      name: mockForm.name,
      duration: Number(mockForm.duration),
      questionsCount: 0,
      questions: []
    };

    try {
        const { error: mockErr } = await supabase
          .from("coaching_mock_tests")
          .insert({
            id: newMock.id,
            exam_id: newMock.exam_id,
            name: newMock.name,
            duration: newMock.duration,
            questions_count: 0
          });
        if (mockErr) throw mockErr;

      setSuccess("Mock test created.");
      setIsAddingMock(false);
      setMockForm({ id: "", name: "", duration: 1800 });
      await loadAllData();
      const updatedExam = useCoachingStore.getState().exams.find(ex => ex.id === selectedExam.id);
      setSelectedExam(updatedExam);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam || !selectedMockTest) return;

    const newQuestion = {
      id: `q-${Math.random().toString(36).substr(2, 9)}`,
      mock_test_id: selectedMockTest.id,
      question: questionForm.question,
      options: [questionForm.optionA, questionForm.optionB, questionForm.optionC, questionForm.optionD],
      correctAnswer: questionForm.correctAnswer,
      explanation: questionForm.explanation,
      subject: selectedExam.subjects?.[0]?.name || "General",
      topic: questionForm.topic
    };

    try {
        const { error: qErr } = await supabase
          .from("coaching_mock_questions")
          .insert({
            mock_test_id: newQuestion.mock_test_id,
            question: newQuestion.question,
            options: newQuestion.options,
            correct_answer: newQuestion.correctAnswer,
            explanation: newQuestion.explanation,
            subject: newQuestion.subject,
            topic: newQuestion.topic
          });
        if (qErr) throw qErr;

      setSuccess("Question added to test.");
      setIsAddingQuestion(false);
      setQuestionForm({ question: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: 0, explanation: "", topic: "" });
      await loadAllData();
      const updatedExam = useCoachingStore.getState().exams.find(ex => ex.id === selectedExam.id);
      setSelectedExam(updatedExam);
      setSelectedMockTest(updatedExam.mockTests.find((t: any) => t.id === selectedMockTest.id));
    } catch (err: any) {
      setError(err.message);
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
              <h4 className="font-semibold text-sm mb-3">Add New Category</h4>
              <form onSubmit={handleSaveCategory} className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Unique Code ID</label>
                  <input
                    type="text" required placeholder="e.g. undergraduate, medical"
                    value={categoryForm.id}
                    onChange={e => setCategoryForm({ ...categoryForm, id: e.target.value })}
                    className="w-full rounded-xl border p-2 text-xs bg-white dark:bg-slate-800"
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
                <button type="submit" className="w-full py-2 bg-teal-600 text-white rounded-xl text-xs font-bold">
                  Create Category
                </button>
              </form>
            </div>

            <div className="md:col-span-2 space-y-3">
              <h4 className="font-semibold text-sm">Active Categories ({categories.length})</h4>
              <div className="grid gap-3">
                {categories.map((cat: any) => (
                  <div key={cat.id} className="flex justify-between items-center p-4 border rounded-2xl bg-white dark:bg-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{cat.icon || "🎓"}</span>
                      <div>
                        <span className="font-bold text-sm block">{cat.title}</span>
                        <span className="text-xs text-slate-400">{cat.description}</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full font-mono">{cat.id}</span>
                  </div>
                ))}
              </div>
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
                  {(["info", "syllabus", "mocktests", "live", "announcements", "feedbacks"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => { setActiveTab(tab); setSelectedSubject(null); setSelectedChapter(null); }}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
                        activeTab === tab
                          ? "border-teal-500 text-teal-600 dark:text-teal-400"
                          : "border-transparent text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {tab === "info" ? "Profile" : tab === "syllabus" ? "Syllabus & Chapters" : tab === "mocktests" ? "Mock Tests" : tab === "live" ? "Live Classes" : tab === "announcements" ? "Announcements" : "Reviews & Stars"}
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
                        <h4 className="font-extrabold text-xs uppercase text-slate-400">Subjects</h4>
                        <button onClick={() => setIsAddingSubject(true)} className="text-teal-600 hover:text-teal-700">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {isAddingSubject && (
                        <form onSubmit={handleAddSubject} className="p-3 border rounded-xl bg-slate-50/50 space-y-2 dark:bg-slate-800/40">
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
                            <button type="button" onClick={() => setIsAddingSubject(false)} className="px-2 py-1 text-[10px] border rounded">Cancel</button>
                            <button type="submit" className="px-2 py-1 text-[10px] bg-teal-600 text-white rounded">Save</button>
                          </div>
                        </form>
                      )}

                      <div className="space-y-1">
                        {(selectedExam.subjects || []).map((sub: any) => (
                          <button
                            key={sub.id}
                            onClick={() => { setSelectedSubject(sub); setSelectedChapter(null); }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                              selectedSubject?.id === sub.id ? "bg-slate-100 dark:bg-slate-800 text-teal-600" : ""
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span>{sub.icon || "📐"}</span>
                              <span>{sub.name}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">{(selectedExam.chapters || []).filter((ch: any) => ch.subjectId === sub.id).length} ch</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Chapters Column */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-xs uppercase text-slate-400">Chapters</h4>
                        {selectedSubject && (
                          <button onClick={() => setIsAddingChapter(true)} className="text-teal-600 hover:text-teal-700">
                            <Plus className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {isAddingChapter && (
                        <form onSubmit={handleAddChapter} className="p-3 border rounded-xl bg-slate-50/50 space-y-2 dark:bg-slate-800/40">
                          <input
                            type="text" required placeholder="Chapter Title"
                            value={chapterForm.name}
                            onChange={e => setChapterForm({ ...chapterForm, name: e.target.value })}
                            className="w-full rounded-lg border p-2 text-[11px] bg-white dark:bg-slate-900"
                          />
                          <div className="flex justify-end gap-1">
                            <button type="button" onClick={() => setIsAddingChapter(false)} className="px-2 py-1 text-[10px] border rounded">Cancel</button>
                            <button type="submit" className="px-2 py-1 text-[10px] bg-teal-600 text-white rounded">Save</button>
                          </div>
                        </form>
                      )}

                      {selectedSubject ? (
                        <div className="space-y-1">
                          {(selectedExam.chapters || []).filter((ch: any) => ch.subjectId === selectedSubject.id).map((ch: any) => (
                            <button
                              key={ch.id}
                              onClick={() => setSelectedChapter(ch)}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                                selectedChapter?.id === ch.id ? "bg-slate-100 dark:bg-slate-800 text-indigo-500" : ""
                              }`}
                            >
                              <span>{ch.name}</span>
                              <span className="text-[9px] text-slate-400 font-mono">{(ch.videos || []).length} v | {(ch.notes || []).length} n</span>
                            </button>
                          ))}
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
                              <button onClick={() => setIsAddingVideo(true)} className="text-[10px] font-bold text-teal-600 hover:underline">Add Video</button>
                            </div>

                            {isAddingVideo && (
                              <form onSubmit={handleAddVideo} className="p-3 border rounded-xl bg-slate-50/50 space-y-2 dark:bg-slate-800/40">
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
                                  <button type="button" onClick={() => setIsAddingVideo(false)} className="px-2 py-0.5 text-[9px] border rounded">Cancel</button>
                                  <button type="submit" className="px-2 py-0.5 text-[9px] bg-teal-600 text-white rounded">Add</button>
                                </div>
                              </form>
                            )}

                            <div className="space-y-1">
                              {(selectedChapter.videos || []).map((v: any) => (
                                <div key={v.id} className="text-[11px] flex justify-between items-center py-1 border-b last:border-0">
                                  <span className="truncate pr-2">{v.title}</span>
                                  <span className="text-slate-400 font-mono shrink-0">{v.duration}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Notes Section */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center border-b pb-1">
                              <span className="text-xs font-bold text-slate-500 flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Revision Notes</span>
                              <button onClick={() => setIsAddingNote(true)} className="text-[10px] font-bold text-teal-600 hover:underline">Add Note</button>
                            </div>

                            {isAddingNote && (
                              <form onSubmit={handleAddNote} className="p-3 border rounded-xl bg-slate-50/50 space-y-2 dark:bg-slate-800/40">
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
                                  <button type="button" onClick={() => setIsAddingNote(false)} className="px-2 py-0.5 text-[9px] border rounded">Cancel</button>
                                  <button type="submit" className="px-2 py-0.5 text-[9px] bg-teal-600 text-white rounded">Add</button>
                                </div>
                              </form>
                            )}

                            <div className="space-y-1">
                              {(selectedChapter.notes || []).map((n: any) => (
                                <div key={n.id} className="text-[11px] flex justify-between items-center py-1 border-b last:border-0">
                                  <span className="truncate pr-2">{n.title}</span>
                                  <span className="text-slate-400 font-mono shrink-0">{n.size}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Practice Questions Section */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center border-b pb-1">
                              <span className="text-xs font-bold text-slate-500 flex items-center gap-1"><Book className="h-3.5 w-3.5" /> PYQ & Practice</span>
                              <button onClick={() => setIsAddingPractice(true)} className="text-[10px] font-bold text-teal-600 hover:underline">Add Q</button>
                            </div>

                            {isAddingPractice && (
                              <form onSubmit={handleAddPractice} className="p-3 border rounded-xl bg-slate-50/50 space-y-2 dark:bg-slate-800/40">
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
                                  <button type="button" onClick={() => setIsAddingPractice(false)} className="px-2 py-0.5 text-[9px] border rounded">Cancel</button>
                                  <button type="submit" className="px-2 py-0.5 text-[9px] bg-teal-600 text-white rounded">Add</button>
                                </div>
                              </form>
                            )}

                            <div className="space-y-1">
                              {(selectedChapter.practiceQuestions || []).map((q: any, i: number) => (
                                <div key={i} className="text-[11px] truncate py-1 border-b last:border-0 text-slate-500">
                                  Q{i+1}: {q.question}
                                </div>
                              ))}
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
                        <h4 className="font-extrabold text-xs uppercase text-slate-400">Test Sets</h4>
                        <button onClick={() => setIsAddingMock(true)} className="text-teal-600 hover:text-teal-700">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {isAddingMock && (
                        <form onSubmit={handleAddMockTest} className="p-3 border rounded-xl bg-slate-50/50 space-y-2 dark:bg-slate-800/40">
                          <input
                            type="text" required placeholder="Test Name"
                            value={mockForm.name}
                            onChange={e => setMockForm({ ...mockForm, name: e.target.value })}
                            className="w-full rounded-lg border p-2 text-[11px] bg-white dark:bg-slate-900"
                          />
                          <input
                            type="number" required placeholder="Duration in seconds"
                            value={mockForm.duration}
                            onChange={e => setMockForm({ ...mockForm, duration: Number(e.target.value) })}
                            className="w-full rounded-lg border p-2 text-[11px] bg-white dark:bg-slate-900"
                          />
                          <div className="flex justify-end gap-1">
                            <button type="button" onClick={() => setIsAddingMock(false)} className="px-2 py-1 text-[10px] border rounded">Cancel</button>
                            <button type="submit" className="px-2 py-1 text-[10px] bg-teal-600 text-white rounded">Save</button>
                          </div>
                        </form>
                      )}

                      <div className="space-y-1">
                        {(selectedExam.mockTests || []).map((t: any) => (
                          <button
                            key={t.id}
                            onClick={() => setSelectedMockTest(t)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between ${
                              selectedMockTest?.id === t.id ? "bg-slate-100 dark:bg-slate-800 text-indigo-500" : ""
                            }`}
                          >
                            <span>{t.name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">{(t.questions || t.questionsCount || 0)} Qs</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Questions Builder */}
                    <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
                      {selectedMockTest ? (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">Questions in: {selectedMockTest.name}</h4>
                            <button onClick={() => setIsAddingQuestion(true)} className="flex items-center gap-1 text-xs font-bold text-teal-600">
                              <Plus className="h-4 w-4" /> Add Question
                            </button>
                          </div>

                          {isAddingQuestion && (
                            <form onSubmit={handleAddQuestion} className="p-4 border rounded-2xl bg-slate-50/50 space-y-3 dark:bg-slate-800/40">
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
                                <button type="button" onClick={() => setIsAddingQuestion(false)} className="px-3 py-1 text-xs border rounded-lg">Cancel</button>
                                <button type="submit" className="px-3 py-1 bg-teal-600 text-white rounded-lg text-xs font-bold">Save</button>
                              </div>
                            </form>
                          )}

                          <div className="space-y-4 max-h-96 overflow-y-auto">
                            {(selectedMockTest.questions || []).map((q: any, idx: number) => (
                              <div key={idx} className="p-4 border rounded-2xl space-y-2 bg-white dark:bg-slate-800">
                                <span className="text-[10px] uppercase font-bold text-teal-600">Question {idx+1}</span>
                                <p className="text-xs font-bold">{q.question}</p>
                                <div className="grid gap-1 md:grid-cols-2 text-[10px] text-slate-400">
                                  {q.options?.map((opt: string, optIdx: number) => (
                                    <span key={optIdx} className={optIdx === q.correctAnswer || optIdx === q.correct_answer ? "text-emerald-500 font-bold" : ""}>
                                      {String.fromCharCode(65 + optIdx)}. {opt}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
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
                      <h4 className="font-extrabold text-sm flex items-center gap-1.5"><Video className="h-4 w-4 text-red-500" /> Schedule Live Session</h4>
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
                      <button type="submit" className="w-full py-2 bg-red-500 text-white rounded-xl text-xs font-bold">
                        Publish Live Stream Schedule
                      </button>
                    </form>

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3">
                      <h4 className="font-extrabold text-sm">Active Scheduled Classes</h4>
                      <div className="space-y-2">
                        {liveClasses.filter((l: any) => l.exam_id === selectedExam.id).map((l: any) => (
                          <div key={l.id} className="p-3 border rounded-xl flex items-center justify-between text-xs bg-slate-50/30 dark:bg-slate-800/40">
                            <div>
                              <span className="font-bold block">{l.topic}</span>
                              <span className="text-slate-400 font-mono text-[10px]">
                                {new Date(l.scheduled_time || l.scheduledTime).toLocaleString()} ({l.duration} mins)
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              l.status === "ongoing" ? "bg-red-100 text-red-700 animate-pulse" : "bg-blue-150 text-blue-700"
                            }`}>{l.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: Announcements publishing */}
                {activeTab === "announcements" && (
                  <div className="grid gap-6 md:grid-cols-2">
                    <form onSubmit={handlePublishAnnouncement} className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
                      <h4 className="font-extrabold text-sm flex items-center gap-1.5"><Megaphone className="h-4 w-4 text-indigo-500" /> Post New Announcement</h4>
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
                      <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700">
                        Publish Announcement
                      </button>
                    </form>

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3">
                      <h4 className="font-extrabold text-sm">Published Announcements</h4>
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                        {announcements.filter((a: any) => a.exam_id === selectedExam.id).map((a: any) => (
                          <div key={a.id} className="p-4 border rounded-2xl bg-slate-50/20 dark:bg-slate-800/20 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 font-mono">{new Date(a.created_at || a.createdAt).toLocaleDateString()}</span>
                            <span className="font-bold block text-xs">{a.title}</span>
                            <p className="text-[11px] text-slate-500 leading-relaxed">{a.content}</p>
                          </div>
                        ))}
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
                              <span className="font-bold text-slate-600 dark:text-slate-300">{f.user_email}</span>
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`h-3 w-3 ${i < f.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-500 italic">"{f.review_text || "No review text provided."}"</p>
                            <span className="block text-[9px] text-slate-400 font-mono text-right">{new Date(f.created_at).toLocaleDateString()}</span>
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
    </div>
  );
}
export default CoachingManager;
