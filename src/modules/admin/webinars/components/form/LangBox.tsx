import React from "react";

/** Bordered per-language card used to keep FR/EN content visually separate
 * whenever a webinar's language is set to "both". */
export function LangBox({ flag, name, children }: { flag: string; name: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5">
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className="text-[14px] leading-none">{flag}</span>
        <span className="text-[11px] font-black text-slate-600 uppercase tracking-wide">{name}</span>
      </div>
      {children}
    </div>
  );
}

export default LangBox;
