export type TabType =
  | "overview"
  | "chapters"
  | "live"
  | "tests"
  | "doubt"
  | "analytics"
  | "notifications"
  | "bookmarks";

export interface TabConfig {
  id: TabType;
  label: string;
  icon: string; // lucide icon identifier
}

export const TABS: TabConfig[] = [
  { id: "overview", label: "Overview", icon: "Home" },
  { id: "chapters", label: "Chapters", icon: "BookOpen" },
  { id: "live", label: "Live Classes", icon: "Video" },
  { id: "tests", label: "Mock Tests", icon: "ClipboardList" },
  { id: "doubt", label: "Doubt Desk", icon: "MessageSquare" },
  { id: "analytics", label: "Analytics", icon: "BarChart" },
  { id: "notifications", label: "Notifications", icon: "Bell" },
  { id: "bookmarks", label: "Bookmarks", icon: "Bookmark" },
];
