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
  lastActiveDate: string | null;
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
  notesByExam: Record<string, any[]>;

  fetchCoachingData: () => Promise<void>;
  fetchCategoriesAndExams: (forceRefresh?: boolean) => Promise<void>;
  fetchExamDashboard: (examId: string, forceRefresh?: boolean) => Promise<void>;
  fetchChapters: (subjectId: string, forceRefresh?: boolean) => Promise<void>;
  setSelectedExam: (exam: string | null) => Promise<void>;
  recordDailyActivity: () => Promise<number>;
  addDoubt: (doubt: Doubt) => Promise<void>;
  addTestAttempt: (attempt: TestAttempt) => Promise<void>;
  clearTestAttempts: () => Promise<void>;
}

export const useCoachingStore = create<CoachingStore>()(
  persist(
    (set, get) => ({
      selectedExam: null,
      learningStreak: 0,
      lastActiveDate: null,
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
      notesByExam: {},

      fetchCategoriesAndExams: async (forceRefresh = false) => {
        const { categories, exams } = get();
        const hasCache = categories.length > 0 && exams.length > 0;

        if (!hasCache || forceRefresh) {
          set({ isLoading: !hasCache, isSyncing: true });
        }

        try {
          const [catsRes, examsRes] = await Promise.all([
            supabase.from('coaching_exam_categories').select('*'),
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
          const [examRes, subjectsRes, liveRes, testsRes, notesRes] = await Promise.all([
            supabase.from('coaching_exams').select('*').eq('id', examId).maybeSingle(),
            supabase.from('coaching_subjects').select('*').eq('exam_id', examId),
            supabase.from('coaching_live_classes').select('*').eq('exam_id', examId),
            supabase.from('coaching_mock_tests').select('*, questions:coaching_mock_questions(id)').eq('exam_id', examId),
            supabase.from('coaching_notes').select('*, chapter:coaching_chapters(name, subject_id)'),
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
            const mappedTests = (testsRes.data || []).map((t: any) => ({
              ...t,
              questions_count: t.questions ? t.questions.length : (t.questions_count || 0),
            }));
            set((state) => ({
              mockTestsByExam: {
                ...state.mockTestsByExam,
                [examId]: mappedTests,
              },
            }));
          }

          if (notesRes.data) {
            const subjectIds = (subjectsRes.data || []).map((s: any) => s.id);
            const examNotes = (notesRes.data || []).filter((n: any) => 
              subjectIds.includes(n.chapter?.subject_id) || !n.chapter?.subject_id
            );
            set((state) => ({
              notesByExam: {
                ...state.notesByExam,
                [examId]: examNotes,
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
            .select('*, videos:coaching_videos(*), notes:coaching_notes(*), practiceQuestions:coaching_practice_questions(*)')
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
            supabase.from('coaching_profiles').select('*').eq('user_id', currentUser.id).maybeSingle(),
            supabase.from('coaching_doubts').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
            supabase.from('coaching_test_attempts').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
          ]);

          if (profile) {
            let streakVal = profile.learning_streak ?? profile.study_streak ?? profile.streak_count ?? 1;
            if (profile.updated_at) {
              try {
                const lastActiveDay = new Date(profile.updated_at).toISOString().split('T')[0];
                const todayDay = new Date().toISOString().split('T')[0];
                const diffDays = Math.round((new Date(todayDay).getTime() - new Date(lastActiveDay).getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays > 1) {
                  streakVal = 1;
                }
              } catch (_) {}
            }
            set({
              selectedExam: profile.selected_exam || profile.selected_exam_id || profile.target_exam || null,
              learningStreak: streakVal,
            });
          } else {
            set({
              selectedExam: null,
              learningStreak: 1,
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
        try {
          await supabase.from('coaching_profiles').upsert(
            [
              {
                user_id: currentUser.id,
                selected_exam: exam,
                selected_exam_id: exam,
                target_exam: exam,
                learning_streak: get().learningStreak,
                study_streak: get().learningStreak,
                streak_count: get().learningStreak,
                updated_at: new Date().toISOString(),
              },
            ],
            { onConflict: 'user_id' }
          );
        } catch (e) {
          console.warn('Coaching profile upsert notice:', e);
        }
      },

      recordDailyActivity: async () => {
        const todayStr = new Date().toISOString().split('T')[0];
        const { lastActiveDate, learningStreak } = get();

        let newStreak = 1;
        if (!lastActiveDate) {
          newStreak = 1;
        } else if (lastActiveDate === todayStr) {
          newStreak = Math.max(1, learningStreak || 1);
        } else {
          try {
            const lastDate = new Date(lastActiveDate);
            const today = new Date(todayStr);
            const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
              newStreak = (learningStreak || 0) + 1;
            } else {
              newStreak = 1;
            }
          } catch (_) {
            newStreak = 1;
          }
        }

        set({ learningStreak: newStreak, lastActiveDate: todayStr });

        const currentUser = useAuthStore.getState().currentUser;
        if (currentUser) {
          try {
            await supabase.from('coaching_profiles').upsert(
              [
                {
                  user_id: currentUser.id,
                  learning_streak: newStreak,
                  study_streak: newStreak,
                  streak_count: newStreak,
                  updated_at: new Date().toISOString(),
                },
              ],
              { onConflict: 'user_id' }
            );
          } catch (e) {
            console.warn('Coaching streak upsert notice:', e);
          }
        }
        return newStreak;
      },

      addDoubt: async (doubt) => {
        const currentUser = useAuthStore.getState().currentUser;
        if (!currentUser) return;

        try {
          // Pre-emptively ensure user exists in public.users in case legacy foreign key constraint is active
          try {
            await supabase.from("users").upsert([
              {
                id: currentUser.id,
                email: currentUser.email,
                username: currentUser.username,
                phone: currentUser.phone || "",
              },
            ], { onConflict: "id" });
          } catch {}

          const payload: any = {
            user_id: currentUser.id,
            exam_type: doubt.examType,
            title: doubt.title,
            description: doubt.description,
            question: doubt.description || doubt.title,
            user_email: currentUser.email,
            user_name: currentUser.username,
            status: doubt.status || "open",
            responses: doubt.responses || [],
          };

          const { data, error } = await supabase
            .from('coaching_doubts')
            .insert([payload])
            .select()
            .single();

          if (error) throw error;

          const newDoubt: Doubt = {
            id: data.id,
            examType: data.exam_type,
            title: data.title,
            description: data.description || data.question,
            status: data.status,
            createdAt: data.created_at,
            responses: data.responses || [],
          };

          set((state) => ({ doubts: [newDoubt, ...state.doubts] }));
        } catch (e: any) {
          console.error("Error submitting coaching doubt:", e);
          throw e;
        }
      },

      addTestAttempt: async (attempt) => {
        const localId = attempt.id || `attempt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        const localDate = attempt.date || new Date().toISOString();

        const newAttempt: TestAttempt = {
          id: localId,
          testId: attempt.testId,
          testName: attempt.testName,
          examType: attempt.examType,
          date: localDate,
          score: attempt.score,
          maxScore: attempt.maxScore ?? (attempt as any).max_score ?? 100,
          accuracy: attempt.accuracy,
          rank: attempt.rank || 1,
          percentile: attempt.percentile || attempt.accuracy || 100,
          timeTaken: attempt.timeTaken,
          correctCount: attempt.correctCount,
          incorrectCount: attempt.incorrectCount,
          unattemptedCount: attempt.unattemptedCount,
          answers: attempt.answers || [],
          topicAnalysis: attempt.topicAnalysis || [],
          sectionAnalysis: attempt.sectionAnalysis || [],
        };

        // Instantly add to local state and cache
        set((state) => ({ testAttempts: [newAttempt, ...state.testAttempts] }));

        // Reward test completion with streak progress!
        await get().recordDailyActivity();

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
                max_score: attempt.maxScore ?? (attempt as any).max_score ?? 100,
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

          if (!error && data?.id) {
            set((state) => ({
              testAttempts: state.testAttempts.map((t) =>
                t.id === localId ? { ...t, id: data.id, date: data.created_at } : t
              ),
            }));
          }
        } catch (e) {
          console.warn('Coaching test attempt remote sync notice:', e);
        }
      },

      clearTestAttempts: async () => {
        try {
          const currentUser = useAuthStore.getState().currentUser;
          if (currentUser?.id) {
            await supabase.from('coaching_test_attempts').delete().eq('user_id', currentUser.id);
          }
        } catch (e) {
          console.error('Error clearing test attempts in db:', e);
        }
        set({ testAttempts: [] });
      },
    }),
    {
      name: 'relicus-coaching-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
