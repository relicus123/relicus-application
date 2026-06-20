import { Chapter } from "../types/chapter.types";

export function calculateChapterProgress(chapter: Chapter, videoProgress: Record<string, { progress: number; isWatched: boolean }>): number {
  if (chapter.videos.length === 0) return 0;
  
  const totalWatched = chapter.videos.reduce((acc, video) => {
    const state = videoProgress[video.id];
    return acc + (state?.isWatched ? 1 : 0);
  }, 0);
  
  return Math.round((totalWatched / chapter.videos.length) * 100);
}

export function calculateSubjectProgress(subjectId: string, chapters: Chapter[], videoProgress: Record<string, { progress: number; isWatched: boolean }>): number {
  const subjectChapters = chapters.filter((ch) => ch.subjectId === subjectId);
  if (subjectChapters.length === 0) return 0;
  
  const totalProgress = subjectChapters.reduce((acc, ch) => {
    return acc + calculateChapterProgress(ch, videoProgress);
  }, 0);
  
  return Math.round(totalProgress / subjectChapters.length);
}

export function calculateOverallProgress(subjects: string[], chapters: Chapter[], videoProgress: Record<string, { progress: number; isWatched: boolean }>): number {
  if (subjects.length === 0) return 0;
  
  const totalProgress = subjects.reduce((acc, subId) => {
    return acc + calculateSubjectProgress(subId, chapters, videoProgress);
  }, 0);
  
  return Math.round(totalProgress / subjects.length);
}
