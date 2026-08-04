import React, { memo } from "react";

interface MetricCardProps {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: number | string;
  sub?: string;
}

const MetricCard: React.FC<MetricCardProps> = memo(({ icon, iconColor, label, value, sub }) => (
  <div className="rounded-2xl border border-[#E8EAED] bg-white p-[18px] shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
    <div
      className="mb-3.5 flex size-10 items-center justify-center rounded-[11px] border"
      style={{ backgroundColor: `${iconColor}10`, borderColor: `${iconColor}18`, color: iconColor }}
    >
      {icon}
    </div>
    <p className="text-[1.625rem] font-extrabold leading-none text-[#0F172A]">
      {value}
    </p>
    <p className="mt-1 text-xs font-semibold text-[#374151]">
      {label}
    </p>
    {sub && (
      <p className="mt-0.5 text-[0.7rem] text-[#94A3B8]">{sub}</p>
    )}
  </div>
));

MetricCard.displayName = "MetricCard";
export default MetricCard;
