import React, { useMemo, useState } from "react";
import { Flame, Play, Clock, ArrowRight, Video, CheckSquare, BookOpen } from "lucide-react";
import { motion } from "motion/react";
import ReactPlayer from "react-player";
import { ExamType } from "../types/exam.types";
import { useCoachingStore } from "../store/coaching.store";
import { progressService } from "../services/progress.service";
import { recentActivityService } from "../services/recentActivity.service";
import { getExamDataset } from "../data/examRegistry";
import { calculateOverallProgress } from "../utils/progress";
import { formatDuration } from "../utils/formatting";
import { getExamInfo } from "../constants/examInfo";
import { ExamCountdownWidget } from "../components/ExamCountdownWidget";
import { DailyStudyPlanWidget } from "../components/DailyStudyPlanWidget";
import { ExamReadinessCard } from "../components/ExamReadinessCard";
import { RecommendedResourcesWidget } from "../components/RecommendedResourcesWidget";

interface OverviewTabProps {
  examType: ExamType;
  onNavigate: (tabId: string, extraData?: any) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = React.memo(({
  examType,
  onNavigate,
}) => {
  const { learningStreak, recentActivity, videoProgress } = useCoachingStore();
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [playingVideoUrl, setPlayingVideoUrl] = useState("");

  // ── Central registry lookup — no switch needed ────────────────────────────
  const dataset = useMemo(() => {
    const { subjects, chapters } = getExamDataset(examType);
    return { subjects, chapters };
  }, [examType]);

  const examInfo = useMemo(() => getExamInfo(examType), [examType]);

  // Overall Completion Progress
  const overallProgress = useMemo(() => {
    const subjectIds = dataset.subjects.map(s => s.id);
    const videoProgressMap: Record<string, { progress: number; isWatched: boolean }> = {};
    Object.keys(videoProgress).forEach(key => {
      videoProgressMap[key] = {
        progress: videoProgress[key].progress,
        isWatched: videoProgress[key].isWatched
      };
    });
    return calculateOverallProgress(subjectIds, dataset.chapters, videoProgressMap);
  }, [dataset, videoProgress]);

  // Retrieve last watched video to power "Continue Learning"
  const continueLearningItem = useMemo(() => {
    const lastVideo = recentActivityService.getLastWatchedVideo(examType);
    if (lastVideo) return lastVideo;
    
    // Fallback to the first video of the first chapter
    const firstCh = dataset.chapters[0];
    if (firstCh && firstCh.videos.length > 0) {
      const v = firstCh.videos[0];
      return {
        id: v.id,
        title: v.title,
        subtitle: `Chapter: ${firstCh.name}`,
        path: `/app/coaching`,
        type: "video" as const,
        examType,
      };
    }
    return null;
  }, [examType, dataset]);

  // Recommended incomplete chapters (progress < 100%) - sorted by user's recent subject activity
  const recommendedChapters = useMemo(() => {
    const lastActivity = recentActivity.find((act) => act.examType === examType);
    const preferredSubjectId = lastActivity?.id.split("-")[0] || null;

    const incomplete = dataset.chapters
      .map((ch) => ({
        ...ch,
        chapterProgress: progressService.getChapterProgress(ch.id),
      }))
      .filter((ch) => ch.chapterProgress < 100);

    if (preferredSubjectId) {
      incomplete.sort((a, b) => {
        if (a.subjectId === preferredSubjectId && b.subjectId !== preferredSubjectId) return -1;
        if (a.subjectId !== preferredSubjectId && b.subjectId === preferredSubjectId) return 1;
        return 0;
      });
    }

    return incomplete.slice(0, 2);
  }, [dataset, recentActivity, examType]);

  // Dynamic upcoming live classes from state store
  const liveClasses = useCoachingStore((state) => state.liveClasses);
  const upcomingClasses = useMemo(() => {
    const activeLives = liveClasses.filter(
      (l) => (l.exam_id === examType || l.examId === examType) && l.status === "scheduled"
    );
    if (activeLives.length === 0) {
      return [
        { subject: "Mathematics", topic: "Calculus - Limits & Continuity", time: "Today, 4:00 PM" },
        { subject: "Physics", topic: "Ray Optics - Spherical Lenses", time: "Tomorrow, 10:00 AM" },
      ].slice(0, examType === "CUET" ? 1 : 2);
    }
    return activeLives.map((l) => ({
      subject: l.subject_id === "math" ? "Mathematics" : l.subject_id === "phys" ? "Physics" : "Chemistry",
      topic: l.topic,
      time: new Date(l.scheduled_time || l.scheduledTime).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
    }));
  }, [liveClasses, examType]);

  const handleResumeLearning = () => {
    if (!continueLearningItem) return;
    
    // Find the actual video link
    let videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4"; // Default fallback
    for (const ch of dataset.chapters) {
      const vid = ch.videos.find(v => v.id === continueLearningItem.id);
      if (vid) {
        videoUrl = vid.url;
        break;
      }
    }
    setPlayingVideoUrl(videoUrl);
    setShowVideoModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Continue Learning card */}
      {continueLearningItem && (
        <div className="p-5 bg-white border border-neutral-100 rounded-[2rem] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center shrink-0 text-purple-500">
              <Play className="w-6 h-6 fill-current" />
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-0.5">
                Continue Learning
              </span>
              <h4 className="font-bold text-foreground text-sm leading-tight mb-1 truncate max-w-[200px]">
                {continueLearningItem.title}
              </h4>
              <p className="text-[11px] text-neutral-400 truncate max-w-[200px]">{continueLearningItem.subtitle}</p>
            </div>
          </div>
          <button
            onClick={handleResumeLearning}
            className="whitespace-nowrap shrink-0 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-primary rounded-full hover:bg-primary/95 hover:translate-x-0.5 transition-all cursor-pointer"
          >
            Resume <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Progress & Streak split */}
      <div className="grid grid-cols-2 gap-4">
        {/* Course progress */}
        <div className="p-5 bg-white border border-neutral-100 rounded-[2rem] shadow-xs flex flex-col justify-between min-h-[120px]">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
            Overall Progress
          </span>
          <div>
            <h3 className="text-3xl font-extrabold text-foreground leading-none">{overallProgress}%</h3>
            <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden mt-3">
              <div className="h-full bg-[#5F8B70] rounded-full" style={{ width: `${overallProgress}%` }} />
            </div>
          </div>
        </div>

        {/* Learning streak */}
        <div className="p-5 bg-white border border-neutral-100 rounded-[2rem] shadow-xs flex flex-col justify-between min-h-[120px]">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
            Active Streak
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-3xl font-extrabold text-foreground leading-none">{learningStreak}</h3>
              <Flame className="w-6 h-6 text-orange-500" fill="#F97316" />
            </div>
            <p className="text-[10px] text-neutral-400 mt-2 font-semibold">Keep it up! Daily target is 1hr.</p>
          </div>
        </div>
      </div>

      {/* Recommended Chapters */}
      {recommendedChapters.length > 0 && (
        <div>
          <h3 className="text-base font-extrabold text-foreground mb-3 px-1">Recommended for You</h3>
          <div className="space-y-3">
            {recommendedChapters.map((ch) => (
              <div
                key={ch.id}
                onClick={() => onNavigate("chapters", { subjectId: ch.subjectId, chapterId: ch.id })}
                className="p-4 bg-white border border-neutral-100 rounded-[2rem] shadow-xs flex items-center justify-between cursor-pointer group hover:border-primary/20 transition-all duration-350"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FFFFF0] border border-[#5F8B70]/10 rounded-xl flex items-center justify-center text-[#5F8B70]">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      {ch.name}
                    </h4>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      Progress: {ch.chapterProgress}% • {ch.videos.length} Videos
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Live Classes */}
      <div>
        <h3 className="text-base font-extrabold text-foreground mb-3 px-1">Upcoming Live Classes</h3>
        <div className="space-y-3">
          {upcomingClasses.map((cls, idx) => (
            <div
              key={idx}
              className="p-4 bg-gradient-to-r from-red-50/50 to-orange-50/20 border border-red-100/50 rounded-[2rem] flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-500 animate-pulse">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">{cls.topic}</h4>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{cls.subject} • {cls.time}</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate("live")}
                className="px-3.5 py-1.5 text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 rounded-full transition-colors cursor-pointer"
              >
                Join
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── New Widgets Row ──────────────────────────────────────────────────── */}

      {/* Exam Countdown */}
      {examInfo && (
        <div className="px-5">
          <ExamCountdownWidget
            examDate={examInfo.nextExamDate}
            examName={examInfo.examType}
          />
        </div>
      )}

      {/* Daily Study Plan */}
      <div className="px-5">
        <DailyStudyPlanWidget examType={examType} />
      </div>

      {/* Exam Readiness */}
      <div className="px-5">
        <ExamReadinessCard examType={examType} chapters={dataset.chapters} />
      </div>

      {/* Recommended Resources */}
      <div className="px-5 pb-4">
        <RecommendedResourcesWidget examType={examType} />
      </div>

      {/* Video Player Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden border border-neutral-100 shadow-2xl relative">
            <div className="p-4 border-b border-neutral-100 flex justify-between items-center">
              <h4 className="font-bold text-foreground text-sm">Reviewing Lecture</h4>
              <button
                onClick={() => {
                  setShowVideoModal(false);
                  setPlayingVideoUrl("");
                }}
                className="text-neutral-400 hover:text-neutral-600 font-bold text-xs"
              >
                Close
              </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              <ReactPlayer
                url={playingVideoUrl}
                playing={true}
                controls={true}
                width="100%"
                height="100%"
                onError={() => console.log("Video loading failed.")}
              />
            </div>
            <div className="p-4 text-center text-xs text-neutral-400">
              Interactive Video Playback powered by React Player
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

OverviewTab.displayName = "OverviewTab";
