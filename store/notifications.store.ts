import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";

export type NotificationType = "appointment" | "learning" | "system" | "message" | "alert";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO string
  unread: boolean;
}

interface NotificationsState {
  notifications: AppNotification[];
  isLoading: boolean;
  addNotification: (notification: Omit<AppNotification, "id" | "timestamp" | "unread">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  fetchLiveNotifications: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],
      isLoading: false,
      addNotification: (notif) =>
        set((state) => {
          const newNotif: AppNotification = {
            ...notif,
            id: `notif-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            unread: true,
          };
          return {
            notifications: [newNotif, ...state.notifications],
          };
        }),
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, unread: false } : n
          ),
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, unread: false })),
        })),
      clearAll: () => set({ notifications: [] }),

      fetchLiveNotifications: async () => {
        set({ isLoading: true });
        try {
          const { data: authData } = await supabase.auth.getUser();
          const userId = authData?.user?.id;

          let notifQuery = supabase
            .from("coaching_notifications")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(30);

          if (userId) {
            notifQuery = notifQuery.or(`target_user_id.is.null,target_user_id.eq.${userId}`);
          } else {
            notifQuery = notifQuery.is("target_user_id", null);
          }

          const [notifsRes, annsRes] = await Promise.all([
            notifQuery,
            supabase
              .from("coaching_announcements")
              .select("*")
              .order("created_at", { ascending: false })
              .limit(20),
          ]);

          const liveItems: AppNotification[] = [];

          if (notifsRes.data) {
            notifsRes.data.forEach((n: any) => {
              liveItems.push({
                id: `cn-${n.id}`,
                type: n.category === "live" ? "alert" : n.category === "test" ? "alert" : "learning",
                title: n.title,
                message: n.message,
                timestamp: n.created_at || new Date().toISOString(),
                unread: true,
              });
            });
          }

          if (annsRes.data) {
            annsRes.data.forEach((a: any) => {
              // Avoid duplicate if already in notifications
              if (!liveItems.some((item) => item.title === a.title)) {
                liveItems.push({
                  id: `ann-${a.id}`,
                  type: "learning",
                  title: a.title,
                  message: a.content,
                  timestamp: a.created_at || new Date().toISOString(),
                  unread: true,
                });
              }
            });
          }

          if (liveItems.length > 0) {
            set((state) => {
              const existingIds = new Set(state.notifications.map((n) => n.id));
              const newItems = liveItems.filter((item) => !existingIds.has(item.id));
              return {
                notifications: [...newItems, ...state.notifications],
                isLoading: false,
              };
            });
          } else {
            set({ isLoading: false });
          }
        } catch (err) {
          console.error("Error fetching live notifications:", err);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "relicus-notifications-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
