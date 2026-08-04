import React, { memo } from "react";

interface StatCardProps {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = memo(({ icon, iconColor, label, value }) => (
  <div className="flex items-center gap-3 rounded-[14px] border border-[#E8EAED] bg-white p-[14px] shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
    <div
      className="flex size-[38px] shrink-0 items-center justify-center rounded-[10px] border"
      style={{ backgroundColor: `${iconColor}10`, borderColor: `${iconColor}18`, color: iconColor }}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[0.7rem] font-medium uppercase tracking-[0.05em] text-[#94A3B8]">
        {label}
      </p>
      <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[0.8125rem] font-bold text-[#0F172A]">
        {value}
      </p>
    </div>
  </div>
));

StatCard.displayName = "StatCard";
export default StatCard;
