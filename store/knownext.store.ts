import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './auth.store';

interface KnowNextStore {
  activeStage: string;
  setActiveStage: (stage: string) => void;
  savedCareerIds: string[];
  savedCollegeIds: string[];
  savedScholarshipIds: string[];
  
  careerGoalId: string | null;
  activeRoadmapId: string | null;
  completedRoadmapSteps: string[];
  
  compareCareerIds: string[];
  compareCollegeIds: string[];
  recentActivity: any[];
  isLoading: boolean;
  
  fetchKnowNextData: () => Promise<void>;
  
  toggleSaveCareer: (id: string) => Promise<void>;
  toggleSaveCollege: (id: string) => Promise<void>;
  toggleSaveScholarship: (id: string) => Promise<void>;
  
  setCareerGoal: (id: string) => Promise<void>;
  setActiveRoadmap: (id: string) => Promise<void>;
  
  completeRoadmapStep: (roadmapId: string, stepId: string) => Promise<void>;
  getRoadmapProgressPercent: (roadmapId?: string, totalSteps?: number) => number;
  getCompletedSteps: (roadmapId?: string) => string[];
  
  toggleCompareCareer: (id: string) => void;
  clearCareerComparison: () => void;
  toggleCompareCollege: (id: string) => void;
  clearCollegeComparison: () => void;
}

export const useKnowNextStore = create<KnowNextStore>((set, get) => ({
  activeStage: "all",
  setActiveStage: (stage) => set({ activeStage: stage }),
  
  savedCareerIds: [],
  savedCollegeIds: [],
  savedScholarshipIds: [],
  careerGoalId: null,
  activeRoadmapId: null,
  completedRoadmapSteps: [],
  
  compareCareerIds: [],
  compareCollegeIds: [],
  recentActivity: [],
  isLoading: true,
  
  fetchKnowNextData: async () => {
    set({ isLoading: true });
    try {
      const currentUser = useAuthStore.getState().currentUser;
      if (!currentUser) return;

      const { data: savedItems } = await supabase
        .from('knownext_saved_items')
        .select('*')
        .eq('user_id', currentUser.id);

      const { data: profile } = await supabase
        .from('knownext_profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();
        
      const { data: progress } = await supabase
        .from('knownext_roadmap_progress')
        .select('*')
        .eq('user_id', currentUser.id);

      if (savedItems) {
        set({
          savedCareerIds: savedItems.filter(i => i.item_type === 'career').map(i => i.item_id),
          savedCollegeIds: savedItems.filter(i => i.item_type === 'college').map(i => i.item_id),
          savedScholarshipIds: savedItems.filter(i => i.item_type === 'scholarship').map(i => i.item_id),
        });
      }

      if (profile) {
        set({
          careerGoalId: profile.career_goal_id,
          activeRoadmapId: profile.active_roadmap_id,
        });
      }
      
      if (progress) {
        set({ completedRoadmapSteps: progress.map(p => p.step_id) });
      }
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoading: false });
    }
  },
  
  toggleSaveCareer: async (id) => {
    const { savedCareerIds } = get();
    const isSaved = savedCareerIds.includes(id);
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) return;

    set({
      savedCareerIds: isSaved
        ? savedCareerIds.filter((i) => i !== id)
        : [...savedCareerIds, id]
    });

    try {
      if (isSaved) {
        await supabase.from('knownext_saved_items').delete().match({ user_id: currentUser.id, item_type: 'career', item_id: id });
      } else {
        await supabase.from('knownext_saved_items').insert([{ user_id: currentUser.id, item_type: 'career', item_id: id }]);
      }
    } catch (e) {
      console.error(e);
      set({ savedCareerIds });
    }
  },
  
  toggleSaveCollege: async (id) => {
    const { savedCollegeIds } = get();
    const isSaved = savedCollegeIds.includes(id);
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) return;

    set({
      savedCollegeIds: isSaved
        ? savedCollegeIds.filter((i) => i !== id)
        : [...savedCollegeIds, id]
    });

    try {
      if (isSaved) {
        await supabase.from('knownext_saved_items').delete().match({ user_id: currentUser.id, item_type: 'college', item_id: id });
      } else {
        await supabase.from('knownext_saved_items').insert([{ user_id: currentUser.id, item_type: 'college', item_id: id }]);
      }
    } catch (e) {
      console.error(e);
      set({ savedCollegeIds });
    }
  },
  
  toggleSaveScholarship: async (id) => {
    const { savedScholarshipIds } = get();
    const isSaved = savedScholarshipIds.includes(id);
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) return;

    set({
      savedScholarshipIds: isSaved
        ? savedScholarshipIds.filter((i) => i !== id)
        : [...savedScholarshipIds, id]
    });

    try {
      if (isSaved) {
        await supabase.from('knownext_saved_items').delete().match({ user_id: currentUser.id, item_type: 'scholarship', item_id: id });
      } else {
        await supabase.from('knownext_saved_items').insert([{ user_id: currentUser.id, item_type: 'scholarship', item_id: id }]);
      }
    } catch (e) {
      console.error(e);
      set({ savedScholarshipIds });
    }
  },
  
  setCareerGoal: async (id) => {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) return;
    
    set({ careerGoalId: id });
    await supabase.from('knownext_profiles').upsert([{ user_id: currentUser.id, career_goal_id: id }]);
  },
  
  setActiveRoadmap: async (id) => {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) return;
    
    set({ activeRoadmapId: id });
    await supabase.from('knownext_profiles').upsert([{ user_id: currentUser.id, active_roadmap_id: id }]);
  },
  
  completeRoadmapStep: async (roadmapId, stepId) => {
    const { completedRoadmapSteps } = get();
    if (completedRoadmapSteps.includes(stepId)) return;
    
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) return;

    set({ completedRoadmapSteps: [...completedRoadmapSteps, stepId] });
    
    await supabase.from('knownext_roadmap_progress').insert([{ 
      user_id: currentUser.id, 
      roadmap_id: roadmapId,
      step_id: stepId 
    }]);
  },
  
  getRoadmapProgressPercent: (roadmapId, totalSteps = 10) => {
    const completedCount = get().completedRoadmapSteps.length;
    if (totalSteps === 0) return 0;
    return Math.min(100, Math.round((completedCount / totalSteps) * 100));
  },
  
  getCompletedSteps: () => {
    return get().completedRoadmapSteps;
  },

  toggleCompareCareer: (id) => set((state) => ({
    compareCareerIds: state.compareCareerIds.includes(id)
      ? state.compareCareerIds.filter((i) => i !== id)
      : [...state.compareCareerIds, id]
  })),
  clearCareerComparison: () => set({ compareCareerIds: [] }),
  
  toggleCompareCollege: (id) => set((state) => ({
    compareCollegeIds: state.compareCollegeIds.includes(id)
      ? state.compareCollegeIds.filter((i) => i !== id)
      : [...state.compareCollegeIds, id]
  })),
  clearCollegeComparison: () => set({ compareCollegeIds: [] }),
}));
