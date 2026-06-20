import React, { useMemo, useState, useEffect } from "react";
import { ArrowRight, Bell, ChevronDown, ChevronUp, Flame, TrendingUp, Award, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ExamType } from "./types/exam.types";
import { useCoachingStore } from "./store/coaching.store";
import { EXAM_THEMES } from "./constants/ui";
import { progressService } from "./services/progress.service";
import { formatRelativeTime } from "./utils/dateHelpers";

interface ExamSelectionProps {
  onSelectExam: (exam: ExamType) => void;
  onNavigateToNotifications?: () => void;
}

interface ExamMeta {
  type: ExamType;
  name: string;
  description: string;
  icon: string;
  progress: number;
  subjectsCount: number;
  mockTestsCount: number;
}

export const ExamSelection: React.FC<ExamSelectionProps> = React.memo(({ onSelectExam, onNavigateToNotifications }) => {
  const { learningStreak, recentActivity, categories, exams, announcements, notifications } = useCoachingStore();

  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (id: string) =>
    setCollapsedCategories((prev) => ({ ...prev, [id]: !prev[id] }));

  // Unread notifications count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Group exams under categories
  const categorizedExamsMap = useMemo(() => {
    const map: Record<string, ExamMeta[]> = {};
    
    categories.forEach((cat) => {
      const categoryExams = exams.filter((ex) => (ex.categoryId || ex.category_id) === cat.id);
      
      map[cat.id] = categoryExams.map((ex) => {
        const chaptersList = ex.chapters || [];
        const progressList = chaptersList.map((ch: any) => progressService.getChapterProgress(ch.id));
        const totalProgress = progressList.reduce((acc: number, p: number) => acc + p, 0);
        const progressPercent = chaptersList.length > 0 ? Math.round(totalProgress / chaptersList.length) : 0;

        return {
          type: ex.id as ExamType,
          name: ex.fullName || ex.full_name || ex.id,
          description: ex.tagline || "",
          icon: ex.icon || "🎓",
          progress: progressPercent,
          subjectsCount: (ex.subjects || []).length,
          mockTestsCount: (ex.mockTests || []).length,
        };
      });
    });

    return map;
  }, [categories, exams]);

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      {/* ── Top Banner ────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-primary to-secondary p-6 pb-12 rounded-b-[2rem] text-white">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-white/80 text-sm">Target preparation</p>
            <h1 className="text-2xl font-bold">Entrance Coaching</h1>
          </div>
          <button 
            onClick={onNavigateToNotifications}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm relative cursor-pointer hover:bg-white/30 transition-colors"
          >
            <Bell className="w-5 h-5 text-white" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Streak card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-xs">
              <Flame className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <p className="text-white/70 text-xs">Learning Streak</p>
              <h3 className="text-lg font-bold">{learningStreak} Days Active</h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs">Next Reward</p>
            <p className="text-sm font-semibold">15 Days Milestone</p>
          </div>
        </motion.div>
      </div>

      {/* ── Categorized Exam List ─────────────────────────────────────────────── */}
      <div className="p-5 space-y-6">
        <h2 className="text-xl font-bold text-foreground">Choose Your Exam</h2>

        {categories.map((category, catIdx) => {
          const isCollapsed = !!collapsedCategories[category.id];
          const categoryExams = categorizedExamsMap[category.id] || [];

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIdx * 0.1 }}
            >
              {/* Category Header — tappable to collapse */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between mb-3 cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{category.icon || "🎓"}</span>
                  <div className="text-left">
                    <h3 className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-[10px] text-neutral-400">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-neutral-400">
                    {categoryExams.length} exams
                  </span>
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  )}
                </div>
              </button>

              {/* Collapsible exam cards */}
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    key="cards"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    {categoryExams.length === 0 ? (
                      <p className="text-xs text-neutral-450 italic p-3 pl-6">No exams under this category yet.</p>
                    ) : (
                      <div className="space-y-3 pt-1">
                        {categoryExams.map((exam, i) => {
                          const theme = EXAM_THEMES[exam.type] || {
                            bg: "bg-slate-50",
                            border: "border-slate-200",
                            text: "text-slate-700",
                            primary: "#0D9488",
                            arrowBg: "bg-teal-600"
                          };
                          return (
                            <motion.div
                              key={exam.type}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.07 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => onSelectExam(exam.type)}
                              className={`group cursor-pointer rounded-[2rem] border p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${theme.bg} ${theme.border}`}
                            >
                              {/* Top row */}
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{exam.icon}</span>
                                  <div>
                                    <h4 className={`text-base font-extrabold ${theme.text}`}>{exam.name}</h4>
                                    <p className="text-xs text-neutral-500 leading-snug mt-0.5 max-w-[180px]">
                                      {exam.description}
                                    </p>
                                  </div>
                                </div>
                                <span className={`whitespace-nowrap shrink-0 px-2.5 py-1 text-[10px] font-bold rounded-full bg-white border ${theme.border} ${theme.text}`}>
                                  {exam.subjectsCount} Subjects
                                </span>
                              </div>

                              {/* Progress bar */}
                              <div className="mt-3 mb-3">
                                <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${exam.progress}%`, backgroundColor: theme.primary }}
                                  />
                                </div>
                              </div>

                              {/* Bottom row */}
                              <div className="flex items-center justify-between pt-1 border-t border-neutral-100/50">
                                <div className="flex items-center gap-4">
                                  <div>
                                    <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block mb-0.5">
                                      Progress
                                    </span>
                                    <span className="text-sm font-bold text-foreground">{exam.progress}% Done</span>
                                  </div>
                                  <div className="w-[1px] h-6 bg-neutral-200" />
                                  <div>
                                    <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block mb-0.5">
                                      Mock Tests
                                    </span>
                                    <span className="text-sm font-bold text-foreground">{exam.mockTestsCount} Available</span>
                                  </div>
                                </div>
                                <button
                                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-all duration-300 group-hover:translate-x-0.5 ${theme.arrowBg}`}
                                >
                                  <ArrowRight className="w-5 h-5" />
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Divider */}
              {catIdx < categories.length - 1 && (
                <div className="mt-5 border-t border-neutral-100" />
              )}
            </motion.div>
          );
        })}

        {/* ── Recent Activity ─────────────────────────────────────────────────── */}
        {recentActivity.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 px-1">Recent Activity</h3>
            <div className="bg-white border border-neutral-100 rounded-[2rem] p-5 shadow-xs space-y-3">
              {recentActivity.slice(0, 3).map((act, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2.5 last:pb-0 first:pt-0 border-b last:border-0 border-neutral-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-neutral-50 border border-neutral-100/30 rounded-xl flex items-center justify-center text-neutral-400">
                      {act.type === "video" ? (
                        <Clock className="w-4 h-4 text-[#8B5CF6]" />
                      ) : act.type === "test" ? (
                        <Award className="w-4 h-4 text-primary" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-[#5F8B70]" />
                      )}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-foreground">{act.title}</h5>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{act.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-medium">
                    {formatRelativeTime(act.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Dynamic Announcements ────────────────────────────────────────────── */}
        {announcements.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-foreground mb-3 px-1">Announcements</h3>
            <div className="space-y-3">
              {announcements.slice(0, 3).map((ann) => (
                <div key={ann.id} className="bg-neutral-50 border border-neutral-150 rounded-[2rem] p-5 shadow-xs">
                  <h5 className="text-sm font-bold text-foreground mb-1">📅 {ann.title}</h5>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ExamSelection.displayName = "ExamSelection";
