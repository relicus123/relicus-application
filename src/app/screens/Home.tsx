import { motion } from "motion/react";
import { Bell, Heart, GraduationCap, Sparkles, BookOpen, Users } from "lucide-react";
import { GradientCard } from "../components/GradientCard";

export function Home() {
  const features = [
    {
      title: "Counselling & Therapy",
      description: "Professional mental health support",
      icon: Heart,
      gradient: "bg-gradient-to-br from-[#1C4966] to-[#5F8B70]",
      path: "/app/counselling",
    },
    {
      title: "Entrance Coaching",
      description: "CUET, JEE, NEET preparation",
      icon: GraduationCap,
      gradient: "bg-gradient-to-br from-[#5F8B70] to-[#8FBDD7]",
      path: "/app/coaching",
    },
    {
      title: "Skill Enhancement",
      description: "Professional development courses",
      icon: Sparkles,
      gradient: "bg-gradient-to-br from-[#8FBDD7] to-[#DDEEE3]",
      path: "/app/skills",
    },
    {
      title: "One-to-One Tuition",
      description: "Personalized academic support",
      icon: BookOpen,
      gradient: "bg-gradient-to-br from-[#DDEEE3] to-[#5F8B70]",
      path: "/app/student/dashboard",
    },
    {
      title: "Mindfulness",
      description: "Meditation & wellness practices",
      icon: Users,
      gradient: "bg-gradient-to-br from-[#5F8B70] to-[#1C4966]",
      path: "/app/mindfulness",
    },
  ];

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

      <div className="p-6 -mt-8">
        <h3 className="text-xl font-bold text-foreground mb-4">Explore Services</h3>
        <div className="space-y-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GradientCard {...feature} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
