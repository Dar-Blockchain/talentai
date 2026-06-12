import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  icon:         React.ReactNode;
  label:        string;
  description:  string;
  accent:       string;
  iconGradient: string;
  shadowColor:  string;
  border:       string;
  onClick:      () => void;
}

const RoleCard: React.FC<Props> = ({ icon, label, description, accent, iconGradient, shadowColor, border, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "flex items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl border-[1.5px] bg-card cursor-pointer",
        "transition-all duration-200 select-none",
      )}
      style={{
        borderColor: hovered ? accent : border,
        boxShadow:   hovered
          ? `0 10px 36px ${shadowColor}, 0 2px 8px rgba(0,0,0,0.04)`
          : "0 2px 10px rgba(0,0,0,0.05)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
      }}
    >
      {/* Icon container */}
      <div
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-[15px] flex items-center justify-center shrink-0"
        style={{ background: iconGradient, boxShadow: `0 6px 18px ${shadowColor}` }}
      >
        {icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="font-sans font-bold text-sm sm:text-[0.9375rem] text-foreground leading-snug mb-0.5">
          {label}
        </p>
        <p className="font-sans text-xs sm:text-[0.8rem] text-muted-foreground leading-relaxed wrap-break-word">
          {description}
        </p>
      </div>

      {/* Arrow */}
      <div
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center shrink-0 transition-all duration-200"
        style={{ background: `${accent}10`, border: `1px solid ${accent}20` }}
      >
        <ArrowRight className="size-3.5 sm:size-4" style={{ color: accent }} />
      </div>
    </div>
  );
};

export default RoleCard;
