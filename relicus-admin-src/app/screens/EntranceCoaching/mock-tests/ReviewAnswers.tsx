import React from "react";
import { ArrowLeft, Check, X, AlertCircle } from "lucide-react";
import { MockTest, TestAttempt } from "../types/test.types";

interface ReviewAnswersProps {
  test: MockTest;
  attempt: TestAttempt;
  onBack: () => void;
}

export const ReviewAnswers: React.FC<ReviewAnswersProps> = React.memo(({
  test,
  attempt,
  onBack,
}) => {
  return (
    <div className="p-6 space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={onBack}
          className="w-9 h-9 bg-neutral-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-neutral-250 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h3 className="text-base font-extrabold text-foreground leading-tight">
          Review Answers
        </h3>
      </div>

      {/* Questions list */}
      <div className="space-y-6">
        {test.questions.map((q, qIdx) => {
          const userAns = attempt.answers[qIdx];
          const isCorrect = userAns === q.correctAnswer;
          const isSkipped = userAns === null || userAns === undefined;

          return (
            <div
              key={q.id}
              className={`p-5 border bg-white rounded-[2rem] shadow-xs space-y-4 ${
                isSkipped
                  ? "border-neutral-150"
                  : isCorrect
                  ? "border-green-200"
                  : "border-red-200"
              }`}
            >
              {/* Question Index Badge */}
              <div className="flex justify-between items-center flex-wrap gap-2">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Question {qIdx + 1}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                  isSkipped
                    ? "bg-neutral-50 text-neutral-500"
                    : isCorrect
                    ? "bg-green-50 text-success"
                    : "bg-red-50 text-[#D9534F]"
                }`}>
                  {isSkipped ? "Skipped" : isCorrect ? "Correct (+4)" : "Incorrect (-1)"}
                </span>
              </div>

              {/* Question content */}
              <p className="text-xs font-bold text-foreground leading-relaxed">
                {q.question}
              </p>

              {/* Options */}
              <div className="space-y-2.5">
                {q.options.map((opt, oIdx) => {
                  const isCorrectAnswer = oIdx === q.correctAnswer;
                  const isUserSelection = oIdx === userAns;

                  let optStyle = "border-neutral-100 bg-neutral-50/20";
                  let marker = null;

                  if (isCorrectAnswer) {
                    optStyle = "border-green-200 bg-green-50 text-green-700 font-semibold";
                    marker = <Check className="w-3.5 h-3.5 text-success shrink-0" />;
                  } else if (isUserSelection) {
                    optStyle = "border-red-200 bg-red-50 text-red-700 font-semibold";
                    marker = <X className="w-3.5 h-3.5 text-[#D9534F] shrink-0" />;
                  } else {
                    optStyle = "border-neutral-100 bg-white/20 text-neutral-400 opacity-60";
                  }

                  return (
                    <div
                      key={oIdx}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-xs leading-snug ${optStyle}`}
                    >
                      <span className="pr-3">{opt}</span>
                      {marker}
                    </div>
                  );
                })}
              </div>

              {/* Explanation block */}
              <div className="bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100/50 text-[11px] leading-relaxed">
                <h5 className="font-bold text-foreground flex items-center gap-1.5 mb-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-primary" /> Explanation & Solution:
                </h5>
                <p className="text-neutral-500">{q.explanation}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

ReviewAnswers.displayName = "ReviewAnswers";
