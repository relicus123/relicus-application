import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Search } from "lucide-react";
import { KnowNextView, CareerStage } from "../../types/knowNext.types";
import { COLLEGES } from "../../constants/colleges";
import { CollegeCard } from "../../components/CollegeCard";
import { FilterBar } from "../../components/FilterBar";
import { CareerStageFilter } from "../../components/CareerStageFilter";
import { CompareDrawer } from "../../components/CompareDrawer";
import { useKnowNextStore } from "../../store/knowNext.store";

const TYPES = ["All", "Government", "Private", "Deemed", "Autonomous"] as const;

interface CollegeExplorerProps {
  onNavigate: (view: KnowNextView, context?: Record<string, string>) => void;
  onBack: () => void;
}

export const CollegeExplorer: React.FC<CollegeExplorerProps> = ({ onNavigate, onBack }) => {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const { activeStage, compareCollegeIds, clearCollegeComparison } = useKnowNextStore();

  const filtered = useMemo(() => {
    return COLLEGES.filter((c) => {
      const matchesQuery =
        query.trim().length < 2 ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.shortName.toLowerCase().includes(query.toLowerCase()) ||
        c.location.toLowerCase().includes(query.toLowerCase());
      const matchesType = selectedType === "All" || c.type === selectedType;
      const matchesStage = activeStage === "all" || c.applicableStages.includes(activeStage as CareerStage);
      return matchesQuery && matchesType && matchesStage;
    }).sort((a, b) => a.ranking - b.ranking);
  }, [query, selectedType, activeStage]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-32">
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 px-5 pt-5 pb-12 rounded-b-[2.5rem]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center cursor-pointer">
            <ArrowLeft className="w-4.5 h-4.5 text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-base">Colleges & Universities</h1>
            <p className="text-white/70 text-[10px]">{COLLEGES.length} institutions listed</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search colleges, cities..." className="w-full pl-11 pr-4 py-3 text-sm bg-white border-0 rounded-full focus:outline-none shadow-sm placeholder-neutral-400" />
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        <div className="bg-white rounded-2xl p-3 border border-neutral-100 shadow-sm">
          <CareerStageFilter />
        </div>
        <FilterBar options={[...TYPES]} selected={selectedType} onSelect={setSelectedType} />
        <p className="text-xs font-bold text-foreground px-1">{filtered.length} colleges found</p>
        <div className="space-y-3">
          {filtered.map((college, i) => (
            <motion.div key={college.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}>
              <CollegeCard college={college} onSelect={(c) => onNavigate("collegeDetails", { collegeId: c.id })} />
            </motion.div>
          ))}
        </div>
      </div>

      <CompareDrawer count={compareCollegeIds.length} max={3} label="Compare Colleges" onCompare={() => onNavigate("collegeComparison")} onClear={clearCollegeComparison} />
    </div>
  );
};
