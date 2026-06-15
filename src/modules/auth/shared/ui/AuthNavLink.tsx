import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Props {
  href:        string;
  label:       string;
  dividerText: string;
  variant?:    "accent" | "neutral";
}

const AuthNavLink: React.FC<Props> = ({ href, label, dividerText, variant = "neutral" }) => {
  const isAccent = variant === "accent";

  return (
    <div className="pt-1">
      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-border" />
        <span className="font-sans text-xs text-muted-foreground whitespace-nowrap">
          {dividerText}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Link button */}
      <Link href={href} className="block no-underline group">
        <div className={cn(
          "flex items-center justify-center w-full h-10 sm:h-11 rounded-lg border font-sans font-semibold text-sm transition-all duration-150",
          isAccent
            ? "border-primary/40 text-primary hover:bg-primary/5 hover:border-primary"
            : "border-border text-foreground hover:bg-muted hover:border-border/80",
        )}>
          {label}
        </div>
      </Link>
    </div>
  );
};

export default AuthNavLink;
