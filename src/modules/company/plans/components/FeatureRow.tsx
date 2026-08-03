import React from "react";

interface Props {
  icon: React.ReactNode;
  label: string;
  color: string;
}

const FeatureRow: React.FC<Props> = ({ icon, label, color }) => (
  <div className="flex items-center gap-2">
    <div
      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md"
      style={{ backgroundColor: `${color}12`, border: `1px solid ${color}22`, color }}
    >
      {icon}
    </div>
    <span className="text-[0.82rem] font-medium text-gray-700">{label}</span>
  </div>
);

export default FeatureRow;
