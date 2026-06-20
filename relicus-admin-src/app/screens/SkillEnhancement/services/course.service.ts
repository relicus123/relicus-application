import { useSkillsStore, Course, Module, Lesson, Assignment, Material } from "../store/skills.store";

export interface SearchResult {
  type: "course" | "module" | "lesson" | "note" | "assignment";
  courseId: string;
  courseTitle: string;
  title: string;
  subtitle: string;
  itemId?: string;
  moduleId?: string;
}

export const courseService = {
  // Get all available courses
  getCourses: (): Course[] => {
    return useSkillsStore.getState().courses;
  },

  // Get single course by ID
  getCourseById: (id: string): Course | undefined => {
    return useSkillsStore.getState().courses.find((c) => c.id === id);
  },

  // Get courses by category
  getCoursesByCategory: (category: string): Course[] => {
    const courses = useSkillsStore.getState().courses;
    if (category.toLowerCase() === "all") return courses;
    return courses.filter((c) => c.category.toLowerCase() === category.toLowerCase());
  },

  // Get unique list of categories
  getCategories: (): string[] => {
    const courses = useSkillsStore.getState().courses;
    const categories = new Set(courses.map((c) => c.category));
    return ["All", ...Array.from(categories)];
  },

  // Get Course Recommendations based on user profile and enrollment states
  getRecommendations: (currentCourseId?: string | null): Course[] => {
    const state = useSkillsStore.getState();
    const enrolled = state.enrolledCourseIds;
    
    // Filter courses the user is NOT currently enrolled in, and is NOT the active course
    let recommended = state.courses.filter(
      (c) => c.id !== currentCourseId && !enrolled.includes(c.id)
    );

    // Fallback: If enrolled in all, recommend other courses from catalog except the current one
    if (recommended.length === 0) {
      recommended = state.courses.filter((c) => c.id !== currentCourseId);
    }

    return recommended;
  },

  // Global search across Courses, Modules, Lessons, Notes, and Assignments
  globalSearch: (query: string): SearchResult[] => {
    if (!query || query.trim() === "") return [];
    
    const cleanQuery = query.toLowerCase().trim();
    const courses = useSkillsStore.getState().courses;
    const results: SearchResult[] = [];

    courses.forEach((course) => {
      // 1. Match course title or description
      if (
        course.title.toLowerCase().includes(cleanQuery) ||
        course.description.toLowerCase().includes(cleanQuery) ||
        course.category.toLowerCase().includes(cleanQuery)
      ) {
        results.push({
          type: "course",
          courseId: course.id,
          courseTitle: course.title,
          title: course.title,
          subtitle: `Category: ${course.category} | Level: ${course.level}`
        });
      }

      course.modules.forEach((mod) => {
        // 2. Match Module
        if (mod.title.toLowerCase().includes(cleanQuery) || mod.description.toLowerCase().includes(cleanQuery)) {
          results.push({
            type: "module",
            courseId: course.id,
            courseTitle: course.title,
            title: mod.title,
            subtitle: `Module inside ${course.title}`,
            moduleId: mod.id
          });
        }

        // 3. Match Lessons
        mod.lessons.forEach((les) => {
          if (les.title.toLowerCase().includes(cleanQuery)) {
            results.push({
              type: "lesson",
              courseId: course.id,
              courseTitle: course.title,
              title: les.title,
              subtitle: `Lesson • Video (${les.duration}) in ${mod.title}`,
              itemId: les.id,
              moduleId: mod.id
            });
          }
        });

        // 4. Match Notes/Materials
        mod.materials.forEach((mat) => {
          if (mat.title.toLowerCase().includes(cleanQuery)) {
            results.push({
              type: "note",
              courseId: course.id,
              courseTitle: course.title,
              title: mat.title,
              subtitle: `Reference Material (${mat.type.toUpperCase()}) in ${mod.title}`,
              itemId: mat.id,
              moduleId: mod.id
            });
          }
        });

        // 5. Match Assignments
        mod.assignments.forEach((assign) => {
          if (assign.title.toLowerCase().includes(cleanQuery) || assign.instructions.toLowerCase().includes(cleanQuery)) {
            results.push({
              type: "assignment",
              courseId: course.id,
              courseTitle: course.title,
              title: assign.title,
              subtitle: `Assignment task in ${mod.title}`,
              itemId: assign.id,
              moduleId: mod.id
            });
          }
        });
      });
    });

    return results;
  }
};
