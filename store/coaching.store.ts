import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  isSyncing: boolean;

  // Cached content
  categories: any[];
  exams: any[];
  subjectsByExam: Record<string, any[]>;
  chaptersBySubject: Record<string, any[]>;
  liveClassesByExam: Record<string, any[]>;
  mockTestsByExam: Record<string, any[]>;

  fetchCoachingData: () => Promise<void>;
  fetchCategoriesAndExams: (forceRefresh?: boolean) => Promise<void>;
  fetchExamDashboard: (examId: string, forceRefresh?: boolean) => Promise<void>;
  fetchChapters: (subjectId: string, forceRefresh?: boolean) => Promise<void>;
  setSelectedExam: (exam: string | null) => Promise<void>;
  addDoubt: (doubt: Doubt) => Promise<void>;
  addTestAttempt: (attempt: TestAttempt) => Promise<void>;
}

export const useCoachingStore = create<CoachingStore>()(
  persist(
    (set, get) => ({
      selectedExam: null,
      learningStreak: 0,
      doubts: [],
      testAttempts: [],
      isLoading: false,
      isSyncing: false,

      categories: [],
      exams: [],
      subjectsByExam: {},
      chaptersBySubject: {},
      liveClassesByExam: {},
      mockTestsByExam: {},

      fetchCategoriesAndExams: async (forceRefresh = false) => {
        const { categories, exams } = get();
        const hasCache = categories.length > 0 && exams.length > 0;

        if (!hasCache || forceRefresh) {
          set({ isLoading: !hasCache, isSyncing: true });
        }

        try {
          const [catsRes, examsRes] = await Promise.all([
            supabase.from('coaching_exam_categories').select('*').order('sequence_number'),
            supabase.from('coaching_exams').select('*'),
          ]);

          if (catsRes.data) set({ categories: catsRes.data });
          if (examsRes.data) set({ exams: examsRes.data });
        } catch (err) {
          console.error('Error fetching categories & exams:', err);
        } finally {
          set({ isLoading: false, isSyncing: false });
        }
      },

      fetchExamDashboard: async (examId: string, forceRefresh = false) => {
        const { subjectsByExam } = get();
        const hasCache = !!subjectsByExam[examId] && subjectsByExam[examId].length > 0;

        if (!hasCache || forceRefresh) {
          set({ isSyncing: true });
        }

        try {
          const [examRes, subjectsRes, liveRes, testsRes] = await Promise.all([
            supabase.from('coaching_exams').select('*').eq('id', examId).single(),
            supabase.from('coaching_subjects').select('*').eq('exam_id', examId),
            supabase.from('coaching_live_classes').select('*').eq('exam_id', examId),
            supabase.from('coaching_mock_tests').select('*').eq('exam_id', examId),
          ]);

          if (examRes.data) {
            set((state) => ({
              exams: state.exams.some((e) => e.id === examId)
                ? state.exams.map((e) => (e.id === examId ? { ...e, ...examRes.data } : e))
                : [...state.exams, examRes.data],
            }));
          }

          if (subjectsRes.data) {
            set((state) => ({
              subjectsByExam: {
                ...state.subjectsByExam,
                [examId]: subjectsRes.data || [],
              },
            }));
          }

          if (liveRes.data) {
            set((state) => ({
              liveClassesByExam: {
                ...state.liveClassesByExam,
                [examId]: liveRes.data || [],
              },
            }));
          }

          if (testsRes.data) {
            set((state) => ({
              mockTestsByExam: {
                ...state.mockTestsByExam,
                [examId]: testsRes.data || [],
              },
            }));
          }
        } catch (err) {
          console.error('Error fetching exam dashboard:', err);
        } finally {
          set({ isSyncing: false });
        }
      },

      fetchChapters: async (subjectId: string, forceRefresh = false) => {
        const { chaptersBySubject } = get();
        if (chaptersBySubject[subjectId] && !forceRefresh) return;

        try {
          const { data } = await supabase
            .from('coaching_chapters')
            .select('*')
            .eq('subject_id', subjectId);

          if (data) {
            set((state) => ({
              chaptersBySubject: {
                ...state.chaptersBySubject,
                [subjectId]: data,
              },
            }));
          }
        } catch (err) {
          console.error('Error fetching chapters:', err);
        }
      },

      fetchCoachingData: async () => {
        try {
          const currentUser = useAuthStore.getState().currentUser;
          if (!currentUser) return;

          const [
            { data: profile },
            { data: doubtsData },
            { data: testsData },
          ] = await Promise.all([
            supabase.from('coaching_profiles').select('*').eq('user_id', currentUser.id).single(),
            supabase.from('coaching_doubts').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
            supabase.from('coaching_test_attempts').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
          ]);

          if (profile) {
            set({
              selectedExam: profile.selected_exam,
              learningStreak: profile.learning_streak,
            });
          }

          if (doubtsData) {
            set({
              doubts: doubtsData.map((d) => ({
                id: d.id,
                examType: d.exam_type,
                title: d.title,
                description: d.description,
                status: d.status,
                createdAt: d.created_at,
                responses: d.responses || [],
              })),
            });
          }

          if (testsData) {
            set({
              testAttempts: testsData.map((t) => ({
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
                sectionAnalysis: t.section_analysis || [],
              })),
            });
          }
        } catch (e) {
          console.error(e);
        }
      },

      setSelectedExam: async (exam) => {
        const currentUser = useAuthStore.getState().currentUser;
        if (!currentUser) return;

        set({ selectedExam: exam });
        await supabase.from('coaching_profiles').upsert([
          {
            user_id: currentUser.id,
            selected_exam: exam,
            learning_streak: get().learningStreak,
          },
        ]);
      },

      addDoubt: async (doubt) => {
        const currentUser = useAuthStore.getState().currentUser;
        if (!currentUser) return;

        try {
          const { data, error } = await supabase
            .from('coaching_doubts')
            .insert([
              {
                user_id: currentUser.id,
                exam_type: doubt.examType,
                title: doubt.title,
                description: doubt.description,
                status: doubt.status,
                responses: doubt.responses,
              },
            ])
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
            responses: data.responses,
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
            .insert([
              {
                user_id: currentUser.id,
                test_id: attempt.testId,
                test_name: attempt.testName,
                exam_type: attempt.examType,
                score: attempt.score,
                maxScore: attempt.maxScore,
                accuracy: attempt.accuracy,
                rank: attempt.rank,
                percentile: attempt.percentile,
                time_taken: attempt.timeTaken,
                correct_count: attempt.correctCount,
                incorrect_count: attempt.incorrectCount,
                unattempted_count: attempt.unattemptedCount,
                answers: attempt.answers,
                topic_analysis: attempt.topicAnalysis,
                section_analysis: attempt.sectionAnalysis,
              },
            ])
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
            sectionAnalysis: data.section_analysis,
          };

          set((state) => ({ testAttempts: [newAttempt, ...state.testAttempts] }));
        } catch (e) {
          console.error(e);
        }
      },
    }),
    {
      name: 'relicus-coaching-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
