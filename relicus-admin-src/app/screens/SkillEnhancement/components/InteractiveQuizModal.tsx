import React, { useState, useEffect } from "react";
import { X, CheckCircle2, AlertTriangle, ChevronRight, Award, Clock, Sparkles } from "lucide-react";
import { Button } from "../../../components/Button";
import { Question } from "../store/skills.store";

interface InteractiveQuizModalProps {
  title: string;
  questions: Question[];
  onClose: () => void;
  onFinish?: (score: number) => void;
}

export const InteractiveQuizModal: React.FC<InteractiveQuizModalProps> = ({
  title,
  questions,
  onClose,
  onFinish
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsedTimeStr, setElapsedTimeStr] = useState("");

  const activeQuestion = questions[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswered) return;
    setIsAnswered(true);

    if (selectedOption === activeQuestion.correctAnswerIndex) {
      setCorrectAnswersCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Calculate time taken
      const diffMs = Date.now() - startTime;
      const secs = Math.floor(diffMs / 1000);
      const mins = Math.floor(secs / 60);
      const remainingSecs = secs % 60;
      setElapsedTimeStr(mins > 0 ? `${mins}m ${remainingSecs}s` : `${remainingSecs}s`);
      setQuizFinished(true);

      const finalScorePercent = Math.round((correctAnswersCount / questions.length) * 100);
      if (onFinish) {
        onFinish(finalScorePercent);
      }
    }
  };

  const getAccuracy = () => {
    return Math.round((correctAnswersCount / questions.length) * 100);
  };

  const getSuggestions = (accuracy: number) => {
    if (accuracy >= 90) {
      return "Fantastic work! You have a solid grasp of this topic. You are ready to move on to the next module.";
    } else if (accuracy >= 70) {
      return "Good job! Consider reviewing the lessons and notes for incorrect answers to fully master the concepts.";
    } else {
      return "We recommend re-watching the video lectures and notes for this module before retrying the assessment.";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-neutral-50 rounded-[2.5rem] w-full max-w-lg overflow-hidden border border-neutral-100 shadow-2xl relative flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex justify-between items-center bg-white shrink-0">
          <div className="min-w-0 pr-4">
            <span className="text-[9px] font-extrabold text-[#8FBDD7] uppercase tracking-widest block mb-0.5">
              Interactive Quiz Session
            </span>
            <h4 className="font-bold text-foreground text-sm truncate">{title}</h4>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-700 rounded-xl transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Box */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!quizFinished ? (
            <>
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-neutral-400">
                  <span>Question {currentIdx + 1} of {questions.length}</span>
                  <span>{Math.round(((currentIdx + 1) / questions.length) * 100)}% Complete</span>
                </div>
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#1C4966] to-[#5F8B70] transition-all duration-300"
                    style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Text */}
              <div className="bg-white p-5 rounded-[1.75rem] border border-neutral-100 shadow-xs">
                <h5 className="font-extrabold text-foreground text-sm leading-relaxed">
                  {activeQuestion.question}
                </h5>
              </div>

              {/* Options List */}
              <div className="space-y-2.5">
                {activeQuestion.options.map((option, idx) => {
                  let borderClass = "border-neutral-100 bg-white hover:border-neutral-300";
                  let badgeText = "";

                  if (selectedOption === idx) {
                    borderClass = "border-[#1C4966] bg-[#1C4966]/5";
                  }

                  if (isAnswered) {
                    if (idx === activeQuestion.correctAnswerIndex) {
                      borderClass = "border-[#5F8B70] bg-[#5F8B70]/10 text-[#5F8B70] font-semibold";
                      badgeText = "Correct";
                    } else if (selectedOption === idx) {
                      borderClass = "border-red-500 bg-red-50 text-red-500 font-semibold";
                      badgeText = "Incorrect";
                    } else {
                      borderClass = "border-neutral-100 bg-neutral-100/50 text-neutral-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-4 rounded-[1.25rem] border text-left text-xs font-medium transition-all flex justify-between items-center ${borderClass} ${
                        !isAnswered ? "cursor-pointer active:scale-[0.99]" : ""
                      }`}
                    >
                      <span className="pr-4">{option}</span>
                      {badgeText && (
                        <span
                          className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            badgeText === "Correct" ? "bg-[#5F8B70]/20 text-[#5F8B70]" : "bg-red-100 text-red-600"
                          }`}
                        >
                          {badgeText}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant Explanation Panel */}
              {isAnswered && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-[1.75rem] p-5 space-y-2">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Concept Explanation</span>
                  </div>
                  <p className="text-xs text-blue-900 leading-relaxed font-medium">
                    {activeQuestion.explanation}
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Quiz Completed Scorecard Summary */
            <div className="space-y-6 py-4">
              <div className="text-center space-y-2">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 text-amber-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-md">
                  <Award className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-black text-foreground">Assessment Completed!</h4>
                <p className="text-xs text-muted-foreground">Here is your scoring scorecard and analytics breakdown</p>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border border-neutral-100 rounded-2xl p-4 text-center">
                  <span className="text-[8px] font-extrabold text-neutral-400 uppercase tracking-widest block mb-1">
                    Score Obtained
                  </span>
                  <span className="text-sm font-black text-[#1C4966]">
                    {correctAnswersCount} / {questions.length}
                  </span>
                </div>
                <div className="bg-white border border-neutral-100 rounded-2xl p-4 text-center">
                  <span className="text-[8px] font-extrabold text-neutral-400 uppercase tracking-widest block mb-1">
                    Accuracy Rate
                  </span>
                  <span className="text-sm font-black text-[#5F8B70]">{getAccuracy()}%</span>
                </div>
                <div className="bg-white border border-neutral-100 rounded-2xl p-4 text-center">
                  <span className="text-[8px] font-extrabold text-neutral-400 uppercase tracking-widest block mb-1">
                    Time Elapsed
                  </span>
                  <span className="text-sm font-black text-primary flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {elapsedTimeStr}
                  </span>
                </div>
              </div>

              {/* Suggestions */}
              <div className="bg-white border border-neutral-100 rounded-[1.75rem] p-5 space-y-2">
                <h5 className="text-[10px] font-extrabold text-foreground uppercase tracking-wider">
                  Improvement Suggestions
                </h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {getSuggestions(getAccuracy())}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-white flex justify-end gap-2 shrink-0">
          {!quizFinished ? (
            !isAnswered ? (
              <Button
                disabled={selectedOption === null}
                onClick={handleSubmitAnswer}
                className="w-full rounded-full"
              >
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNext} className="w-full rounded-full flex items-center justify-center gap-1">
                {currentIdx < questions.length - 1 ? (
                  <>Next Question <ChevronRight className="w-4 h-4" /></>
                ) : (
                  "Finish Quiz"
                )}
              </Button>
            )
          ) : (
            <Button onClick={onClose} className="w-full rounded-full">
              Back to Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
