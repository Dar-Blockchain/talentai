import React from "react";

const Section: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6">
    <div className="px-6 py-5 border-b border-gray-100">
      <p className="font-poppins font-bold text-[0.95rem] text-gray-900">{title}</p>
      {subtitle && (
        <p className="font-poppins text-[0.8rem] text-gray-400 mt-1">{subtitle}</p>
      )}
    </div>
    <div className="px-6 py-6">{children}</div>
  </div>
);

export default Section;
