import { motion } from "framer-motion";
import { CheckIcon } from "../shared/icons";

export function QuestionOption({ label, selected, onClick, letter }: {
  label: string; selected: boolean; onClick: () => void; letter?: string;
}) {
  return (
    <motion.button onClick={onClick} whileTap={{ scale: 0.97 }}
      className={`group w-full text-left flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all duration-150 cursor-pointer
        ${selected
          ? "border-[#10453F] bg-[#10453F] text-white shadow-[0_4px_20px_rgba(16,69,63,0.30)]"
          : "border-[#E7E5DE] bg-white text-slate-700 shadow-[0_1px_3px_rgba(16,69,63,0.05)] hover:border-[#6AD39C]/70 hover:bg-[#EAF6F0] hover:shadow-[0_4px_14px_rgba(16,69,63,0.08)]"}`}
    >
      {letter && (
        <span className={`shrink-0 w-7 h-7 rounded-lg text-[12px] font-bold flex items-center justify-center transition-colors
          ${selected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-[#6AD39C]/20 group-hover:text-[#10453F]"}`}>
          {letter}
        </span>
      )}
      <span className="text-[15px] font-medium leading-snug flex-1">{label}</span>
      {selected && <CheckIcon />}
    </motion.button>
  );
}
