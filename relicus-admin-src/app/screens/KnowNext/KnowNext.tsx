import React, { useReducer, useCallback, useEffect } from "react";
import { KnowNextView } from "./types/knowNext.types";
import { useKnowNextStore } from "./store/knowNext.store";
import { supabase } from "../../services/supabaseClient";

// ── Screens ────────────────────────────────────────────────────────────────────
import { LandingHub } from "./screens/LandingHub";
import { CareerExplorer } from "./screens/CareerExplorer/CareerExplorer";
import { CareerDetails } from "./screens/CareerExplorer/CareerDetails";
import { CareerRoadmapView } from "./screens/CareerExplorer/CareerRoadmapView";
import { CareerComparison } from "./screens/CareerExplorer/CareerComparison";
import { CareerRoadmaps } from "./screens/CareerRoadmaps/CareerRoadmaps";
import { LearningPath } from "./screens/CareerRoadmaps/LearningPath";
import { CollegeExplorer } from "./screens/Colleges/CollegeExplorer";
import { CollegeDetails } from "./screens/Colleges/CollegeDetails";
import { CollegeComparison } from "./screens/Colleges/CollegeComparison";
import { ScholarshipExplorer } from "./screens/Scholarships/ScholarshipExplorer";
import { ScholarshipDetails } from "./screens/Scholarships/ScholarshipDetails";
import { IndustryInsights } from "./screens/IndustryInsights/IndustryInsights";
import { MarketTrends } from "./screens/IndustryInsights/MarketTrends";
import { CareerPlan } from "./screens/CareerPlan/CareerPlan";
import { SavedItems } from "./screens/CareerPlan/SavedItems";

// ── Navigation State ──────────────────────────────────────────────────────────
interface NavState {
  view: KnowNextView;
  context: Record<string, string>;
  stack: Array<{ view: KnowNextView; context: Record<string, string> }>;
}

type NavAction =
  | { type: "PUSH"; view: KnowNextView; context?: Record<string, string> }
  | { type: "POP" };

function navReducer(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case "PUSH":
      return {
        view: action.view,
        context: action.context ?? {},
        stack: [...state.stack, { view: state.view, context: state.context }],
      };
    case "POP": {
      if (state.stack.length === 0) return state;
      const prev = state.stack[state.stack.length - 1];
      return {
        view: prev.view,
        context: prev.context,
        stack: state.stack.slice(0, -1),
      };
    }
    default:
      return state;
  }
}

// ── KnowNext Entry Point ──────────────────────────────────────────────────────
interface KnowNextProps {
  onBack: () => void;
}

export const KnowNext: React.FC<KnowNextProps> = ({ onBack }) => {
  const store = useKnowNextStore();
  
  useEffect(() => {
    async function loadDynamicGuidance() {
      try {
        // Load from Supabase
        const [careersRes, collegesRes, scholarshipsRes] = await Promise.all([
          supabase.from("knownext_careers").select("*"),
          supabase.from("knownext_colleges").select("*"),
          supabase.from("knownext_scholarships").select("*")
        ]);
        
        if (!careersRes.error && careersRes.data) store.setCareers(careersRes.data);
        if (!collegesRes.error && collegesRes.data) store.setColleges(collegesRes.data);
        if (!scholarshipsRes.error && scholarshipsRes.data) store.setScholarships(scholarshipsRes.data);
      } catch (err) {
        console.error("Failed to load KnowNext data dynamically:", err);
      }
    }
    loadDynamicGuidance();
  }, []);

  const [navState, dispatch] = useReducer(navReducer, {
    view: "landing",
    context: {},
    stack: [],
  });

  const navigate = useCallback((view: KnowNextView, context?: Record<string, string>) => {
    dispatch({ type: "PUSH", view, context });
  }, []);

  const goBack = useCallback(() => {
    if (navState.stack.length === 0) {
      onBack();
    } else {
      dispatch({ type: "POP" });
    }
  }, [navState.stack.length, onBack]);

  const { view, context } = navState;

  // ── View Renderer ─────────────────────────────────────────────────────────
  switch (view) {
    case "landing":
      return <LandingHub onNavigate={navigate} onBack={onBack} />;

    case "careerExplorer":
      return <CareerExplorer onNavigate={navigate} onBack={goBack} />;

    case "careerDetails":
      return (
        <CareerDetails
          careerId={context.careerId ?? ""}
          onNavigate={navigate}
          onBack={goBack}
        />
      );

    case "careerRoadmapView":
      return (
        <CareerRoadmapView
          careerId={context.careerId ?? ""}
          onNavigate={navigate}
          onBack={goBack}
        />
      );

    case "careerComparison":
      return <CareerComparison onNavigate={navigate} onBack={goBack} />;

    case "careerRoadmaps":
      return <CareerRoadmaps onNavigate={navigate} onBack={goBack} />;

    case "learningPath":
      return (
        <LearningPath
          roadmapId={context.roadmapId}
          onNavigate={navigate}
          onBack={goBack}
        />
      );

    case "colleges":
      return <CollegeExplorer onNavigate={navigate} onBack={goBack} />;

    case "collegeDetails":
      return (
        <CollegeDetails
          collegeId={context.collegeId ?? ""}
          onNavigate={navigate}
          onBack={goBack}
        />
      );

    case "collegeComparison":
      return <CollegeComparison onNavigate={navigate} onBack={goBack} />;

    case "scholarships":
      return <ScholarshipExplorer onNavigate={navigate} onBack={goBack} />;

    case "scholarshipDetails":
      return (
        <ScholarshipDetails
          scholarshipId={context.scholarshipId ?? ""}
          onNavigate={navigate}
          onBack={goBack}
        />
      );

    case "industryInsights":
      return <IndustryInsights onNavigate={navigate} onBack={goBack} />;

    case "marketTrends":
      return (
        <MarketTrends
          industryId={context.industryId ?? ""}
          onNavigate={navigate}
          onBack={goBack}
        />
      );

    case "careerPlan":
      return <CareerPlan onNavigate={navigate} onBack={goBack} />;

    case "savedItems":
      return <SavedItems onNavigate={navigate} onBack={goBack} />;

    default:
      return <LandingHub onNavigate={navigate} onBack={onBack} />;
  }
};

export default KnowNext;
