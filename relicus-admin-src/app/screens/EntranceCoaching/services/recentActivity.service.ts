import { useCoachingStore, RecentActivityItem } from "../store/coaching.store";

export const recentActivityService = {
  track(activity: Omit<RecentActivityItem, "timestamp">) {
    useCoachingStore.getState().addRecentActivity(activity);
  },

  getAll() {
    return useCoachingStore.getState().recentActivity;
  },

  getLastOpenedChapter(examType: string) {
    return useCoachingStore
      .getState()
      .recentActivity.find((act) => act.examType === examType && act.type === "chapter");
  },

  getLastWatchedVideo(examType: string) {
    return useCoachingStore
      .getState()
      .recentActivity.find((act) => act.examType === examType && act.type === "video");
  },
};
