import { useCoachingStore } from "../store/coaching.store";
import { TestAttempt } from "../types/test.types";

export const testService = {
  saveAttempt(attempt: TestAttempt) {
    useCoachingStore.getState().addTestAttempt(attempt);
  },

  getAttempts(examType: string) {
    return useCoachingStore.getState().testAttempts.filter((a) => a.examType === examType);
  },

  getTestAttemptsCount(testId: string): number {
    return useCoachingStore.getState().testAttempts.filter((a) => a.testId === testId).length;
  },

  getBestAttempt(testId: string): TestAttempt | null {
    const attempts = useCoachingStore.getState().testAttempts.filter((a) => a.testId === testId);
    if (attempts.length === 0) return null;
    return attempts.reduce((best, curr) => (curr.score > best.score ? curr : best), attempts[0]);
  },
};
