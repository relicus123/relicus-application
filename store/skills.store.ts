import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "./auth.store";

export interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  duration: string;
  thumbnail?: string;
  progress: number;
  completed: boolean;
}

export interface Material {
  id: string;
  title: string;
  type: "ppt" | "pdf" | "cheatsheet";
  downloadUrl: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  type: "practice" | "module" | "final";
  questions: Question[];
}

export interface Assignment {
  id: string;
  title: string;
  instructions: string;
  downloadUrl: string;
}

export interface CertificateRequest {
  id: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  recipientName: string;
  status: string;
  createdAt: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  materials: Material[];
  quizzes: Quiz[];
  assignments: Assignment[];
}

export interface Course {
  id: string;
  title: string;
  category: string;
  instructor: string;
  instructorTitle: string;
  instructorBio: string;
  instructorAvatar: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  rating: number;
  learnersCount: number;
  description: string;
  objectives: string[];
  skillsLearned: string[];
  thumbnail: string;
  modules: Module[];
}

export interface AssignmentSubmission {
  courseId: string;
  assignmentId: string;
  type: "pdf" | "zip" | "project" | "github";
  content: string;
  status: "Draft" | "Submitted" | "Pending Review" | "Reviewed" | "Completed";
  submittedAt: string;
  grade?: string;
  feedback?: string;
}

export interface Doubt {
  id: string;
  courseId: string;
  question: string;
  screenshotUrl?: string;
  pdfUrl?: string;
  status: "Resolved" | "Pending";
  submittedAt: string;
  responses: Array<{
    author: string;
    avatar: string;
    message: string;
    timestamp: string;
  }>;
}

export interface Bookmark {
  id: string;
  courseId: string;
  type: "video" | "note" | "assignment" | "resource" | "lesson";
  title: string;
  subtitle: string;
  itemId: string;
  bookmarkedAt: string;
}

export interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  recipientName: string;
  date: string;
  credentialId: string;
}

export interface SkillNotification {
  id: string;
  category: "Assignment Graded" | "New Workshop Available" | "Course Update" | "Certificate Ready" | "New Course Recommendation";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface ActivityLog {
  id: string;
  type: "Lesson Completed" | "Assignment Submitted" | "Quiz Passed" | "Certificate Earned" | "Workshop Attended";
  title: string;
  timestamp: string;
}

export interface CourseReview {
  id?: string;
  courseId: string;
  userId?: string;
  rating: number;
  reviewText?: string;
  comment?: string;
  completionDate?: string;
  date?: string;
}

// Helper to convert snake_case to camelCase
const snakeToCamel = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }
  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((acc: any, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = snakeToCamel(obj[key]);
      return acc;
    }, {});
  }
  return obj;
};

interface SkillsState {
  courses: Course[];
  enrolledCourseIds: Record<string, string[]>; // userId -> courseIds
  currentCourseId: string | null;
  lessonProgress: Record<string, { progress: number; completed: boolean }>; // userId_courseId_lessonId -> progress
  quizProgress: Record<string, { score: number; passed: boolean; completedAt: string }>; // userId_courseId_quizId -> progress
  submissions: AssignmentSubmission[];
  doubts: Doubt[];
  bookmarks: Bookmark[];
  certificates: Record<string, Certificate[]>; // userId -> certificates
  certificateRequests: CertificateRequest[];
  notifications: SkillNotification[];
  reviews: CourseReview[];
  activityFeed: ActivityLog[];
  downloadLogs: Record<string, number>;
  learningHours: Record<string, number>; // userId -> hours
  streakCount: Record<string, number>; // userId -> count
  lastActiveDate: Record<string, string>; // userId -> date
  activeLandingTab: "catalog" | "my-courses" | "certificates" | "analytics";
  activeDashboardTab: "overview" | "curriculum" | "assignments" | "quizzes" | "workshops" | "discussions" | "progress" | "certification" | "doubt";
  isLoading: boolean;
  error: string | null;
  
  fetchCourses: () => Promise<void>;
  enrollInCourse: (courseId: string) => void;
  selectCourse: (courseId: string | null) => void;
  updateLessonProgress: (courseId: string, lessonId: string, progress: number, completed: boolean) => void;
  saveQuizProgress: (courseId: string, quizId: string, score: number, passed: boolean) => void;
  submitAssignment: (submission: Omit<AssignmentSubmission, "submittedAt">) => void;
  fetchDoubts: () => Promise<void>;
  addDoubt: (doubt: Omit<Doubt, "id" | "submittedAt" | "responses">) => Promise<void>;
  resolveDoubt: (doubtId: string) => void;
  toggleBookmark: (bookmark: Omit<Bookmark, "bookmarkedAt">) => void;
  generateCertificate: (courseId: string, recipientName: string) => void;
  fetchCertificateRequests: () => Promise<void>;
  requestCertificate: (courseId: string, courseTitle: string, recipientName: string) => Promise<void>;
  addLearningHours: (hours: number) => void;
  incrementStreak: () => void;
  setActiveLandingTab: (tab: "catalog" | "my-courses" | "certificates" | "analytics") => void;
  setActiveDashboardTab: (tab: "overview" | "curriculum" | "assignments" | "quizzes" | "workshops" | "discussions" | "progress" | "certification" | "doubt") => void;
  addNotification: (notif: Omit<SkillNotification, "id" | "timestamp" | "isRead">) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  submitReview: (review: CourseReview) => void;
  logActivity: (type: ActivityLog["type"], title: string) => void;
  logDownload: (resourceId: string) => void;
  resetAll: () => void;
  fetchVideoDuration: (lessonId: string, videoUrl: string) => Promise<string>;
}

// Mock data removed as requested
export const useSkillsStore = create<SkillsState>()(
  persist(
    (set, get) => ({
      courses: [],
      enrolledCourseIds: {},
      currentCourseId: null,
      lessonProgress: {},
      quizProgress: {},
      submissions: [],
      doubts: [],
      bookmarks: [],
      certificates: {},
      certificateRequests: [],
      notifications: [],
      reviews: [],
      activityFeed: [],
      downloadLogs: {},
      learningHours: {},
      streakCount: {},
      lastActiveDate: {},
      activeLandingTab: "catalog",
      activeDashboardTab: "overview",
      isLoading: true,
      error: null,
      
      fetchCourses: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("skills_courses")
            .select(`
              *,
              modules:skills_modules(
                *,
                lessons:skills_lessons(*),
                materials:skills_materials(*),
                assignments:skills_assignments(*),
                quizzes:skills_quizzes(*, questions:skills_questions(*))
              )
            `);
          
          if (error) throw error;
          
          // Convert snake_case to camelCase and ensure proper structure
          const courses = (data || []).map((course: any) => {
            const camelCourse = snakeToCamel(course) as Course;
            return {
              ...camelCourse,
              // Ensure defaults for optional fields
              rating: camelCourse.rating ?? 4.5,
              learnersCount: camelCourse.learnersCount ?? 100,
              objectives: camelCourse.objectives ?? [],
              skillsLearned: camelCourse.skillsLearned ?? [],
              modules: (camelCourse.modules ?? []).map((mod: any) => ({
                ...mod,
                lessons: (mod.lessons ?? []).map((les: any) => ({
                  ...les,
                  progress: 0,
                  completed: false
                })),
                materials: mod.materials ?? [],
                quizzes: (mod.quizzes ?? []).map((q: any) => snakeToCamel(q)),
                assignments: (mod.assignments ?? []).map((a: any) => snakeToCamel(a))
              }))
            };
          });
          
          set({ courses, isLoading: false });
        } catch (err: any) {
          console.error("Failed to fetch courses:", err);
          set({ error: err.message, isLoading: false });
        }
      },

      enrollInCourse: (courseId) => {
        const userId = useAuthStore.getState().currentUser?.id;
        if (!userId) return;
        const currentIds = get().enrolledCourseIds[userId] || [];
        if (!currentIds.includes(courseId)) {
          set({
            enrolledCourseIds: {
              ...get().enrolledCourseIds,
              [userId]: [...currentIds, courseId],
            },
          });
        }
      },
      selectCourse: (courseId) => set({ currentCourseId: courseId }),
      updateLessonProgress: (courseId, lessonId, progress, completed) => {
        const userId = useAuthStore.getState().currentUser?.id;
        if (!userId) return;
        const key = `${userId}_${courseId}_${lessonId}`;
        set((state) => ({
          lessonProgress: {
            ...state.lessonProgress,
            [key]: { progress, completed },
          },
        }));
      },

      saveQuizProgress: (courseId, quizId, score, passed) => {
        const userId = useAuthStore.getState().currentUser?.id;
        if (!userId) return;
        const key = `${userId}_${courseId}_${quizId}`;
        set((state) => ({
          quizProgress: {
            ...state.quizProgress,
            [key]: { score, passed, completedAt: new Date().toISOString() },
          },
        }));
      },

      submitAssignment: (sub) =>
        set((state) => {
          const filtered = state.submissions.filter(
            (s) => !(s.courseId === sub.courseId && s.assignmentId === sub.assignmentId)
          );
          
          const newSubmission: AssignmentSubmission = {
            ...sub,
            submittedAt: new Date().toISOString()
          };

          const courseObj = state.courses.find((c) => c.id === sub.courseId);
          const newAct: ActivityLog = {
            id: `act-${Math.random().toString(36).substr(2, 9)}`,
            type: "Assignment Submitted",
            title: `Submitted assignment for ${courseObj?.title}`,
            timestamp: new Date().toISOString()
          };

          if (sub.status === "Submitted") {
            // Note: Auto-grading mockup removed as per request.
            // Submissions will remain in "Submitted" status until graded by Admin.
          }

          return {
            submissions: [...filtered, newSubmission],
            activityFeed: [newAct, ...state.activityFeed]
          };
        }),

      fetchDoubts: async () => {
        const email = useAuthStore.getState().currentUser?.email;
        if (!email) return;
        try {
          const { data, error } = await supabase
            .from("skills_doubts")
            .select(`*, responses:skills_doubt_responses(*)`)
            .eq("user_email", email)
            .order("created_at", { ascending: false });
          if (error) throw error;
          
          const formattedDoubts = data.map((d: any) => ({
            id: d.id,
            courseId: d.course_id,
            question: d.question,
            status: d.status,
            submittedAt: d.created_at,
            responses: (d.responses || []).map((r: any) => ({
              author: r.author,
              avatar: "👨‍🏫",
              message: r.message,
              timestamp: r.created_at
            }))
          }));
          
          set({ doubts: formattedDoubts });
        } catch (error) {
          console.error("Error fetching doubts", error);
        }
      },

      addDoubt: async (doubt) => {
        const email = useAuthStore.getState().currentUser?.email;
        if (!email) return;
        try {
          const { error } = await supabase.from("skills_doubts").insert({
            course_id: doubt.courseId,
            user_email: email,
            question: doubt.question,
            status: "Pending"
          });
          if (error) throw error;
          
          // Refresh doubts
          await get().fetchDoubts();
          
          get().addNotification({
            category: "Course Update",
            title: "Doubt Submitted",
            message: `Your question "${doubt.question.substr(0, 30)}..." was sent to instructors.`
          });
        } catch (error) {
          console.error("Error adding doubt", error);
        }
      },

      resolveDoubt: (doubtId) =>
        set((state) => ({
          doubts: state.doubts.map((d) => (d.id === doubtId ? { ...d, status: "Resolved" as const } : d))
        })),

      toggleBookmark: (b) =>
        set((state) => {
          const exists = state.bookmarks.some(
            (bm) => bm.courseId === b.courseId && bm.itemId === b.itemId && bm.type === b.type
          );
          if (exists) {
            return {
              bookmarks: state.bookmarks.filter(
                (bm) => !(bm.courseId === b.courseId && bm.itemId === b.itemId && bm.type === b.type)
              )
            };
          } else {
            return {
              bookmarks: [
                ...state.bookmarks,
                { ...b, bookmarkedAt: new Date().toISOString() }
              ]
            };
          }
        }),

      generateCertificate: (courseId, recipientName) => {
        const userId = useAuthStore.getState().currentUser?.id;
        if (!userId) return;
        const course = get().courses.find((c) => c.id === courseId);
        if (course) {
          const newCert: Certificate = {
            id: `CERT-${Math.floor(Math.random() * 100000)}`,
            courseId,
            courseTitle: course.title,
            recipientName,
            date: new Date().toISOString(),
            credentialId: `CRED-${Math.floor(Math.random() * 1000000)}`,
          };
          const userCerts = get().certificates[userId] || [];
          set({
            certificates: {
              ...get().certificates,
              [userId]: [newCert, ...userCerts],
            },
          });
        }
      },

      fetchCertificateRequests: async () => {
        const email = useAuthStore.getState().currentUser?.email;
        if (!email) return;
        try {
          const { data, error } = await supabase
            .from("skills_certificate_requests")
            .select("*")
            .eq("user_email", email)
            .order("created_at", { ascending: false });
          if (error) throw error;
          
          const requests: CertificateRequest[] = data.map((d: any) => ({
            id: d.id,
            userEmail: d.user_email,
            courseId: d.course_id,
            courseTitle: d.course_title,
            recipientName: d.recipient_name,
            status: d.status,
            createdAt: d.created_at
          }));
          
          set({ certificateRequests: requests });

          // Auto-generate local certificates for approved requests
          const userId = useAuthStore.getState().currentUser?.id;
          if (userId) {
            const currentCerts = get().certificates[userId] || [];
            requests.forEach(req => {
              if (req.status === "Approved") {
                const alreadyHasCert = currentCerts.some(c => c.courseId === req.courseId);
                if (!alreadyHasCert) {
                  get().generateCertificate(req.courseId, req.recipientName);
                  get().addNotification({
                    category: "Course Update",
                    title: "Certificate Approved!",
                    message: `Your certificate for ${req.courseTitle} has been approved and is now available.`
                  });
                }
              }
            });
          }
        } catch (error) {
          console.error("Error fetching certificate requests", error);
        }
      },

      requestCertificate: async (courseId, courseTitle, recipientName) => {
        const email = useAuthStore.getState().currentUser?.email;
        if (!email) return;
        try {
          const { error } = await supabase.from("skills_certificate_requests").insert({
            user_email: email,
            course_id: courseId,
            course_title: courseTitle,
            recipient_name: recipientName,
            status: "Pending"
          });
          if (error) throw error;
          
          await get().fetchCertificateRequests();
          
          get().addNotification({
            category: "Course Update",
            title: "Certificate Requested",
            message: `Your certificate request for ${courseTitle} has been sent to the admin.`
          });
        } catch (error) {
          console.error("Error requesting certificate", error);
        }
      },

      addLearningHours: (hours) => {
        const userId = useAuthStore.getState().currentUser?.id;
        if (!userId) return;
        const currentHours = get().learningHours[userId] || 0;
        set({ learningHours: { ...get().learningHours, [userId]: currentHours + hours } });
      },
      incrementStreak: () => {
        const userId = useAuthStore.getState().currentUser?.id;
        if (!userId) return;
        
        const today = new Date().toDateString();
        const lastActive = get().lastActiveDate[userId];
        
        if (lastActive !== today) {
          const currentStreak = get().streakCount[userId] || 0;
          set({
            streakCount: { ...get().streakCount, [userId]: currentStreak + 1 },
            lastActiveDate: { ...get().lastActiveDate, [userId]: today },
          });
        }
      },
      setActiveLandingTab: (tab) => set({ activeLandingTab: tab }),
      setActiveDashboardTab: (tab) => set({ activeDashboardTab: tab }),

      addNotification: (notif) =>
        set((state) => {
          const newNotif: SkillNotification = {
            ...notif,
            id: `notif-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            isRead: false
          };
          return {
            notifications: [newNotif, ...state.notifications]
          };
        }),

      markNotificationAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        })),

      markAllNotificationsAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true }))
        })),

      submitReview: (rev) =>
        set((state) => {
          const filtered = state.reviews.filter((r) => r.courseId !== rev.courseId);
          
          const updatedCourses = state.courses.map((c) => {
            if (c.id === rev.courseId) {
              const allRatings = [...state.reviews.filter((r) => r.courseId === rev.courseId).map((r) => r.rating), rev.rating];
              const avg = Math.round((allRatings.reduce((a, b) => a + b, 0) / allRatings.length) * 10) / 10;
              return { ...c, rating: avg };
            }
            return c;
          });

          return {
            reviews: [...filtered, rev],
            courses: updatedCourses
          };
        }),

      logActivity: (type, title) =>
        set((state) => {
          const newAct: ActivityLog = {
            id: `act-${Math.random().toString(36).substr(2, 9)}`,
            type,
            title,
            timestamp: new Date().toISOString()
          };
          return {
            activityFeed: [newAct, ...state.activityFeed].slice(0, 30)
          };
        }),

      logDownload: (resId) =>
        set((state) => {
          const prevCount = state.downloadLogs[resId] || 0;
          return {
            downloadLogs: {
              ...state.downloadLogs,
              [resId]: prevCount + 1
            }
          };
        }),

      fetchVideoDuration: async (lessonId: string, videoUrl: string) => {
        try {
          // Extract video ID
          let vidId = videoUrl;
          if (videoUrl.includes("v=")) {
            vidId = videoUrl.split("v=")[1]?.split("&")[0];
          } else if (videoUrl.includes("youtu.be/")) {
            vidId = videoUrl.split("youtu.be/")[1]?.split("?")[0];
          }
          
          const apiKey = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY;
          
          if (!apiKey) {
            console.warn("YouTube API key missing (EXPO_PUBLIC_YOUTUBE_API_KEY)");
            return "Video";
          }
          
          const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${vidId}&part=contentDetails&key=${apiKey}`);
          const data = await res.json();
          
          if (data.items && data.items.length > 0) {
            const durationIso = data.items[0].contentDetails.duration;
            // Parse ISO 8601 duration (e.g. PT1H2M10S)
            const match = durationIso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
            if (match) {
              const h = parseInt(match[1] || '0');
              const m = parseInt(match[2] || '0');
              const s = parseInt(match[3] || '0');
              
              if (h > 0) {
                return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
              }
              return `${m}:${s.toString().padStart(2, '0')}`;
            }
          }
        } catch (e) {
          console.warn("Failed to fetch video duration via API", e);
        }
        return "Video";
      },

      resetAll: () =>
        set({
          enrolledCourseIds: {},
          currentCourseId: null,
          lessonProgress: {},
          quizProgress: {},
          submissions: [],
          doubts: [],
          bookmarks: [],
          certificates: {},
          certificateRequests: [],
          notifications: [],
          reviews: [],
          activityFeed: [],
          downloadLogs: {},
          learningHours: {},
          streakCount: {},
          lastActiveDate: {},
          activeLandingTab: "catalog",
          activeDashboardTab: "overview"
        })
    }),
    {
      name: "relicus-skills-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Don't persist courses - we fetch fresh from Supabase every time
      partialize: (state) => ({
        enrolledCourseIds: state.enrolledCourseIds,
        currentCourseId: state.currentCourseId,
        lessonProgress: state.lessonProgress,
        quizProgress: state.quizProgress,
        submissions: state.submissions,
        bookmarks: state.bookmarks,
        certificates: state.certificates,
        notifications: state.notifications,
        reviews: state.reviews,
        activityFeed: state.activityFeed,
        downloadLogs: state.downloadLogs,
        learningHours: state.learningHours,
        streakCount: state.streakCount,
        lastActiveDate: state.lastActiveDate,
        activeLandingTab: state.activeLandingTab,
        activeDashboardTab: state.activeDashboardTab
      })
    }
  )
);
