import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, X, BookOpen, Video, FileText, ClipboardList, Book } from "lucide-react";
import { ExamType } from "../types/exam.types";
import { getExamDataset } from "../data/examRegistry";

interface SearchBarProps {
  examType: ExamType;
  onNavigateToTab: (tabId: string, extraData?: any) => void;
}

interface SearchResult {
  id: string;
  type: "subject" | "chapter" | "video" | "note" | "test";
  title: string;
  subtitle: string;
  data: any;
}

export const SearchBar: React.FC<SearchBarProps> = React.memo(({
  examType,
  onNavigateToTab,
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search popup on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // ── Central registry lookup — no switch needed ────────────────────────────
  const dataset = useMemo(() => {
    const { subjects, chapters, mockTests } = getExamDataset(examType);
    return { subjects, chapters, tests: mockTests };
  }, [examType]);

  // Search logic
  const results = useMemo((): SearchResult[] => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();

    const matched: SearchResult[] = [];

    // 1. Search Subjects
    dataset.subjects.forEach((sub) => {
      if (sub.name.toLowerCase().includes(q)) {
        matched.push({
          id: `sub-${sub.id}`,
          type: "subject",
          title: sub.name,
          subtitle: "Subject module",
          data: { subjectId: sub.id },
        });
      }
    });

    // 2. Search Chapters
    dataset.chapters.forEach((ch) => {
      if (ch.name.toLowerCase().includes(q)) {
        matched.push({
          id: `ch-${ch.id}`,
          type: "chapter",
          title: ch.name,
          subtitle: `Chapter in ${dataset.subjects.find((s) => s.id === ch.subjectId)?.name || ""}`,
          data: { subjectId: ch.subjectId, chapterId: ch.id },
        });
      }

      // 3. Search Videos
      ch.videos.forEach((vid) => {
        if (vid.title.toLowerCase().includes(q)) {
          matched.push({
            id: `vid-${vid.id}`,
            type: "video",
            title: vid.title,
            subtitle: `Lecture in Chapter: ${ch.name}`,
            data: { subjectId: ch.subjectId, chapterId: ch.id, resourceTab: "videos", videoId: vid.id },
          });
        }
      });

      // 4. Search Notes
      ch.notes.forEach((note) => {
        if (note.title.toLowerCase().includes(q)) {
          matched.push({
            id: `note-${note.id}`,
            type: "note",
            title: note.title,
            subtitle: `Revision Note in Chapter: ${ch.name}`,
            data: { subjectId: ch.subjectId, chapterId: ch.id, resourceTab: "notes", noteId: note.id },
          });
        }
      });
    });

    // 5. Search Mock Tests
    dataset.tests.forEach((test) => {
      if (test.name.toLowerCase().includes(q)) {
        matched.push({
          id: `test-${test.id}`,
          type: "test",
          title: test.name,
          subtitle: "Practice Test",
          data: { testId: test.id },
        });
      }
    });

    return matched;
  }, [query, dataset]);

  const handleResultClick = (res: SearchResult) => {
    setQuery("");
    setIsOpen(false);
    
    if (res.type === "subject") {
      onNavigateToTab("chapters", { subjectId: res.data.subjectId });
    } else if (res.type === "chapter" || res.type === "video" || res.type === "note") {
      onNavigateToTab("chapters", { 
        subjectId: res.data.subjectId, 
        chapterId: res.data.chapterId,
        resourceTab: res.data.resourceTab 
      });
    } else if (res.type === "test") {
      onNavigateToTab("tests", { testId: res.data.testId });
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "subject":
        return <Book className="w-4 h-4 text-[#5F8B70]" />;
      case "chapter":
        return <BookOpen className="w-4 h-4 text-[#3B82F6]" />;
      case "video":
        return <Video className="w-4 h-4 text-[#8B5CF6]" />;
      case "note":
        return <FileText className="w-4 h-4 text-[#F97316]" />;
      default:
        return <ClipboardList className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div ref={searchRef} className="relative w-full z-40">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search subjects, chapters, notes, videos..."
          className="w-full pl-12 pr-10 py-3 text-sm text-foreground bg-white border border-neutral-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs transition-all placeholder-neutral-400"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-600 rounded-full bg-neutral-100/50 hover:bg-neutral-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-100 rounded-[2rem] shadow-lg max-h-72 overflow-y-auto overflow-x-hidden p-2 z-50">
          {results.length > 0 ? (
            <div className="space-y-1">
              {results.map((res) => (
                <button
                  key={res.id}
                  onClick={() => handleResultClick(res)}
                  className="w-full text-left flex items-start gap-3 p-3 rounded-2xl hover:bg-neutral-50/80 transition-colors cursor-pointer group"
                >
                  <div className="p-2 bg-neutral-50 rounded-xl group-hover:bg-white transition-colors border border-neutral-100/30">
                    {getIcon(res.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-semibold text-foreground truncate">{res.title}</h5>
                    <p className="text-xs text-neutral-400 mt-0.5 truncate">{res.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-neutral-400 text-xs">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
});

SearchBar.displayName = "SearchBar";
