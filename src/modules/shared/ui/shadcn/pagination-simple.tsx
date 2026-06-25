import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimplePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  size?: "sm" | "default";
  className?: string;
}

function getPages(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

function SimplePagination({
  page, totalPages, onPageChange, size = "default", className,
}: SimplePaginationProps) {
  if (totalPages <= 1) return null;

  const btnBase = cn(
    "flex items-center justify-center rounded-md text-xs font-medium transition-colors select-none",
    size === "sm" ? "w-7 h-7" : "w-8 h-8",
  );

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className={cn(btnBase, "text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed")}
      >
        <ChevronLeft className="size-3.5" />
      </button>

      {getPages(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className={cn(btnBase, "text-muted-foreground cursor-default")}>
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={cn(
              btnBase,
              p === page
                ? "bg-primary/15 text-primary-dark font-bold border border-primary-border"
                : "text-foreground hover:bg-muted",
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className={cn(btnBase, "text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed")}
      >
        <ChevronRight className="size-3.5" />
      </button>
    </div>
  );
}

export { SimplePagination };
