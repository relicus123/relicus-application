import { Chapter } from "../types/chapter.types";
import { MockTest } from "../types/test.types";
import { Subject } from "../types/exam.types";

export const JEE_SUBJECTS: Subject[] = [
  { id: "math", name: "Mathematics", icon: "📐", color: "from-[#3B82F6] to-[#1E3A8A]", chaptersCount: 3, mockTestsCount: 2 },
  { id: "phys", name: "Physics", icon: "⚛️", color: "from-[#10B981] to-[#065F46]", chaptersCount: 2, mockTestsCount: 2 },
  { id: "chem", name: "Chemistry", icon: "🧪", color: "from-[#F97316] to-[#7C2D12]", chaptersCount: 2, mockTestsCount: 2 },
];

export const JEE_CHAPTERS: Chapter[] = [
  {
    id: "math-ch1",
    name: "Calculus - Limits & Continuity",
    subjectId: "math",
    progress: 45,
    videos: [
      { id: "v-math-1", title: "Introduction to Limits", duration: "12:45", url: "https://www.w3schools.com/html/mov_bbb.mp4", progress: 100, isWatched: true },
      { id: "v-math-2", title: "Evaluating Limits Algebraically", duration: "18:20", url: "https://www.w3schools.com/html/mov_bbb.mp4", progress: 30, isWatched: false },
      { id: "v-math-3", title: "Continuity & Intermediate Value Theorem", duration: "22:15", url: "https://www.w3schools.com/html/mov_bbb.mp4", progress: 0, isWatched: false },
    ],
    notes: [
      { id: "n-math-1", title: "Limits Formulas Sheet.pdf", size: "1.2 MB", pdfUrl: "https://arxiv.org/pdf/quant-ph/0410100.pdf", isBookmarked: false },
      { id: "n-math-2", title: "Continuity Concept Notes.pdf", size: "2.4 MB", pdfUrl: "https://arxiv.org/pdf/quant-ph/0410100.pdf", isBookmarked: true },
    ],
    assignments: [
      { id: "a-math-1", title: "Limits Practice Set 1", dueDate: "2026-06-10", status: "evaluated", score: "8/10" },
      { id: "a-math-2", title: "Continuity Challenge Sheet", dueDate: "2026-06-15", status: "pending" },
    ],
    practiceQuestions: [
      {
        id: 1,
        question: "Find the limit of (sin x) / x as x approaches 0.",
        options: ["0", "1", "undefined", "infinity"],
        correctAnswer: 1,
        explanation: "By L'Hopital's rule or basic trigonometric limit theorem, lim (x->0) sin(x)/x = 1.",
      },
      {
        id: 2,
        question: "If f(x) = x² for x < 1 and f(x) = k for x >= 1, what value of k makes f(x) continuous at x = 1?",
        options: ["0", "1", "2", "Any value"],
        correctAnswer: 1,
        explanation: "For continuity, left hand limit = right hand limit. Lim (x->1-) x² = 1. Therefore, f(1) = k = 1.",
      },
    ],
    chapterTestId: "test-math-limits",
  },
  {
    id: "math-ch2",
    name: "Matrices & Determinants",
    subjectId: "math",
    progress: 80,
    videos: [
      { id: "v-math-4", title: "Types of Matrices", duration: "15:10", url: "https://www.w3schools.com/html/mov_bbb.mp4", progress: 100, isWatched: true },
      { id: "v-math-5", title: "Properties of Determinants", duration: "25:40", url: "https://www.w3schools.com/html/mov_bbb.mp4", progress: 100, isWatched: true },
    ],
    notes: [
      { id: "n-math-3", title: "Matrices Quick Revision.pdf", size: "850 KB", pdfUrl: "https://arxiv.org/pdf/quant-ph/0410100.pdf", isBookmarked: false },
    ],
    assignments: [
      { id: "a-math-3", title: "Matrix Algebra Assignment", dueDate: "2026-06-05", status: "evaluated", score: "9/10" },
    ],
    practiceQuestions: [
      {
        id: 3,
        question: "What is the determinant of a 2x2 identity matrix?",
        options: ["0", "1", "2", "-1"],
        correctAnswer: 1,
        explanation: "The identity matrix has 1s on main diagonal and 0s elsewhere. Det = 1*1 - 0*0 = 1.",
      },
    ],
  },
  {
    id: "math-ch3",
    name: "Integration Methods",
    subjectId: "math",
    progress: 0,
    videos: [
      { id: "v-math-6", title: "Integration by Substitution", duration: "20:30", url: "https://www.w3schools.com/html/mov_bbb.mp4", progress: 0, isWatched: false },
    ],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },
  {
    id: "phys-ch1",
    name: "Mechanics - Kinematics",
    subjectId: "phys",
    progress: 30,
    videos: [
      { id: "v-phys-1", title: "Vectors & Motion in 1D", duration: "22:15", url: "https://www.w3schools.com/html/mov_bbb.mp4", progress: 90, isWatched: false },
      { id: "v-phys-2", title: "Projectile Motion Analysis", duration: "28:10", url: "https://www.w3schools.com/html/mov_bbb.mp4", progress: 0, isWatched: false },
    ],
    notes: [
      { id: "n-phys-1", title: "Kinematics Equations.pdf", size: "1.5 MB", pdfUrl: "https://arxiv.org/pdf/quant-ph/0410100.pdf", isBookmarked: false },
    ],
    assignments: [
      { id: "a-phys-1", title: "Kinematics Practice Sheet", dueDate: "2026-06-08", status: "pending" },
    ],
    practiceQuestions: [
      {
        id: 4,
        question: "A ball is thrown vertically upwards. What is its acceleration at the highest point?",
        options: ["0", "9.8 m/s² downwards", "9.8 m/s² upwards", "Depends on initial velocity"],
        correctAnswer: 1,
        explanation: "Gravity is constantly pulling the ball down with 9.8 m/s², regardless of its velocity or position.",
      },
    ],
  },
  {
    id: "phys-ch2",
    name: "Thermodynamics - Laws & Processes",
    subjectId: "phys",
    progress: 75,
    videos: [
      { id: "v-phys-3", title: "First Law of Thermodynamics", duration: "19:45", url: "https://www.w3schools.com/html/mov_bbb.mp4", progress: 100, isWatched: true },
    ],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },
  {
    id: "chem-ch1",
    name: "Organic Chemistry - Hydrocarbons",
    subjectId: "chem",
    progress: 60,
    videos: [
      { id: "v-chem-1", title: "Alkanes, Alkenes, Alkynes", duration: "25:30", url: "https://www.w3schools.com/html/mov_bbb.mp4", progress: 100, isWatched: true },
    ],
    notes: [
      { id: "n-chem-1", title: "Organic Reactions Mindmap.pdf", size: "3.1 MB", pdfUrl: "https://arxiv.org/pdf/quant-ph/0410100.pdf", isBookmarked: true },
    ],
    assignments: [],
    practiceQuestions: [],
  },
  {
    id: "chem-ch2",
    name: "Physical Chemistry - Equilibrium",
    subjectId: "chem",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },
];

export const JEE_MOCK_TESTS: MockTest[] = [
  {
    id: "jee-mock-1",
    name: "JEE Full-Length Mock Test 1",
    examType: "JEE",
    type: "full",
    duration: 180 * 60, // 3 hours in seconds
    questionsCount: 5, // shortened for mock demo
    questions: [
      {
        id: 1,
        question: "Evaluate the limit of (1 - cos x) / x² as x approaches 0.",
        options: ["0", "1/2", "1", "2"],
        correctAnswer: 1,
        explanation: "By Taylor expansion cos x = 1 - x²/2. Thus (1 - cos x)/x² = 1/2.",
        subject: "Mathematics",
        topic: "Calculus",
      },
      {
        id: 2,
        question: "A block of mass 2kg is pushed with 10N force on a frictionless surface. What is its acceleration?",
        options: ["2 m/s²", "5 m/s²", "10 m/s²", "20 m/s²"],
        correctAnswer: 1,
        explanation: "By Newton's second law, a = F/m = 10/2 = 5 m/s².",
        subject: "Physics",
        topic: "Mechanics",
      },
      {
        id: 3,
        question: "Which of the following organic compounds exhibits isomerism?",
        options: ["Methane", "Ethane", "Propane", "Butane"],
        correctAnswer: 3,
        explanation: "Butane has two isomers: n-butane and isobutane. Methane, ethane, and propane have no isomers.",
        subject: "Chemistry",
        topic: "Organic Chemistry",
      },
      {
        id: 4,
        question: "The determinant of a diagonal matrix is:",
        options: ["0", "Sum of diagonal elements", "Product of diagonal elements", "1"],
        correctAnswer: 2,
        explanation: "The determinant of any triangular or diagonal matrix is the product of its diagonal elements.",
        subject: "Mathematics",
        topic: "Matrices & Determinants",
      },
      {
        id: 5,
        question: "Which thermodynamic process occurs at constant volume?",
        options: ["Isothermal", "Isobaric", "Isochoric", "Adiabatic"],
        correctAnswer: 2,
        explanation: "An isochoric process is a thermodynamic process in which the volume remains constant.",
        subject: "Physics",
        topic: "Thermodynamics",
      },
    ],
  },
  {
    id: "jee-mock-2",
    name: "JEE Mathematics Sectional Test",
    examType: "JEE",
    type: "subject",
    subjectId: "math",
    duration: 60 * 60,
    questionsCount: 3,
    questions: [
      {
        id: 1,
        question: "If A is a 3x3 matrix and |A| = 5, what is |2A|?",
        options: ["10", "20", "40", "80"],
        correctAnswer: 2,
        explanation: "For a nxn matrix, |cA| = c^n * |A|. Thus |2A| = 2³ * 5 = 8 * 5 = 40.",
        subject: "Mathematics",
        topic: "Matrices & Determinants",
      },
      {
        id: 2,
        question: "Evaluate the limit of ln(1 + x)/x as x approaches 0.",
        options: ["0", "1", "e", "undefined"],
        correctAnswer: 1,
        explanation: "Using L'Hopital's rule, lim (x->0) (1/(1+x))/1 = 1.",
        subject: "Mathematics",
        topic: "Calculus",
      },
      {
        id: 3,
        question: "The value of integral of e^x dx from 0 to 1 is:",
        options: ["e", "e - 1", "e + 1", "1"],
        correctAnswer: 1,
        explanation: "Integral of e^x is e^x. Evaluated from 0 to 1: e¹ - e⁰ = e - 1.",
        subject: "Mathematics",
        topic: "Integration",
      },
    ],
  },
];
