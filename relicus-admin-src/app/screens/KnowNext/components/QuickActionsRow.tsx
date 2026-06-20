import React from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { TrendingUp, Building2, Award, BookOpen, GraduationCap } from "lucide-react";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  onClick: () => void;
}

interface QuickActionsRowProps {
  onContinueRoadmap?: () => void;
  onExploreColleges?: () => void;
  onFindScholarships?: () => void;
  onLearnSkills?: () => void;
  onPrepareExams?: () => void;
  className?: string;
}

export const QuickActionsRow: React.FC<QuickActionsRowProps> = ({
  onContinueRoadmap,
  onExploreColleges,
  onFindScholarships,
  onLearnSkills,
  onPrepareExams,
  className = "",
}) => {
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      id: "roadmap",
      label: "Continue\nRoadmap",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-purple-600",
      bg: "bg-purple-50 border-purple-100",
      onClick: onContinueRoadmap ?? (() => {}),
    },
    {
      id: "colleges",
      label: "Explore\nColleges",
      icon: <Building2 className="w-5 h-5" />,
      color: "text-green-600",
      bg: "bg-green-50 border-green-100",
      onClick: onExploreColleges ?? (() => {}),
    },
    {
      id: "scholarships",
      label: "Find\nScholarships",
      icon: <Award className="w-5 h-5" />,
      color: "text-orange-600",
      bg: "bg-orange-50 border-orange-100",
      onClick: onFindScholarships ?? (() => {}),
    },
    {
      id: "skills",
      label: "Learn\nSkills",
      icon: <BookOpen className="w-5 h-5" />,
      color: "text-blue-600",
      bg: "bg-blue-50 border-blue-100",
      onClick: onLearnSkills ?? (() => navigate("/app/skills")),
    },
    {
      id: "exams",
      label: "Prep\nExams",
      icon: <GraduationCap className="w-5 h-5" />,
      color: "text-teal-600",
      bg: "bg-teal-50 border-teal-100",
      onClick: onPrepareExams ?? (() => navigate("/app/coaching")),
    },
  ];

  return (
    <div className={`flex gap-2 overflow-x-auto pb-1 scrollbar-hide ${className}`}>
      {actions.map((action) => (
        <motion.button
          key={action.id}
          whileTap={{ scale: 0.93 }}
          onClick={action.onClick}
          className={`shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all duration-200 hover:shadow-sm cursor-pointer min-w-[72px] ${action.bg} ${action.color}`}
        >
          {action.icon}
          <span className="text-[9px] font-bold text-center leading-tight whitespace-pre-line">
            {action.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
};
