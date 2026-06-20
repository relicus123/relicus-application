import React from "react";
import { ArrowRight, Sparkles, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router";

interface ModuleIntegrationCardProps {
  type: "skills" | "coaching";
  title: string;
  subtitle: string;
  items: string[];
  className?: string;
}

export const ModuleIntegrationCard: React.FC<ModuleIntegrationCardProps> = ({
  type,
  title,
  subtitle,
  items,
  className = "",
}) => {
  const navigate = useNavigate();

  const isSkills = type === "skills";
  const config = isSkills
    ? {
        bg: "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100",
        iconBg: "bg-emerald-500",
        label: "Open in Skill Enhancement →",
        path: "/app/skills",
        Icon: Sparkles,
      }
    : {
        bg: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100",
        iconBg: "bg-[#1C4966]",
        label: "Open in Entrance Coaching →",
        path: "/app/coaching",
        Icon: GraduationCap,
      };

  return (
    <div className={`p-4 border rounded-2xl ${config.bg} ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${config.iconBg}`}>
          <config.Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground">{title}</p>
          <p className="text-[10px] text-neutral-400">{subtitle}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {items.map((item) => (
          <span key={item} className="px-2 py-0.5 bg-white/80 text-[9px] font-semibold text-neutral-600 rounded-full border border-white/60">
            {item}
          </span>
        ))}
      </div>

      <button
        onClick={() => navigate(config.path)}
        className={`w-full py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer transition-opacity hover:opacity-90 ${config.iconBg}`}
      >
        {config.label} <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
