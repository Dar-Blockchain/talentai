import React from "react";
import { TEAL } from "../constants";

interface Props {
  label:     string;
  used:      number;
  limit:     number;
  remaining: number;
  pct:       number;
  icon:      React.ReactNode;
}

const UsageBar: React.FC<Props> = ({ label, used, limit, remaining, pct, icon }) => (
  <div>
    <div className="mb-1.5 flex items-center gap-2">
      <span style={{ color: TEAL }} className="flex">{icon}</span>
      <span className="flex-1 text-[0.78rem] font-semibold text-gray-700">{label}</span>
      <span className="text-[0.75rem] font-bold" style={{ color: pct >= 90 ? "#ef4444" : TEAL }}>
        {used} / {limit}
      </span>
    </div>
    <div className="h-[7px] w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, backgroundColor: pct >= 90 ? "#ef4444" : TEAL }}
      />
    </div>
    <p className="mt-1 text-[0.69rem] text-gray-400">{remaining} remaining</p>
  </div>
);

export default UsageBar;
