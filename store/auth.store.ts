import { create } from "zustand";
import { supabase } from "../lib/supabase";

export interface User {
  id: string;
  phone: string;
  username: string;
  email: string;
  created_at?: string;
}

interface AuthState {
  currentUser: User | null;
  
  // Actions
  signup: (phone: string, username: string, email: string) => Promise<User>;
  login: (phone: string) => Promise<User | null>;
  logout: () => void;
  getUserById: (id: string) => Promise<User | undefined>;
  hydrate: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,

  signup: async (phone, username, email) => {
    // Check if user already exists
    const { data: existing } = await supabase
      .from("users")
      .select("*")
      .eq("phone", phone)
      .single();

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
      .single();

    if (error || !data) {
      return null;
    }

    set({ currentUser: data as User });
    return data as User;
  },

  logout: () => {
    set({ currentUser: null });
  },

  getUserById: async (id) => {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();
    
    return data as User | undefined;
  },

  hydrate: async () => {
    // Optionally restore session if we implement true Supabase auth later
  },

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
}));
