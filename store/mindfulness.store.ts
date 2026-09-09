import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  activities: any[];
  affirmations: string[];
  tasks: any[];
  isLoading: boolean;
  isSyncing: boolean;

  fetchMindfulnessData: () => Promise<void>;
  fetchAllMindfulnessContent: (forceRefresh?: boolean) => Promise<void>;
  toggleActivityComplete: (id: string) => Promise<void>;
  addJournalEntry: (entry: JournalEntry) => Promise<void>;
}

export const useMindfulnessStore = create<MindfulnessStore>()(
  persist(
    (set, get) => ({
      completedActivities: [],
      journalEntries: [],
      activities: [],
      affirmations: [],
      tasks: [],
      isLoading: false,
      isSyncing: false,

      fetchAllMindfulnessContent: async (forceRefresh = false) => {
        const { activities, affirmations, tasks } = get();
        const hasCache = activities.length > 0;

        if (!hasCache || forceRefresh) {
          set({ isLoading: !hasCache, isSyncing: true });
        }

        try {
          const [actsRes, affsRes, tasksRes] = await Promise.all([
            supabase.from('mindfulness_activities').select('*'),
            supabase.from('mindfulness_affirmations').select('*'),
            supabase.from('mindfulness_tasks').select('*'),
          ]);

          if (actsRes.data) set({ activities: actsRes.data });
          if (affsRes.data) set({ affirmations: affsRes.data.map((a: any) => a.text) });
          if (tasksRes.data) set({ tasks: tasksRes.data });

          await get().fetchMindfulnessData();
        } catch (error) {
          console.error('Error fetching mindfulness content:', error);
        } finally {
          set({ isLoading: false, isSyncing: false });
        }
      },

      fetchMindfulnessData: async () => {
        try {
          const currentUser = useAuthStore.getState().currentUser;
          if (!currentUser) return;

          const [
            { data: activities },
            { data: journals },
          ] = await Promise.all([
            supabase.from('mindfulness_user_activities').select('activity_id').eq('user_id', currentUser.id),
            supabase.from('mindfulness_journals').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
          ]);

          set({
            completedActivities: activities ? activities.map((a) => a.activity_id) : [],
            journalEntries: journals || [],
          });
        } catch (e) {
          console.error('Error fetching mindfulness data:', e);
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
            : [...completedActivities, activityId],
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
          set({ completedActivities });
        }
      },

      addJournalEntry: async (entry) => {
        const currentUser = useAuthStore.getState().currentUser;
        if (!currentUser) return;

        try {
          const { data, error } = await supabase
            .from('mindfulness_journals')
            .insert([
              {
                user_id: currentUser.id,
                title: entry.title,
                content: entry.content,
                mood: entry.mood,
              },
            ])
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            journalEntries: [data as JournalEntry, ...state.journalEntries],
          }));
        } catch (e) {
          console.error('Error saving journal entry:', e);
        }
      },
    }),
    {
      name: 'relicus-mindfulness-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
