import React from "react";
import { CheckCircle, BookOpen, Building2, Award, TrendingUp, Star } from "lucide-react";
import { ActivityItem, ActivityType } from "../types/knowNext.types";
import { useKnowNextStore } from "../store/knowNext.store";

const ACTIVITY_CONFIG: Record<ActivityType, { icon: React.ReactNode; color: string; bg: string }> = {
  savedCareer: { icon: <BookOpen className="w-3.5 h-3.5" />, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
  savedCollege: { icon: <Building2 className="w-3.5 h-3.5" />, color: "text-green-600", bg: "bg-green-50 border-green-100" },
  savedScholarship: { icon: <Award className="w-3.5 h-3.5" />, color: "text-orange-600", bg: "bg-orange-50 border-orange-100" },
  startedRoadmap: { icon: <TrendingUp className="w-3.5 h-3.5" />, color: "text-purple-600", bg: "bg-purple-50 border-purple-100" },
  completedMilestone: { icon: <CheckCircle className="w-3.5 h-3.5" />, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
  comparedCareers: { icon: <Star className="w-3.5 h-3.5" />, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
  comparedColleges: { icon: <Building2 className="w-3.5 h-3.5" />, color: "text-teal-600", bg: "bg-teal-50 border-teal-100" },
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

interface ActivityItemRowProps {
  item: ActivityItem;
}

const ActivityItemRow: React.FC<ActivityItemRowProps> = ({ item }) => {
  const config = ACTIVITY_CONFIG[item.type];
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${config.bg} ${config.color}`}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground truncate">{item.title}</p>
        <p className="text-[10px] text-neutral-400 truncate">{item.subtitle}</p>
      </div>
      <span className="text-[10px] text-neutral-300 shrink-0">{timeAgo(item.timestamp)}</span>
    </div>
  );
};

interface RecentActivityFeedProps {
  limit?: number;
  className?: string;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  limit = 5,
  className = "",
}) => {
  const { recentActivity } = useKnowNextStore();
  const items = recentActivity.slice(0, limit);

  if (items.length === 0) {
    return (
      <div className={`p-4 bg-white rounded-[2rem] border border-neutral-100 ${className}`}>
        <p className="text-xs text-neutral-400 text-center py-4">No recent activity yet. Start exploring!</p>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-white rounded-[2rem] border border-neutral-100 ${className}`}>
      <h4 className="text-xs font-bold text-foreground mb-1">Recent Activity</h4>
      <div className="divide-y divide-neutral-50">
        {items.map((item) => (
          <ActivityItemRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};
