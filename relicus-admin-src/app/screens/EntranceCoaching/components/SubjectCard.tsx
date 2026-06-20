import React from "react";
import { ChevronRight } from "lucide-react";
import { ProgressRing } from "./ProgressRing";

interface SubjectCardProps {
  name: string;
  icon: string;
  progress: number;
  chaptersCount: number;
  mockTestsCount: number;
  color: string;
  onClick: () => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = React.memo(({
  name,
  icon,
  progress,
  chaptersCount,
  mockTestsCount,
  color,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 bg-white border border-neutral-100 rounded-[2rem] hover:shadow-md transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center text-3xl shadow-sm shrink-0 transition-transform duration-300 group-hover:scale-105`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-foreground text-[16px] truncate leading-tight mb-1 group-hover:text-primary transition-colors">
            {name}
          </h4>
          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <span>{chaptersCount} Chapters</span>
            <span>•</span>
            <span>{mockTestsCount} Tests</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 pl-2">
        <ProgressRing progress={progress} size={42} strokeWidth={4.5} />
        <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
      </div>
    </div>
  );
});

SubjectCard.displayName = "SubjectCard";
