import React from "react";

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <span className="text-[0.72rem] font-bold text-[#94A3B8] uppercase tracking-[0.06em]">{title}</span>
    </div>
    {children}
  </div>
);

export default Section;
