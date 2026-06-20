import React from "react";
import { ArrowLeft } from "lucide-react";
import { KnowNextView } from "../../types/knowNext.types";
import { ROADMAPS } from "../../constants/roadmaps";
import { RoadmapTimeline } from "../../components/RoadmapTimeline";
import { RoadmapProgressRing } from "../../components/RoadmapProgressRing";
import { useKnowNextStore } from "../../store/knowNext.store";

interface LearningPathProps {
  roadmapId?: string;
  onNavigate: (view: KnowNextView, context?: Record<string, string>) => void;
  onBack: () => void;
}

export const LearningPath: React.FC<LearningPathProps> = ({ roadmapId, onBack }) => {
  const { activeRoadmapId, setActiveRoadmap, getRoadmapProgressPercent, completeRoadmapStep } = useKnowNextStore();
  const targetId = roadmapId ?? activeRoadmapId;
  const roadmap = ROADMAPS.find((r) => r.id === targetId);

  // Hook must be called at top level — before any conditional returns
  const completedSteps = useKnowNextStore((s) => s.getCompletedSteps(targetId ?? ""));

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center px-4">
        <p className="text-2xl mb-2">🗺️</p>
        <p className="text-sm font-semibold text-neutral-600">No active roadmap set yet</p>
        <button onClick={onBack} className="mt-4 text-xs text-[#1C4966] font-semibold cursor-pointer">← Browse Roadmaps</button>
      </div>
    );
  }

  const progress = getRoadmapProgressPercent(roadmap.id, roadmap.totalSteps);
  const isActive = activeRoadmapId === roadmap.id;

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
      <div className="bg-gradient-to-br from-purple-600 to-violet-700 px-5 pt-5 pb-14 rounded-b-[2.5rem]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center cursor-pointer">
            <ArrowLeft className="w-4.5 h-4.5 text-white" />
          </button>
          <div>
            <p className="text-white/70 text-[10px]">Learning Path</p>
            <h1 className="text-white font-bold text-base">{roadmap.careerTitle}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/10 rounded-2xl p-4">
          <RoadmapProgressRing percent={progress} size={64} />
          <div>
            <p className="text-white font-bold">{progress}% complete</p>
            <p className="text-white/70 text-xs">{completedSteps.length}/{roadmap.totalSteps} steps done</p>
            <p className="text-white/60 text-[10px] mt-0.5">{roadmap.estimatedDuration}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {!isActive && (
          <button onClick={() => setActiveRoadmap(roadmap.id)} className="w-full py-3 bg-[#1C4966] text-white font-bold text-sm rounded-[2rem] cursor-pointer">
            ▶ Set as Active Roadmap
          </button>
        )}

        <div className="bg-white rounded-[2rem] border border-neutral-100 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-foreground mb-3">Your Learning Steps</h3>
          <RoadmapTimeline
            steps={stepsWithStatus}
            roadmapId={roadmap.id}
            onComplete={(rid, sid) => completeRoadmapStep(rid, sid)}
          />
        </div>
      </div>
    </div>
  );
};
