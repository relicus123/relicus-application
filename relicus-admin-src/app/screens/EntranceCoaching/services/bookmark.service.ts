import { useCoachingStore, BookmarkItem } from "../store/coaching.store";

export const bookmarkService = {
  add(bookmark: Omit<BookmarkItem, "bookmarkedAt">) {
    useCoachingStore.getState().addBookmark(bookmark);
  },

  remove(id: string) {
    useCoachingStore.getState().removeBookmark(id);
  },

  isBookmarked(id: string): boolean {
    return useCoachingStore.getState().bookmarks.some((b) => b.id === id);
  },

  getAll() {
    return useCoachingStore.getState().bookmarks;
  },
};
