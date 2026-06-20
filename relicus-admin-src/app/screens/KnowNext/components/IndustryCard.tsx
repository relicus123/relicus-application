import React from "react";
import { motion } from "motion/react";
import { Industry } from "../types/knowNext.types";
import { ArrowRight, TrendingUp } from "lucide-react";

interface IndustryCardProps {
  industry: Industry;
  onSelect: (industry: Industry) => void;
}

export const IndustryCard: React.FC<IndustryCardProps> = React.memo(({ industry, onSelect }) => {
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(industry)}
      className="bg-white border border-neutral-100 rounded-[2rem] p-4 shadow-xs cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center text-2xl shrink-0">
            {industry.icon}
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">{industry.name}</h4>
            <div className="flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-[11px] font-semibold text-emerald-600">{industry.growthPercent}% growth</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-[#1C4966]">₹{industry.avgSalaryLPA}L</p>
          <p className="text-[9px] text-neutral-400">avg salary</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-[11px] text-neutral-500 leading-relaxed line-clamp-2 mb-3">
        {industry.description}
      </p>

      {/* Trending careers */}
      <div className="flex flex-wrap gap-1 mb-3">
        {industry.trendingCareers.slice(0, 3).map((career) => (
          <span key={career} className="px-2 py-0.5 bg-teal-50 border border-teal-100 text-[9px] font-semibold text-teal-700 rounded-full">
            {career}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-end">
        <div className="w-7 h-7 rounded-full bg-[#0D9488] flex items-center justify-center">
          <ArrowRight className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
    </motion.div>
  );
});

IndustryCard.displayName = "IndustryCard";
