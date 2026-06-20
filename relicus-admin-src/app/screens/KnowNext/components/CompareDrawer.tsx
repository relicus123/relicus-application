import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { GitCompare, X, ArrowRight } from "lucide-react";

interface CompareDrawerProps {
  count: number;
  max: number;
  label: string;
  onCompare: () => void;
  onClear: () => void;
}

export const CompareDrawer: React.FC<CompareDrawerProps> = ({
  count,
  max,
  label,
  onCompare,
  onClear,
}) => {
  const isReady = count >= 2;

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-20 left-4 right-4 z-50"
        >
          <div className="bg-[#1C4966] rounded-[2rem] shadow-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <GitCompare className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{label}</p>
                <p className="text-[10px] text-white/60">{count}/{max} selected · {isReady ? "Ready!" : "Select 1 more"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isReady && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onCompare}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-full text-xs font-bold text-[#1C4966] cursor-pointer"
                >
                  Compare <ArrowRight className="w-3 h-3" />
                </motion.button>
              )}
              <button
                onClick={onClear}
                className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
