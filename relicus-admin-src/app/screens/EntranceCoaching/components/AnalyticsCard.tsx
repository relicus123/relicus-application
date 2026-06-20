import React from "react";
import { LucideIcon } from "lucide-react";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  trend?: string;
  trendType?: "up" | "down" | "neutral";
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = React.memo(({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
  trendType = "neutral",
}) => {
  return (
    <div className="p-5 bg-white border border-neutral-100 rounded-[2rem] shadow-xs flex flex-col justify-between space-y-4">
      <div className="flex justify-between items-start">
        <div className={`w-12 h-12 ${iconBg} ${iconColor} rounded-2xl flex items-center justify-center shadow-xs`}>
          <Icon className="w-6 h-6" strokeWidth={2} />
        </div>
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            trendType === "up" 
              ? "bg-green-50 text-green-600" 
              : trendType === "down" 
              ? "bg-red-50 text-red-600" 
              : "bg-neutral-50 text-neutral-500"
          }`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <h4 className="text-3xl font-extrabold text-foreground leading-tight tracking-tight">
          {value}
        </h4>
        <p className="text-xs text-neutral-400 font-semibold mt-1">
          {title}
        </p>
      </div>
    </div>
  );
});

AnalyticsCard.displayName = "AnalyticsCard";
