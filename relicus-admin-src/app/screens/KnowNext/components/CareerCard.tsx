import React from "react";
import { motion } from "motion/react";
import { Career } from "../types/knowNext.types";
import { useKnowNextStore } from "../store/knowNext.store";
import { SaveButton } from "./SaveButton";
import { ArrowRight, GitCompare } from "lucide-react";

interface CareerCardProps {
  career: Career;
  onSelect: (career: Career) => void;
  showCompare?: boolean;
}

const DEMAND_COLORS: Record<Career["industryDemand"], string> = {
  "Very High": "bg-green-100 text-green-700",
  High: "bg-blue-100 text-blue-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-neutral-100 text-neutral-500",
};

export const CareerCard: React.FC<CareerCardProps> = React.memo(
  ({ career, onSelect, showCompare = true }) => {
    const { savedCareerIds, compareCareerIds, toggleSaveCareer, toggleCompareCareer, trackEvent } =
      useKnowNextStore();

    const isSaved = savedCareerIds.includes(career.id);
    const isComparing = compareCareerIds.includes(career.id);

    const handleClick = () => {
      trackEvent({ type: "view", entityType: "career", entityId: career.id });
      onSelect(career);
    };

    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className="bg-white border border-neutral-100 rounded-[2rem] p-4 shadow-xs cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#EDF5FE] to-[#F0F7FF] flex items-center justify-center text-2xl shrink-0">
              {career.icon}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-foreground leading-tight">{career.title}</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">{career.category} · {career.industry}</p>
            </div>
          </div>
          <SaveButton isSaved={isSaved} onToggle={() => toggleSaveCareer(career.id)} size="sm" />
        </div>

        {/* Tagline */}
        <p className="text-[11px] text-neutral-500 leading-relaxed mb-3 line-clamp-2">
          {career.tagline}
        </p>

        {/* Skills preview */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {career.requiredSkills.slice(0, 3).map((skill) => (
            <span key={skill} className="px-2 py-0.5 bg-neutral-50 border border-neutral-100 text-[9px] font-semibold text-neutral-500 rounded-full">
              {skill}
            </span>
          ))}
          {career.requiredSkills.length > 3 && (
            <span className="px-2 py-0.5 bg-neutral-50 text-[9px] font-semibold text-neutral-400 rounded-full">
              +{career.requiredSkills.length - 3}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${DEMAND_COLORS[career.industryDemand]}`}>
              {career.industryDemand} Demand
            </span>
            <span className="text-[10px] font-semibold text-[#5F8B70]">
              ₹{career.salaryRange.min}–{career.salaryRange.max}L
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {showCompare && (
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCompareCareer(career.id);
                }}
                className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                  isComparing
                    ? "bg-purple-600 border-purple-600 text-white"
                    : "bg-white border-neutral-200 text-neutral-400 hover:border-purple-400 hover:text-purple-500"
                }`}
                title={isComparing ? "Remove from compare" : "Add to compare"}
              >
                <GitCompare className="w-3 h-3" />
              </motion.button>
            )}
            <div className="w-7 h-7 rounded-full bg-[#1C4966] flex items-center justify-center">
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);

CareerCard.displayName = "CareerCard";
