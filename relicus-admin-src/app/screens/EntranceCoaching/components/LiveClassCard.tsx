import React from "react";
import { Clock, Video, Play, Calendar } from "lucide-react";

interface LiveClassCardProps {
  subject: string;
  topic: string;
  time: string;
  type: "Live" | "Recorded" | "Upcoming";
  onAction: () => void;
}

export const LiveClassCard: React.FC<LiveClassCardProps> = React.memo(({
  subject,
  topic,
  time,
  type,
  onAction,
}) => {
  const getBadgeStyles = () => {
    switch (type) {
      case "Live":
        return "bg-red-50 border border-red-100 text-red-600 animate-pulse";
      case "Recorded":
        return "bg-neutral-50 border border-neutral-100 text-neutral-500";
      default:
        return "bg-blue-50 border border-blue-100 text-blue-600";
    }
  };

  return (
    <div className="p-5 bg-white border border-neutral-100 rounded-[2rem] hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <h5 className="font-bold text-foreground text-sm uppercase tracking-wide">
              {subject}
            </h5>
            <span className={`px-2.5 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wider ${getBadgeStyles()}`}>
              {type === "Upcoming" ? "Scheduled" : type}
            </span>
          </div>
          <h4 className="font-bold text-neutral-700 text-base leading-tight truncate mb-2">
            {topic}
          </h4>
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            {type === "Recorded" ? <Clock className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
            <span>{time}</span>
          </div>
        </div>

        <button
          onClick={onAction}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
            type === "Live"
              ? "bg-[#D9534F] text-white hover:bg-[#C9302C]"
              : type === "Upcoming"
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          }`}
        >
          {type === "Live" ? (
            <Video className="w-5 h-5" />
          ) : type === "Upcoming" ? (
            <Calendar className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 fill-current" />
          )}
        </button>
      </div>
    </div>
  );
});

LiveClassCard.displayName = "LiveClassCard";
