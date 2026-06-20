import { motion } from "motion/react";
import { Bell, Heart, GraduationCap, Sparkles, BookOpen, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

import { ContinueLearningWidget } from "./SkillEnhancement/components/ContinueLearningWidget";

// Custom meditating person icon to match the design
function MeditationIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="6" r="2" />
      {/* Torso/Shoulders/Arms */}
      <path d="M12 9v4M7 12c1-2 2.5-3 5-3s4 1 5 3" />
      {/* Knees and Legs */}
      <path d="M5 16.5c-1 0-2 1-2 2.5s1 2.5 3 2.5h12c2 0 3-1 3-2.5s-1-2.5-2-2.5" />
      {/* Hands / Gyan Mudra on Knees */}
      <circle cx="6" cy="16.5" r="1.25" />
      <circle cx="18" cy="16.5" r="1.25" />
    </svg>
  );
}

export function Home() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Counselling & Therapy",
      description: "Professional mental health support",
      icon: Heart,
      theme: "purple" as const,
      path: "/app/counselling",
    },
    {
      title: "Entrance Coaching",
      description: "CUET, JEE, NEET preparation",
      icon: GraduationCap,
      theme: "blue" as const,
      path: "/app/coaching",
    },
    {
      title: "Skill Enhancement",
      description: "Professional development courses",
      icon: Sparkles,
      theme: "green" as const,
      path: "/app/skills",
    },
    {
      title: "KnowNext",
      description: "Career guidance, colleges & scholarships",
      icon: BookOpen,
      theme: "orange" as const,
      path: "/app/knowNext",
    },
    {
      title: "Mindfulness",
      description: "Meditation & wellness practices",
      icon: MeditationIcon,
      theme: "teal" as const,
      path: "/app/mindfulness",
    },
  ];

  const themeStyles = {
    purple: {
      bg: "bg-gradient-to-br from-[#FAF5FF] to-[#F5EEFE] border-[#E9D5FF]/60",
      iconBg: "bg-white border border-[#E9D5FF]/30",
      iconColor: "text-[#8B5CF6]",
      titleColor: "text-[#4C1D95]",
      arrowBg: "bg-[#8B5CF6] hover:bg-[#7C3AED]",
    },
    blue: {
      bg: "bg-gradient-to-br from-[#F0F7FF] to-[#EDF5FE] border-[#BFDBFE]/60",
      iconBg: "bg-white border border-[#BFDBFE]/30",
      iconColor: "text-[#3B82F6]",
      titleColor: "text-[#1E3A8A]",
      arrowBg: "bg-[#3B82F6] hover:bg-[#2563EB]",
    },
    green: {
      bg: "bg-gradient-to-br from-[#ECFDF5] to-[#EBFBF2] border-[#A7F3D0]/60",
      iconBg: "bg-white border border-[#A7F3D0]/30",
      iconColor: "text-[#10B981]",
      titleColor: "text-[#065F46]",
      arrowBg: "bg-[#10B981] hover:bg-[#059669]",
    },
    orange: {
      bg: "bg-gradient-to-br from-[#FFF7ED] to-[#FFF1E5] border-[#FED7AA]/60",
      iconBg: "bg-white border border-[#FED7AA]/30",
      iconColor: "text-[#F97316]",
      titleColor: "text-[#7C2D12]",
      arrowBg: "bg-[#F97316] hover:bg-[#EA580C]",
    },
    teal: {
      bg: "bg-gradient-to-br from-[#F0FDFA] to-[#E6F9F9] border-[#99F6E4]/60",
      iconBg: "bg-white border border-[#99F6E4]/30",
      iconColor: "text-[#0D9488]",
      titleColor: "text-[#115E59]",
      arrowBg: "bg-[#0D9488] hover:bg-[#0F766E]",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary to-secondary p-6 pb-12 rounded-b-[2rem]">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-lg font-bold text-white">R</span>
            </div>
            <div>
              <p className="text-white/80 text-sm">Welcome back,</p>
              <h2 className="text-white text-lg font-semibold">User</h2>
            </div>
          </div>
          <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm relative">
            <Bell className="w-5 h-5 text-white" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20"
        >
          <p className="text-white/90 text-sm mb-1">Your wellness journey</p>
          <div className="flex items-center justify-between">
            <h3 className="text-white text-2xl font-bold">7 days streak 🔥</h3>
            <div className="text-right">
              <p className="text-white/80 text-xs">Next session</p>
              <p className="text-white font-semibold">Today, 3:00 PM</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="p-6 pt-4">
        {/* Continue Learning Widget */}
        <ContinueLearningWidget className="mb-6 bg-white text-foreground" />

        <h3 className="text-xl font-bold text-foreground mb-5">Explore Services</h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {features.slice(0, 4).map((feature, index) => {
            const Icon = feature.icon;
            const style = themeStyles[feature.theme];
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(feature.path)}
                className={`group cursor-pointer rounded-[2rem] border p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${style.bg}`}
              >
                <div>
                  <div className={`w-12 h-12 flex items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-105 ${style.iconBg}`}>
                    <Icon className={`w-6 h-6 ${style.iconColor}`} strokeWidth={2} />
                  </div>
                  <h4 className={`text-[17px] font-bold leading-tight mt-5 ${style.titleColor}`}>
                    {feature.title}
                  </h4>
                  <p className="text-[13px] text-neutral-500 mt-2 leading-snug">
                    {feature.description}
                  </p>
                </div>
                <div className="flex justify-end mt-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-transform duration-300 group-hover:translate-x-0.5 ${style.arrowBg}`}>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {features[4] && (() => {
          const feature = features[4];
          const Icon = feature.icon;
          const style = themeStyles[feature.theme];
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 4 * 0.08 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(feature.path)}
              className={`group cursor-pointer rounded-[2rem] border p-5 flex items-center justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1 w-full ${style.bg}`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-14 h-14 flex items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-105 shrink-0 ${style.iconBg}`}>
                  <Icon className={`w-8 h-8 ${style.iconColor}`} strokeWidth={2} />
                </div>
                <div>
                  <h4 className={`text-[17px] font-bold leading-tight ${style.titleColor}`}>
                    {feature.title}
                  </h4>
                  <p className="text-[13px] text-neutral-500 mt-1 leading-snug">
                    {feature.description}
                  </p>
                </div>
              </div>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-transform duration-300 group-hover:translate-x-0.5 shrink-0 ${style.arrowBg}`}>
                <ArrowRight className="w-5 h-5" />
              </div>
            </motion.div>
          );
        })()}
      </div>
    </div>
  );
}

