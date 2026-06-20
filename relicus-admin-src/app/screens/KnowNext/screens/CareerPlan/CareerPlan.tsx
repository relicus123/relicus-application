import React from "react";
import { motion } from "motion/react";
import { ArrowLeft, Star, Bookmark, TrendingUp, Target, Calendar, ChevronRight } from "lucide-react";
import { KnowNextView } from "../../types/knowNext.types";
import { useKnowNextStore } from "../../store/knowNext.store";
import { CAREERS } from "../../constants/careers";
import { COLLEGES } from "../../constants/colleges";
import { SCHOLARSHIPS } from "../../constants/scholarships";
import { ROADMAPS } from "../../constants/roadmaps";
import { RoadmapProgressRing } from "../../components/RoadmapProgressRing";
import { DeadlineCountdownBadge } from "../../components/DeadlineCountdownBadge";
import { QuickActionsRow } from "../../components/QuickActionsRow";
import { RecentActivityFeed } from "../../components/RecentActivityFeed";

interface CareerPlanProps {
  onNavigate: (view: KnowNextView, context?: Record<string, string>) => void;
  onBack: () => void;
}

export const CareerPlan: React.FC<CareerPlanProps> = ({ onNavigate, onBack }) => {
  const {
    careerGoalId,
    activeRoadmapId,
    savedCareerIds,
    savedCollegeIds,
    savedScholarshipIds,
    getRoadmapProgressPercent,
    setCareerGoal,
  } = useKnowNextStore();

  const activeRoadmap = ROADMAPS.find((r) => r.id === activeRoadmapId);
  const careerGoal = CAREERS.find((c) => c.id === careerGoalId);
  const progress = activeRoadmap ? getRoadmapProgressPercent(activeRoadmap.id, activeRoadmap.totalSteps) : 0;

  // Upcoming scholarship deadlines
  const upcomingDeadlines = SCHOLARSHIPS
    .filter((s) => savedScholarshipIds.includes(s.id) && new Date(s.deadline) > new Date())
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);

  const kpis = [
    { label: "Saved Careers", value: savedCareerIds.length, icon: "🧭", bg: "bg-blue-50", color: "text-blue-700" },
    { label: "Saved Colleges", value: savedCollegeIds.length, icon: "🏛️", bg: "bg-green-50", color: "text-green-700" },
    { label: "Scholarships", value: savedScholarshipIds.length, icon: "🎓", bg: "bg-orange-50", color: "text-orange-700" },
    { label: "Roadmap %", value: `${progress}%`, icon: "🗺️", bg: "bg-purple-50", color: "text-purple-700" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-28">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 to-yellow-600 px-5 pt-5 pb-14 rounded-b-[2.5rem]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center cursor-pointer">
            <ArrowLeft className="w-4.5 h-4.5 text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-base">My Career Plan</h1>
            <p className="text-white/70 text-[10px]">Your personal command center</p>
          </div>
        </div>

        {/* Career Goal */}
        {careerGoal ? (
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-[10px]">🎯 Career Goal</p>
                <p className="text-white font-bold text-sm">{careerGoal.title}</p>
                <p className="text-white/60 text-[10px]">{careerGoal.category} · {careerGoal.industry}</p>
              </div>
              <span className="text-3xl">{careerGoal.icon}</span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onNavigate("careerExplorer")}
            className="w-full py-3 bg-white/20 text-white font-semibold text-xs rounded-2xl cursor-pointer"
          >
            🎯 Set Your Career Goal →
          </button>
        )}
      </div>

      <div className="px-4 -mt-8 space-y-4">
        {/* KPI Grid */}
        <div className="grid grid-cols-4 gap-2">
          {kpis.map(({ label, value, icon, bg, color }) => (
            <div key={label} className={`${bg} rounded-2xl p-3 text-center border border-white`}>
              <p className="text-base mb-0.5">{icon}</p>
              <p className={`text-sm font-bold ${color}`}>{value}</p>
              <p className="text-[8px] text-neutral-500 leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* Active Roadmap */}
        {activeRoadmap ? (
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate("learningPath", { roadmapId: activeRoadmap.id })}
            className="bg-white border border-purple-100 rounded-[2rem] p-4 shadow-sm cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <RoadmapProgressRing percent={progress} size={60} strokeWidth={6} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-neutral-400">Active Roadmap</p>
                  <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[8px] font-bold rounded-full">ACTIVE</span>
                </div>
                <p className="text-sm font-bold text-foreground">{activeRoadmap.careerTitle}</p>
                <p className="text-[10px] text-neutral-400">{activeRoadmap.estimatedDuration} · Continue →</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => onNavigate("careerRoadmaps")}
            className="w-full py-3 bg-white border border-purple-100 text-purple-700 font-semibold text-xs rounded-[2rem] cursor-pointer"
          >
            🗺️ Start a Roadmap →
          </button>
        )}

        {/* Quick Actions */}
        <div>
          <p className="text-xs font-bold text-foreground mb-2">Quick Actions</p>
          <QuickActionsRow
            onContinueRoadmap={() => onNavigate("learningPath")}
            onExploreColleges={() => onNavigate("colleges")}
            onFindScholarships={() => onNavigate("scholarships")}
          />
        </div>

        {/* Upcoming Deadlines */}
        {upcomingDeadlines.length > 0 && (
          <div className="bg-white border border-neutral-100 rounded-[2rem] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-foreground">📅 Scholarship Deadlines</p>
              <button onClick={() => onNavigate("scholarships")} className="text-[10px] text-[#1C4966] font-semibold cursor-pointer">
                View All
              </button>
            </div>
            <div className="space-y-2">
              {upcomingDeadlines.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-2 bg-neutral-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-foreground truncate">{s.name}</p>
                    <p className="text-[9px] text-neutral-400">{new Date(s.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  </div>
                  <DeadlineCountdownBadge deadline={s.deadline} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Items shortcuts */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Saved Careers", count: savedCareerIds.length, view: "savedItems" as KnowNextView, icon: "🧭", bg: "bg-blue-50 border-blue-100" },
            { label: "Saved Colleges", count: savedCollegeIds.length, view: "savedItems" as KnowNextView, icon: "🏛️", bg: "bg-green-50 border-green-100" },
            { label: "Scholarships", count: savedScholarshipIds.length, view: "savedItems" as KnowNextView, icon: "🎓", bg: "bg-orange-50 border-orange-100" },
          ].map(({ label, count, view, icon, bg }) => (
            <button
              key={label}
              onClick={() => onNavigate(view)}
              className={`${bg} border rounded-2xl p-3 text-center cursor-pointer hover:shadow-sm transition-all`}
            >
              <p className="text-lg">{icon}</p>
              <p className="text-xs font-bold text-foreground mt-1">{count}</p>
              <p className="text-[9px] text-neutral-500 leading-tight">{label}</p>
            </button>
          ))}
        </div>

        {/* Recent Activity */}
        <RecentActivityFeed limit={5} />
      </div>
    </div>
  );
};
