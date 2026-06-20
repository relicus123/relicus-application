import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "../../../components/Button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message = "Something went wrong while loading this section.", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-[2rem] bg-red-50/50 border border-red-100 max-w-md mx-auto my-6">
      <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-foreground mb-2">Error Loading Content</h3>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-[280px] mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="mt-2 text-red-600 border-red-200 hover:bg-red-50">
          Try Again
        </Button>
      )}
    </div>
  );
};
