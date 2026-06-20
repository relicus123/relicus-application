import React from "react";

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-6 p-6 animate-pulse">
      {/* Search Bar Skeleton */}
      <div className="h-12 w-full bg-neutral-200 rounded-2xl" />

      {/* Categories Row Skeleton */}
      <div className="flex gap-2 overflow-hidden">
        <div className="h-8 w-16 bg-neutral-200 rounded-full shrink-0" />
        <div className="h-8 w-24 bg-neutral-200 rounded-full shrink-0" />
        <div className="h-8 w-24 bg-neutral-200 rounded-full shrink-0" />
        <div className="h-8 w-20 bg-neutral-200 rounded-full shrink-0" />
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((idx) => (
          <div key={idx} className="p-4 bg-white border border-neutral-100 rounded-[2rem] space-y-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-neutral-200 rounded-2xl shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-neutral-200 rounded-md w-3/4" />
                <div className="h-3 bg-neutral-200 rounded-md w-1/2" />
                <div className="h-3 bg-neutral-200 rounded-md w-1/3" />
              </div>
            </div>
            <div className="h-8 bg-neutral-200 rounded-xl w-full" />
          </div>
        ))}
      </div>
    </div>
  );
};
export default LoadingSkeleton;
