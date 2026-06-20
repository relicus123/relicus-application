import { MockTestQuestion } from "../types/test.types";

export interface ScoreBreakdown {
  score: number;
  maxScore: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  accuracy: number;
}

export function calculateTestScore(questions: MockTestQuestion[], userAnswers: (number | null)[]): ScoreBreakdown {
  let score = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;
  
  questions.forEach((q, idx) => {
    const ans = userAnswers[idx];
    if (ans === null || ans === undefined) {
      unattemptedCount++;
    } else if (ans === q.correctAnswer) {
      correctCount++;
      score += 4;
    } else {
      incorrectCount++;
      score -= 1;
    }
  });

  const maxScore = questions.length * 4;
  const attemptedCount = correctCount + incorrectCount;
  const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
  
  return {
    score: Math.max(0, score), // Floor score at 0
    maxScore,
    correctCount,
    incorrectCount,
    unattemptedCount,
    accuracy,
  };
}
