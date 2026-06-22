import * as React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";

// ─── ScoreCircle ──────────────────────────────────────────────────────────────

interface ScoreCircleProps {
  value: number | null;
  label: string;
  size?: number;
  strokeWidth?: number;
}

export function ScoreCircle({ value, label, size = 44, strokeWidth = 4 }: ScoreCircleProps) {
  const pct    = value !== null ? Math.min(Math.round(value), 100) : null;
  const color  = pct === null ? "#E5E7EB" : pct >= 70 ? "#059669" : pct >= 40 ? "#D97706" : "#DC2626";
  const r      = (size - strokeWidth * 2) / 2;
  const cx     = size / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={cx} cy={cx} r={r} fill="none" stroke={pct === null ? "#F3F4F6" : `${color}22`} strokeWidth={strokeWidth} />
          <circle
            cx={cx} cy={cx} r={r} fill="none" stroke={color}
            strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - (pct ?? 0) / 100)}
          />
        </svg>
        <span
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] font-bold"
          style={{ color: pct !== null ? color : "#9CA3AF" }}
        >
          {pct !== null ? `${pct}%` : "—"}
        </span>
      </div>
      <span className="text-[10px] text-slate-400 font-medium">{label}</span>
    </div>
  );
}

// ─── DecisionButton ───────────────────────────────────────────────────────────

interface DecisionButtonProps {
  active: boolean;
  loading: boolean;
  disabled: boolean;
  activeColor: string;
  activeBg: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export function DecisionButton({ active, loading, disabled, activeColor, activeBg, icon, label, onClick }: DecisionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={cn(
        "flex items-center justify-center gap-1 h-7 px-[9px] rounded-[7px] border text-[11px] font-semibold transition-all duration-150 outline-none",
        "disabled:opacity-50 disabled:cursor-not-allowed",
      )}
      style={{
        borderColor: active ? activeColor : "#D1D5DB",
        backgroundColor: active ? activeBg : "#F9FAFB",
        color: active ? activeColor : "#6B7280",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = activeColor;
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = activeBg;
          (e.currentTarget as HTMLButtonElement).style.color = activeColor;
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = active ? activeColor : "#D1D5DB";
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = active ? activeBg : "#F9FAFB";
        (e.currentTarget as HTMLButtonElement).style.color = active ? activeColor : "#6B7280";
      }}
    >
      {loading ? <Spinner className="size-3" /> : icon}
      <span className="leading-none">{label}</span>
    </button>
  );
}
