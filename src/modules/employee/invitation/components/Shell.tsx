import React from "react";
import Image from "next/image";

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/40 flex flex-col items-center justify-center px-4 py-10">
    <div className="w-full max-w-md flex-1 flex flex-col justify-center">
      {children}
    </div>

    <div className="mt-8 flex items-center gap-2.5">
      <Image src="/logo.svg" alt="TalentAI" width={100} height={28} className="h-7 w-25 object-contain" />
      <span className="text-[11px] text-slate-300 font-medium">
        © {new Date().getFullYear()}
      </span>
    </div>
  </div>
);

export default Shell;
