import React, { useReducer, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import { TuitionView, TuitionNavContext } from "./types";

// ── Screen Imports ──────────────────────────────────
import { HomeDashboard } from "./screens/HomeScreens";
import { LearningPath } from "./screens/LearningPathScreens";
import { TeacherHub, TeacherChat } from "./screens/TeacherScreens";
import { AssessmentCentre } from "./screens/AssessmentScreens";
import { MaterialLibrary } from "./screens/MaterialScreens";
import { ProfileDashboard, ParentDashboard } from "./screens/ProfileScreens";
import { AIAssistant } from "./screens/ExtraScreens";

// ── State Definition ────────────────────────────────
interface NavState {
  currentView: TuitionView;
  context: TuitionNavContext;
  history: Array<{ view: TuitionView; context: TuitionNavContext }>;
}

type NavAction =
  | { type: "PUSH"; view: TuitionView; context?: TuitionNavContext }
  | { type: "POP" }
  | { type: "RESET"; view: TuitionView; context?: TuitionNavContext };

const initialState: NavState = {
  currentView: "home",
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

export default function TuitionMain() {
  const router = useRouter();
  const [navState, dispatch] = useReducer(navReducer, initialState);

  const handleNavigate = useCallback((view: TuitionView, ctx?: TuitionNavContext) => {
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

  const handleReset = useCallback((view: TuitionView, ctx?: TuitionNavContext) => {
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
      case "home":
        return <HomeDashboard {...props} />;
      case "learningPath":
        return <LearningPath {...props} />;
      case "myTeachers":
        return <TeacherHub {...props} />;
      case "teacherChat":
        return <TeacherChat {...props} />;
      case "testCentre":
        return <AssessmentCentre {...props} />;
      case "studyMaterials":
        return <MaterialLibrary {...props} />;
      case "profile":
        return <ProfileDashboard {...props} />;
      case "parentDashboard":
        return <ParentDashboard {...props} />;
      case "aiAssistant":
        return <AIAssistant {...props} />;
      // other views can be added here
      default:
        return <HomeDashboard {...props} />;
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
