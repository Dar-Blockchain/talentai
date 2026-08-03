import React from "react";

const TEAL        = "#0D9488";
const TEAL_BG     = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

interface Props {
  icon: React.ReactNode;
  title: string;
}

const SectionTitle: React.FC<Props> = ({ icon, title }) => (
  <div className="flex items-center gap-2 mb-4">
    <div
      className="flex h-7 w-7 items-center justify-center rounded-[6px] border"
      style={{ backgroundColor: TEAL_BG, borderColor: TEAL_BORDER, color: TEAL }}
    >
      {icon}
    </div>
    <span className="text-[13px] font-bold uppercase tracking-wide text-gray-700">
      {title}
    </span>
  </div>
);

export default SectionTitle;
