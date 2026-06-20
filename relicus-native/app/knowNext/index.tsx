import React, { useReducer, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { KnowNextView, NavContext } from "./types";
import { useKnowNextStore } from "../../store/knowNext.store";

// ── Screen Imports ──────────────────────────────────
import { LandingHub } from "./screens/PlanScreens";
import { CareerPlan, SavedItems, IndustryInsights, MarketTrends } from "./screens/PlanScreens";
import { CareerExplorer, CareerDetails, CareerComparison, CareerRoadmaps, LearningPath } from "./screens/ExplorerScreens";
import { CollegeExplorer, CollegeDetails, CollegeComparison } from "./screens/CollegeScreens";
import { ScholarshipExplorer, ScholarshipDetails, DeadlineTracker } from "./screens/ScholarshipScreens";

// ── State Definition ────────────────────────────────
interface NavState {
  currentView: KnowNextView;
  context: NavContext;
  history: Array<{ view: KnowNextView; context: NavContext }>;
}

type NavAction =
  | { type: "PUSH"; view: KnowNextView; context?: NavContext }
  | { type: "POP" }
  | { type: "RESET"; view: KnowNextView; context?: NavContext };

const initialState: NavState = {
  currentView: "landing",
  context: {},
  history: [],
};

function navReducer(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case "PUSH":
      return {
        currentView: action.view,
        context: action.context ?? {},
        history: [...state.history, { view: state.currentView, context: state.context }],
      };
    case "POP":
      if (state.history.length === 0) return state;
      const prev = state.history[state.history.length - 1];
      return {
        currentView: prev.view,
        context: prev.context,
        history: state.history.slice(0, -1),
      };
    case "RESET":
      return {
        currentView: action.view,
        context: action.context ?? {},
        history: [],
      };
    default:
      return state;
  }
}

export default function KnowNextMain() {
  const router = useRouter();
  const [navState, dispatch] = useReducer(navReducer, initialState);

  // Sync stage filter with store if needed
  const activeStage = useKnowNextStore((s) => s.activeStage);

  const handleNavigate = useCallback((view: KnowNextView, ctx?: NavContext) => {
    dispatch({ type: "PUSH", view, context: ctx });
  }, []);

  const handleBack = useCallback(() => {
    if (navState.history.length === 0) {
      // Exit module to Home tab
      router.replace("/(tabs)/home");
    } else {
      dispatch({ type: "POP" });
    }
  }, [navState.history, router]);

  const handleReset = useCallback((view: KnowNextView, ctx?: NavContext) => {
    dispatch({ type: "RESET", view, context: ctx });
  }, []);

  const renderView = () => {
    const props = {
      context: navState.context,
      onNavigate: handleNavigate,
      onBack: handleBack,
      onReset: handleReset,
    };

    switch (navState.currentView) {
      case "landing":
        return <LandingHub {...props} />;
      case "careerExplorer":
        return <CareerExplorer {...props} />;
      case "careerDetails":
        return <CareerDetails {...props} careerId={navState.context.selectedCareerId} />;
      case "careerComparison":
        return <CareerComparison {...props} compareIds={navState.context.compareCareerIds || []} />;
      case "careerRoadmaps":
        return <CareerRoadmaps {...props} />;
      case "learningPath":
        return <LearningPath {...props} roadmapId={navState.context.selectedRoadmapId} />;
      case "colleges":
        return <CollegeExplorer {...props} />;
      case "collegeDetails":
        return <CollegeDetails {...props} collegeId={navState.context.selectedCollegeId} />;
      case "collegeComparison":
        return <CollegeComparison {...props} compareIds={navState.context.compareCollegeIds || []} />;
      case "scholarships":
        return <ScholarshipExplorer {...props} />;
      case "scholarshipDetails":
        return <ScholarshipDetails {...props} scholarshipId={navState.context.selectedScholarshipId} />;
      case "industryInsights":
        return <IndustryInsights {...props} />;
      case "marketTrends":
        return <MarketTrends {...props} industryId={navState.context.selectedIndustryId} />;
      case "careerPlan":
        return <CareerPlan {...props} />;
      case "savedItems":
        return <SavedItems {...props} />;
      case "deadlineTracker":
        return <DeadlineTracker {...props} />;
      default:
        return <LandingHub {...props} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderView()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFF0",
  },
});
