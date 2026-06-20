import { useSkillsStore, AssignmentSubmission } from "../store/skills.store";
import { progressService } from "./progress.service";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export const analyticsService = {
  // Get total learning hours
  getLearningHours: (): number => {
    return useSkillsStore.getState().learningHours;
  },

  // Get current active learning streak
  getStreakCount: (): number => {
    return useSkillsStore.getState().streakCount;
  },

  // Record mock study time
  addMockLearningHours: (hours: number): void => {
    useSkillsStore.getState().addLearningHours(hours);
  },

  // Get list of achievements with unlocked status calculated dynamically
  getAchievements: (): Achievement[] => {
    const state = useSkillsStore.getState();
    const submissions = state.submissions;
    const certificates = state.certificates;
    
    // Count total completed lessons
    const completedLessonsCount = Object.values(state.lessonProgress).filter((p) => p.completed).length;

    // Check if any course is 100% completed
    const hasCompletedCourse = state.enrolledCourseIds.some(
      (id) => progressService.getCourseCompletionPercentage(id) === 100
    );

    return [
      {
        id: "streak-7",
        title: "7 Day Learning Streak",
        description: "Study for 7 consecutive days to keep your brain active.",
        icon: "🔥",
        unlocked: state.streakCount >= 7
      },
      {
        id: "first-assignment",
        title: "First Assignment Submitted",
        description: "Submit a workspace assignment or project for teacher grading.",
        icon: "🏆",
        unlocked: submissions.some((s) => s.status !== "Draft")
      },
      {
        id: "lessons-10",
        title: "Completed 10 Lessons",
        description: "Watch at least 10 lectures/lessons across all courses.",
        icon: "📚",
        unlocked: completedLessonsCount >= 10
      },
      {
        id: "passed-assessment",
        title: "Passed Final Assessment",
        description: "Attempt and score 70% or more in a final exam.",
        icon: "🎯",
        unlocked: certificates.length > 0 // Certificates are generated after passing the requirements
      },
      {
        id: "course-completed",
        title: "Course Completed",
        description: "Finish all video lessons and assignments in a course.",
        icon: "🎓",
        unlocked: hasCompletedCourse
      }
    ];
  },

  // Get average quiz accuracy
  getAverageQuizScore: (): number => {
    // Return a mock stable average score based on certificates and submissions or default to 85%
    const state = useSkillsStore.getState();
    if (state.certificates.length > 0) return 92;
    if (state.submissions.length > 0) return 88;
    return 75;
  }
};
