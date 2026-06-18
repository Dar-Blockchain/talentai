import React from "react";

const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-5">
    <p className="text-[0.9rem] font-bold text-gray-900">{title}</p>
    {subtitle && <p className="text-[0.78rem] text-gray-400 mt-1">{subtitle}</p>}
  </div>
);

export default SectionTitle;
