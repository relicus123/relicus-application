import React from "react";
import { ChevronRight, Play, FileText, CheckCircle2 } from "lucide-react";

interface ChapterCardProps {
  name: string;
  progress: number;
  videosCount: number;
  notesCount: number;
  onClick: () => void;
}

export const ChapterCard: React.FC<ChapterCardProps> = React.memo(({
  name,
  progress,
  videosCount,
  notesCount,
  onClick,
}) => {
  const isCompleted = progress === 100;

  return (
    <div
      onClick={onClick}
      className="p-4 bg-white border border-neutral-100 rounded-[2rem] hover:shadow-md transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-foreground text-sm leading-tight truncate mb-1 group-hover:text-primary transition-colors">
            {name}
          </h4>
          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <span className="flex items-center gap-1">
              <Play className="w-3.5 h-3.5" /> {videosCount} Videos
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> {notesCount} Notes
            </span>
          </div>
        </div>
        <div className="shrink-0 pt-0.5">
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-success" />
          ) : (
            <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
          )}
        </div>
      </div>
      
      {/* Mini Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-semibold text-neutral-400">
          <span>Completion</span>
          <span className="text-foreground">{progress}%</span>
        </div>
        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-secondary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
});

ChapterCard.displayName = "ChapterCard";
