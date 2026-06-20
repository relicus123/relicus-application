import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Search } from "lucide-react";
import { Career, CareerStage, KnowNextView } from "../../types/knowNext.types";
import { CAREER_CATEGORIES } from "../../constants/careers";
import { CareerCard } from "../../components/CareerCard";
import { FilterBar } from "../../components/FilterBar";
import { CareerStageFilter } from "../../components/CareerStageFilter";
import { CompareDrawer } from "../../components/CompareDrawer";
import { useKnowNextStore } from "../../store/knowNext.store";

interface CareerExplorerProps {
  onNavigate: (view: KnowNextView, context?: Record<string, string>) => void;
  onBack: () => void;
}

export const CareerExplorer: React.FC<CareerExplorerProps> = ({ onNavigate, onBack }) => {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { activeStage, compareCareerIds, clearCareerComparison, careers } = useKnowNextStore();

  const filtered = useMemo(() => {
    return careers.filter((c) => {
      const title = c.title || c.name || "";
      const requiredSkills = c.requiredSkills || c.key_skills || [];
      const matchesQuery =
        query.trim().length < 2 ||
        title.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase()) ||
        requiredSkills.some((s: string) => s.toLowerCase().includes(query.toLowerCase()));
      const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
      
      const applicableStages = c.applicableStages || [c.stage];
      const matchesStage =
        activeStage === "all" || applicableStages.includes(activeStage as CareerStage);
      return matchesQuery && matchesCategory && matchesStage;
    });
  }, [query, selectedCategory, activeStage, careers]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-32">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-5 pt-5 pb-12 rounded-b-[2.5rem]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center cursor-pointer">
            <ArrowLeft className="w-4.5 h-4.5 text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-base">Career Explorer</h1>
            <p className="text-white/70 text-[10px]">{careers.length} careers available</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search careers, skills, industries..."
            className="w-full pl-11 pr-4 py-3 text-sm bg-white border-0 rounded-full focus:outline-none shadow-sm placeholder-neutral-400"
          />
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        {/* Stage Filter */}
        <div className="bg-white rounded-2xl p-3 border border-neutral-100 shadow-sm">
          <CareerStageFilter />
        </div>

        {/* Category Filter */}
        <FilterBar
          options={[...CAREER_CATEGORIES]}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* Results count */}
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold text-foreground">{filtered.length} careers found</p>
          {query && <p className="text-[10px] text-neutral-400">for "{query}"</p>}
        </div>

        {/* Career Cards */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((career, i) => (
              <motion.div
                key={career.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
              >
                <CareerCard
                  career={career}
                  onSelect={(c) => onNavigate("careerDetails", { careerId: c.id })}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-2xl mb-2">🔍</p>
            <p className="text-sm font-semibold text-neutral-500">No careers found</p>
            <p className="text-xs text-neutral-400 mt-1">Try a different search or filter</p>
          </div>
        )}
      </div>

      {/* Compare Drawer */}
      <CompareDrawer
        count={compareCareerIds.length}
        max={3}
        label="Compare Careers"
        onCompare={() => onNavigate("careerComparison")}
        onClear={clearCareerComparison}
      />
    </div>
  );
};
