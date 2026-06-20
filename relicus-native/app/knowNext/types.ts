// ─────────────────────────────────────────────────────────────────────────────
// KnowNext — TypeScript Types
// ─────────────────────────────────────────────────────────────────────────────

// ── Career Stage Filter ───────────────────────────────────────────────────────
export type CareerStage =
  | "after10th"
  | "after12th"
  | "afterGraduation"
  | "workingProfessional";

export const CAREER_STAGE_LABELS: Record<CareerStage | "all", string> = {
  all: "All Stages",
  after10th: "After 10th",
  after12th: "After 12th",
  afterGraduation: "After Graduation",
  workingProfessional: "Working Professional",
};

// ── Career Categories ─────────────────────────────────────────────────────────
export type CareerCategory =
  | "Technology"
  | "Healthcare"
  | "Finance"
  | "Education"
  | "Design"
  | "Law"
  | "Engineering"
  | "Business"
  | "Arts & Media"
  | "Science"
  | "Government";

// ── Career ────────────────────────────────────────────────────────────────────
export interface EducationStep {
  level: string;
  duration: string;
  institutions: string[];
}

export interface Career {
  id: string;
  title: string;
  category: CareerCategory;
  industry: string;
  icon: string;
  tagline: string;
  overview: string;
  applicableStages: CareerStage[];
  // Skills & Education
  requiredSkills: string[];
  educationalPath: EducationStep[];
  entranceExams: string[]; // links to Entrance Coaching
  certifications: string[];
  // Career details
  topRecruiters: string[];
  futureScope: string;
  industryDemand: "Very High" | "High" | "Medium" | "Low";
  salaryRange: { min: number; max: number };
  jobRoles: string[];
  growthOpportunities: string[];
  // Comparison fields
  avgSalary: number; // LPA
  educationYears: number;
  growthPercent: number;
}

// ── Roadmap ───────────────────────────────────────────────────────────────────
export type StepStatus = "completed" | "current" | "locked";
export type StepType =
  | "education"
  | "skill"
  | "certification"
  | "project"
  | "experience";

export interface RoadmapStep {
  id: string;
  order: number;
  title: string;
  description: string;
  type: StepType;
  duration: string;
  certifications: string[];
  skillsRequired: string[];
  resources: string[];
  status: StepStatus;
}

export interface CareerRoadmap {
  id: string;
  careerId: string;
  careerTitle: string;
  icon: string;
  applicableStages: CareerStage[];
  totalSteps: number;
  estimatedDuration: string;
  steps: RoadmapStep[];
}

// ── College ───────────────────────────────────────────────────────────────────
export type CollegeType = "Government" | "Private" | "Deemed" | "Autonomous";

export interface College {
  id: string;
  name: string;
  shortName: string;
  location: string;
  state: string;
  type: CollegeType;
  ranking: number;
  rating: number;
  applicableStages: CareerStage[];
  coursesOffered: string[];
  feeRange: { min: number; max: number };
  placementAvgPackage: number; // LPA
  placementTopPackage: number; // LPA
  placementRate: number; // %
  scholarshipsAvailable: boolean;
  scholarshipDetails: string;
  admissionProcess: string[];
  entranceExamsAccepted: string[];
  overview: string;
  icon: string;
  isSaved?: boolean;
}

// ── Scholarship ───────────────────────────────────────────────────────────────
export type ScholarshipCategory =
  | "Merit"
  | "Need-based"
  | "Category"
  | "Sports"
  | "Research";

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: number;
  frequency: "One-time" | "Annual";
  eligibility: string[];
  applicableStages: CareerStage[];
  requiredDocuments: string[];
  deadline: string; // ISO date string
  applicationUrl: string;
  category: ScholarshipCategory;
  isSaved?: boolean;
}

// ── Industry ──────────────────────────────────────────────────────────────────
export interface TrendPoint {
  year: string;
  value: number;
}

export interface MarketTrend {
  salaryTrend: TrendPoint[];
  demandTrend: TrendPoint[];
  hiringTrend: TrendPoint[];
  emergingTechnologies: string[];
  futureSkills: string[];
}

export interface Industry {
  id: string;
  name: string;
  icon: string;
  description: string;
  growthPercent: number;
  avgSalaryLPA: number;
  trendingCareers: string[];
  topRecruiters: string[];
  futureOpportunities: string[];
  marketTrends: MarketTrend;
}

// ── Activity Feed ─────────────────────────────────────────────────────────────
export type ActivityType =
  | "savedCareer"
  | "savedCollege"
  | "savedScholarship"
  | "startedRoadmap"
  | "completedMilestone"
  | "comparedCareers"
  | "comparedColleges";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  subtitle: string;
  timestamp: string; // ISO
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export type AnalyticsEntityType =
  | "career"
  | "college"
  | "scholarship"
  | "roadmap"
  | "industry";

export interface AnalyticsEvent {
  type: "view" | "save" | "compare" | "start";
  entityType: AnalyticsEntityType;
  entityId: string;
  timestamp: string;
}

// ── Search Result ─────────────────────────────────────────────────────────────
export type SearchResultType =
  | "career"
  | "college"
  | "scholarship"
  | "roadmap"
  | "industry";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  icon: string;
}

// ── Navigation ────────────────────────────────────────────────────────────────
export type KnowNextView =
  | "landing"
  | "careerExplorer"
  | "careerDetails"
  | "careerRoadmapView"
  | "careerComparison"
  | "careerRoadmaps"
  | "learningPath"
  | "colleges"
  | "collegeDetails"
  | "collegeComparison"
  | "scholarships"
  | "scholarshipDetails"
  | "industryInsights"
  | "marketTrends"
  | "careerPlan"
  | "savedItems"
  | "nextActions"
  | "deadlineTracker";

export interface NavContext {
  selectedCareerId?: string;
  compareCareerIds?: string[];
  selectedRoadmapId?: string;
  selectedCollegeId?: string;
  compareCollegeIds?: string[];
  selectedScholarshipId?: string;
  selectedIndustryId?: string;
}
