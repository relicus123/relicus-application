import { useSkillsStore, Course } from "../store/skills.store";

export const enrollmentService = {
  // Check if course is enrolled
  isEnrolled: (courseId: string): boolean => {
    return useSkillsStore.getState().enrolledCourseIds.includes(courseId);
  },

  // Enroll in a course
  enroll: (courseId: string): void => {
    useSkillsStore.getState().enrollInCourse(courseId);
  },

  // Get list of all enrolled courses
  getEnrolledCourses: (): Course[] => {
    const { enrolledCourseIds, courses } = useSkillsStore.getState();
    return courses.filter((c) => enrolledCourseIds.includes(c.id));
  },

  // Get active selected course
  getActiveCourse: (): Course | null => {
    const { currentCourseId, courses } = useSkillsStore.getState();
    if (!currentCourseId) return null;
    return courses.find((c) => c.id === currentCourseId) || null;
  },

  // Select/activate course
  selectCourse: (courseId: string | null): void => {
    useSkillsStore.getState().selectCourse(courseId);
  }
};
