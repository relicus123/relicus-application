import React from "react";
import { X, Check, Bell, Award, Video, FileText, Star, Inbox } from "lucide-react";
import { useSkillsStore, SkillNotification } from "../store/skills.store";

interface NotificationCenterProps {
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const notifications = useSkillsStore((state) => state.notifications);
  const markAsRead = useSkillsStore((state) => state.markNotificationAsRead);
  const markAllAsRead = useSkillsStore((state) => state.markAllNotificationsAsRead);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotifIcon = (cat: SkillNotification["category"]) => {
    switch (cat) {
      case "Certificate Ready":
        return <Award className="w-4 h-4 text-amber-500" />;
      case "New Workshop Available":
        return <Video className="w-4 h-4 text-purple-500" />;
      case "Assignment Graded":
        return <FileText className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="bg-neutral-50 w-full max-w-md h-full shadow-2xl flex flex-col border-l border-neutral-100 animate-slide-in">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex justify-between items-center bg-white shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-extrabold text-[#8FBDD7] uppercase tracking-widest block">
                Inbox Alerts
              </span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>
            <h4 className="font-bold text-foreground text-sm">Notification Center</h4>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[9px] font-black uppercase text-[#1C4966] tracking-wider hover:underline"
              >
                Mark All Read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-500 rounded-xl transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Box List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.isRead && markAsRead(notif.id)}
                className={`p-4 border rounded-[1.5rem] transition-all flex items-start gap-3.5 relative ${
                  notif.isRead
                    ? "bg-white border-neutral-100 opacity-70"
                    : "bg-gradient-to-br from-blue-50/50 to-white border-blue-100 shadow-xs cursor-pointer hover:border-blue-200"
                }`}
              >
                {/* Unread circle badge */}
                {!notif.isRead && (
                  <span className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full" />
                )}

                {/* Category Icon */}
                <div className="w-9 h-9 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center shrink-0">
                  {getNotifIcon(notif.category)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-center gap-2 mb-1">
                    <span className="text-[8px] font-black text-[#5F8B70] uppercase tracking-wider">
                      {notif.category}
                    </span>
                    <span className="text-[7.5px] text-neutral-400 font-bold">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <h6 className="text-[11px] font-extrabold text-foreground">{notif.title}</h6>
                  <p className="text-[10px] text-neutral-500 leading-relaxed font-medium mt-1 pr-3">
                    {notif.message}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-neutral-100 text-neutral-400 rounded-2xl flex items-center justify-center">
                <Inbox className="w-8 h-8" />
              </div>
              <div>
                <h5 className="font-bold text-foreground text-xs">Inbox is Empty</h5>
                <p className="text-[10px] text-neutral-400 max-w-[200px] mt-1.5 leading-relaxed">
                  We will notify you when assignments are graded or new workshops are posted.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default NotificationCenter;
