import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { KnowNextView, CareerStage } from "../../types/knowNext.types";
import { SCHOLARSHIPS } from "../../constants/scholarships";
import { ScholarshipCard } from "../../components/ScholarshipCard";
import { FilterBar } from "../../components/FilterBar";
import { CareerStageFilter } from "../../components/CareerStageFilter";
import { useKnowNextStore } from "../../store/knowNext.store";

const CATEGORIES = ["All", "Merit", "Need-based", "Category", "Sports", "Research"] as const;

interface ScholarshipExplorerProps {
  onNavigate: (view: KnowNextView, context?: Record<string, string>) => void;
  onBack: () => void;
}

export const ScholarshipExplorer: React.FC<ScholarshipExplorerProps> = ({ onNavigate, onBack }) => {
  const [selectedCat, setSelectedCat] = useState("All");
  const { activeStage } = useKnowNextStore();

  const filtered = useMemo(() => {
    return SCHOLARSHIPS.filter((s) => {
      const matchesCat = selectedCat === "All" || s.category === selectedCat;
      const matchesStage = activeStage === "all" || s.applicableStages.includes(activeStage as CareerStage);
      // Show open ones first (by deadline)
      const isOpen = new Date(s.deadline) > new Date();
      return matchesCat && matchesStage && isOpen;
    }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [selectedCat, activeStage]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-28">
      <div className="bg-gradient-to-br from-orange-500 to-amber-600 px-5 pt-5 pb-12 rounded-b-[2.5rem]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center cursor-pointer">
            <ArrowLeft className="w-4.5 h-4.5 text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-base">Scholarships</h1>
            <p className="text-white/70 text-[10px]">{filtered.length} active scholarships</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 text-center">
          <p className="text-white/80 text-xs">Sorted by deadline · closest first</p>
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        <div className="bg-white rounded-2xl p-3 border border-neutral-100 shadow-sm">
          <CareerStageFilter />
        </div>
        <FilterBar options={[...CATEGORIES]} selected={selectedCat} onSelect={setSelectedCat} />
        <div className="space-y-3">
          {filtered.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}>
              <ScholarshipCard scholarship={s} onSelect={(s) => onNavigate("scholarshipDetails", { scholarshipId: s.id })} />
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-xl mb-1">🎓</p>
              <p className="text-sm text-neutral-400">No matching scholarships found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
