import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Heart, GraduationCap, Sparkles } from "lucide-react";
import { Button } from "../components/Button";

export function AppIntro() {
  const navigate = useNavigate();

  const phones = [
    {
      icon: Heart,
      label: "Counselling",
      gradient: "from-[#1C4966] to-[#5F8B70]",
    },
    {
      icon: GraduationCap,
      label: "Learning",
      gradient: "from-[#5F8B70] to-[#8FBDD7]",
    },
    {
      icon: Sparkles,
      label: "Mindfulness",
      gradient: "from-[#8FBDD7] to-[#DDEEE3]",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1C4966] via-[#5F8B70] to-[#8FBDD7] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12 relative z-10"
      >
        <motion.h1
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-6xl font-bold text-white mb-4 tracking-tight"
        >
          Relicus
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-white/90 max-w-md"
        >
          One App. Multiple Growth Experiences.
        </motion.p>
      </motion.div>

      <div className="flex gap-6 mb-12 relative z-10">
        {phones.map((phone, index) => (
          <motion.div
            key={phone.label}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.2, duration: 0.6 }}
            className="relative"
          >
            <div className={`w-24 h-48 bg-gradient-to-b ${phone.gradient} rounded-[2rem] shadow-2xl border-4 border-white/20 p-4 flex flex-col items-center justify-center backdrop-blur-sm`}>
              <phone.icon className="w-12 h-12 text-white mb-2" strokeWidth={1.5} />
              <p className="text-white text-xs text-center font-medium">{phone.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="relative z-10"
      >
        <Button
          onClick={() => navigate("/landing")}
          size="lg"
          className="bg-white text-[#1C4966] hover:bg-white/90 px-12 shadow-xl"
        >
          Get Started
        </Button>
      </motion.div>
    </div>
  );
}
