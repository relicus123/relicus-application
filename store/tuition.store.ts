import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './auth.store';

export interface Student {
  user_id: string;
  name: string;
  class_level: string;
  board: string;
  streak_days: number;
  attendance_percent: number;
  total_points: number;
  rank: number;
  avatar: string;
  enrolled_subjects: string[];
}

export interface Parent {
  user_id: string;
  name: string;
  email: string;
  phone: string;
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
  submitAssessment: (assessment: any) => void;
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

      set({ 
        student: student || null, 
        parent: parent || null,
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

  submitAssessment: () => {},
}));
