import React from "react";
import { AlertCircle, Clock, Clipboard, ArrowLeft, ArrowRight } from "lucide-react";
import { MockTest } from "../types/test.types";
import { formatDuration } from "../utils/formatting";

interface TestInstructionsProps {
  test: MockTest;
  onBack: () => void;
  onStart: () => void;
}

export const TestInstructions: React.FC<TestInstructionsProps> = React.memo(({
  test,
  onBack,
  onStart,
}) => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button
          onClick={onBack}
          className="w-9 h-9 bg-neutral-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-neutral-250 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h3 className="text-base font-extrabold text-foreground leading-tight">
          Test Instructions
        </h3>
      </div>

      {/* Info card */}
      <div className="p-5 bg-white border border-neutral-100 rounded-[2rem] shadow-xs space-y-4">
        <h4 className="font-extrabold text-foreground text-base leading-tight">
          {test.name}
        </h4>
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 font-semibold uppercase">Duration</p>
              <p className="text-sm font-bold text-foreground">{formatDuration(test.duration)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <Clipboard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-400 font-semibold uppercase">Questions</p>
              <p className="text-sm font-bold text-foreground">{test.questionsCount} items</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rules list */}
      <div className="bg-neutral-50/50 p-5 border border-neutral-100/50 rounded-[2rem] space-y-4">
        <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-primary" /> Marking Scheme & Rules
        </h4>
        
        <ul className="space-y-3 text-xs text-neutral-500 leading-relaxed pl-1 list-disc list-inside">
          <li>
            Each correct answer awards <span className="font-bold text-success">+4 marks</span>.
          </li>
          <li>
            Each incorrect answer deducts <span className="font-bold text-[#D9534F]">-1 mark</span> (negative marking).
          </li>
          <li>
            No marks are awarded or deducted for unattempted questions.
          </li>
          <li>
            Once you click <strong>Submit</strong>, the test will end and you will receive your scorecard.
          </li>
          <li>
            Ensure a stable internet connection. Do not close or refresh the screen while testing.
          </li>
        </ul>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onStart}
          className="flex items-center gap-1.5 px-6 py-3 text-xs font-bold text-white bg-primary rounded-full hover:bg-primary/95 transition-all cursor-pointer shadow-xs hover:shadow-md"
        >
          Start Assessment <ArrowRight className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
});

TestInstructions.displayName = "TestInstructions";
