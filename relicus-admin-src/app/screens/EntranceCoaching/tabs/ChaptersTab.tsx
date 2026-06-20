import React, { useState, useMemo, useEffect } from "react";
import { Play, FileText, CheckSquare, FileQuestion, ArrowLeft, Bookmark, Check, X, RotateCcw, AlertTriangle, Upload, Eye } from "lucide-react";
import { motion } from "motion/react";
import ReactPlayer from "react-player";
import { Document, Page, pdfjs } from "react-pdf";
import { ExamType } from "../types/exam.types";
import { Chapter, RecordedVideo, Note, Assignment, PracticeQuestion } from "../types/chapter.types";
import { useCoachingStore } from "../store/coaching.store";
import { progressService } from "../services/progress.service";
import { bookmarkService } from "../services/bookmark.service";
import { recentActivityService } from "../services/recentActivity.service";
import { getExamDataset } from "../data/examRegistry";
import { ProgressRing } from "../components/ProgressRing";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";

// Configure pdfjs worker CDN for react-pdf compatibility under Vite
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ChaptersTabProps {
  examType: ExamType;
  extraData?: { subjectId?: string; chapterId?: string; resourceTab?: string };
  onClearExtraData?: () => void;
}

type ResourceSubTab = "videos" | "notes" | "assignments" | "practice";

export const ChaptersTab: React.FC<ChaptersTabProps> = React.memo(({
  examType,
  extraData,
  onClearExtraData,
}) => {
  const store = useCoachingStore();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [resourceTab, setResourceTab] = useState<ResourceSubTab>("videos");

  // Video Player state
  const [playingVideo, setPlayingVideo] = useState<RecordedVideo | null>(null);
  const [videoPlayTime, setVideoPlayTime] = useState(0);

  // PDF Viewer state
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [pdfPages, setPdfPages] = useState<number | null>(null);
  const [pdfLoadError, setPdfLoadError] = useState(false);

  // Quiz interactive state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showQuizExpl, setShowQuizExpl] = useState<Record<number, boolean>>({});

  // Assignment upload simulator
  const [uploadingAssignmentId, setUploadingAssignmentId] = useState<string | null>(null);
  const [assignmentSuccess, setAssignmentSuccess] = useState<Record<string, boolean>>({});

  // ── Central registry lookup — no switch needed ────────────────────────────
  const exams = useCoachingStore((state) => state.exams);
  const dataset = useMemo(() => {
    const { subjects, chapters } = getExamDataset(examType);
    return { subjects, chapters };
  }, [examType, exams]);

  // Set default subject on load
  useEffect(() => {
    if (dataset.subjects.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(dataset.subjects[0].id);
    }
  }, [dataset, selectedSubjectId]);

  // Handle incoming search query navigations
  useEffect(() => {
    if (extraData?.subjectId) {
      setSelectedSubjectId(extraData.subjectId);
      if (extraData.chapterId) {
        setSelectedChapterId(extraData.chapterId);
        if (extraData.resourceTab) {
          setResourceTab(extraData.resourceTab as ResourceSubTab);
        }
      }
      onClearExtraData?.();
    }
  }, [extraData, onClearExtraData]);

  // Subject chapters filter
  const currentChapters = useMemo(() => {
    return dataset.chapters
      .filter((ch) => ch.subjectId === selectedSubjectId)
      .map((ch) => {
        // Calculate progress dynamically
        const totalVids = ch.videos.length;
        const watchedVids = ch.videos.filter(v => store.videoProgress[v.id]?.isWatched).length;
        const progress = totalVids > 0 ? Math.round((watchedVids / totalVids) * 100) : 0;
        return { ...ch, progress };
      });
  }, [selectedSubjectId, dataset, store.videoProgress]);

  const selectedChapter = useMemo(() => {
    return currentChapters.find((ch) => ch.id === selectedChapterId);
  }, [selectedChapterId, currentChapters]);

  const handleChapterClick = (ch: Chapter) => {
    setSelectedChapterId(ch.id);
    setResourceTab("videos");
    // Track recent activity
    recentActivityService.track({
      id: ch.id,
      type: "chapter",
      title: ch.name,
      subtitle: `Opened chapter module`,
      path: "/app/coaching",
      examType,
    });
  };

  // Video Handlers
  const handlePlayVideo = (vid: RecordedVideo) => {
    setPlayingVideo(vid);
    recentActivityService.track({
      id: vid.id,
      type: "video",
      title: vid.title,
      subtitle: `Watched lecture`,
      path: "/app/coaching",
      examType,
    });
  };

  const handleVideoProgress = (progressData: { played: number; playedSeconds: number }) => {
    if (!playingVideo) return;
    
    setVideoPlayTime(progressData.playedSeconds);
    const playedPercent = Math.round(progressData.played * 100);
    const isWatched = playedPercent >= 90; // consider watched if 90% completed

    // Throttle store update slightly
    const currentProgress = store.videoProgress[playingVideo.id]?.progress || 0;
    if (playedPercent > currentProgress || isWatched) {
      progressService.saveVideoProgress(playingVideo.id, Math.min(100, playedPercent), isWatched);
    }
  };

  // PDF Handlers
  const handleViewNote = (note: Note) => {
    setViewingNote(note);
    setPdfLoadError(false);
    recentActivityService.track({
      id: note.id,
      type: "note",
      title: note.title,
      subtitle: `Read revision notes`,
      path: "/app/coaching",
      examType,
    });
  };

  const handleBookmarkNote = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    if (bookmarkService.isBookmarked(note.id)) {
      bookmarkService.remove(note.id);
    } else {
      bookmarkService.add({
        id: note.id,
        type: "note",
        title: note.title,
        subtitle: `Revision Note in ${selectedChapter?.name || ""}`,
        examType,
        path: "/app/coaching",
      });
    }
  };

  // Quiz Options click
  const handleQuizOption = (qId: number, optIdx: number) => {
    if (quizAnswers[qId] !== undefined) return; // already answered
    setQuizAnswers((prev) => ({ ...prev, [qId]: optIdx }));
    setShowQuizExpl((prev) => ({ ...prev, [qId]: true }));
  };

  // Assignment Submit simulation
  const handleUploadAssignment = (asgId: string) => {
    setUploadingAssignmentId(asgId);
    setTimeout(() => {
      setUploadingAssignmentId(null);
      setAssignmentSuccess((prev) => ({ ...prev, [asgId]: true }));
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6">
      {/* 1. Subject list filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {dataset.subjects.map((sub) => {
          const isActive = selectedSubjectId === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => {
                setSelectedSubjectId(sub.id);
                setSelectedChapterId(null); // clear chapter view
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-250 ${
                isActive
                  ? "bg-[#1C4966] text-white shadow-xs"
                  : "bg-white border border-neutral-100 text-neutral-400 hover:bg-neutral-50"
              }`}
            >
              <span className="text-sm">{sub.icon}</span>
              <span>{sub.name}</span>
            </button>
          );
        })}
      </div>

      {/* Chapters view vs Chapter details wrapper */}
      {!selectedChapter ? (
        <div className="space-y-3">
          <h3 className="text-base font-extrabold text-foreground px-1 mb-2">Chapters</h3>
          {currentChapters.length > 0 ? (
            currentChapters.map((ch) => (
              <div
                key={ch.id}
                onClick={() => handleChapterClick(ch)}
                className="flex items-center justify-between p-4 bg-white border border-neutral-100 rounded-[2rem] hover:shadow-md transition-all duration-300 cursor-pointer group"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <h4 className="font-bold text-foreground text-sm leading-tight truncate mb-1 group-hover:text-primary transition-colors">
                    {ch.name}
                  </h4>
                  <p className="text-[10px] text-neutral-400">
                    {ch.videos.length} Lectures • {ch.notes.length} Notes • {ch.practiceQuestions.length} Practice MCQs
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <ProgressRing progress={ch.progress} size={38} strokeWidth={4} colorClass="text-secondary" />
                </div>
              </div>
            ))
          ) : (
            <EmptyState title="No Chapters Found" description="Select another subject to view learning modules." />
          )}
        </div>
      ) : (
        /* Chapter Detail View (Videos, Notes, Assignments, Practice Questions) */
        <div className="space-y-4">
          {/* Back to Chapters */}
          <button
            onClick={() => setSelectedChapterId(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:opacity-80 transition-opacity cursor-pointer mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Chapter List
          </button>

          {/* Chapter header */}
          <div className="bg-gradient-to-r from-neutral-50 to-neutral-100/50 p-5 rounded-[2rem] border border-neutral-100/30">
            <h3 className="text-base font-extrabold text-foreground leading-snug">{selectedChapter.name}</h3>
            <p className="text-xs text-neutral-400 mt-1">Study materials and assignments</p>
          </div>

          {/* Resource Selection tabs */}
          <div className="flex bg-neutral-100/60 p-1 rounded-2xl gap-1 shrink-0">
            {(["videos", "notes", "assignments", "practice"] as ResourceSubTab[]).map((tab) => {
              const isActive = resourceTab === tab;
              const label = tab === "videos" ? "Videos" : tab === "notes" ? "Notes" : tab === "assignments" ? "Assignments" : "Practice";
              return (
                <button
                  key={tab}
                  onClick={() => setResourceTab(tab)}
                  className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    isActive ? "bg-white text-foreground shadow-xs" : "text-neutral-400 hover:text-neutral-600"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Resource rendering views */}
          <div className="space-y-3 pt-2">
            {/* 1. Recorded Videos Tab */}
            {resourceTab === "videos" && (
              selectedChapter.videos.length > 0 ? (
                selectedChapter.videos.map((vid) => {
                  const state = store.videoProgress[vid.id] || { progress: 0, isWatched: false };
                  return (
                    <div
                      key={vid.id}
                      onClick={() => handlePlayVideo(vid)}
                      className="p-4 bg-white border border-neutral-100 rounded-[2rem] shadow-xs flex items-center justify-between cursor-pointer group hover:border-[#8B5CF6]/30 transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          state.isWatched ? "bg-green-50 text-success" : "bg-purple-50 text-purple-500"
                        }`}>
                          <Play className="w-5 h-5 fill-current" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {vid.title}
                          </h5>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-neutral-400">
                            <span>{vid.duration}</span>
                            <span>•</span>
                            <span className={state.isWatched ? "text-success font-bold" : ""}>
                              {state.isWatched ? "Completed" : `${state.progress}% watched`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ArrowLeft className="w-4 h-4 rotate-180 text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  );
                })
              ) : (
                <EmptyState title="No Lectures Found" description="Recorded classes will be available shortly." icon={Play} />
              )
            )}

            {/* 2. Revision Notes Tab */}
            {resourceTab === "notes" && (
              selectedChapter.notes.length > 0 ? (
                selectedChapter.notes.map((note) => {
                  const isBookmarked = bookmarkService.isBookmarked(note.id);
                  return (
                    <div
                      key={note.id}
                      onClick={() => handleViewNote(note)}
                      className="p-4 bg-white border border-neutral-100 rounded-[2rem] shadow-xs flex items-center justify-between cursor-pointer group hover:border-[#F97316]/30 transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                        <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {note.title}
                          </h5>
                          <span className="text-[10px] text-neutral-400 block mt-0.5">{note.size}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => handleBookmarkNote(note, e)}
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
                <EmptyState title="No Notes Found" description="Downloadable sheets will be posted soon." icon={FileText} />
              )
            )}

            {/* 3. Assignments Tab */}
            {resourceTab === "assignments" && (
              selectedChapter.assignments.length > 0 ? (
                selectedChapter.assignments.map((asg) => {
                  const isSubmitted = assignmentSuccess[asg.id];
                  const displayStatus = isSubmitted ? "submitted" : asg.status;
                  return (
                    <div
                      key={asg.id}
                      className="p-4 bg-white border border-neutral-100 rounded-[2rem] shadow-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          displayStatus === "evaluated" 
                            ? "bg-green-50 text-success" 
                            : displayStatus === "submitted" 
                            ? "bg-blue-50 text-blue-500" 
                            : "bg-neutral-50 text-neutral-400"
                        }`}>
                          <CheckSquare className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-bold text-foreground truncate">{asg.title}</h5>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            {displayStatus === "evaluated" 
                              ? `Score: ${asg.score}` 
                              : `Due: ${asg.dueDate} • ${displayStatus === "submitted" ? "Submitted" : "Pending"}`}
                          </p>
                        </div>
                      </div>

                      {displayStatus === "pending" && (
                        <button
                          onClick={() => handleUploadAssignment(asg.id)}
                          disabled={uploadingAssignmentId === asg.id}
                          className="whitespace-nowrap shrink-0 flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold text-white bg-primary rounded-full hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingAssignmentId === asg.id ? "Uploading..." : "Submit"}</span>
                        </button>
                      )}

                      {displayStatus === "submitted" && (
                        <span className="whitespace-nowrap shrink-0 text-[10px] text-blue-500 font-bold bg-blue-50/50 border border-blue-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Received
                        </span>
                      )}

                      {displayStatus === "evaluated" && (
                        <span className="whitespace-nowrap shrink-0 text-[10px] text-success font-bold bg-green-50/50 border border-green-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Graded
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <EmptyState title="No Assignments" description="Check back later for homework tasks." icon={CheckSquare} />
              )
            )}

            {/* 4. Practice Questions Tab */}
            {resourceTab === "practice" && (
              selectedChapter.practiceQuestions.length > 0 ? (
                <div className="space-y-4">
                  {selectedChapter.practiceQuestions.map((q, qIdx) => {
                    const selectedOpt = quizAnswers[q.id];
                    const showExplanation = showQuizExpl[q.id];
                    return (
                      <div
                        key={q.id}
                        className="p-5 bg-white border border-neutral-100 rounded-[2rem] shadow-xs space-y-4"
                      >
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                          Question {qIdx + 1}
                        </span>
                        <p className="text-xs font-bold text-foreground leading-relaxed">
                          {q.question}
                        </p>
                        
                        <div className="space-y-2 pt-1">
                          {q.options.map((opt, oIdx) => {
                            const isCorrect = oIdx === q.correctAnswer;
                            const isSelected = oIdx === selectedOpt;
                            
                            let optStyle = "border-neutral-100 bg-neutral-50/30 hover:border-primary/20";
                            let marker = null;
                            
                            if (selectedOpt !== undefined) {
                              if (isCorrect) {
                                optStyle = "border-green-200 bg-green-50 text-green-700 font-semibold";
                                marker = <Check className="w-3.5 h-3.5 text-success shrink-0" />;
                              } else if (isSelected) {
                                optStyle = "border-red-200 bg-red-50 text-red-700 font-semibold";
                                marker = <X className="w-3.5 h-3.5 text-[#D9534F] shrink-0" />;
                              } else {
                                optStyle = "border-neutral-100 bg-white/20 text-neutral-400 opacity-60";
                              }
                            }

                            return (
                              <button
                                key={oIdx}
                                onClick={() => handleQuizOption(q.id, oIdx)}
                                className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left text-xs transition-all ${optStyle}`}
                                disabled={selectedOpt !== undefined}
                              >
                                <span className="pr-3 leading-snug">{opt}</span>
                                {marker}
                              </button>
                            );
                          })}
                        </div>

                        {showExplanation && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100/50 text-[11px] leading-relaxed"
                          >
                            <span className="font-bold text-foreground block mb-1">Explanation:</span>
                            <p className="text-neutral-500">{q.explanation}</p>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState title="No Practice Tasks" description="Practice sheets will be posted for this chapter." icon={FileQuestion} />
              )
            )}
          </div>
        </div>
      )}

      {/* Video Stream modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden border border-neutral-100 shadow-2xl relative">
            <div className="p-4 border-b border-neutral-100 flex justify-between items-center">
              <h4 className="font-bold text-foreground text-sm truncate max-w-[300px]">
                {playingVideo.title}
              </h4>
              <button
                onClick={() => {
                  setPlayingVideo(null);
                  setVideoPlayTime(0);
                }}
                className="text-neutral-400 hover:text-neutral-600 font-bold text-xs shrink-0 cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              <ReactPlayer
                url={playingVideo.url}
                playing={true}
                controls={true}
                width="100%"
                height="100%"
                onProgress={handleVideoProgress}
                onError={() => console.log("Video playback failed.")}
              />
            </div>
            <div className="p-4 text-center text-xs text-neutral-400">
              Interactive video progress is tracked in real-time.
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer modal */}
      {viewingNote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg h-[80vh] flex flex-col overflow-hidden border border-neutral-100 shadow-2xl relative">
            <div className="p-4 border-b border-neutral-100 flex justify-between items-center shrink-0">
              <h4 className="font-bold text-foreground text-sm truncate max-w-[300px]">
                {viewingNote.title}
              </h4>
              <button
                onClick={() => {
                  setViewingNote(null);
                  setPdfPages(null);
                }}
                className="text-neutral-400 hover:text-neutral-600 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="flex-1 bg-neutral-100 overflow-y-auto p-4 flex flex-col items-center">
              {pdfLoadError ? (
                <ErrorState description="Failed to load PDF file. Review connection or try again." />
              ) : (
                <Document
                  file={viewingNote.pdfUrl}
                  onLoadSuccess={({ numPages }) => setPdfPages(numPages)}
                  onLoadError={() => setPdfLoadError(true)}
                  loading={<div className="text-xs text-neutral-400 animate-pulse mt-10">Loading Document pages...</div>}
                >
                  {Array.from(new Array(pdfPages || 1), (_, index) => (
                    <div key={`page_${index + 1}`} className="shadow-sm border border-neutral-200/50 mb-4 bg-white rounded-lg overflow-hidden">
                      <Page
                        pageNumber={index + 1}
                        width={320} // optimized width for mobile viewport
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    </div>
                  ))}
                </Document>
              )}
            </div>
            <div className="p-4 border-t border-neutral-100 text-center text-[10px] text-neutral-400 shrink-0">
              Note document provided by Relicus Academic Team
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ChaptersTab.displayName = "ChaptersTab";
