import React from "react";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { KnowNextView } from "../../types/knowNext.types";
import { INDUSTRIES } from "../../constants/industries";
import { IndustryCard } from "../../components/IndustryCard";

interface IndustryInsightsProps {
  onNavigate: (view: KnowNextView, context?: Record<string, string>) => void;
  onBack: () => void;
}

export const IndustryInsights: React.FC<IndustryInsightsProps> = ({ onNavigate, onBack }) => {
  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-28">
      <div className="bg-gradient-to-br from-teal-600 to-cyan-700 px-5 pt-5 pb-12 rounded-b-[2.5rem]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center cursor-pointer">
            <ArrowLeft className="w-4.5 h-4.5 text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-base">Industry Insights</h1>
            <p className="text-white/70 text-[10px]">{INDUSTRIES.length} industries · Market trends 2020–2025</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {INDUSTRIES.slice(0, 2).map((ind) => (
            <div key={ind.id} className="bg-white/10 rounded-2xl p-3">
              <span className="text-2xl">{ind.icon}</span>
              <p className="text-white text-xs font-bold mt-1">{ind.name}</p>
              <p className="text-white/70 text-[10px]">📈 {ind.growthPercent}% growth</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        {INDUSTRIES.map((industry, i) => (
          <motion.div key={industry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <IndustryCard industry={industry} onSelect={(ind) => onNavigate("marketTrends", { industryId: ind.id })} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
