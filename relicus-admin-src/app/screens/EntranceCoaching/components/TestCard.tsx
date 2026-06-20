import React from "react";
import { Award, Clock, FileText, ArrowRight, RotateCcw } from "lucide-react";
import { formatDuration } from "../utils/formatting";

interface TestCardProps {
  name: string;
  duration: number; // in seconds
  questionsCount: number;
  attempted: boolean;
  score?: number;
  maxScore?: number;
  accuracy?: number;
  onStart: () => void;
  onReattempt?: () => void;
  onViewResults?: () => void;
}

export const TestCard: React.FC<TestCardProps> = React.memo(({
  name,
  duration,
  questionsCount,
  attempted,
  score,
  maxScore,
  accuracy,
  onStart,
  onReattempt,
  onViewResults,
}) => {
  return (
    <div
      className={`p-5 border rounded-[2rem] bg-white transition-all duration-300 ${
        attempted
          ? "border-neutral-100/80 shadow-xs"
          : "border-primary/15 shadow-sm hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-foreground text-base leading-tight truncate mb-1.5">
            {name}
          </h4>
          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {formatDuration(duration)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> {questionsCount} Questions
            </span>
          </div>
        </div>

        {attempted && accuracy !== undefined && (
          <div
            onClick={onViewResults}
            className="flex items-center gap-1 bg-green-50 border border-green-100 text-[#5CB85C] px-3 py-1 rounded-full text-xs font-bold cursor-pointer hover:bg-green-100/50 transition-colors shrink-0"
          >
            <Award className="w-4 h-4" />
            <span>{accuracy}% Acc</span>
          </div>
        )}
      </div>

      {attempted ? (
        <div className="flex items-center justify-between pt-2 border-t border-neutral-50 mt-2">
          <div className="text-xs text-neutral-400">
            Best Score: <span className="font-bold text-foreground">{score}/{maxScore}</span>
          </div>
          <div className="flex gap-2">
            {onViewResults && (
              <button
                onClick={onViewResults}
                className="px-3 py-1.5 text-xs font-bold text-primary hover:bg-neutral-50 border border-neutral-100 rounded-full transition-colors cursor-pointer"
              >
                Review
              </button>
            )}
            {onReattempt && (
              <button
                onClick={onReattempt}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-primary rounded-full hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reattempt
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex justify-end mt-2">
          <button
            onClick={onStart}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-primary rounded-full hover:bg-primary/95 hover:translate-x-0.5 transition-all cursor-pointer"
          >
            Start Test <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
});

TestCard.displayName = "TestCard";
