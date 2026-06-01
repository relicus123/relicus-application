import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router";

interface GradientCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  path: string;
}

export function GradientCard({ title, description, icon: Icon, gradient, path }: GradientCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(path)}
      className={`relative overflow-hidden rounded-3xl p-6 cursor-pointer shadow-lg ${gradient}`}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
          <Icon className="w-8 h-8 text-white" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
          <p className="text-white/90 text-sm">{description}</p>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
    </motion.div>
  );
}
