import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Heart, GraduationCap, Sparkles, BookOpen, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

export function Landing() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      title: "Book Therapy Sessions",
      description: "Connect with licensed therapists",
      icon: Heart,
      gradient: "from-[#1C4966] to-[#5F8B70]",
    },
    {
      title: "CUET Coaching",
      description: "Expert guidance for entrance exams",
      icon: GraduationCap,
      gradient: "from-[#5F8B70] to-[#8FBDD7]",
    },
    {
      title: "Skill Enhancement",
      description: "Learn new skills at your pace",
      icon: Sparkles,
      gradient: "from-[#8FBDD7] to-[#DDEEE3]",
    },
    {
      title: "One-to-One Tuition",
      description: "Personalized learning experience",
      icon: BookOpen,
      gradient: "from-[#5F8B70] to-[#1C4966]",
    },
    {
      title: "Mindfulness Activities",
      description: "Daily meditation and wellness",
      icon: Users,
      gradient: "from-[#DDEEE3] to-[#8FBDD7]",
    },
  ];

  const handleContinue = () => {
    if (phone && agreed) {
      navigate("/otp");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Relicus</h2>
        <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-danger rounded-full" />
        </div>
      </div>

      <div className="flex-1 px-6">
        <div className="relative mb-8">
          <div className="overflow-hidden rounded-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className={`bg-gradient-to-br ${banners[currentSlide].gradient} p-8 h-64 flex flex-col justify-center items-center text-center relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

                <banners[currentSlide].icon className="w-16 h-16 text-white mb-4" strokeWidth={1.5} />
                <h3 className="text-2xl font-bold text-white mb-2">
                  {banners[currentSlide].title}
                </h3>
                <p className="text-white/90">{banners[currentSlide].description}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
          >
            <ChevronLeft className="w-5 h-5 text-primary" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
          >
            <ChevronRight className="w-5 h-5 text-primary" />
          </button>

          <div className="flex justify-center gap-2 mt-4">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide ? "w-8 bg-primary" : "w-2 bg-primary/30"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Input
            label="Phone Number"
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 accent-primary rounded"
            />
            <span className="text-sm text-foreground">
              I agree to the Terms & Conditions and Privacy Policy
            </span>
          </label>

          <Button
            onClick={handleContinue}
            disabled={!phone || !agreed}
            className="w-full"
            size="lg"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
