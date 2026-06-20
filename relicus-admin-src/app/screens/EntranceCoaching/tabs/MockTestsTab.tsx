import React, { useState, useMemo, useEffect } from "react";
import { ClipboardList, Award, RotateCcw } from "lucide-react";
import { ExamType } from "../types/exam.types";
import { MockTest, TestAttempt, TopicAnalysis, SectionAnalysis } from "../types/test.types";
import { useCoachingStore } from "../store/coaching.store";
import { testService } from "../services/test.service";
import { recentActivityService } from "../services/recentActivity.service";
import { calculateTestScore } from "../utils/scoreCalculator";
import { calculatePercentile, calculatePredictedRank } from "../utils/rankCalculator";
import { getExamDataset } from "../data/examRegistry";
import { TestCard } from "../components/TestCard";
import { EmptyState } from "../components/EmptyState";

// Runner flows components
import { TestInstructions } from "../mock-tests/TestInstructions";
import { TestRunner } from "../mock-tests/TestRunner";
import { ResultsScreen } from "../mock-tests/ResultsScreen";
import { ReviewAnswers } from "../mock-tests/ReviewAnswers";

interface MockTestsTabProps {
  examType: ExamType;
  extraData?: { testId?: string };
}

type TestWorkflowState = "list" | "instructions" | "runner" | "results" | "review";

export const MockTestsTab: React.FC<MockTestsTabProps> = React.memo(({
  examType,
  extraData,
}) => {
  const store = useCoachingStore();
  const [workflowState, setWorkflowState] = useState<TestWorkflowState>("list");
  const [selectedTest, setSelectedTest] = useState<MockTest | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<TestAttempt | null>(null);
  const [filterType, setFilterType] = useState<"all" | "full" | "subject">("all");

  // ── Central registry lookup — no switch needed ────────────────────────────
  const exams = useCoachingStore((state) => state.exams);
  const mockTests = useMemo((): MockTest[] => {
    return getExamDataset(examType).mockTests;
  }, [examType, exams]);

  // Handle incoming search selections (opening specific test runner)
  useEffect(() => {
    if (extraData?.testId) {
      const test = mockTests.find((t) => t.id === extraData.testId);
      if (test) {
        handleStartTest(test);
      }
    }
  }, [extraData, mockTests]);

  const filteredTests = useMemo(() => {
    if (filterType === "all") return mockTests;
    return mockTests.filter((t) => t.type === filterType);
  }, [mockTests, filterType]);

  const handleStartTest = (test: MockTest) => {
    setSelectedTest(test);
    setWorkflowState("instructions");
  };

  const handleBeginRunner = () => {
    setWorkflowState("runner");
    // Track activity
    if (selectedTest) {
      recentActivityService.track({
        id: selectedTest.id,
        type: "test",
        title: selectedTest.name,
        subtitle: "Attempting mock test",
        path: "/app/coaching",
        examType,
      });
    }
  };

  const handleTestSubmit = (userAnswers: (number | null)[]) => {
    if (!selectedTest) return;

    // 1. Calculate Score breakdown
    const breakdown = calculateTestScore(selectedTest.questions, userAnswers);

    // 2. Percentile & predicted rank
    const percentile = calculatePercentile(breakdown.score, breakdown.maxScore);
    const rank = calculatePredictedRank(percentile);

    // 3. Topic & Section analysis
    const topicMap: Record<string, { total: number; correct: number; incorrect: number }> = {};
    const sectionMap: Record<string, { total: number; correct: number; incorrect: number }> = {};

    selectedTest.questions.forEach((q, idx) => {
      const ans = userAnswers[idx];
      const isCorrect = ans === q.correctAnswer;
      const topicName = q.topic || "General Concepts";
      const sectionName = q.subject || "General Test";

      // Topic
      if (!topicMap[topicName]) topicMap[topicName] = { total: 0, correct: 0, incorrect: 0 };
      topicMap[topicName].total++;
      if (ans !== null && ans !== undefined) {
        if (isCorrect) topicMap[topicName].correct++;
        else topicMap[topicName].incorrect++;
      }

      // Section
      if (!sectionMap[sectionName]) sectionMap[sectionName] = { total: 0, correct: 0, incorrect: 0 };
      sectionMap[sectionName].total++;
      if (ans !== null && ans !== undefined) {
        if (isCorrect) sectionMap[sectionName].correct++;
        else sectionMap[sectionName].incorrect++;
      }
    });

    const topicAnalysis: TopicAnalysis[] = Object.keys(topicMap).map((topic) => ({
      topic,
      total: topicMap[topic].total,
      correct: topicMap[topic].correct,
      incorrect: topicMap[topic].incorrect,
    }));

    const sectionAnalysis: SectionAnalysis[] = Object.keys(sectionMap).map((sect) => ({
      section: sect,
      total: sectionMap[sect].total,
      correct: sectionMap[sect].correct,
      incorrect: sectionMap[sect].incorrect,
      timeSpent: Math.round(selectedTest.duration / selectedTest.questions.length), // simple average
    }));

    // 4. Create attempt object
    const attempt: TestAttempt = {
      id: `attempt-${Math.random().toString(36).substr(2, 9)}`,
      testId: selectedTest.id,
      testName: selectedTest.name,
      examType,
      date: new Date().toISOString(),
      score: breakdown.score,
      maxScore: breakdown.maxScore,
      accuracy: breakdown.accuracy,
      rank,
      percentile,
      timeTaken: Math.round(selectedTest.duration * 0.45), // simulated time spent
      correctCount: breakdown.correctCount,
      incorrectCount: breakdown.incorrectCount,
      unattemptedCount: breakdown.unattemptedCount,
      answers: userAnswers,
      topicAnalysis,
      sectionAnalysis,
    };

    // Save attempt using testService
    testService.saveAttempt(attempt);

    // Save notification
    store.addNotification({
      category: "test" as const,
      title: "Practice Test Evaluated",
      message: `Your attempt on ${selectedTest.name} is scored: ${breakdown.score}/${breakdown.maxScore} (${breakdown.accuracy}% accuracy).`,
      examType,
    });

    // Update streak
    store.incrementStreak();

    setActiveAttempt(attempt);
    setWorkflowState("results");
  };

  const handleViewAttemptResult = (testId: string) => {
    const best = testService.getBestAttempt(testId);
    if (best) {
      const test = mockTests.find((t) => t.id === testId);
      if (test) {
        setSelectedTest(test);
        setActiveAttempt(best);
        setWorkflowState("results");
      }
    }
  };

  const handleResetWorkflow = () => {
    setSelectedTest(null);
    setActiveAttempt(null);
    setWorkflowState("list");
  };

  const handleTriggerReattempt = () => {
    if (selectedTest) {
      setWorkflowState("instructions");
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto">
      {workflowState === "list" && (
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-base font-extrabold text-foreground px-1">Mock Assessments</h3>
          </div>

          {/* Filters */}
          <div className="flex bg-neutral-100 p-1 rounded-2xl gap-1 shrink-0">
            {(["all", "full", "subject"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  filterType === type 
                    ? "bg-white text-foreground shadow-xs" 
                    : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Test cards list */}
          {filteredTests.length > 0 ? (
            <div className="space-y-4 pt-1">
              {filteredTests.map((test) => {
                const bestAttempt = testService.getBestAttempt(test.id);
                return (
                  <TestCard
                    key={test.id}
                    name={test.name}
                    duration={test.duration}
                    questionsCount={test.questionsCount}
                    attempted={bestAttempt !== null}
                    score={bestAttempt?.score}
                    maxScore={bestAttempt?.maxScore}
                    accuracy={bestAttempt?.accuracy}
                    onStart={() => handleStartTest(test)}
                    onReattempt={() => handleStartTest(test)}
                    onViewResults={() => handleViewAttemptResult(test.id)}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState title="No Tests Found" description="Try selecting a different filter type." icon={ClipboardList} />
          )}
        </div>
      )}

      {workflowState === "instructions" && selectedTest && (
        <TestInstructions
          test={selectedTest}
          onBack={handleResetWorkflow}
          onStart={handleBeginRunner}
        />
      )}

      {workflowState === "runner" && selectedTest && (
        <TestRunner
          test={selectedTest}
          onSubmit={handleTestSubmit}
        />
      )}

      {workflowState === "results" && activeAttempt && (
        <ResultsScreen
          attempt={activeAttempt}
          onReview={() => setWorkflowState("review")}
          onClose={handleResetWorkflow}
          onReattempt={handleTriggerReattempt}
        />
      )}

      {workflowState === "review" && selectedTest && activeAttempt && (
        <ReviewAnswers
          test={selectedTest}
          attempt={activeAttempt}
          onBack={() => setWorkflowState("results")}
        />
      )}
    </div>
  );
});

MockTestsTab.displayName = "MockTestsTab";
