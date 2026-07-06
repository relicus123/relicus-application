import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './auth.store';

export interface JournalEntry {
  id?: string;
  title?: string;
  content: string;
  mood?: string;
  created_at?: string;
}

interface MindfulnessStore {
  completedActivities: string[];
  journalEntries: JournalEntry[];
  isLoading: boolean;
  
  fetchMindfulnessData: () => Promise<void>;
  toggleActivityComplete: (id: string) => Promise<void>;
  addJournalEntry: (entry: JournalEntry) => Promise<void>;
}

export const useMindfulnessStore = create<MindfulnessStore>((set, get) => ({
  completedActivities: [],
  journalEntries: [],
  isLoading: true,
  
  fetchMindfulnessData: async () => {
    set({ isLoading: true });
    try {
      const currentUser = useAuthStore.getState().currentUser;
      if (!currentUser) throw new Error("Not logged in");

      const { data: activities } = await supabase
        .from('mindfulness_user_activities')
        .select('activity_id')
        .eq('user_id', currentUser.id);

      const { data: journals } = await supabase
        .from('mindfulness_journals')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      set({
        completedActivities: activities ? activities.map(a => a.activity_id) : [],
        journalEntries: journals || [],
      });
    } catch (e) {
      console.error("Error fetching mindfulness data:", e);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleActivityComplete: async (activityId) => {
    const { completedActivities } = get();
    const isCompleted = completedActivities.includes(activityId);
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) return;

    // Optimistic update
    set({
      completedActivities: isCompleted
        ? completedActivities.filter((id) => id !== activityId)
        : [...completedActivities, activityId]
    });

    try {
      if (isCompleted) {
        await supabase
          .from('mindfulness_user_activities')
          .delete()
          .match({ user_id: currentUser.id, activity_id: activityId });
      } else {
        await supabase
          .from('mindfulness_user_activities')
          .insert([{ user_id: currentUser.id, activity_id: activityId }]);
      }
    } catch (e) {
      console.error(e);
      // Revert on error
      set({ completedActivities });
    }
  },

  addJournalEntry: async (entry) => {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('mindfulness_journals')
        .insert([{ 
          user_id: currentUser.id,
          title: entry.title,
          content: entry.content,
          mood: entry.mood 
        }])
        .select()
        .single();

      if (error) throw error;
      
      set((state) => ({ 
        journalEntries: [data as JournalEntry, ...state.journalEntries] 
      }));
    } catch (e) {
      console.error("Error saving journal entry:", e);
    }
  },
}));
