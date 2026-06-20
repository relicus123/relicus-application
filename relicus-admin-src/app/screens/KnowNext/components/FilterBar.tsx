import React from "react";
import { motion } from "motion/react";

interface FilterBarProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  options,
  selected,
  onSelect,
  className = "",
}) => {
  return (
    <div className={`flex gap-2 overflow-x-auto pb-1 scrollbar-hide ${className}`}>
      {options.map((opt) => {
        const isActive = selected === opt;
        return (
          <motion.button
            key={opt}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(opt)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
              isActive
                ? "bg-[#5F8B70] text-white border-[#5F8B70]"
                : "bg-white text-neutral-500 border-neutral-200 hover:border-[#5F8B70] hover:text-[#5F8B70]"
            }`}
          >
            {opt}
          </motion.button>
        );
      })}
    </div>
  );
};
