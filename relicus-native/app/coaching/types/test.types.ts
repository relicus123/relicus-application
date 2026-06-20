import { ExamType } from "./exam.types";

export interface MockTestQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: string;
  topic?: string;
}

export interface MockTest {
  id: string;
  name: string;
  examType: ExamType;
  type: "subject" | "chapter" | "full";
  subjectId?: string;
  duration: number; // in seconds
  questionsCount: number;
  questions: MockTestQuestion[];
}

export interface TopicAnalysis {
  topic: string;
  total: number;
  correct: number;
  incorrect: number;
}

export interface SectionAnalysis {
  section: string; // e.g. "Physics"
  total: number;
  correct: number;
  incorrect: number;
  timeSpent: number; // in seconds
}

export interface TestAttempt {
  id: string;
  testId: string;
  testName: string;
  examType: ExamType;
  date: string;
  score: number; // actual marks
  maxScore: number;
  accuracy: number; // percentage
  rank: number; // rank among simulated competitors
  percentile: number;
  timeTaken: number; // in seconds
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  answers: (number | null)[]; // user answers corresponding to questions index
  topicAnalysis: TopicAnalysis[];
  sectionAnalysis: SectionAnalysis[];
}
