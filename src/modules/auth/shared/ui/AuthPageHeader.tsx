import React from "react";
import { cn } from "@/lib/utils";

const MB_CLASS: Record<number, string> = { 1: "mb-2", 2: "mb-4", 3: "mb-6", 4: "mb-8", 5: "mb-10" };

interface Props {
  title:     React.ReactNode;
  subtitle?: React.ReactNode;
  above?:    React.ReactNode;
  size?:     "lg" | "md" | "sm";
  mb?:       number;
}

export const AuthPageHeader: React.FC<Props> = ({ title, subtitle, above, size = "md", mb = 3 }) => (
  <div className={cn("text-center", MB_CLASS[mb] ?? "mb-6")}>
    {above}
    <h2
      className={cn(
        "font-sans font-extrabold text-foreground leading-tight tracking-tight wrap-break-word",
        size === "lg" && "text-2xl sm:text-3xl lg:text-4xl",
        size === "md" && "text-xl sm:text-2xl lg:text-3xl",
        size === "sm" && "text-lg sm:text-xl lg:text-2xl",
        subtitle ? "mb-1 sm:mb-1.5" : "mb-0",
      )}
    >
      {title}
    </h2>
    {subtitle && (
      <p className={cn(
        "font-sans text-muted-foreground leading-relaxed wrap-break-word",
        size === "lg" && "text-sm sm:text-base lg:text-lg",
        size === "md" && "text-xs sm:text-sm lg:text-base",
        size === "sm" && "text-xs sm:text-sm lg:text-base",
      )}>
        {subtitle}
      </p>
    )}
  </div>
);

/** Gradient brand name — uses theme primary → accent */
export const BrandSpan: React.FC<{ children?: React.ReactNode }> = ({ children = "TalentAI" }) => (
  <span className="font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
    {children}
  </span>
);

export const AccentSpan: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="font-semibold text-primary">{children}</span>
);
