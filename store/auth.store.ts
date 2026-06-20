import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Simple random ID generator for local testing
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export interface User {
  id: string;
  phone: string;
  username: string;
  email: string;
  createdAt: string;
}

interface AuthState {
  users: User[];
  currentUser: User | null;
  
  // Actions
  signup: (phone: string, username: string, email: string) => User;
  login: (phone: string) => User | null;
  logout: () => void;
  getUserById: (id: string) => User | undefined;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,

      signup: (phone, username, email) => {
        // Check if user already exists
        const existing = get().users.find(u => u.phone === phone);
        if (existing) {
          throw new Error("Phone number already registered.");
        }

        const newUser: User = {
          id: generateId(),
          phone,
          username,
          email,
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          users: [...state.users, newUser],
          currentUser: newUser, // auto-login on signup
        }));

        return newUser;
      },

      login: (phone) => {
        const user = get().users.find(u => u.phone === phone);
        if (user) {
          set({ currentUser: user });
          return user;
        }
        return null;
      },

      logout: () => {
        set({ currentUser: null });
      },

      getUserById: (id) => {
        return get().users.find(u => u.id === id);
      }
    }),
    {
      name: "relicus-auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
