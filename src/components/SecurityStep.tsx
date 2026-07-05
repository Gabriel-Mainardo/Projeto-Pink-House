import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SecurityStepProps {
  number: number;
  title: string;
  description: string;
  icon: ReactNode;
  isActive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export const SecurityStep = ({
  number,
  title,
  description,
  icon,
  isActive = false,
  disabled = false,
  onClick,
}: SecurityStepProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full p-6 rounded-3xl transition-all duration-300 text-left flex items-start gap-4 group",
        !disabled && "hover:scale-[1.02]",
        isActive
          ? "bg-white border-2 border-primary shadow-lg shadow-primary/10"
          : "bg-white border-2 border-transparent",
        disabled
          ? "cursor-not-allowed opacity-70"
          : "hover:border-border"
      )}
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-full text-[hsl(var(--step-number-foreground))] flex items-center justify-center text-lg font-semibold" style={{ }}>
        {number}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold mb-2 text-foreground" style={{ }}>
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed" style={{ }}>
          {description}
        </p>
      </div>

      <div className={cn(
        "flex-shrink-0 w-10 h-10 flex items-center justify-center transition-colors",
        isActive ? "text-primary" : ""
      )}
      style={!isActive ? { color: '#f9a8d4' } : {}}>
        {icon}
      </div>
    </button>
  );
};
