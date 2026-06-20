import React, { useState, useMemo } from "react";
import { Video, Clock, MessageSquare, Hand, Send, Play, Users, Mic, MicOff, VideoOff, PhoneOff, Award, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ExamType } from "../types/exam.types";
import { useCoachingStore } from "../store/coaching.store";

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  isMe?: boolean;
}

export const LiveClassesTab: React.FC<{ examType: ExamType }> = React.memo(({ examType }) => {
  const [inClassroom, setInClassroom] = useState(false);
  
  // Audio/Video control states
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);

  // Chat panel states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "1", sender: "Faculty (Physics)", message: "Welcome everyone! Today we will discuss wave optics and diffraction.", timestamp: "10:00 AM" },
    { id: "2", sender: "Rahul", message: "Hello Sir! Will we get notes for this?", timestamp: "10:01 AM" },
    { id: "3", sender: "Faculty (Physics)", message: "Yes Rahul, PDF notes will be available in the Chapters tab after class.", timestamp: "10:02 AM" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  // Poll state
  const [showPoll, setShowPoll] = useState(true);
  const [pollVoted, setPollVoted] = useState<number | null>(null);
  const pollData = {
    question: "Which wave theory explains the phenomenon of diffraction?",
    options: ["Newton's Corpuscular Theory", "Huygens' Wave Theory", "Max Planck's Quantum Theory", "Rutherford Model"],
    votes: [12, 65, 18, 5],
  };

  // Live store selector
  const liveClasses = useCoachingStore((state) => state.liveClasses);

  const upcomingClasses = useMemo(() => {
    const list = liveClasses.filter(
      (l) => (l.exam_id === examType || l.examId === examType) && l.status === "scheduled"
    );
    if (list.length === 0) {
      return [
        { id: "c-1", subject: "Chemistry", topic: "Organic Reactions - Electrophiles", time: "Today, 5:30 PM", type: "Upcoming" },
        { id: "c-2", subject: "Mathematics", topic: "Calculus - Indefinite Integrals", time: "Tomorrow, 11:30 AM", type: "Upcoming" },
      ];
    }
    return list.map((l) => ({
      id: l.id,
      subject: l.subject_id === "math" ? "Mathematics" : l.subject_id === "phys" ? "Physics" : "Chemistry",
      topic: l.topic,
      time: new Date(l.scheduled_time || l.scheduledTime).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }),
      type: "Upcoming",
    }));
  }, [liveClasses, examType]);

  const pastRecordedClasses = useMemo(() => {
    const list = liveClasses.filter(
      (l) => (l.exam_id === examType || l.examId === examType) && l.status === "recorded"
    );
    if (list.length === 0) {
      return [
        { id: "rec-1", subject: "Physics", topic: "Electrostatics - Coulomb's Law", duration: "1 hr 12 mins", date: "June 4, 2026" },
        { id: "rec-2", subject: "Chemistry", topic: "Atomic Structure - Quantum Numbers", duration: "58 mins", date: "June 3, 2026" },
        { id: "rec-3", subject: "Mathematics", topic: "Algebra - Complex Numbers", duration: "1 hr 30 mins", date: "June 1, 2026" },
      ];
    }
    return list.map((l) => ({
      id: l.id,
      subject: l.subject_id === "math" ? "Mathematics" : l.subject_id === "phys" ? "Physics" : "Chemistry",
      topic: l.topic,
      duration: `${l.duration || 60} mins`,
      date: new Date(l.scheduled_time || l.scheduledTime).toLocaleDateString(),
    }));
  }, [liveClasses, examType]);

  const ongoingClass = useMemo(() => {
    return liveClasses.find(
      (l) => (l.exam_id === examType || l.examId === examType) && l.status === "ongoing"
    );
  }, [liveClasses, examType]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sender: "You",
      message: newMessage,
      timestamp: new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
      isMe: true,
    };
    setChatMessages((prev) => [...prev, msg]);
    setNewMessage("");
  };

  const handleVotePoll = (optIdx: number) => {
    setPollVoted(optIdx);
  };

  return (
    <div className="flex flex-col h-full bg-neutral-50/50">
      <AnimatePresence mode="wait">
        {!inClassroom ? (
          /* Main Tab list view */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 space-y-6 flex-1 overflow-y-auto"
          >
            {/* Ongoing Class Banner */}
            <div>
              <h3 className="text-base font-extrabold text-foreground mb-3 px-1">Ongoing Classes</h3>
              <div className="p-5 bg-gradient-to-br from-red-50 to-orange-50/30 border border-red-150 rounded-[2rem] shadow-xs flex flex-col justify-between">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <span className="bg-red-500 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider animate-pulse inline-block mb-1.5">
                      Live Now
                    </span>
                    <h4 className="font-extrabold text-foreground text-base leading-tight mb-1">
                      {ongoingClass ? ongoingClass.topic : "Physics - Wave Optics & Diffraction"}
                    </h4>
                    <p className="text-xs text-neutral-500">
                      {ongoingClass 
                        ? `Subject: ${ongoingClass.subject_id === "math" ? "Mathematics" : ongoingClass.subject_id === "phys" ? "Physics" : "Chemistry"}`
                        : "Instructor: Dr. Amit Sharma"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/80 border border-neutral-100 px-2 py-1 rounded-full text-[10px] text-neutral-500 font-bold shrink-0">
                    <Users className="w-3.5 h-3.5" />
                    <span>{ongoingClass ? "85 active" : "145 active"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <Clock className="w-4 h-4 text-red-500" />
                    <span>Started 10 mins ago</span>
                  </div>
                  <button
                    onClick={() => setInClassroom(true)}
                    className="flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-full shadow-xs hover:shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    Join Classroom <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Upcoming Classes */}
            <div>
              <h3 className="text-base font-extrabold text-foreground mb-3 px-1">Scheduled Live Classes</h3>
              <div className="space-y-3">
                {upcomingClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="p-4 bg-white border border-neutral-100 rounded-[2rem] shadow-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl flex items-center justify-center shrink-0">
                        <CalendarIcon />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground leading-snug">{cls.topic}</h4>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{cls.subject} • {cls.time}</p>
                      </div>
                    </div>
                    <button className="px-3.5 py-1.5 text-[10px] font-bold text-primary hover:bg-neutral-50 border border-neutral-150 rounded-full transition-colors cursor-pointer shrink-0">
                      Remind Me
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recorded classes list */}
            <div>
              <h3 className="text-base font-extrabold text-foreground mb-3 px-1">Recorded Sessions</h3>
              <div className="space-y-3">
                {pastRecordedClasses.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 bg-white border border-neutral-100 rounded-[2rem] shadow-xs flex items-center justify-between cursor-pointer group hover:border-[#1C4966]/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                      <div className="w-10 h-10 bg-neutral-50 border border-neutral-100/30 rounded-xl flex items-center justify-center text-neutral-400 shrink-0 group-hover:bg-[#1C4966]/5 transition-colors">
                        <Play className="w-4 h-4 group-hover:text-primary transition-colors fill-current" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {rec.topic}
                        </h4>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{rec.subject} • {rec.duration} • {rec.date}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* Live Webrtc conferencing Classroom view */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col h-full bg-neutral-900 text-white overflow-hidden relative"
          >
            {/* Main Video call stream panel */}
            <div className="flex-1 relative flex items-center justify-center p-4">
              {isVideoOff ? (
                <div className="flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-20 h-20 bg-neutral-800 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-400 text-3xl font-bold">
                    T
                  </div>
                  <span className="text-sm font-semibold text-neutral-400">Your camera is turned off</span>
                </div>
              ) : (
                <div className="w-full h-full max-w-xl aspect-video bg-neutral-800 rounded-2xl overflow-hidden relative border border-neutral-800 shadow-2xl flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                  {/* Instructor name */}
                  <span className="absolute bottom-4 left-4 z-20 text-xs font-bold bg-black/40 border border-neutral-700/30 px-3 py-1 rounded-full backdrop-blur-xs">
                    Dr. Amit Sharma (Faculty)
                  </span>

                  {/* WebRTC Video Mockup container */}
                  <div className="text-center text-xs text-neutral-400 z-10 flex flex-col items-center gap-2">
                    <Video className="w-10 h-10 text-red-500 animate-pulse" />
                    <span className="font-bold tracking-wider uppercase">Live Classroom Stream</span>
                    <span className="text-[10px] text-neutral-500">Integrating with LiveKit / Agora SDKs</span>
                  </div>

                  {/* User self-view mini viewport */}
                  {!isVideoOff && (
                    <div className="absolute top-4 right-4 w-28 h-20 bg-neutral-950 rounded-xl border border-neutral-700 overflow-hidden shadow-md flex items-center justify-center z-20">
                      <span className="text-[9px] text-neutral-500 font-bold">Self Camera</span>
                    </div>
                  )}
                </div>
              )}

              {/* Hand Raise Banner */}
              {isHandRaised && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-yellow-500 border border-yellow-400 text-neutral-950 px-4.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold z-30 shadow-md">
                  <Hand className="w-4 h-4 fill-current" />
                  <span>Your hand is raised (Instructor notified)</span>
                </div>
              )}
            </div>

            {/* Bottom Stream controls bar */}
            <div className="bg-neutral-950/90 border-t border-neutral-850 p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                {/* Hand Raise */}
                <button
                  onClick={() => setIsHandRaised(!isHandRaised)}
                  className={`p-3 rounded-full transition-all cursor-pointer ${
                    isHandRaised 
                      ? "bg-yellow-500 text-neutral-950 hover:bg-yellow-600" 
                      : "bg-neutral-800 text-neutral-300 hover:bg-neutral-750"
                  }`}
                >
                  <Hand className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* Audio Toggle */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3.5 rounded-full transition-all cursor-pointer ${
                    isMuted 
                      ? "bg-red-500 text-white hover:bg-red-600" 
                      : "bg-neutral-800 text-neutral-300 hover:bg-neutral-750"
                  }`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Video Toggle */}
                <button
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`p-3.5 rounded-full transition-all cursor-pointer ${
                    isVideoOff 
                      ? "bg-red-500 text-white hover:bg-red-600" 
                      : "bg-neutral-800 text-neutral-300 hover:bg-neutral-750"
                  }`}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>

                {/* Disconnect Classroom */}
                <button
                  onClick={() => {
                    setInClassroom(false);
                    setIsHandRaised(false);
                  }}
                  className="p-3.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all cursor-pointer active:scale-95"
                >
                  <PhoneOff className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPoll(!showPoll)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    showPoll 
                      ? "bg-white text-neutral-900 border-white" 
                      : "bg-neutral-800 text-neutral-300 border-neutral-700"
                  }`}
                >
                  Poll
                </button>
              </div>
            </div>

            {/* Chat sidebar panel overlay */}
            <div className="absolute bottom-20 right-4 w-72 h-[350px] bg-neutral-950/95 border border-neutral-850 rounded-[2rem] flex flex-col overflow-hidden shadow-2xl z-30">
              <div className="p-3 border-b border-neutral-850 flex items-center justify-between shrink-0">
                <span className="text-xs font-bold flex items-center gap-1">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  Classroom Live Chat
                </span>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`max-w-[85%] ${msg.isMe ? "ml-auto text-right" : ""}`}>
                    <span className="text-[9px] text-neutral-500 block mb-0.5 font-semibold">
                      {msg.sender} • {msg.timestamp}
                    </span>
                    <div className={`p-2.5 rounded-2xl text-xs inline-block text-left leading-relaxed ${
                      msg.isMe ? "bg-primary text-white" : "bg-neutral-850 text-neutral-200"
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendChat} className="p-2 border-t border-neutral-850 flex gap-1 bg-neutral-950 shrink-0">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Send class message..."
                  className="flex-1 px-3 py-2 text-xs text-white bg-neutral-900 border border-neutral-800 rounded-full focus:outline-none placeholder-neutral-500"
                />
                <button
                  type="submit"
                  className="p-2 bg-primary hover:bg-primary/90 text-white rounded-full transition-colors cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Live Poll Overlay drawer popup */}
            {showPoll && (
              <div className="absolute top-4 left-4 w-72 bg-neutral-950/95 border border-neutral-850 rounded-[2rem] p-4 shadow-2xl z-30">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Live Classroom Poll
                  </span>
                  <button onClick={() => setShowPoll(false)} className="text-neutral-500 hover:text-neutral-300 font-bold text-xs shrink-0 cursor-pointer">
                    Hide
                  </button>
                </div>
                <h5 className="text-xs font-bold text-neutral-100 leading-relaxed mb-3">
                  {pollData.question}
                </h5>

                <div className="space-y-2">
                  {pollData.options.map((opt, oIdx) => {
                    const isSelected = pollVoted === oIdx;
                    const totalVotes = pollData.votes.reduce((acc, c) => acc + c, 0);
                    const percent = Math.round((pollData.votes[oIdx] / totalVotes) * 100);

                    return (
                      <div key={oIdx} className="relative">
                        {pollVoted !== null ? (
                          /* Poll results view */
                          <div className={`p-2.5 rounded-xl border text-xs overflow-hidden ${
                            isSelected ? "border-primary bg-primary/10" : "border-neutral-850 bg-neutral-900/40"
                          }`}>
                            <div
                              className="absolute left-0 top-0 bottom-0 bg-white/5 transition-all duration-1000"
                              style={{ width: `${percent}%` }}
                            />
                            <div className="relative flex justify-between font-semibold">
                              <span className="truncate pr-4 text-neutral-300">{opt}</span>
                              <span className="text-primary">{percent}%</span>
                            </div>
                          </div>
                        ) : (
                          /* Votable Options */
                          <button
                            onClick={() => handleVotePoll(oIdx)}
                            className="w-full text-left p-2.5 rounded-xl border border-neutral-850 bg-neutral-900/60 hover:bg-neutral-850 hover:border-neutral-700 transition-colors text-xs text-neutral-300 leading-snug cursor-pointer"
                          >
                            {opt}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Helper component
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

LiveClassesTab.displayName = "LiveClassesTab";
