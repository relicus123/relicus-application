import React, { useMemo } from "react";
import { motion } from "motion/react";
import { Zap, Star, BookOpen, ClipboardList } from "lucide-react";
import { ExamType } from "../types/exam.types";
import { getExamDataset } from "../data/examRegistry";

interface ResourceCard {
  icon: React.ReactNode;
  label: string;
  title: string;
  badge?: string;
  color: string;
  bgColor: string;
}

interface RecommendedResourcesWidgetProps {
  examType: ExamType;
}

export const RecommendedResourcesWidget: React.FC<RecommendedResourcesWidgetProps> = ({
  examType,
}) => {
  const { chapters, mockTests } = useMemo(() => getExamDataset(examType), [examType]);

  const resources = useMemo((): ResourceCard[] => {
    const cards: ResourceCard[] = [];

    // Top 2 chapters as "High-Weightage"
    const topChapters = chapters.slice(0, 2);
    topChapters.forEach((ch) => {
      cards.push({
        icon: <BookOpen className="w-4 h-4" />,
        label: "High Weightage",
        title: ch.name.length > 32 ? ch.name.substring(0, 32) + "…" : ch.name,
        badge: "📈 Important",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      });
    });

    // First mock test as recommended
    if (mockTests.length > 0) {
      cards.push({
        icon: <ClipboardList className="w-4 h-4" />,
        label: "Recommended Test",
        title:
          mockTests[0].name.length > 32
            ? mockTests[0].name.substring(0, 32) + "…"
            : mockTests[0].name,
        badge: "⚡ Must Attempt",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      });
    }

    // Frequently asked (static per exam)
    cards.push({
      icon: <Star className="w-4 h-4" />,
      label: "Frequently Asked",
      title: getFrequentlyAskedTopic(examType),
      badge: "🔥 PYQ Trend",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    });

    // Flash revision tip
    cards.push({
      icon: <Zap className="w-4 h-4" />,
      label: "Quick Revision",
      title: "Solve last 5 years PYQs in one sitting",
      badge: "💡 Pro Tip",
      color: "text-green-600",
      bgColor: "bg-green-50",
    });

    return cards;
  }, [examType, chapters, mockTests]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-3 px-1">
        🎯 Recommended Resources
      </h4>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {resources.map((res, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`flex-shrink-0 w-44 ${res.bgColor} border border-white rounded-[1.25rem] p-4 cursor-pointer hover:shadow-sm transition-shadow`}
          >
            <div className={`${res.color} mb-2`}>{res.icon}</div>
            <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider mb-1">
              {res.label}
            </p>
            <p className="text-xs font-bold text-foreground leading-snug mb-2">{res.title}</p>
            {res.badge && (
              <span className="text-[9px] font-semibold text-neutral-500">{res.badge}</span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

function getFrequentlyAskedTopic(examType: ExamType): string {
  const map: Record<ExamType, string> = {
    JEE: "Calculus & Integral Equations",
    NEET: "Human Physiology (Ch 17-22)",
    CUET: "Logical Reasoning Patterns",
    "UGC-NET": "Teaching Aptitude & ICT",
    GATE: "Data Structures & Algorithms",
    EAMCET: "Coordinate Geometry",
    ICET: "Analytical Ability — Series",
  };
  return map[examType] ?? "Previous Year Questions";
}
