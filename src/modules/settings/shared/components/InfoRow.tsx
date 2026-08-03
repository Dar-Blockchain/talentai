import React from "react";

interface InfoRowProps {
  icon: React.ReactNode;
  iconBg: string;
  iconBorder: string;
  label: string;
  value: string;
  chip?: React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, iconBg, iconBorder, label, value, chip }) => (
  <div className="flex items-center gap-3">
    <div
      className="w-10 h-10 rounded-[10px] flex-shrink-0 border flex items-center justify-center"
      style={{ backgroundColor: iconBg, borderColor: iconBorder }}
    >
      {icon}
    </div>
    <div className="flex-1">
      <p className="font-poppins text-[0.78rem] text-gray-400 mb-1">{label}</p>
      <p className="font-poppins font-semibold text-[0.9rem] text-gray-900">{value}</p>
    </div>
    {chip}
  </div>
);

export default InfoRow;
