import { motion } from "motion/react";
import { Heart, GraduationCap, Sparkles, BookOpen, Users, Activity } from "lucide-react";

export function Showcase() {
  const phones = [
    {
      screen: "Counselling",
      icon: Heart,
      gradient: "from-[#1C4966] to-[#5F8B70]",
      position: { x: -120, y: -40, rotate: -8 },
    },
    {
      screen: "Therapy",
      icon: Activity,
      gradient: "from-[#5F8B70] to-[#8FBDD7]",
      position: { x: -60, y: 0, rotate: -4 },
    },
    {
      screen: "Coaching",
      icon: GraduationCap,
      gradient: "from-[#8FBDD7] to-[#DDEEE3]",
      position: { x: 0, y: 20, rotate: 0 },
    },
    {
      screen: "Mindfulness",
      icon: Sparkles,
      gradient: "from-[#DDEEE3] to-[#5F8B70]",
      position: { x: 60, y: 0, rotate: 4 },
    },
    {
      screen: "Tuition",
      icon: BookOpen,
      gradient: "from-[#5F8B70] to-[#1C4966]",
      position: { x: 120, y: -40, rotate: 8 },
    },
    {
      screen: "Skills",
      icon: Users,
      gradient: "from-[#1C4966] to-[#8FBDD7]",
      position: { x: 180, y: -80, rotate: 12 },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1419] via-[#1C4966] to-[#2D5F7E] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />

      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center mb-16 relative z-20"
      >
        <motion.h1
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-7xl font-bold text-white mb-6 tracking-tight"
        >
          Relicus
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed"
        >
          Mental Health & Learning In One Experience
        </motion.p>
      </motion.div>

      <div className="relative w-full max-w-6xl h-96 flex items-center justify-center perspective-1000 mb-16">
        {phones.map((phone, index) => {
          const Icon = phone.icon;
          return (
            <motion.div
              key={phone.screen}
              initial={{ opacity: 0, y: 100, scale: 0.8 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                x: phone.position.x,
                rotateZ: phone.position.rotate,
              }}
              transition={{
                delay: 0.8 + index * 0.15,
                duration: 0.8,
                type: "spring",
                stiffness: 100,
              }}
              className="absolute"
              style={{
                zIndex: 10 - Math.abs(phone.position.rotate),
              }}
            >
              <div
                className={`w-32 h-56 bg-gradient-to-b ${phone.gradient} rounded-[2.5rem] shadow-2xl border-4 border-white/30 p-4 flex flex-col items-center justify-center backdrop-blur-sm relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />

                <div className="relative z-10 flex flex-col items-center">
                  <Icon className="w-14 h-14 text-white mb-3" strokeWidth={1.5} />
                  <p className="text-white text-sm text-center font-semibold">
                    {phone.screen}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="relative z-20 text-center"
      >
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {["Mental Health", "Therapy", "Coaching", "Learning", "Mindfulness", "Growth"].map(
            (tag, index) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.6 + index * 0.1 }}
                className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-medium border border-white/20"
              >
                {tag}
              </motion.div>
            )
          )}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          className="text-white/60 text-sm"
        >
          Built with care for your wellness journey
        </motion.p>
      </motion.div>
    </div>
  );
}
