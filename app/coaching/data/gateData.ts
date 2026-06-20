import { Chapter } from "../types/chapter.types";
import { MockTest } from "../types/test.types";
import { Subject } from "../types/exam.types";

/**
 * GATE Subject Registry — 5 Engineering Streams + Engineering Math + General Aptitude
 *
 * Each stream is treated as an independent "subject" with its own chapters.
 * To add a new stream (e.g., Chemical Engineering):
 *  1. Add an entry to GATE_SUBJECTS with id "stream-<slug>"
 *  2. Add chapters to GATE_CHAPTERS with matching subjectId
 *  No dashboard or tab code changes required.
 */
export const GATE_SUBJECTS: Subject[] = [
  {
    id: "ga",
    name: "General Aptitude",
    icon: "🧠",
    color: "from-[#6366F1] to-[#4338CA]",
    chaptersCount: 1,
    mockTestsCount: 1,
  },
  {
    id: "math",
    name: "Engineering Mathematics",
    icon: "📐",
    color: "from-[#10B981] to-[#047857]",
    chaptersCount: 2,
    mockTestsCount: 1,
  },
  // ── 5 Engineering Streams ──────────────────────────────────────────────────
  {
    id: "stream-cs",
    name: "Computer Science (CS/IT)",
    icon: "💻",
    color: "from-[#3B82F6] to-[#1E40AF]",
    chaptersCount: 3,
    mockTestsCount: 1,
  },
  {
    id: "stream-ece",
    name: "Electronics (ECE)",
    icon: "📡",
    color: "from-[#F59E0B] to-[#B45309]",
    chaptersCount: 3,
    mockTestsCount: 1,
  },
  {
    id: "stream-me",
    name: "Mechanical (ME)",
    icon: "⚙️",
    color: "from-[#EF4444] to-[#B91C1C]",
    chaptersCount: 3,
    mockTestsCount: 1,
  },
  {
    id: "stream-ce",
    name: "Civil (CE)",
    icon: "🏗️",
    color: "from-[#8B5CF6] to-[#4C1D95]",
    chaptersCount: 3,
    mockTestsCount: 1,
  },
  {
    id: "stream-ee",
    name: "Electrical (EE)",
    icon: "⚡",
    color: "from-[#F97316] to-[#EA580C]",
    chaptersCount: 3,
    mockTestsCount: 1,
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// General Aptitude
// ──────────────────────────────────────────────────────────────────────────────
export const GATE_CHAPTERS: Chapter[] = [
  {
    id: "gate-ga-ch1",
    name: "Verbal & Quantitative Reasoning",
    subjectId: "ga",
    progress: 0,
    videos: [
      {
        id: "v-gate-ga-1",
        title: "Sentence Correction & Para Jumbles",
        duration: "15:00",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        progress: 0,
        isWatched: false,
      },
    ],
    notes: [],
    assignments: [],
    practiceQuestions: [
      {
        id: 200,
        question: "Five friends P, Q, R, S, T sit in a row. P is to the right of Q. R is between P and S. T is at one end. Who sits in the middle?",
        options: ["P", "Q", "R", "S"],
        correctAnswer: 2,
        explanation: "Arranging: Q-R-P-S-T or T-S-R-P-Q. R is always in the middle.",
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Engineering Mathematics
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "gate-math-ch1",
    name: "Linear Algebra — Matrix Algebra & Eigenvalues",
    subjectId: "math",
    progress: 50,
    videos: [
      {
        id: "v-gate-m-1",
        title: "Eigenvalues & Eigenvectors",
        duration: "25:30",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        progress: 100,
        isWatched: true,
      },
      {
        id: "v-gate-m-2",
        title: "System of Linear Equations — Gauss Elimination",
        duration: "20:45",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        progress: 0,
        isWatched: false,
      },
    ],
    notes: [
      {
        id: "n-gate-m-1",
        title: "Linear Algebra Formulas.pdf",
        size: "1.4 MB",
        pdfUrl: "https://arxiv.org/pdf/quant-ph/0410100.pdf",
        isBookmarked: false,
      },
    ],
    assignments: [],
    practiceQuestions: [
      {
        id: 201,
        question: "What is the determinant of an upper triangular matrix?",
        options: ["Product of diagonal elements", "Sum of diagonal elements", "Always 0", "Always 1"],
        correctAnswer: 0,
        explanation:
          "The determinant of any triangular matrix equals the product of its diagonal entries.",
      },
    ],
  },
  {
    id: "gate-math-ch2",
    name: "Calculus — Limits, Derivatives & Integration",
    subjectId: "math",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Stream: Computer Science (CS/IT)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "gate-cs-ch1",
    name: "Algorithms — Asymptotic Analysis & Sorting",
    subjectId: "stream-cs",
    progress: 0,
    videos: [
      {
        id: "v-gate-cs-1",
        title: "Big-O, Omega & Theta Notations",
        duration: "22:15",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        progress: 0,
        isWatched: false,
      },
    ],
    notes: [],
    assignments: [],
    practiceQuestions: [
      {
        id: 210,
        question: "The time complexity of finding a cycle in a directed graph with V vertices and E edges using DFS is:",
        options: ["O(V)", "O(E)", "O(V + E)", "O(V * E)"],
        correctAnswer: 2,
        explanation: "DFS-based cycle detection runs in O(V + E) time.",
      },
    ],
  },
  {
    id: "gate-cs-ch2",
    name: "Operating Systems — Process Scheduling & Memory Management",
    subjectId: "stream-cs",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },
  {
    id: "gate-cs-ch3",
    name: "Computer Networks — IP Addressing & Routing",
    subjectId: "stream-cs",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Stream: Electronics (ECE)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "gate-ece-ch1",
    name: "Electronic Devices — Diodes, BJT & MOSFET",
    subjectId: "stream-ece",
    progress: 0,
    videos: [
      {
        id: "v-gate-ece-1",
        title: "BJT Small Signal Models",
        duration: "24:00",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        progress: 0,
        isWatched: false,
      },
    ],
    notes: [],
    assignments: [],
    practiceQuestions: [
      {
        id: 220,
        question: "In a p-n junction diode under forward bias, which carriers are injected into the p-region?",
        options: ["Holes from p-side", "Electrons from n-side", "Photons", "Neutrons"],
        correctAnswer: 1,
        explanation:
          "Under forward bias, minority carrier electrons are injected from the n-region into the p-region.",
      },
    ],
  },
  {
    id: "gate-ece-ch2",
    name: "Signals & Systems — Fourier & Laplace Transforms",
    subjectId: "stream-ece",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },
  {
    id: "gate-ece-ch3",
    name: "Digital Circuits — Boolean Algebra & Sequential Logic",
    subjectId: "stream-ece",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Stream: Mechanical (ME)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "gate-me-ch1",
    name: "Engineering Mechanics — Statics & Dynamics",
    subjectId: "stream-me",
    progress: 0,
    videos: [
      {
        id: "v-gate-me-1",
        title: "Free Body Diagrams & Equilibrium",
        duration: "23:30",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        progress: 0,
        isWatched: false,
      },
    ],
    notes: [],
    assignments: [],
    practiceQuestions: [
      {
        id: 230,
        question: "A body is in static equilibrium when:",
        options: [
          "Net force is zero only",
          "Net torque is zero only",
          "Both net force and net torque are zero",
          "The body is at rest",
        ],
        correctAnswer: 2,
        explanation:
          "For complete static equilibrium, both the resultant force (ΣF=0) and resultant torque (ΣM=0) must be zero.",
      },
    ],
  },
  {
    id: "gate-me-ch2",
    name: "Thermodynamics — Laws & Cycles",
    subjectId: "stream-me",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },
  {
    id: "gate-me-ch3",
    name: "Fluid Mechanics — Bernoulli's Equation & Flow Analysis",
    subjectId: "stream-me",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Stream: Civil (CE)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "gate-ce-ch1",
    name: "Structural Analysis — Trusses & Beams",
    subjectId: "stream-ce",
    progress: 0,
    videos: [
      {
        id: "v-gate-ce-1",
        title: "Analysis of Determinate Structures",
        duration: "27:00",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        progress: 0,
        isWatched: false,
      },
    ],
    notes: [],
    assignments: [],
    practiceQuestions: [
      {
        id: 240,
        question: "For a simply supported beam under uniformly distributed load, the maximum bending moment occurs at:",
        options: ["Support points", "Quarter span", "Mid-span", "Three-quarter span"],
        correctAnswer: 2,
        explanation:
          "For a simply supported beam with UDL, the maximum bending moment occurs at the mid-span.",
      },
    ],
  },
  {
    id: "gate-ce-ch2",
    name: "Geotechnical Engineering — Soil Classification & Bearing Capacity",
    subjectId: "stream-ce",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },
  {
    id: "gate-ce-ch3",
    name: "Fluid Mechanics & Hydraulics — Open Channel Flow",
    subjectId: "stream-ce",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Stream: Electrical (EE)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "gate-ee-ch1",
    name: "Electric Circuits — Network Analysis & Theorems",
    subjectId: "stream-ee",
    progress: 0,
    videos: [
      {
        id: "v-gate-ee-1",
        title: "Thevenin's & Norton's Theorem — Solved Problems",
        duration: "26:30",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        progress: 0,
        isWatched: false,
      },
    ],
    notes: [],
    assignments: [],
    practiceQuestions: [
      {
        id: 250,
        question: "Thevenin's theorem converts any linear circuit into:",
        options: [
          "A current source in parallel with a resistance",
          "A voltage source in series with a resistance",
          "A capacitor and resistor in series",
          "A Norton equivalent only",
        ],
        correctAnswer: 1,
        explanation:
          "Thevenin's theorem replaces any linear two-terminal circuit with a single voltage source (Vth) in series with a resistance (Rth).",
      },
    ],
  },
  {
    id: "gate-ee-ch2",
    name: "Electromagnetic Fields — Maxwell's Equations",
    subjectId: "stream-ee",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },
  {
    id: "gate-ee-ch3",
    name: "Electrical Machines — DC Motors & Transformers",
    subjectId: "stream-ee",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Mock Tests
// ──────────────────────────────────────────────────────────────────────────────
export const GATE_MOCK_TESTS: MockTest[] = [
  {
    id: "gate-mock-1",
    name: "GATE Full Mock Test — CS Stream",
    examType: "GATE",
    type: "full",
    duration: 180 * 60,
    questionsCount: 3,
    questions: [
      {
        id: 1,
        question: "The time complexity of finding a cycle in a directed graph of V vertices and E edges is...",
        options: ["O(V)", "O(E)", "O(V + E)", "O(V * E)"],
        correctAnswer: 2,
        explanation: "Using DFS, cycle detection can be accomplished in O(V + E) time.",
        subject: "Computer Science (CS/IT)",
        topic: "Graph Algorithms",
      },
      {
        id: 2,
        question: "If a matrix A has eigenvalues 3 and 5, what are the eigenvalues of A²?",
        options: ["3 and 5", "9 and 25", "6 and 10", "1/3 and 1/5"],
        correctAnswer: 1,
        explanation:
          "If λ is an eigenvalue of A, then λ^k is an eigenvalue of A^k. So eigenvalues are 3²=9 and 5²=25.",
        subject: "Engineering Mathematics",
        topic: "Linear Algebra",
      },
      {
        id: 3,
        question: "Which scheduling algorithm gives minimum average waiting time for a given set of processes?",
        options: ["FCFS", "Round Robin", "SJF (Non-preemptive)", "Priority Scheduling"],
        correctAnswer: 2,
        explanation:
          "Shortest Job First (SJF) is provably optimal for minimizing average waiting time.",
        subject: "Computer Science (CS/IT)",
        topic: "Operating Systems",
      },
    ],
  },
  {
    id: "gate-mock-2",
    name: "GATE Subject Mock — Electronics (ECE)",
    examType: "GATE",
    type: "subject",
    duration: 60 * 60,
    questionsCount: 1,
    questions: [
      {
        id: 1,
        question: "In a p-n junction diode under forward bias, which carriers are injected into the p-region?",
        options: ["Holes from p-side", "Electrons from n-side", "Photons", "Neutrons"],
        correctAnswer: 1,
        explanation:
          "Under forward bias, minority carrier electrons from n-region are injected into the p-region.",
        subject: "Electronics (ECE)",
        topic: "Electronic Devices",
      },
    ],
  },
];
