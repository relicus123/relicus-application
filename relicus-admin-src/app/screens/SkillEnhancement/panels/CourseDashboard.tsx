import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Info, BookOpen, FileText, CheckSquare, Users, Star, Flame, Trophy, Play, Download, Send, Image, MessageSquare, Award, HelpCircle, CheckCircle2, Bookmark, Check, ShieldAlert, Sparkles, ExternalLink, Calendar, Video, Clock } from "lucide-react";
import { useSkillsStore, Course, Module, Lesson, Assignment, Material } from "../store/skills.store";
import { enrollmentService } from "../services/enrollment.service";
import { progressService } from "./../services/progress.service";
import { certificateService } from "./../services/certificate.service";
import { analyticsService } from "./../services/analytics.service";
import { courseService } from "../services/course.service";
import { Button } from "../../../components/Button";
import { InteractiveQuizModal } from "../components/InteractiveQuizModal";
import { DoubtSubmissionDrawer } from "../components/DoubtSubmissionDrawer";
import { DynamicCertificate } from "../components/DynamicCertificate";
import { EmptyState } from "../components/EmptyState";
import { CourseCompletionScreen } from "../components/CourseCompletionScreen";

interface CourseDashboardProps {
  courseId: string;
  onOpenVideo: (courseId: string, moduleId: string, lessonId: string, title: string, url: string) => void;
}

export const CourseDashboard: React.FC<CourseDashboardProps> = ({ courseId, onOpenVideo }) => {
  const store = useSkillsStore();
  const course = useMemo(() => courseService.getCourseById(courseId)!, [courseId, store.courses]);
  const activeTab = store.activeDashboardTab;

  // Local UI States
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [showDoubtDrawer, setShowDoubtDrawer] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  // Assignment submissions states
  const [githubUrl, setGithubUrl] = useState("");
  const [submittedFileName, setSubmittedFileName] = useState<string | null>(null);
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);

  // Bookmark list filter
  const [bookmarkFilter, setBookmarkFilter] = useState<"all" | "video" | "note">("all");

  const progressPercent = useMemo(() => {
    return progressService.getCourseCompletionPercentage(courseId);
  }, [courseId, store.lessonProgress]);

  const { completed: completedModulesCount, total: totalModulesCount } = useMemo(() => {
    return progressService.getCompletedModulesCount(courseId);
  }, [courseId, store.lessonProgress]);

  const certificate = useMemo(() => {
    return certificateService.getCertificateByCourseId(courseId);
  }, [courseId, store.certificates]);

  const eligibility = useMemo(() => {
    return certificateService.isEligibleForCertificate(courseId);
  }, [courseId, store.lessonProgress, store.submissions]);

  // Determine module status timeline: completed, current, locked
  const getModuleStatus = (index: number) => {
    const isCompleted = progressService.isModuleCompleted(courseId, course.modules[index].id);
    if (isCompleted) return "completed";
    
    // First non-completed module is current
    const prevCompleted = index === 0 || progressService.isModuleCompleted(courseId, course.modules[index - 1].id);
    if (prevCompleted) return "current";
    
    return "locked";
  };

  // Submissions for this course
  const courseSubmissions = useMemo(() => {
    return store.submissions.filter((s) => s.courseId === courseId);
  }, [store.submissions, courseId]);

  // Doubts for this course
  const courseDoubts = useMemo(() => {
    return store.doubts.filter((d) => d.courseId === courseId);
  }, [store.doubts, courseId]);

  // Bookmarks for this course
  const courseBookmarks = useMemo(() => {
    return store.bookmarks.filter((b) => b.courseId === courseId);
  }, [store.bookmarks, courseId]);

  const filteredBookmarks = useMemo(() => {
    if (bookmarkFilter === "all") return courseBookmarks;
    return courseBookmarks.filter((b) => b.type === bookmarkFilter);
  }, [courseBookmarks, bookmarkFilter]);

  const handleBack = () => {
    enrollmentService.selectCourse(null);
  };

  const handleToggleBookmark = (item: any, type: "video" | "note" | "assignment" | "resource" | "lesson") => {
    store.toggleBookmark({
      courseId,
      itemId: item.id,
      type,
      title: item.title,
      subtitle: type === "lesson" ? "Video Lecture" : "Downloadable Resource"
    });
    // Log bookmark activity
    store.logActivity("Lesson Completed", `Bookmarked ${type}: ${item.title}`);
  };

  const handleAssignmentSubmit = (assignId: string, type: "pdf" | "zip" | "github") => {
    const content = type === "github" ? githubUrl : (submittedFileName || "submission.zip");
    if (type === "github" && !githubUrl) return;

    store.submitAssignment({
      courseId,
      assignmentId: assignId,
      type,
      content,
      status: "Submitted"
    });

    setGithubUrl("");
    setSubmittedFileName(null);
    setActiveAssignmentId(null);
  };

  const handleResumeLearning = () => {
    const lastActive = progressService.getLastActiveLesson(courseId);
    if (lastActive) {
      const mod = course.modules.find((m) => m.id === lastActive.moduleId);
      const les = mod?.lessons.find((l) => l.id === lastActive.lessonId);
      if (les) {
        onOpenVideo(courseId, lastActive.moduleId, lastActive.lessonId, les.title, les.videoUrl);
      }
    }
  };

  const handleDownloadMaterial = (mat: Material) => {
    store.logDownload(mat.id);
    store.logActivity("Lesson Completed", `Downloaded material: ${mat.title}`);
    alert(`Downloading study reference file: ${mat.title}`);
  };

  // Render course completion screen if 100% completed
  if (progressPercent === 100) {
    return (
      <div className="p-6">
        <CourseCompletionScreen
          courseId={courseId}
          onBack={handleBack}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      {/* Course Title Header */}
      <div className="bg-white border-b border-neutral-100 p-5 sticky top-0 z-30 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3 min-w-0 pr-4">
          <button
            onClick={handleBack}
            className="p-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-500 rounded-xl transition-all border border-neutral-100 shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h2 className="font-extrabold text-foreground text-xs leading-none truncate max-w-[200px]">
              {course.title}
            </h2>
            <span className="text-[8px] font-black text-[#5F8B70] uppercase tracking-wider block mt-1.5">
              Course Progress • {progressPercent}%
            </span>
          </div>
        </div>

        {/* Header Right Resume Button */}
        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={handleResumeLearning} size="xs" className="rounded-full text-[9px] font-extrabold py-1.5">
            Resume Learning
          </Button>
        </div>
      </div>

      {/* Horizontal Tabs Sub-Navigation Bar */}
      <div className="bg-white border-b border-neutral-100 overflow-x-auto scrollbar-none flex gap-1 px-4 py-2 sticky top-[68px] z-25 shadow-xs shrink-0">
        {([
          { id: "overview", label: "Overview" },
          { id: "curriculum", label: "Curriculum" },
          { id: "assignments", label: "Assignments" },
          { id: "quizzes", label: "Quizzes" },
          { id: "workshops", label: "Workshops" },
          { id: "discussions", label: "Doubts" },
          { id: "progress", label: "Analytics" },
          { id: "certification", label: "Certification" }
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => store.setActiveDashboardTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
              activeTab === tab.id
                ? "bg-[#1C4966] text-white border-transparent shadow-md"
                : "bg-white border-neutral-100 text-neutral-400 hover:text-neutral-600 hover:border-neutral-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Tab Panel Frame */}
      <div className="p-6 space-y-6">
        
        {/* TABS CONTAINER */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            
            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Course Card description */}
                <div className="bg-white border border-neutral-100 rounded-[2rem] p-6 shadow-xs space-y-4">
                  <h4 className="text-sm font-black text-foreground">Course Description</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    {course.description}
                  </p>
                </div>

                {/* SKILL OUTCOME SECTION */}
                <div className="bg-white border border-neutral-100 rounded-[2rem] p-6 shadow-xs space-y-4">
                  <h4 className="text-sm font-black text-foreground">Skills You'll Gain</h4>
                  <div className="flex flex-wrap gap-2">
                    {course.skillsLearned.map((skill, idx) => (
                      <span key={idx} className="text-xs font-bold bg-[#8FBDD7]/15 text-[#1C4966] px-3.5 py-1.5 rounded-full">
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Objectives */}
                <div className="bg-white border border-neutral-100 rounded-[2rem] p-6 shadow-xs space-y-4">
                  <h4 className="text-sm font-black text-foreground">What you will learn</h4>
                  <ul className="space-y-3.5">
                    {course.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground font-medium">
                        <CheckCircle2 className="w-4.5 h-4.5 text-[#5F8B70] shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructor */}
                <div className="bg-white border border-neutral-100 rounded-[2rem] p-6 shadow-xs space-y-4">
                  <h4 className="text-sm font-black text-foreground">Instructor Profile</h4>
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-3xl shrink-0">
                      {course.instructorAvatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="font-extrabold text-foreground text-xs leading-none">{course.instructor}</h5>
                      <span className="text-[9px] font-bold text-[#5F8B70] block mt-1">{course.instructorTitle}</span>
                      <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                        {course.instructorBio}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CURRICULUM */}
            {activeTab === "curriculum" && (
              <div className="space-y-6">
                {/* Visual TimelineLearning Path Map */}
                <div className="bg-white border border-neutral-100 rounded-[2.25rem] p-5 shadow-xs space-y-4">
                  <h4 className="text-xs font-black text-foreground uppercase tracking-wider px-1">
                    Learning Path Timeline
                  </h4>
                  <div className="flex items-center justify-between gap-1 p-2 bg-neutral-50 rounded-2xl border border-neutral-100">
                    {course.modules.map((mod, index) => {
                      const status = getModuleStatus(index);
                      return (
                        <div key={mod.id} className="flex-1 flex flex-col items-center gap-1.5 text-center relative">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                              status === "completed"
                                ? "bg-[#5F8B70] text-white"
                                : status === "current"
                                ? "bg-[#1C4966] text-white ring-4 ring-[#1C4966]/15"
                                : "bg-neutral-200 text-neutral-400"
                            }`}
                          >
                            {status === "completed" ? <Check className="w-4 h-4" /> : index + 1}
                          </div>
                          <span className="text-[8px] font-black text-neutral-500 uppercase tracking-wide truncate max-w-[60px]">
                            {status === "completed" ? "Done" : status === "current" ? "Active" : "Locked"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Modules list details */}
                <div className="space-y-4">
                  {course.modules.map((mod, index) => {
                    const status = getModuleStatus(index);
                    const isLocked = status === "locked";

                    return (
                      <div
                        key={mod.id}
                        className={`bg-white border rounded-[2rem] p-5 shadow-xs transition-all ${
                          isLocked ? "border-neutral-100 opacity-60 bg-neutral-50/50" : "border-neutral-100"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <div className="min-w-0">
                            <span className="text-[8.5px] font-black text-[#5F8B70] uppercase tracking-wider block mb-1">
                              Module {index + 1} • {status.toUpperCase()}
                            </span>
                            <h4 className="font-extrabold text-foreground text-xs leading-snug">{mod.title}</h4>
                            <p className="text-[10px] text-muted-foreground mt-1">{mod.description}</p>
                          </div>
                        </div>

                        {!isLocked && (
                          <div className="space-y-3.5 border-t border-neutral-50 pt-4">
                            {/* Lessons List */}
                            {mod.lessons.map((les) => {
                              const prog = progressService.getLessonProgress(courseId, les.id);
                              const isBookmarked = store.bookmarks.some(
                                (bm) => bm.courseId === courseId && bm.itemId === les.id && bm.type === "lesson"
                              );
                              return (
                                <div
                                  key={les.id}
                                  className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100 group"
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                                    <button
                                      onClick={() => onOpenVideo(courseId, mod.id, les.id, les.title, les.videoUrl)}
                                      className="w-8 h-8 rounded-lg bg-[#1C4966]/10 text-[#1C4966] hover:bg-[#1C4966] hover:text-white flex items-center justify-center shrink-0 transition-all cursor-pointer"
                                    >
                                      <Play className="w-3.5 h-3.5 fill-current" />
                                    </button>
                                    <div className="min-w-0 flex-1">
                                      <h5 className="text-[11px] font-bold text-foreground truncate">{les.title}</h5>
                                      <span className="text-[9px] text-neutral-400 block mt-0.5">
                                        Video • {les.duration} {prog.completed ? "• ✅ Watched" : prog.progress > 0 ? `• ⏳ ${prog.progress}%` : ""}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Bookmark toggle */}
                                  <button
                                    onClick={() => handleToggleBookmark(les, "lesson")}
                                    className={`p-2 rounded-lg transition-all border ${
                                      isBookmarked
                                        ? "bg-amber-50 border-amber-200 text-amber-500"
                                        : "bg-white border-neutral-100 text-neutral-300 hover:text-neutral-500"
                                    }`}
                                  >
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                  </button>
                                </div>
                              );
                            })}

                            {/* Reference Materials */}
                            {mod.materials.map((mat) => {
                              const isBookmarked = store.bookmarks.some(
                                (bm) => bm.courseId === courseId && bm.itemId === mat.id && bm.type === "note"
                              );
                              return (
                                <div
                                  key={mat.id}
                                  className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-neutral-100"
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                                      <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <h5 className="text-[11px] font-bold text-foreground truncate">{mat.title}</h5>
                                      <span className="text-[9px] text-neutral-400 block mt-0.5 uppercase">
                                        {mat.type} Reference Sheet
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      onClick={() => handleToggleBookmark(mat, "note")}
                                      className={`p-2 rounded-lg transition-all border ${
                                        isBookmarked
                                          ? "bg-amber-50 border-amber-200 text-amber-500"
                                          : "bg-white border-neutral-100 text-neutral-300 hover:text-neutral-500"
                                      }`}
                                    >
                                      <Star className="w-3.5 h-3.5 fill-current" />
                                    </button>
                                    <button
                                      onClick={() => handleDownloadMaterial(mod.materials.find(m => m.id === mat.id)!)}
                                      className="p-2 bg-neutral-50 border border-neutral-100 text-neutral-500 hover:bg-neutral-100 rounded-lg transition-all cursor-pointer"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: ASSIGNMENTS */}
            {activeTab === "assignments" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  {course.modules.flatMap((m) => m.assignments).map((assign) => {
                    const sub = courseSubmissions.find((s) => s.assignmentId === assign.id);
                    const isSubmitting = activeAssignmentId === assign.id;

                    return (
                      <div key={assign.id} className="bg-white border border-neutral-100 rounded-[2rem] p-5 shadow-xs space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="min-w-0">
                            <h5 className="font-extrabold text-foreground text-xs leading-snug">{assign.title}</h5>
                            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                              {assign.instructions}
                            </p>
                          </div>

                          {sub && (
                            <span
                              className={`text-[8.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                sub.status === "Reviewed"
                                  ? "bg-[#5F8B70]/10 text-[#5F8B70]"
                                  : "bg-amber-50 text-amber-500"
                              }`}
                            >
                              {sub.status}
                            </span>
                          )}
                        </div>

                        {/* Submission panel active status */}
                        {sub ? (
                          <div className="bg-neutral-50/50 border border-neutral-100 rounded-xl p-4 space-y-2.5 text-xs">
                            <div className="flex justify-between text-[10px] font-bold text-neutral-400">
                              <span>Submitted Details</span>
                              <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[11px] font-bold text-foreground break-all">
                              {sub.type === "github" ? "GitHub: " : "File: "}{sub.content}
                            </p>
                            {sub.grade && (
                              <div className="border-t border-neutral-100 pt-3 mt-1.5 space-y-1 bg-white p-3 rounded-lg">
                                <div className="flex justify-between font-bold">
                                  <span className="text-[9px] uppercase tracking-wider text-neutral-400">Graded Score</span>
                                  <span className="text-xs text-[#5F8B70]">Grade: {sub.grade}</span>
                                </div>
                                <p className="text-[10px] text-neutral-500 font-medium leading-relaxed mt-1">
                                  {sub.feedback}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : isSubmitting ? (
                          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 space-y-4 text-xs">
                            <h6 className="font-bold text-foreground">Select submission format:</h6>
                            
                            {/* Option 1: GitHub Link */}
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400">
                                GitHub Repository URL
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={githubUrl}
                                  onChange={(e) => setGithubUrl(e.target.value)}
                                  placeholder="https://github.com/username/project"
                                  className="flex-1 text-xs p-2.5 border border-neutral-200 rounded-xl bg-white outline-none focus:border-[#1C4966]"
                                />
                                <Button
                                  onClick={() => handleAssignmentSubmit(assign.id, "github")}
                                  disabled={!githubUrl}
                                  size="sm"
                                  className="rounded-xl shrink-0"
                                >
                                  Submit Link
                                </Button>
                              </div>
                            </div>

                            {/* Divider */}
                            <div className="relative text-center my-1.5">
                              <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest bg-neutral-50 px-2 relative z-10">
                                OR
                              </span>
                              <div className="absolute inset-y-2 left-0 right-0 border-b border-neutral-200 z-0" />
                            </div>

                            {/* Option 2: Mock File Upload */}
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  setSubmittedFileName(`solution_build_${Math.floor(Math.random() * 1000)}.zip`);
                                  alert("Mock ZIP workspace file selected successfully!");
                                }}
                                variant="outline"
                                className="flex-1 rounded-xl text-[10px] font-bold border-dashed border-2 py-3"
                              >
                                {submittedFileName ? `Selected: ${submittedFileName}` : "📁 Select ZIP / PDF file"}
                              </Button>
                              {submittedFileName && (
                                <Button
                                  onClick={() => handleAssignmentSubmit(assign.id, "zip")}
                                  size="sm"
                                  className="rounded-xl shrink-0"
                                >
                                  Upload
                                </Button>
                              )}
                            </div>

                            <button
                              onClick={() => {
                                setIsSubmitting(false);
                                setSubmittedFileName(null);
                              }}
                              className="text-[10px] font-bold text-neutral-400 hover:text-neutral-600 block mt-2 text-center"
                            >
                              Cancel Submission
                            </button>
                          </div>
                        ) : (
                          <Button onClick={() => setActiveAssignmentId(assign.id)} className="w-full rounded-xl">
                            Submit Solution Workspace
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: QUIZZES */}
            {activeTab === "quizzes" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  {course.modules.flatMap((m) => m.quizzes).map((quiz) => (
                    <div key={quiz.id} className="bg-white border border-neutral-100 rounded-[2rem] p-5 shadow-xs flex justify-between items-center">
                      <div className="min-w-0 pr-4">
                        <span className="text-[8px] font-black text-[#8FBDD7] uppercase tracking-wider block mb-1">
                          {quiz.type.toUpperCase()} TEST
                        </span>
                        <h5 className="font-extrabold text-foreground text-xs leading-snug">{quiz.title}</h5>
                        <p className="text-[9px] text-neutral-400 mt-1">{quiz.questions.length} MCQ Questions</p>
                      </div>
                      <Button onClick={() => setActiveQuiz(quiz)} size="sm" className="rounded-xl shrink-0">
                        Start Test
                      </Button>
                    </div>
                  ))}

                  {/* Bookmarks drawer preview for videos and notes */}
                  <div className="bg-white border border-neutral-100 rounded-[2.25rem] p-5 shadow-xs space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <div className="flex items-center gap-1.5">
                        <Bookmark className="w-4 h-4 text-amber-500 fill-amber-400" />
                        <h5 className="text-[10px] font-extrabold text-foreground uppercase tracking-wider">
                          Course Bookmarks
                        </h5>
                      </div>
                      <div className="flex bg-neutral-100 p-0.5 rounded-lg gap-0.5">
                        {([
                          { id: "all", label: "All" },
                          { id: "lesson", label: "Videos" },
                          { id: "note", label: "Notes" }
                        ] as const).map((bTab) => (
                          <button
                            key={bTab.id}
                            onClick={() => setBookmarkFilter(bTab.id as any)}
                            className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${
                              bookmarkFilter === bTab.id ? "bg-white text-[#1C4966] shadow-xs" : "text-neutral-400"
                            }`}
                          >
                            {bTab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {filteredBookmarks.length > 0 ? (
                      <div className="space-y-2">
                        {filteredBookmarks.map((bm) => (
                          <div
                            key={bm.id}
                            className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex justify-between items-center text-xs"
                          >
                            <div className="min-w-0 pr-3 flex-1">
                              <h6 className="font-bold text-foreground truncate">{bm.title}</h6>
                              <span className="text-[9px] text-neutral-400 uppercase font-black">{bm.subtitle}</span>
                            </div>
                            <button
                              onClick={() => store.toggleBookmark(bm)}
                              className="text-red-500 hover:text-red-700 font-bold text-[9px] uppercase tracking-wider shrink-0"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-xs text-neutral-400 font-medium">
                        No active bookmarks. Save videos or notes in curriculum to view them here.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: WORKSHOPS */}
            {activeTab === "workshops" && (
              <div className="space-y-6">
                {/* Upcoming live */}
                <div className="bg-white border border-neutral-100 rounded-[2rem] p-5 shadow-xs space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
                    <h5 className="text-[10px] font-extrabold text-foreground uppercase tracking-wider">
                      Live Masterclasses
                    </h5>
                    <span className="text-[8px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-full">
                      Live Soon
                    </span>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                      <Video className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="font-extrabold text-foreground text-xs leading-snug">
                        Interactive Live Workshop: Next.js Optimization
                      </h5>
                      <span className="text-[9px] text-neutral-400 block mt-1">
                        Host: Sarah Jenkins • Today, 4:00 PM (IST)
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => alert("Launching live masterclass video call. Google Meet/LiveKit stream simulation active.")}
                    className="w-full rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5"
                  >
                    Join Live Workshop Room <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* Recorded Replays */}
                <div className="space-y-3">
                  <h5 className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider px-1">
                    Recorded Replays
                  </h5>
                  {[
                    { title: "React Design Patterns Q&A", date: "June 2, 2026", duration: "1h 15m" },
                    { title: "Career Path Tips & Portfolio Review", date: "May 25, 2026", duration: "58m" }
                  ].map((rep, idx) => (
                    <div key={idx} className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-xs flex justify-between items-center text-xs">
                      <div className="min-w-0 pr-3">
                        <h6 className="font-bold text-foreground truncate">{rep.title}</h6>
                        <span className="text-[9px] text-neutral-400 mt-1 block">
                          Recorded on {rep.date} • {rep.duration}
                        </span>
                      </div>
                      <Button
                        onClick={() => alert(`Launching recorded replay stream: ${rep.title}`)}
                        variant="outline"
                        size="xs"
                        className="rounded-lg shrink-0 border-[#1C4966] text-[#1C4966]"
                      >
                        Play
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: DISCUSSIONS & DOUBTS */}
            {activeTab === "discussions" && (
              <div className="space-y-6">
                <div className="bg-white border border-neutral-100 rounded-[2rem] p-5 shadow-xs space-y-4">
                  <div className="flex justify-between items-center">
                    <h5 className="text-[10px] font-extrabold text-foreground uppercase tracking-wider">
                      Doubt Support Panel
                    </h5>
                    <Button onClick={() => setShowDoubtDrawer(true)} size="sm" className="rounded-xl">
                      Ask Question
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Stuck on code issues? Ask your mentor! Select screenshots or files to receive code analysis guidance responses.
                  </p>
                </div>

                {/* Doubt feed */}
                <div className="space-y-4">
                  {/* Zweifel list */}
                  <h5 className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider px-1">
                    Doubt Inquiries Feed
                  </h5>
                  {courseDoubts.length > 0 ? (
                    courseDoubts.map((doubt) => (
                      <div key={doubt.id} className="bg-white border border-neutral-100 rounded-[2rem] p-5 shadow-xs space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-neutral-400 font-bold">
                            {new Date(doubt.submittedAt).toLocaleDateString()}
                          </span>
                          <span
                            className={`text-[8px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              doubt.status === "Resolved" ? "bg-[#5F8B70]/10 text-[#5F8B70]" : "bg-amber-50 text-amber-500"
                            }`}
                          >
                            {doubt.status}
                          </span>
                        </div>
                        <p className="text-xs text-foreground font-semibold leading-relaxed">
                          {doubt.question}
                        </p>
                        {doubt.responses.length > 0 && (
                          <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 space-y-2">
                            {doubt.responses.map((res, rIdx) => (
                              <div key={rIdx} className="space-y-0.5">
                                <span className="text-[9.5px] font-black text-foreground block">{res.author}</span>
                                <p className="text-[10px] text-neutral-600 font-medium leading-relaxed">
                                  {res.message}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-neutral-400 font-medium bg-white border border-neutral-100 rounded-2xl">
                      No doubts posted yet. Get help from our mentors.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 7: PROGRESS TRACKING */}
            {activeTab === "progress" && (
              <div className="space-y-6">
                {/* Stats row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-neutral-100 rounded-[2rem] p-5 flex flex-col justify-between shadow-xs min-h-[120px]">
                    <span className="text-[8px] font-extrabold text-neutral-400 uppercase tracking-widest block mb-1">
                      Modules Finished
                    </span>
                    <div>
                      <h3 className="text-2xl font-black text-[#1C4966]">
                        {completedModulesCount} / {totalModulesCount}
                      </h3>
                      <p className="text-[9px] text-muted-foreground mt-1">Completeness check</p>
                    </div>
                  </div>

                  <div className="bg-white border border-neutral-100 rounded-[2rem] p-5 flex flex-col justify-between shadow-xs min-h-[120px]">
                    <span className="text-[8px] font-extrabold text-neutral-400 uppercase tracking-widest block mb-1">
                      Streaks Status
                    </span>
                    <div>
                      <h3 className="text-2xl font-black text-amber-500 flex items-center gap-1">
                        <Flame className="w-5 h-5 fill-current" /> {store.streakCount} Days
                      </h3>
                      <p className="text-[9px] text-muted-foreground mt-1">Keep learning daily!</p>
                    </div>
                  </div>
                </div>

                {/* Progress breakdown */}
                <div className="bg-white border border-neutral-100 rounded-[2rem] p-6 shadow-xs space-y-4">
                  <h4 className="text-xs font-black text-foreground uppercase tracking-wider">
                    Curriculum Progress Checklist
                  </h4>
                  <div className="space-y-3 text-xs font-medium text-neutral-600">
                    {course.modules.map((mod) => {
                      const isModDone = progressService.isModuleCompleted(courseId, mod.id);
                      return (
                        <div key={mod.id} className="flex items-center justify-between border-b border-neutral-50 pb-2">
                          <span className="truncate max-w-[200px]">{mod.title}</span>
                          <span
                            className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isModDone ? "bg-[#5F8B70]/10 text-[#5F8B70]" : "bg-neutral-100 text-neutral-400"
                            }`}
                          >
                            {isModDone ? "Done" : "Pending"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: CERTIFICATION */}
            {activeTab === "certification" && (
              <div className="space-y-6">
                {/* Requirements panel */}
                <div className="bg-white border border-neutral-100 rounded-[2.25rem] p-6 shadow-xs space-y-5">
                  <div className="text-center space-y-1.5">
                    <div className="w-16 h-16 bg-[#1C4966]/10 text-[#1C4966] rounded-[1.5rem] flex items-center justify-center mx-auto shadow-xs border border-[#1C4966]/10">
                      <Award className="w-8 h-8" />
                    </div>
                    <h4 className="text-base font-black text-foreground">Academy Certificate Credentials</h4>
                    <p className="text-[10px] text-muted-foreground">Requirements to unlock professional degree pdf</p>
                  </div>

                  <div className="space-y-3">
                    {/* Requirement 1: Progress */}
                    <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100 text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`w-4 h-4 ${progressPercent === 100 ? "text-[#5F8B70]" : "text-neutral-300"}`} />
                        <span>Watch all curriculum lessons (100%)</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-extrabold">{progressPercent}%</span>
                    </div>

                    {/* Requirement 2: Assignment Submission */}
                    <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100 text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`w-4 h-4 ${courseSubmissions.length > 0 ? "text-[#5F8B70]" : "text-neutral-300"}`} />
                        <span>Submit at least 1 project assignment</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-extrabold">
                        {courseSubmissions.length > 0 ? "Completed" : "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {certificate ? (
                    <div className="space-y-3">
                      <div className="bg-[#5F8B70]/10 border border-[#5F8B70]/20 rounded-2xl p-4 text-center text-xs text-[#5F8B70] font-bold">
                        🎉 Congratulations! Your professional certificate has been generated successfully!
                      </div>
                      <Button onClick={() => setShowCertModal(true)} className="w-full rounded-xl py-3">
                        View & Share Certificate
                      </Button>
                    </div>
                  ) : eligibility ? (
                    <Button
                      onClick={() => {
                        const name = prompt("Enter student name for the certificate:", "Ashok Mahajan") || "Ashok Mahajan";
                        certificateService.generateCertificate(courseId, name);
                        setShowCertModal(true);
                      }}
                      className="w-full rounded-xl py-3 bg-[#5F8B70] hover:bg-[#5F8B70]/95 shadow-md"
                    >
                      Generate Certificate Now
                    </Button>
                  ) : (
                    <div className="bg-neutral-100 text-neutral-400 border border-neutral-200 rounded-xl p-4 text-center text-xs font-extrabold">
                      Please fulfill requirements first to generate your credential.
                    </div>
                  )}
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Interactive Modals */}
      {activeQuiz && (
        <InteractiveQuizModal
          title={activeQuiz.title}
          questions={activeQuiz.questions}
          onClose={() => setActiveQuiz(null)}
          onFinish={(score) => {
            if (score >= 70) {
              store.incrementStreak();
              // Log activity
              store.logActivity("Quiz Passed", `Passed quiz: ${activeQuiz.title} with ${score}% accuracy`);
            }
          }}
        />
      )}

      {showDoubtDrawer && (
        <DoubtSubmissionDrawer
          courseId={courseId}
          onClose={() => setShowDoubtDrawer(false)}
        />
      )}

      {showCertModal && certificate && (
        <DynamicCertificate
          certificate={certificate}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </div>
  );
};
export default CourseDashboard;
