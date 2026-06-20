import React, { useState, useEffect } from "react";
import { ExamType } from "./types/exam.types";
import { ExamSelection } from "./ExamSelection";
import { ExamInfoScreen } from "./ExamInfoScreen";
import { ExamDashboard } from "./ExamDashboard";
import { useCoachingStore } from "./store/coaching.store";

export function EntranceCoaching() {
  const [view, setView] = useState<"selection" | "info" | "dashboard">("selection");
  const [selectedExam, setSelectedExam] = useState<ExamType | null>(null);
  const [dashboardTabOverride, setDashboardTabOverride] = useState<string | null>(null);

  const { loadCoachingData, exams } = useCoachingStore();

  useEffect(() => {
    loadCoachingData();
  }, [loadCoachingData]);

  if (view === "selection" || selectedExam === null) {
    return (
      <ExamSelection
        onSelectExam={(exam) => {
          setSelectedExam(exam);
          setView("info");
          setDashboardTabOverride(null);
        }}
        onNavigateToNotifications={() => {
          // If a user clicks the bell icon in selection, select the first registered exam (or JEE) and go to notifications
          const defaultExam = exams[0]?.id || "JEE";
          setSelectedExam(defaultExam as ExamType);
          setDashboardTabOverride("notifications");
          setView("dashboard");
        }}
      />
    );
  }

  if (view === "info") {
    return (
      <ExamInfoScreen
        examType={selectedExam}
        onBack={() => {
          setSelectedExam(null);
          setView("selection");
        }}
        onStart={() => setView("dashboard")}
      />
    );
  }

  return (
    <ExamDashboard
      examType={selectedExam}
      onBack={() => setView("info")}
      initialTabOverride={dashboardTabOverride}
    />
  );
}
export default EntranceCoaching;
