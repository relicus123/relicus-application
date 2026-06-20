import React from "react";
import { ArrowLeft } from "lucide-react";
import { KnowNextView } from "../../types/knowNext.types";
import { CAREERS } from "../../constants/careers";
import { ROADMAPS } from "../../constants/roadmaps";
import { RoadmapTimeline } from "../../components/RoadmapTimeline";
import { RoadmapProgressRing } from "../../components/RoadmapProgressRing";
import { useKnowNextStore } from "../../store/knowNext.store";

interface CareerRoadmapViewProps {
  careerId: string;
  onNavigate: (view: KnowNextView, context?: Record<string, string>) => void;
  onBack: () => void;
}

export const CareerRoadmapView: React.FC<CareerRoadmapViewProps> = ({ careerId, onNavigate, onBack }) => {
  const career = CAREERS.find((c) => c.id === careerId);
  const roadmap = ROADMAPS.find((r) => r.careerId === careerId);
  const { getRoadmapProgressPercent, completeRoadmapStep, setActiveRoadmap, activeRoadmapId } = useKnowNextStore();

  // Always call hooks at the top level — before any conditional returns
  const completedSteps = useKnowNextStore((s) => s.getCompletedSteps(roadmap?.id ?? ""));

  if (!career || !roadmap) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
        <div className="text-center">
          <p className="text-2xl mb-2">🗺️</p>
          <p className="text-sm font-semibold text-neutral-500">Roadmap not available yet</p>
          <button onClick={onBack} className="mt-4 text-xs text-[#1C4966] font-semibold cursor-pointer">← Go Back</button>
        </div>
      </div>
    );
  }

  const progressPercent = getRoadmapProgressPercent(roadmap.id, roadmap.totalSteps);
  const isActive = activeRoadmapId === roadmap.id;

  // Compute step statuses based on progress
  const stepsWithStatus = roadmap.steps.map((step, idx) => {
    const isCompleted = completedSteps.includes(step.id);
    const prevCompleted = idx === 0 || completedSteps.includes(roadmap.steps[idx - 1].id);
    return {
      ...step,
      status: isCompleted ? ("completed" as const) : prevCompleted ? ("current" as const) : ("locked" as const),
    };
  });

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-28">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-violet-700 px-5 pt-5 pb-12 rounded-b-[2.5rem]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center cursor-pointer">
            <ArrowLeft className="w-4.5 h-4.5 text-white" />
          </button>
          <div>
            <p className="text-white/70 text-[10px]">Career Roadmap</p>
            <h1 className="text-white font-bold text-base">{career.title}</h1>
          </div>
        </div>

        {/* Progress + Stats */}
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <RoadmapProgressRing percent={progressPercent} size={64} />
          <div className="flex-1">
            <p className="text-white font-bold text-sm">{progressPercent}% Complete</p>
            <p className="text-white/70 text-[10px] mt-0.5">{roadmap.estimatedDuration} · {roadmap.totalSteps} steps</p>
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="px-2 py-0.5 bg-white/20 text-white text-[9px] font-bold rounded-full">
                ✅ {completedSteps.length} done
              </span>
              <span className="px-2 py-0.5 bg-white/20 text-white text-[9px] font-bold rounded-full">
                🔒 {roadmap.totalSteps - completedSteps.length - 1} locked
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Start / Switch Roadmap Button */}
        {!isActive && (
          <button
            onClick={() => setActiveRoadmap(roadmap.id)}
            className="w-full py-3 bg-[#1C4966] text-white font-bold text-sm rounded-[2rem] cursor-pointer hover:bg-[#163a52] transition-colors"
          >
            ▶ Set as Active Roadmap
          </button>
        )}
        {isActive && (
          <div className="py-2 text-center">
            <span className="text-xs font-semibold text-[#5F8B70]">✅ This is your active roadmap</span>
          </div>
        )}

        {/* Roadmap Timeline */}
        <div className="bg-white rounded-[2rem] border border-neutral-100 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-foreground mb-3">Your Learning Journey</h3>
          <RoadmapTimeline
            steps={stepsWithStatus}
            roadmapId={roadmap.id}
            onComplete={(rid, sid) => completeRoadmapStep(rid, sid)}
          />
        </div>

        {/* Go to Learning Path */}
        <button
          onClick={() => onNavigate("learningPath", { roadmapId: roadmap.id })}
          className="w-full py-3 border-2 border-[#1C4966] text-[#1C4966] font-bold text-sm rounded-[2rem] cursor-pointer hover:bg-[#1C4966]/5 transition-colors"
        >
          View Full Learning Path →
        </button>
      </div>
    </div>
  );
};
