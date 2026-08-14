import React from "react";
import { ACCENT_DARK } from "../constants";

interface Props {
  label:     string;
  used:      number;
  limit:     number;
  remaining: number;
  pct:       number;
  icon:      React.ReactNode;
}

// "ok" stays neutral — color is reserved for the accent icon and for the two
// states that actually need attention (amber near the limit, red at/over it).
const barColor = (pct: number, limit: number) => {
  if (limit === -1) return "#6B7280";
  if (pct >= 100) return "#dc2626";
  if (pct >= 80) return "#d97706";
  return "#6B7280";
};

const UsageBar: React.FC<Props> = ({ label, used, limit, remaining, pct, icon }) => {
  const color = barColor(pct, limit);
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <span style={{ color: ACCENT_DARK }} className="flex">{icon}</span>
        <span className="flex-1 text-[0.78rem] font-semibold text-gray-700">{label}</span>
        <span className="text-[0.75rem] font-bold" style={{ color }}>
          {limit === -1 ? `${used} / ∞` : `${used} / ${limit}`}
        </span>
      </div>
      <div className="h-[7px] w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${limit === -1 ? 0 : pct}%`, backgroundColor: color }}
        />
      </div>
      <p className="mt-1 text-[0.69rem] text-gray-400">
        {limit === -1 ? `${used} used · unlimited` : `${remaining} remaining`}
      </p>
    </div>
  );
};

export default UsageBar;
