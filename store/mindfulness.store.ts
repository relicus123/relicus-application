import { create } from 'zustand';

interface MindfulnessStore {
  completedActivities: string[];
  toggleActivityComplete: (id: string) => void;
  journalEntries: any[];
  addJournalEntry: (entry: any) => void;
}

export const useMindfulnessStore = create<MindfulnessStore>((set) => ({
  completedActivities: [],
  toggleActivityComplete: (id) => set((state) => ({
    completedActivities: state.completedActivities.includes(id)
      ? state.completedActivities.filter((i) => i !== id)
      : [...state.completedActivities, id]
  })),
  journalEntries: [],
  addJournalEntry: (entry) => set((state) => ({ journalEntries: [entry, ...state.journalEntries] })),
}));
