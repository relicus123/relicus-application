import React, { useMemo } from "react";
import { motion } from "motion/react";
import { Calendar, Clock } from "lucide-react";

interface ExamCountdownWidgetProps {
  examDate: string;   // ISO string, e.g. "2027-04-13"
  examName: string;
  accentColor?: string; // Tailwind text color class e.g. "text-blue-500"
}

function getDaysRemaining(isoDate: string): number {
  const target = new Date(isoDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getUrgencyLabel(days: number): { label: string; color: string } {
  if (days <= 30)  return { label: "🔥 Exam very soon!", color: "text-red-500" };
  if (days <= 90)  return { label: "⚡ Crunch time!", color: "text-orange-500" };
  if (days <= 180) return { label: "📈 Good progress window", color: "text-yellow-600" };
  return { label: "🟢 Plan ahead — start early", color: "text-green-600" };
}

function formatExamDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export const ExamCountdownWidget: React.FC<ExamCountdownWidgetProps> = ({
  examDate,
  examName,
  accentColor = "text-primary",
}) => {
  const days = useMemo(() => getDaysRemaining(examDate), [examDate]);
  const weeks = useMemo(() => Math.floor(days / 7), [days]);
  const months = useMemo(() => Math.floor(days / 30), [days]);
  const urgency = useMemo(() => getUrgencyLabel(days), [days]);
  const formattedDate = useMemo(() => formatExamDate(examDate), [examDate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-neutral-100 rounded-[1.5rem] p-5 shadow-xs"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
          <Calendar className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
            Exam Countdown
          </h4>
          <p className="text-[10px] text-neutral-400">{examName}</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { value: days,   label: "Days" },
          { value: weeks,  label: "Weeks" },
          { value: months, label: "Months" },
        ].map(({ value, label }) => (
          <motion.div
            key={label}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-neutral-50 rounded-xl p-3 text-center border border-neutral-100"
          >
            <span className={`text-2xl font-extrabold ${accentColor}`}>{value}</span>
            <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Urgency label */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold ${urgency.color}`}>{urgency.label}</span>
        <div className="flex items-center gap-1 text-neutral-400">
          <Clock className="w-3 h-3" />
          <span className="text-[10px]">{formattedDate}</span>
        </div>
      </div>
    </motion.div>
  );
};
