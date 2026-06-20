import { TestAttempt } from "../types/test.types";

export function calculateWeeklyConsistency(studyHoursPerDay: number[]): number {
  if (studyHoursPerDay.length === 0) return 0;
  
  // A simple consistency formula: count days studied vs total days
  const activeDays = studyHoursPerDay.filter(h => h > 0).length;
  const ratio = activeDays / studyHoursPerDay.length;
  
  // Factor in standard deviation or variations, let's keep it simple: ratio * 100
  return Math.round(ratio * 100);
}

export function calculateAverageAccuracy(attempts: TestAttempt[]): number {
  if (attempts.length === 0) return 0;
  const total = attempts.reduce((acc, curr) => acc + curr.accuracy, 0);
  return Math.round(total / attempts.length);
}
