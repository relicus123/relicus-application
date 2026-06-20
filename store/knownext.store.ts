import { create } from 'zustand';

interface KnowNextStore {
  activeStage: string;
  setActiveStage: (stage: string) => void;
  savedCareerIds: string[];
  toggleSaveCareer: (id: string) => void;
  setCareerGoal: (id: string) => void;
  setActiveRoadmap: (id: string) => void;
  clearCareerComparison: () => void;
  activeRoadmapId: string | null;
  getRoadmapProgressPercent: (roadmapId?: string, totalSteps?: number) => number;
  completeRoadmapStep: (roadmapId: string, stepId: string) => void;
  getCompletedSteps: (roadmapId?: string) => string[];
  savedCollegeIds: string[];
  savedScholarshipIds: string[];
  recentActivity: any[];
  fetchAllData: () => void;
  toggleSaveCollege: (id: string) => void;
  compareCollegeIds: string[];
  toggleCompareCollege: (id: string) => void;
  clearCollegeComparison: () => void;
  compareCareerIds: string[];
  toggleCompareCareer: (id: string) => void;
  careerGoalId: string | null;
  toggleSaveScholarship: (id: string) => void;
}

export const useKnowNextStore = create<KnowNextStore>((set, get) => ({
  activeStage: "all",
  setActiveStage: (stage) => set({ activeStage: stage }),
  savedCareerIds: [],
  toggleSaveCareer: (id) => set((state) => ({
    savedCareerIds: state.savedCareerIds.includes(id)
      ? state.savedCareerIds.filter((i) => i !== id)
      : [...state.savedCareerIds, id]
  })),
  setCareerGoal: (id) => set({ careerGoalId: id }),
  setActiveRoadmap: (id) => set({ activeRoadmapId: id }),
  clearCareerComparison: () => set({ compareCareerIds: [] }),
  activeRoadmapId: null,
  getRoadmapProgressPercent: () => 50,
  completeRoadmapStep: () => {},
  getCompletedSteps: () => [],
  savedCollegeIds: [],
  savedScholarshipIds: [],
  recentActivity: [],
  fetchAllData: () => {},
  toggleSaveCollege: (id) => set((state) => ({
    savedCollegeIds: state.savedCollegeIds.includes(id)
      ? state.savedCollegeIds.filter((i) => i !== id)
      : [...state.savedCollegeIds, id]
  })),
  compareCollegeIds: [],
  toggleCompareCollege: (id) => set((state) => ({
    compareCollegeIds: state.compareCollegeIds.includes(id)
      ? state.compareCollegeIds.filter((i) => i !== id)
      : [...state.compareCollegeIds, id]
  })),
  clearCollegeComparison: () => set({ compareCollegeIds: [] }),
  compareCareerIds: [],
  toggleCompareCareer: (id) => set((state) => ({
    compareCareerIds: state.compareCareerIds.includes(id)
      ? state.compareCareerIds.filter((i) => i !== id)
      : [...state.compareCareerIds, id]
  })),
  careerGoalId: null,
  toggleSaveScholarship: (id) => set((state) => ({
    savedScholarshipIds: state.savedScholarshipIds.includes(id)
      ? state.savedScholarshipIds.filter((i) => i !== id)
      : [...state.savedScholarshipIds, id]
  })),
}));
