import React from "react";
import { Bookmark } from "lucide-react";
import { motion } from "motion/react";

interface SaveButtonProps {
  isSaved: boolean;
  onToggle: () => void;
  className?: string;
  size?: "sm" | "md";
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  isSaved,
  onToggle,
  className = "",
  size = "md",
}) => {
  const sizeClasses = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4.5 h-4.5";

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`${sizeClasses} rounded-full flex items-center justify-center border transition-all duration-200 cursor-pointer ${
        isSaved
          ? "bg-[#1C4966] border-[#1C4966] text-white"
          : "bg-white border-neutral-200 text-neutral-400 hover:border-[#1C4966] hover:text-[#1C4966]"
      } ${className}`}
      title={isSaved ? "Remove from saved" : "Save"}
    >
      <Bookmark className={`${iconSize} ${isSaved ? "fill-white" : ""}`} />
    </motion.button>
  );
};
