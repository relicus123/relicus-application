import React from "react";
import { CheckCircle, Play, Lock } from "lucide-react";
import { RoadmapStep, StepStatus } from "../types/knowNext.types";
import { motion, AnimatePresence } from "motion/react";

const STEP_TYPE_ICONS: Record<string, string> = {
  education: "🎓",
  skill: "⚡",
  certification: "📜",
  project: "🛠️",
  experience: "💼",
};

const STATUS_CONFIG: Record<StepStatus, { icon: React.ReactNode; lineColor: string; nodeColor: string }> = {
  completed: {
    icon: <CheckCircle className="w-4 h-4 text-white" />,
    lineColor: "bg-[#5F8B70]",
    nodeColor: "bg-[#5F8B70] border-[#5F8B70]",
  },
  current: {
    icon: <Play className="w-3.5 h-3.5 text-white fill-white" />,
    lineColor: "bg-neutral-200",
    nodeColor: "bg-[#1C4966] border-[#1C4966]",
  },
  locked: {
    icon: <Lock className="w-3.5 h-3.5 text-neutral-400" />,
    lineColor: "bg-neutral-200",
    nodeColor: "bg-white border-neutral-300",
  },
};

const STATUS_LABELS: Record<StepStatus, string> = {
  completed: "Completed ✅",
  current: "In Progress ▶",
  locked: "Locked 🔒",
};

interface RoadmapStepCardProps {
  step: RoadmapStep;
  isLast: boolean;
  onComplete?: (stepId: string) => void;
}

const RoadmapStepCard: React.FC<RoadmapStepCardProps> = ({ step, isLast, onComplete }) => {
  const [expanded, setExpanded] = React.useState(step.status === "current");
  const config = STATUS_CONFIG[step.status];

  return (
    <div className="flex gap-3">
      {/* Timeline node + line */}
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${config.nodeColor}`}>
          {config.icon}
        </div>
        {!isLast && <div className={`w-0.5 flex-1 mt-1 ${config.lineColor} min-h-6`} />}
      </div>

      {/* Content card */}
      <div className={`flex-1 mb-4 rounded-2xl border transition-all duration-200 overflow-hidden ${
        step.status === "locked" ? "opacity-60" : ""
      } ${step.status === "current" ? "border-[#1C4966]/30 bg-[#1C4966]/5" : "border-neutral-100 bg-white"}`}>
        <button
          className="w-full text-left p-3 cursor-pointer"
          onClick={() => step.status !== "locked" && setExpanded((x) => !x)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-base shrink-0">{STEP_TYPE_ICONS[step.type]}</span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground leading-snug">{step.title}</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">{step.duration} · {STATUS_LABELS[step.status]}</p>
              </div>
            </div>
            {step.status !== "locked" && (
              <span className="text-neutral-300 text-xs shrink-0">{expanded ? "▲" : "▼"}</span>
            )}
          </div>
        </button>

        <AnimatePresence>
          {expanded && step.status !== "locked" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 space-y-2 border-t border-neutral-100 pt-2">
                <p className="text-[11px] text-neutral-600 leading-relaxed">{step.description}</p>

                {step.skillsRequired.length > 0 && (
                  <div>
                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {step.skillsRequired.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-semibold rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {step.certifications.length > 0 && (
                  <div>
                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Certifications</p>
                    <div className="flex flex-wrap gap-1">
                      {step.certifications.map((c) => (
                        <span key={c} className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-semibold rounded-full">
                          📜 {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {step.resources.length > 0 && (
                  <div>
                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Resources</p>
                    <div className="flex flex-wrap gap-1">
                      {step.resources.map((r) => (
                        <span key={r} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[9px] font-medium rounded-full">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {step.status === "current" && onComplete && (
                  <button
                    onClick={() => onComplete(step.id)}
                    className="w-full mt-1 py-2 bg-[#5F8B70] text-white text-xs font-bold rounded-xl hover:bg-[#4a7059] transition-colors cursor-pointer"
                  >
                    ✅ Mark as Complete
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface RoadmapTimelineProps {
  steps: RoadmapStep[];
  roadmapId: string;
  onComplete?: (roadmapId: string, stepId: string) => void;
}

export const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({ steps, roadmapId, onComplete }) => {
  return (
    <div className="pt-2">
      {steps.map((step, idx) => (
        <RoadmapStepCard
          key={step.id}
          step={step}
          isLast={idx === steps.length - 1}
          onComplete={onComplete ? (stepId) => onComplete(roadmapId, stepId) : undefined}
        />
      ))}
    </div>
  );
};
