import React from "react";

interface LoadingSkeletonProps {
  type?: "dashboard" | "chapters" | "analytics" | "tests" | "card";
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = React.memo(({
  type = "card",
  count = 1,
}) => {
  const renderCard = () => (
    <div className="w-full bg-neutral-50/50 border border-neutral-100 rounded-[2rem] p-5 animate-pulse space-y-4">
      <div className="flex justify-between items-start">
        <div className="w-12 h-12 bg-neutral-200 rounded-2xl" />
        <div className="w-14 h-4 bg-neutral-200 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="w-2/3 h-5 bg-neutral-200 rounded-lg" />
        <div className="w-5/6 h-4 bg-neutral-100 rounded-md" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="w-16 h-3 bg-neutral-100 rounded-full" />
        <div className="w-8 h-8 bg-neutral-200 rounded-full" />
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 bg-neutral-200 rounded-[2rem]" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-44 bg-neutral-100 rounded-[2rem]" />
        <div className="h-44 bg-neutral-100 rounded-[2rem]" />
        <div className="h-44 bg-neutral-100 rounded-[2rem]" />
        <div className="h-44 bg-neutral-100 rounded-[2rem]" />
      </div>
    </div>
  );

  const renderChapters = () => (
    <div className="space-y-6 animate-pulse">
      <div className="flex gap-2 overflow-hidden">
        <div className="w-28 h-10 bg-neutral-200 rounded-full shrink-0" />
        <div className="w-28 h-10 bg-neutral-100 rounded-full shrink-0" />
        <div className="w-28 h-10 bg-neutral-100 rounded-full shrink-0" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border border-neutral-100 rounded-2xl flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="w-1/3 h-4 bg-neutral-200 rounded" />
              <div className="w-1/4 h-3 bg-neutral-100 rounded" />
            </div>
            <div className="w-12 h-12 bg-neutral-200 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 gap-4">
        <div className="h-28 bg-neutral-200 rounded-2xl" />
        <div className="h-28 bg-neutral-200 rounded-2xl" />
      </div>
      <div className="h-64 bg-neutral-100 rounded-[2rem]" />
      <div className="h-64 bg-neutral-100 rounded-[2rem]" />
    </div>
  );

  return (
    <div className="w-full space-y-4">
      {type === "dashboard" && renderDashboard()}
      {type === "chapters" && renderChapters()}
      {type === "analytics" && renderAnalytics()}
      {type === "card" &&
        Array.from({ length: count }).map((_, idx) => (
          <React.Fragment key={idx}>{renderCard()}</React.Fragment>
        ))}
    </div>
  );
});

LoadingSkeleton.displayName = "LoadingSkeleton";
