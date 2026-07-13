import { motion } from "framer-motion";
import type { WebinarScoring } from "@/modules/webinar/types";
import { ArcRing } from "./ArcRing";

const EASE  = [0.22, 1, 0.36, 1] as const;
const TEAL  = "#10453F";
const BRAND = "#6AD39C";

/** Congratulations / results screen shown once AI scoring completes. */
export function WebinarSnapshot({ scoring, lang }: { scoring: WebinarScoring; lang: string }) {
  const isEn       = lang === "en";
  const score      = scoring.readiness_score ?? Math.round((scoring.maturite_ia + scoring.intensite_pain) / 2);
  const scoreColor = score >= 65 ? BRAND : score >= 35 ? TEAL : "#F59E0B";
  const scoreLabel = score >= 65
    ? (isEn ? "Strong profile"  : "Profil solide")
    : score >= 35
      ? (isEn ? "Good potential" : "Bon potentiel")
      : (isEn ? "Keep growing"   : "En progression");

  const bars = [
    { label: isEn ? "Knowledge"  : "Maîtrise",   value: scoring.maturite_ia,   color: BRAND },
    { label: isEn ? "Engagement" : "Engagement",  value: scoring.intensite_pain, color: TEAL  },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FBFBF9" }}>
      <div className="relative flex-1 flex flex-col items-center justify-center px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="w-full max-w-[420px]">

          {/* Checkmark */}
          <div className="flex justify-center mb-7">
            <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 280, damping: 18 }}
              className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center"
              style={{ background: TEAL, boxShadow: "0 8px 32px rgba(16,69,63,0.35)" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </motion.div>
          </div>

          {/* Headline */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-center mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[2.5px] mb-3" style={{ color: BRAND }}>
              Talent AI · {isEn ? "AI Report" : "Rapport IA"}
            </p>
            <h1
              className="text-[2.2rem] leading-[1.1] tracking-tight mb-3"
              style={{ fontFamily: "var(--font-fraunces)", fontWeight: 600, color: TEAL }}
            >
              {isEn ? "You're registered!" : "Vous êtes inscrit !"}
            </h1>
            <p className="text-[15px] text-slate-500 leading-relaxed">
              {isEn
                ? "Your profile has been analysed by our AI engine."
                : "Votre profil a été analysé par notre moteur IA."}
            </p>
          </motion.div>

          {/* Score card */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-2xl p-6 mb-4 text-center border border-[#E7E5DE] bg-white shadow-[0_10px_30px_-16px_rgba(16,69,63,0.25)]">

            <p className="text-[10.5px] font-bold uppercase tracking-[2px] mb-4 text-slate-400">
              {isEn ? "Your readiness score" : "Votre score de disposition"}
            </p>

            <div className="flex items-center justify-center gap-6">
              <div className="relative shrink-0">
                <ArcRing value={score} size={100} stroke={9} color={scoreColor} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[1.7rem] font-black leading-none tabular-nums" style={{ color: scoreColor }}>{score}</span>
                  <span className="text-[9px] font-bold text-slate-400">/100</span>
                </div>
              </div>

              <div className="flex-1 space-y-2.5 text-left min-w-0">
                {bars.map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-[10.5px] mb-1 text-slate-400">
                      <span>{label}</span>
                      <span className="font-bold tabular-nums" style={{ color }}>{value}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200">
                      <motion.div className="h-full rounded-full" style={{ background: color }}
                        initial={{ width: 0 }} animate={{ width: `${value}%` }}
                        transition={{ delay: 0.55, duration: 1, ease: EASE }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: scoreColor + "18", border: `1px solid ${scoreColor}30` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: scoreColor }} />
              <span className="text-[11px] font-bold" style={{ color: scoreColor }}>{scoreLabel}</span>
            </div>
          </motion.div>

          {/* Email notice */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-[#E7E5DE] bg-white">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(16,69,63,0.08)", border: "1px solid rgba(16,69,63,0.15)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
            <p className="text-[13px] text-slate-600 leading-snug flex-1">
              {isEn
                ? "Your join link & full report are on their way to your inbox."
                : "Votre lien de connexion et votre rapport complet arrivent dans votre boîte mail."}
            </p>
          </motion.div>

          <p className="mt-7 text-center text-[10.5px] text-slate-300">
            Talent AI · {isEn ? "Confidential · No spam" : "Données confidentielles · Aucun spam"}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
