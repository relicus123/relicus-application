import { Chapter } from "../types/chapter.types";
import { MockTest } from "../types/test.types";
import { Subject } from "../types/exam.types";

export const CUET_SUBJECTS: Subject[] = [
  { id: "gen", name: "General Test", icon: "📊", color: "from-[#8B5CF6] to-[#4C1D95]", chaptersCount: 2, mockTestsCount: 1 },
  { id: "eng", name: "English Language", icon: "📚", color: "from-[#F97316] to-[#7C2D12]", chaptersCount: 1, mockTestsCount: 1 },
];

export const CUET_CHAPTERS: Chapter[] = [
  {
    id: "gen-ch1",
    name: "Logical Reasoning - Series Completion",
    subjectId: "gen",
    progress: 50,
    videos: [
      { id: "v-gen-1", title: "Number & Letter Series", duration: "14:15", url: "https://www.w3schools.com/html/mov_bbb.mp4", progress: 100, isWatched: true },
      { id: "v-gen-2", title: "Coding & Decoding Basics", duration: "16:40", url: "https://www.w3schools.com/html/mov_bbb.mp4", progress: 0, isWatched: false },
    ],
    notes: [
      { id: "n-gen-1", title: "Logical Reasoning Shortcuts.pdf", size: "1.1 MB", pdfUrl: "https://arxiv.org/pdf/quant-ph/0410100.pdf", isBookmarked: false },
    ],
    assignments: [],
    practiceQuestions: [
      {
        id: 1,
        question: "Complete the series: 2, 6, 12, 20, 30, ?",
        options: ["36", "40", "42", "48"],
        correctAnswer: 2,
        explanation: "The differences between successive terms are +4, +6, +8, +10. The next difference is +12. 30 + 12 = 42.",
      },
    ],
  },
  {
    id: "gen-ch2",
    name: "Quantitative Aptitude - Percentages",
    subjectId: "gen",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },
  {
    id: "eng-ch1",
    name: "Comprehension & Vocabulary",
    subjectId: "eng",
    progress: 30,
    videos: [
      { id: "v-eng-1", title: "Synonyms & Antonyms Techniques", duration: "18:20", url: "https://www.w3schools.com/html/mov_bbb.mp4", progress: 60, isWatched: false },
    ],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },
];

export const CUET_MOCK_TESTS: MockTest[] = [
  {
    id: "cuet-mock-1",
    name: "CUET Section III Mock Test 1",
    examType: "CUET",
    type: "full",
    duration: 60 * 60, // 60 minutes
    questionsCount: 2,
    questions: [
      {
        id: 1,
        question: "In coding, if CAT is coded as DBU, how is DOG coded?",
        options: ["EPH", "EQH", "FPH", "ENG"],
        correctAnswer: 0,
        explanation: "Each letter is shifted by +1. C->D, A->B, T->U. Thus, D->E, O->P, G->H.",
        subject: "General Test",
        topic: "Logical Reasoning",
      },
      {
        id: 2,
        question: "Select the synonym of the word 'ABANDON':",
        options: ["Adopt", "Desert", "Keep", "Support"],
        correctAnswer: 1,
        explanation: "To abandon means to leave or desert something or someone.",
        subject: "English Language",
        topic: "Vocabulary",
      },
    ],
  },
];
