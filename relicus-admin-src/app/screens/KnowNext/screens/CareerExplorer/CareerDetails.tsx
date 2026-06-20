import React from "react";
import { ArrowLeft, TrendingUp, IndianRupee, Briefcase, Users, Star, ExternalLink } from "lucide-react";
import { Career, KnowNextView } from "../../types/knowNext.types";
import { SaveButton } from "../../components/SaveButton";
import { ModuleIntegrationCard } from "../../components/ModuleIntegrationCard";
import { useKnowNextStore } from "../../store/knowNext.store";

interface CareerDetailsProps {
  careerId: string;
  onNavigate: (view: KnowNextView, context?: Record<string, string>) => void;
  onBack: () => void;
}

const DEMAND_GRADIENT: Record<string, string> = {
  "Very High": "from-green-400 to-emerald-600",
  High: "from-blue-400 to-blue-600",
  Medium: "from-amber-400 to-amber-600",
  Low: "from-neutral-300 to-neutral-500",
};

export const CareerDetails: React.FC<CareerDetailsProps> = ({ careerId, onNavigate, onBack }) => {
  const { savedCareerIds, toggleSaveCareer, trackEvent, careers, roadmaps } = useKnowNextStore();
  const career = careers.find((c) => c.id === careerId);

  React.useEffect(() => {
    if (career) trackEvent({ type: "view", entityType: "career", entityId: careerId });
  }, [careerId, career]);

  if (!career) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-neutral-400">Career not found</p>
    </div>
  );

  const isSaved = savedCareerIds.includes(career.id);
  const roadmap = roadmaps.find((r) => r.careerId === career.id || r.career_id === career.id);

  const demand = career.industryDemand || career.demand_level || "High";
  const growthPercent = career.growthPercent || career.growth_rate || "10";
  const salaryRange = career.salaryRange || { min: "4", max: "20" };
  const avgSalary = career.avgSalary || "10";
  const educationalPath = career.educationalPath || career.education_paths || [];
  const requiredSkills = career.requiredSkills || career.key_skills || [];
  const entranceExams = career.entranceExams || [];
  const certifications = career.certifications || [];
  const jobRoles = career.jobRoles || [];
  const topRecruiters = career.topRecruiters || [];
  const futureScope = career.futureScope || "";

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-28">
      {/* Hero Banner */}
      <div className={`bg-gradient-to-br ${DEMAND_GRADIENT[demand] || "from-blue-400 to-blue-600"} px-5 pt-5 pb-14 rounded-b-[2.5rem]`}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center cursor-pointer">
            <ArrowLeft className="w-4.5 h-4.5 text-white" />
          </button>
          <SaveButton isSaved={isSaved} onToggle={() => toggleSaveCareer(career.id)} />
        </div>
        <div className="text-4xl mb-3">{career.icon || "🧭"}</div>
        <h1 className="text-white text-xl font-bold leading-tight">{career.title || career.name}</h1>
        <p className="text-white/80 text-xs mt-1">{career.category} · {career.industry || "General"}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-[10px] font-bold">
            {demand} Demand
          </span>
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-[10px] font-bold">
            📈 {growthPercent}% growth
          </span>
        </div>
      </div>

      <div className="px-4 -mt-8 space-y-4">
        {/* Salary card */}
        <div className="bg-white rounded-[2rem] border border-neutral-100 p-4 shadow-sm">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-sm font-bold text-[#1C4966]">₹{salaryRange.min || "4"}L</p>
              <p className="text-[9px] text-neutral-400">Entry Level</p>
            </div>
            <div className="text-center border-x border-neutral-100">
              <p className="text-base font-bold text-[#5F8B70]">₹{avgSalary}L</p>
              <p className="text-[9px] text-neutral-400">Average</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-[#1C4966]">₹{salaryRange.max || "20"}L</p>
              <p className="text-[9px] text-neutral-400">Senior Level</p>
            </div>
          </div>
        </div>

        {/* Overview */}
        <div className="bg-white rounded-[2rem] border border-neutral-100 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-foreground mb-2">Overview</h3>
          <p className="text-[11px] text-neutral-600 leading-relaxed">{career.overview}</p>
        </div>

        {/* Educational Path */}
        {educationalPath.length > 0 && (
          <div className="bg-white rounded-[2rem] border border-neutral-100 p-4 shadow-sm">
            <h3 className="text-xs font-bold text-foreground mb-3">🎓 Educational Path</h3>
            <div className="space-y-2">
              {educationalPath.map((step: any, i: number) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-[#1C4966]/10 flex items-center justify-center shrink-0 text-[9px] font-bold text-[#1C4966]">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{step.level || step}</p>
                    {step.duration && <p className="text-[10px] text-neutral-400">{step.duration}</p>}
                    {step.institutions && <p className="text-[10px] text-neutral-500 mt-0.5">{step.institutions.slice(0, 3).join(", ")}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Required Skills → Module Integration */}
        {requiredSkills.length > 0 && (
          <div className="bg-white rounded-[2rem] border border-neutral-100 p-4 shadow-sm">
            <h3 className="text-xs font-bold text-foreground mb-2">⚡ Required Skills</h3>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {requiredSkills.map((skill: string) => (
                <span key={skill} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-full">
                  {skill}
                </span>
              ))}
            </div>
            <ModuleIntegrationCard
              type="skills"
              title="Learn These Skills"
              subtitle="Available in Skill Enhancement module"
              items={requiredSkills.slice(0, 4)}
            />
          </div>
        )}

        {/* Entrance Exams → Module Integration */}
        {entranceExams.length > 0 && (
          <div className="bg-white rounded-[2rem] border border-neutral-100 p-4 shadow-sm">
            <h3 className="text-xs font-bold text-foreground mb-2">📚 Entrance Exams</h3>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {entranceExams.map((exam: string) => (
                <span key={exam} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-semibold rounded-full">
                  {exam}
                </span>
              ))}
            </div>
            <ModuleIntegrationCard
              type="coaching"
              title="Prepare for These Exams"
              subtitle="Available in Entrance Coaching module"
              items={entranceExams}
            />
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div className="bg-white rounded-[2rem] border border-neutral-100 p-4 shadow-sm">
            <h3 className="text-xs font-bold text-foreground mb-2">📜 Recommended Certifications</h3>
            <div className="space-y-1.5">
              {certifications.map((cert: string) => (
                <div key={cert} className="flex items-center gap-2 p-2 bg-amber-50 rounded-xl border border-amber-100">
                  <span className="text-amber-500 text-sm">📜</span>
                  <p className="text-[10px] font-semibold text-amber-800">{cert}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Job Roles */}
        {jobRoles.length > 0 && (
          <div className="bg-white rounded-[2rem] border border-neutral-100 p-4 shadow-sm">
            <h3 className="text-xs font-bold text-foreground mb-2">💼 Job Roles</h3>
            <div className="flex flex-wrap gap-1.5">
              {jobRoles.map((role: string) => (
                <span key={role} className="px-2.5 py-1 bg-neutral-50 border border-neutral-200 text-neutral-600 text-[10px] font-semibold rounded-full">
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Top Recruiters */}
        {topRecruiters.length > 0 && (
          <div className="bg-white rounded-[2rem] border border-neutral-100 p-4 shadow-sm">
            <h3 className="text-xs font-bold text-foreground mb-2">🏢 Top Recruiters</h3>
            <div className="flex flex-wrap gap-1.5">
              {topRecruiters.map((r: string) => (
                <span key={r} className="px-2.5 py-1 bg-[#1C4966]/5 text-[#1C4966] text-[10px] font-semibold rounded-full border border-[#1C4966]/10">
                  {r}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Future Scope */}
        {futureScope && (
          <div className="bg-gradient-to-br from-[#1C4966]/5 to-[#5F8B70]/5 border border-[#5F8B70]/10 rounded-[2rem] p-4">
            <h3 className="text-xs font-bold text-foreground mb-2">🔭 Future Scope</h3>
            <p className="text-[11px] text-neutral-600 leading-relaxed">{futureScope}</p>
          </div>
        )}

        {/* Roadmap CTA */}
        {roadmap && (
          <button
            onClick={() => onNavigate("careerRoadmapView", { careerId: career.id })}
            className="w-full py-4 bg-gradient-to-r from-[#1C4966] to-[#2D6A9F] text-white font-bold text-sm rounded-[2rem] shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            🗺️ View Career Roadmap →
          </button>
        )}
      </div>
    </div>
  );
};
