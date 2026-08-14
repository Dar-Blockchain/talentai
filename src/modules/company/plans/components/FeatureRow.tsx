import React from "react";

interface Props {
  icon: React.ReactNode;
  label: string;
}

const FeatureRow: React.FC<Props> = ({ icon, label }) => (
  <div className="flex items-center gap-2">
    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-500">
      {icon}
    </div>
    <span className="text-[0.82rem] font-medium text-gray-700">{label}</span>
  </div>
);

export default FeatureRow;
