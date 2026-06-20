import React from "react";

interface DeadlineCountdownBadgeProps {
  deadline: string; // ISO date string
  className?: string;
}

export const DeadlineCountdownBadge: React.FC<DeadlineCountdownBadgeProps> = ({
  deadline,
  className = "",
}) => {
  const daysLeft = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (daysLeft < 0) {
    return (
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold bg-neutral-100 text-neutral-400 ${className}`}>
        Closed
      </span>
    );
  }

  const isUrgent = daysLeft <= 15;
  const isWarning = daysLeft > 15 && daysLeft <= 30;

  const colorClasses = isUrgent
    ? "bg-red-50 text-red-600 border border-red-200"
    : isWarning
    ? "bg-orange-50 text-orange-600 border border-orange-200"
    : "bg-green-50 text-green-600 border border-green-200";

  const emoji = isUrgent ? "🔴" : isWarning ? "🟠" : "🟢";

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${colorClasses} ${className}`}>
      {emoji} {daysLeft} {daysLeft === 1 ? "day" : "days"} left
    </span>
  );
};
