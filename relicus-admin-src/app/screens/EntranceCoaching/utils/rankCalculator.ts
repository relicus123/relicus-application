export function calculatePercentile(score: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  const ratio = score / maxScore;
  
  // Custom non-linear percentile curves
  if (ratio >= 0.95) return parseFloat((99.9 - (1 - ratio) * 2).toFixed(2));
  if (ratio >= 0.8) return parseFloat((98.5 - (0.95 - ratio) * 10).toFixed(2));
  if (ratio >= 0.6) return parseFloat((90 - (0.8 - ratio) * 45).toFixed(2));
  if (ratio >= 0.4) return parseFloat((70 - (0.6 - ratio) * 60).toFixed(2));
  return parseFloat(Math.max(5, ratio * 100).toFixed(2));
}

export function calculatePredictedRank(percentile: number, totalCandidates = 1200000): number {
  const betterPercent = 100 - percentile;
  // Calculate rank: (betterPercent / 100) * totalCandidates
  return Math.max(1, Math.round((betterPercent / 100) * totalCandidates));
}

export function calculateExamReadiness(accuracy: number, progress: number): number {
  // Weighted average: 60% accuracy, 40% course completion progress
  return Math.round((accuracy * 0.6) + (progress * 0.4));
}
