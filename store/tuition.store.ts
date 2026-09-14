import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

export const useTuitionStore = create<TuitionStore>()(
  persist(
    (set, get) => ({
      student: null,
      parent: null,
      isLoading: false,
      activeTab: "overview",
      setActiveTab: (tab) => set({ activeTab: tab }),
      selectedTeacher: null,
      setSelectedTeacher: (teacher) => set({ selectedTeacher: teacher }),
      selectedClass: null,
      setSelectedClass: (cls) => set({ selectedClass: cls }),
      completedAssignments: [],
      
      fetchProfile: async () => {
        const { student } = get();
        if (!student) {
          set({ isLoading: true });
        }
        try {
          const currentUser = useAuthStore.getState().currentUser;
          if (!currentUser) return;

          const [
            { data: studentData },
            { data: parentData },
            { data: assignments }
          ] = await Promise.all([
            supabase.from('tuition_students').select('*').eq('user_id', currentUser.id).maybeSingle(),
            supabase.from('tuition_parents').select('*').eq('user_id', currentUser.id).maybeSingle(),
            supabase.from('tuition_completed_assignments').select('assignment_id').eq('user_id', currentUser.id)
          ]);

          const formattedStudent: Student | null = studentData ? {
            ...studentData,
            classLevel: (studentData as any).class_level || (studentData as any).classLevel,
            streakDays: (studentData as any).streak_days || (studentData as any).streakDays || 0,
            attendancePercent: (studentData as any).attendance_percent || (studentData as any).attendancePercent || 0,
            totalPoints: (studentData as any).total_points || (studentData as any).totalPoints || 0,
            enrolledSubjects: (studentData as any).enrolled_subjects || (studentData as any).enrolledSubjects || [],
          } : null;

          const formattedParent: Parent | null = parentData ? {
            ...parentData,
            feeStatus: (parentData as any).fee_status || (parentData as any).feeStatus || "Paid",
            nextFeeDueDate: (parentData as any).next_fee_due_date || (parentData as any).nextFeeDueDate || new Date().toISOString(),
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
    }),
    {
      name: 'relicus-tuition-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
