import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";

import { useAuthStore } from "./auth.store";

export type NotificationType = "appointment" | "learning" | "system" | "message" | "alert";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO string
  unread: boolean;
  examId?: string;
  testId?: string;
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
          // Instant memory lookup instead of slow remote supabase.auth.getUser() call
          const currentUser = useAuthStore.getState().currentUser;
          const userId = currentUser?.id;

          let notifQuery = supabase
            .from("coaching_notifications")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(40);

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

          // Retain read status of existing notifications so reading isn't reset on refresh
          const currentNotifications = get().notifications;
          const readStatusMap = new Map<string, boolean>();
          currentNotifications.forEach((n) => {
            readStatusMap.set(n.id, n.unread);
          });

          if (notifsRes.data) {
            notifsRes.data.forEach((n: any) => {
              const id = `cn-${n.id}`;
              const previouslyUnread = readStatusMap.has(id) ? readStatusMap.get(id)! : (n.is_read !== true);
              liveItems.push({
                id,
                type: n.category === "live" ? "alert" : n.category === "test" ? "alert" : "learning",
                title: n.title,
                message: n.message,
                timestamp: n.created_at || new Date().toISOString(),
                unread: previouslyUnread,
                examId: n.exam_id || undefined,
                testId: n.test_id || undefined,
              });
            });
          }

          if (annsRes.data) {
            annsRes.data.forEach((a: any) => {
              // Avoid duplicate if already in notifications
              if (!liveItems.some((item) => item.title === a.title)) {
                const id = `ann-${a.id}`;
                const previouslyUnread = readStatusMap.has(id) ? readStatusMap.get(id)! : true;
                liveItems.push({
                  id,
                  type: "learning",
                  title: a.title,
                  message: a.content,
                  timestamp: a.created_at || new Date().toISOString(),
                  unread: previouslyUnread,
                  examId: a.exam_id || undefined,
                });
              }
            });
          }

          // Sort descending by date
          liveItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

          // Reconcile: Purge stale/deleted server notifications from local state
          // Keep only local custom notifications and the current active server items
          set((state) => {
            const localCustomItems = state.notifications.filter(
              (n) => !n.id.startsWith("cn-") && !n.id.startsWith("ann-")
            );
            return {
              notifications: [...liveItems, ...localCustomItems],
              isLoading: false,
            };
          });
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
