import React, { useMemo } from "react";
import { Award, Clock, BookOpen, Brain, TrendingUp, CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { ExamType } from "../types/exam.types";
import { analyticsService } from "../services/analytics.service";
import { getExamDataset } from "../data/examRegistry";
import { ProgressRing } from "../components/ProgressRing";
import { ExamReadinessCard } from "../components/ExamReadinessCard";

interface AnalyticsTabProps {
  examType: ExamType;
  extraData?: any;
}

const COLORS = ["#5F8B70", "#3B82F6", "#F97316", "#8B5CF6"];

export const AnalyticsTab: React.FC<AnalyticsTabProps> = React.memo(({ examType }) => {
  // ── Central registry lookup — no switch needed ────────────────────────────
  const exams = useCoachingStore((state) => state.exams);
  const { chapters } = useMemo(() => getExamDataset(examType), [examType, exams]);

  // Fetch metrics from analytics service
  const kpis = useMemo(() => analyticsService.getKPIs(examType, chapters), [examType, chapters]);
  const weeklyTrend = useMemo(() => analyticsService.getWeeklyTrend(examType), [examType]);
  const subjectPerformance = useMemo(() => analyticsService.getSubjectPerformance(examType, chapters), [examType, chapters]);
  const timeDistribution = useMemo(() => analyticsService.getTimeDistribution(examType), [examType]);

  return (
    <div className="p-6 space-y-6">
      {/* Overview KPIs Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Exam Readiness */}
        <div className="p-5 bg-white border border-neutral-100 rounded-[2rem] shadow-xs flex items-center gap-4 col-span-2">
          <ProgressRing progress={kpis.examReadinessScore} size={60} strokeWidth={6} colorClass="text-primary" />
          <div>
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
              Exam Readiness
            </span>
            <h4 className="text-2xl font-extrabold text-foreground leading-tight mt-0.5">
              {kpis.examReadinessScore}%
            </h4>
            <p className="text-[9px] text-neutral-400 font-medium">Based on mock tests & completed notes.</p>
          </div>
        </div>

        {/* Predicted Rank */}
        <div className="p-5 bg-white border border-neutral-100 rounded-[2rem] shadow-xs flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
              Predicted Rank
            </span>
            <Award className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h4 className="text-2xl font-extrabold text-foreground leading-none">
              #{kpis.predictedRank.toLocaleString()}
            </h4>
            <p className="text-[9px] text-neutral-400 font-medium mt-1">National Level Rank</p>
          </div>
        </div>

        {/* Learning hours */}
        <div className="p-5 bg-white border border-neutral-100 rounded-[2rem] shadow-xs flex flex-col justify-between min-h-[110px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
              Study Time
            </span>
            <Clock className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h4 className="text-2xl font-extrabold text-foreground leading-none">
              {kpis.learningHours} hrs
            </h4>
            <p className="text-[9px] text-neutral-400 font-medium mt-1">Logged this week</p>
          </div>
        </div>
      </div>

      {/* Recharts Graphs section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Trend (Line Chart) */}
        <div className="p-5 bg-white border border-neutral-100 rounded-[2rem] shadow-xs space-y-4">
          <div>
            <h4 className="text-xs font-bold text-foreground">Weekly Activity & Performance</h4>
            <p className="text-[9px] text-neutral-400">Weekly study hours compared with test accuracy scores</p>
          </div>
          <div className="h-56 text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="week" tickLine={false} axisLine={false} stroke="#9CA3AF" />
                <YAxis tickLine={false} axisLine={false} stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "1rem",
                    border: "1px solid #E5E7EB",
                    fontSize: "10px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: "10px" }} />
                <Line
                  name="Study Hours"
                  type="monotone"
                  dataKey="hours"
                  stroke="#5F8B70"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                />
                <Line
                  name="Test Score %"
                  type="monotone"
                  dataKey="testScore"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Performance (Bar Chart) */}
        <div className="p-5 bg-white border border-neutral-100 rounded-[2rem] shadow-xs space-y-4">
          <div>
            <h4 className="text-xs font-bold text-foreground">Subject Chapters & Accuracy</h4>
            <p className="text-[9px] text-neutral-400">Completion counts versus average mock test accuracy</p>
          </div>
          <div className="h-56 text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectPerformance} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="subject" tickLine={false} axisLine={false} stroke="#9CA3AF" />
                <YAxis tickLine={false} axisLine={false} stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "1rem",
                    border: "1px solid #E5E7EB",
                    fontSize: "10px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: "10px" }} />
                <Bar name="Completed Chapters" dataKey="completedChapters" fill="#5F8B70" radius={[4, 4, 0, 0]} />
                <Bar name="Accuracy %" dataKey="accuracy" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Doughnut Chart & Topic Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Study Time Distribution */}
        <div className="p-5 bg-white border border-neutral-100 rounded-[2rem] shadow-xs space-y-4 md:col-span-1">
          <div>
            <h4 className="text-xs font-bold text-foreground">Time Allocation</h4>
            <p className="text-[9px] text-neutral-400">Activity breakdown distribution</p>
          </div>
          <div className="h-44 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={timeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {timeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "1rem",
                    border: "1px solid #E5E7EB",
                    fontSize: "9px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-wider leading-none">Total</span>
              <span className="text-lg font-black text-foreground mt-0.5">100%</span>
            </div>
          </div>
          
          {/* Custom Legends */}
          <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-neutral-400">
            {timeDistribution.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: COLORS[index] }} />
                <span className="truncate">{entry.name} ({entry.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Exam Readiness Card (strong/weak breakdown) */}
        <ExamReadinessCard examType={examType} chapters={chapters} />
      </div>
    </div>
  );
});

AnalyticsTab.displayName = "AnalyticsTab";
