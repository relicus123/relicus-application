export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatScore(score: number, maxScore: number): string {
  return `${score}/${maxScore}`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} mins`;
  const hours = (mins / 60).toFixed(1);
  return `${hours} hrs`;
}
