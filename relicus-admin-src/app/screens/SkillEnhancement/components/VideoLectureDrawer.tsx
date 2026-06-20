import React, { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import { X, Play, Pause, RotateCcw, Volume2, Bookmark, Star } from "lucide-react";
import { progressService } from "../services/progress.service";
import { useSkillsStore } from "../store/skills.store";

interface VideoLectureDrawerProps {
  courseId: string;
  moduleId: string;
  lessonId: string;
  title: string;
  videoUrl: string;
  onClose: () => void;
}

export const VideoLectureDrawer: React.FC<VideoLectureDrawerProps> = ({
  courseId,
  moduleId,
  lessonId,
  title,
  videoUrl,
  onClose
}) => {
  const [playing, setPlaying] = useState(true);
  const [playedPercent, setPlayedPercent] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<ReactPlayer>(null);
  
  const bookmarks = useSkillsStore((state) => state.bookmarks);
  const toggleBookmark = useSkillsStore((state) => state.toggleBookmark);

  const isBookmarked = bookmarks.some(
    (bm) => bm.courseId === courseId && bm.itemId === lessonId && bm.type === "lesson"
  );

  // Set up progress tracking
  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    const percent = Math.round(state.played * 100);
    setPlayedPercent(percent);

    // Save progress to store
    const completed = percent >= 90;
    progressService.updateLessonProgress(courseId, lessonId, percent, completed);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setPlayedPercent(Math.round(value * 100));
    playerRef.current?.seekTo(value);
  };

  const handleToggleBookmark = () => {
    toggleBookmark({
      courseId,
      itemId: lessonId,
      type: "lesson",
      title: title,
      subtitle: "Video Lecture"
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden border border-neutral-100 shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex justify-between items-center bg-white shrink-0">
          <div className="min-w-0 pr-4">
            <span className="text-[9px] font-extrabold text-[#8FBDD7] uppercase tracking-widest block mb-0.5">
              Playing Video Lesson
            </span>
            <h4 className="font-bold text-foreground text-sm truncate leading-snug">{title}</h4>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleToggleBookmark}
              className={`p-2 rounded-xl border transition-all ${
                isBookmarked
                  ? "bg-amber-50 border-amber-200 text-amber-500"
                  : "bg-neutral-50 border-neutral-100 text-neutral-400 hover:text-neutral-600"
              }`}
              title="Bookmark Lesson"
            >
              <Star className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-700 rounded-xl transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Player Box */}
        <div className="flex-1 bg-black flex items-center justify-center relative aspect-video">
          <ReactPlayer
            ref={playerRef}
            url={videoUrl}
            playing={playing}
            controls={false}
            width="100%"
            height="100%"
            onProgress={handleProgress}
            onDuration={(d) => setDuration(d)}
            onError={(e) => console.log("Video player error:", e)}
          />
        </div>

        {/* Custom Controls Panel */}
        <div className="p-6 bg-neutral-50/50 border-t border-neutral-100 shrink-0 space-y-4">
          {/* Progress Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400">
              <span>{Math.floor((playedPercent / 100) * duration)}s</span>
              <span>{Math.round(duration)}s</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.999"
              step="any"
              value={playedPercent / 100}
              onChange={handleSeek}
              className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#1C4966]"
            />
          </div>

          {/* Buttons Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPlaying(!playing)}
                className="w-10 h-10 rounded-full bg-[#1C4966] text-white flex items-center justify-center hover:bg-[#1C4966]/90 transition-all shadow-md active:scale-95"
              >
                {playing ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              <button
                onClick={() => playerRef.current?.seekTo(0)}
                className="p-2.5 bg-white border border-neutral-100 rounded-xl text-neutral-400 hover:text-neutral-600 transition-all"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-right">
              <span className="text-[10px] font-bold text-neutral-400 block uppercase tracking-wider">
                Watch Progress
              </span>
              <span className={`text-xs font-black ${playedPercent >= 90 ? "text-[#5F8B70]" : "text-[#1C4966]"}`}>
                {playedPercent}% {playedPercent >= 90 ? "✓ Completed" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
