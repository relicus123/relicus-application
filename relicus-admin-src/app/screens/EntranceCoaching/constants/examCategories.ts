import { ExamCategory } from "../types/exam.types";

/**
 * Defines the three collapsible exam category groups.
 * To add a new exam, add its ExamType to the appropriate category's `exams` array.
 * No dashboard logic changes required.
 */
export const EXAM_CATEGORIES: ExamCategory[] = [
  {
    id: "undergraduate",
    title: "Undergraduate Entrance Exams",
    description: "Gateway to top UG admissions in engineering, medical & central universities",
    icon: "🎓",
    exams: ["CUET", "JEE", "NEET"],
  },
  {
    id: "postgraduate",
    title: "Postgraduate & National Exams",
    description: "National-level exams for PG admissions and teaching eligibility",
    icon: "🏛️",
    exams: ["GATE", "UGC-NET"],
  },
  {
    id: "state",
    title: "State-Level Entrance Exams",
    description: "State board exams for engineering, management & MBA/MCA aspirants",
    icon: "📍",
    exams: ["EAMCET", "ICET"],
  },
];
