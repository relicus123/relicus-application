import React from "react";
import { ArrowLeft, Star, MapPin, Check } from "lucide-react";
import { College, KnowNextView } from "../../types/knowNext.types";
import { COLLEGES } from "../../constants/colleges";
import { SaveButton } from "../../components/SaveButton";
import { DeadlineCountdownBadge } from "../../components/DeadlineCountdownBadge";
import { useKnowNextStore } from "../../store/knowNext.store";

interface CollegeDetailsProps {
  collegeId: string;
  onNavigate: (view: KnowNextView, context?: Record<string, string>) => void;
  onBack: () => void;
}

export const CollegeDetails: React.FC<CollegeDetailsProps> = ({ collegeId, onBack }) => {
  const college = COLLEGES.find((c) => c.id === collegeId);
  const { savedCollegeIds, toggleSaveCollege } = useKnowNextStore();

  if (!college) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-neutral-400">College not found</p>
    </div>
  );

  const isSaved = savedCollegeIds.includes(college.id);
  const feeMin = (college.feeRange.min / 100000).toFixed(1);
  const feeMax = (college.feeRange.max / 100000).toFixed(1);

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-28">
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 px-5 pt-5 pb-14 rounded-b-[2.5rem]">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center cursor-pointer">
            <ArrowLeft className="w-4.5 h-4.5 text-white" />
          </button>
          <SaveButton isSaved={isSaved} onToggle={() => toggleSaveCollege(college.id)} />
        </div>
        <div className="text-3xl mb-2">{college.icon}</div>
        <h1 className="text-white text-lg font-bold leading-tight">{college.name}</h1>
        <div className="flex items-center gap-1 mt-1">
          <MapPin className="w-3 h-3 text-white/70" />
          <p className="text-white/70 text-xs">{college.location}</p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded-full">{college.type}</span>
          <span className="flex items-center gap-0.5">
            <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
            <span className="text-white text-[10px] font-bold">{college.rating}</span>
          </span>
          <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded-full">Rank #{college.ranking}</span>
        </div>
      </div>

      <div className="px-4 -mt-8 space-y-4">
        {/* Stats */}
        <div className="bg-white rounded-[2rem] border border-neutral-100 p-4 shadow-sm">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Avg Package", value: `₹${college.placementAvgPackage}L` },
              { label: "Top Package", value: `₹${college.placementTopPackage}L` },
              { label: "Placement Rate", value: `${college.placementRate}%` },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-sm font-bold text-[#1C4966]">{value}</p>
                <p className="text-[9px] text-neutral-400">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Overview */}
        <div className="bg-white rounded-[2rem] border border-neutral-100 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-foreground mb-2">About</h3>
          <p className="text-[11px] text-neutral-600 leading-relaxed">{college.overview}</p>
        </div>

        {/* Courses */}
        <div className="bg-white rounded-[2rem] border border-neutral-100 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-foreground mb-2">🎓 Courses Offered</h3>
          <div className="flex flex-wrap gap-1.5">
            {college.coursesOffered.map((c) => (
              <span key={c} className="px-2.5 py-1 bg-green-50 text-green-700 text-[10px] font-semibold rounded-full border border-green-100">{c}</span>
            ))}
          </div>
        </div>

        {/* Fee Range */}
        <div className="bg-white rounded-[2rem] border border-neutral-100 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-foreground mb-2">💰 Annual Fee Range</h3>
          <p className="text-lg font-bold text-[#1C4966]">₹{feeMin}L – ₹{feeMax}L</p>
          {college.scholarshipsAvailable && (
            <p className="text-[10px] text-[#5F8B70] mt-1">✅ Scholarships Available: {college.scholarshipDetails}</p>
          )}
        </div>

        {/* Entrance Exams */}
        <div className="bg-white rounded-[2rem] border border-neutral-100 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-foreground mb-2">📝 Entrance Exams Accepted</h3>
          <div className="flex flex-wrap gap-1.5">
            {college.entranceExamsAccepted.map((exam) => (
              <span key={exam} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-semibold rounded-full">{exam}</span>
            ))}
          </div>
        </div>

        {/* Admission Process */}
        <div className="bg-white rounded-[2rem] border border-neutral-100 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-foreground mb-3">📋 Admission Process</h3>
          <div className="space-y-2">
            {college.admissionProcess.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#5F8B70]/10 flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold text-[#5F8B70]">{i + 1}</span>
                </div>
                <p className="text-[10px] text-neutral-600">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
