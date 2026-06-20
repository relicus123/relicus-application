import { ExamType } from "../types/exam.types";

export const EXAMS: { type: ExamType; name: string; description: string; icon: string }[] = [
  {
    type: "CUET",
    icon: "🏛️",
    name: "CUET (UG)",
    description: "Common University Entrance Test for Central Universities",
  },
  {
    type: "JEE",
    icon: "⚙️",
    name: "JEE Main & Advanced",
    description: "Joint Entrance Examination for engineering aspirants",
  },
  {
    type: "NEET",
    icon: "🩺",
    name: "NEET (UG)",
    description: "National Eligibility cum Entrance Test for medical aspirants",
  },
  {
    type: "UGC-NET",
    icon: "📚",
    name: "UGC-NET",
    description: "University Grants Commission National Eligibility Test",
  },
  {
    type: "GATE",
    icon: "🔬",
    name: "GATE",
    description: "Graduate Aptitude Test in Engineering",
  },
  {
    type: "EAMCET",
    icon: "📐",
    name: "EAMCET",
    description: "Engineering Agricultural and Medical Common Entrance Test",
  },
  {
    type: "ICET",
    icon: "💼",
    name: "ICET",
    description: "Integrated Common Entrance Test for MBA/MCA",
  },
];

