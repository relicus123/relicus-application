import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  addNotification: (notification: Omit<AppNotification, "id" | "timestamp" | "unread">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      notifications: [],
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
    }),
    {
      name: "relicus-notifications-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
