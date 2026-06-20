import { useCoachingStore } from "../store/coaching.store";

export const progressService = {
  saveVideoProgress(videoId: string, progress: number, isWatched: boolean) {
    useCoachingStore.getState().updateVideoProgress(videoId, progress, isWatched);
  },

  saveChapterProgress(chapterId: string, progress: number) {
    useCoachingStore.getState().updateChapterProgress(chapterId, progress);
  },

  getVideoProgress(videoId: string) {
    const progress = useCoachingStore.getState().videoProgress[videoId];
    return progress || { videoId, progress: 0, isWatched: false, lastUpdated: "" };
  },

  getChapterProgress(chapterId: string) {
    const progress = useCoachingStore.getState().chapterProgress[chapterId];
    return progress?.progress || 0;
  },
};
