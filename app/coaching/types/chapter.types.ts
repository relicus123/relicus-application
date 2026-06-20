export interface RecordedVideo {
  id: string;
  title: string;
  duration: string;
  url: string;
  progress: number; // percentage 0 - 100
  isWatched: boolean;
}

export interface Note {
  id: string;
  title: string;
  size: string;
  pdfUrl: string;
  isBookmarked: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  status: "pending" | "submitted" | "evaluated";
  score?: string; // e.g. "9/10"
}

export interface PracticeQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // 0-3 index
  explanation: string;
}

export interface Chapter {
  id: string;
  name: string;
  subjectId: string;
  progress: number; // completion progress
  videos: RecordedVideo[];
  notes: Note[];
  assignments: Assignment[];
  practiceQuestions: PracticeQuestion[];
  chapterTestId?: string;
}
