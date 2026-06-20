import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  duration: string;
  progress: number; // 0 to 100
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
  content: string; // File name or URL
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
  itemId: string; // The video/material/etc ID
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
  courseId: string;
  rating: number;
  reviewText: string;
  completionDate: string;
}

interface SkillsState {
  // Course State
  courses: Course[];
  enrolledCourseIds: string[];
  currentCourseId: string | null;
  
  // Progress/Submissions/Activity
  lessonProgress: Record<string, { progress: number; completed: boolean }>; // key: courseId_lessonId
  submissions: AssignmentSubmission[];
  doubts: Doubt[];
  bookmarks: Bookmark[];
  certificates: Certificate[];
  
  // Notifications, Reviews, and Activity feeds
  notifications: SkillNotification[];
  reviews: CourseReview[];
  activityFeed: ActivityLog[];
  downloadLogs: Record<string, number>; // key: resourceId, value: downloadCount
  
  // Analytics
  learningHours: number;
  streakCount: number;
  lastActiveDate: string | null;
  
  // Tabs and Active Views
  activeLandingTab: "catalog" | "my-courses" | "certificates" | "analytics";
  activeDashboardTab: "overview" | "curriculum" | "assignments" | "quizzes" | "workshops" | "discussions" | "progress" | "certification";
  
  // Actions
  enrollInCourse: (courseId: string) => void;
  selectCourse: (courseId: string | null) => void;
  updateLessonProgress: (courseId: string, lessonId: string, progress: number, completed: boolean) => void;
  submitAssignment: (submission: Omit<AssignmentSubmission, "submittedAt">) => void;
  addDoubt: (doubt: Omit<Doubt, "id" | "submittedAt" | "responses">) => void;
  resolveDoubt: (doubtId: string) => void;
  toggleBookmark: (bookmark: Omit<Bookmark, "bookmarkedAt">) => void;
  generateCertificate: (courseId: string, recipientName: string) => void;
  addLearningHours: (hours: number) => void;
  incrementStreak: () => void;
  setActiveLandingTab: (tab: "catalog" | "my-courses" | "certificates" | "analytics") => void;
  setActiveDashboardTab: (tab: "overview" | "curriculum" | "assignments" | "quizzes" | "workshops" | "discussions" | "progress" | "certification") => void;
  
  // New Actions
  setCourses: (courses: Course[]) => void;
  addNotification: (notif: Omit<SkillNotification, "id" | "timestamp" | "isRead">) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  submitReview: (review: CourseReview) => void;
  logActivity: (type: ActivityLog["type"], title: string) => void;
  logDownload: (resourceId: string) => void;
  resetAll: () => void;
}

// Initial Mock Course Data for the catalog
const INITIAL_COURSES: Course[] = [
  {
    id: "tech-1",
    title: "Modern React & Next.js Ecosystem",
    category: "Web Development",
    instructor: "David Miller",
    instructorTitle: "Senior Frontend Architect",
    instructorBio: "Ex-Google engineer with 12+ years experience building highly interactive web apps using React, Next.js, and TypeScript.",
    instructorAvatar: "👨‍💻",
    duration: "6 weeks",
    level: "Intermediate",
    rating: 4.8,
    learnersCount: 1540,
    description: "Learn how to build production-grade web applications using React 18, Next.js App Router, Tailwind CSS, Zustand, and Motion. We will cover server components, routing, data fetching, and micro-animations.",
    objectives: [
      "Master Next.js App Router and Server Components",
      "Implement robust state management using Zustand",
      "Create high-performance animations with Framer Motion",
      "Configure Tailwind CSS v4 for clean component styling"
    ],
    skillsLearned: ["React 18", "Next.js", "Zustand", "TypeScript", "Tailwind CSS"],
    thumbnail: "⚛️",
    modules: [
      {
        id: "tech-1-m1",
        title: "Introduction to React 18 & Server Components",
        description: "Understand the core concepts of React 18, Server vs Client components, and Hydration.",
        lessons: [
          { id: "tech-1-m1-l1", title: "Course Overview & Setup", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", duration: "10 mins", progress: 0, completed: false },
          { id: "tech-1-m1-l2", title: "React 18 Server Components Explained", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", duration: "25 mins", progress: 0, completed: false },
          { id: "tech-1-m1-l3", title: "Understanding Hydration & Streaming", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", duration: "20 mins", progress: 0, completed: false }
        ],
        materials: [
          { id: "tech-1-m1-mat1", title: "React 18 Slide Deck", type: "ppt", downloadUrl: "#" },
          { id: "tech-1-m1-mat2", title: "Setup cheatsheet", type: "cheatsheet", downloadUrl: "#" }
        ],
        quizzes: [
          {
            id: "tech-1-m1-q1",
            title: "Server Components Basics Quiz",
            type: "practice",
            questions: [
              { id: "q1", question: "Where do React Server Components execute?", options: ["Only on the client browser", "Only on the server", "Both client and server", "In the database"], correctAnswerIndex: 1, explanation: "React Server Components execute only on the server, which improves load speed by reducing client bundle sizes." },
              { id: "q2", question: "Can server components use stateful hooks like 'useState'?", options: ["Yes, anytime", "No, they must be marked as client components with 'use client' first", "Only in production", "Only with Next.js"], correctAnswerIndex: 1, explanation: "Stateful hooks like useState or useEffect are client-only, meaning the component must use 'use client'." }
            ]
          }
        ],
        assignments: [
          { id: "tech-1-m1-a1", title: "Build a Server-Side Rendered Blog", instructions: "Create a simple blog using Next.js Server Components. Fetch posts from a mock JSON API and style it beautifully. Submit a ZIP of your code or a GitHub repository link.", downloadUrl: "#" }
        ]
      },
      {
        id: "tech-1-m2",
        title: "State Management with Zustand",
        description: "Ditch Redux boilerplate. Learn Zustand for super lightweight, react-hooks based global state management.",
        lessons: [
          { id: "tech-1-m2-l1", title: "Why Zustand over Redux/Context?", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", duration: "15 mins", progress: 0, completed: false },
          { id: "tech-1-m2-l2", title: "Creating your first Zustand Store", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", duration: "30 mins", progress: 0, completed: false },
          { id: "tech-1-m2-l3", title: "Persisting Store to LocalStorage", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", duration: "18 mins", progress: 0, completed: false }
        ],
        materials: [
          { id: "tech-1-m2-mat1", title: "Zustand Design Patterns Guide", type: "pdf", downloadUrl: "#" }
        ],
        quizzes: [
          {
            id: "tech-1-m2-q1",
            title: "Zustand Architecture Quiz",
            type: "module",
            questions: [
              { id: "q1", question: "Does Zustand require a Provider component at the root?", options: ["Yes, just like Context", "No, Zustand stores are hooks that work directly", "Only when persisting state", "Only in TypeScript"], correctAnswerIndex: 1, explanation: "Zustand is provider-less, making it simple to fetch state anywhere without wrapping your app layout." }
            ]
          }
        ],
        assignments: [
          { id: "tech-1-m2-a1", title: "Stateful Cart Implementation", instructions: "Implement an e-commerce cart store using Zustand. Add items, compute total price, support coupons, and verify items persist on page reload.", downloadUrl: "#" }
        ]
      }
    ]
  },
  {
    id: "ai-1",
    title: "Generative AI & LLM Engineering",
    category: "AI & Machine Learning",
    instructor: "Sarah Jenkins",
    instructorTitle: "AI Research Scientist",
    instructorBio: "PhD in Machine Learning. Research focused on transformers and reinforcement learning with human feedback (RLHF).",
    instructorAvatar: "👩‍🔬",
    duration: "8 weeks",
    level: "Advanced",
    rating: 4.9,
    learnersCount: 2310,
    description: "Explore the internal architecture of Large Language Models (LLMs). Master prompt engineering, retrieval augmented generation (RAG), vector databases, and fine-tuning models.",
    objectives: [
      "Explain transformer self-attention mechanisms",
      "Build vector indexes with Pinecone or ChromaDB",
      "Develop custom LangChain agents for complex pipelines",
      "Fine-tune lightweight open models like Llama 3"
    ],
    skillsLearned: ["Python", "PyTorch", "Hugging Face", "LangChain", "Vector DBs"],
    thumbnail: "🧠",
    modules: [
      {
        id: "ai-1-m1",
        title: "Attention Mechanics & Transformer Architecture",
        description: "Deep dive into the math and coding behind self-attention, multi-head attention, and positional encodings.",
        lessons: [
          { id: "ai-1-m1-l1", title: "Intro to Seq2Seq & Recurrent Nets", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", duration: "20 mins", progress: 0, completed: false },
          { id: "ai-1-m1-l2", title: "The Self-Attention Mechanism", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", duration: "45 mins", progress: 0, completed: false }
        ],
        materials: [
          { id: "ai-1-m1-mat1", title: "Attention Is All You Need Paper", type: "pdf", downloadUrl: "#" }
        ],
        quizzes: [
          {
            id: "ai-1-m1-q1",
            title: "Self-Attention Math Quiz",
            type: "practice",
            questions: [
              { id: "q1", question: "What are the three matrices in self-attention calculation?", options: ["Input, Output, Hidden", "Query, Key, Value", "Weights, Biases, Activation", "Kernel, Stride, Padding"], correctAnswerIndex: 1, explanation: "Self-attention queries (Q), keys (K), and values (V) are multiplied to compute attention weights." }
            ]
          }
        ],
        assignments: [
          { id: "ai-1-m1-a1", title: "Attention Layer in PyTorch", instructions: "Write a complete single-head scaled dot-product attention function in PyTorch without using torch.nn.MultiheadAttention.", downloadUrl: "#" }
        ]
      }
    ]
  },
  {
    id: "design-1",
    title: "Advanced UI/UX & Interactive Prototyping",
    category: "UI/UX Design",
    instructor: "Marcus Wong",
    instructorTitle: "Principal Product Designer",
    instructorBio: "Over 15 years designing interfaces for top startups and large scale corporate platforms. Design advocate and author.",
    instructorAvatar: "🎨",
    duration: "4 weeks",
    level: "Beginner",
    rating: 4.7,
    learnersCount: 980,
    description: "Learn how to design sleek, interactive interfaces that deliver amazing experiences. Covers Figma components, design systems, usability testing, and wireframing.",
    objectives: [
      "Build clean scalable Figma components using Auto-layout",
      "Establish atomic design principles in design systems",
      "Run professional usability testing and review feedback",
      "Design accessible dark-theme and responsive layouts"
    ],
    skillsLearned: ["Figma", "Wireframing", "Prototyping", "Design System", "A/B Testing"],
    thumbnail: "🎨",
    modules: [
      {
        id: "design-1-m1",
        title: "Atomic Design Systems in Figma",
        description: "Set up color libraries, typography tokens, grid structures, and reusable nested components.",
        lessons: [
          { id: "design-1-m1-l1", title: "Designing with Atomic Principles", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", duration: "12 mins", progress: 0, completed: false },
          { id: "design-1-m1-l2", title: "Auto-layout v5 Masterclass", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", duration: "28 mins", progress: 0, completed: false }
        ],
        materials: [
          { id: "design-1-m1-mat1", title: "Figma Typography Tokens Guide", type: "pdf", downloadUrl: "#" }
        ],
        quizzes: [
          {
            id: "design-1-m1-q1",
            title: "Figma components & Variables Quiz",
            type: "practice",
            questions: [
              { id: "q1", question: "What is the advantage of using Figma Component Variants?", options: ["They decrease file resolution", "They allow grouping related states under one main component", "They lock components from being edited", "They write code automatically"], correctAnswerIndex: 1, explanation: "Variants allow grouping different versions of the same element (e.g. primary, hover, active) together for cleaner assets panels." }
            ]
          }
        ],
        assignments: [
          { id: "design-1-m1-a1", title: "Mobile Sign-Up Flow Figma File", instructions: "Design a complete responsive onboarding sign-up flow using Figma. Leverage Auto-layout and component variables. Submit the shared Figma link.", downloadUrl: "#" }
        ]
      }
    ]
  }
];

export const useSkillsStore = create<SkillsState>()(
  persist(
    (set, get) => ({
      courses: INITIAL_COURSES,
      enrolledCourseIds: [],
      currentCourseId: null,
      lessonProgress: {},
      submissions: [],
      doubts: [],
      bookmarks: [],
      certificates: [],
      
      // Seed initial mock data
      notifications: [
        {
          id: "n-initial-1",
          category: "New Workshop Available",
          title: "Next.js Advanced Layouts Live Stream",
          message: "Sarah Jenkins is hosting an exclusive optimization session today at 4:00 PM.",
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
          isRead: false
        },
        {
          id: "n-initial-2",
          category: "Course Update",
          title: "New AI Module Added",
          message: "We've added a new hands-on Fine-tuning module to LLM Engineering course.",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          isRead: true
        }
      ],
      reviews: [],
      activityFeed: [
        {
          id: "act-init-1",
          type: "Lesson Completed",
          title: "Completed Course Overview & Setup in React course",
          timestamp: new Date(Date.now() - 2 * 3600000).toISOString()
        }
      ],
      downloadLogs: {},
      
      learningHours: 14,
      streakCount: 7, // Default mock starting streak
      lastActiveDate: null,
      activeLandingTab: "catalog",
      activeDashboardTab: "overview",

      enrollInCourse: (courseId) =>
        set((state) => {
          if (state.enrolledCourseIds.includes(courseId)) return {};
          
          const course = state.courses.find((c) => c.id === courseId);
          const courseTitle = course ? course.title : "New Course";
          
          // Log Activity and trigger Notification
          const activity: ActivityLog = {
            id: `act-${Math.random().toString(36).substr(2, 9)}`,
            type: "Workshop Attended", // Default type
            title: `Enrolled in ${courseTitle}`,
            timestamp: new Date().toISOString()
          };

          return {
            enrolledCourseIds: [...state.enrolledCourseIds, courseId],
            activeLandingTab: "my-courses",
            activityFeed: [activity, ...state.activityFeed]
          };
        }),

      selectCourse: (courseId) =>
        set({
          currentCourseId: courseId,
          activeDashboardTab: "overview"
        }),

      updateLessonProgress: (courseId, lessonId, progress, completed) =>
        set((state) => {
          const key = `${courseId}_${lessonId}`;
          const prev = state.lessonProgress[key] || { progress: 0, completed: false };
          
          if (progress <= prev.progress && completed === prev.completed) return {};

          const updatedProgress = {
            ...state.lessonProgress,
            [key]: { progress, completed: completed || prev.completed || progress >= 90 }
          };

          // If completed just now, log activity
          let updatedActivity = state.activityFeed;
          if (completed && !prev.completed) {
            const courseObj = state.courses.find((c) => c.id === courseId);
            const lessonTitle = courseObj?.modules
              .flatMap((m) => m.lessons)
              .find((l) => l.id === lessonId)?.title || "Lecture";

            const newAct: ActivityLog = {
              id: `act-${Math.random().toString(36).substr(2, 9)}`,
              type: "Lesson Completed",
              title: `Watched: ${lessonTitle} in ${courseObj?.title}`,
              timestamp: new Date().toISOString()
            };
            updatedActivity = [newAct, ...state.activityFeed];
          }

          return {
            lessonProgress: updatedProgress,
            activityFeed: updatedActivity
          };
        }),

      submitAssignment: (sub) =>
        set((state) => {
          const filtered = state.submissions.filter(
            (s) => !(s.courseId === sub.courseId && s.assignmentId === sub.assignmentId)
          );
          
          const newSubmission: AssignmentSubmission = {
            ...sub,
            submittedAt: new Date().toISOString()
          };

          // Log submission activity
          const courseObj = state.courses.find((c) => c.id === sub.courseId);
          const newAct: ActivityLog = {
            id: `act-${Math.random().toString(36).substr(2, 9)}`,
            type: "Assignment Submitted",
            title: `Submitted assignment for ${courseObj?.title}`,
            timestamp: new Date().toISOString()
          };

          if (sub.status === "Submitted") {
            setTimeout(() => {
              get().submitAssignment({
                ...newSubmission,
                status: "Reviewed",
                grade: "A",
                feedback: "Superb work! Your code uses proper layout alignment, responsive constraints, and follows all design specifications."
              });
              
              // Trigger assignment graded notification
              get().addNotification({
                category: "Assignment Graded",
                title: "Assignment Evaluated",
                message: `Your project assignment for ${courseObj?.title} has been graded. Score: Grade A.`
              });
            }, 3000);
          }

          return {
            submissions: [...filtered, newSubmission],
            activityFeed: [newAct, ...state.activityFeed]
          };
        }),

      addDoubt: (doubt) =>
        set((state) => {
          const newDoubt: Doubt = {
            ...doubt,
            id: `doubt-${Math.random().toString(36).substr(2, 9)}`,
            submittedAt: new Date().toISOString(),
            status: "Pending",
            responses: []
          };

          setTimeout(() => {
            set((s) => ({
              doubts: s.doubts.map((d) => {
                if (d.id === newDoubt.id) {
                  return {
                    ...d,
                    status: "Resolved" as const,
                    responses: [
                      {
                        author: "Sarah Jenkins (Instructor)",
                        avatar: "👩‍🔬",
                        message: "Hello! This is a great question. You can resolve this issue by ensuring your imports are exact and checking that you are not mutating store state directly. Ensure you follow standard immutable update patterns in React.",
                        timestamp: new Date().toISOString()
                      }
                    ]
                  };
                }
                return d;
              })
            }));
            
            // Add notification that doubt is resolved
            get().addNotification({
              category: "Course Update",
              title: "Mentor Replied to Doubt",
              message: `An instructor responded to your question: "${doubt.question.substr(0, 30)}..."`
            });
          }, 4000);

          return {
            doubts: [newDoubt, ...state.doubts]
          };
        }),

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

      generateCertificate: (courseId, recipientName) =>
        set((state) => {
          if (state.certificates.some((c) => c.courseId === courseId)) return {};
          
          const course = state.courses.find((c) => c.id === courseId);
          if (!course) return {};

          const cert: Certificate = {
            id: `cert-${Math.random().toString(36).substr(2, 9)}`,
            courseId,
            courseTitle: course.title,
            recipientName,
            date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
            credentialId: `RLC-${Math.floor(100000 + Math.random() * 900000)}`
          };

          const newAct: ActivityLog = {
            id: `act-${Math.random().toString(36).substr(2, 9)}`,
            type: "Certificate Earned",
            title: `Earned Certificate for ${course.title}`,
            timestamp: new Date().toISOString()
          };

          // Trigger notification
          get().addNotification({
            category: "Certificate Ready",
            title: "Professional Certificate Generated",
            message: `Congratulations! Your certificate for ${course.title} is now ready to download.`
          });

          return {
            certificates: [...state.certificates, cert],
            activityFeed: [newAct, ...state.activityFeed]
          };
        }),

      addLearningHours: (hours) =>
        set((state) => ({
          learningHours: state.learningHours + hours
        })),

      incrementStreak: () =>
        set((state) => {
          const today = new Date().toDateString();
          if (state.lastActiveDate === today) return {};
          return {
            streakCount: state.streakCount + 1,
            lastActiveDate: today
          };
        }),

      setActiveLandingTab: (tab) => set({ activeLandingTab: tab }),
      setActiveDashboardTab: (tab) => set({ activeDashboardTab: tab }),

      // New Actions implementations
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
          // Remove previous review if exists
          const filtered = state.reviews.filter((r) => r.courseId !== rev.courseId);
          
          // Re-calculate course rating based on new review
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
            activityFeed: [newAct, ...state.activityFeed].slice(0, 30) // limit to 30 items
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

      setCourses: (courses) => set({ courses }),

      resetAll: () =>
        set({
          enrolledCourseIds: [],
          currentCourseId: null,
          lessonProgress: {},
          submissions: [],
          doubts: [],
          bookmarks: [],
          certificates: [],
          notifications: [],
          reviews: [],
          activityFeed: [],
          downloadLogs: {},
          learningHours: 14,
          streakCount: 7,
          lastActiveDate: null,
          activeLandingTab: "catalog",
          activeDashboardTab: "overview"
        })
    }),
    {
      name: "relicus_skills_store"
    }
  )
);
