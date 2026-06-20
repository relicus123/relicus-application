import React, { useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Video, HelpCircle, ClipboardList, BookOpen, Check } from "lucide-react";
import { useCoachingStore } from "../store/coaching.store";
import { ExamType } from "../types/exam.types";

interface DailyTask {
  key: string;
  label: string;
  target: string;
  icon: React.ReactNode;
  color: string;
}

const DAILY_TASKS: DailyTask[] = [
  {
    key: "videos",
    label: "Watch Lectures",
    target: "2 Videos",
    icon: <Video className="w-4 h-4" />,
    color: "text-blue-500",
  },
  {
    key: "questions",
    label: "Solve Questions",
    target: "20 Questions",
    icon: <HelpCircle className="w-4 h-4" />,
    color: "text-green-500",
  },
  {
    key: "quiz",
    label: "Complete a Quiz",
    target: "1 Quiz",
    icon: <ClipboardList className="w-4 h-4" />,
    color: "text-orange-500",
  },
  {
    key: "revision",
    label: "Revise a Chapter",
    target: "1 Chapter",
    icon: <BookOpen className="w-4 h-4" />,
    color: "text-purple-500",
  },
];

interface DailyStudyPlanWidgetProps {
  examType: ExamType;
}

export const DailyStudyPlanWidget: React.FC<DailyStudyPlanWidgetProps> = ({ examType }) => {
  const { dailyPlanChecks, dailyPlanDate, setDailyPlanCheck, resetDailyPlan } =
    useCoachingStore();

  // Auto-reset when date changes
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (dailyPlanDate !== todayStr) {
      resetDailyPlan(todayStr);
    }
  }, [dailyPlanDate, todayStr, resetDailyPlan]);

  const handleToggle = useCallback(
    (key: string) => {
      setDailyPlanCheck(key, !dailyPlanChecks[key]);
    },
    [dailyPlanChecks, setDailyPlanCheck]
  );

  const completedCount = DAILY_TASKS.filter((t) => dailyPlanChecks[t.key]).length;
  const progressPct = Math.round((completedCount / DAILY_TASKS.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white border border-neutral-100 rounded-[1.5rem] p-5 shadow-xs"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
            📅 Today's Study Plan
          </h4>
          <p className="text-[10px] text-neutral-400 mt-0.5">
            {completedCount}/{DAILY_TASKS.length} tasks completed
          </p>
        </div>
        <span className="text-sm font-extrabold text-primary">{progressPct}%</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-neutral-100 rounded-full mb-4 overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Tasks */}
      <div className="space-y-2.5">
        {DAILY_TASKS.map((task, i) => {
          const done = !!dailyPlanChecks[task.key];
          return (
            <motion.button
              key={task.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleToggle(task.key)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                done
                  ? "bg-primary/5 border-primary/20"
                  : "bg-neutral-50 border-neutral-100 hover:border-neutral-200"
              }`}
            >
              {/* Checkbox */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all duration-200 ${
                  done
                    ? "bg-primary border-primary"
                    : "border-neutral-300"
                }`}
              >
                {done && <Check className="w-3.5 h-3.5 text-white" />}
              </div>

              {/* Icon */}
              <div className={`${task.color} ${done ? "opacity-50" : ""}`}>{task.icon}</div>

              {/* Label */}
              <div className="flex-1 text-left">
                <p
                  className={`text-xs font-semibold transition-all ${
                    done ? "line-through text-neutral-400" : "text-foreground"
                  }`}
                >
                  {task.label}
                </p>
                <p className="text-[10px] text-neutral-400">{task.target}</p>
              </div>

              {done && (
                <span className="text-[9px] font-bold text-primary uppercase">Done ✓</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};
