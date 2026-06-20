import React, { useState, useMemo } from "react";
import { Bookmark, Trash2, Video, FileText, FileQuestion, Play, Eye, FilePieChart } from "lucide-react";
import { ExamType } from "../types/exam.types";
import { useCoachingStore, BookmarkItem } from "../store/coaching.store";
import { bookmarkService } from "../services/bookmark.service";
import { EmptyState } from "../components/EmptyState";

// Modal states definitions
import ReactPlayer from "react-player";

interface BookmarksTabProps {
  examType: ExamType;
  extraData?: any;
}

type BookmarkFilter = "all" | "video" | "note" | "pyq";

export const BookmarksTab: React.FC<BookmarksTabProps> = React.memo(({ examType }) => {
  const store = useCoachingStore();
  const [filterType, setFilterType] = useState<BookmarkFilter>("all");
  
  // Modals simulation states
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);
  const [viewingPdfUrl, setViewingPdfUrl] = useState<string | null>(null);
  const [viewingPdfTitle, setViewingPdfTitle] = useState<string | null>(null);

  const bookmarksList = useMemo(() => {
    return store.bookmarks.filter((b) => b.examType === examType);
  }, [store.bookmarks, examType]);

  const filteredBookmarks = useMemo(() => {
    if (filterType === "all") return bookmarksList;
    return bookmarksList.filter((b) => b.type === filterType);
  }, [bookmarksList, filterType]);

  const handleRemoveBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    bookmarkService.remove(id);
  };

  const handleOpenBookmark = (item: BookmarkItem) => {
    if (item.type === "video") {
      // Simulate launching video player
      setPlayingVideoUrl("https://www.w3schools.com/html/mov_bbb.mp4");
    } else if (item.type === "note" || item.type === "pyq") {
      // Simulate launching PDF viewer
      setViewingPdfUrl("https://arxiv.org/pdf/quant-ph/0410100.pdf");
      setViewingPdfTitle(item.title);
    }
  };

  const getBookmarkIconConfig = (type: BookmarkItem["type"]) => {
    switch (type) {
      case "video":
        return {
          icon: <Video className="w-4 h-4" />,
          colorClass: "bg-purple-50 border-purple-100 text-purple-500",
        };
      case "note":
        return {
          icon: <FileText className="w-4 h-4" />,
          colorClass: "bg-orange-50 border-orange-100 text-orange-500",
        };
      case "pyq":
        return {
          icon: <FileQuestion className="w-4 h-4" />,
          colorClass: "bg-indigo-50 border-indigo-100 text-indigo-500",
        };
      default:
        return {
          icon: <Bookmark className="w-4 h-4" />,
          colorClass: "bg-neutral-50 border-neutral-100 text-neutral-400",
        };
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-base font-extrabold text-foreground px-1">Bookmarked Resources</h3>
      </div>

      {/* Filter Horizontal Row */}
      <div className="flex bg-neutral-100 p-1 rounded-2xl gap-1 shrink-0">
        {([
          { id: "all", label: "All" },
          { id: "note", label: "Notes" },
          { id: "video", label: "Lectures" },
          { id: "pyq", label: "PYQs" },
        ] as { id: BookmarkFilter; label: string }[]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              filterType === tab.id
                ? "bg-white text-foreground shadow-xs"
                : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookmarks List */}
      <div className="space-y-4">
        {filteredBookmarks.length > 0 ? (
          filteredBookmarks.map((bookmark) => {
            const config = getBookmarkIconConfig(bookmark.type);
            return (
              <div
                key={bookmark.id}
                onClick={() => handleOpenBookmark(bookmark)}
                className="p-4 bg-white border border-neutral-100 rounded-[2rem] shadow-xs flex items-center justify-between cursor-pointer group hover:border-[#1C4966]/20 transition-all duration-300"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${config.colorClass}`}>
                    {config.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[8px] font-extrabold text-neutral-400 uppercase tracking-widest block leading-none mb-1">
                      {bookmark.type === "pyq" ? "Previous Year Question" : bookmark.type}
                    </span>
                    <h5 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {bookmark.title}
                    </h5>
                    <p className="text-[9px] text-neutral-400 truncate mt-0.5">{bookmark.subtitle}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => handleRemoveBookmark(bookmark.id, e)}
                    className="p-2 rounded-xl text-neutral-300 hover:text-red-500 hover:bg-red-50/50 transition-all cursor-pointer"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Eye className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState
            title="No Bookmarks Found"
            description="Bookmark sheets, questions, or recorded lectures to view them here for quick study revisions."
            icon={Bookmark}
          />
        )}
      </div>

      {/* Embedded Video modal */}
      {playingVideoUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden border border-neutral-100 shadow-2xl relative">
            <div className="p-4 border-b border-neutral-100 flex justify-between items-center shrink-0">
              <h4 className="font-bold text-foreground text-sm">Reviewing Bookmarked Lecture</h4>
              <button
                onClick={() => setPlayingVideoUrl(null)}
                className="text-neutral-400 hover:text-neutral-600 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              <ReactPlayer
                url={playingVideoUrl}
                playing={true}
                controls={true}
                width="100%"
                height="100%"
                onError={() => console.log("Video loading error.")}
              />
            </div>
            <div className="p-4 text-center text-xs text-neutral-400 shrink-0">
              Video lecture launched from bookmark drawer
            </div>
          </div>
        </div>
      )}

      {/* Simple PDF Viewer fallback modal */}
      {viewingPdfUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg h-[75vh] flex flex-col overflow-hidden border border-neutral-100 shadow-2xl relative">
            <div className="p-4 border-b border-neutral-100 flex justify-between items-center shrink-0">
              <h4 className="font-bold text-foreground text-sm truncate max-w-[280px]">
                {viewingPdfTitle}
              </h4>
              <button
                onClick={() => {
                  setViewingPdfUrl(null);
                  setViewingPdfTitle(null);
                }}
                className="text-neutral-400 hover:text-neutral-600 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="flex-1 bg-neutral-50 p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h5 className="font-bold text-foreground text-sm">Downloadable Revision Materials</h5>
                <p className="text-xs text-neutral-500 max-w-[260px] mt-1.5 leading-relaxed">
                  To view details, click open link in new tab or download for full reading view.
                </p>
              </div>
              <a
                href={viewingPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary/95 transition-all"
              >
                Open Document <Play className="w-3 h-3 fill-current rotate-90" />
              </a>
            </div>
            <div className="p-4 border-t border-neutral-100 text-center text-[10px] text-neutral-400 shrink-0">
              PDF review powered by Relicus Coaching Program
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

BookmarksTab.displayName = "BookmarksTab";
