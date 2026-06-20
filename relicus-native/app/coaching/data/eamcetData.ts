import { Chapter } from "../types/chapter.types";
import { MockTest } from "../types/test.types";
import { Subject } from "../types/exam.types";

export const EAMCET_SUBJECTS: Subject[] = [
  { id: "math", name: "Mathematics", icon: "📐", color: "from-[#10B981] to-[#059669]", chaptersCount: 2, mockTestsCount: 1 },
  { id: "phys", name: "Physics", icon: "⚡", color: "from-[#3B82F6] to-[#2563EB]", chaptersCount: 2, mockTestsCount: 1 },
  { id: "chem", name: "Chemistry", icon: "🧪", color: "from-[#F59E0B] to-[#D97706]", chaptersCount: 1, mockTestsCount: 1 },
];

export const EAMCET_CHAPTERS: Chapter[] = [
  {
    id: "eamcet-math-ch1",
    name: "Coordinate Geometry - Straight Lines",
    subjectId: "math",
    progress: 50,
    videos: [
      { id: "v-eamcet-m-1", title: "Slope of a Line & Angles", duration: "16:45", url: "https://www.w3schools.com/html/mov_bbb.mp4", progress: 100, isWatched: true },
      { id: "v-eamcet-m-2", title: "Distance Form & Normal Form", duration: "19:20", url: "https://www.w3schools.com/html/mov_bbb.mp4", progress: 0, isWatched: false },
    ],
    notes: [
      { id: "n-eamcet-m-1", title: "Coordinate Geometry formulas.pdf", size: "1.1 MB", pdfUrl: "https://arxiv.org/pdf/quant-ph/0410100.pdf", isBookmarked: false },
    ],
    assignments: [],
    practiceQuestions: [
      {
        id: 301,
        question: "Find the slope of a line passing through (2, 3) and (4, 7).",
        options: ["1", "2", "3", "4"],
        correctAnswer: 1,
        explanation: "Slope m = (y2 - y1) / (x2 - x1) = (7 - 3) / (4 - 2) = 4 / 2 = 2.",
      },
    ],
  },
  {
    id: "eamcet-math-ch2",
    name: "Algebra - Quadratic Expressions",
    subjectId: "math",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },
  {
    id: "eamcet-phys-ch1",
    name: "Mechanics - Kinematics in 2D",
    subjectId: "phys",
    progress: 0,
    videos: [
      { id: "v-eamcet-p-1", title: "Projectile Motion Equations", duration: "24:10", url: "https://www.w3schools.com/html/mov_bbb.mp4", progress: 0, isWatched: false },
    ],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },
  {
    id: "eamcet-phys-ch2",
    name: "Electricity - Kirchhoff's Laws",
    subjectId: "phys",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },
  {
    id: "eamcet-chem-ch1",
    name: "Physical Chemistry - Atomic Structure",
    subjectId: "chem",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },
];

export const EAMCET_MOCK_TESTS: MockTest[] = [
  {
    id: "eamcet-mock-1",
    name: "EAMCET MPC Practice Mock Test 1",
    examType: "EAMCET",
    type: "full",
    duration: 150 * 60,
    questionsCount: 2,
    questions: [
      {
        id: 1,
        question: "If the roots of x² - 5x + 6 = 0 are α and β, find α² + β².",
        options: ["10", "12", "13", "15"],
        correctAnswer: 2,
        explanation: "Sum of roots α+β = 5, product αβ = 6. α² + β² = (α+β)² - 2αβ = 25 - 12 = 13.",
        subject: "Mathematics",
        topic: "Algebra",
      },
      {
        id: 2,
        question: "Kirchhoff's First Law (Junction rule) is based on the conservation of...",
        options: ["Energy", "Charge", "Momentum", "Mass"],
        correctAnswer: 1,
        explanation: "Kirchhoff's Junction Rule states that the total current entering a junction equals the total current leaving it, which is based on the conservation of electric charge.",
        subject: "Physics",
        topic: "Electricity",
      },
    ],
  },
];
