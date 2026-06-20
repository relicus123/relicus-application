import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, MoreVertical, ShieldCheck } from "lucide-react";

export function VideoCall() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [duration, setDuration] = useState("12:34");

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
        <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 bg-danger rounded-full animate-pulse" />
          <span className="text-white font-semibold text-sm">{duration}</span>
        </div>
        <button className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center">
          <MoreVertical className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <div className="text-center">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-5xl text-white font-bold">SJ</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">Dr. Sarah Johnson</h3>
            <p className="text-white/80">Clinical Psychologist</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-6 right-6 w-28 h-40 bg-gray-800 rounded-2xl border-2 border-white/20 overflow-hidden shadow-2xl"
        >
          <div className="w-full h-full bg-gradient-to-br from-primary/50 to-secondary/50 flex items-center justify-center">
            <span className="text-3xl text-white font-bold">You</span>
          </div>
        </motion.div>

        <div className="absolute top-20 left-6 bg-success/90 backdrop-blur-sm px-3 py-2 rounded-full flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-white" />
          <span className="text-white text-xs font-medium">End-to-end encrypted</span>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-t from-black to-transparent">
        <div className="flex justify-center items-center gap-4 mb-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isMuted ? "bg-danger" : "bg-white/20 backdrop-blur-md"
            }`}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              !isVideoOn ? "bg-danger" : "bg-white/20 backdrop-blur-md"
            }`}
          >
            {isVideoOn ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            onClick={() => navigate("/app/sessions")}
            className="w-20 h-20 bg-danger rounded-full flex items-center justify-center shadow-2xl"
          >
            <PhoneOff className="w-8 h-8 text-white" />
          </button>

          <button className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
          <h4 className="text-white font-semibold mb-2 text-sm">Session Notes</h4>
          <p className="text-white/70 text-xs">
            Your therapist may take notes during the session to provide better care.
          </p>
        </div>
      </div>
    </div>
  );
}
