import { Chapter } from "../types/chapter.types";
import { MockTest } from "../types/test.types";
import { Subject } from "../types/exam.types";

export const ICET_SUBJECTS: Subject[] = [
  { id: "analytical", name: "Analytical Ability", icon: "📊", color: "from-[#F43F5E] to-[#BE123C]", chaptersCount: 2, mockTestsCount: 1 },
  { id: "math", name: "Mathematical Ability", icon: "📐", color: "from-[#3B82F6] to-[#1D4ED8]", chaptersCount: 2, mockTestsCount: 1 },
  { id: "comm", name: "Communication Ability", icon: "💬", color: "from-[#10B981] to-[#047857]", chaptersCount: 1, mockTestsCount: 1 },
];

export const ICET_CHAPTERS: Chapter[] = [
  {
    id: "icet-anal-ch1",
    name: "Data Sufficiency - Numerical Problems",
    subjectId: "analytical",
    progress: 50,
    videos: [
      { id: "v-icet-a-1", title: "Data Sufficiency Concepts & Rules", duration: "15:20", url: "https://www.w3schools.com/html/mov_bbb.mp4", progress: 100, isWatched: true },
      { id: "v-icet-a-2", title: "Standard Logic Grid Solving", duration: "18:10", url: "https://www.w3schools.com/html/mov_bbb.mp4", progress: 0, isWatched: false },
    ],
    notes: [
      { id: "n-icet-a-1", title: "Analytical Reasoning notes.pdf", size: "980 KB", pdfUrl: "https://arxiv.org/pdf/quant-ph/0410100.pdf", isBookmarked: false },
    ],
    assignments: [],
    practiceQuestions: [
      {
        id: 401,
        question: "Is x an integer? (1) x/2 is an integer. (2) 2x is an integer.",
        options: ["Statement (1) ALONE is sufficient", "Statement (2) ALONE is sufficient", "Both statements together are sufficient", "Each statement ALONE is sufficient"],
        correctAnswer: 0,
        explanation: "Statement (1) states x/2 is an integer, which means x is an even integer (hence an integer). Statement (2) states 2x is an integer, so x could be 0.5 (not an integer). Thus (1) alone is sufficient.",
      },
    ],
  },
  {
    id: "icet-anal-ch2",
    name: "Coding & Decoding Clues",
    subjectId: "analytical",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },
  {
    id: "icet-math-ch1",
    name: "Arithmetic Ability - Ratios & Proportions",
    subjectId: "math",
    progress: 0,
    videos: [
      { id: "v-icet-m-1", title: "Ratio Concept, Proportions & Scales", duration: "21:30", url: "https://www.w3schools.com/html/mov_bbb.mp4", progress: 0, isWatched: false },
    ],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },
  {
    id: "icet-math-ch2",
    name: "Algebraic & Geometrical Ability",
    subjectId: "math",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },
  {
    id: "icet-comm-ch1",
    name: "Business Terminology & Grammar",
    subjectId: "comm",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },
];

export const ICET_MOCK_TESTS: MockTest[] = [
  {
    id: "icet-mock-1",
    name: "ICET Full Length Mock Test 1",
    examType: "ICET",
    type: "full",
    duration: 150 * 60,
    questionsCount: 2,
    questions: [
      {
        id: 1,
        question: "Find the ratio of 400 meters to 2 kilometers.",
        options: ["1:5", "2:5", "1:10", "4:5"],
        correctAnswer: 0,
        explanation: "2 kilometers = 2000 meters. Ratio = 400 / 2000 = 4 / 20 = 1 / 5 or 1:5.",
        subject: "Mathematical Ability",
        topic: "Arithmetic",
      },
      {
        id: 2,
        question: "Select the correct meaning of the business idiom 'Blue-chip company':",
        options: ["A newly founded startup", "A highly valuable and reliable corporation", "A company in financial deficit", "A tech hardware manufacturing firm"],
        correctAnswer: 1,
        explanation: "A blue-chip company is a nationally recognized, well-established, and financially sound company.",
        subject: "Communication Ability",
        topic: "Vocabulary",
      },
    ],
  },
];
