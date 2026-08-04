import React, { memo } from "react";
import { cn } from "@/lib/utils";

const PURPLE = "#8310FF";

interface DetailTabProps {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const DetailTab: React.FC<DetailTabProps> = memo(({ active, label, icon, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center gap-[7px] rounded-[10px] px-4 py-[7px] transition-all duration-[180ms] ease-in-out",
        active ? "bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]" : "bg-transparent hover:bg-[#EAECF0]",
      )}
      style={{ color: active ? PURPLE : "#6B7280" }}
    >
      <div className="flex">{icon}</div>
      <span
        className="whitespace-nowrap text-[13px] font-bold"
        style={{ color: active ? "#111827" : "#6B7280" }}
      >
        {label}
      </span>
    </div>
  );
});

DetailTab.displayName = "DetailTab";
export default DetailTab;
