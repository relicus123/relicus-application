import React from "react";
import { motion } from "motion/react";
import { ArrowLeft, BookOpen, Building2, Award, Map, TrendingUp, Star } from "lucide-react";
import { KnowNextView } from "../types/knowNext.types";
import { GlobalSearch } from "../components/GlobalSearch";
import { CareerStageFilter } from "../components/CareerStageFilter";
import { QuickActionsRow } from "../components/QuickActionsRow";
import { RecentActivityFeed } from "../components/RecentActivityFeed";
import { useKnowNextStore } from "../store/knowNext.store";

interface LandingHubProps {
  onNavigate: (view: KnowNextView, context?: Record<string, string>) => void;
  onBack: () => void;
}

const FEATURES = [
  { id: "careerExplorer", label: "Career Explorer", desc: "Browse & discover careers", icon: "🧭", color: "from-blue-50 to-indigo-50", border: "border-blue-100", iconBg: "bg-blue-100", textColor: "text-blue-800", accentBg: "bg-blue-600" },
  { id: "careerRoadmaps", label: "Career Roadmaps", desc: "Step-by-step journey plans", icon: "🗺️", color: "from-purple-50 to-violet-50", border: "border-purple-100", iconBg: "bg-purple-100", textColor: "text-purple-800", accentBg: "bg-purple-600" },
  { id: "colleges", label: "Colleges & Universities", desc: "Find your perfect institution", icon: "🏛️", color: "from-green-50 to-emerald-50", border: "border-green-100", iconBg: "bg-green-100", textColor: "text-green-800", accentBg: "bg-green-600" },
  { id: "scholarships", label: "Scholarships", desc: "Funding for your education", icon: "🎓", color: "from-orange-50 to-amber-50", border: "border-orange-100", iconBg: "bg-orange-100", textColor: "text-orange-800", accentBg: "bg-orange-600" },
  { id: "industryInsights", label: "Industry Insights", desc: "Market trends & opportunities", icon: "📊", color: "from-teal-50 to-cyan-50", border: "border-teal-100", iconBg: "bg-teal-100", textColor: "text-teal-800", accentBg: "bg-teal-600" },
  { id: "careerPlan", label: "My Career Plan", desc: "Personal command center", icon: "⭐", color: "from-amber-50 to-yellow-50", border: "border-amber-100", iconBg: "bg-amber-100", textColor: "text-amber-800", accentBg: "bg-amber-500" },
] as const;

export const LandingHub: React.FC<LandingHubProps> = ({ onNavigate, onBack }) => {
  const { savedCareerIds, savedCollegeIds, savedScholarshipIds, activeRoadmapId, careers, colleges, scholarships, roadmaps } = useKnowNextStore();

  const stats = [
    { label: "Careers", value: careers.length, icon: <BookOpen className="w-4 h-4" /> },
    { label: "Colleges", value: colleges.length, icon: <Building2 className="w-4 h-4" /> },
    { label: "Scholarships", value: scholarships.length, icon: <Award className="w-4 h-4" /> },
    { label: "Roadmaps", value: roadmaps.length, icon: <Map className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1C4966] to-[#2D6A9F] px-5 pt-5 pb-14 rounded-b-[2.5rem]">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={onBack}
            className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-4.5 h-4.5 text-white" />
          </button>
          <div>
            <p className="text-white/70 text-xs">Relicus</p>
            <h1 className="text-white text-lg font-bold">KnowNext</h1>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-white text-xl font-bold leading-tight">Your Career Journey</h2>
          <p className="text-white/70 text-xs mt-1">Explore. Plan. Achieve.</p>
        </div>

        {/* Global Search */}
        <GlobalSearch
          onSelectCareer={(id) => onNavigate("careerDetails", { careerId: id })}
          onSelectCollege={(id) => onNavigate("collegeDetails", { collegeId: id })}
          onSelectScholarship={(id) => onNavigate("scholarshipDetails", { scholarshipId: id })}
          onSelectRoadmap={(id) => onNavigate("learningPath", { roadmapId: id })}
          onSelectIndustry={(id) => onNavigate("marketTrends", { industryId: id })}
        />
      </div>

      <div className="px-4 -mt-8 space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2">
          {stats.map(({ label, value, icon }) => (
            <div key={label} className="bg-white rounded-2xl p-3 text-center border border-neutral-100 shadow-sm">
              <div className="flex justify-center text-[#1C4966] mb-1">{icon}</div>
              <p className="text-base font-bold text-foreground">{value}</p>
              <p className="text-[9px] text-neutral-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Career Stage Filter */}
        <div className="bg-white rounded-[2rem] p-4 border border-neutral-100 shadow-sm">
          <p className="text-xs font-bold text-foreground mb-3">I am looking for…</p>
          <CareerStageFilter />
        </div>

        {/* Quick Actions */}
        <div>
          <p className="text-xs font-bold text-foreground mb-2 px-1">Quick Actions</p>
          <QuickActionsRow
            onContinueRoadmap={() => onNavigate("learningPath", activeRoadmapId ? { roadmapId: activeRoadmapId } : {})}
            onExploreColleges={() => onNavigate("colleges")}
            onFindScholarships={() => onNavigate("scholarships")}
          />
        </div>

        {/* Saved summary if any */}
        {(savedCareerIds.length + savedCollegeIds.length + savedScholarshipIds.length) > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 rounded-[2rem] p-4 cursor-pointer"
            onClick={() => onNavigate("careerPlan")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-800">My Career Plan</p>
                  <p className="text-[10px] text-amber-600">
                    {savedCareerIds.length} careers · {savedCollegeIds.length} colleges · {savedScholarshipIds.length} scholarships saved
                  </p>
                </div>
              </div>
              <span className="text-amber-500 text-sm">→</span>
            </div>
          </motion.div>
        )}

        {/* Feature Cards Grid */}
        <div>
          <p className="text-xs font-bold text-foreground mb-3 px-1">Explore</p>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onNavigate(f.id as KnowNextView)}
                className={`bg-gradient-to-br ${f.color} border ${f.border} rounded-[2rem] p-4 cursor-pointer hover:shadow-md transition-all duration-200`}
              >
                <div className={`w-10 h-10 ${f.iconBg} rounded-2xl flex items-center justify-center text-xl mb-3`}>
                  {f.icon}
                </div>
                <h4 className={`text-xs font-bold ${f.textColor} leading-tight`}>{f.label}</h4>
                <p className="text-[10px] text-neutral-500 mt-1 leading-snug">{f.desc}</p>
                <div className="flex justify-end mt-3">
                  <div className={`w-6 h-6 ${f.accentBg} rounded-full flex items-center justify-center`}>
                    <TrendingUp className="w-3 h-3 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivityFeed limit={4} />
      </div>
    </div>
  );
};
