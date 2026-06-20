import React from "react";
import { Info, LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = React.memo(({
  title,
  description,
  icon: Icon = Info,
  actionText,
  onAction,
}) => {
  return (
    <div className="w-full py-12 px-6 flex flex-col items-center justify-center text-center bg-white border border-neutral-100 rounded-[2rem] shadow-xs">
      <div className="w-16 h-16 bg-[#FFFFF0] border border-[#5F8B70]/10 rounded-full flex items-center justify-center mb-4 text-[#5F8B70]">
        <Icon className="w-8 h-8" strokeWidth={1.5} />
      </div>
      <h4 className="text-lg font-bold text-foreground mb-1">{title}</h4>
      <p className="text-sm text-neutral-500 max-w-xs leading-relaxed mb-6">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2 text-sm font-semibold text-white bg-primary rounded-full hover:bg-primary/90 transition-colors cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
});

EmptyState.displayName = "EmptyState";
