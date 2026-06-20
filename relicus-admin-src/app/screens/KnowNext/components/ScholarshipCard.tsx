import React from "react";
import { motion } from "motion/react";
import { Scholarship } from "../types/knowNext.types";
import { useKnowNextStore } from "../store/knowNext.store";
import { SaveButton } from "./SaveButton";
import { DeadlineCountdownBadge } from "./DeadlineCountdownBadge";
import { ArrowRight } from "lucide-react";

interface ScholarshipCardProps {
  scholarship: Scholarship;
  onSelect: (scholarship: Scholarship) => void;
}

const CATEGORY_COLORS: Record<Scholarship["category"], string> = {
  Merit: "bg-blue-100 text-blue-700",
  "Need-based": "bg-purple-100 text-purple-700",
  Category: "bg-orange-100 text-orange-700",
  Sports: "bg-green-100 text-green-700",
  Research: "bg-teal-100 text-teal-700",
};

export const ScholarshipCard: React.FC<ScholarshipCardProps> = React.memo(
  ({ scholarship, onSelect }) => {
    const { savedScholarshipIds, toggleSaveScholarship, trackEvent } = useKnowNextStore();
    const isSaved = savedScholarshipIds.includes(scholarship.id);

    const handleClick = () => {
      trackEvent({ type: "view", entityType: "scholarship", entityId: scholarship.id });
      onSelect(scholarship);
    };

    const amountFormatted =
      scholarship.amount >= 100000
        ? `₹${(scholarship.amount / 100000).toFixed(1)}L`
        : `₹${(scholarship.amount / 1000).toFixed(0)}K`;

    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className="bg-white border border-neutral-100 rounded-[2rem] p-4 shadow-xs cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0 pr-2">
            <h4 className="text-sm font-bold text-foreground leading-tight mb-0.5">{scholarship.name}</h4>
            <p className="text-[11px] text-neutral-400">{scholarship.provider}</p>
          </div>
          <SaveButton isSaved={isSaved} onToggle={() => toggleSaveScholarship(scholarship.id)} size="sm" />
        </div>

        {/* Amount + Category */}
        <div className="flex items-center gap-2 mb-3">
          <div className="px-3 py-1.5 bg-gradient-to-r from-[#1C4966]/10 to-[#5F8B70]/10 rounded-xl">
            <p className="text-sm font-bold text-[#1C4966]">{amountFormatted}</p>
            <p className="text-[9px] text-neutral-400">{scholarship.frequency}</p>
          </div>
          <div className="flex-1">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${CATEGORY_COLORS[scholarship.category]}`}>
              {scholarship.category}
            </span>
          </div>
          <DeadlineCountdownBadge deadline={scholarship.deadline} />
        </div>

        {/* Eligibility preview */}
        <p className="text-[10px] text-neutral-500 line-clamp-2 mb-3 leading-relaxed">
          {scholarship.eligibility[0]}
        </p>

        {/* Footer */}
        <div className="flex justify-end">
          <div className="w-7 h-7 rounded-full bg-[#F97316] flex items-center justify-center">
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </motion.div>
    );
  }
);

ScholarshipCard.displayName = "ScholarshipCard";
