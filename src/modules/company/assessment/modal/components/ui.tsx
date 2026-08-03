import React from "react";

// ─── ScoreRing ────────────────────────────────────────────────────────────────
// SVG ring — color is dynamic (computed from score at runtime), inline style required

export const ScoreRing: React.FC<{ value: number; color: string; size?: number }> = ({
  value, color, size = 88,
}) => {
  const r      = (size - 14) / 2;
  const circ   = 2 * Math.PI * r;
  const filled = (Math.min(Math.max(value, 0), 100) / 100) * circ;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}20`} strokeWidth={9} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={9}
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 5px ${color}55)`, transition: "stroke-dasharray 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-black leading-none tracking-tight"
          style={{ fontSize: size > 80 ? "1.2rem" : "1rem", color }}
        >
          {Math.round(value)}
        </span>
      </div>
    </div>
  );
};

// ─── ScoreBar ─────────────────────────────────────────────────────────────────
// Horizontal progress bar — color is dynamic

export const ScoreBar: React.FC<{ value: number; color: string; height?: number }> = ({
  value, color, height = 6,
}) => {
  const pct = Math.min(Math.max(value, 0), 100);
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, backgroundColor: `${color}18` }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
};

// ─── SectionLabel ─────────────────────────────────────────────────────────────

export const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[0.63rem] font-bold text-slate-400 uppercase tracking-widest mb-3">
    {children}
  </p>
);

// ─── Chip ─────────────────────────────────────────────────────────────────────
// Generic pill chip with Tailwind className — caller controls colors via className

export const Chip: React.FC<{
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}> = ({ children, className = "", icon }) => (
  <span className={`inline-flex items-center gap-1 h-5 px-2 rounded-full border text-[0.68rem] font-semibold ${className}`}>
    {icon}
    {children}
  </span>
);

// ─── IconBox ──────────────────────────────────────────────────────────────────
// Square icon container

export const IconBox: React.FC<{
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
}> = ({ children, className = "", size = "md" }) => (
  <div className={`flex items-center justify-center rounded-lg shrink-0 ${size === "sm" ? "w-5 h-5" : "w-6 h-6"} ${className}`}>
    {children}
  </div>
);

// ─── CardHeader ───────────────────────────────────────────────────────────────

export const CardHeader: React.FC<{
  icon: React.ReactNode;
  iconCls?: string;
  title: string;
  right?: React.ReactNode;
  className?: string;
}> = ({ icon, iconCls = "bg-slate-100", title, right, className = "" }) => (
  <div className={`flex items-center gap-2.5 px-5 py-3 border-b border-slate-100 bg-slate-50 ${className}`}>
    <IconBox className={iconCls}>{icon}</IconBox>
    <span className="text-[0.78rem] font-bold text-slate-700">{title}</span>
    {right && <div className="ml-auto">{right}</div>}
  </div>
);

// ─── DotList ──────────────────────────────────────────────────────────────────

export const DotList: React.FC<{
  items: string[];
  dotCls: string;
  textCls: string;
}> = ({ items, dotCls, textCls }) => (
  <div className="flex flex-col gap-2">
    {items.map((text, i) => (
      <div key={i} className="flex items-start gap-2.5">
        <div className={`w-1.5 h-1.5 rounded-full mt-[5px] shrink-0 ${dotCls}`} />
        <span className={`text-sm leading-relaxed ${textCls}`}>{text}</span>
      </div>
    ))}
  </div>
);

// ─── scoreTheme ───────────────────────────────────────────────────────────────
// Returns Tailwind classes + the hex color needed for SVG strokes

export type ScoreTheme = {
  color:    string;   // hex — for SVG only
  textCls:  string;
  bgCls:    string;
  pillCls:  string;   // bg + text + border for a pill
};

export function scoreTheme(score: number): ScoreTheme {
  if (score >= 70) return { color: "#10B981", textCls: "text-emerald-600", bgCls: "bg-emerald-50",  pillCls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (score >= 50) return { color: "#D97706", textCls: "text-amber-600",   bgCls: "bg-amber-50",   pillCls: "bg-amber-50 text-amber-700 border-amber-200"   };
  return             { color: "#EF4444", textCls: "text-red-600",     bgCls: "bg-red-50",     pillCls: "bg-red-50 text-red-700 border-red-200"         };
}

// ─── verdictTheme ─────────────────────────────────────────────────────────────

export type VerdictTheme = {
  color:       string;  // hex — for inline styles on dynamic verdict elements
  borderColor: string;  // hex
  bgCls:       string;
  textCls:     string;
  pillCls:     string;
};

export function verdictTheme(recommendation?: string, score?: number): VerdictTheme {
  if (recommendation === "strong_hire") return { color: "#059669", borderColor: "#6EE7B7", bgCls: "bg-emerald-50", textCls: "text-emerald-700", pillCls: "bg-emerald-600 text-white" };
  if (recommendation === "hire")        return { color: "#10B981", borderColor: "#A7F3D0", bgCls: "bg-emerald-50", textCls: "text-emerald-600", pillCls: "bg-emerald-500 text-white" };
  if (recommendation === "maybe")       return { color: "#D97706", borderColor: "#FDE68A", bgCls: "bg-amber-50",   textCls: "text-amber-700",   pillCls: "bg-amber-500 text-white"   };
  if (recommendation === "no_hire")     return { color: "#EF4444", borderColor: "#FECACA", bgCls: "bg-red-50",     textCls: "text-red-700",     pillCls: "bg-red-500 text-white"     };
  // fallback from score
  const s = score ?? 0;
  if (s >= 70) return { color: "#10B981", borderColor: "#A7F3D0", bgCls: "bg-emerald-50", textCls: "text-emerald-700", pillCls: "bg-emerald-500 text-white" };
  if (s >= 50) return { color: "#D97706", borderColor: "#FDE68A", bgCls: "bg-amber-50",   textCls: "text-amber-700",   pillCls: "bg-amber-500 text-white"   };
  return             { color: "#EF4444", borderColor: "#FECACA", bgCls: "bg-red-50",     textCls: "text-red-700",     pillCls: "bg-red-500 text-white"     };
}
