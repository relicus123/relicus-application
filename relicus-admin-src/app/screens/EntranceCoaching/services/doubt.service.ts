import { useCoachingStore } from "../store/coaching.store";
import { Doubt, DoubtResponse } from "../types/doubt.types";

export const doubtService = {
  submitDoubt(doubt: Doubt) {
    useCoachingStore.getState().addDoubt(doubt);
  },

  submitResponse(doubtId: string, response: DoubtResponse) {
    useCoachingStore.getState().addDoubtResponse(doubtId, response);
  },

  getDoubts(examType: string) {
    return useCoachingStore.getState().doubts.filter((d) => d.examType === examType);
  },
};
