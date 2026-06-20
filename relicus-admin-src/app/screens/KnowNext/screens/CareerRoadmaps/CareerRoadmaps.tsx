import React from "react";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { KnowNextView, CareerStage } from "../../types/knowNext.types";
import { ROADMAPS } from "../../constants/roadmaps";
import { RoadmapProgressRing } from "../../components/RoadmapProgressRing";
import { CareerStageFilter } from "../../components/CareerStageFilter";
import { useKnowNextStore } from "../../store/knowNext.store";

interface CareerRoadmapsProps {
  onNavigate: (view: KnowNextView, context?: Record<string, string>) => void;
  onBack: () => void;
}

export const CareerRoadmaps: React.FC<CareerRoadmapsProps> = ({ onNavigate, onBack }) => {
  const { activeStage, getRoadmapProgressPercent, activeRoadmapId } = useKnowNextStore();

  const filtered = ROADMAPS.filter(
    (r) => activeStage === "all" || r.applicableStages.includes(activeStage as CareerStage)
  );

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-28">
      <div className="bg-gradient-to-br from-purple-600 to-violet-700 px-5 pt-5 pb-12 rounded-b-[2.5rem]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center cursor-pointer">
            <ArrowLeft className="w-4.5 h-4.5 text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-base">Career Roadmaps</h1>
            <p className="text-white/70 text-[10px]">{filtered.length} step-by-step journey plans</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        <div className="bg-white rounded-2xl p-3 border border-neutral-100 shadow-sm">
          <CareerStageFilter />
        </div>

        <div className="space-y-3">
          {filtered.map((roadmap, i) => {
            const progress = getRoadmapProgressPercent(roadmap.id, roadmap.totalSteps);
            const isActive = activeRoadmapId === roadmap.id;
            return (
              <motion.div
                key={roadmap.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate("learningPath", { roadmapId: roadmap.id })}
                className="bg-white border border-neutral-100 rounded-[2rem] p-4 shadow-xs cursor-pointer hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <RoadmapProgressRing percent={progress} size={56} strokeWidth={5} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground">{roadmap.careerTitle}</h4>
                      {isActive && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[8px] font-bold rounded-full">ACTIVE</span>}
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{roadmap.estimatedDuration} · {roadmap.totalSteps} steps</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {roadmap.applicableStages.map((s) => (
                        <span key={s} className="px-1.5 py-0.5 bg-purple-50 text-purple-600 text-[8px] font-semibold rounded-full">
                          {s === "afterGraduation" ? "After Grad" : s === "after12th" ? "After 12th" : s === "workingProfessional" ? "Working Pro" : s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-xl">{roadmap.icon}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
