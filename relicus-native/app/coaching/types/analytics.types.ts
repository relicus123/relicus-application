export interface WeeklyTrend {
  week: string; // e.g. "Week 1" or "Mon", "Tue"
  hours: number;
  accuracy: number; // percentage
  testScore: number;
}

export interface SubjectPerformance {
  subject: string;
  accuracy: number;
  completedChapters: number;
  totalChapters: number;
}

export interface TimeDistribution {
  name: string; // e.g. "Videos", "Mock Tests", "Doubts", "Notes"
  value: number; // percentage or hours
}

export interface AnalyticsKPIs {
  examReadinessScore: number; // 0 - 100
  predictedRank: number;
  learningStreak: number;
  weeklyConsistencyScore: number; // 0 - 100
  learningHours: number; // total hours spent this week
  strongTopics: string[];
  weakTopics: string[];
}

export interface OverallAnalytics {
  kpis: AnalyticsKPIs;
  weeklyTrend: WeeklyTrend[];
  subjectPerformance: SubjectPerformance[];
  timeDistribution: TimeDistribution[];
}
