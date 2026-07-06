import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './auth.store';

export interface Doubt {
  id?: string;
  examType: string;
  title: string;
  description: string;
  status: string;
  createdAt?: string;
  responses: any[];
}

export interface TestAttempt {
  id?: string;
  testId: string;
  testName: string;
  examType: string;
  date?: string;
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
  learningStreak: number;
  doubts: Doubt[];
  testAttempts: TestAttempt[];
  isLoading: boolean;
  
  fetchCoachingData: () => Promise<void>;
  setSelectedExam: (exam: string | null) => Promise<void>;
  addDoubt: (doubt: Doubt) => Promise<void>;
  addTestAttempt: (attempt: TestAttempt) => Promise<void>;
}

export const useCoachingStore = create<CoachingStore>((set, get) => ({
  selectedExam: null,
  learningStreak: 0,
  doubts: [],
  testAttempts: [],
  isLoading: true,
  
  fetchCoachingData: async () => {
    set({ isLoading: true });
    try {
      const currentUser = useAuthStore.getState().currentUser;
      if (!currentUser) return;

      const { data: profile } = await supabase
        .from('coaching_profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();
        
      const { data: doubtsData } = await supabase
        .from('coaching_doubts')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      const { data: testsData } = await supabase
        .from('coaching_test_attempts')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (profile) {
        set({
          selectedExam: profile.selected_exam,
          learningStreak: profile.learning_streak,
        });
      }
      
      if (doubtsData) {
        set({
          doubts: doubtsData.map(d => ({
            id: d.id,
            examType: d.exam_type,
            title: d.title,
            description: d.description,
            status: d.status,
            createdAt: d.created_at,
            responses: d.responses || []
          }))
        });
      }
      
      if (testsData) {
        set({
          testAttempts: testsData.map(t => ({
            id: t.id,
            testId: t.test_id,
            testName: t.test_name,
            examType: t.exam_type,
            date: t.created_at,
            score: t.score,
            maxScore: t.max_score,
            accuracy: t.accuracy,
            rank: t.rank,
            percentile: t.percentile,
            timeTaken: t.time_taken,
            correctCount: t.correct_count,
            incorrectCount: t.incorrect_count,
            unattemptedCount: t.unattempted_count,
            answers: t.answers || [],
            topicAnalysis: t.topic_analysis || [],
            sectionAnalysis: t.section_analysis || []
          }))
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedExam: async (exam) => {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) return;
    
    set({ selectedExam: exam });
    await supabase.from('coaching_profiles').upsert([{ 
      user_id: currentUser.id, 
      selected_exam: exam,
      learning_streak: get().learningStreak
    }]);
  },
  
  addDoubt: async (doubt) => {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('coaching_doubts')
        .insert([{ 
          user_id: currentUser.id,
          exam_type: doubt.examType,
          title: doubt.title,
          description: doubt.description,
          status: doubt.status,
          responses: doubt.responses
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      const newDoubt: Doubt = {
        id: data.id,
        examType: data.exam_type,
        title: data.title,
        description: data.description,
        status: data.status,
        createdAt: data.created_at,
        responses: data.responses
      };
      
      set((state) => ({ doubts: [newDoubt, ...state.doubts] }));
    } catch (e) {
      console.error(e);
    }
  },
  
  addTestAttempt: async (attempt) => {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('coaching_test_attempts')
        .insert([{ 
          user_id: currentUser.id,
          test_id: attempt.testId,
          test_name: attempt.testName,
          exam_type: attempt.examType,
          score: attempt.score,
          max_score: attempt.maxScore,
          accuracy: attempt.accuracy,
          rank: attempt.rank,
          percentile: attempt.percentile,
          time_taken: attempt.timeTaken,
          correct_count: attempt.correctCount,
          incorrect_count: attempt.incorrectCount,
          unattempted_count: attempt.unattemptedCount,
          answers: attempt.answers,
          topic_analysis: attempt.topicAnalysis,
          section_analysis: attempt.sectionAnalysis
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      const newAttempt: TestAttempt = {
        id: data.id,
        testId: data.test_id,
        testName: data.test_name,
        examType: data.exam_type,
        date: data.created_at,
        score: data.score,
        maxScore: data.max_score,
        accuracy: data.accuracy,
        rank: data.rank,
        percentile: data.percentile,
        timeTaken: data.time_taken,
        correctCount: data.correct_count,
        incorrectCount: data.incorrect_count,
        unattemptedCount: data.unattempted_count,
        answers: data.answers,
        topicAnalysis: data.topic_analysis,
        sectionAnalysis: data.section_analysis
      };
      
      set((state) => ({ testAttempts: [newAttempt, ...state.testAttempts] }));
    } catch (e) {
      console.error(e);
    }
  },
}));
