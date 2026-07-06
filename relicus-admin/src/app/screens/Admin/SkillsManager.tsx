import React, { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { Plus, Edit2, Trash2, BookOpen, Video, Check, AlertCircle, X, FileText, Brain, MessageCircle, Send } from "lucide-react";
import { ImageUpload } from "../../components/ImageUpload";

// Sandbox courses removed as per production directive

export function SkillsManager() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"courses" | "doubts" | "certificates">("courses");
  const [doubts, setDoubts] = useState<any[]>([]);
  const [loadingDoubts, setLoadingDoubts] = useState(false);
  const [certRequests, setCertRequests] = useState<any[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(false);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  // Form states
  const [courseForm, setCourseForm] = useState({
    id: "",
    title: "",
    category: "Cognitive Psychology",
    instructor: "",
    instructorTitle: "",
    instructorBio: "",
    instructorAvatar: "👩‍⚕️",
    duration: "4 weeks",
    level: "Intermediate",
    description: "",
    objectivesString: "",
    skillsString: "",
    thumbnail: "🧠",
  });
  
  const [moduleForm, setModuleForm] = useState({
    id: "",
    title: "",
    description: "",
  });

  const [lessonForm, setLessonForm] = useState({
    id: "",
    title: "",
    videoUrl: "",
    duration: "15 mins",
    thumbnail: "",
  });

  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [isEditingModule, setIsEditingModule] = useState<string | null>(null);
  const [isAddingLesson, setIsAddingLesson] = useState<string | null>(null); // moduleId
  const [isEditingLesson, setIsEditingLesson] = useState<string | null>(null);
  
  const [assignmentForm, setAssignmentForm] = useState({
    id: "",
    title: "",
    instructions: "",
    downloadUrl: "",
  });

  const [quizForm, setQuizForm] = useState({
    id: "",
    title: "",
    type: "module",
  });

  const [questionForm, setQuestionForm] = useState({
    question: "",
    optionsString: "",
    correctAnswerIndex: 0,
    explanation: "",
  });

  const [isAddingAssignment, setIsAddingAssignment] = useState<string | null>(null); // moduleId
  const [isEditingAssignment, setIsEditingAssignment] = useState<string | null>(null);
  const [isAddingQuiz, setIsAddingQuiz] = useState<string | null>(null); // moduleId
  const [isEditingQuiz, setIsEditingQuiz] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  useEffect(() => {
    loadCourses();
    loadDoubts();
    loadCertRequests();
  }, []);

  const loadDoubts = async () => {
    setLoadingDoubts(true);
    try {
      const { data, error: fetchErr } = await supabase
        .from("skills_doubts")
        .select(`*, responses:skills_doubt_responses(*)`)
        .order("created_at", { ascending: false });
      if (fetchErr) throw fetchErr;
      setDoubts(data || []);
    } catch (err: any) {
      console.error("Failed to fetch doubts", err);
    } finally {
      setLoadingDoubts(false);
    }
  };

  const handleReplyDoubt = async (doubtId: string) => {
    const text = replyText[doubtId];
    if (!text?.trim()) return;

    try {
      const { error: replyErr } = await supabase.from("skills_doubt_responses").insert({
        doubt_id: doubtId,
        author: "Admin/Instructor",
        message: text.trim()
      });
      if (replyErr) throw replyErr;

      const { error: updErr } = await supabase.from("skills_doubts").update({ status: "Resolved" }).eq("id", doubtId);
      if (updErr) throw updErr;

      setReplyText(prev => ({ ...prev, [doubtId]: "" }));
      await loadDoubts();
      setSuccess("Reply sent and doubt marked resolved.");
    } catch (err: any) {
      setError("Failed to reply: " + err.message);
    }
  };

  const loadCertRequests = async () => {
    setLoadingCerts(true);
    try {
      const { data, error } = await supabase
        .from("skills_certificate_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setCertRequests(data || []);
    } catch (err: any) {
      console.error("Failed to fetch cert requests", err);
    } finally {
      setLoadingCerts(false);
    }
  };

  const handleApproveCertRequest = async (reqId: string) => {
    try {
      const { error } = await supabase
        .from("skills_certificate_requests")
        .update({ status: "Approved" })
        .eq("id", reqId);
      if (error) throw error;
      await loadCertRequests();
      setSuccess("Certificate Approved!");
    } catch (err: any) {
      setError("Failed to approve: " + err.message);
    }
  };

  const loadCourses = async () => {
    setLoading(true);
    try {

        // Fetch from Supabase
        const { data, error: fetchErr } = await supabase
          .from("skills_courses")
          .select(`
            *,
            modules:skills_modules(
              *,
              lessons:skills_lessons(*),
              materials:skills_materials(*),
              assignments:skills_assignments(*),
              quizzes:skills_quizzes(*, questions:skills_questions(*))
            )
          `);
        if (fetchErr) throw fetchErr;
        setCourses(data || []);
    } catch (err: any) {
      setError("Failed to fetch courses: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const objectives = courseForm.objectivesString.split(",").map(s => s.trim()).filter(Boolean);
    const skillsLearned = courseForm.skillsString.split(",").map(s => s.trim()).filter(Boolean);

    const newCourse = {
      id: courseForm.id || `course-${Math.random().toString(36).substr(2, 9)}`,
      title: courseForm.title,
      category: courseForm.category,
      instructor: courseForm.instructor,
      instructor_title: courseForm.instructorTitle,
      instructor_bio: courseForm.instructorBio,
      instructor_avatar: courseForm.instructorAvatar,
      duration: courseForm.duration,
      level: courseForm.level,
      description: courseForm.description,
      objectives,
      skills_learned: skillsLearned,
      thumbnail: courseForm.thumbnail,
      modules: selectedCourse?.modules || []
    };

    try {

        // Save to Supabase
        const dbPayload = {
          id: newCourse.id,
          title: newCourse.title,
          category: newCourse.category,
          instructor: newCourse.instructor,
          instructor_title: newCourse.instructor_title,
          instructor_bio: newCourse.instructor_bio,
          instructor_avatar: newCourse.instructor_avatar,
          duration: newCourse.duration,
          level: newCourse.level,
          description: newCourse.description,
          objectives: newCourse.objectives,
          skills_learned: newCourse.skills_learned,
          thumbnail: newCourse.thumbnail,
        };

        const { error: saveErr } = await supabase
          .from("skills_courses")
          .upsert(dbPayload);

        if (saveErr) throw saveErr;
        await loadCourses();

      setSuccess("Course saved successfully!");
      setIsEditingCourse(false);
      resetCourseForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    setError(null);

    try {

        const { error: delErr } = await supabase
          .from("skills_courses")
          .delete()
          .eq("id", id);
        if (delErr) throw delErr;
        await loadCourses();
        if (selectedCourse?.id === id) setSelectedCourse(null);
      setSuccess("Course deleted.");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    const newModule = {
      id: moduleForm.id || `mod-${Math.random().toString(36).substr(2, 9)}`,
      course_id: selectedCourse.id,
      title: moduleForm.title,
      description: moduleForm.description,
      lessons: [],
      materials: []
    };

    try {

        const { error: modErr } = await supabase
          .from("skills_modules")
          .insert({
            id: newModule.id,
            course_id: newModule.course_id,
            title: newModule.title,
            description: newModule.description
          });
        if (modErr) throw modErr;
        await loadCourses();
        // Refresh selected course
        const latest = courses.find(c => c.id === selectedCourse.id);
        if (latest) setSelectedCourse(latest);

      setSuccess("Module added.");
      setIsAddingModule(false);
      setModuleForm({ id: "", title: "", description: "" });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddLesson = async (e: React.FormEvent, moduleId: string) => {
    e.preventDefault();
    if (!selectedCourse) return;

    const newLesson = {
      id: lessonForm.id || `les-${Math.random().toString(36).substr(2, 9)}`,
      module_id: moduleId,
      title: lessonForm.title,
      video_url: lessonForm.videoUrl,
      duration: lessonForm.duration,
      thumbnail: lessonForm.thumbnail
    };

    try {

        const { error: lesErr } = await supabase
          .from("skills_lessons")
          .insert({
            id: newLesson.id,
            module_id: newLesson.module_id,
            title: newLesson.title,
            video_url: newLesson.video_url,
            duration: newLesson.duration,
            thumbnail: newLesson.thumbnail
          });
        if (lesErr) throw lesErr;
        await loadCourses();
        // Refresh selected course
        const latest = courses.find(c => c.id === selectedCourse.id);
        if (latest) setSelectedCourse(latest);

      setSuccess("Lesson added.");
      setIsAddingLesson(null);
      setLessonForm({ id: "", title: "", videoUrl: "", duration: "15 mins", thumbnail: "" });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddAssignment = async (e: React.FormEvent, moduleId: string) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      const newId = assignmentForm.id || `ass-${Math.random().toString(36).substr(2, 9)}`;
      const { error: err } = await supabase
        .from("skills_assignments")
        .insert({
          id: newId,
          module_id: moduleId,
          title: assignmentForm.title,
          instructions: assignmentForm.instructions,
          download_url: assignmentForm.downloadUrl || null,
        });
      if (err) throw err;
      await loadCourses();
      const latest = courses.find(c => c.id === selectedCourse.id);
      if (latest) setSelectedCourse(latest);

      setSuccess("Assignment added.");
      setIsAddingAssignment(null);
      setAssignmentForm({ id: "", title: "", instructions: "", downloadUrl: "" });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddQuiz = async (e: React.FormEvent, moduleId: string) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      const quizId = quizForm.id || `quiz-${Math.random().toString(36).substr(2, 9)}`;
      
      // 1. Insert Quiz
      const { error: quizErr } = await supabase
        .from("skills_quizzes")
        .insert({
          id: quizId,
          module_id: moduleId,
          title: quizForm.title,
          type: quizForm.type,
        });
      if (quizErr) throw quizErr;

      // 2. Insert Questions
      if (quizQuestions.length > 0) {
        const questionsPayload = quizQuestions.map((q, idx) => ({
          id: `q-${Math.random().toString(36).substr(2, 9)}`,
          quiz_id: quizId,
          question: q.question,
          options: q.options,
          correct_answer_index: q.correctAnswerIndex,
          explanation: q.explanation || null,
        }));
        const { error: qErr } = await supabase
          .from("skills_questions")
          .insert(questionsPayload);
        if (qErr) throw qErr;
      }

      await loadCourses();
      const latest = courses.find(c => c.id === selectedCourse.id);
      if (latest) setSelectedCourse(latest);

      setSuccess("Quiz added.");
      setIsAddingQuiz(null);
      setQuizForm({ id: "", title: "", type: "module" });
      setQuizQuestions([]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !isEditingModule) return;

    try {
      const { error: modErr } = await supabase
        .from("skills_modules")
        .update({
          title: moduleForm.title,
          description: moduleForm.description
        })
        .eq("id", isEditingModule);
      if (modErr) throw modErr;
      await loadCourses();
      const latest = courses.find(c => c.id === selectedCourse.id);
      if (latest) setSelectedCourse(latest);

      setSuccess("Module updated.");
      setIsEditingModule(null);
      setModuleForm({ id: "", title: "", description: "" });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this module?")) return;
    try {
      const { error: modErr } = await supabase
        .from("skills_modules")
        .delete()
        .eq("id", id);
      if (modErr) throw modErr;
      await loadCourses();
      const latest = courses.find(c => c.id === selectedCourse.id);
      if (latest) setSelectedCourse(latest);

      setSuccess("Module deleted.");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !isEditingLesson) return;

    try {
      const { error: lesErr } = await supabase
        .from("skills_lessons")
        .update({
          title: lessonForm.title,
          video_url: lessonForm.videoUrl,
          duration: lessonForm.duration,
          thumbnail: lessonForm.thumbnail
        })
        .eq("id", isEditingLesson);
      if (lesErr) throw lesErr;
      await loadCourses();
      const latest = courses.find(c => c.id === selectedCourse.id);
      if (latest) setSelectedCourse(latest);

      setSuccess("Lesson updated.");
      setIsEditingLesson(null);
      setLessonForm({ id: "", title: "", videoUrl: "", duration: "15 mins", thumbnail: "" });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    try {
      const { error: lesErr } = await supabase
        .from("skills_lessons")
        .delete()
        .eq("id", id);
      if (lesErr) throw lesErr;
      await loadCourses();
      const latest = courses.find(c => c.id === selectedCourse.id);
      if (latest) setSelectedCourse(latest);

      setSuccess("Lesson deleted.");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !isEditingAssignment) return;

    try {
      const { error: err } = await supabase
        .from("skills_assignments")
        .update({
          title: assignmentForm.title,
          instructions: assignmentForm.instructions,
          download_url: assignmentForm.downloadUrl || null,
        })
        .eq("id", isEditingAssignment);
      if (err) throw err;
      await loadCourses();
      const latest = courses.find(c => c.id === selectedCourse.id);
      if (latest) setSelectedCourse(latest);

      setSuccess("Assignment updated.");
      setIsEditingAssignment(null);
      setAssignmentForm({ id: "", title: "", instructions: "", downloadUrl: "" });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    try {
      const { error: err } = await supabase
        .from("skills_assignments")
        .delete()
        .eq("id", id);
      if (err) throw err;
      await loadCourses();
      const latest = courses.find(c => c.id === selectedCourse.id);
      if (latest) setSelectedCourse(latest);

      setSuccess("Assignment deleted.");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !isEditingQuiz) return;

    try {
      const { error: quizErr } = await supabase
        .from("skills_quizzes")
        .update({
          title: quizForm.title,
          type: quizForm.type,
        })
        .eq("id", isEditingQuiz);
      if (quizErr) throw quizErr;

      await loadCourses();
      const latest = courses.find(c => c.id === selectedCourse.id);
      if (latest) setSelectedCourse(latest);

      setSuccess("Quiz updated.");
      setIsEditingQuiz(null);
      setQuizForm({ id: "", title: "", type: "module" });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await supabase.from("skills_questions").delete().eq("quiz_id", id);
      const { error: err } = await supabase
        .from("skills_quizzes")
        .delete()
        .eq("id", id);
      if (err) throw err;
      await loadCourses();
      const latest = courses.find(c => c.id === selectedCourse.id);
      if (latest) setSelectedCourse(latest);

      setSuccess("Quiz deleted.");
    } catch (err: any) {
      setError(err.message);
    }
  };


  const resetCourseForm = () => {
    setCourseForm({
      id: "",
      title: "",
      category: "Cognitive Psychology",
      instructor: "",
      instructorTitle: "",
      instructorBio: "",
      instructorAvatar: "👩‍⚕️",
      duration: "4 weeks",
      level: "Intermediate",
      description: "",
      objectivesString: "",
      skillsString: "",
      thumbnail: "🧠",
    });
  };

  const startEditCourse = (course: any) => {
    setSelectedCourse(course);
    setCourseForm({
      id: course.id,
      title: course.title,
      category: course.category,
      instructor: course.instructor,
      instructorTitle: course.instructor_title || course.instructorTitle || "",
      instructorBio: course.instructor_bio || course.instructorBio || "",
      instructorAvatar: course.instructor_avatar || course.instructorAvatar || "👩‍⚕️",
      duration: course.duration,
      level: course.level,
      description: course.description,
      objectivesString: (course.objectives || []).join(", "),
      skillsString: (course.skills_learned || course.skillsLearned || []).join(", "),
      thumbnail: course.thumbnail || "🧠",
    });
    setIsEditingCourse(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-500" /> Skills Academy Manager
          </h2>
          <p className="text-sm text-slate-500">Add, edit, or delete professional courses, lessons, and modules.</p>
        </div>
        <div className="flex items-center gap-3">

          <button
            onClick={() => {
              setSelectedCourse(null);
              resetCourseForm();
              setIsEditingCourse(true);
            }}
            className="flex items-center gap-1.5 rounded-2xl bg-[#1C4966] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 transition"
          >
            <Plus className="h-4 w-4" /> Add New Course
          </button>
        </div>
      </div>

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

      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 gap-4">
        <button
          onClick={() => setActiveTab("courses")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${activeTab === "courses" ? "border-indigo-500 text-indigo-500" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          Courses
        </button>
        <button
          onClick={() => setActiveTab("doubts")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${activeTab === "doubts" ? "border-indigo-500 text-indigo-500" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          Doubt Desk
        </button>
        <button
          onClick={() => setActiveTab("certificates")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${activeTab === "certificates" ? "border-indigo-500 text-indigo-500" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          Certificate Requests
        </button>
      </div>

      {activeTab === "courses" ? (
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Panel: Course Listing */}
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Course Catalog</h3>
          {loading ? (
            <p className="text-sm text-slate-400">Loading catalog...</p>
          ) : courses.length === 0 ? (
            <p className="text-sm text-slate-400">No courses found. Add one to get started!</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => {
                    setSelectedCourse(course);
                    setIsEditingCourse(false);
                  }}
                  className={`flex items-center justify-between py-3 cursor-pointer group transition ${
                    selectedCourse?.id === course.id ? "bg-slate-50/80 px-2 rounded-xl dark:bg-slate-800/50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
                      <Brain className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#1C4966] transition">
                        {course.title}
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        {course.category} • {course.level}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditCourse(course);
                      }}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCourse(course.id);
                      }}
                      className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Middle/Right Panel: Detail & Add/Edit Forms */}
        <div className="lg:col-span-2 space-y-6">
          {isEditingCourse ? (
            <form onSubmit={handleSaveCourse} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {selectedCourse ? "Edit Course Parameters" : "Create New Course"}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Course ID</label>
                  <input
                    type="text"
                    disabled={!!selectedCourse}
                    value={courseForm.id}
                    onChange={(e) => setCourseForm({ ...courseForm, id: e.target.value })}
                    placeholder="e.g. psych-cbt"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm dark:border-slate-800 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    placeholder="e.g. CBT Fundamentals"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm dark:border-slate-800 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
                  <input
                    type="text"
                    list="category-options"
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    placeholder="e.g. Cognitive Psychology"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm dark:border-slate-800 dark:bg-slate-800"
                  />
                  <datalist id="category-options">
                    <option value="Cognitive Psychology" />
                    <option value="Clinical Psychology" />
                    <option value="Behavioral Psychology" />
                    <option value="Developmental Psychology" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Level</label>
                  <select
                    value={courseForm.level}
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm dark:border-slate-800 dark:bg-slate-800"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Instructor Name</label>
                  <input
                    type="text"
                    required
                    value={courseForm.instructor}
                    onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                    placeholder="e.g. Dr. Sarah Jenkins"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm dark:border-slate-800 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Instructor Title</label>
                  <input
                    type="text"
                    value={courseForm.instructorTitle}
                    onChange={(e) => setCourseForm({ ...courseForm, instructorTitle: e.target.value })}
                    placeholder="e.g. Clinical Psychologist"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm dark:border-slate-800 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Objectives (comma separated)</label>
                  <input
                    type="text"
                    value={courseForm.objectivesString}
                    onChange={(e) => setCourseForm({ ...courseForm, objectivesString: e.target.value })}
                    placeholder="Objective 1, Objective 2, Objective 3"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm dark:border-slate-800 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Skills Gained (comma separated)</label>
                  <input
                    type="text"
                    value={courseForm.skillsString}
                    onChange={(e) => setCourseForm({ ...courseForm, skillsString: e.target.value })}
                    placeholder="CBT, Mindfulness, Active Listening"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm dark:border-slate-800 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <ImageUpload 
                    label="Course Thumbnail"
                    value={courseForm.thumbnail === "🧠" ? "" : courseForm.thumbnail}
                    onChange={(url) => setCourseForm({ ...courseForm, thumbnail: url })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Course Description</label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Enter full course description details..."
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm dark:border-slate-800 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingCourse(false)}
                  className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 dark:border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-[#1C4966] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95"
                >
                  Save Course
                </button>
              </div>
            </form>
          ) : selectedCourse ? (
            <div className="space-y-6">
              {/* Course details header */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10">
                      <Brain className="h-8 w-8 text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">{selectedCourse.title}</h3>
                      <p className="text-sm text-slate-500">{selectedCourse.category} • {selectedCourse.level} • {selectedCourse.duration}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => startEditCourse(selectedCourse)}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                  >
                    Edit Info
                  </button>
                </div>
              </div>

              {/* Modules list & CRUD */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-800 dark:text-white">Curriculum Modules</h4>
                  <button
                    onClick={() => setIsAddingModule(true)}
                    className="flex items-center gap-1 text-xs font-bold text-[#1C4966] hover:opacity-85 dark:text-[#8FBDD7]"
                  >
                    <Plus className="h-4 w-4" /> Add Module
                  </button>
                </div>

                {isAddingModule && (
                  <form onSubmit={handleAddModule} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-800/40">
                    <h5 className="text-sm font-bold text-slate-700 dark:text-slate-200">New Module Parameters</h5>
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        type="text"
                        placeholder="Module ID (Optional, auto-generated)"
                        value={moduleForm.id}
                        onChange={(e) => setModuleForm({ ...moduleForm, id: e.target.value })}
                        className="rounded-xl border border-slate-200 p-2 text-xs bg-white dark:border-slate-800 dark:bg-slate-900"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Module Title"
                        value={moduleForm.title}
                        onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                        className="rounded-xl border border-slate-200 p-2 text-xs bg-white dark:border-slate-800 dark:bg-slate-900"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Module short description"
                      value={moduleForm.description}
                      onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-2 text-xs bg-white dark:border-slate-800 dark:bg-slate-900"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingModule(false)}
                        className="rounded-lg border px-3 py-1.5 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-lg bg-[#1C4966] text-white px-3 py-1.5 text-xs font-semibold"
                      >
                        Save Module
                      </button>
                    </div>
                  </form>
                )}

                {(!selectedCourse.modules || selectedCourse.modules.length === 0) ? (
                  <p className="text-sm text-slate-400">No modules added yet.</p>
                ) : (
                  <div className="space-y-4">
                    {selectedCourse.modules.map((mod: any) => (
                      <div key={mod.id} className="rounded-2xl border border-slate-100 p-4 space-y-3 dark:border-slate-800">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="text-sm font-bold text-slate-700 dark:text-slate-200">{mod.title}</h5>
                            <p className="text-xs text-slate-400">{mod.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setModuleForm({ id: mod.id, title: mod.title, description: mod.description });
                                setIsEditingModule(mod.id);
                                setIsAddingModule(false);
                              }}
                              className="p-1 text-slate-400 hover:text-indigo-500"
                              title="Edit Module"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteModule(mod.id)}
                              className="p-1 text-slate-400 hover:text-rose-500"
                              title="Delete Module"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setLessonForm({ id: "", title: "", videoUrl: "", duration: "15 mins", thumbnail: "" });
                                setIsAddingLesson(mod.id);
                                setIsEditingLesson(null);
                                setIsAddingAssignment(null);
                                setIsAddingQuiz(null);
                              }}
                              className="flex items-center gap-1 text-[11px] font-bold text-indigo-500 hover:opacity-80 ml-2"
                            >
                              <Plus className="h-3.5 w-3.5" /> Add Lesson
                            </button>
                            <button
                              onClick={() => {
                                setAssignmentForm({ id: "", title: "", instructions: "", downloadUrl: "" });
                                setIsAddingAssignment(mod.id);
                                setIsEditingAssignment(null);
                                setIsAddingLesson(null);
                                setIsAddingQuiz(null);
                              }}
                              className="flex items-center gap-1 text-[11px] font-bold text-amber-500 hover:opacity-80 ml-2"
                            >
                              <Plus className="h-3.5 w-3.5" /> Add Assignment
                            </button>
                            <button
                              onClick={() => {
                                setQuizForm({ id: "", title: "", type: "module" });
                                setQuizQuestions([]);
                                setIsAddingQuiz(mod.id);
                                setIsEditingQuiz(null);
                                setIsAddingLesson(null);
                                setIsAddingAssignment(null);
                              }}
                              className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 hover:opacity-80 ml-2"
                            >
                              <Plus className="h-3.5 w-3.5" /> Add Quiz
                            </button>
                          </div>
                        </div>

                        {/* Edit Module form */}
                        {isEditingModule === mod.id && (
                          <form onSubmit={handleUpdateModule} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-800/40 mt-2">
                            <h5 className="text-sm font-bold text-slate-700 dark:text-slate-200">Edit Module</h5>
                            <input
                              type="text"
                              required
                              placeholder="Module Title"
                              value={moduleForm.title}
                              onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                              className="w-full rounded-xl border border-slate-200 p-2 text-xs bg-white dark:border-slate-800 dark:bg-slate-900"
                            />
                            <input
                              type="text"
                              placeholder="Module short description"
                              value={moduleForm.description}
                              onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                              className="w-full rounded-xl border border-slate-200 p-2 text-xs bg-white dark:border-slate-800 dark:bg-slate-900"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setIsEditingModule(null)}
                                className="rounded-lg border px-3 py-1.5 text-xs"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="rounded-lg bg-[#1C4966] text-white px-3 py-1.5 text-xs font-semibold"
                              >
                                Save Changes
                              </button>
                            </div>
                          </form>
                        )}

                        {/* Add/Edit Lesson form within module */}
                        {(isAddingLesson === mod.id || isEditingLesson !== null) && (isAddingLesson === mod.id || mod.lessons?.find((l: any) => l.id === isEditingLesson)) && (
                          <form onSubmit={isEditingLesson ? handleUpdateLesson : (e) => handleAddLesson(e, mod.id)} className="rounded-xl bg-slate-50/50 p-3 space-y-2.5 border border-slate-100 dark:bg-slate-800/20 dark:border-slate-800">
                            <h6 className="text-xs font-bold text-slate-600">{isEditingLesson ? "Edit Lesson" : "New Lesson"} Parameters</h6>
                            <div className="grid gap-2 md:grid-cols-3">
                              <input
                                type="text"
                                placeholder="Lesson ID (Optional)"
                                value={lessonForm.id}
                                onChange={(e) => setLessonForm({ ...lessonForm, id: e.target.value })}
                                className="rounded-lg border border-slate-200 p-2 text-xs bg-white dark:border-slate-800 dark:bg-slate-900"
                              />
                              <input
                                type="text"
                                required
                                placeholder="Lesson Title"
                                value={lessonForm.title}
                                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                                className="rounded-lg border border-slate-200 p-2 text-xs bg-white dark:border-slate-800 dark:bg-slate-900"
                              />
                              <input
                                type="text"
                                required
                                placeholder="Duration (e.g. 15 mins)"
                                value={lessonForm.duration}
                                onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                                className="rounded-lg border border-slate-200 p-2 text-xs bg-white dark:border-slate-800 dark:bg-slate-900"
                              />
                            </div>
                            <input
                              type="text"
                              required
                              placeholder="Video URL (YouTube)"
                              value={lessonForm.videoUrl}
                              onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                              className="w-full rounded-lg border border-slate-200 p-2 text-xs bg-white dark:border-slate-800 dark:bg-slate-900"
                            />
                            <ImageUpload 
                              label="Lesson Thumbnail"
                              value={lessonForm.thumbnail}
                              onChange={(url) => setLessonForm({ ...lessonForm, thumbnail: url })}
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAddingLesson(null);
                                  setIsEditingLesson(null);
                                }}
                                className="rounded-lg border px-3 py-1 text-xs"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="rounded-lg bg-indigo-500 text-white px-3 py-1 text-xs font-semibold"
                              >
                                {isEditingLesson ? "Update Lesson" : "Save Lesson"}
                              </button>
                            </div>
                          </form>
                        )}

                        {/* Add/Edit Assignment form within module */}
                        {(isAddingAssignment === mod.id || (isEditingAssignment !== null && mod.assignments?.find((a: any) => a.id === isEditingAssignment))) && (
                          <form onSubmit={isEditingAssignment ? handleUpdateAssignment : (e) => handleAddAssignment(e, mod.id)} className="rounded-xl bg-amber-50/50 p-3 space-y-2.5 border border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30">
                            <h6 className="text-xs font-bold text-amber-600 dark:text-amber-500">{isEditingAssignment ? "Edit Assignment" : "New Assignment"}</h6>
                            <div className="grid gap-2 md:grid-cols-2">
                              <input
                                type="text"
                                placeholder="Assignment ID (optional)"
                                value={assignmentForm.id}
                                onChange={(e) => setAssignmentForm({ ...assignmentForm, id: e.target.value })}
                                className="rounded-lg border border-amber-200 p-2 text-xs bg-white dark:border-amber-900/50 dark:bg-slate-900"
                              />
                              <input
                                type="text"
                                required
                                placeholder="Assignment Title"
                                value={assignmentForm.title}
                                onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                                className="rounded-lg border border-amber-200 p-2 text-xs bg-white dark:border-amber-900/50 dark:bg-slate-900"
                              />
                            </div>
                            <textarea
                              required
                              placeholder="Instructions"
                              value={assignmentForm.instructions}
                              onChange={(e) => setAssignmentForm({ ...assignmentForm, instructions: e.target.value })}
                              className="w-full rounded-lg border border-amber-200 p-2 text-xs bg-white min-h-[60px] dark:border-amber-900/50 dark:bg-slate-900"
                            />
                            <input
                              type="text"
                              placeholder="Download URL (Optional)"
                              value={assignmentForm.downloadUrl}
                              onChange={(e) => setAssignmentForm({ ...assignmentForm, downloadUrl: e.target.value })}
                              className="w-full rounded-lg border border-amber-200 p-2 text-xs bg-white dark:border-amber-900/50 dark:bg-slate-900"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAddingAssignment(null);
                                  setIsEditingAssignment(null);
                                }}
                                className="rounded-lg border border-amber-200 text-amber-700 px-3 py-1 text-xs dark:text-amber-400"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="rounded-lg bg-amber-500 text-white px-3 py-1 text-xs font-semibold"
                              >
                                {isEditingAssignment ? "Update Assignment" : "Save Assignment"}
                              </button>
                            </div>
                          </form>
                        )}

                        {/* Add/Edit Quiz form within module */}
                        {(isAddingQuiz === mod.id || (isEditingQuiz !== null && mod.quizzes?.find((q: any) => q.id === isEditingQuiz))) && (
                          <div className="rounded-xl bg-emerald-50/50 p-3 space-y-4 border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30">
                            <form onSubmit={isEditingQuiz ? handleUpdateQuiz : (e) => handleAddQuiz(e, mod.id)} className="space-y-2.5">
                              <h6 className="text-xs font-bold text-emerald-600 dark:text-emerald-500">{isEditingQuiz ? "Edit Quiz" : "New Quiz"}</h6>
                              <div className="grid gap-2 md:grid-cols-2">
                                <input
                                  type="text"
                                  required
                                  placeholder="Quiz Title"
                                  value={quizForm.title}
                                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                                  className="rounded-lg border border-emerald-200 p-2 text-xs bg-white dark:border-emerald-900/50 dark:bg-slate-900"
                                />
                                <select
                                  value={quizForm.type}
                                  onChange={(e) => setQuizForm({ ...quizForm, type: e.target.value })}
                                  className="rounded-lg border border-emerald-200 p-2 text-xs bg-white dark:border-emerald-900/50 dark:bg-slate-900"
                                >
                                  <option value="practice">Practice</option>
                                  <option value="module">Module</option>
                                  <option value="final">Final</option>
                                </select>
                              </div>
                              
                              {!isEditingQuiz && (
                                <div className="border border-emerald-100 rounded-lg p-3 bg-white dark:bg-slate-900 dark:border-emerald-900/30 space-y-2">
                                  <h6 className="text-[11px] font-bold text-emerald-700">Add a Question</h6>
                                  <input
                                    type="text"
                                    placeholder="Question Text"
                                    value={questionForm.question}
                                    onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                                    className="w-full rounded-lg border border-emerald-200 p-2 text-xs"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Options (comma separated)"
                                    value={questionForm.optionsString}
                                    onChange={(e) => setQuestionForm({ ...questionForm, optionsString: e.target.value })}
                                    className="w-full rounded-lg border border-emerald-200 p-2 text-xs"
                                  />
                                  <div className="flex gap-2">
                                    <input
                                      type="number"
                                      placeholder="Correct Option Index (0-based)"
                                      value={questionForm.correctAnswerIndex}
                                      onChange={(e) => setQuestionForm({ ...questionForm, correctAnswerIndex: parseInt(e.target.value) || 0 })}
                                      className="flex-1 rounded-lg border border-emerald-200 p-2 text-xs"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (!questionForm.question || !questionForm.optionsString) return;
                                        setQuizQuestions([...quizQuestions, {
                                          question: questionForm.question,
                                          options: questionForm.optionsString.split(",").map(s => s.trim()),
                                          correctAnswerIndex: questionForm.correctAnswerIndex,
                                          explanation: questionForm.explanation
                                        }]);
                                        setQuestionForm({ question: "", optionsString: "", correctAnswerIndex: 0, explanation: "" });
                                      }}
                                      className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold"
                                    >
                                      Add Q
                                    </button>
                                  </div>
                                </div>
                              )}

                              {!isEditingQuiz && quizQuestions.length > 0 && (
                                <div className="text-xs text-slate-500">
                                  {quizQuestions.length} questions added.
                                </div>
                              )}

                              <div className="flex justify-end gap-2 pt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsAddingQuiz(null);
                                    setIsEditingQuiz(null);
                                  }}
                                  className="rounded-lg border border-emerald-200 text-emerald-700 px-3 py-1 text-xs dark:text-emerald-400"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="rounded-lg bg-emerald-500 text-white px-3 py-1 text-xs font-semibold"
                                >
                                  {isEditingQuiz ? "Update Quiz" : "Save Quiz"}
                                </button>
                              </div>
                            </form>
                          </div>
                        )}


                        {/* Lessons List */}
                        {(!mod.lessons || mod.lessons.length === 0) ? (
                          <p className="text-[11px] text-slate-400">No lessons added to this module.</p>
                        ) : (
                          <div className="space-y-1.5 pl-2">
                            {mod.lessons.map((les: any) => (
                              <div key={les.id} className="flex items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <div className="flex items-center gap-2">
                                  <Video className="h-3.5 w-3.5 text-indigo-400" />
                                  <span className="font-medium">{les.title}</span>
                                  <span className="text-[10px] text-slate-400">({les.duration})</span>
                                  <a href={les.video_url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline truncate max-w-[150px] ml-2">
                                    {les.video_url}
                                  </a>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      setLessonForm({ id: les.id, title: les.title, videoUrl: les.video_url, duration: les.duration, thumbnail: les.thumbnail || "" });
                                      setIsEditingLesson(les.id);
                                      setIsAddingLesson(null);
                                    }}
                                    className="p-1 text-slate-400 hover:text-indigo-500"
                                    title="Edit Lesson"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLesson(les.id)}
                                    className="p-1 text-slate-400 hover:text-rose-500"
                                    title="Delete Lesson"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Assignments List */}
                        {mod.assignments && mod.assignments.length > 0 && (
                          <div className="space-y-1.5 pl-2 mt-2">
                            {mod.assignments.map((ass: any) => (
                              <div key={ass.id} className="flex items-center justify-between gap-2 text-xs text-amber-600 dark:text-amber-500 p-2 rounded-lg bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-3.5 w-3.5" />
                                  <span className="font-medium">{ass.title}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      setAssignmentForm({ id: ass.id, title: ass.title, instructions: ass.instructions, downloadUrl: ass.download_url || "" });
                                      setIsEditingAssignment(ass.id);
                                      setIsAddingAssignment(mod.id);
                                      setIsEditingLesson(null);
                                      setIsAddingLesson(null);
                                      setIsAddingQuiz(null);
                                      setIsEditingQuiz(null);
                                    }}
                                    className="p-1 text-slate-400 hover:text-amber-500"
                                    title="Edit Assignment"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAssignment(ass.id)}
                                    className="p-1 text-slate-400 hover:text-rose-500"
                                    title="Delete Assignment"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Quizzes List */}
                        {mod.quizzes && mod.quizzes.length > 0 && (
                          <div className="space-y-1.5 pl-2 mt-2">
                            {mod.quizzes.map((quiz: any) => (
                              <div key={quiz.id} className="flex items-center justify-between gap-2 text-xs text-emerald-600 dark:text-emerald-500 p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
                                <div className="flex items-center gap-2">
                                  <Check className="h-3.5 w-3.5" />
                                  <span className="font-medium">{quiz.title}</span>
                                  <span className="text-[10px] text-emerald-400">({quiz.type}) • {quiz.questions?.length || 0} Qs</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      setQuizForm({ id: quiz.id, title: quiz.title, type: quiz.type });
                                      setIsEditingQuiz(quiz.id);
                                      setIsAddingQuiz(mod.id);
                                      setIsEditingAssignment(null);
                                      setIsAddingAssignment(null);
                                      setIsEditingLesson(null);
                                      setIsAddingLesson(null);
                                    }}
                                    className="p-1 text-slate-400 hover:text-emerald-500"
                                    title="Edit Quiz"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteQuiz(quiz.id)}
                                    className="p-1 text-slate-400 hover:text-rose-500"
                                    title="Delete Quiz"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 h-64">
              <BookOpen className="mb-4 h-12 w-12 text-slate-300" />
              <p className="text-sm font-semibold text-slate-500">Select a course from the catalog list to view modules & lessons, or click "Add New Course" to get started.</p>
            </div>
          )}
        </div>
        </div>
      ) : activeTab === "doubts" ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-indigo-500" /> Doubt Desk
          </h3>
          {loadingDoubts ? (
            <p className="text-sm text-slate-400">Loading doubts...</p>
          ) : doubts.length === 0 ? (
            <p className="text-sm text-slate-400">No doubts found. Your students are doing great!</p>
          ) : (
            <div className="space-y-4">
              {doubts.map((doubt) => (
                <div key={doubt.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-800/40">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-2 ${doubt.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                        {doubt.status}
                      </span>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{doubt.user_email} asked:</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{doubt.question}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(doubt.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  {doubt.responses && doubt.responses.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-indigo-100 dark:border-indigo-500/30 space-y-3">
                      {doubt.responses.map((resp: any) => (
                        <div key={resp.id}>
                          <h5 className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{resp.author} replied:</h5>
                          <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{resp.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {doubt.status !== 'Resolved' && (
                    <div className="mt-4 flex items-center gap-2">
                      <input 
                        type="text" 
                        placeholder="Type your response..." 
                        value={replyText[doubt.id] || ""}
                        onChange={(e) => setReplyText({ ...replyText, [doubt.id]: e.target.value })}
                        className="flex-1 rounded-xl border border-slate-200 bg-white p-2.5 text-sm dark:border-slate-800 dark:bg-slate-900"
                      />
                      <button 
                        onClick={() => handleReplyDoubt(doubt.id)}
                        className="flex items-center gap-1 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-600 transition"
                      >
                        <Send className="h-4 w-4" /> Send
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === "certificates" ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Check className="h-5 w-5 text-emerald-500" /> Certificate Requests
          </h3>
          {loadingCerts ? (
            <p className="text-sm text-slate-400">Loading requests...</p>
          ) : certRequests.length === 0 ? (
            <p className="text-sm text-slate-400">No certificate requests found.</p>
          ) : (
            <div className="space-y-4">
              {certRequests.map((req) => (
                <div key={req.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{req.course_title}</h4>
                    <p className="text-xs text-slate-500 mt-1">Requested by: {req.recipient_name} ({req.user_email})</p>
                    <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                      {req.status}
                    </span>
                  </div>
                  {req.status === "Pending" && (
                    <button
                      onClick={() => handleApproveCertRequest(req.id)}
                      className="px-4 py-2 bg-emerald-500 text-white font-bold text-sm rounded-xl hover:bg-emerald-600 transition shadow-sm"
                    >
                      Approve
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
export default SkillsManager;
