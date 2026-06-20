import React from "react";
import { ArrowLeft, Check } from "lucide-react";
import { College, KnowNextView } from "../../types/knowNext.types";
import { COLLEGES } from "../../constants/colleges";
import { useKnowNextStore } from "../../store/knowNext.store";

interface CollegeComparisonProps {
  onNavigate: (view: KnowNextView, context?: Record<string, string>) => void;
  onBack: () => void;
}

const FIELDS: { key: keyof College | string; label: string; format?: (c: College) => string; better?: "higher" | "lower" }[] = [
  { key: "ranking", label: "NIRF Rank", format: (c) => `#${c.ranking}`, better: "lower" },
  { key: "rating", label: "Rating", format: (c) => `${c.rating}/5`, better: "higher" },
  { key: "placementAvgPackage", label: "Avg Package (LPA)", format: (c) => `₹${c.placementAvgPackage}L`, better: "higher" },
  { key: "placementTopPackage", label: "Top Package (LPA)", format: (c) => `₹${c.placementTopPackage}L`, better: "higher" },
  { key: "placementRate", label: "Placement %", format: (c) => `${c.placementRate}%`, better: "higher" },
  { key: "feeRange", label: "Annual Fee", format: (c) => `₹${(c.feeRange.min / 100000).toFixed(1)}–${(c.feeRange.max / 100000).toFixed(1)}L`, better: "lower" },
  { key: "type", label: "Type" },
  { key: "scholarshipsAvailable", label: "Scholarships", format: (c) => c.scholarshipsAvailable ? "✅ Yes" : "❌ No" },
];

export const CollegeComparison: React.FC<CollegeComparisonProps> = ({ onBack }) => {
  const { compareCollegeIds, clearCollegeComparison } = useKnowNextStore();
  const colleges = compareCollegeIds.map((id) => COLLEGES.find((c) => c.id === id)).filter(Boolean) as College[];

  if (colleges.length < 2) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center px-4">
        <p className="text-2xl mb-2">🏛️</p>
        <p className="text-sm font-semibold text-neutral-600">Select at least 2 colleges to compare</p>
        <button onClick={onBack} className="mt-4 text-xs text-[#1C4966] font-semibold cursor-pointer">← Go Back</button>
      </div>
    );
  }

  const getBestIdx = (field: typeof FIELDS[0]): number => {
    if (!field.better) return -1;
    const vals = colleges.map((c) => {
      const v = c[field.key as keyof College];
      if (field.key === "feeRange") return (c.feeRange.min + c.feeRange.max) / 2;
      return typeof v === "number" ? v : 0;
    });
    return field.better === "higher" ? vals.indexOf(Math.max(...vals)) : vals.indexOf(Math.min(...vals));
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-28">
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 px-5 pt-5 pb-12 rounded-b-[2.5rem]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center cursor-pointer">
            <ArrowLeft className="w-4.5 h-4.5 text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-base">College Comparison</h1>
            <p className="text-white/70 text-[10px]">Comparing {colleges.length} colleges</p>
          </div>
        </div>
        <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${colleges.length}, 1fr)` }}>
          {colleges.map((c) => (
            <div key={c.id} className="bg-white/10 rounded-2xl p-3 text-center">
              <div className="text-xl mb-1">{c.icon}</div>
              <p className="text-white text-[10px] font-bold leading-tight">{c.shortName}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        <div className="bg-white rounded-[2rem] border border-neutral-100 p-4 shadow-sm">
          <p className="text-xs font-bold text-foreground mb-3">📊 Comparison Table</p>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-[9px] text-neutral-400 font-semibold pb-2 pr-2">Metric</th>
                {colleges.map((c) => (
                  <th key={c.id} className="text-center text-[9px] text-neutral-400 font-semibold pb-2">
                    {c.icon}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FIELDS.map((field) => {
                const bestIdx = getBestIdx(field);
                return (
                  <tr key={field.label} className="border-t border-neutral-50">
                    <td className="py-2 pr-2 text-[9px] text-neutral-500">{field.label}</td>
                    {colleges.map((c, ci) => {
                      const val = field.format ? field.format(c) : String(c[field.key as keyof College]);
                      const isBest = bestIdx === ci;
                      return (
                        <td key={c.id} className="py-2 text-center">
                          <span className={`text-[9px] font-bold inline-flex items-center justify-center gap-0.5 ${isBest ? "text-[#5F8B70]" : "text-foreground"}`}>
                            {val} {isBest && field.better && <Check className="w-2 h-2" />}
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

        <button onClick={() => { clearCollegeComparison(); onBack(); }} className="w-full py-3 border border-neutral-200 text-neutral-500 font-semibold text-sm rounded-[2rem] cursor-pointer hover:bg-neutral-50 transition-colors">
          Clear Comparison
        </button>
      </div>
    </div>
  );
};
