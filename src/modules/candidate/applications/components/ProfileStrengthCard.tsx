import React from "react";
import { TrendingUp as TrendingUpOutlined, CheckCircle2 as CheckCircleOutlined, Circle as RadioButtonUncheckedOutlined } from "lucide-react";
import { NAVY } from "../utils/constants";

interface ChecklistItem {
  label: string;
  done: boolean;
}

interface ProfileStrengthCardProps {
  title: string;
  checklist: ChecklistItem[];
}

const ProfileStrengthCard: React.FC<ProfileStrengthCardProps> = ({ title, checklist }) => {
  const pct = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUpOutlined size={16} color="#7C3AED" />
        <span className="font-bold text-[0.82rem]" style={{ color: NAVY }}>{title}</span>
      </div>
      <div className="h-[5px] rounded-full bg-[#F3F4F6] overflow-hidden mb-3">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: "#7C3AED" }} />
      </div>
      <div className="flex flex-col gap-1.5">
        {checklist.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            {item.done
              ? <CheckCircleOutlined size={14} color="#059669" />
              : <RadioButtonUncheckedOutlined size={14} color="#D1D5DB" />}
            <span className="text-[0.72rem]" style={{ color: item.done ? "#374151" : "#9CA3AF", fontWeight: item.done ? 500 : 400 }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileStrengthCard;
