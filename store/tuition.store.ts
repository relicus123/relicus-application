import { create } from 'zustand';

interface Student {
  name: string;
  classLevel: string;
  board: string;
  streakDays: number;
  attendancePercent: number;
  totalPoints: number;
  rank: number;
  avatar: string;
  enrolledSubjects: string[];
}

interface TuitionStore {
  student: Student;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedTeacher: any;
  setSelectedTeacher: (teacher: any) => void;
  selectedClass: any;
  setSelectedClass: (cls: any) => void;
  completedAssignments: string[];
  toggleAssignmentComplete: (id: string) => void;
  submitAssessment: (assessment: any) => void;
  parent: any;
}

export const useTuitionStore = create<TuitionStore>((set) => ({
  student: {
    name: "Aarav Sharma",
    classLevel: "10th Grade",
    board: "CBSE",
    streakDays: 7,
    attendancePercent: 95,
    totalPoints: 1250,
    rank: 3,
    avatar: "https://picsum.photos/id/64/200",
    enrolledSubjects: ["Mathematics", "Science", "English", "History"],
  },
  activeTab: "overview",
  setActiveTab: (tab) => set({ activeTab: tab }),
  selectedTeacher: null,
  setSelectedTeacher: (teacher) => set({ selectedTeacher: teacher }),
  selectedClass: null,
  setSelectedClass: (cls) => set({ selectedClass: cls }),
  completedAssignments: [],
  toggleAssignmentComplete: (id) => set((state) => ({
    completedAssignments: state.completedAssignments.includes(id)
      ? state.completedAssignments.filter((i) => i !== id)
      : [...state.completedAssignments, id]
  })),
  submitAssessment: () => {},
  parent: {
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    phone: "+91 98765 43210",
  },
}));
