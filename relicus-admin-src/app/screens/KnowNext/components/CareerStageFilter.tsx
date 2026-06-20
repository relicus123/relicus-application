import React from "react";
import { motion } from "motion/react";
import { CareerStage, CAREER_STAGE_LABELS } from "../types/knowNext.types";
import { useKnowNextStore } from "../store/knowNext.store";

const STAGES: Array<CareerStage | "all"> = [
  "all",
  "after10th",
  "after12th",
  "afterGraduation",
  "workingProfessional",
];

interface CareerStageFilterProps {
  className?: string;
}

export const CareerStageFilter: React.FC<CareerStageFilterProps> = ({ className = "" }) => {
  const { activeStage, setActiveStage } = useKnowNextStore();

  return (
    <div className={`flex gap-2 overflow-x-auto pb-1 scrollbar-hide ${className}`}>
      {STAGES.map((stage) => {
        const isActive = activeStage === stage;
        return (
          <motion.button
            key={stage}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveStage(stage)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-[#1C4966] text-white border-[#1C4966]"
                : "bg-white text-neutral-500 border-neutral-200 hover:border-[#1C4966] hover:text-[#1C4966]"
            }`}
          >
            {CAREER_STAGE_LABELS[stage]}
          </motion.button>
        );
      })}
    </div>
  );
};
