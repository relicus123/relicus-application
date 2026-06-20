import React, { useState, useEffect } from "react";
import { useSkillsStore } from "./store/skills.store";
import { LandingHub } from "./panels/LandingHub";
import { CourseDashboard } from "./panels/CourseDashboard";
import { VideoLectureDrawer } from "./components/VideoLectureDrawer";
import { supabase } from "../../services/supabaseClient";

export function SkillEnhancement() {
  const currentCourseId = useSkillsStore((state) => state.currentCourseId);
  const setCourses = useSkillsStore((state) => state.setCourses);

  useEffect(() => {
    async function loadDynamicCourses() {
      try {
        // Dynamic query from Supabase
        const { data, error } = await supabase
          .from("skills_courses")
          .select(`
            *,
            modules:skills_modules(
              *,
              lessons:skills_lessons(*),
              materials:skills_materials(*)
            )
          `);
        if (!error && data) {
          setCourses(data);
        }
      } catch (err) {
        console.error("Failed to load skills courses dynamically:", err);
      }
    }
    loadDynamicCourses();
  }, [setCourses]);

  // Global overlay state for active video lesson
  const [activeVideo, setActiveVideo] = useState<{
    courseId: string;
    moduleId: string;
    lessonId: string;
    title: string;
    videoUrl: string;
  } | null>(null);

  const handleOpenVideo = (courseId: string, moduleId: string, lessonId: string, title: string, url: string) => {
    setActiveVideo({ courseId, moduleId, lessonId, title, videoUrl: url });
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-16">
      {currentCourseId === null ? (
        <LandingHub onOpenVideo={handleOpenVideo} />
      ) : (
        <CourseDashboard courseId={currentCourseId} onOpenVideo={handleOpenVideo} />
      )}

      {/* Global Video Overlay Modal */}
      {activeVideo && (
        <VideoLectureDrawer
          courseId={activeVideo.courseId}
          moduleId={activeVideo.moduleId}
          lessonId={activeVideo.lessonId}
          title={activeVideo.title}
          videoUrl={activeVideo.videoUrl}
          onClose={() => setActiveVideo(null)}
        />
      )}
    </div>
  );
}
export default SkillEnhancement;
