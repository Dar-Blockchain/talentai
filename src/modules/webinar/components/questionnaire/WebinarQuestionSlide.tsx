import { motion } from "framer-motion";
import { Checkbox } from "@/modules/shared/ui/shadcn/checkbox";
import type { WebinarQuestion } from "@/modules/webinar/types";
import { ChevronIcon } from "../shared/icons";
import { QuestionOption } from "./QuestionOption";
import { QuestionScale } from "./QuestionScale";
import { WebinarSubmitButton } from "../landing/WebinarSubmitButton";
import i18n from "@/i18n/config";

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
  const t       = i18n.getFixedT(isEn ? "en" : "fr", "webinar");
  const label   = (isEn ? q.label_en : q.label_fr) || q.label_fr || q.label_en;
  const hasValue = Array.isArray(value)
    ? value.length > 0
    : value !== undefined && value !== "" && value !== null;

  // "select" is a legacy type from the old dropdown-style display — it's
  // rendered with the same option cards as "choice" now, falling back to a
  // country list when it was configured with no options of its own.
  const isChoiceLike = q.type === "choice" || q.type === "select";
  const choiceItems: { key: string; label: string }[] = isChoiceLike
    ? (q.options?.length ?? 0) > 0
      ? q.options.map(o => ({ key: o.key, label: (isEn ? o.label_en : o.label_fr) || o.label_fr || o.label_en }))
      : q.type === "select" ? COUNTRIES.map(c => ({ key: c, label: c })) : []
    : [];
  const hasChoiceOptions = choiceItems.length > 0;
  const hasMultiselectOptions = q.type === "multiselect" && (q.options?.length ?? 0) > 0;

  // A "choice" question with no options defined (e.g. left on the type
  // selector's default while the admin only ever intended free text) is
  // just as broken as an unrecognised type — treat both the same way.
  const isFreeInput =
    (q.type !== "choice" && q.type !== "scale" && q.type !== "select" && q.type !== "multiselect") ||
    (isChoiceLike && !hasChoiceOptions) ||
    (q.type === "multiselect" && !hasMultiselectOptions);

  // Picking a card only records the answer — it never advances on its own,
  // so a misclick doesn't skip a question. Moving on is always an explicit
  // Next/Confirm click (or Enter).
  const handleChoice = (key: string) => onChange(key);

  // Multiselect never auto-advances either (there's no single "final" pick
  // that signals completion) — just toggle the key in/out of the answer
  // array and let the visitor hit the Next button themselves.
  const selectedKeys = Array.isArray(value) ? (value as string[]) : [];
  const toggleMultiselect = (key: string) => {
    onChange(
      selectedKeys.includes(key)
        ? selectedKeys.filter((k) => k !== key)
        : [...selectedKeys, key],
    );
  };

  return (
    <div className="flex flex-col justify-center px-5 py-12 max-w-[620px] mx-auto w-full">
      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: active ? 1 : 0, x: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="flex items-center gap-2 mb-5">
        <span className="text-[13px] font-black text-[#10453F] tabular-nums">Question {idx + 1}</span>
        <ChevronIcon dir="right" />
        <span className="text-[13px] text-slate-400">{t("question.of", { total })}</span>
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
            {choiceItems.map((opt, i) => (
              <QuestionOption key={opt.key} letter={ALPHA[i]}
                label={opt.label}
                selected={value === opt.key}
                onClick={() => handleChoice(opt.key)}
              />
            ))}
          </div>
        )}

        {hasMultiselectOptions && (
          <div className="space-y-2.5">
            {q.options.map((opt) => {
              const selected = selectedKeys.includes(opt.key);
              return (
                // A <label> here would double-fire: Radix's Checkbox renders a
                // <button>, which is a "labelable" element, so the browser
                // implicitly forwards a second synthetic click to it on every
                // label click — toggling on then immediately back off. A
                // plain <div> with its own click/keyboard handling avoids that.
                <div key={opt.key} role="checkbox" aria-checked={selected} tabIndex={0}
                  onClick={() => toggleMultiselect(opt.key)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleMultiselect(opt.key);
                    }
                  }}
                  className={`group w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all duration-150 cursor-pointer outline-none
                    ${selected
                      ? "border-[#6AD39C]/70 bg-[#EAF6F0] text-slate-700 shadow-[0_4px_14px_rgba(16,69,63,0.08)]"
                      : "border-[#E7E5DE] bg-white text-slate-700 shadow-[0_1px_3px_rgba(16,69,63,0.05)] hover:border-[#6AD39C]/70 hover:bg-[#EAF6F0] hover:shadow-[0_4px_14px_rgba(16,69,63,0.08)]"}`}
                >
                  <Checkbox checked={selected} className="shrink-0 size-5 pointer-events-none border-slate-300 data-[state=checked]:bg-[#10453F] data-[state=checked]:border-[#10453F] data-[state=checked]:text-white" />
                  <span className="text-[15px] font-medium leading-snug flex-1">
                    {(isEn ? opt.label_en : opt.label_fr) || opt.label_fr || opt.label_en}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {q.type === "scale" && <QuestionScale value={value as number | undefined} onChange={onChange} />}

        {/* Fallback: an unrecognised type, or a "choice" question with no options
            defined (e.g. left on the default while only free text was intended),
            gets a text input instead of silently rendering nothing. */}
        {isFreeInput && (
          <textarea value={(value as string) || ""}
            onChange={e => onChange(e.target.value)}
            placeholder={t("question.yourAnswer")}
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
        <WebinarSubmitButton
          type="button"
          onClick={onNext}
          loading={saving}
          disabled={saving || (q.required && !hasValue)}
          label={isLast ? t("question.confirm") : t("question.next")}
          className="flex-1 h-12 rounded-2xl shadow-[0_2px_12px_rgba(106,211,156,0.35)]"
        />
      </motion.div>

      {hasValue && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: active ? 0.5 : 0 }} transition={{ delay: 0.2 }}
          className="text-center text-[11px] text-slate-400 mt-4">
          {t("question.pressEnter")}
        </motion.p>
      )}
    </div>
  );
}
