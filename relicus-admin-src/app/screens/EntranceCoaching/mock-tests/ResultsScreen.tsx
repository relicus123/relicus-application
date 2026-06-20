import React from "react";
import { Award, Clock, Target, Users, BookOpen, AlertTriangle, ArrowRight, RotateCcw } from "lucide-react";
import { TestAttempt } from "../types/test.types";
import { formatDuration } from "../utils/formatting";

interface ResultsScreenProps {
  attempt: TestAttempt;
  onReview: () => void;
  onClose: () => void;
  onReattempt: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = React.memo(({
  attempt,
  onReview,
  onClose,
  onReattempt,
}) => {
  return (
    <div className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="text-center p-5 bg-gradient-to-br from-[#1C4966] to-[#5F8B70] rounded-[2rem] text-white">
        <span className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
          <Award className="w-6 h-6 text-white" />
        </span>
        <h3 className="font-extrabold text-base leading-tight">Assessment Completed</h3>
        <p className="text-[10px] text-white/70 mt-1">{attempt.testName}</p>

        {/* Big Score */}
        <div className="my-5">
          <h2 className="text-5xl font-extrabold text-white leading-none">
            {attempt.score}<span className="text-xl font-medium text-white/60">/{attempt.maxScore}</span>
          </h2>
          <span className="text-[10px] uppercase font-bold tracking-wider text-white/80 block mt-2">
            Marks Obtained
          </span>
        </div>

        {/* Split basic stats */}
        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 mt-2">
          <div className="text-center">
            <p className="text-lg font-bold text-white leading-none">{attempt.accuracy}%</p>
            <p className="text-[9px] uppercase tracking-wide text-white/60 mt-1">Accuracy</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white leading-none">{formatDuration(attempt.timeTaken)}</p>
            <p className="text-[9px] uppercase tracking-wide text-white/60 mt-1">Time Spent</p>
          </div>
        </div>
      </div>

      {/* Ranks & Competitors cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Predicted Rank */}
        <div className="p-4 bg-white border border-neutral-100 rounded-[2rem] shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Predicted Rank</p>
            <h5 className="text-sm font-extrabold text-foreground">#{attempt.rank}</h5>
          </div>
        </div>

        {/* Percentile */}
        <div className="p-4 bg-white border border-neutral-100 rounded-[2rem] shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Percentile</p>
            <h5 className="text-sm font-extrabold text-foreground">{attempt.percentile}%</h5>
          </div>
        </div>
      </div>

      {/* Answer counts list */}
      <div className="bg-white border border-neutral-100 rounded-[2rem] p-5 shadow-xs space-y-4">
        <h4 className="font-extrabold text-foreground text-sm flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" /> Questions Summary
        </h4>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 bg-green-50 border border-green-100/50 rounded-2xl">
            <p className="text-base font-extrabold text-green-700 leading-none">{attempt.correctCount}</p>
            <p className="text-[9px] font-bold text-green-600 uppercase tracking-wide mt-1">Correct</p>
          </div>
          <div className="p-3 bg-red-50 border border-red-100/50 rounded-2xl">
            <p className="text-base font-extrabold text-[#D9534F] leading-none">{attempt.incorrectCount}</p>
            <p className="text-[9px] font-bold text-[#D9534F] uppercase tracking-wide mt-1">Incorrect</p>
          </div>
          <div className="p-3 bg-neutral-50 border border-neutral-100/50 rounded-2xl">
            <p className="text-base font-extrabold text-neutral-500 leading-none">{attempt.unattemptedCount}</p>
            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide mt-1">Skipped</p>
          </div>
        </div>
      </div>

      {/* Topic Mastery Analysis */}
      {attempt.topicAnalysis.length > 0 && (
        <div className="bg-white border border-neutral-100 rounded-[2rem] p-5 shadow-xs space-y-3">
          <h4 className="font-extrabold text-foreground text-sm">Topic Performance</h4>
          <div className="space-y-2.5">
            {attempt.topicAnalysis.map((topic, index) => {
              const accuracy = topic.total > 0 ? Math.round((topic.correct / topic.total) * 100) : 0;
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-neutral-700">{topic.topic}</span>
                    <span className="text-neutral-400">
                      {topic.correct}/{topic.total} correct ({accuracy}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-neutral-150 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${accuracy >= 80 ? "bg-green-500" : accuracy >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                      style={{ width: `${accuracy}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-3 pt-2">
        <button
          onClick={onReview}
          className="w-full flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-white bg-primary rounded-full hover:bg-primary/95 shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          Review Answers & Explanations <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex gap-3">
          <button
            onClick={onReattempt}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-primary hover:bg-neutral-50 border border-neutral-150 rounded-full transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Reattempt
          </button>
          
          <button
            onClick={onClose}
            className="flex-1 py-3 text-xs font-bold text-neutral-500 hover:bg-neutral-50 border border-neutral-150 rounded-full transition-colors cursor-pointer"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
});

ResultsScreen.displayName = "ResultsScreen";
