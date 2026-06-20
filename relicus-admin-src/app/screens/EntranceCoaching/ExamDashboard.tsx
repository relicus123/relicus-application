import React, { useState, useMemo, useEffect } from "react";
import { ArrowLeft, Home, BookOpen, Video, ClipboardList, FileText, MessageSquare, BarChart, Bell, Bookmark } from "lucide-react";
import { ExamType } from "./types/exam.types";
import { TabType, TABS } from "./constants/tabs";
import { SearchBar } from "./components/SearchBar";
import { EXAM_THEMES } from "./constants/ui";
import { EXAMS } from "./constants/exams";

// Lazy/direct imports for the tabs
import { OverviewTab } from "./tabs/OverviewTab";
import { ChaptersTab } from "./tabs/ChaptersTab";
import { LiveClassesTab } from "./tabs/LiveClassesTab";
import { MockTestsTab } from "./tabs/MockTestsTab";
import { PYQsTab } from "./tabs/PYQsTab";
import { DoubtDeskTab } from "./tabs/DoubtDeskTab";
import { AnalyticsTab } from "./tabs/AnalyticsTab";
import { NotificationsTab } from "./tabs/NotificationsTab";
import { BookmarksTab } from "./tabs/BookmarksTab";

interface ExamDashboardProps {
  examType: ExamType;
  onBack: () => void;
  initialTabOverride?: string | null;
}

export const ExamDashboard: React.FC<ExamDashboardProps> = React.memo(({
  examType,
  onBack,
  initialTabOverride,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>((initialTabOverride as TabType) || "overview");

  useEffect(() => {
    if (initialTabOverride) {
      setActiveTab(initialTabOverride as TabType);
    }
  }, [initialTabOverride]);

  const [tabExtraData, setTabExtraData] = useState<any>(null);

  const theme = EXAM_THEMES[examType];

  const handleSearchNavigation = (tabId: string, extraData?: any) => {
    setActiveTab(tabId as TabType);
    if (extraData) {
      setTabExtraData(extraData);
    }
  };

  const clearTabExtraData = () => setTabExtraData(null);

  const renderActiveTab = () => {
    const props = { examType, extraData: tabExtraData, onClearExtraData: clearTabExtraData };
    
    switch (activeTab) {
      case "overview":
        return <OverviewTab {...props} onNavigate={handleSearchNavigation} />;
      case "chapters":
        return <ChaptersTab {...props} />;
      case "live":
        return <LiveClassesTab {...props} />;
      case "tests":
        return <MockTestsTab {...props} />;
      case "pyqs":
        return <PYQsTab {...props} />;
      case "doubt":
        return <DoubtDeskTab {...props} />;
      case "analytics":
        return <AnalyticsTab {...props} />;
      case "notifications":
        return <NotificationsTab {...props} />;
      case "bookmarks":
        return <BookmarksTab {...props} />;
      default:
        return <OverviewTab {...props} onNavigate={handleSearchNavigation} />;
    }
  };

  // Helper to map tab IDs to icons
  const getTabIcon = (id: TabType, className: string) => {
    switch (id) {
      case "overview":
        return <Home className={className} />;
      case "chapters":
        return <BookOpen className={className} />;
      case "live":
        return <Video className={className} />;
      case "tests":
        return <ClipboardList className={className} />;
      case "pyqs":
        return <FileText className={className} />;
      case "doubt":
        return <MessageSquare className={className} />;
      case "analytics":
        return <BarChart className={className} />;
      case "notifications":
        return <Bell className={className} />;
      case "bookmarks":
        return <Bookmark className={className} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top sticky header */}
      <div className="bg-gradient-to-br from-primary to-secondary p-4 text-white shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer transition-colors hover:bg-white/30"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h2 className="text-lg font-bold leading-tight">
              {EXAMS.find((e) => e.type === examType)?.name || `${examType}`} Preparation
            </h2>
            <p className="text-[10px] text-white/70">Relicus Coaching Program</p>
          </div>
        </div>
        
        {/* Upgraded global search engine */}
        <SearchBar examType={examType} onNavigateToTab={handleSearchNavigation} />
      </div>

      {/* Horizontal scrolling tabs */}
      <div className="flex gap-2 overflow-x-auto px-4 py-2.5 border-b border-neutral-100 bg-white shrink-0 scrollbar-none">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setTabExtraData(null); // Clear search overrides when manually switching tabs
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? `bg-primary text-white shadow-xs`
                  : "bg-neutral-50 text-neutral-400 hover:bg-neutral-100/70 hover:text-neutral-600"
              }`}
            >
              {getTabIcon(tab.id, "w-4 h-4")}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Viewport for active tab content */}
      <div className="flex-1 overflow-y-auto">
        {renderActiveTab()}
      </div>
    </div>
  );
});

ExamDashboard.displayName = "ExamDashboard";
