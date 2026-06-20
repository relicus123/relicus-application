import React, { useMemo } from "react";
import { motion } from "motion/react";
import { CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { ExamType } from "../types/exam.types";
import { Chapter } from "../types/chapter.types";
import { analyticsService } from "../services/analytics.service";
import { ProgressRing } from "./ProgressRing";

interface ExamReadinessCardProps {
  examType: ExamType;
  chapters: Chapter[];
}

export const ExamReadinessCard: React.FC<ExamReadinessCardProps> = ({ examType, chapters }) => {
  const kpis = useMemo(
    () => analyticsService.getKPIs(examType, chapters),
    [examType, chapters]
  );

  const readiness = kpis.examReadinessScore;
  const readinessColor =
    readiness >= 70 ? "text-green-500" : readiness >= 45 ? "text-orange-500" : "text-red-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-white border border-neutral-100 rounded-[1.5rem] p-5 shadow-xs"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-green-500" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
            Exam Readiness
          </h4>
          <p className="text-[10px] text-neutral-400">Based on progress & mock tests</p>
        </div>
      </div>

      {/* Ring + Score */}
      <div className="flex items-center gap-5 mb-5">
        <ProgressRing progress={readiness} size={70} strokeWidth={7} colorClass={readinessColor} />
        <div>
          <p className={`text-3xl font-extrabold leading-none ${readinessColor}`}>
            {readiness}%
          </p>
          <p className="text-xs text-neutral-500 mt-1 leading-snug max-w-[160px]">
            {readiness >= 70
              ? "You're on track! Keep the momentum."
              : readiness >= 45
              ? "Good progress. Focus on weak areas."
              : "Start your preparation journey today."}
          </p>
        </div>
      </div>

      {/* Strong Topics */}
      {kpis.strongTopics.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-wide">
              Strong Areas
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {kpis.strongTopics.map((topic) => (
              <span
                key={topic}
                className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-100 rounded-full text-[10px] font-semibold"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Weak Topics */}
      {kpis.weakTopics.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wide">
              Needs Improvement
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {kpis.weakTopics.map((topic) => (
              <span
                key={topic}
                className="px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-full text-[10px] font-semibold"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
