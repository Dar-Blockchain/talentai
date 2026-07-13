import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/modules/shared/ui/shadcn/select";
import type { WebinarQuestion } from "@/modules/webinar/types";
import { ChevronIcon } from "../shared/icons";
import { QuestionOption } from "./QuestionOption";
import { QuestionScale } from "./QuestionScale";

const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const COUNTRIES = [
  "Tunisie","France","Belgique","Luxembourg","Suisse","Monaco",
  "Maroc","Algérie","Libye","Sénégal","Côte d'Ivoire","Cameroun","Mali",
  "Burkina Faso","Guinée","Togo","Bénin","Niger","Tchad","Congo","Gabon",
  "Madagascar","Rwanda","Burundi","Nigeria","Kenya","Ghana","South Africa",
  "Egypt","Ethiopia","Tanzania","Uganda","Mozambique","Zambia","Zimbabwe",
  "Sudan","Somalia","UAE","Saudi Arabia","Qatar","Kuwait","Bahrain","Oman",
  "Jordan","Lebanon","Iraq","Germany","Spain","Italy","Netherlands","Portugal",
  "United Kingdom","United States","Canada","Brazil","India","China","Japan",
  "Australia","Other",
].sort();

export function WebinarQuestionSlide({ q, idx, total, lang, value, onChange, onNext, onBack, saving, isLast, active }: {
  q: WebinarQuestion; idx: number; total: number; lang: string;
  value: unknown; onChange: (v: unknown) => void;
  onNext: () => void; onBack: () => void; saving: boolean; isLast: boolean; active: boolean;
}) {
  const isEn    = lang === "en";
  const label   = (isEn ? q.label_en : q.label_fr) || q.label_fr || q.label_en;
  const hasValue = value !== undefined && value !== "" && value !== null;

  // A "choice" question with no options defined (e.g. left on the type
  // selector's default while the admin only ever intended free text) is
  // just as broken as an unrecognised type — treat both the same way.
  const hasChoiceOptions = q.type === "choice" && (q.options?.length ?? 0) > 0;
  const isFreeInput =
    (q.type !== "choice" && q.type !== "scale" && q.type !== "select") ||
    (q.type === "choice" && !hasChoiceOptions);

  // onNext is captured by the deferred setTimeout below, but the onChange
  // call right before it triggers a state update in the parent that hasn't
  // landed yet — a plain closure would call a stale onNext still bound to
  // the answers snapshot from before this selection. Route through a ref
  // that's always kept current so the timer calls the latest one instead.
  const onNextRef = useRef(onNext);
  useEffect(() => { onNextRef.current = onNext; }, [onNext]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleChoice = (key: string) => {
    onChange(key);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onNextRef.current(), 400);
  };
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div className="flex flex-col justify-center px-5 py-12 max-w-[620px] mx-auto w-full">
      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: active ? 1 : 0, x: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="flex items-center gap-2 mb-5">
        <span className="text-[13px] font-black text-[#10453F] tabular-nums">Question {idx + 1}</span>
        <ChevronIcon dir="right" />
        <span className="text-[13px] text-slate-400">{isEn ? `of ${total}` : `sur ${total}`}</span>
      </motion.div>

      <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: active ? 1 : 0, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-[1.4rem] sm:text-[1.7rem] text-slate-900 leading-snug mb-8"
        style={{ fontFamily: "var(--font-fraunces)", fontWeight: 600 }}>
        {label}
      </motion.h2>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: active ? 1 : 0, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18 }}>

        {hasChoiceOptions && (
          <div className="space-y-2.5">
            {q.options.map((opt, i) => (
              <QuestionOption key={opt.key} letter={ALPHA[i]}
                label={(isEn ? opt.label_en : opt.label_fr) || opt.label_fr || opt.label_en}
                selected={value === opt.key}
                onClick={() => handleChoice(opt.key)}
              />
            ))}
          </div>
        )}

        {q.type === "scale" && <QuestionScale value={value as number | undefined} onChange={onChange} lang={lang} />}

        {q.type === "select" && (
          <Select value={(value as string) || undefined} onValueChange={onChange}>
            <SelectTrigger className="w-full h-auto rounded-2xl border-2 border-[#E7E5DE] px-5 py-4 text-[15px] text-slate-700 bg-white shadow-[0_1px_3px_rgba(16,69,63,0.05)] data-[state=open]:border-[#6AD39C] data-[state=open]:ring-[#6AD39C]/20">
              <SelectValue placeholder={isEn ? "Select…" : "Sélectionner…"} />
            </SelectTrigger>
            <SelectContent>
              {(q.options?.length ?? 0) > 0
                ? q.options.map(o => <SelectItem key={o.key} value={o.key}>{(isEn ? o.label_en : o.label_fr) || o.label_fr || o.label_en}</SelectItem>)
                : COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)
              }
            </SelectContent>
          </Select>
        )}

        {/* Fallback: an unrecognised type, or a "choice" question with no options
            defined (e.g. left on the default while only free text was intended),
            gets a text input instead of silently rendering nothing. */}
        {isFreeInput && (
          <textarea value={(value as string) || ""}
            onChange={e => onChange(e.target.value)}
            placeholder={isEn ? "Your answer…" : "Votre réponse…"}
            rows={4}
            className="w-full rounded-2xl border-2 border-[#E7E5DE] focus:border-[#6AD39C] outline-none px-5 py-4 text-[15px] text-slate-700 placeholder:text-slate-300 resize-none transition-colors bg-white shadow-[0_1px_3px_rgba(16,69,63,0.05)]"
          />
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: active ? 1 : 0, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-center gap-3 mt-8">
        {idx > 0 && (
          <button onClick={onBack}
            className="w-12 h-12 rounded-2xl border-2 border-[#E7E5DE] bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-all flex items-center justify-center">
            <ChevronIcon dir="left" />
          </button>
        )}
        <motion.button onClick={onNext} disabled={saving || (q.required && !hasValue)}
          whileHover={!saving ? { y: -1 } : {}}
          whileTap={!saving ? { scale: 0.98 } : {}}
          className={`flex-1 h-12 rounded-2xl text-[15px] font-semibold transition-all
            ${saving || (q.required && !hasValue)
              ? "bg-slate-100 text-slate-300 cursor-not-allowed"
              : "bg-[#6AD39C] text-[#0B2A22] hover:bg-[#52C88A] shadow-[0_2px_12px_rgba(106,211,156,0.35)]"}`}
        >
          {saving
            ? <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-[#0B2A22]/20 border-t-[#0B2A22] rounded-full animate-spin" />
                {isEn ? "Saving…" : "Enregistrement…"}
              </span>
            : isLast
              ? (isEn ? "Confirm" : "Confirmer")
              : (isEn ? "Next →" : "Suivant →")}
        </motion.button>
      </motion.div>

      {!hasChoiceOptions && hasValue && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: active ? 0.5 : 0 }} transition={{ delay: 0.2 }}
          className="text-center text-[11px] text-slate-400 mt-4">
          {isEn ? "Press Enter to continue" : "Appuyez sur Entrée pour continuer"}
        </motion.p>
      )}
    </div>
  );
}
