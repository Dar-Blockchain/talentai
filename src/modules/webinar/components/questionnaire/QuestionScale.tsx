import { motion } from "framer-motion";
import i18n from "@/i18n/config";

export function QuestionScale({ value, onChange, lang }: { value?: number; onChange: (v: number) => void; lang: string }) {
  const t = i18n.getFixedT(lang === "en" ? "en" : "fr", "webinar");
  const labels = [
    "",
    t("scale.notAtAll"),
    t("scale.slightly"),
    t("scale.neutral"),
    t("scale.ratherYes"),
    t("scale.absolutely"),
  ];
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {[1,2,3,4,5].map(n => (
          <motion.button key={n} onClick={() => onChange(n)} whileTap={{ scale: 0.93 }}
            className={`flex-1 h-14 rounded-2xl border-2 text-[20px] font-bold transition-all
              ${value === n
                ? "border-[#10453F] bg-[#10453F] text-white shadow-[0_4px_20px_rgba(16,69,63,0.30)]"
                : "border-[#E7E5DE] bg-white text-slate-500 shadow-[0_1px_3px_rgba(16,69,63,0.05)] hover:border-[#6AD39C]/70 hover:bg-[#EAF6F0]"}`}
          >{n}</motion.button>
        ))}
      </div>
      <div className="flex justify-between text-[12px] text-slate-400 px-0.5">
        <span>{labels[1]}</span><span>{labels[5]}</span>
      </div>
      {value !== undefined && (
        <motion.p key={value} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="text-center text-[14px] font-semibold text-slate-800">{labels[value]}</motion.p>
      )}
    </div>
  );
}
