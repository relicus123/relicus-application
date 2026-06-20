import React, { useMemo } from "react";
import { useNavigate } from "react-router";
import { Play, ArrowRight, BookOpen } from "lucide-react";
import { useSkillsStore } from "../store/skills.store";
import { progressService } from "../services/progress.service";
import { enrollmentService } from "../services/enrollment.service";
import { courseService } from "../services/course.service";

interface ContinueLearningWidgetProps {
  className?: string;
  onOpenVideo?: (courseId: string, moduleId: string, lessonId: string, title: string, url: string) => void;
}

export const ContinueLearningWidget: React.FC<ContinueLearningWidgetProps> = ({ className = "", onOpenVideo }) => {
  const navigate = useNavigate();
  const store = useSkillsStore();
  const enrolledCourseIds = store.enrolledCourseIds;
  const courses = store.courses;

  const data = useMemo(() => {
    if (enrolledCourseIds.length === 0) return null;

    // Find first enrolled course that is not 100% completed
    const activeCourse = courses.filter((c) => enrolledCourseIds.includes(c.id)).find(
      (c) => progressService.getCourseCompletionPercentage(c.id) < 100
    ) || courses.find((c) => enrolledCourseIds.includes(c.id));

    if (!activeCourse) return null;

    const activeLesson = progressService.getLastActiveLesson(activeCourse.id);
    if (!activeLesson) return null;

    const mod = activeCourse.modules.find((m) => m.id === activeLesson.moduleId);
    const les = mod?.lessons.find((l) => l.id === activeLesson.lessonId);
    const progress = progressService.getCourseCompletionPercentage(activeCourse.id);

    return {
      courseId: activeCourse.id,
      courseTitle: activeCourse.title,
      moduleId: activeLesson.moduleId,
      lessonId: activeLesson.lessonId,
      lessonTitle: activeLesson.title,
      videoUrl: les?.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4",
      moduleTitle: mod?.title || "Curriculum",
      progress
    };
  }, [enrolledCourseIds, courses, store.lessonProgress]);

  if (!data) return null;

  const handleResume = () => {
    // Navigate to skills dashboard
    enrollmentService.selectCourse(data.courseId);
    store.setActiveDashboardTab("curriculum");
    
    // Trigger video playback if callback provided
    if (onOpenVideo) {
      onOpenVideo(data.courseId, data.moduleId, data.lessonId, data.lessonTitle, data.videoUrl);
    } else {
      // Just navigate to the skills page which will show active course
      navigate("/app/skills");
    }
  };

  return (
    <div className={`bg-gradient-to-r from-[#1C4966]/5 to-[#5F8B70]/5 border border-[#1C4966]/10 rounded-[2rem] p-5 flex flex-col justify-between shadow-xs ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#5F8B70] animate-ping" />
          <span className="text-[9px] font-black text-[#5F8B70] uppercase tracking-widest">
            Continue Learning
          </span>
        </div>
        <span className="text-[9px] font-black text-[#1C4966] uppercase tracking-widest bg-white border border-[#1C4966]/10 px-2 py-0.5 rounded-full">
          {data.progress}% Completed
        </span>
      </div>

      <div className="my-3.5">
        <h5 className="font-extrabold text-foreground text-xs leading-snug">{data.courseTitle}</h5>
        <p className="text-[9.5px] text-neutral-400 mt-1 font-medium leading-none">
          Module: {data.moduleTitle} • {data.lessonTitle}
        </p>
      </div>

      <button
        onClick={handleResume}
        className="flex items-center gap-1 text-[9.5px] font-black text-[#1C4966] uppercase tracking-widest hover:underline text-left self-start group transition-all"
      >
        Resume Lesson <ArrowRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
};
export default ContinueLearningWidget;
