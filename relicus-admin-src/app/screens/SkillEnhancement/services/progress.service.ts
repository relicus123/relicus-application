import { useSkillsStore, Course, Lesson } from "../store/skills.store";

export const progressService = {
  // Update video/lesson progress
  updateLessonProgress: (courseId: string, lessonId: string, progress: number, completed: boolean): void => {
    useSkillsStore.getState().updateLessonProgress(courseId, lessonId, progress, completed);
  },

  // Get progress for a single lesson
  getLessonProgress: (courseId: string, lessonId: string): { progress: number; completed: boolean } => {
    const key = `${courseId}_${lessonId}`;
    return useSkillsStore.getState().lessonProgress[key] || { progress: 0, completed: false };
  },

  // Calculate course completion percentage
  getCourseCompletionPercentage: (courseId: string): number => {
    const state = useSkillsStore.getState();
    const course = state.courses.find((c) => c.id === courseId);
    if (!course) return 0;

    let totalLessons = 0;
    let completedLessons = 0;

    course.modules.forEach((mod) => {
      mod.lessons.forEach((les) => {
        totalLessons++;
        const key = `${courseId}_${les.id}`;
        const prog = state.lessonProgress[key];
        if (prog?.completed) {
          completedLessons++;
        }
      });
    });

    if (totalLessons === 0) return 100;
    return Math.round((completedLessons / totalLessons) * 100);
  },

  // Get number of completed modules in a course
  getCompletedModulesCount: (courseId: string): { completed: number; total: number } => {
    const state = useSkillsStore.getState();
    const course = state.courses.find((c) => c.id === courseId);
    if (!course) return { completed: 0, total: 0 };

    let completedModules = 0;
    const totalModules = course.modules.length;

    course.modules.forEach((mod) => {
      // A module is completed if all its lessons are completed
      let allLessonsCompleted = mod.lessons.length > 0;
      mod.lessons.forEach((les) => {
        const key = `${courseId}_${les.id}`;
        const prog = state.lessonProgress[key];
        if (!prog?.completed) {
          allLessonsCompleted = false;
        }
      });

      if (allLessonsCompleted) {
        completedModules++;
      }
    });

    return { completed: completedModules, total: totalModules };
  },

  // Check if a module is fully completed
  isModuleCompleted: (courseId: string, moduleId: string): boolean => {
    const state = useSkillsStore.getState();
    const course = state.courses.find((c) => c.id === courseId);
    if (!course) return false;

    const mod = course.modules.find((m) => m.id === moduleId);
    if (!mod) return false;

    if (mod.lessons.length === 0) return true;

    return mod.lessons.every((les) => {
      const key = `${courseId}_${les.id}`;
      return state.lessonProgress[key]?.completed === true;
    });
  },

  // Get index of the last active lesson to continue learning
  getLastActiveLesson: (courseId: string): { moduleId: string; lessonId: string; title: string } | null => {
    const state = useSkillsStore.getState();
    const course = state.courses.find((c) => c.id === courseId);
    if (!course) return null;

    // Find the first lesson that is not completed
    for (const mod of course.modules) {
      for (const les of mod.lessons) {
        const key = `${courseId}_${les.id}`;
        const prog = state.lessonProgress[key];
        if (!prog || !prog.completed) {
          return {
            moduleId: mod.id,
            lessonId: les.id,
            title: les.title
          };
        }
      }
    }

    // Default to first lesson if all completed
    if (course.modules.length > 0 && course.modules[0].lessons.length > 0) {
      return {
        moduleId: course.modules[0].id,
        lessonId: course.modules[0].lessons[0].id,
        title: course.modules[0].lessons[0].title
      };
    }

    return null;
  }
};
