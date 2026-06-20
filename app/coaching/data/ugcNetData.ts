import { Chapter } from "../types/chapter.types";
import { MockTest } from "../types/test.types";
import { Subject } from "../types/exam.types";

/**
 * UGC-NET Subject Registry
 * Paper 1  → General Teaching & Research Aptitude (common for all candidates)
 * Paper 2  → 5 discipline-specific subjects
 *
 * To add a new Paper 2 subject:
 *  1. Add an entry to UGCNET_SUBJECTS with id "paper2-<slug>"
 *  2. Add chapters to UGCNET_CHAPTERS with matching subjectId
 *  No other file needs changing.
 */
export const UGCNET_SUBJECTS: Subject[] = [
  // Paper 1 — common
  {
    id: "paper1",
    name: "Paper 1 — General Aptitude",
    icon: "📝",
    color: "from-[#F97316] to-[#EA580C]",
    chaptersCount: 3,
    mockTestsCount: 1,
  },
  // Paper 2 — discipline-specific
  {
    id: "paper2-cs",
    name: "Paper 2 — Computer Science",
    icon: "💻",
    color: "from-[#3B82F6] to-[#1E40AF]",
    chaptersCount: 3,
    mockTestsCount: 1,
  },
  {
    id: "paper2-commerce",
    name: "Paper 2 — Commerce",
    icon: "📊",
    color: "from-[#10B981] to-[#047857]",
    chaptersCount: 3,
    mockTestsCount: 1,
  },
  {
    id: "paper2-management",
    name: "Paper 2 — Management",
    icon: "🏢",
    color: "from-[#8B5CF6] to-[#4C1D95]",
    chaptersCount: 3,
    mockTestsCount: 1,
  },
  {
    id: "paper2-english",
    name: "Paper 2 — English",
    icon: "📖",
    color: "from-[#F59E0B] to-[#B45309]",
    chaptersCount: 3,
    mockTestsCount: 1,
  },
  {
    id: "paper2-education",
    name: "Paper 2 — Education",
    icon: "🎓",
    color: "from-[#EF4444] to-[#B91C1C]",
    chaptersCount: 3,
    mockTestsCount: 1,
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// PAPER 1 — General Teaching & Research Aptitude
// ──────────────────────────────────────────────────────────────────────────────
export const UGCNET_CHAPTERS: Chapter[] = [
  {
    id: "net-p1-ch1",
    name: "Teaching Aptitude — Concept & Objectives",
    subjectId: "paper1",
    progress: 40,
    videos: [
      {
        id: "v-net-p1-1",
        title: "Levels of Teaching (Memory, Understanding, Reflective)",
        duration: "18:45",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        progress: 100,
        isWatched: true,
      },
      {
        id: "v-net-p1-2",
        title: "Characteristics of Learners",
        duration: "22:10",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        progress: 0,
        isWatched: false,
      },
    ],
    notes: [
      {
        id: "n-net-p1-1",
        title: "Teaching Aptitude Revision.pdf",
        size: "1.2 MB",
        pdfUrl: "https://arxiv.org/pdf/quant-ph/0410100.pdf",
        isBookmarked: false,
      },
    ],
    assignments: [],
    practiceQuestions: [
      {
        id: 101,
        question: "Which of the following is the highest level of cognitive ability according to Bloom's Taxonomy (Revised)?",
        options: ["Evaluating", "Knowing", "Understanding", "Analyzing"],
        correctAnswer: 0,
        explanation:
          "According to revised Bloom's Taxonomy, Evaluating (and Creating) represent the highest cognitive domains.",
      },
    ],
  },
  {
    id: "net-p1-ch2",
    name: "Research Aptitude — Types & Steps",
    subjectId: "paper1",
    progress: 20,
    videos: [
      {
        id: "v-net-p1-3",
        title: "Qualitative vs Quantitative Research",
        duration: "20:00",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        progress: 60,
        isWatched: false,
      },
    ],
    notes: [],
    assignments: [],
    practiceQuestions: [
      {
        id: 102,
        question: "A researcher conducts a study to understand people's experiences with grief. Which type of research is this?",
        options: ["Quantitative", "Experimental", "Qualitative", "Historical"],
        correctAnswer: 2,
        explanation: "Studies exploring human experiences and meanings are qualitative in nature.",
      },
    ],
  },
  {
    id: "net-p1-ch3",
    name: "Data Interpretation & Logical Reasoning",
    subjectId: "paper1",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PAPER 2 — Computer Science
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "net-cs-ch1",
    name: "Theory of Computation — Regular Languages",
    subjectId: "paper2-cs",
    progress: 0,
    videos: [
      {
        id: "v-net-cs-1",
        title: "DFA & NFA Construction",
        duration: "28:15",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        progress: 0,
        isWatched: false,
      },
    ],
    notes: [
      {
        id: "n-net-cs-1",
        title: "Regular Expressions Cheat Sheet.pdf",
        size: "950 KB",
        pdfUrl: "https://arxiv.org/pdf/quant-ph/0410100.pdf",
        isBookmarked: false,
      },
    ],
    assignments: [],
    practiceQuestions: [
      {
        id: 103,
        question: "Which of the following language classes is NOT closed under intersection?",
        options: ["Regular Languages", "Context-Free Languages", "Recursive Languages", "Recursively Enumerable"],
        correctAnswer: 1,
        explanation: "Context-free languages (CFLs) are not closed under intersection.",
      },
    ],
  },
  {
    id: "net-cs-ch2",
    name: "Database Management — Normalization & Transactions",
    subjectId: "paper2-cs",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },
  {
    id: "net-cs-ch3",
    name: "Data Structures & Algorithms — Sorting & Searching",
    subjectId: "paper2-cs",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PAPER 2 — Commerce
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "net-com-ch1",
    name: "Financial Accounting — Basic Concepts & Standards",
    subjectId: "paper2-commerce",
    progress: 0,
    videos: [
      {
        id: "v-net-com-1",
        title: "Indian Accounting Standards (Ind AS) Overview",
        duration: "24:30",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        progress: 0,
        isWatched: false,
      },
    ],
    notes: [],
    assignments: [],
    practiceQuestions: [
      {
        id: 110,
        question: "Which accounting standard deals with 'Revenue Recognition' under Ind AS?",
        options: ["Ind AS 18", "Ind AS 115", "Ind AS 36", "Ind AS 9"],
        correctAnswer: 1,
        explanation: "Ind AS 115 replaced Ind AS 18 and governs revenue recognition from contracts with customers.",
      },
    ],
  },
  {
    id: "net-com-ch2",
    name: "Business Finance — Capital Structure & Cost of Capital",
    subjectId: "paper2-commerce",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },
  {
    id: "net-com-ch3",
    name: "Marketing Management — Consumer Behaviour & STP",
    subjectId: "paper2-commerce",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PAPER 2 — Management
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "net-mgmt-ch1",
    name: "Organisational Behaviour — Motivation Theories",
    subjectId: "paper2-management",
    progress: 0,
    videos: [
      {
        id: "v-net-mgmt-1",
        title: "Maslow, Herzberg & McClelland — Comparative Analysis",
        duration: "22:00",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        progress: 0,
        isWatched: false,
      },
    ],
    notes: [],
    assignments: [],
    practiceQuestions: [
      {
        id: 120,
        question: "Which of the following is a 'hygiene factor' in Herzberg's Two-Factor Theory?",
        options: ["Achievement", "Recognition", "Company Policy", "Growth"],
        correctAnswer: 2,
        explanation:
          "Company policy is a hygiene (maintenance) factor. Its absence causes dissatisfaction, but its presence does not motivate.",
      },
    ],
  },
  {
    id: "net-mgmt-ch2",
    name: "Strategic Management — Porter's Models",
    subjectId: "paper2-management",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },
  {
    id: "net-mgmt-ch3",
    name: "Human Resource Management — Recruitment & Training",
    subjectId: "paper2-management",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PAPER 2 — English
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "net-eng-ch1",
    name: "Literary Criticism — Schools & Theories",
    subjectId: "paper2-english",
    progress: 0,
    videos: [
      {
        id: "v-net-eng-1",
        title: "New Criticism vs Post-Structuralism",
        duration: "26:15",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        progress: 0,
        isWatched: false,
      },
    ],
    notes: [],
    assignments: [],
    practiceQuestions: [
      {
        id: 130,
        question: "'The Death of the Author' is an essay associated with which critic?",
        options: ["T.S. Eliot", "Roland Barthes", "Northrop Frye", "Derrida"],
        correctAnswer: 1,
        explanation:
          "'The Death of the Author' (1967) is by Roland Barthes, arguing that the author's intention is irrelevant to textual meaning.",
      },
    ],
  },
  {
    id: "net-eng-ch2",
    name: "British Literature — Renaissance to Victorian Age",
    subjectId: "paper2-english",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },
  {
    id: "net-eng-ch3",
    name: "Language & Linguistics — Phonology & Syntax",
    subjectId: "paper2-english",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PAPER 2 — Education
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "net-edu-ch1",
    name: "Educational Psychology — Learning Theories",
    subjectId: "paper2-education",
    progress: 0,
    videos: [
      {
        id: "v-net-edu-1",
        title: "Behaviourism, Cognitivism & Constructivism",
        duration: "21:30",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        progress: 0,
        isWatched: false,
      },
    ],
    notes: [],
    assignments: [],
    practiceQuestions: [
      {
        id: 140,
        question: "Zone of Proximal Development (ZPD) is a concept given by which psychologist?",
        options: ["Piaget", "Bruner", "Vygotsky", "Kohlberg"],
        correctAnswer: 2,
        explanation:
          "ZPD is Vygotsky's concept describing the space between what a learner can do independently and what they can do with guidance.",
      },
    ],
  },
  {
    id: "net-edu-ch2",
    name: "Curriculum Development & Instructional Design",
    subjectId: "paper2-education",
    progress: 0,
    videos: [],
    notes: [],
    assignments: [],
    practiceQuestions: [],
  },
  {
    id: "net-edu-ch3",
    name: "Educational Measurement & Evaluation",
    subjectId: "paper2-education",
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
export const UGCNET_MOCK_TESTS: MockTest[] = [
  {
    id: "net-mock-1",
    name: "UGC-NET Paper 1 — Full Mock Test 1",
    examType: "UGC-NET",
    type: "full",
    duration: 60 * 60,
    questionsCount: 3,
    questions: [
      {
        id: 1,
        question: "Research design that is exploratory in nature seeks to...",
        options: [
          "Test a specific hypothesis",
          "Discover new insights and formulate problems",
          "Determine causal relationships",
          "Describe demographics",
        ],
        correctAnswer: 1,
        explanation:
          "Exploratory research designs seek to explore a subject area to gain insights or clarify issues, rather than test rigid hypotheses.",
        subject: "Paper 1 — General Aptitude",
        topic: "Research Methodology",
      },
      {
        id: 2,
        question: "Find the odd one out: 3, 5, 7, 9, 11",
        options: ["3", "7", "9", "11"],
        correctAnswer: 2,
        explanation:
          "9 is a composite number (divisible by 3), whereas 3, 5, 7, 11 are all prime numbers.",
        subject: "Paper 1 — General Aptitude",
        topic: "Mathematical Reasoning",
      },
      {
        id: 3,
        question: "Which of the following is the highest level of cognitive ability?",
        options: ["Evaluating", "Knowing", "Understanding", "Analyzing"],
        correctAnswer: 0,
        explanation:
          "According to revised Bloom's Taxonomy, Evaluating (and Creating) represent the highest cognitive domains.",
        subject: "Paper 1 — General Aptitude",
        topic: "Teaching Aptitude",
      },
    ],
  },
  {
    id: "net-mock-2",
    name: "UGC-NET Paper 2 — Computer Science Mock Test 1",
    examType: "UGC-NET",
    type: "subject",
    duration: 120 * 60,
    questionsCount: 2,
    questions: [
      {
        id: 1,
        question: "Which of the following language classes is NOT closed under intersection?",
        options: [
          "Regular Languages",
          "Context-Free Languages",
          "Recursive Languages",
          "Recursively Enumerable",
        ],
        correctAnswer: 1,
        explanation: "Context-free languages (CFLs) are not closed under intersection.",
        subject: "Paper 2 — Computer Science",
        topic: "Theory of Computation",
      },
      {
        id: 2,
        question: "What does ACID stand for in database transactions?",
        options: [
          "Atomicity, Consistency, Isolation, Durability",
          "Accuracy, Concurrency, Integrity, Data",
          "Atomicity, Concurrency, Isolation, Distribution",
          "Availability, Consistency, Integrity, Durability",
        ],
        correctAnswer: 0,
        explanation: "ACID properties ensure reliable database transactions.",
        subject: "Paper 2 — Computer Science",
        topic: "Database Management",
      },
    ],
  },
];
