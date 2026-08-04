
import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional element rendered on the right (button, chips, etc.) */
  action?: React.ReactNode;
  /** Reduce vertical padding for use inside cards */
  compact?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
  compact = false,
}) => (
  <div className={cn("flex items-start justify-between gap-4", compact ? "mb-4" : "mb-6")}>
    <div>
      <p className={cn("font-bold text-gray-900 leading-snug", compact ? "text-base" : "text-xl")}>
        {title}
      </p>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export default SectionHeader;
