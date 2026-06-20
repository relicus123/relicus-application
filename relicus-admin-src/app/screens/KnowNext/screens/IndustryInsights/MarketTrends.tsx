import React from "react";
import { ArrowLeft } from "lucide-react";
import { KnowNextView } from "../../types/knowNext.types";
import { INDUSTRIES } from "../../constants/industries";
import { TrendChart } from "../../components/TrendChart";

interface MarketTrendsProps {
  industryId: string;
  onNavigate: (view: KnowNextView, context?: Record<string, string>) => void;
  onBack: () => void;
}

export const MarketTrends: React.FC<MarketTrendsProps> = ({ industryId, onBack }) => {
  const industry = INDUSTRIES.find((i) => i.id === industryId);

  if (!industry) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-neutral-400">Industry not found</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-28">
      <div className="bg-gradient-to-br from-teal-600 to-cyan-700 px-5 pt-5 pb-14 rounded-b-[2.5rem]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center cursor-pointer">
            <ArrowLeft className="w-4.5 h-4.5 text-white" />
          </button>
          <div>
            <p className="text-white/70 text-[10px]">Market Trends</p>
            <h1 className="text-white font-bold text-base">{industry.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{industry.icon}</span>
          <div>
            <p className="text-white font-bold text-sm">📈 {industry.growthPercent}% Annual Growth</p>
            <p className="text-white/70 text-xs">Avg salary: ₹{industry.avgSalaryLPA}L per annum</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-8 space-y-4">
        {/* Description */}
        <div className="bg-white rounded-[2rem] border border-neutral-100 p-4 shadow-sm">
          <p className="text-[11px] text-neutral-600 leading-relaxed">{industry.description}</p>
        </div>

        {/* Charts */}
        <TrendChart
          data={industry.marketTrends.salaryTrend}
          title="Average Salary Trend (LPA)"
          subtitle="Average annual salary over the past 5 years"
          color="#1C4966"
          type="line"
          unit="L"
        />

        <TrendChart
          data={industry.marketTrends.demandTrend}
          title="Demand Score (out of 100)"
          subtitle="Industry demand index"
          color="#5F8B70"
          type="line"
        />

        <TrendChart
          data={industry.marketTrends.hiringTrend}
          title="Annual Hiring Volume"
          subtitle="Number of professionals hired per year"
          color="#F97316"
          type="bar"
        />

        {/* Emerging Technologies */}
        <div className="bg-white rounded-[2rem] border border-neutral-100 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-foreground mb-2">🚀 Emerging Technologies</h3>
          <div className="flex flex-wrap gap-1.5">
            {industry.marketTrends.emergingTechnologies.map((tech) => (
              <span key={tech} className="px-2.5 py-1 bg-teal-50 text-teal-700 text-[10px] font-semibold rounded-full border border-teal-100">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Future Skills */}
        <div className="bg-white rounded-[2rem] border border-neutral-100 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-foreground mb-2">⚡ Skills You'll Need in 2030</h3>
          <div className="flex flex-wrap gap-1.5">
            {industry.marketTrends.futureSkills.map((skill) => (
              <span key={skill} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-full border border-blue-100">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Top Recruiters */}
        <div className="bg-white rounded-[2rem] border border-neutral-100 p-4 shadow-sm">
          <h3 className="text-xs font-bold text-foreground mb-2">🏢 Top Recruiters</h3>
          <div className="flex flex-wrap gap-1.5">
            {industry.topRecruiters.map((r) => (
              <span key={r} className="px-2.5 py-1 bg-[#1C4966]/5 text-[#1C4966] text-[10px] font-semibold rounded-full border border-[#1C4966]/10">
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Future Opportunities */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 rounded-[2rem] p-4">
          <h3 className="text-xs font-bold text-teal-800 mb-2">🔭 Future Opportunities</h3>
          <div className="space-y-1.5">
            {industry.futureOpportunities.map((opp) => (
              <div key={opp} className="flex items-center gap-2">
                <span className="text-teal-400 text-xs">▸</span>
                <p className="text-[10px] text-teal-700">{opp}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
