import React from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { KnowNextView } from "../../types/knowNext.types";
import { SCHOLARSHIPS } from "../../constants/scholarships";
import { SaveButton } from "../../components/SaveButton";
import { DeadlineCountdownBadge } from "../../components/DeadlineCountdownBadge";
import { useKnowNextStore } from "../../store/knowNext.store";

interface ScholarshipDetailsProps {
  scholarshipId: string;
  onNavigate: (view: KnowNextView, context?: Record<string, string>) => void;
  onBack: () => void;
}

export const ScholarshipDetails: React.FC<ScholarshipDetailsProps> = ({ scholarshipId, onBack }) => {
  const scholarship = SCHOLARSHIPS.find((s) => s.id === scholarshipId);
  const { savedScholarshipIds, toggleSaveScholarship } = useKnowNextStore();

  if (!scholarship) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-neutral-400">Scholarship not found</p>
    </div>
  );

  const isSaved = savedScholarshipIds.includes(scholarship.id);
  const amountStr = scholarship.amount >= 100000
    ? `₹${(scholarship.amount / 100000).toFixed(1)}L`
    : `₹${(scholarship.amount / 1000).toFixed(0)}K`;

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-28">
      <div className="bg-gradient-to-br from-orange-500 to-amber-600 px-5 pt-5 pb-14 rounded-b-[2.5rem]">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center cursor-pointer">
            <ArrowLeft className="w-4.5 h-4.5 text-white" />
          </button>
          <SaveButton isSaved={isSaved} onToggle={() => toggleSaveScholarship(scholarship.id)} />
        </div>
        <div className="text-3xl mb-2">🎓</div>
        <h1 className="text-white text-base font-bold leading-tight">{scholarship.name}</h1>
        <p className="text-white/70 text-xs mt-1">{scholarship.provider}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="px-3 py-1 bg-white/20 text-white text-[10px] font-bold rounded-full">{scholarship.category}</span>
          <DeadlineCountdownBadge deadline={scholarship.deadline} />
        </div>
      </div>

      <div className="px-4 -mt-8 space-y-4">
        {/* Amount */}
        <div className="bg-white rounded-[2rem] border border-neutral-100 p-5 shadow-sm text-center">
          <p className="text-2xl font-bold text-[#1C4966]">{amountStr}</p>
          <p className="text-xs text-neutral-400 mt-1">{scholarship.frequency} Scholarship</p>
          <p className="text-[10px] text-neutral-500 mt-1">Deadline: {new Date(scholarship.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>

        {/* Eligibility */}
        <div className="bg-white rounded-[2rem] border border-neutral-100 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-foreground mb-3">✅ Eligibility Criteria</h3>
          <div className="space-y-2">
            {scholarship.eligibility.map((e, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[#5F8B70] text-xs shrink-0">•</span>
                <p className="text-[11px] text-neutral-600 leading-relaxed">{e}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Required Documents */}
        <div className="bg-white rounded-[2rem] border border-neutral-100 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-foreground mb-3">📋 Required Documents</h3>
          <div className="space-y-1.5">
            {scholarship.requiredDocuments.map((doc, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-neutral-50 rounded-xl">
                <span className="text-[9px] font-bold text-neutral-400">{i + 1}.</span>
                <p className="text-[10px] text-neutral-600">{doc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Apply Button */}
        <a
          href={scholarship.applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm rounded-[2rem] shadow-md flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          Apply Now <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
