import React from "react";
import { motion } from "motion/react";
import { College } from "../types/knowNext.types";
import { useKnowNextStore } from "../store/knowNext.store";
import { SaveButton } from "./SaveButton";
import { GitCompare, Star, MapPin, ArrowRight } from "lucide-react";

interface CollegeCardProps {
  college: College;
  onSelect: (college: College) => void;
  showCompare?: boolean;
}

const TYPE_COLORS: Record<College["type"], string> = {
  Government: "bg-green-100 text-green-700",
  Private: "bg-blue-100 text-blue-700",
  Deemed: "bg-purple-100 text-purple-700",
  Autonomous: "bg-amber-100 text-amber-700",
};

export const CollegeCard: React.FC<CollegeCardProps> = React.memo(
  ({ college, onSelect, showCompare = true }) => {
    const { savedCollegeIds, compareCollegeIds, toggleSaveCollege, toggleCompareCollege, trackEvent } =
      useKnowNextStore();

    const isSaved = savedCollegeIds.includes(college.id);
    const isComparing = compareCollegeIds.includes(college.id);

    const handleClick = () => {
      trackEvent({ type: "view", entityType: "college", entityId: college.id });
      onSelect(college);
    };

    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className="bg-white border border-neutral-100 rounded-[2rem] p-4 shadow-xs cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ECFDF5] to-[#F0FFF4] flex items-center justify-center text-2xl shrink-0">
              {college.icon}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-foreground leading-tight">{college.shortName}</h4>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-2.5 h-2.5 text-neutral-400" />
                <p className="text-[10px] text-neutral-400 truncate">{college.location}</p>
              </div>
            </div>
          </div>
          <SaveButton isSaved={isSaved} onToggle={() => toggleSaveCollege(college.id)} size="sm" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: "Ranking", value: `#${college.ranking}` },
            { label: "Avg Pkg", value: `₹${college.placementAvgPackage}L` },
            { label: "Placement", value: `${college.placementRate}%` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-neutral-50 rounded-xl p-2 text-center">
              <p className="text-[10px] font-bold text-foreground">{value}</p>
              <p className="text-[9px] text-neutral-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Courses preview */}
        <div className="flex flex-wrap gap-1 mb-3">
          {college.coursesOffered.slice(0, 3).map((course) => (
            <span key={course} className="px-2 py-0.5 bg-neutral-50 border border-neutral-100 text-[9px] font-medium text-neutral-500 rounded-full">
              {course}
            </span>
          ))}
          {college.coursesOffered.length > 3 && (
            <span className="px-2 py-0.5 text-[9px] text-neutral-400 rounded-full">
              +{college.coursesOffered.length - 3} more
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${TYPE_COLORS[college.type]}`}>
              {college.type}
            </span>
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-[10px] font-bold text-foreground">{college.rating}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {showCompare && (
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCompareCollege(college.id);
                }}
                className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                  isComparing
                    ? "bg-purple-600 border-purple-600 text-white"
                    : "bg-white border-neutral-200 text-neutral-400 hover:border-purple-400 hover:text-purple-500"
                }`}
              >
                <GitCompare className="w-3 h-3" />
              </motion.button>
            )}
            <div className="w-7 h-7 rounded-full bg-[#5F8B70] flex items-center justify-center">
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);

CollegeCard.displayName = "CollegeCard";
