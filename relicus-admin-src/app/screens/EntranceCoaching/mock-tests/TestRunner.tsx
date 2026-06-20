import React, { useState, useEffect, useMemo } from "react";
import { Clock, ChevronLeft, ChevronRight, Flag, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { MockTest } from "../types/test.types";
import { formatTimeRemaining } from "../utils/dateHelpers";

interface TestRunnerProps {
  test: MockTest;
  onSubmit: (answers: (number | null)[]) => void;
}

export const TestRunner: React.FC<TestRunnerProps> = React.memo(({
  test,
  onSubmit,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(
    new Array(test.questions.length).fill(null)
  );
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(test.duration);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const currentQuestion = useMemo(() => {
    return test.questions[currentIdx];
  }, [test, currentIdx]);

  const handleSelectOption = (optIdx: number) => {
    setUserAnswers((prev) => {
      const copy = [...prev];
      copy[currentIdx] = optIdx;
      return copy;
    });
  };

  const handleToggleFlag = () => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentIdx]: !prev[currentIdx],
    }));
  };

  const handlePrevious = () => {
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  const handleNext = () => {
    if (currentIdx < test.questions.length - 1) setCurrentIdx(currentIdx + 1);
  };

  const handleSubmit = () => {
    onSubmit(userAnswers);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      {/* Top Banner with Clock & Flag */}
      <div className="bg-gradient-to-br from-primary to-secondary p-4 text-white shrink-0">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold bg-white/20 border border-white/10 px-3 py-1 rounded-full">
            {test.name}
          </span>
          <div className="flex items-center gap-1.5 bg-white/20 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-bold">
            <Clock className="w-4 h-4 text-white" />
            <span>{formatTimeRemaining(timeLeft)}</span>
          </div>
        </div>

        {/* Tracker Progress */}
        <div className="bg-white/10 border border-white/10 rounded-2xl p-4 mt-2">
          <div className="flex justify-between text-xs text-white/80 mb-2 font-semibold">
            <span>Question {currentIdx + 1} of {test.questions.length}</span>
            <span>{currentQuestion.subject}</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / test.questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Question view scrollable */}
      <div className="flex-1 p-6 overflow-y-auto">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {/* Question Text */}
          <div className="flex justify-between items-start gap-4">
            <h3 className="text-base font-extrabold text-foreground leading-relaxed flex-1">
              {currentQuestion.question}
            </h3>
            <button
              onClick={handleToggleFlag}
              className={`p-2 rounded-full border transition-colors cursor-pointer shrink-0 ${
                flaggedQuestions[currentIdx]
                  ? "bg-yellow-500/10 border-yellow-400 text-yellow-600"
                  : "border-neutral-100 hover:bg-neutral-50 text-neutral-300"
              }`}
            >
              <Flag className="w-4 h-4 fill-current" />
            </button>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((opt, optIdx) => {
              const isSelected = userAnswers[currentIdx] === optIdx;
              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border text-left text-xs transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/5 text-primary font-bold shadow-xs"
                      : "border-neutral-100 bg-white hover:border-neutral-250"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                    isSelected ? "bg-primary text-white" : "bg-neutral-50 text-neutral-400 border border-neutral-100/30"
                  }`}>
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                  <span className="leading-snug">{opt}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Bottom control pad & matrix map */}
      <div className="p-5 border-t border-neutral-100 bg-white shrink-0 space-y-4 shadow-xs">
        {/* Next/Prev Navigation */}
        <div className="flex gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentIdx === 0}
            className="flex-1 py-3 text-xs font-bold text-[#1C4966] hover:bg-neutral-50 border border-neutral-150 rounded-full transition-colors disabled:opacity-40 disabled:hover:bg-transparent flex items-center justify-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {currentIdx < test.questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex-1 py-3 text-xs font-bold text-white bg-primary rounded-full hover:bg-primary/95 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="flex-1 py-3 text-xs font-bold text-white bg-[#5CB85C] rounded-full hover:bg-[#4CA84C] transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              Submit Test
            </button>
          )}
        </div>

        {/* Quick jump matrix */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 justify-center scrollbar-none max-w-full">
          {test.questions.map((_, idx) => {
            const isAnswered = userAnswers[idx] !== null;
            const isFlagged = flaggedQuestions[idx];
            const isCurrent = idx === currentIdx;

            let badgeClass = "bg-neutral-50 text-neutral-400";
            if (isAnswered) badgeClass = "bg-[#5F8B70]/10 border border-[#5F8B70]/30 text-[#5F8B70] font-semibold";
            if (isFlagged) badgeClass = "bg-yellow-500/10 border border-yellow-400/40 text-yellow-600 font-semibold";
            if (isCurrent) badgeClass = "bg-primary text-white border border-primary font-bold";

            return (
              <button
                key={idx}
                onClick={() => setCurrentIdx(idx)}
                className={`w-8 h-8 rounded-xl text-[10px] flex items-center justify-center shrink-0 transition-all cursor-pointer ${badgeClass}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Confirmation Dialog Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-neutral-100">
            <div className="w-12 h-12 bg-yellow-100 text-[#F0AD4E] rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-foreground text-base">Submit Assessment?</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Are you sure you want to submit your answers? You still have time left to review.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-2.5 text-xs font-bold text-primary hover:bg-neutral-50 border border-neutral-150 rounded-full transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-[#5CB85C] rounded-full hover:bg-[#4CA84C] transition-colors cursor-pointer"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

TestRunner.displayName = "TestRunner";
