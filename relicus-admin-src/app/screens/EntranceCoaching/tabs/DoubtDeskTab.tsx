import React, { useState, useMemo, useRef, useEffect } from "react";
import { MessageSquare, Image, FileText, Mic, Send, Play, Pause, ChevronRight, AlertCircle, Sparkles, CheckCircle2, Trash2 } from "lucide-react";
import { ExamType } from "../types/exam.types";
import { Doubt, DoubtStatus, DoubtResponse } from "../types/doubt.types";
import { useCoachingStore } from "../store/coaching.store";
import { doubtService } from "../services/doubt.service";
import { EmptyState } from "../components/EmptyState";
import { motion } from "motion/react";

interface DoubtDeskTabProps {
  examType: ExamType;
  extraData?: any;
}

export const DoubtDeskTab: React.FC<DoubtDeskTabProps> = React.memo(({ examType }) => {
  const store = useCoachingStore();
  const [activeDoubt, setActiveDoubt] = useState<Doubt | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [hasVoiceFile, setHasVoiceFile] = useState(false);
  const [hasImageFile, setHasImageFile] = useState(false);
  const [hasPdfFile, setHasPdfFile] = useState(false);

  // Voice recording simulation state
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio reply player simulation state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Follow-up chat input
  const [followUpText, setFollowUpText] = useState("");

  const doubtsList = useMemo(() => {
    return doubtService.getDoubts(examType);
  }, [examType, store.doubts]);

  // Handle voice recording simulation
  const startRecording = () => {
    setIsRecording(true);
    setRecordDuration(0);
    timerRef.current = setInterval(() => {
      setRecordDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setHasVoiceFile(true);
  };

  const deleteRecording = () => {
    setHasVoiceFile(false);
    setRecordDuration(0);
  };

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioTimerRef.current) clearInterval(audioTimerRef.current);
    };
  }, []);

  const handleAudioPlayToggle = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      if (audioTimerRef.current) clearInterval(audioTimerRef.current);
    } else {
      setIsPlayingAudio(true);
      audioTimerRef.current = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            if (audioTimerRef.current) clearInterval(audioTimerRef.current);
            return 0;
          }
          return prev + 5;
        });
      }, 300);
    }
  };

  // Submit Doubt Form
  const handleSubmitDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newDoubt: Doubt = {
      id: `doubt-${Math.random().toString(36).substr(2, 9)}`,
      examType,
      title: title.trim(),
      description: description.trim(),
      status: "open",
      createdAt: new Date().toISOString(),
      responses: [],
      imageUrl: hasImageFile ? "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500" : undefined,
      pdfUrl: hasPdfFile ? "https://arxiv.org/pdf/quant-ph/0410100.pdf" : undefined,
      voiceUrl: hasVoiceFile ? "mock-voice-file.mp3" : undefined,
    };

    doubtService.submitDoubt(newDoubt);
    
    // Add activity tracking
    store.addRecentActivity({
      id: newDoubt.id,
      type: "chapter", // Map to chapter as representation
      title: newDoubt.title,
      subtitle: "Raised a new academic doubt",
      path: "/app/coaching",
      examType,
    });

    // Reset Form
    setTitle("");
    setDescription("");
    setSelectedSubject("");
    setHasVoiceFile(false);
    setHasImageFile(false);
    setHasPdfFile(false);
    setRecordDuration(0);

    // Simulate Expert Response after 6 seconds
    const doubtId = newDoubt.id;
    setTimeout(() => {
      const response: DoubtResponse = {
        id: `res-${Math.random().toString(36).substr(2, 9)}`,
        author: "Prof. Rajesh Verma (Relicus Expert)",
        text: `Hello, for your doubt: "${newDoubt.title}", the core concept requires checking the boundary limits of the equation. Please review the step-by-step PDF notes or listen to the explanation.`,
        audioUrl: "https://www.w3schools.com/html/horse.mp3",
        createdAt: new Date().toISOString(),
      };
      doubtService.submitResponse(doubtId, response);
      
      // Send notification
      store.addNotification({
        category: "doubt",
        title: "Doubt Answered",
        message: `Your doubt "${newDoubt.title}" has been reviewed and answered by Prof. Rajesh Verma.`,
        examType,
      });
    }, 6000);
  };

  // Submit follow-up response
  const handleSendFollowUp = () => {
    if (!activeDoubt || !followUpText.trim()) return;
    const response: DoubtResponse = {
      id: `res-${Math.random().toString(36).substr(2, 9)}`,
      author: "Student (You)",
      text: followUpText.trim(),
      createdAt: new Date().toISOString(),
    };
    
    doubtService.submitResponse(activeDoubt.id, response);
    setFollowUpText("");
    
    // Auto-reply simulation
    setTimeout(() => {
      if (!activeDoubt) return;
      const autoReply: DoubtResponse = {
        id: `res-${Math.random().toString(36).substr(2, 9)}`,
        author: "Prof. Rajesh Verma (Relicus Expert)",
        text: "Understood. I recommend reviewing Chapter 2 formulas. Let me know if that makes sense!",
        createdAt: new Date().toISOString(),
      };
      doubtService.submitResponse(activeDoubt.id, autoReply);
    }, 2500);
  };

  // Quick category badges
  const subjectList = useMemo(() => {
    if (examType === "JEE") return ["Mathematics", "Physics", "Chemistry"];
    if (examType === "NEET") return ["Biology", "Physics", "Chemistry"];
    if (examType === "UGC-NET") return ["General Paper 1", "Computer Science"];
    if (examType === "GATE") return ["Engineering Mathematics", "Computer Science & IT", "General Aptitude"];
    if (examType === "EAMCET") return ["Mathematics", "Physics", "Chemistry"];
    if (examType === "ICET") return ["Analytical Ability", "Mathematical Ability", "Communication Ability"];
    return ["General Test", "Numerical Ability", "English"];
  }, [examType]);

  const getStatusStyle = (status: DoubtStatus) => {
    switch (status) {
      case "open":
        return "bg-neutral-50 border-neutral-200 text-neutral-500";
      case "in_review":
        return "bg-yellow-50 border-yellow-200 text-yellow-600";
      case "answered":
        return "bg-green-50 border-green-200 text-green-700 font-semibold";
      case "closed":
        return "bg-neutral-100 border-neutral-300 text-neutral-400";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {!activeDoubt ? (
        <>
          {/* Submit Doubt Section */}
          <div className="bg-white border border-neutral-100 p-6 rounded-[2rem] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-extrabold text-foreground">Ask a Doubt</h3>
            </div>
            
            <form onSubmit={handleSubmitDoubt} className="space-y-3">
              <input
                type="text"
                placeholder="Brief question title (e.g. Limits using L'Hopital's)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl border border-neutral-100 bg-neutral-50/35 text-xs text-foreground placeholder-neutral-400 outline-none focus:border-primary transition-colors"
              />

              <textarea
                placeholder="Explain what concept you are struggling with..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-100 bg-neutral-50/35 text-xs text-foreground placeholder-neutral-400 outline-none focus:border-primary resize-none transition-colors"
              />

              {/* Subject Dropdown */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {subjectList.map((sub) => {
                  const isSel = selectedSubject === sub;
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSelectedSubject(sub)}
                      className={`px-4 py-2 rounded-full text-[10px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
                        isSel ? "bg-[#1C4966] text-white" : "bg-neutral-50 border border-neutral-100 text-neutral-400"
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>

              {/* Attachment options */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  {/* Photo attachment mock */}
                  <button
                    type="button"
                    onClick={() => setHasImageFile(!hasImageFile)}
                    className={`p-2.5 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                      hasImageFile ? "bg-green-50 border-green-200 text-success" : "bg-neutral-50 border-neutral-100 text-neutral-400 hover:bg-neutral-100"
                    }`}
                    title="Attach Image"
                  >
                    <Image className="w-4 h-4" />
                  </button>

                  {/* PDF attachment mock */}
                  <button
                    type="button"
                    onClick={() => setHasPdfFile(!hasPdfFile)}
                    className={`p-2.5 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                      hasPdfFile ? "bg-green-50 border-green-200 text-success" : "bg-neutral-50 border-neutral-100 text-neutral-400 hover:bg-neutral-100"
                    }`}
                    title="Attach Note PDF"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  {/* Mic Voice recorder simulator */}
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className={`p-2.5 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                        hasVoiceFile ? "bg-blue-50 border-blue-200 text-blue-500" : "bg-neutral-50 border-neutral-100 text-neutral-400 hover:bg-neutral-100"
                      }`}
                      title="Record Voice Doubt"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-500 rounded-xl px-3 py-1 text-xs animate-pulse font-bold">
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                      <span>{recordDuration}s</span>
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="text-[10px] font-black underline ml-1 cursor-pointer uppercase"
                      >
                        Stop
                      </button>
                    </div>
                  )}

                  {hasVoiceFile && !isRecording && (
                    <button
                      type="button"
                      onClick={deleteRecording}
                      className="p-1 text-red-400 hover:text-red-600 transition-colors"
                      title="Delete Voice Recording"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-primary rounded-full hover:bg-primary/95 transition-all cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" /> Ask Expert
                </button>
              </div>

              {/* Attachments feedback */}
              {(hasImageFile || hasPdfFile || hasVoiceFile) && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-50">
                  {hasImageFile && (
                    <span className="text-[9px] bg-green-50 border border-green-100 text-success px-2 py-0.5 rounded-md font-semibold">
                      [Attached: question_screenshot.png]
                    </span>
                  )}
                  {hasPdfFile && (
                    <span className="text-[9px] bg-green-50 border border-green-100 text-success px-2 py-0.5 rounded-md font-semibold">
                      [Attached: formula_reference.pdf]
                    </span>
                  )}
                  {hasVoiceFile && (
                    <span className="text-[9px] bg-blue-50 border border-blue-100 text-blue-500 px-2 py-0.5 rounded-md font-semibold">
                      [Voice note: {recordDuration > 0 ? `${recordDuration}s` : "recorded"}]
                    </span>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Doubt List History */}
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-foreground px-1 mb-1">Doubt History</h3>
            {doubtsList.length > 0 ? (
              <div className="space-y-3">
                {doubtsList.map((doubt) => (
                  <div
                    key={doubt.id}
                    onClick={() => {
                      setActiveDoubt(doubt);
                      setIsPlayingAudio(false);
                      setAudioProgress(0);
                    }}
                    className="p-4 bg-white border border-neutral-100 rounded-[2rem] shadow-xs flex items-center justify-between cursor-pointer group hover:border-primary/20 transition-all duration-300"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0 pr-3">
                      <div className="w-10 h-10 bg-neutral-50 border border-neutral-100 text-neutral-400 rounded-xl flex items-center justify-center shrink-0">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {doubt.title}
                          </h4>
                          <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-full uppercase tracking-wider ${getStatusStyle(doubt.status)}`}>
                            {doubt.status === "in_review" ? "review" : doubt.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-1 truncate max-w-[280px]">
                          {doubt.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Doubts Raised"
                description="Submit a question above to get step-by-step assistance from academic professors."
                icon={MessageSquare}
              />
            )}
          </div>
        </>
      ) : (
        /* Doubt Detailed Conversation View */
        <div className="bg-white border border-neutral-100 p-6 rounded-[2rem] shadow-xs space-y-5 flex flex-col min-h-[70vh]">
          {/* Back link */}
          <button
            onClick={() => {
              setActiveDoubt(null);
              setIsPlayingAudio(false);
              setAudioProgress(0);
              if (audioTimerRef.current) clearInterval(audioTimerRef.current);
            }}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:opacity-80 transition-opacity cursor-pointer self-start"
          >
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to History
          </button>

          {/* Doubt details */}
          <div className="space-y-2 border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-foreground">{activeDoubt.title}</h3>
              <span className={`text-[9px] font-bold px-2 py-0.5 border rounded-full uppercase tracking-wider ${getStatusStyle(activeDoubt.status)}`}>
                {activeDoubt.status}
              </span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed bg-neutral-50/50 p-4 rounded-2xl border border-neutral-100/50">
              {activeDoubt.description}
            </p>

            {/* Media attachments inside detail */}
            {(activeDoubt.imageUrl || activeDoubt.pdfUrl || activeDoubt.voiceUrl) && (
              <div className="flex gap-2 flex-wrap pt-2">
                {activeDoubt.imageUrl && (
                  <a
                    href={activeDoubt.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[10px] font-bold text-indigo-500 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl hover:bg-indigo-100/50 transition-colors"
                  >
                    <Image className="w-3.5 h-3.5" /> View Screenshot
                  </a>
                )}
                {activeDoubt.pdfUrl && (
                  <a
                    href={activeDoubt.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-xl hover:bg-orange-100/50 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" /> Reference PDF
                  </a>
                )}
                {activeDoubt.voiceUrl && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-blue-500 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl">
                    <Mic className="w-3.5 h-3.5" /> Student Voice Note
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Expert and student conversation timeline */}
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {activeDoubt.responses.length > 0 ? (
              activeDoubt.responses.map((res) => {
                const isExpert = res.author.includes("Expert") || res.author.includes("Verma");
                return (
                  <div
                    key={res.id}
                    className={`flex flex-col max-w-[85%] ${isExpert ? "self-start text-left" : "ml-auto text-right items-end"}`}
                  >
                    <span className="text-[9px] font-bold text-neutral-400 block mb-1">
                      {res.author} • {new Date(res.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed border ${
                      isExpert
                        ? "bg-gradient-to-br from-indigo-50/80 to-indigo-100/20 border-indigo-100 text-foreground"
                        : "bg-[#5F8B70] border-[#5F8B70]/10 text-white"
                    }`}>
                      <p>{res.text}</p>
                      
                      {/* Premium voice player mock for expert response */}
                      {res.audioUrl && isExpert && (
                        <div className="mt-3.5 bg-white border border-indigo-100 p-3 rounded-xl flex items-center gap-3 shadow-2xs">
                          <button
                            onClick={handleAudioPlayToggle}
                            className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                          >
                            {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                          </button>
                          
                          <div className="flex-1">
                            <span className="text-[9px] font-extrabold text-indigo-500 uppercase tracking-wider block leading-none mb-1">
                              Expert Audio Answer
                            </span>
                            <div className="h-1 bg-neutral-100 rounded-full overflow-hidden mt-1.5 relative">
                              <div
                                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                                style={{ width: `${audioProgress}%` }}
                              />
                            </div>
                          </div>
                          
                          <span className="text-[9px] font-bold text-neutral-400 shrink-0">
                            {isPlayingAudio ? `${Math.round(audioProgress / 10)}s` : "0:10"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-neutral-400 space-y-2">
                <AlertCircle className="w-8 h-8 text-neutral-300" />
                <span className="text-xs font-semibold">Doubt Submitted Successfully</span>
                <p className="text-[10px] text-neutral-400 max-w-[240px]">
                  Academic tutors are drafting a solution. Usually takes under 2 hours.
                </p>
              </div>
            )}
          </div>

          {/* Follow-up input chat drawer */}
          <div className="border-t border-neutral-100 pt-4 flex gap-2 items-center">
            <input
              type="text"
              placeholder="Ask a follow up question..."
              value={followUpText}
              onChange={(e) => setFollowUpText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendFollowUp()}
              className="flex-1 px-4 py-3 rounded-2xl border border-neutral-100 bg-neutral-50/35 text-xs text-foreground placeholder-neutral-400 outline-none focus:border-primary transition-colors"
            />
            <button
              onClick={handleSendFollowUp}
              className="w-10 h-10 bg-[#5F8B70] text-white rounded-2xl flex items-center justify-center shrink-0 cursor-pointer hover:bg-[#5F8B70]/90 transition-colors"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

DoubtDeskTab.displayName = "DoubtDeskTab";
