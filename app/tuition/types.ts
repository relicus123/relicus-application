// ─────────────────────────────────────────────────────────────────────────────
// Tuition Learning Module — TypeScript Types
// ─────────────────────────────────────────────────────────────────────────────

// ── Shared Types ──────────────────────────────────────────────────────────────
export type Subject =
  | "Mathematics"
  | "Science"
  | "Physics"
  | "Chemistry"
  | "Biology"
  | "English"
  | "History"
  | "Geography"
  | "Computer Science";

export type ClassLevel = "Class 9" | "Class 10" | "Class 11" | "Class 12";

// ── Profile ───────────────────────────────────────────────────────────────────
export interface StudentProfile {
  id: string;
  name: string;
  avatar: string;
  classLevel: ClassLevel;
  board: string;
  enrolledSubjects: Subject[];
  attendancePercent: number;
  streakDays: number;
  totalPoints: number;
  rank: number;
}

export interface ParentProfile {
  id: string;
  studentId: string;
  name: string;
  phone: string;
  feeStatus: "Paid" | "Pending" | "Overdue";
  nextFeeDueDate: string; // ISO String
}

// ── Learning Path & Classes ───────────────────────────────────────────────────
export interface ClassSession {
  id: string;
  title: string;
  subject: Subject;
  teacherId: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  status: "Upcoming" | "Live" | "Completed";
  meetingLink?: string;
  isJoined?: boolean;
}

export interface SyllabusTopic {
  id: string;
  subject: Subject;
  chapterNumber: number;
  title: string;
  progressPercent: number;
  status: "Not Started" | "In Progress" | "Completed";
}

// ── Teachers & Chat ───────────────────────────────────────────────────────────
export interface Teacher {
  id: string;
  name: string;
  avatar: string;
  subjects: Subject[];
  experienceYears: number;
  rating: number;
  availability: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderType: "Student" | "Teacher" | "AI";
  content: string;
  timestamp: string; // ISO
  attachmentUrl?: string;
}

// ── Assessment ────────────────────────────────────────────────────────────────
export type AssessmentType = "Daily Quiz" | "Weekly Test" | "Monthly Exam";

export interface Assessment {
  id: string;
  title: string;
  subject: Subject;
  type: AssessmentType;
  totalMarks: number;
  durationMinutes: number;
  dueDate: string; // ISO
  status: "Pending" | "Submitted" | "Graded";
  score?: number;
}

// ── Study Materials ───────────────────────────────────────────────────────────
export type MaterialType = "PDF" | "Video" | "Notes" | "Practice Paper";

export interface StudyMaterial {
  id: string;
  title: string;
  subject: Subject;
  type: MaterialType;
  url: string;
  size?: string;
  duration?: string; // For videos
  uploadDate: string; // ISO
}

// ── Gamification ──────────────────────────────────────────────────────────────
export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedDate?: string; // ISO
}

export interface LeaderboardEntry {
  studentId: string;
  name: string;
  avatar: string;
  points: number;
  rank: number;
}

// ── Notifications ─────────────────────────────────────────────────────────────
export type NotificationType = "Class" | "Assignment" | "Test" | "Announcement";

export interface TuitionNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO
  isRead: boolean;
}

// ── Navigation ────────────────────────────────────────────────────────────────
export type TuitionView =
  | "home"
  | "learningPath"
  | "classDetails"
  | "myTeachers"
  | "teacherChat"
  | "testCentre"
  | "assessmentDetails"
  | "studyMaterials"
  | "profile"
  | "parentDashboard"
  | "aiAssistant"
  | "leaderboard"
  | "notifications";

export interface TuitionNavContext {
  selectedSubject?: Subject;
  selectedClassId?: string;
  selectedTeacherId?: string;
  selectedAssessmentId?: string;
}
