import { create } from 'zustand';

interface Doubt {
  id: string;
  examType: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  responses: any[];
}

interface TestAttempt {
  id: string;
  testId: string;
  testName: string;
  examType: string;
  date: string;
  score: number;
  maxScore: number;
  accuracy: number;
  rank: number;
  percentile: number;
  timeTaken: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  answers: any[];
  topicAnalysis: any[];
  sectionAnalysis: any[];
}

interface CoachingStore {
  selectedExam: string | null;
  setSelectedExam: (exam: string | null) => void;
  doubts: Doubt[];
  addDoubt: (doubt: Doubt) => void;
  learningStreak: number;
  testAttempts: TestAttempt[];
  addTestAttempt: (attempt: TestAttempt) => void;
}

export const useCoachingStore = create<CoachingStore>((set) => ({
  selectedExam: null,
  setSelectedExam: (exam) => set({ selectedExam: exam }),
  doubts: [],
  addDoubt: (doubt) => set((state) => ({ doubts: [doubt, ...state.doubts] })),
  learningStreak: 0,
  testAttempts: [],
  addTestAttempt: (attempt) => set((state) => ({ testAttempts: [attempt, ...state.testAttempts] })),
}));
