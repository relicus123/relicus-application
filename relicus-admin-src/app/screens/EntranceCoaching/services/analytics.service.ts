import { useCoachingStore } from "../store/coaching.store";
import { ExamType } from "../types/exam.types";
import { Chapter } from "../types/chapter.types";
import { TestAttempt } from "../types/test.types";
import { calculateAverageAccuracy } from "../utils/analytics";
import { calculateExamReadiness, calculatePredictedRank, calculatePercentile } from "../utils/rankCalculator";
import { calculateOverallProgress } from "../utils/progress";

export const analyticsService = {
  getKPIs(examType: ExamType, chapters: Chapter[]) {
    const store = useCoachingStore.getState();
    const attempts = store.testAttempts.filter((a) => a.examType === examType);
    
    // 1. Calculate average accuracy
    const avgAccuracy = calculateAverageAccuracy(attempts) || 75; // default starting point

    // 2. Get overall course progress
    const subjectIds = Array.from(new Set(chapters.map((ch) => ch.subjectId)));
    
    // Map videoProgress record to simplified shape for calculateOverallProgress
    const videoProgressMap: Record<string, { progress: number; isWatched: boolean }> = {};
    Object.keys(store.videoProgress).forEach(key => {
      videoProgressMap[key] = {
        progress: store.videoProgress[key].progress,
        isWatched: store.videoProgress[key].isWatched
      };
    });

    const overallProgress = calculateOverallProgress(subjectIds, chapters, videoProgressMap);

    // 3. Compute readiness
    const readiness = calculateExamReadiness(avgAccuracy, overallProgress);

    // 4. Predicted Rank
    const bestScoreRatio = attempts.length > 0 
      ? Math.max(...attempts.map(a => a.score / a.maxScore)) 
      : 0.72; // default
    const percentile = calculatePercentile(bestScoreRatio * 100, 100);
    const predictedRank = calculatePredictedRank(percentile);

    // 5. Study hours estimation
    const totalVideosWatched = Object.values(store.videoProgress).filter(v => v.isWatched).length;
    const learningHours = parseFloat((totalVideosWatched * 0.4 + attempts.length * 2.5 + 4).toFixed(1));

    // Strong / Weak Topics — exam-specific
    const TOPIC_MAP: Record<string, { strong: string[]; weak: string[] }> = {
      JEE: {
        strong: ["Calculus", "Mechanics", "Organic Chemistry"],
        weak: ["Integration", "Optics", "Electrochemistry"],
      },
      NEET: {
        strong: ["Cell Biology", "Plant Physiology", "Genetics"],
        weak: ["Ecology", "Chemical Bonding", "Thermodynamics"],
      },
      CUET: {
        strong: ["Logical Reasoning", "Reading Comprehension"],
        weak: ["Data Interpretation", "Quantitative Aptitude"],
      },
      "UGC-NET": {
        strong: ["Teaching Aptitude", "Research Methods"],
        weak: ["Data Interpretation", "ICT & Communication"],
      },
      GATE: {
        strong: ["Data Structures", "Algorithms", "OS Concepts"],
        weak: ["Computer Networks", "Theory of Computation", "DBMS"],
      },
      EAMCET: {
        strong: ["Coordinate Geometry", "Mechanics"],
        weak: ["Integration", "Chemical Equilibrium"],
      },
      ICET: {
        strong: ["Reasoning Ability", "Arithmetic Operations"],
        weak: ["Data Sufficiency", "Business Communication"],
      },
    };
    const topicSet = TOPIC_MAP[examType] ?? TOPIC_MAP["JEE"];
    const strongTopics = topicSet.strong.slice(0, Math.max(1, attempts.length + 1));
    const weakTopics = topicSet.weak.slice(0, Math.max(1, 3 - attempts.length));

    return {
      examReadinessScore: readiness,
      predictedRank,
      learningStreak: store.learningStreak,
      weeklyConsistencyScore: Math.round((store.learningStreak > 0 ? 0.85 : 0) * 100),
      learningHours,
      strongTopics,
      weakTopics,
    };
  },

  getWeeklyTrend(examType: ExamType) {
    const store = useCoachingStore.getState();
    const attempts = store.testAttempts.filter((a) => a.examType === examType);
    
    // Renders data points for Recharts line chart
    return [
      { week: "Week 1", hours: 4.5, accuracy: 65, testScore: 55 },
      { week: "Week 2", hours: 6.2, accuracy: 70, testScore: 68 },
      { week: "Week 3", hours: 8.5, accuracy: 72, testScore: 70 },
      { week: "Week 4", hours: 10.0, accuracy: attempts.length > 0 ? attempts[0].accuracy : 75, testScore: attempts.length > 0 ? Math.round((attempts[0].score / attempts[0].maxScore) * 100) : 72 },
    ];
  },

  getSubjectPerformance(examType: ExamType, chapters: Chapter[]) {
    const store = useCoachingStore.getState();
    
    // Group chapters by subject
    const subjectsMap: Record<string, { total: number; completed: number }> = {};
    chapters.forEach((ch) => {
      if (!subjectsMap[ch.subjectId]) {
        subjectsMap[ch.subjectId] = { total: 0, completed: 0 };
      }
      subjectsMap[ch.subjectId].total++;
      
      const totalVideos = ch.videos.length;
      const watchedVideos = ch.videos.filter(v => store.videoProgress[v.id]?.isWatched).length;
      if (totalVideos > 0 && watchedVideos === totalVideos) {
        subjectsMap[ch.subjectId].completed++;
      }
    });

    return Object.keys(subjectsMap).map((subId) => {
      let name = "General Test";
      if (subId === "math") {
        if (examType === "GATE") name = "Engineering Mathematics";
        else if (examType === "ICET") name = "Mathematical Ability";
        else name = "Mathematics";
      } else if (subId === "phys") name = "Physics";
      else if (subId === "chem") name = "Chemistry";
      else if (subId === "bio") name = "Biology";
      else if (subId === "paper1") name = "General Paper 1";
      else if (subId === "cs") {
        if (examType === "GATE") name = "Computer Science & IT";
        else name = "Computer Science";
      } else if (subId === "ga") name = "General Aptitude";
      else if (subId === "analytical") name = "Analytical Ability";
      else if (subId === "comm") name = "Communication Ability";
      else if (subId === "eng") name = "English Language";

      const accuracy = subId === "math" ? 82 : subId === "phys" ? 68 : subId === "chem" ? 74 : 70;
      return {
        subject: name,
        accuracy,
        completedChapters: subjectsMap[subId].completed,
        totalChapters: subjectsMap[subId].total,
      };
    });
  },

  getTimeDistribution(examType: ExamType) {
    return [
      { name: "Video Lectures", value: 45 },
      { name: "Mock Tests", value: 30 },
      { name: "Doubt Solving", value: 15 },
      { name: "Revision Notes", value: 10 },
    ];
  },
};
