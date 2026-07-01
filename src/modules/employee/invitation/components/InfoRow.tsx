import React from "react";
import { cn } from "@/lib/utils";

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  iconColor?: string;
  last?: boolean;
}> = ({ icon, label, value, iconColor = "#0D9488", last = false }) => (
  <div className={cn(
    "flex items-center gap-3 py-3.5 px-4",
    !last && "border-b border-slate-100",
  )}>
    <span className="shrink-0 flex items-center [&_svg]:size-[18px]" style={{ color: iconColor }}>
      {icon}
    </span>
    <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
      <span className="text-[0.78rem] text-slate-400 font-medium shrink-0">{label}</span>
      {typeof value === "string"
        ? <span className="text-[0.875rem] font-semibold text-slate-800 truncate text-right">{value || "—"}</span>
        : value}
    </div>
  </div>
);

export default InfoRow;
