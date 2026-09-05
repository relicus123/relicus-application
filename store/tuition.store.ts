import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './auth.store';

export interface Student {
  user_id: string;
  name: string;
  class_level: string;
  classLevel?: string;
  board: string;
  streak_days: number;
  streakDays?: number;
  attendance_percent: number;
  attendancePercent?: number;
  total_points: number;
  totalPoints?: number;
  rank: number;
  avatar?: string;
  enrolled_subjects: string[];
  enrolledSubjects?: string[];
}

export interface Parent {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  feeStatus?: "Paid" | "Pending" | "Overdue";
  nextFeeDueDate?: string;
}

interface TuitionStore {
  student: Student | null;
  parent: Parent | null;
  isLoading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedTeacher: any;
  setSelectedTeacher: (teacher: any) => void;
  selectedClass: any;
  setSelectedClass: (cls: any) => void;
  completedAssignments: string[];
  
  fetchProfile: () => Promise<void>;
  createProfile: (name: string, classLevel: string, board: string) => Promise<void>;
  toggleAssignmentComplete: (id: string) => Promise<void>;
  submitAssessment: (assessmentIdOrObj: any, score?: number) => void;
}

export const useTuitionStore = create<TuitionStore>((set, get) => ({
  student: null,
  parent: null,
  isLoading: true,
  activeTab: "overview",
  setActiveTab: (tab) => set({ activeTab: tab }),
  selectedTeacher: null,
  setSelectedTeacher: (teacher) => set({ selectedTeacher: teacher }),
  selectedClass: null,
  setSelectedClass: (cls) => set({ selectedClass: cls }),
  completedAssignments: [],
  
  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const currentUser = useAuthStore.getState().currentUser;
      if (!currentUser) throw new Error("Not logged in");

      const { data: student } = await supabase
        .from('tuition_students')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();
        
      const { data: parent } = await supabase
        .from('tuition_parents')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      const { data: assignments } = await supabase
        .from('tuition_completed_assignments')
        .select('assignment_id')
        .eq('user_id', currentUser.id);

      const formattedStudent: Student | null = student ? {
        ...student,
        classLevel: (student as any).class_level || (student as any).classLevel,
        streakDays: (student as any).streak_days || (student as any).streakDays || 0,
        attendancePercent: (student as any).attendance_percent || (student as any).attendancePercent || 0,
        totalPoints: (student as any).total_points || (student as any).totalPoints || 0,
        enrolledSubjects: (student as any).enrolled_subjects || (student as any).enrolledSubjects || [],
      } : null;

      const formattedParent: Parent | null = parent ? {
        ...parent,
        feeStatus: (parent as any).fee_status || (parent as any).feeStatus || "Paid",
        nextFeeDueDate: (parent as any).next_fee_due_date || (parent as any).nextFeeDueDate || new Date().toISOString(),
      } : null;

      set({ 
        student: formattedStudent, 
        parent: formattedParent,
        completedAssignments: assignments ? assignments.map(a => a.assignment_id) : [],
      });
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoading: false });
    }
  },

  createProfile: async (name, classLevel, board) => {
    set({ isLoading: true });
    try {
      const currentUser = useAuthStore.getState().currentUser;
      if (!currentUser) throw new Error("Not logged in");

      const newStudent = {
        user_id: currentUser.id,
        name,
        class_level: classLevel,
        board,
        streak_days: 0,
        attendance_percent: 100,
        total_points: 0,
        rank: 1,
        enrolled_subjects: [],
      };

      const { data, error } = await supabase
        .from('tuition_students')
        .insert([newStudent])
        .select()
        .single();

      if (error) throw error;
      set({ student: data as Student });
    } catch (e: any) {
      console.error(e);
      alert("Error creating profile: " + e.message);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleAssignmentComplete: async (assignmentId) => {
    const { completedAssignments } = get();
    const isCompleted = completedAssignments.includes(assignmentId);
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) return;

    // Optimistic update
    set({
      completedAssignments: isCompleted
        ? completedAssignments.filter((id) => id !== assignmentId)
        : [...completedAssignments, assignmentId]
    });

    try {
      if (isCompleted) {
        await supabase
          .from('tuition_completed_assignments')
          .delete()
          .match({ user_id: currentUser.id, assignment_id: assignmentId });
      } else {
        await supabase
          .from('tuition_completed_assignments')
          .insert([{ user_id: currentUser.id, assignment_id: assignmentId }]);
      }
    } catch (e) {
      console.error(e);
      // Revert on error
      set({ completedAssignments });
    }
  },

  submitAssessment: (assessmentIdOrObj: any, score?: number) => {
    console.log("Submitting assessment", assessmentIdOrObj, score);
  },
}));
