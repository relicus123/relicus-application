import React, { useMemo } from "react";
import { Bell, Trash2, Video, ClipboardList, MessageSquare, BookOpen, CheckSquare, Clock } from "lucide-react";
import { ExamType } from "../types/exam.types";
import { useCoachingStore, CoachingNotification } from "../store/coaching.store";
import { EmptyState } from "../components/EmptyState";

interface NotificationsTabProps {
  examType: ExamType;
  extraData?: any;
}

export const NotificationsTab: React.FC<NotificationsTabProps> = React.memo(({ examType }) => {
  const store = useCoachingStore();

  const notifications = useMemo(() => {
    return store.notifications.filter((n) => n.examType === examType);
  }, [store.notifications, examType]);

  const handleMarkAsRead = (id: string) => {
    store.markNotificationAsRead(id);
  };

  const handleClearAll = () => {
    store.clearNotifications();
  };

  const getCategoryConfig = (category: CoachingNotification["category"]) => {
    switch (category) {
      case "live":
        return {
          icon: <Video className="w-4 h-4" />,
          colorClass: "bg-red-50 border-red-100 text-red-500",
        };
      case "test":
        return {
          icon: <ClipboardList className="w-4 h-4" />,
          colorClass: "bg-green-50 border-green-100 text-green-700",
        };
      case "doubt":
        return {
          icon: <MessageSquare className="w-4 h-4" />,
          colorClass: "bg-blue-50 border-blue-100 text-blue-500",
        };
      case "material":
        return {
          icon: <BookOpen className="w-4 h-4" />,
          colorClass: "bg-purple-50 border-purple-100 text-purple-500",
        };
      case "assignment":
        return {
          icon: <CheckSquare className="w-4 h-4" />,
          colorClass: "bg-orange-50 border-orange-100 text-orange-500",
        };
      case "announcement":
      default:
        return {
          icon: <Bell className="w-4 h-4" />,
          colorClass: "bg-indigo-50 border-indigo-100 text-indigo-500",
        };
    }
  };

  // Human friendly relative time format
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header & Clear All Action */}
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-base font-extrabold text-foreground px-1">Notifications</h3>
        {notifications.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1 text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-wider cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear All
          </button>
        )}
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notif) => {
            const config = getCategoryConfig(notif.category);
            return (
              <div
                key={notif.id}
                onClick={() => handleMarkAsRead(notif.id)}
                className={`p-4 bg-white border border-neutral-100 rounded-[2rem] shadow-xs flex items-start justify-between cursor-pointer transition-all hover:border-neutral-200 ${
                  !notif.isRead ? "border-l-4 border-l-primary" : ""
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0 pr-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${config.colorClass}`}>
                    {config.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-bold text-foreground leading-tight ${!notif.isRead ? "font-black" : "font-semibold"}`}>
                        {notif.title}
                      </h4>
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-relaxed mt-1">
                      {notif.message}
                    </p>
                    <span className="flex items-center gap-0.5 text-[8px] font-bold text-neutral-300 mt-2">
                      <Clock className="w-2.5 h-2.5" /> {formatTime(notif.timestamp)}
                    </span>
                  </div>
                </div>
                {!notif.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                )}
              </div>
            );
          })
        ) : (
          <EmptyState
            title="All Caught Up!"
            description="You have no notifications regarding coaching classes or material updates at this time."
            icon={Bell}
          />
        )}
      </div>
    </div>
  );
});

NotificationsTab.displayName = "NotificationsTab";
