import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";

export interface User {
  id: string;
  phone: string;
  username: string;
  email: string;
  role?: string;
  created_at?: string;
}

interface AuthState {
  currentUser: User | null;
  
  // Actions
  signup: (phone: string, username: string, email: string) => Promise<User>;
  login: (phone: string) => Promise<User | null>;
  loginWithGoogle: (googleUserInfo?: { email?: string; username?: string }) => Promise<User>;
  logout: () => void;
  getUserById: (id: string) => Promise<User | undefined>;
  hydrate: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,

      signup: async (phone, username, email) => {
        // Check if user already exists
        const { data: existing } = await supabase
          .from("users")
          .select("*")
          .eq("phone", phone)
          .maybeSingle();

        if (existing) {
          throw new Error("Phone number already registered.");
        }

        const { data, error } = await supabase
          .from("users")
          .insert([{ phone, username, email }])
          .select()
          .single();

        if (error) {
          throw new Error("Failed to create account. " + error.message);
        }

        set({ currentUser: data as User });
        return data as User;
      },

      login: async (phone) => {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("phone", phone)
          .maybeSingle();

        if (error || !data) {
          return null;
        }

        set({ currentUser: data as User });
        return data as User;
      },

      loginWithGoogle: async (googleUserInfo?: { email?: string; username?: string }) => {
        const email = googleUserInfo?.email || "ashok.google@relicus.com";
        const username = googleUserInfo?.username || "ashok";

        try {
          // Check if user already exists
          const { data: existing } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .maybeSingle();

          if (existing) {
            set({ currentUser: existing as User });
            return existing as User;
          }

          // Create new user profile for Google login
          const { data, error } = await supabase
            .from("users")
            .insert([{
              phone: "+91 98765 43210",
              username,
              email,
              role: "student"
            }])
            .select()
            .single();

          if (error || !data) {
            // Local fallback user for offline / demo environments
            const demoUser: User = {
              id: "usr_google_demo_" + Date.now(),
              phone: "+91 98765 43210",
              username,
              email,
              role: "student",
              created_at: new Date().toISOString()
            };
            set({ currentUser: demoUser });
            return demoUser;
          }

          set({ currentUser: data as User });
          return data as User;
        } catch {
          const fallbackUser: User = {
            id: "usr_google_demo_" + Date.now(),
            phone: "+91 98765 43210",
            username,
            email,
            role: "student",
            created_at: new Date().toISOString()
          };
          set({ currentUser: fallbackUser });
          return fallbackUser;
        }
      },

      logout: () => {
        set({ currentUser: null });
      },

      getUserById: async (id) => {
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        
        return data as User | undefined;
      },

      hydrate: async () => {},

      updateProfile: async (updates) => {
        const { currentUser } = get();
        if (!currentUser) return;

        const { error, data } = await supabase
          .from("users")
          .update(updates)
          .eq("id", currentUser.id)
          .select()
          .single();

        if (error) {
          console.error("Failed to update profile:", error);
          throw new Error("Failed to update profile. " + error.message);
        }

        set({ currentUser: data as User });
      }
    }),
    {
      name: "relicus-auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
