import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon: Icon, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-[2rem] bg-white border border-neutral-100 shadow-xs max-w-md mx-auto my-6">
      <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-[#8FBDD7]/10 to-[#1C4966]/10 text-primary flex items-center justify-center mb-4 border border-[#8FBDD7]/20">
        <Icon className="w-8 h-8 text-[#1C4966]" />
      </div>
      <h3 className="text-base font-bold text-foreground mb-2">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-[280px] mb-4">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};
