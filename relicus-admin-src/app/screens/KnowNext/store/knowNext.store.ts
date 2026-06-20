import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CareerStage,
  ActivityItem,
  ActivityType,
  AnalyticsEvent,
  AnalyticsEntityType,
} from "../types/knowNext.types";
import { CAREERS } from "../constants/careers";
import { COLLEGES } from "../constants/colleges";
import { SCHOLARSHIPS } from "../constants/scholarships";
import { ROADMAPS } from "../constants/roadmaps";

// ─────────────────────────────────────────────────────────────────────────────
// KnowNext Store
// ─────────────────────────────────────────────────────────────────────────────
interface KnowNextState {
  // ── Global Stage Filter ───────────────────────────────────────────────────
  activeStage: CareerStage | "all";

  // ── Saved Items ───────────────────────────────────────────────────────────
  savedCareerIds: string[];
  savedCollegeIds: string[];
  savedScholarshipIds: string[];
  savedRoadmapIds: string[];

  // ── Career Goal & Active Roadmap ──────────────────────────────────────────
  careerGoalId: string | null;
  activeRoadmapId: string | null;

  // ── Roadmap Progress ──────────────────────────────────────────────────────
  /** roadmapId → set of completed step IDs */
  roadmapProgress: Record<string, string[]>;

  // ── Comparison Selections (max 3 each) ────────────────────────────────────
  compareCareerIds: string[];
  compareCollegeIds: string[];

  // ── Activity Feed ─────────────────────────────────────────────────────────
  recentActivity: ActivityItem[];

  // ── Analytics Events ──────────────────────────────────────────────────────
  analyticsEvents: AnalyticsEvent[];

  // ── Database Dynamic Datasets ──────────────────────────────────────────────
  careers: any[];
  colleges: any[];
  scholarships: any[];
  roadmaps: any[];

  setCareers: (careers: any[]) => void;
  setColleges: (colleges: any[]) => void;
  setScholarships: (scholarships: any[]) => void;
  setRoadmaps: (roadmaps: any[]) => void;

  // ── Actions: Stage ────────────────────────────────────────────────────────
  setActiveStage: (stage: CareerStage | "all") => void;

  // ── Actions: Saves ────────────────────────────────────────────────────────
  toggleSaveCareer: (id: string) => void;
  toggleSaveCollege: (id: string) => void;
  toggleSaveScholarship: (id: string) => void;
  toggleSaveRoadmap: (id: string) => void;

  // ── Actions: Career Goal ──────────────────────────────────────────────────
  setCareerGoal: (careerId: string | null) => void;
  setActiveRoadmap: (roadmapId: string | null) => void;

  // ── Actions: Roadmap Progress ─────────────────────────────────────────────
  completeRoadmapStep: (roadmapId: string, stepId: string) => void;
  getCompletedSteps: (roadmapId: string) => string[];
  getRoadmapProgressPercent: (roadmapId: string, totalSteps: number) => number;

  // ── Actions: Comparison ───────────────────────────────────────────────────
  toggleCompareCareer: (id: string) => void;
  toggleCompareCollege: (id: string) => void;
  clearCareerComparison: () => void;
  clearCollegeComparison: () => void;

  // ── Actions: Activity ─────────────────────────────────────────────────────
  addActivity: (item: Omit<ActivityItem, "id" | "timestamp">) => void;

  // ── Actions: Analytics ───────────────────────────────────────────────────
  trackEvent: (event: Omit<AnalyticsEvent, "timestamp">) => void;

  // ── Computed: Analytics Summaries ─────────────────────────────────────────
  getMostViewed: (entityType: AnalyticsEntityType, limit?: number) => string[];
  getMostSaved: (entityType: AnalyticsEntityType, limit?: number) => string[];
  getMostCompared: (entityType: AnalyticsEntityType, limit?: number) => string[];
}

export const useKnowNextStore = create<KnowNextState>()(
  persist(
    (set, get) => ({
      // ── Initial State ────────────────────────────────────────────────────
      activeStage: "all",
      savedCareerIds: [],
      savedCollegeIds: [],
      savedScholarshipIds: [],
      savedRoadmapIds: [],
      careerGoalId: null,
      activeRoadmapId: null,
      roadmapProgress: {},
      compareCareerIds: [],
      compareCollegeIds: [],
      recentActivity: [],
      analyticsEvents: [],

      // ── Database Dynamic Datasets ──────────────────────────────────────────
      careers: CAREERS,
      colleges: COLLEGES,
      scholarships: SCHOLARSHIPS,
      roadmaps: ROADMAPS,

      setCareers: (careers) => set({ careers }),
      setColleges: (colleges) => set({ colleges }),
      setScholarships: (scholarships) => set({ scholarships }),
      setRoadmaps: (roadmaps) => set({ roadmaps }),

      // ── Stage ─────────────────────────────────────────────────────────────
      setActiveStage: (stage) => set({ activeStage: stage }),

      // ── Saves ─────────────────────────────────────────────────────────────
      toggleSaveCareer: (id) =>
        set((state) => {
          const saved = state.savedCareerIds.includes(id);
          const next = saved
            ? state.savedCareerIds.filter((x) => x !== id)
            : [...state.savedCareerIds, id];
          if (!saved) {
            get().addActivity({ type: "savedCareer", title: `Career Saved`, subtitle: id });
            get().trackEvent({ type: "save", entityType: "career", entityId: id });
          }
          return { savedCareerIds: next };
        }),

      toggleSaveCollege: (id) =>
        set((state) => {
          const saved = state.savedCollegeIds.includes(id);
          const next = saved
            ? state.savedCollegeIds.filter((x) => x !== id)
            : [...state.savedCollegeIds, id];
          if (!saved) {
            get().addActivity({ type: "savedCollege", title: `College Saved`, subtitle: id });
            get().trackEvent({ type: "save", entityType: "college", entityId: id });
          }
          return { savedCollegeIds: next };
        }),

      toggleSaveScholarship: (id) =>
        set((state) => {
          const saved = state.savedScholarshipIds.includes(id);
          const next = saved
            ? state.savedScholarshipIds.filter((x) => x !== id)
            : [...state.savedScholarshipIds, id];
          if (!saved) {
            get().addActivity({ type: "savedScholarship", title: `Scholarship Saved`, subtitle: id });
            get().trackEvent({ type: "save", entityType: "scholarship", entityId: id });
          }
          return { savedScholarshipIds: next };
        }),

      toggleSaveRoadmap: (id) =>
        set((state) => {
          const saved = state.savedRoadmapIds.includes(id);
          const next = saved
            ? state.savedRoadmapIds.filter((x) => x !== id)
            : [...state.savedRoadmapIds, id];
          return { savedRoadmapIds: next };
        }),

      // ── Career Goal ────────────────────────────────────────────────────────
      setCareerGoal: (careerId) => set({ careerGoalId: careerId }),
      setActiveRoadmap: (roadmapId) => {
        set({ activeRoadmapId: roadmapId });
        if (roadmapId) {
          get().addActivity({ type: "startedRoadmap", title: "Roadmap Started", subtitle: roadmapId });
          get().trackEvent({ type: "start", entityType: "roadmap", entityId: roadmapId });
        }
      },

      // ── Roadmap Progress ───────────────────────────────────────────────────
      completeRoadmapStep: (roadmapId, stepId) =>
        set((state) => {
          const existing = state.roadmapProgress[roadmapId] ?? [];
          if (existing.includes(stepId)) return {};
          get().addActivity({ type: "completedMilestone", title: "Milestone Completed", subtitle: stepId });
          return {
            roadmapProgress: {
              ...state.roadmapProgress,
              [roadmapId]: [...existing, stepId],
            },
          };
        }),

      getCompletedSteps: (roadmapId) => get().roadmapProgress[roadmapId] ?? [],

      getRoadmapProgressPercent: (roadmapId, totalSteps) => {
        if (totalSteps === 0) return 0;
        const completed = (get().roadmapProgress[roadmapId] ?? []).length;
        return Math.round((completed / totalSteps) * 100);
      },

      // ── Comparison ────────────────────────────────────────────────────────
      toggleCompareCareer: (id) =>
        set((state) => {
          const included = state.compareCareerIds.includes(id);
          if (included) {
            return { compareCareerIds: state.compareCareerIds.filter((x) => x !== id) };
          }
          if (state.compareCareerIds.length >= 3) return {}; // max 3
          get().trackEvent({ type: "compare", entityType: "career", entityId: id });
          return { compareCareerIds: [...state.compareCareerIds, id] };
        }),

      toggleCompareCollege: (id) =>
        set((state) => {
          const included = state.compareCollegeIds.includes(id);
          if (included) {
            return { compareCollegeIds: state.compareCollegeIds.filter((x) => x !== id) };
          }
          if (state.compareCollegeIds.length >= 3) return {};
          get().trackEvent({ type: "compare", entityType: "college", entityId: id });
          return { compareCollegeIds: [...state.compareCollegeIds, id] };
        }),

      clearCareerComparison: () => set({ compareCareerIds: [] }),
      clearCollegeComparison: () => set({ compareCollegeIds: [] }),

      // ── Activity ──────────────────────────────────────────────────────────
      addActivity: (item) =>
        set((state) => ({
          recentActivity: [
            {
              ...item,
              id: `act-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: new Date().toISOString(),
            },
            ...state.recentActivity,
          ].slice(0, 15), // keep last 15
        })),

      // ── Analytics ─────────────────────────────────────────────────────────
      trackEvent: (event) =>
        set((state) => ({
          analyticsEvents: [
            { ...event, timestamp: new Date().toISOString() },
            ...state.analyticsEvents,
          ].slice(0, 500), // cap at 500 events
        })),

      getMostViewed: (entityType, limit = 5) => {
        const counts: Record<string, number> = {};
        get()
          .analyticsEvents.filter((e) => e.type === "view" && e.entityType === entityType)
          .forEach((e) => { counts[e.entityId] = (counts[e.entityId] ?? 0) + 1; });
        return Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, limit)
          .map(([id]) => id);
      },

      getMostSaved: (entityType, limit = 5) => {
        const counts: Record<string, number> = {};
        get()
          .analyticsEvents.filter((e) => e.type === "save" && e.entityType === entityType)
          .forEach((e) => { counts[e.entityId] = (counts[e.entityId] ?? 0) + 1; });
        return Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, limit)
          .map(([id]) => id);
      },

      getMostCompared: (entityType, limit = 5) => {
        const counts: Record<string, number> = {};
        get()
          .analyticsEvents.filter((e) => e.type === "compare" && e.entityType === entityType)
          .forEach((e) => { counts[e.entityId] = (counts[e.entityId] ?? 0) + 1; });
        return Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, limit)
          .map(([id]) => id);
      },
    }),
    { name: "relicus_knowNext_store" }
  )
);
