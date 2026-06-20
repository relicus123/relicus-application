import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ExamType } from "../types/exam.types";
import { TestAttempt } from "../types/test.types";
import { Doubt, DoubtResponse } from "../types/doubt.types";
import { supabase } from "../../../services/supabaseClient";

// Dynamic imports are directly fetched from Supabase
import { EXAMS } from "../constants/exams";
import { EXAM_INFO } from "../constants/examInfo";

export interface BookmarkItem {
  id: string;
  type: "video" | "note" | "pyq" | "question" | "test";
  title: string;
  subtitle: string;
  examType: ExamType;
  path?: string;
  bookmarkedAt: string;
}

export interface RecentActivityItem {
  id: string;
  type: "video" | "chapter" | "test" | "note";
  title: string;
  subtitle: string;
  timestamp: string;
  path: string;
  examType: ExamType;
}

export interface CoachingNotification {
  id: string;
  category: "live" | "test" | "doubt" | "material" | "assignment" | "announcement";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  examType: ExamType;
}

export interface VideoProgressState {
  videoId: string;
  progress: number; // 0-100
  isWatched: boolean;
  lastUpdated: string;
}

export interface ChapterProgressState {
  chapterId: string;
  progress: number; // 0-100
}

// Sandbox data completely removed as per production directive

interface CoachingState {
  selectedExam: ExamType | null;
  learningStreak: number;
  lastStreakDate: string | null;
  videoProgress: Record<string, VideoProgressState>;
  chapterProgress: Record<string, ChapterProgressState>;
  bookmarks: BookmarkItem[];
  doubts: Doubt[];
  notifications: CoachingNotification[];
  testAttempts: TestAttempt[];
  recentActivity: RecentActivityItem[];
  dailyPlanDate: string | null;
  dailyPlanChecks: Record<string, boolean>;
  exams: any[];
  categories: any[];
  announcements: any[];
  liveClasses: any[];
  feedbacks: any[];

  // Actions
  setExams: (exams: any[]) => void;
  setCategories: (categories: any[]) => void;
  setAnnouncements: (announcements: any[]) => void;
  setLiveClasses: (liveClasses: any[]) => void;
  setFeedbacks: (feedbacks: any[]) => void;
  setNotifications: (notifications: any[]) => void;
  loadCoachingData: () => Promise<void>;
  
  // No local mutations. Everything is driven by Supabase refresh.

  setSelectedExam: (exam: ExamType | null) => void;
  incrementStreak: () => void;
  updateVideoProgress: (videoId: string, progress: number, isWatched: boolean) => void;
  updateChapterProgress: (chapterId: string, progress: number) => void;
  addBookmark: (bookmark: Omit<BookmarkItem, "bookmarkedAt">) => void;
  removeBookmark: (id: string) => void;
  addDoubt: (doubt: Doubt) => void;
  addDoubtResponse: (doubtId: string, response: DoubtResponse) => void;
  addTestAttempt: (attempt: TestAttempt) => void;
  addNotification: (notification: Omit<CoachingNotification, "id" | "isRead" | "timestamp">) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  addRecentActivity: (activity: Omit<RecentActivityItem, "timestamp">) => void;
  setDailyPlanCheck: (key: string, checked: boolean) => void;
  resetDailyPlan: (date: string) => void;
  resetStore: () => void;
}

export const useCoachingStore = create<CoachingState>()(
  persist(
    (set, get) => ({
      selectedExam: null,
      learningStreak: 12,
      lastStreakDate: null,
      videoProgress: {},
      chapterProgress: {},
      bookmarks: [],
      doubts: [],
      dailyPlanDate: null,
      dailyPlanChecks: {},
      notifications: [],
      testAttempts: [],
      recentActivity: [],
      exams: [],
      categories: [],
      announcements: [],
      liveClasses: [],
      feedbacks: [],

      setExams: (exams) => set({ exams }),
      setCategories: (categories) => set({ categories }),
      setAnnouncements: (announcements) => set({ announcements }),
      setLiveClasses: (liveClasses) => set({ liveClasses }),
      setFeedbacks: (feedbacks) => set({ feedbacks }),
      setNotifications: (notifications) => set({ notifications }),

      loadCoachingData: async () => {
        try {
          const { data: catData } = await supabase.from("coaching_exam_categories").select("*").order("sequence_number");
          const { data: examData } = await supabase.from("coaching_exams").select(`
            *,
            subjects:coaching_subjects(*),
            mockTests:coaching_mock_tests(
              *,
              questions:coaching_mock_questions(*)
            )
          `);
          const { data: annData } = await supabase.from("coaching_announcements").select("*").order("created_at", { ascending: false });
          const { data: liveData } = await supabase.from("coaching_live_classes").select("*");
          const { data: feedData } = await supabase.from("coaching_exam_feedback").select("*").order("created_at", { ascending: false });
          const { data: notifData } = await supabase.from("coaching_notifications").select("*").order("created_at", { ascending: false });

          set({
            categories: catData || [],
            exams: examData || [],
            announcements: annData || [],
            liveClasses: liveData || [],
            feedbacks: feedData || [],
            notifications: notifData ? notifData.map((n: any) => ({
              id: n.id,
              category: n.category || "announcement",
              title: n.title,
              message: n.message,
              timestamp: n.created_at,
              isRead: false,
              examType: n.exam_id,
            })) : get().notifications,
          });
        } catch (err) {
          console.error("Error loading Supabase coaching data:", err);
        }
      },

      // Sandbox mutations removed

      setSelectedExam: (exam) => set({ selectedExam: exam }),

      incrementStreak: () => {
        const todayStr = new Date().toDateString();
        const lastDate = get().lastStreakDate;
        
        if (lastDate !== todayStr) {
          set((state) => ({
            learningStreak: state.learningStreak + 1,
            lastStreakDate: todayStr,
          }));
        }
      },

      updateVideoProgress: (videoId, progress, isWatched) =>
        set((state) => ({
          videoProgress: {
            ...state.videoProgress,
            [videoId]: {
              videoId,
              progress,
              isWatched,
              lastUpdated: new Date().toISOString(),
            },
          },
        })),

      updateChapterProgress: (chapterId, progress) =>
        set((state) => ({
          chapterProgress: {
            ...state.chapterProgress,
            [chapterId]: { chapterId, progress },
          },
        })),

      addBookmark: (bookmark) =>
        set((state) => {
          if (state.bookmarks.some((b) => b.id === bookmark.id)) return {};
          return {
            bookmarks: [
              ...state.bookmarks,
              { ...bookmark, bookmarkedAt: new Date().toISOString() },
            ],
          };
        }),

      removeBookmark: (id) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== id),
        })),

      addDoubt: (doubt) =>
        set((state) => ({
          doubts: [doubt, ...state.doubts],
        })),

      addDoubtResponse: (doubtId, response) =>
        set((state) => ({
          doubts: state.doubts.map((doubt) =>
            doubt.id === doubtId
              ? {
                  ...doubt,
                  status: "answered" as const,
                  answeredAt: new Date().toISOString(),
                  responses: [...doubt.responses, response],
                }
              : doubt
          ),
        })),

      addTestAttempt: (attempt) =>
        set((state) => ({
          testAttempts: [attempt, ...state.testAttempts],
        })),

      addNotification: (notif) =>
        set((state) => ({
          notifications: [
            {
              ...notif,
              id: `notif-${Math.random().toString(36).substr(2, 9)}`,
              isRead: false,
              timestamp: new Date().toISOString(),
            },
            ...state.notifications,
          ],
        })),

      markNotificationAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),

      clearNotifications: () => set({ notifications: [] }),

      addRecentActivity: (activity) =>
        set((state) => {
          const filtered = state.recentActivity.filter(
            (act) => !(act.id === activity.id && act.type === activity.type)
          );
          return {
            recentActivity: [
              { ...activity, timestamp: new Date().toISOString() },
              ...filtered,
            ].slice(0, 15),
          };
        }),

      setDailyPlanCheck: (key, checked) =>
        set((state) => ({
          dailyPlanChecks: { ...state.dailyPlanChecks, [key]: checked },
        })),

      resetDailyPlan: (date) =>
        set({ dailyPlanDate: date, dailyPlanChecks: {} }),

      resetStore: () =>
        set({
          selectedExam: null,
          learningStreak: 12,
          lastStreakDate: null,
          videoProgress: {},
          chapterProgress: {},
          bookmarks: [],
          doubts: [],
          notifications: [],
          testAttempts: [],
          recentActivity: [],
          dailyPlanDate: null,
          dailyPlanChecks: {},
          exams: [],
          categories: [],
          announcements: [],
          liveClasses: [],
          feedbacks: [],
        }),
    }),
    {
      name: "relicus_coaching_store",
    }
  )
);
