import * as React from "react";

const TEAL = "#0D9488";

interface SimplePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  size?: "sm" | "default";
  className?: string;
}

const sizeClass = { sm: "w-7 h-7", default: "w-8 h-8" } as const;

function SimplePagination({ page, totalPages, onPageChange, size = "default", className = "mt-4" }: SimplePaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const btnSize = sizeClass[size];

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className={`${btnSize} flex items-center justify-center rounded-md text-[13px] text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
      >
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          className={`${btnSize} flex items-center justify-center rounded-md text-[12px] font-medium transition-colors`}
          style={{
            backgroundColor: p === page ? `${TEAL}18` : "transparent",
            color:           p === page ? TEAL        : "#374151",
            fontWeight:      p === page ? 700          : 500,
          }}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className={`${btnSize} flex items-center justify-center rounded-md text-[13px] text-slate-500 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
      >
        ›
      </button>
    </div>
  );
}

export { SimplePagination };
