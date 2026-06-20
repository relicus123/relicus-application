import { Chapter } from "../types/chapter.types";
import { MockTest } from "../types/test.types";
import { Subject } from "../types/exam.types";

export const NEET_SUBJECTS: Subject[] = [
  { id: "bio", name: "Biology", icon: "🧬", color: "from-[#10B981] to-[#065F46]", chaptersCount: 2, mockTestsCount: 2 },
  { id: "phys", name: "Physics", icon: "⚛️", color: "from-[#3B82F6] to-[#1E3A8A]", chaptersCount: 1, mockTestsCount: 1 },
  { id: "chem", name: "Chemistry", icon: "🧪", color: "from-[#F97316] to-[#7C2D12]", chaptersCount: 1, mockTestsCount: 1 },
];

export const NEET_CHAPTERS: Chapter[] = [
  {
    id: "bio-ch1",
    name: "Genetics & Inheritance Laws",
    subjectId: "bio",
    progress: 75,
    videos: [
      { id: "v-bio-1", title: "Mendelian Inheritance Laws", duration: "18:40", url: "https://www.w3schools.com/html/mov_bbb.mp4", progress: 100, isWatched: true },
      { id: "v-bio-2", title: "Incomplete Dominance & Codominance", duration: "24:10", url: "https://www.w3schools.com/html/mov_bbb.mp4", progress: 50, isWatched: false },
    ],
    notes: [
      { id: "n-bio-1", title: "Inheritance Revision Notes.pdf", size: "1.8 MB", pdfUrl: "https://arxiv.org/pdf/quant-ph/0410100.pdf", isBookmarked: true },
    ],
    assignments: [
      { id: "a-bio-1", title: "Monohybrid & Dihybrid Crosses", dueDate: "2026-06-09", status: "evaluated", score: "9/10" },
    ],
    practiceQuestions: [
      {
        id: 1,
        question: "What is the phenotypic ratio of a Mendelian dihybrid cross in F2 generation?",
        options: ["3:1", "9:3:3:1", "1:2:1", "9:7"],
        correctAnswer: 1,
        explanation: "Mendel's dihybrid cross F2 generation phenotypic ratio is always 9:3:3:1.",
      },
    ],
  },
  {
    id: "bio-ch2",
    name: "Human Physiology - Digestion",
    subjectId: "bio",
    progress: 20,
    videos: [
      { id: "v-bio-3", title: "Alimentary Canal Anatomy", duration: "20:15", url: "https://www.w3schools.com/html/mov_bbb.mp4", progress: 20, isWatched: false },
    ],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },
  {
    id: "phys-ch1-neet",
    name: "Optics - Ray Optics",
    subjectId: "phys",
    progress: 40,
    videos: [
      { id: "v-phys-opt1", title: "Reflection & Spherical Mirrors", duration: "25:15", url: "https://www.w3schools.com/html/mov_bbb.mp4", progress: 100, isWatched: true },
    ],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },
  {
    id: "chem-ch1-neet",
    name: "Chemical Bonding",
    subjectId: "chem",
    progress: 10,
    videos: [
      { id: "v-chem-bond1", title: "Ionic vs Covalent Bonds", duration: "22:40", url: "https://www.w3schools.com/html/mov_bbb.mp4", progress: 20, isWatched: false },
    ],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },
];

export const NEET_MOCK_TESTS: MockTest[] = [
  {
    id: "neet-mock-1",
    name: "NEET Full-Length Mock Test 1",
    examType: "NEET",
    type: "full",
    duration: 200 * 60, // 200 minutes
    questionsCount: 3,
    questions: [
      {
        id: 1,
        question: "Who is known as the Father of Genetics?",
        options: ["Gregor Mendel", "Charles Darwin", "Thomas Hunt Morgan", "Hugo de Vries"],
        correctAnswer: 0,
        explanation: "Gregor Mendel discovered the basic principles of heredity through experiments on garden pea plants.",
        subject: "Biology",
        topic: "Genetics",
      },
      {
        id: 2,
        question: "Real image is formed by which mirror at object distance greater than focal length?",
        options: ["Plane mirror", "Convex mirror", "Concave mirror", "All of the above"],
        correctAnswer: 2,
        explanation: "A concave mirror forms real, inverted images for objects placed beyond its focal length.",
        subject: "Physics",
        topic: "Optics",
      },
      {
        id: 3,
        question: "Which type of chemical bond is formed by sharing of electrons?",
        options: ["Ionic", "Covalent", "Metallic", "Hydrogen"],
        correctAnswer: 1,
        explanation: "Covalent bonds are formed by the mutual sharing of electron pairs between atoms.",
        subject: "Chemistry",
        topic: "Chemical Bonding",
      },
    ],
  },
];
