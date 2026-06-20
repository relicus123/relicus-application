export type ExamType = "CUET" | "JEE" | "NEET" | "UGC-NET" | "GATE" | "EAMCET" | "ICET";

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  chaptersCount: number;
  mockTestsCount: number;
}

export interface ExamConfig {
  name: ExamType;
  fullName: string;
  subjects: Subject[];
}

// ─── Category groupings for ExamSelection ───────────────────────────────────
export interface ExamCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  exams: ExamType[];
}

// ─── Exam Information Screen data ────────────────────────────────────────────
export interface ExamPatternSection {
  section: string;
  questions: number;
  marks: number;
  duration: string;
}

export interface ExamInfoData {
  examType: ExamType;
  tagline: string;
  overview: string;
  eligibility: string[];
  examPattern: ExamPatternSection[];
  /** ISO date string e.g. "2027-04-13" */
  nextExamDate: string;
  syllabusTopics: string[];
  /** 1 = Easy → 5 = Very Hard */
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  careerOpportunities: string[];
}
