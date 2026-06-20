import React from "react";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = React.memo(({
  title = "An error occurred",
  description,
  onRetry,
}) => {
  return (
    <div className="w-full py-10 px-6 flex flex-col items-center justify-center text-center bg-red-50/50 border border-red-100 rounded-[2rem]">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3 text-[#D9534F]">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-foreground mb-1">{title}</h4>
      <p className="text-sm text-neutral-500 max-w-xs mb-5">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#D9534F] rounded-full hover:bg-[#C9302C] transition-colors cursor-pointer"
        >
          Retry Action
        </button>
      )}
    </div>
  );
});

ErrorState.displayName = "ErrorState";
