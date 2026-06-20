import React from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Career, KnowNextView } from "../../types/knowNext.types";
import { CAREERS } from "../../constants/careers";
import { useKnowNextStore } from "../../store/knowNext.store";

interface CareerComparisonProps {
  onNavigate: (view: KnowNextView, context?: Record<string, string>) => void;
  onBack: () => void;
}

const COMPARE_FIELDS: { key: keyof Career | string; label: string; format?: (c: Career) => string }[] = [
  { key: "avgSalary", label: "Avg Salary (LPA)", format: (c) => `₹${c.avgSalary}L` },
  { key: "salaryRange", label: "Salary Range", format: (c) => `₹${c.salaryRange.min}–${c.salaryRange.max}L` },
  { key: "industryDemand", label: "Market Demand" },
  { key: "growthPercent", label: "Growth (%)", format: (c) => `${c.growthPercent}%` },
  { key: "educationYears", label: "Education (Yrs)", format: (c) => `${c.educationYears} yrs` },
  { key: "category", label: "Field" },
];

export const CareerComparison: React.FC<CareerComparisonProps> = ({ onNavigate, onBack }) => {
  const { compareCareerIds, clearCareerComparison } = useKnowNextStore();
  const careers = compareCareerIds.map((id) => CAREERS.find((c) => c.id === id)).filter(Boolean) as Career[];

  if (careers.length < 2) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center px-4">
        <p className="text-2xl mb-2">⚖️</p>
        <p className="text-sm font-semibold text-neutral-600">Select at least 2 careers to compare</p>
        <button onClick={onBack} className="mt-4 text-xs text-[#1C4966] font-semibold cursor-pointer">← Back to Explorer</button>
      </div>
    );
  }

  // Find best value for each numeric field to highlight
  const getBest = (field: string): string | null => {
    if (field === "avgSalary" || field === "growthPercent") {
      const vals = careers.map((c) => c[field as keyof Career] as number);
      const best = Math.max(...vals);
      return String(best);
    }
    if (field === "educationYears") {
      const vals = careers.map((c) => c[field as keyof Career] as number);
      const best = Math.min(...vals); // lower is better
      return String(best);
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-28">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-violet-700 px-5 pt-5 pb-12 rounded-b-[2.5rem]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center cursor-pointer">
            <ArrowLeft className="w-4.5 h-4.5 text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-base">Career Comparison</h1>
            <p className="text-white/70 text-[10px]">Comparing {careers.length} careers side by side</p>
          </div>
        </div>

        {/* Career headers */}
        <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${careers.length}, 1fr)` }}>
          {careers.map((career) => (
            <div key={career.id} className="bg-white/10 rounded-2xl p-3 text-center">
              <div className="text-2xl mb-1">{career.icon}</div>
              <p className="text-white text-[11px] font-bold leading-tight">{career.title}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        {/* Skills comparison */}
        <div className="bg-white rounded-[2rem] border border-neutral-100 p-4 shadow-sm">
          <p className="text-xs font-bold text-foreground mb-3">⚡ Key Skills</p>
          <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${careers.length}, 1fr)` }}>
            {careers.map((c) => (
              <div key={c.id}>
                <div className="flex flex-wrap gap-1">
                  {c.requiredSkills.slice(0, 3).map((s) => (
                    <span key={s} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[8px] font-semibold rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Numeric comparison table */}
        <div className="bg-white rounded-[2rem] border border-neutral-100 p-4 shadow-sm">
          <p className="text-xs font-bold text-foreground mb-3">📊 At a Glance</p>
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left text-[9px] text-neutral-400 font-semibold pb-2 pr-2">Metric</th>
                {careers.map((c) => (
                  <th key={c.id} className="text-center text-[9px] text-neutral-400 font-semibold pb-2">
                    {c.icon}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_FIELDS.map(({ key, label, format }) => {
                const bestRaw = getBest(String(key));
                return (
                  <tr key={label} className="border-t border-neutral-50">
                    <td className="py-2 pr-2 text-[10px] text-neutral-500 font-medium">{label}</td>
                    {careers.map((c) => {
                      const val = format ? format(c) : String(c[key as keyof Career]);
                      const rawVal = c[key as keyof Career];
                      const isBest = bestRaw !== null && String(rawVal) === bestRaw;
                      return (
                        <td key={c.id} className="py-2 text-center">
                          <span className={`text-[10px] font-bold inline-flex items-center justify-center gap-0.5 ${isBest ? "text-[#5F8B70]" : "text-foreground"}`}>
                            {val}
                            {isBest && <Check className="w-2.5 h-2.5" />}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Job Roles */}
        <div className="bg-white rounded-[2rem] border border-neutral-100 p-4 shadow-sm">
          <p className="text-xs font-bold text-foreground mb-3">💼 Job Roles</p>
          <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${careers.length}, 1fr)` }}>
            {careers.map((c) => (
              <div key={c.id} className="space-y-1">
                {c.jobRoles.slice(0, 4).map((r) => (
                  <p key={r} className="text-[9px] text-neutral-600 bg-neutral-50 rounded-lg px-2 py-1">{r}</p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Clear and actions */}
        <button
          onClick={() => { clearCareerComparison(); onBack(); }}
          className="w-full py-3 border border-neutral-200 text-neutral-500 font-semibold text-sm rounded-[2rem] cursor-pointer hover:bg-neutral-50 transition-colors"
        >
          Clear Comparison
        </button>
      </div>
    </div>
  );
};
