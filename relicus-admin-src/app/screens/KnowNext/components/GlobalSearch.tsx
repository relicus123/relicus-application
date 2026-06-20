import React, { useState, useMemo } from "react";
import { Search, X, BookOpen, Building2, Award, Map, TrendingUp } from "lucide-react";
import { SearchResult, SearchResultType } from "../types/knowNext.types";
import { CAREERS } from "../constants/careers";
import { COLLEGES } from "../constants/colleges";
import { SCHOLARSHIPS } from "../constants/scholarships";
import { ROADMAPS } from "../constants/roadmaps";
import { INDUSTRIES } from "../constants/industries";

const TYPE_ICONS: Record<SearchResultType, React.ReactNode> = {
  career: <BookOpen className="w-3.5 h-3.5 text-blue-600" />,
  college: <Building2 className="w-3.5 h-3.5 text-green-600" />,
  scholarship: <Award className="w-3.5 h-3.5 text-orange-600" />,
  roadmap: <Map className="w-3.5 h-3.5 text-purple-600" />,
  industry: <TrendingUp className="w-3.5 h-3.5 text-teal-600" />,
};

const TYPE_BG: Record<SearchResultType, string> = {
  career: "bg-blue-50 border-blue-100",
  college: "bg-green-50 border-green-100",
  scholarship: "bg-orange-50 border-orange-100",
  roadmap: "bg-purple-50 border-purple-100",
  industry: "bg-teal-50 border-teal-100",
};

interface GlobalSearchProps {
  onSelectCareer?: (id: string) => void;
  onSelectCollege?: (id: string) => void;
  onSelectScholarship?: (id: string) => void;
  onSelectRoadmap?: (id: string) => void;
  onSelectIndustry?: (id: string) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  onSelectCareer,
  onSelectCollege,
  onSelectScholarship,
  onSelectRoadmap,
  onSelectIndustry,
}) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo((): SearchResult[] => {
    const q = query.toLowerCase().trim();
    if (q.length < 2) return [];

    const out: SearchResult[] = [];

    CAREERS.filter((c) => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q)).slice(0, 5).forEach((c) => {
      out.push({ id: c.id, type: "career", title: c.title, subtitle: `${c.category} · ${c.industry}`, icon: c.icon });
    });

    COLLEGES.filter((c) => c.name.toLowerCase().includes(q) || c.shortName.toLowerCase().includes(q) || c.location.toLowerCase().includes(q)).slice(0, 4).forEach((c) => {
      out.push({ id: c.id, type: "college", title: c.shortName, subtitle: c.location, icon: c.icon });
    });

    SCHOLARSHIPS.filter((s) => s.name.toLowerCase().includes(q) || s.provider.toLowerCase().includes(q)).slice(0, 4).forEach((s) => {
      out.push({ id: s.id, type: "scholarship", title: s.name, subtitle: s.provider, icon: "🎓" });
    });

    ROADMAPS.filter((r) => r.careerTitle.toLowerCase().includes(q)).slice(0, 3).forEach((r) => {
      out.push({ id: r.id, type: "roadmap", title: `${r.careerTitle} Roadmap`, subtitle: r.estimatedDuration, icon: r.icon });
    });

    INDUSTRIES.filter((i) => i.name.toLowerCase().includes(q)).slice(0, 3).forEach((i) => {
      out.push({ id: i.id, type: "industry", title: i.name, subtitle: `${i.growthPercent}% growth · ₹${i.avgSalaryLPA}L avg`, icon: i.icon });
    });

    return out;
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    setQuery("");
    setOpen(false);
    switch (result.type) {
      case "career": onSelectCareer?.(result.id); break;
      case "college": onSelectCollege?.(result.id); break;
      case "scholarship": onSelectScholarship?.(result.id); break;
      case "roadmap": onSelectRoadmap?.(result.id); break;
      case "industry": onSelectIndustry?.(result.id); break;
    }
  };

  return (
    <div className="relative z-40 w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search careers, colleges, scholarships, roadmaps..."
          className="w-full pl-11 pr-10 py-3 text-sm text-foreground bg-white border border-neutral-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1C4966]/20 focus:border-[#1C4966] shadow-sm placeholder-neutral-400 transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setOpen(false); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-100 rounded-[2rem] shadow-xl max-h-80 overflow-y-auto p-2 z-50">
          {results.length > 0 ? (
            <div className="space-y-1">
              {results.map((res) => (
                <button
                  key={`${res.type}-${res.id}`}
                  onMouseDown={() => handleSelect(res)}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-2xl hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${TYPE_BG[res.type]}`}>
                    {TYPE_ICONS[res.type]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{res.title}</p>
                    <p className="text-[10px] text-neutral-400">{res.subtitle}</p>
                  </div>
                  <span className="ml-auto text-[9px] text-neutral-300 capitalize">{res.type}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-xs text-neutral-400">No results for "{query}"</p>
          )}
        </div>
      )}
    </div>
  );
};
