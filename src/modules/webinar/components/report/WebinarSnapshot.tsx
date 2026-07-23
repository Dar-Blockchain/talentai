import { motion } from "framer-motion";
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
 * Deliberately minimal — "a few numbers, not an audit" — and laid out to fit
 * a single viewport (side-by-side panels instead of one long stacked column)
 * so nothing gets lost below the fold. */
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
    <div className="h-screen w-full overflow-y-auto flex flex-col" style={{ background: "#FBFBF9" }}>
      <div className="flex-1 flex flex-col justify-center w-full max-w-[860px] mx-auto px-4 sm:px-6 py-5">

        {/* Compact header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="flex items-center gap-3 mb-4 sm:mb-5">
          <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.05, type: "spring", stiffness: 280, damping: 18 }}
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: TEAL, boxShadow: "0 6px 20px rgba(16,69,63,0.3)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </motion.div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[2px]" style={{ color: BRAND }}>
              Talent AI · {t("snapshot.aiReport")}
            </p>
            <h1
              className="text-[1.4rem] sm:text-[1.6rem] leading-[1.1] tracking-tight"
              style={{ fontFamily: "var(--font-fraunces)", fontWeight: 600, color: TEAL }}
            >
              {t("snapshot.registeredTitle")}
            </h1>
          </div>
        </motion.div>

        {/* Score + sub-scores — side by side so the report reads across, not down */}
        <div className="grid grid-cols-1 md:grid-cols-[212px_1fr] gap-3 sm:gap-4 mb-3 sm:mb-4">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="rounded-2xl p-4 flex flex-row md:flex-col items-center justify-center gap-4 md:gap-2.5 text-center border border-[#E7E5DE] bg-white shadow-[0_10px_30px_-16px_rgba(16,69,63,0.25)]">
            <div className="relative shrink-0">
              <ArcRing value={score} size={92} stroke={8} color={scoreColor} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[1.55rem] font-black leading-none tabular-nums" style={{ color: scoreColor }}>{score}</span>
                <span className="text-[8px] font-bold text-slate-400">/100</span>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-center gap-1">
              <p className="text-[9.5px] font-bold uppercase tracking-[1.5px] text-slate-400">{t("snapshot.yourScore")}</p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: scoreColor + "18", border: `1px solid ${scoreColor}30` }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: scoreColor }} />
                <span className="text-[10.5px] font-bold" style={{ color: scoreColor }}>{t(`snapshot.maturity.${maturity}`)}</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="rounded-2xl p-4 flex flex-col justify-center border border-[#E7E5DE] bg-white shadow-[0_10px_30px_-16px_rgba(16,69,63,0.25)]">
            <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">
              {CATEGORY_ORDER.map((cat) => {
                const value = scoring.subScores?.[cat] ?? 0;
                const color = CATEGORY_COLOR[cat];
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-[10px] mb-1 text-slate-400">
                      <span className="truncate pr-1">{t(`snapshot.category.${cat}`)}</span>
                      <span className="font-bold tabular-nums shrink-0" style={{ color }}>{value}<span className="text-slate-300">/12</span></span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200">
                      <motion.div className="h-full rounded-full" style={{ background: color }}
                        initial={{ width: 0 }} animate={{ width: `${(value / 12) * 100}%` }}
                        transition={{ delay: 0.4, duration: 0.8, ease: EASE }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Strength + vigilance — side by side */}
        {hasPoints && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 sm:mb-4">
            {scoring.strength && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
                className="rounded-xl p-3 border" style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}>
                <p className="text-[9px] font-bold uppercase tracking-[1.5px] mb-0.5" style={{ color: "#15803D" }}>
                  {t("snapshot.strengthTitle")}
                </p>
                <p className="text-[12px] leading-snug line-clamp-2" style={{ color: "#166534" }}>
                  {scoring.strength.optionLabel} <span className="text-[#4D7C0F]">— {scoring.strength.questionLabel}</span>
                </p>
              </motion.div>
            )}
            {scoring.vigilance && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="rounded-xl p-3 border" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
                <p className="text-[9px] font-bold uppercase tracking-[1.5px] mb-0.5" style={{ color: "#B45309" }}>
                  {t("snapshot.vigilanceTitle")}
                </p>
                <p className="text-[12px] leading-snug line-clamp-2" style={{ color: "#92400E" }}>
                  {scoring.vigilance.optionLabel} <span className="text-[#B45309]">— {scoring.vigilance.questionLabel}</span>
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* Soft CTA — no sales pitch, just a low-pressure 1:1 invite */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}
          className="mb-3">
          <Button asChild variant="outline" size="lg" className="w-full rounded-xl text-[12.5px]">
            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
              {t("snapshot.ctaBooking")}
            </a>
          </Button>
        </motion.div>

        {/* Footer note — email notice + confidential, merged into one slim line */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }}
          className="flex items-center justify-center gap-1.5 text-center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
          <p className="text-[10.5px] text-slate-400 leading-snug">
            {t("snapshot.emailNotice")} · {t("snapshot.confidential")}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
