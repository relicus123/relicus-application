import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Star,
  Briefcase,
  ListOrdered,
  Info,
  Calendar,
  Send,
  User
} from "lucide-react";
import { ExamType } from "./types/exam.types";
import { getExamInfo } from "./constants/examInfo";
import { EXAM_THEMES, GLOBAL_COLORS } from "./constants/ui";
import { EXAMS } from "./constants/exams";
import { ExamCountdownWidget } from "./components/ExamCountdownWidget";
import { useCoachingStore } from "./store/coaching.store";
import { supabase } from "../../services/supabaseClient";
import { recentActivityService } from "./services/recentActivity.service";

interface ExamInfoScreenProps {
  examType: ExamType;
  onBack: () => void;
  onStart: () => void;
}

const DifficultyStars: React.FC<{ level: number }> = ({ level }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${i < level ? "text-yellow-400 fill-yellow-400" : "text-neutral-200"}`}
      />
    ))}
    <span className="ml-1.5 text-xs font-semibold text-white/80">
      {level === 5 ? "Very Hard" : level === 4 ? "Hard" : level === 3 ? "Moderate" : level === 2 ? "Easy" : "Beginner"}
    </span>
  </div>
);

export const ExamInfoScreen: React.FC<ExamInfoScreenProps> = ({
  examType,
  onBack,
  onStart,
}) => {
  const { exams, feedbacks, loadCoachingData } = useCoachingStore();
  
  const staticInfo = getExamInfo(examType);
  const examMetadata = EXAMS.find((e) => e.type === examType);

  // Dynamic values backed by store/database
  const dynamicExam = useMemo(() => {
    return exams.find((ex) => ex.id === examType);
  }, [exams, examType]);

  const info = useMemo(() => {
    if (dynamicExam) {
      return {
        tagline: dynamicExam.tagline,
        overview: dynamicExam.overview,
        eligibility: dynamicExam.eligibility || [],
        nextExamDate: dynamicExam.nextExamDate,
        difficultyLevel: dynamicExam.difficultyLevel || 3,
        careerOpportunities: dynamicExam.careerOpportunities || [],
        syllabusTopics: dynamicExam.syllabusTopics || [],
        examPattern: dynamicExam.examPattern || [],
      };
    }
    return staticInfo;
  }, [dynamicExam, staticInfo]);

  // Feedbacks filtered by exam type
  const examFeedbacks = useMemo(() => {
    return feedbacks.filter((f) => f.exam_id === examType || f.examId === examType);
  }, [feedbacks, examType]);

  // Aggregate Rating
  const avgRating = useMemo(() => {
    if (examFeedbacks.length === 0) return 0;
    const total = examFeedbacks.reduce((acc, curr) => acc + curr.rating, 0);
    return Number((total / examFeedbacks.length).toFixed(1));
  }, [examFeedbacks]);

  // Form submission state
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState("");
  const [userEmail, setUserEmail] = useState("student@relicus.com");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const theme = EXAM_THEMES[examType] || {
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-700",
    primary: "#0D9488",
    arrowBg: "bg-teal-600",
    gradient: "from-teal-500 to-emerald-600"
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("coaching_exam_feedback")
        .insert({
          exam_id: examType,
          user_email: userEmail,
          rating: rating,
          review_text: reviewText
        });
      if (error) throw error;
      await loadCoachingData();

      // Track recent activity automatically
      recentActivityService.track({
        id: `${examType}-feedback`,
        type: "note",
        title: "Submitted Exam Feedback",
        subtitle: `Rated ${examType} with ${rating} stars`,
        path: "/app/coaching",
        examType
      });

      setFormSuccess(true);
      setReviewText("");
      setTimeout(() => setFormSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!info || !examMetadata) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-400">Loading exam intake profiles...</p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="exam-info"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-background pb-28 text-foreground"
      >
        {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
        <div
          className={`bg-gradient-to-br ${theme.gradient} p-6 pt-12 pb-10 relative overflow-hidden`}
          style={{ background: `linear-gradient(135deg, ${GLOBAL_COLORS.primary}, ${GLOBAL_COLORS.secondary})` }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 text-[120px] select-none">{examMetadata.icon}</div>
          </div>

          {/* Back button */}
          <button
            onClick={onBack}
            className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mb-5 cursor-pointer hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          {/* Exam meta */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">
                Entrance Coaching
              </span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{examMetadata.icon}</span>
              <h1 className="text-white text-2xl font-extrabold leading-tight">{examMetadata.name}</h1>
            </div>
            <p className="text-white/75 text-sm mb-4">{info.tagline}</p>
            <div className="flex items-center gap-4">
              <DifficultyStars level={info.difficultyLevel} />
              {avgRating > 0 && (
                <div className="flex items-center gap-1 text-xs font-bold text-yellow-300">
                  <Star className="w-3.5 h-3.5 fill-yellow-300" />
                  <span>{avgRating} ({examFeedbacks.length} Reviews)</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── Content ─────────────────────────────────────────────────────────── */}
        <div className="p-5 space-y-5">
          {/* Countdown */}
          <ExamCountdownWidget
            examDate={info.nextExamDate}
            examName={examMetadata.name}
            accentColor={`text-[${theme.primary}]`}
          />

          {/* Overview */}
          <Section icon={<Info className="w-4 h-4" />} title="Overview" color="text-blue-500" bg="bg-blue-50">
            <p className="text-sm text-neutral-600 leading-relaxed">{info.overview}</p>
          </Section>

          {/* Eligibility */}
          {info.eligibility && info.eligibility.length > 0 && (
            <Section icon={<CheckCircle className="w-4 h-4" />} title="Eligibility Criteria" color="text-green-500" bg="bg-green-50">
              <ul className="space-y-2">
                {info.eligibility.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 flex-shrink-0" />
                    <span className="text-sm text-neutral-600">{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Exam Pattern */}
          {info.examPattern && info.examPattern.length > 0 && (
            <Section icon={<ListOrdered className="w-4 h-4" />} title="Exam Pattern" color="text-purple-500" bg="bg-purple-50">
              <div className="space-y-2.5">
                {info.examPattern.map((section: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-neutral-50 border border-neutral-100 rounded-xl p-3"
                  >
                    <p className="text-xs font-bold text-foreground mb-1.5">{section.section}</p>
                    <div className="flex gap-4">
                      <Stat label="Questions" value={section.questions} />
                      <Stat label="Marks" value={section.marks} />
                      <Stat label="Duration" value={section.duration} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </Section>
          )}

          {/* Syllabus Topics */}
          {info.syllabusTopics && info.syllabusTopics.length > 0 && (
            <Section icon={<BookOpen className="w-4 h-4" />} title="Syllabus Highlights" color="text-orange-500" bg="bg-orange-50">
              <div className="flex flex-wrap gap-2">
                {info.syllabusTopics.map((topic: string) => (
                  <span
                    key={topic}
                    className="px-3 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-full text-xs font-semibold"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Career Opportunities */}
          {info.careerOpportunities && info.careerOpportunities.length > 0 && (
            <Section icon={<Briefcase className="w-4 h-4" />} title="Career Opportunities" color="text-teal-500" bg="bg-teal-50">
              <div className="space-y-2">
                {info.careerOpportunities.map((career: string, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-teal-500">✦</span>
                    <span className="text-sm text-neutral-600">{career}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── User Feedback & Ratings Section ─────────────────────────────────── */}
          <Section icon={<Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />} title="Student Reviews & Feedback" color="text-yellow-600" bg="bg-yellow-50/50">
            {formSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-bold mb-4">
                Thank you! Your feedback has been published in real-time.
              </div>
            )}

            <form onSubmit={handleSubmitFeedback} className="space-y-3 mb-6 bg-slate-50/50 border rounded-2xl p-4">
              <span className="block text-xs font-bold text-slate-500">Leave Your Rating</span>
              <div className="flex items-center gap-1.5 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    className="cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-neutral-300"}`}
                    />
                  </button>
                ))}
              </div>
              <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs bg-white focus:outline-none"
                />
              </div>
              <div className="relative">
                <textarea
                  required
                  placeholder="Share your exam preparation experience, stars rating, and feedback..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs bg-white focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-750 flex items-center justify-center gap-1 cursor-pointer"
              >
                Submit Feedback <Send className="w-3 h-3" />
              </button>
            </form>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {examFeedbacks.length === 0 ? (
                <p className="text-xs text-neutral-400 italic text-center py-4">No student reviews published yet. Be the first to leave feedback!</p>
              ) : (
                examFeedbacks.map((f, i) => (
                  <div key={f.id || i} className="border-b last:border-0 pb-3 last:pb-0 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold flex items-center gap-1 text-slate-600"><User className="w-3.5 h-3.5" /> {f.user_email}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star key={idx} className={`w-3 h-3 ${idx < f.rating ? "text-yellow-400 fill-yellow-400" : "text-neutral-200"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-neutral-500 italic">"{f.review_text}"</p>
                    <span className="block text-[9px] text-neutral-400 font-mono text-right">{new Date(f.created_at || f.createdAt).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          </Section>
        </div>

        {/* ── Sticky CTA ───────────────────────────────────────────────────────── */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-neutral-100 z-50">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold text-sm cursor-pointer shadow-lg"
            style={{ background: `linear-gradient(135deg, ${GLOBAL_COLORS.primary}, ${GLOBAL_COLORS.secondary})` }}
          >
            Start Preparation
            <ArrowRight className="w-4 h-4" />
          </motion.button>
          <p className="text-center text-[10px] text-neutral-400 mt-2">
            Your progress is saved automatically
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Helper Components ──────────────────────────────────────────────────────────
const Section: React.FC<{
  icon: React.ReactNode;
  title: string;
  color: string;
  bg: string;
  children: React.ReactNode;
}> = ({ icon, title, color, bg, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white border border-neutral-100 rounded-[1.5rem] p-5 shadow-xs"
  >
    <div className="flex items-center gap-2 mb-4">
      <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
    </div>
    {children}
  </motion.div>
);

const Stat: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div>
    <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wide">{label}</p>
    <p className="text-sm font-bold text-foreground">{value}</p>
  </div>
);
export default ExamInfoScreen;
