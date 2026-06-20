import React, { useState, useMemo } from "react";
import { FileText, Bookmark, Calendar, BookOpen, Clock, FileQuestion, ArrowRight, Eye, Check, X } from "lucide-react";
import { ExamType } from "../types/exam.types";
import { useCoachingStore } from "../store/coaching.store";
import { bookmarkService } from "../services/bookmark.service";
import { recentActivityService } from "../services/recentActivity.service";
import { EmptyState } from "../components/EmptyState";

interface PYQsTabProps {
  examType: ExamType;
  extraData?: any;
}

interface PYQPaper {
  id: string;
  title: string;
  year: number;
  subjectId: string;
  subjectName: string;
  questionsCount: number;
  duration: number; // in minutes
  pdfUrl: string;
  size: string;
  solutions: {
    qNumber: number;
    question: string;
    answer: string;
    explanation: string;
  }[];
}

const MOCK_PYQS: Record<ExamType, PYQPaper[]> = {
  JEE: [
    {
      id: "jee-pyq-2025-math",
      title: "JEE Main 2025 Mathematics Paper",
      year: 2025,
      subjectId: "math",
      subjectName: "Mathematics",
      questionsCount: 30,
      duration: 60,
      pdfUrl: "https://arxiv.org/pdf/quant-ph/0410100.pdf",
      size: "1.4 MB",
      solutions: [
        { qNumber: 1, question: "If the area bounded by the curve y² = 4ax and its latus rectum is 8a²/3, find the length of the latus rectum.", answer: "Option B (4a)", explanation: "Standard integration yields area = 2 * Integral from 0 to a of 2√(ax) dx = 8a²/3. Hence latus rectum is 4a." },
        { qNumber: 2, question: "Find the general solution of the differential equation dy/dx + y/x = x².", answer: "Option A (xy = x⁴/4 + C)", explanation: "Integrating factor (I.F.) = e^(∫(1/x)dx) = x. Multiplying gives d/dx(xy) = x³. Integrating gives xy = x⁴/4 + C." }
      ]
    },
    {
      id: "jee-pyq-2024-phys",
      title: "JEE Main 2024 Physics Sectional",
      year: 2024,
      subjectId: "phys",
      subjectName: "Physics",
      questionsCount: 30,
      duration: 60,
      pdfUrl: "https://arxiv.org/pdf/quant-ph/0410100.pdf",
      size: "2.1 MB",
      solutions: [
        { qNumber: 1, question: "Calculate the de Broglie wavelength of an electron accelerated through a potential difference of 100V.", answer: "Option C (0.123 nm)", explanation: "λ = 1.227 / √V nm. For V = 100V, λ = 1.227 / 10 = 0.1227 nm ≈ 0.123 nm." }
      ]
    },
    {
      id: "jee-pyq-2023-chem",
      title: "JEE Main 2023 Chemistry Paper 1",
      year: 2023,
      subjectId: "chem",
      subjectName: "Chemistry",
      questionsCount: 30,
      duration: 60,
      pdfUrl: "https://arxiv.org/pdf/quant-ph/0410100.pdf",
      size: "1.8 MB",
      solutions: [
        { qNumber: 1, question: "Which of the following elements has the highest first ionization energy?", answer: "Option D (Nitrogen)", explanation: "Nitrogen has a stable half-filled 2p³ outer shell configuration, requiring more energy to remove an electron compared to Oxygen (2p⁴) or Carbon." }
      ]
    }
  ],
  NEET: [
    {
      id: "neet-pyq-2025-bio",
      title: "NEET 2025 Biology Complete Paper",
      year: 2025,
      subjectId: "bio",
      subjectName: "Biology",
      questionsCount: 90,
      duration: 90,
      pdfUrl: "https://arxiv.org/pdf/quant-ph/0410100.pdf",
      size: "3.2 MB",
      solutions: [
        { qNumber: 1, question: "Which hormone is responsible for apical dominance in plants?", answer: "Option A (Auxin)", explanation: "Auxins produced at the shoot apex promote apical dominance, inhibiting lateral bud growth." }
      ]
    },
    {
      id: "neet-pyq-2024-chem",
      title: "NEET 2024 Organic Chemistry Focus",
      year: 2024,
      subjectId: "chem",
      subjectName: "Chemistry",
      questionsCount: 45,
      duration: 45,
      pdfUrl: "https://arxiv.org/pdf/quant-ph/0410100.pdf",
      size: "1.9 MB",
      solutions: [
        { qNumber: 1, question: "Identify the product in the Aldol condensation of acetaldehyde.", answer: "Option B (3-hydroxybutanal)", explanation: "Two molecules of acetaldehyde react in dilute NaOH to form 3-hydroxybutanal, which dehydrates on heating to crotonaldehyde." }
      ]
    }
  ],
  CUET: [
    {
      id: "cuet-pyq-2025-gen",
      title: "CUET 2025 General Test Paper",
      year: 2025,
      subjectId: "gen",
      subjectName: "General Test",
      questionsCount: 60,
      duration: 60,
      pdfUrl: "https://arxiv.org/pdf/quant-ph/0410100.pdf",
      size: "1.5 MB",
      solutions: [
        { qNumber: 1, question: "If the ratio of two numbers is 3:5 and their LCM is 75, what is their sum?", answer: "Option B (40)", explanation: "Let numbers be 3x and 5x. LCM = 15x = 75 => x = 5. The numbers are 15 and 25. Sum = 40." }
      ]
    }
  ],
  "UGC-NET": [
    {
      id: "net-pyq-2025-p1",
      title: "UGC-NET 2025 Paper 1 General",
      year: 2025,
      subjectId: "paper1",
      subjectName: "General Paper 1",
      questionsCount: 50,
      duration: 60,
      pdfUrl: "https://arxiv.org/pdf/quant-ph/0410100.pdf",
      size: "1.2 MB",
      solutions: [
        { qNumber: 1, question: "Which of the following is a key feature of formative assessment?", answer: "Option C (Continuous feedback)", explanation: "Formative assessments are designed to monitor student learning to provide ongoing feedback that can be used by instructors to improve their teaching." }
      ]
    }
  ],
  GATE: [
    {
      id: "gate-pyq-2025-cs",
      title: "GATE 2025 Computer Science Paper",
      year: 2025,
      subjectId: "cs",
      subjectName: "Computer Science & IT",
      questionsCount: 65,
      duration: 180,
      pdfUrl: "https://arxiv.org/pdf/quant-ph/0410100.pdf",
      size: "2.5 MB",
      solutions: [
        { qNumber: 1, question: "Consider a hash table with 10 slots and collisions resolved by chaining. If 5 keys are inserted, what is the load factor?", answer: "Option A (0.5)", explanation: "Load factor α = n/m = 5/10 = 0.5." }
      ]
    }
  ],
  EAMCET: [
    {
      id: "eamcet-pyq-2025-math",
      title: "EAMCET 2025 Mathematics Section",
      year: 2025,
      subjectId: "math",
      subjectName: "Mathematics",
      questionsCount: 80,
      duration: 90,
      pdfUrl: "https://arxiv.org/pdf/quant-ph/0410100.pdf",
      size: "1.8 MB",
      solutions: [
        { qNumber: 1, question: "The distance from origin to the line 3x + 4y - 10 = 0 is...", answer: "Option B (2)", explanation: "d = |c| / √(a² + b²) = |-10| / √(3² + 4²) = 10 / 5 = 2." }
      ]
    }
  ],
  ICET: [
    {
      id: "icet-pyq-2025-anal",
      title: "ICET 2025 Analytical Ability Paper",
      year: 2025,
      subjectId: "analytical",
      subjectName: "Analytical Ability",
      questionsCount: 75,
      duration: 90,
      pdfUrl: "https://arxiv.org/pdf/quant-ph/0410100.pdf",
      size: "1.4 MB",
      solutions: [
        { qNumber: 1, question: "Complete the pattern: A, C, F, J, ?", answer: "Option D (O)", explanation: "The differences are +2, +3, +4. The next difference is +5. J (10) + 5 = O (15)." }
      ]
    }
  ]
};

export const PYQsTab: React.FC<PYQsTabProps> = React.memo(({ examType }) => {
  const store = useCoachingStore();
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [selectedSubject, setSelectedSubject] = useState<string | "all">("all");
  const [viewingPaper, setViewingPaper] = useState<PYQPaper | null>(null);
  const [expandedSolution, setExpandedSolution] = useState<number | null>(null);

  const pyqsList = useMemo(() => {
    return MOCK_PYQS[examType] || [];
  }, [examType]);

  const uniqueYears = useMemo(() => {
    return Array.from(new Set(pyqsList.map((p) => p.year))).sort((a, b) => b - a);
  }, [pyqsList]);

  const uniqueSubjects = useMemo(() => {
    const subjects = pyqsList.map((p) => ({ id: p.subjectId, name: p.subjectName }));
    const seen = new Set();
    return subjects.filter((s) => {
      const duplicate = seen.has(s.id);
      seen.add(s.id);
      return !duplicate;
    });
  }, [pyqsList]);

  const filteredPYQs = useMemo(() => {
    return pyqsList.filter((paper) => {
      const matchesYear = selectedYear === "all" || paper.year === selectedYear;
      const matchesSub = selectedSubject === "all" || paper.subjectId === selectedSubject;
      return matchesYear && matchesSub;
    });
  }, [pyqsList, selectedYear, selectedSubject]);

  const handleOpenPaper = (paper: PYQPaper) => {
    setViewingPaper(paper);
    setExpandedSolution(null);
    recentActivityService.track({
      id: paper.id,
      type: "note",
      title: paper.title,
      subtitle: `Viewed PYQ solutions`,
      path: "/app/coaching",
      examType,
    });
  };

  const handleBookmarkToggle = (paper: PYQPaper, e: React.MouseEvent) => {
    e.stopPropagation();
    const isBookmarked = bookmarkService.isBookmarked(paper.id);
    if (isBookmarked) {
      bookmarkService.remove(paper.id);
    } else {
      bookmarkService.add({
        id: paper.id,
        type: "pyq",
        title: paper.title,
        subtitle: `Previous Year Questions (${paper.year})`,
        examType,
        path: "/app/coaching",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-base font-extrabold text-foreground px-1">Previous Year Question Bank</h3>
      </div>

      {/* Year & Subject Filter Horizontal Lists */}
      <div className="space-y-3">
        {/* Year Filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedYear("all")}
            className={`px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
              selectedYear === "all"
                ? "bg-[#1C4966] text-white"
                : "bg-white border border-neutral-100 text-neutral-400 hover:bg-neutral-50"
            }`}
          >
            All Years
          </button>
          {uniqueYears.map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                selectedYear === yr
                  ? "bg-[#1C4966] text-white"
                  : "bg-white border border-neutral-100 text-neutral-400 hover:bg-neutral-50"
              }`}
            >
              {yr}
            </button>
          ))}
        </div>

        {/* Subject Filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedSubject("all")}
            className={`px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
              selectedSubject === "all"
                ? "bg-[#5F8B70] text-white"
                : "bg-white border border-neutral-100 text-neutral-400 hover:bg-neutral-50"
            }`}
          >
            All Subjects
          </button>
          {uniqueSubjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubject(sub.id)}
              className={`px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                selectedSubject === sub.id
                  ? "bg-[#5F8B70] text-white"
                  : "bg-white border border-neutral-100 text-neutral-400 hover:bg-neutral-50"
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </div>

      {/* PYQ Papers list */}
      <div className="space-y-4">
        {filteredPYQs.length > 0 ? (
          filteredPYQs.map((paper) => {
            const isBookmarked = bookmarkService.isBookmarked(paper.id);
            return (
              <div
                key={paper.id}
                onClick={() => handleOpenPaper(paper)}
                className="p-4 bg-white border border-neutral-100 rounded-[2rem] shadow-xs flex items-center justify-between cursor-pointer group hover:border-[#1C4966]/20 transition-all duration-350"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {paper.title}
                    </h5>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-400">
                      <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> {paper.year}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5"><BookOpen className="w-3 h-3" /> {paper.subjectName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {paper.duration}m</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => handleBookmarkToggle(paper, e)}
                    className={`p-1.5 rounded-full hover:bg-neutral-100 cursor-pointer ${
                      isBookmarked ? "text-primary" : "text-neutral-300"
                    }`}
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                  <Eye className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            title="No Papers Found"
            description="Adjust your year or subject filters to find previous papers."
            icon={FileText}
          />
        )}
      </div>

      {/* Solutions Viewer Modal */}
      {viewingPaper && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg h-[80vh] flex flex-col overflow-hidden border border-neutral-100 shadow-2xl relative">
            <div className="p-4 border-b border-neutral-100 flex justify-between items-center shrink-0">
              <div>
                <h4 className="font-bold text-foreground text-sm truncate max-w-[280px]">
                  {viewingPaper.title}
                </h4>
                <p className="text-[10px] text-neutral-400">Answer Key & Step-by-Step Solutions</p>
              </div>
              <button
                onClick={() => setViewingPaper(null)}
                className="text-neutral-400 hover:text-neutral-600 font-bold text-xs cursor-pointer px-2 py-1"
              >
                Close
              </button>
            </div>
            
            {/* Scrollable solutions area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-neutral-50/30">
              <div className="p-4 bg-white border border-neutral-100 rounded-2xl flex items-center justify-between text-xs mb-1">
                <span className="text-neutral-400">Reference Material Size:</span>
                <span className="font-bold text-foreground">{viewingPaper.size} PDF</span>
              </div>

              {viewingPaper.solutions.map((sol) => {
                const isExpanded = expandedSolution === sol.qNumber;
                return (
                  <div key={sol.qNumber} className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-xs">
                    <button
                      onClick={() => setExpandedSolution(isExpanded ? null : sol.qNumber)}
                      className="w-full p-4 flex items-start justify-between text-left cursor-pointer hover:bg-neutral-50/50 transition-colors"
                    >
                      <div className="flex-1 pr-3">
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block mb-1">
                          Question {sol.qNumber}
                        </span>
                        <p className="text-xs font-bold text-foreground leading-snug">
                          {sol.question}
                        </p>
                      </div>
                      <ArrowRight className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform mt-1 ${isExpanded ? "rotate-90" : ""}`} />
                    </button>

                    {isExpanded && (
                      <div className="p-4 border-t border-neutral-50 bg-neutral-50/20 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-md">
                            Correct Answer
                          </span>
                          <span className="text-xs font-bold text-success">{sol.answer}</span>
                        </div>
                        <div className="text-[11px] leading-relaxed text-neutral-500">
                          <span className="font-bold text-foreground block mb-0.5">Solution:</span>
                          {sol.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="p-4 border-t border-neutral-100 text-center text-[10px] text-neutral-400 shrink-0 bg-white">
              Mock solutions curated by Relicus Subject Matter Experts
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

PYQsTab.displayName = "PYQsTab";
