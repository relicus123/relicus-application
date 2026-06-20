import React from "react";
import { ArrowLeft, BookOpen, Building2, Award } from "lucide-react";
import { KnowNextView } from "../../types/knowNext.types";
import { useKnowNextStore } from "../../store/knowNext.store";
import { CAREERS } from "../../constants/careers";
import { COLLEGES } from "../../constants/colleges";
import { SCHOLARSHIPS } from "../../constants/scholarships";
import { CareerCard } from "../../components/CareerCard";
import { CollegeCard } from "../../components/CollegeCard";
import { ScholarshipCard } from "../../components/ScholarshipCard";

interface SavedItemsProps {
  onNavigate: (view: KnowNextView, context?: Record<string, string>) => void;
  onBack: () => void;
}

const tabs = [
  { id: "careers", label: "Careers", icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: "colleges", label: "Colleges", icon: <Building2 className="w-3.5 h-3.5" /> },
  { id: "scholarships", label: "Scholarships", icon: <Award className="w-3.5 h-3.5" /> },
] as const;

export const SavedItems: React.FC<SavedItemsProps> = ({ onNavigate, onBack }) => {
  const [activeTab, setActiveTab] = React.useState<"careers" | "colleges" | "scholarships">("careers");
  const { savedCareerIds, savedCollegeIds, savedScholarshipIds } = useKnowNextStore();

  const savedCareers = CAREERS.filter((c) => savedCareerIds.includes(c.id));
  const savedColleges = COLLEGES.filter((c) => savedCollegeIds.includes(c.id));
  const savedScholarships = SCHOLARSHIPS.filter((s) => savedScholarshipIds.includes(s.id));

  const counts: Record<string, number> = {
    careers: savedCareers.length,
    colleges: savedColleges.length,
    scholarships: savedScholarships.length,
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-28">
      <div className="bg-gradient-to-br from-[#1C4966] to-[#2D6A9F] px-5 pt-5 pb-12 rounded-b-[2.5rem]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center cursor-pointer">
            <ArrowLeft className="w-4.5 h-4.5 text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-base">Saved Items</h1>
            <p className="text-white/70 text-[10px]">Your bookmarked careers, colleges & scholarships</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id ? "bg-white text-[#1C4966]" : "bg-white/20 text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${activeTab === tab.id ? "bg-[#1C4966]/10 text-[#1C4966]" : "bg-white/20 text-white"}`}>
                {counts[tab.id]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-3">
        {activeTab === "careers" && (
          savedCareers.length > 0 ? (
            savedCareers.map((career) => (
              <CareerCard key={career.id} career={career} onSelect={(c) => onNavigate("careerDetails", { careerId: c.id })} />
            ))
          ) : (
            <div className="py-16 text-center">
              <p className="text-2xl mb-2">🧭</p>
              <p className="text-sm text-neutral-400">No saved careers yet. Explore and bookmark!</p>
            </div>
          )
        )}

        {activeTab === "colleges" && (
          savedColleges.length > 0 ? (
            savedColleges.map((college) => (
              <CollegeCard key={college.id} college={college} onSelect={(c) => onNavigate("collegeDetails", { collegeId: c.id })} />
            ))
          ) : (
            <div className="py-16 text-center">
              <p className="text-2xl mb-2">🏛️</p>
              <p className="text-sm text-neutral-400">No saved colleges yet. Explore institutions!</p>
            </div>
          )
        )}

        {activeTab === "scholarships" && (
          savedScholarships.length > 0 ? (
            savedScholarships.map((scholarship) => (
              <ScholarshipCard key={scholarship.id} scholarship={scholarship} onSelect={(s) => onNavigate("scholarshipDetails", { scholarshipId: s.id })} />
            ))
          ) : (
            <div className="py-16 text-center">
              <p className="text-2xl mb-2">🎓</p>
              <p className="text-sm text-neutral-400">No saved scholarships yet. Find funding!</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};
