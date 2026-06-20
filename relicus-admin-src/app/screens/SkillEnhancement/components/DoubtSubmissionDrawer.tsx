import React, { useState } from "react";
import { X, Image, FileText, Send, Clock, CheckCircle2, User } from "lucide-react";
import { Button } from "../../../components/Button";
import { useSkillsStore, Doubt } from "../store/skills.store";

interface DoubtSubmissionDrawerProps {
  courseId: string;
  onClose: () => void;
}

export const DoubtSubmissionDrawer: React.FC<DoubtSubmissionDrawerProps> = ({ courseId, onClose }) => {
  const [question, setQuestion] = useState("");
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  
  const doubts = useSkillsStore((state) => state.doubts.filter((d) => d.courseId === courseId));
  const addDoubt = useSkillsStore((state) => state.addDoubt);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    addDoubt({
      courseId,
      question: question.trim(),
      screenshotUrl: screenshotName || undefined,
      pdfUrl: pdfName || undefined,
      status: "Pending"
    });

    setQuestion("");
    setScreenshotName(null);
    setPdfName(null);
  };

  const handleSimulateScreenshot = () => {
    setScreenshotName(`screenshot_${Math.floor(Math.random() * 1000)}.png`);
    setPdfName(null);
  };

  const handleSimulatePdf = () => {
    setPdfName(`issue_log_${Math.floor(Math.random() * 1000)}.pdf`);
    setScreenshotName(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="bg-neutral-50 w-full max-w-md h-full shadow-2xl flex flex-col border-l border-neutral-100 animate-slide-in">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex justify-between items-center bg-white">
          <div>
            <span className="text-[9px] font-extrabold text-[#8FBDD7] uppercase tracking-widest block mb-0.5">
              Doubt Support Hub
            </span>
            <h4 className="font-bold text-foreground text-sm">Ask & Track Doubts</h4>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-700 rounded-xl transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Ask a Question Form */}
          <form onSubmit={handleSubmit} className="bg-white p-5 rounded-[1.75rem] border border-neutral-100 shadow-xs space-y-4">
            <h5 className="text-[10px] font-extrabold text-foreground uppercase tracking-wider">
              Ask a New Question
            </h5>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Describe what you are stuck on. Include error details or conceptual gaps..."
              rows={3}
              className="w-full text-xs p-3.5 border border-neutral-100 rounded-2xl bg-neutral-50/50 focus:border-[#1C4966] focus:bg-white transition-all outline-none resize-none"
            />

            {/* Simulating Attachments */}
            <div className="flex items-center justify-between gap-2 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
              <span className="text-[10px] font-bold text-neutral-400">Attach Mock File:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSimulateScreenshot}
                  className={`p-1.5 rounded-lg flex items-center gap-1 text-[10px] font-bold transition-all border ${
                    screenshotName
                      ? "bg-purple-50 border-purple-200 text-purple-600"
                      : "bg-white border-neutral-100 text-neutral-500 hover:bg-neutral-100"
                  }`}
                >
                  <Image className="w-3.5 h-3.5" /> Screenshot
                </button>
                <button
                  type="button"
                  onClick={handleSimulatePdf}
                  className={`p-1.5 rounded-lg flex items-center gap-1 text-[10px] font-bold transition-all border ${
                    pdfName
                      ? "bg-orange-50 border-orange-200 text-orange-600"
                      : "bg-white border-neutral-100 text-neutral-500 hover:bg-neutral-100"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> PDF Log
                </button>
              </div>
            </div>

            {/* Attached file tags indicator */}
            {(screenshotName || pdfName) && (
              <div className="flex justify-between items-center text-[10px] bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100">
                <span className="text-neutral-500 font-bold truncate max-w-[200px]">
                  Attached: {screenshotName || pdfName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setScreenshotName(null);
                    setPdfName(null);
                  }}
                  className="text-red-500 hover:text-red-700 font-bold"
                >
                  Remove
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={!question.trim()}
              className="w-full rounded-xl flex items-center justify-center gap-1.5 py-2.5"
            >
              <Send className="w-3.5 h-3.5" /> Submit Doubt
            </Button>
          </form>

          {/* Doubts History List */}
          <div className="space-y-4">
            <h5 className="text-[10px] font-extrabold text-foreground uppercase tracking-wider px-1">
              Your Doubt Feed ({doubts.length})
            </h5>

            {doubts.length > 0 ? (
              doubts.map((d) => (
                <div key={d.id} className="bg-white border border-neutral-100 rounded-[1.75rem] p-5 shadow-xs space-y-4">
                  {/* Title/Status */}
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold text-neutral-400">
                      {new Date(d.submittedAt).toLocaleDateString()}
                    </span>
                    <span
                      className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        d.status === "Resolved"
                          ? "bg-[#5F8B70]/10 text-[#5F8B70]"
                          : "bg-amber-50 text-amber-500"
                      }`}
                    >
                      {d.status === "Resolved" ? (
                        <>
                          <CheckCircle2 className="w-2.5 h-2.5" /> Resolved
                        </>
                      ) : (
                        <>
                          <Clock className="w-2.5 h-2.5" /> Pending
                        </>
                      )}
                    </span>
                  </div>

                  {/* Question body */}
                  <p className="text-xs text-foreground font-semibold leading-relaxed">
                    {d.question}
                  </p>

                  {/* Attachments view */}
                  {(d.screenshotUrl || d.pdfUrl) && (
                    <div className="flex gap-2">
                      {d.screenshotUrl && (
                        <span className="text-[9px] font-bold bg-purple-50 border border-purple-100 text-purple-600 px-2.5 py-1 rounded-lg">
                          🖼️ {d.screenshotUrl}
                        </span>
                      )}
                      {d.pdfUrl && (
                        <span className="text-[9px] font-bold bg-orange-50 border border-orange-100 text-orange-600 px-2.5 py-1 rounded-lg">
                          📄 {d.pdfUrl}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Mentor responses feed */}
                  {d.responses.length > 0 ? (
                    <div className="border-t border-neutral-100 pt-4 space-y-3 bg-neutral-50/50 rounded-xl p-3">
                      {d.responses.map((resp, rIdx) => (
                        <div key={rIdx} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm shrink-0">{resp.avatar}</span>
                            <span className="text-[10px] font-black text-foreground">{resp.author}</span>
                            <span className="text-[8px] text-neutral-400 ml-auto">
                              {new Date(resp.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 leading-relaxed font-medium pl-6">
                            {resp.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-t border-neutral-100 pt-3 text-center text-[10px] text-neutral-400">
                      Waiting for mentor response... (Simulated to load in 4 seconds)
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-neutral-400 font-medium bg-neutral-100/50 rounded-2xl">
                No doubts posted yet. Use the form above if you get stuck.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
