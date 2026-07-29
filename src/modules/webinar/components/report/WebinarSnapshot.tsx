import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { WebinarMaturityLevel, WebinarScoreCategory, WebinarScoring } from "@/modules/webinar/types";
import { CALENDLY_URL } from "@/modules/shared/constants";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { ArcRing } from "./ArcRing";
import i18n from "@/i18n/config";

const EASE  = [0.22, 1, 0.36, 1] as const;
const TEAL  = "#10453F";
const BRAND = "#6AD39C";

const MATURITY_COLOR: Record<WebinarMaturityLevel, string> = {
  beginner:     "#F59E0B",
  explorer:     "#0EA5E9",
  practitioner: "#6366F1",
  pioneer:      BRAND,
};

const CATEGORY_COLOR: Record<WebinarScoreCategory, string> = {
  adoption:   BRAND,
  governance: "#6366F1",
  quality:    "#0EA5E9",
  antifraud:  "#F59E0B",
};

const CATEGORY_ORDER: WebinarScoreCategory[] = ["adoption", "governance", "quality", "antifraud"];

/** Congratulations / results screen shown once AI scoring completes.
 * Deliberately minimal — "a few numbers, not an audit" — laid out as one flat
 * card with internal dividers instead of several floating panels. Sized to fit
 * a single viewport without scrolling, scaling up on larger screens where the
 * extra room lets the same layout read comfortably instead of feeling cramped. */
export function WebinarSnapshot({ scoring, lang }: {
  scoring: WebinarScoring;
  lang: string;
}) {
  const t = i18n.getFixedT(lang === "en" ? "en" : "fr", "webinar");

  const score      = scoring.total100;
  const maturity    = scoring.maturityLevel;
  const scoreColor = MATURITY_COLOR[maturity];
  const hasPoints  = !!(scoring.strength || scoring.vigilance);

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col" style={{ background: "#F4F4F1" }}>
      <div className="flex-1 flex flex-col justify-center w-full max-w-[1040px] mx-auto px-3 sm:px-6 py-3 sm:py-6 min-h-0">

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="rounded-3xl border border-[#E7E5DE] bg-white overflow-hidden">

          {/* Header */}
          <div className="flex items-center gap-2.5 sm:gap-3 px-4 sm:px-7 lg:px-8 pt-4 sm:pt-6 pb-3 sm:pb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: TEAL }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="sm:size-[17px]">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[1.5px] text-slate-400">
                Talent AI · {t("snapshot.aiReport")}
              </p>
              <h1
                className="font-sans text-[1.15rem] sm:text-[1.65rem] lg:text-[1.75rem] leading-[1.15] tracking-tight font-semibold"
                style={{ color: TEAL }}
              >
                {t("snapshot.registeredTitle")}
              </h1>
            </div>
          </div>

          <div className="h-px bg-[#EEEDE7]" />

          {/* Score + sub-scores */}
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] lg:grid-cols-[220px_1fr] divide-y md:divide-y-0 md:divide-x divide-[#EEEDE7]">
            <div className="p-4 sm:p-5 lg:p-6 flex flex-row md:flex-col items-center justify-center gap-4 md:gap-2 lg:gap-3 text-center">
              <div className="relative shrink-0">
                <ArcRing value={score} size={84} stroke={7} color={scoreColor} className="lg:hidden" />
                <ArcRing value={score} size={100} stroke={8} color={scoreColor} className="hidden lg:block" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[1.35rem] lg:text-[1.65rem] font-bold leading-none tabular-nums" style={{ color: scoreColor }}>{score}</span>
                  <span className="text-[8px] lg:text-[9.5px] font-medium text-slate-400">/100</span>
                </div>
              </div>
              <div className="flex flex-col items-start md:items-center gap-1 lg:gap-1.5">
                <p className="text-[9px] lg:text-[9.5px] font-semibold uppercase tracking-[1.5px] text-slate-400">{t("snapshot.yourScore")}</p>
                <span className="text-[12.5px] lg:text-[13.5px] font-semibold" style={{ color: scoreColor }}>
                  {t(`snapshot.maturity.${maturity}`)}
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5 lg:p-6 flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-x-6 lg:gap-x-10 gap-y-3.5 lg:gap-y-5">
                {CATEGORY_ORDER.map((cat) => {
                  const value = scoring.subScores?.[cat] ?? 0;
                  const color = CATEGORY_COLOR[cat];
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-[13px] lg:text-[14.5px] mb-1.5 text-slate-500">
                        <span className="truncate pr-1 font-medium">{t(`snapshot.category.${cat}`)}</span>
                        <span className="font-bold tabular-nums shrink-0" style={{ color }}>{value}<span className="text-slate-300">/12</span></span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <motion.div className="h-full rounded-full" style={{ background: color }}
                          initial={{ width: 0 }} animate={{ width: `${(value / 12) * 100}%` }}
                          transition={{ delay: 0.3, duration: 0.7, ease: EASE }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {hasPoints && (
            <>
              <div className="h-px bg-[#EEEDE7]" />
              <div className="grid grid-cols-2 divide-x divide-[#EEEDE7]">
                {scoring.strength && (
                  <div className="p-4 sm:p-5 lg:p-6">
                    <p className="text-[9px] lg:text-[9.5px] font-semibold uppercase tracking-[1.5px] mb-1 text-slate-400">
                      {t("snapshot.strengthTitle")}
                    </p>
                    <p className="text-[12.5px] lg:text-[13.5px] leading-snug line-clamp-2 text-slate-700">
                      {scoring.strength.optionLabel} <span className="text-slate-400">— {scoring.strength.questionLabel}</span>
                    </p>
                  </div>
                )}
                {scoring.vigilance && (
                  <div className="p-4 sm:p-5 lg:p-6">
                    <p className="text-[9px] lg:text-[9.5px] font-semibold uppercase tracking-[1.5px] mb-1 text-slate-400">
                      {t("snapshot.vigilanceTitle")}
                    </p>
                    <p className="text-[12.5px] lg:text-[13.5px] leading-snug line-clamp-2 text-slate-700">
                      {scoring.vigilance.optionLabel} <span className="text-slate-400">— {scoring.vigilance.questionLabel}</span>
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="h-px bg-[#EEEDE7]" />

          {/* CTA */}
          <div className="p-4 sm:p-5 lg:p-6">
            <Button
              asChild
              size="lg"
              className="group w-full h-11 lg:h-12 rounded-xl bg-[#0F9D73] font-sans text-[13.5px] leading-none font-medium tracking-[-0.01em] text-white transition-colors hover:bg-[#0C8A64]"
            >
              <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                {t("snapshot.ctaBooking")}
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </a>
            </Button>
          </div>
        </motion.div>

        {/* Footer note */}
        <p className="text-[10.5px] lg:text-[11px] text-slate-400 leading-snug text-center mt-3">
          {t("snapshot.emailNotice")} · {t("snapshot.confidential")}
        </p>
      </div>
    </div>
  );
}
