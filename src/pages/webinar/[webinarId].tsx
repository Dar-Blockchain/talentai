import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/modules/shared/layouts/home/HomeHeader";
import { webinarApi } from "@/modules/webinar/api";
import type { WebinarScoring } from "@/modules/webinar/types";

// ── Types ─────────────────────────────────────────────────────────────────────
interface QuestionOption { key: string; label_fr: string; label_en: string; }
interface DBQuestion {
  key: string; order: number; type: "choice" | "scale" | "text" | "select";
  label_fr: string; label_en: string; options: QuestionOption[]; required: boolean;
}
interface WebinarData { _id: string; title: string; questions: DBQuestion[]; lang: string; }

const EASE = [0.32, 0.72, 0, 1] as [number, number, number, number];
const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

// ── Option chip ───────────────────────────────────────────────────────────────
function Option({ label, selected, onClick, letter }: {
  label: string; selected: boolean; onClick: () => void; letter?: string;
}) {
  return (
    <motion.button onClick={onClick} whileTap={{ scale: 0.97 }}
      className={`group w-full text-left flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all duration-150 cursor-pointer
        ${selected
          ? "border-teal-600 bg-teal-600 text-white shadow-[0_4px_20px_rgba(13,148,136,0.30)]"
          : "border-slate-200 bg-white/80 text-slate-700 hover:border-teal-300 hover:bg-teal-50/60 backdrop-blur-sm"}`}
    >
      {letter && (
        <span className={`shrink-0 w-7 h-7 rounded-lg text-[12px] font-bold flex items-center justify-center transition-colors
          ${selected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-teal-100 group-hover:text-teal-700"}`}>
          {letter}
        </span>
      )}
      <span className="text-[15px] font-medium leading-snug flex-1">{label}</span>
      {selected && (
        <svg className="ml-auto shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      )}
    </motion.button>
  );
}

// ── Scale ─────────────────────────────────────────────────────────────────────
function Scale({ value, onChange, lang }: { value?: number; onChange: (v: number) => void; lang: string }) {
  const lo = lang === "en" ? "Not at all" : "Pas du tout";
  const hi = lang === "en" ? "Absolutely" : "Absolument";
  const labels = lang === "en"
    ? ["", "Not at all", "Slightly", "Neutral", "Rather yes", "Absolutely"]
    : ["", "Pas du tout", "Peu", "Neutre", "Plutôt oui", "Absolument"];
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {[1,2,3,4,5].map(n => (
          <motion.button key={n} onClick={() => onChange(n)} whileTap={{ scale: 0.93 }}
            className={`flex-1 h-14 rounded-2xl border-2 text-[20px] font-bold transition-all
              ${value === n
                ? "border-teal-600 bg-teal-600 text-white shadow-[0_4px_20px_rgba(13,148,136,0.30)]"
                : "border-slate-200 bg-white/80 text-slate-500 hover:border-teal-300 hover:bg-teal-50/60"}`}
          >{n}</motion.button>
        ))}
      </div>
      <div className="flex justify-between text-[12px] text-slate-400 px-0.5">
        <span>{lo}</span><span>{hi}</span>
      </div>
      {value !== undefined && (
        <motion.p key={value} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="text-center text-[14px] font-semibold text-slate-800">{labels[value]}</motion.p>
      )}
    </div>
  );
}

// ── Arc progress ring ─────────────────────────────────────────────────────────
function ArcRing({ value, size = 120, stroke = 10, color }: { value: number; size?: number; stroke?: number; color: string }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }} />
    </svg>
  );
}

// ── Snapshot results page ─────────────────────────────────────────────────────
function Snapshot({ scoring, lang, questions, answers }: {
  scoring: WebinarScoring; lang: string; questions: DBQuestion[]; answers: Record<string, any>;
}) {
  const { maturite_ia, intensite_pain, readiness_score, tier, key_insight, main_pain, recommended_action, strengths, blockers } = scoring;
  const readiness = readiness_score ?? Math.round((maturite_ia + intensite_pain) / 2);

  // ── Design tokens — brand green palette (matches landing page) ──
  const C = {
    brand:   "#6AD39C",   // primary mint green — landing page brand color
    teal:    "#0D9488",   // teal-600 — landing page secondary
    red:     "#F43F5E",   // rose-500
    amber:   "#F59E0B",   // amber-400
    muted:   "#94A3B8",   // slate-400
  };

  const matLvl  = maturite_ia  < 35 ? 0 : maturite_ia  < 65 ? 1 : 2;
  const painLvl = intensite_pain < 35 ? 0 : intensite_pain < 65 ? 1 : 2;
  const readLvl = readiness < 35 ? 0 : readiness < 65 ? 1 : 2;

  const matColor  = [C.amber, C.teal, C.brand][matLvl];
  const painColor = [C.muted, C.amber, C.red][painLvl];
  const readColor = [C.muted, C.teal, C.brand][readLvl];

  const matLabel  = lang === "en"
    ? (["Emerging","Developing","Advanced"])[matLvl]
    : (["Émergent","En cours","Avancé"])[matLvl];
  const painLabel = lang === "en"
    ? (["Low","Moderate","Critical"])[painLvl]
    : (["Faible","Modéré","Critique"])[painLvl];
  const readLabel = lang === "en"
    ? (["Not ready","Warming up","Ready"])[readLvl]
    : (["Pas encore","En réflexion","Prêt"])[readLvl];

  type TierKey = "A" | "B" | "C" | "D";
  const TIER: Record<TierKey, { label: string; labelEn: string; desc: string; descEn: string; dot: string }> = {
    A: { label: "Profil A — Fortement aligné", labelEn: "Profile A — Strongly aligned", desc: "Toutes les conditions sont réunies pour avancer maintenant.", descEn: "All conditions are met to move forward now.", dot: C.brand },
    B: { label: "Profil B — Bon potentiel",    labelEn: "Profile B — Good potential",   desc: "Profil prometteur à accompagner sur les prochaines semaines.",  descEn: "Promising profile worth nurturing over the next weeks.", dot: C.teal  },
    C: { label: "Profil C — À maturité",       labelEn: "Profile C — Maturing",         desc: "Intéressant mais trop tôt — recontacter dans 2–3 mois.",      descEn: "Interesting but too early — re-engage in 2–3 months.", dot: C.amber },
    D: { label: "Hors cible",                  labelEn: "Out of scope",                 desc: "Profil non prioritaire pour notre solution actuelle.",          descEn: "Not a priority profile for our current solution.",    dot: C.muted },
  };
  const tm = tier && TIER[tier as TierKey] ? TIER[tier as TierKey] : null;

  const answered = [...questions].sort((a, b) => a.order - b.order)
    .filter(q => answers[q.key] !== undefined && answers[q.key] !== "");

  const getAnswerLabel = (q: DBQuestion, raw: any): string => {
    if (q.type === "scale") return `${raw}/5`;
    if (q.type === "text") { const s = String(raw).trim(); return s.length > 120 ? s.slice(0, 120) + "…" : s; }
    const opt = q.options.find(o => o.key === raw);
    return opt ? (lang === "en" ? opt.label_en : opt.label_fr) : String(raw);
  };

  const demoLink = process.env.NEXT_PUBLIC_WEBINAR_DEMO_LINK || "";

  // Shared section heading
  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="text-[10.5px] font-bold uppercase tracking-[2.5px] text-slate-400 mb-3">{children}</p>
  );

  return (
    <div style={{ background: "#F8F9FC" }} className="min-h-screen">

      {/* ── Hero header — brand dark card ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ background: "linear-gradient(135deg,#0A1F1C 0%,#10453F 60%,#0D6B5E 100%)" }}
        className="relative overflow-hidden px-6 pt-10 pb-8">

        {/* Background texture — matching landing page grid */}
        <div className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(106,211,156,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(106,211,156,0.07) 1px,transparent 1px)",
            backgroundSize: "28px 28px",
          }} />
        {/* Brand glow */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(106,211,156,0.20) 0%, transparent 70%)" }} />

        <div className="relative max-w-[600px] mx-auto">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-5">
            <div className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
              style={{ background: "rgba(106,211,156,0.15)", color: "#6AD39C", border: "1px solid rgba(106,211,156,0.25)" }}>
              Talent AI · {lang === "en" ? "AI Report" : "Rapport IA"}
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: "rgba(106,211,156,0.10)", border: "1px solid rgba(106,211,156,0.20)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#6AD39C" }} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#6AD39C" }}>
                {lang === "en" ? "Live" : "En direct"}
              </span>
            </div>
          </div>

          <h1 className="text-[1.9rem] font-black text-white leading-tight tracking-tight mb-1">
            {lang === "en" ? "Your AI Analysis" : "Votre analyse IA"}
          </h1>
          <p className="text-[13px]" style={{ color: "rgba(106,211,156,0.65)" }}>
            {lang === "en" ? "Personalized report based on your answers" : "Rapport personnalisé basé sur vos réponses"}
          </p>

          {/* ── Tier pill in hero ── */}
          {tm && tier && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="mt-5 inline-flex items-center gap-2.5 px-4 py-2 rounded-full"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: tm.dot }} />
              <span className="text-[12px] font-bold text-white">
                {lang === "en" ? tm.labelEn : tm.label}
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>

      <div className="max-w-[600px] mx-auto px-5 py-6 pb-24 space-y-4">

        {/* ── Three score metrics ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)" }}>
          <div className="grid grid-cols-3 divide-x divide-slate-100">
            {[
              { label: lang === "en" ? "AI Maturity" : "Maturité IA", value: maturite_ia, color: matColor, sub: matLabel },
              { label: lang === "en" ? "Pain Level"  : "Douleur",      value: intensite_pain, color: painColor, sub: painLabel },
              { label: lang === "en" ? "Readiness"   : "Disposition",  value: readiness, color: readColor, sub: readLabel },
            ].map(({ label, value, color, sub }, di) => (
              <motion.div key={label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 + di * 0.07 }}
                className="flex flex-col items-center text-center py-5 px-2">
                <div className="relative mb-3">
                  <ArcRing value={value} size={76} stroke={6} color={color} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[1.25rem] font-black leading-none tabular-nums" style={{ color }}>{value}</span>
                    <span className="text-[8.5px] text-slate-400 font-medium leading-tight">/100</span>
                  </div>
                </div>
                <p className="text-[11px] font-bold text-slate-700 leading-tight">{label}</p>
                <span className="mt-1 inline-block px-2 py-0.5 rounded-full text-[9.5px] font-bold"
                  style={{ background: color + "14", color }}>
                  {sub}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Key insight ── */}
        {key_insight && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
            className="bg-white rounded-2xl border border-slate-200/70 p-5"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)" }}>
            <SectionLabel>{lang === "en" ? "Key insight" : "Insight clé"}</SectionLabel>
            <div className="flex gap-3">
              <div className="mt-0.5 shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(106,211,156,0.12)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a7 7 0 0 1 5 12l-1 1v2a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-2l-1-1A7 7 0 0 1 12 2z"/><line x1="9" y1="21" x2="15" y2="21"/>
                </svg>
              </div>
              <p className="text-[13.5px] text-slate-700 leading-relaxed flex-1">{key_insight}</p>
            </div>
          </motion.div>
        )}

        {/* ── Main pain ── */}
        {main_pain && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.31 }}
            className="bg-white rounded-2xl border border-slate-200/70 p-5"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)" }}>
            <SectionLabel>{lang === "en" ? "Main pain point" : "Douleur principale"}</SectionLabel>
            <div className="flex gap-3">
              <div className="mt-0.5 shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "#FFF1F2" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <p className="text-[13.5px] text-slate-700 leading-relaxed flex-1">{main_pain}</p>
            </div>
          </motion.div>
        )}

        {/* ── Recommended action ── */}
        {recommended_action && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}
            className="bg-white rounded-2xl p-5 relative overflow-hidden"
            style={{ border: "1px solid rgba(13,148,136,0.25)", boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(13,148,136,0.07)" }}>
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg,#6AD39C,#0D9488)" }} />
            <SectionLabel>{lang === "en" ? "Recommended next step" : "Prochaine étape conseillée"}</SectionLabel>
            <div className="flex gap-3">
              <div className="mt-0.5 shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(106,211,156,0.12)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>
              <p className="text-[13.5px] text-slate-700 leading-relaxed flex-1 font-medium">{recommended_action}</p>
            </div>
          </motion.div>
        )}

        {/* ── Strengths & Blockers ── */}
        {((strengths && strengths.length > 0) || (blockers && blockers.length > 0)) && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.41 }}
            className="grid grid-cols-2 gap-3">
            {strengths && strengths.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/70 p-4"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.brand }} />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {lang === "en" ? "Strengths" : "Points forts"}
                  </p>
                </div>
                <ul className="space-y-2">
                  {strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <svg className="mt-[3px] shrink-0" width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="rgba(106,211,156,0.2)"/>
                        <polyline points="8 12 11 15 16 9" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-[12px] text-slate-600 leading-snug">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {blockers && blockers.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/70 p-4"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)" }}>
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.amber }} />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {lang === "en" ? "Blockers" : "Freins"}
                  </p>
                </div>
                <ul className="space-y-2">
                  {blockers.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <svg className="mt-[3px] shrink-0" width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="#FEF9C3"/>
                        <line x1="12" y1="8" x2="12" y2="13" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
                        <line x1="12" y1="16" x2="12.01" y2="16" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"/>
                      </svg>
                      <span className="text-[12px] text-slate-600 leading-snug">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Score bars ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46 }}
          className="bg-white rounded-2xl border border-slate-200/70 p-5"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)" }}>
          <SectionLabel>{lang === "en" ? "Score breakdown" : "Détail des scores"}</SectionLabel>
          <div className="space-y-4">
            {[
              { label: lang === "en" ? "AI Maturity"     : "Maturité IA",      value: maturite_ia,    color: matColor,  sub: matLabel,  i: 0 },
              { label: lang === "en" ? "Pain Intensity"  : "Intensité douleur", value: intensite_pain, color: painColor, sub: painLabel, i: 1 },
              { label: lang === "en" ? "Readiness to Act": "Disposition",       value: readiness,      color: readColor, sub: readLabel, i: 2 },
            ].map(({ label, value, color, sub, i }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[12.5px] font-semibold text-slate-800">{label}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                      style={{ background: color + "14", color }}>{sub}</span>
                  </div>
                  <span className="text-[13px] font-black tabular-nums" style={{ color }}>
                    {value}<span className="text-[9px] text-slate-300 font-normal">/100</span>
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "#F1F5F9" }}>
                  <motion.div className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg,${color}60,${color})` }}
                    initial={{ width: 0 }} animate={{ width: `${value}%` }}
                    transition={{ delay: 0.52 + i * 0.08, duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Tier detail card ── */}

        {/* ── Answers ── */}
        {answered.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.54 }}
            className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)" }}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
              <p className="text-[10.5px] font-bold uppercase tracking-[2.5px] text-slate-400">
                {lang === "en" ? "Your answers" : "Vos réponses"}
              </p>
              <span className="text-[10px] font-bold text-slate-300 tabular-nums">{answered.length}</span>
            </div>
            <div className="divide-y divide-slate-50">
              {answered.map((q, i) => {
                const raw = answers[q.key];
                return (
                  <motion.div key={q.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.58 + i * 0.025 }}
                    className="px-5 py-3.5 flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 w-5 h-5 rounded-md text-[9.5px] font-black flex items-center justify-center"
                      style={{ background: "rgba(106,211,156,0.15)", color: "#0D9488" }}>{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] text-slate-400 leading-snug mb-1.5">{lang === "en" ? q.label_en : q.label_fr}</p>
                      {q.type === "scale" ? (
                        <div className="flex items-center gap-1.5">
                          {[1,2,3,4,5].map(n => (
                            <div key={n} className="h-1.5 flex-1 rounded-full transition-colors"
                              style={{ background: n <= Number(raw) ? C.brand : "#E2E8F0" }} />
                          ))}
                          <span className="text-[11px] font-bold ml-2 tabular-nums" style={{ color: C.teal }}>{raw}/5</span>
                        </div>
                      ) : q.type === "text" ? (
                        <p className="text-[12.5px] text-slate-700 leading-relaxed">{getAnswerLabel(q, raw)}</p>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold"
                          style={{ background: "rgba(106,211,156,0.12)", color: "#0D9488", border: "1px solid rgba(13,148,136,0.25)" }}>
                          {getAnswerLabel(q, raw)}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── CTA ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.58 }}
          className="relative overflow-hidden rounded-2xl p-6 text-white"
          style={{ background: "linear-gradient(135deg,#0A1F1C 0%,#10453F 60%,#0D6B5E 100%)" }}>
          {/* Grid texture — same as hero */}
          <div className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: "linear-gradient(rgba(106,211,156,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(106,211,156,0.06) 1px,transparent 1px)",
              backgroundSize: "32px 32px",
            }} />
          {/* Glow */}
          <div className="pointer-events-none absolute -bottom-12 -right-12 w-56 h-56 rounded-full"
            style={{ background: "radial-gradient(circle,rgba(106,211,156,0.20) 0%,transparent 70%)" }} />

          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#6AD39C" }} />
              <p className="text-[10.5px] font-bold uppercase tracking-widest" style={{ color: "#6AD39C" }}>
                {lang === "en" ? "You're registered" : "Vous êtes inscrit"}
              </p>
            </div>
            <h3 className="text-[1.25rem] font-black leading-snug mb-2 text-white">
              {lang === "en" ? "See you at the live session" : "À bientôt en session live"}
            </h3>
            <p className="text-[13px] leading-relaxed mb-5" style={{ color: "rgba(106,211,156,0.65)" }}>
              {lang === "en"
                ? "Your profile will shape the live discussion. We'll reference your results in real time."
                : "Votre profil influencera la session live. Vos résultats seront utilisés en temps réel."}
            </p>
            {demoLink ? (
              <a href={demoLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-[14px] font-bold transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#6AD39C,#0D9488)", color: "#0A1F1C" }}>
                {lang === "en" ? "Book a private demo →" : "Réserver une démo privée →"}
              </a>
            ) : (
              <div className="flex items-center gap-3 p-3.5 rounded-xl"
                style={{ background: "rgba(106,211,156,0.07)", border: "1px solid rgba(106,211,156,0.18)" }}>
                <span className="text-xl shrink-0">📩</span>
                <p className="text-[12.5px] leading-snug" style={{ color: "rgba(106,211,156,0.80)" }}>
                  {lang === "en" ? "Check your inbox — a confirmation is on its way." : "Vérifiez votre boîte mail — une confirmation est en route."}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        <p className="text-center text-[11px] text-slate-300 pt-1">
          Talent AI · {lang === "en" ? "Confidential" : "Données confidentielles"}
        </p>

      </div>
    </div>
  );
}

// ── Full-screen question slide ────────────────────────────────────────────────
function QuestionSlide({ q, idx, total, lang, value, onChange, onNext, onBack, saving, isLast, active }: {
  q: DBQuestion; idx: number; total: number; lang: string;
  value: any; onChange: (v: any) => void;
  onNext: () => void; onBack: () => void; saving: boolean; isLast: boolean; active: boolean;
}) {
  const label = lang === "en" ? q.label_en : q.label_fr;
  const hasValue = value !== undefined && value !== "" && value !== null;

  // Auto-advance on choice selection after short delay
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleChoice = (key: string) => {
    onChange(key);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onNext(), 400);
  };
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div className="flex flex-col justify-center px-5 py-12 max-w-[620px] mx-auto w-full">
      {/* Question number */}
      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: active ? 1 : 0, x: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="flex items-center gap-2 mb-5">
        <span className="text-[13px] font-black text-teal-600 tabular-nums">{idx + 1}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <span className="text-[13px] text-slate-400">{lang === "en" ? `of ${total}` : `sur ${total}`}</span>
      </motion.div>

      {/* Question label */}
      <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: active ? 1 : 0, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-[1.4rem] sm:text-[1.7rem] font-bold text-slate-900 leading-snug mb-8">
        {label}
      </motion.h2>

      {/* Input */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: active ? 1 : 0, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18 }}>

        {q.type === "choice" && (
          <div className="space-y-2.5">
            {q.options.map((opt, i) => (
              <Option key={opt.key} letter={ALPHA[i]}
                label={lang === "en" ? opt.label_en : opt.label_fr}
                selected={value === opt.key}
                onClick={() => handleChoice(opt.key)}
              />
            ))}
          </div>
        )}

        {q.type === "scale" && (
          <Scale value={value} onChange={onChange} lang={lang} />
        )}

        {q.type === "text" && (
          <textarea value={value || ""}
            onChange={e => onChange(e.target.value)}
            placeholder={lang === "en" ? "Your answer…" : "Votre réponse…"}
            rows={4}
            className="w-full rounded-2xl border-2 border-slate-200 focus:border-teal-500 outline-none px-5 py-4 text-[15px] text-slate-700 placeholder:text-slate-300 resize-none transition-colors bg-white/80 backdrop-blur-sm"
          />
        )}

        {q.type === "select" && (
          <div className="relative">
            <select value={value || ""} onChange={e => onChange(e.target.value)}
              className="w-full rounded-2xl border-2 border-slate-200 focus:border-teal-500 outline-none px-5 py-4 text-[15px] text-slate-700 bg-white/80 appearance-none pr-12 transition-colors">
              <option value="">{lang === "en" ? "Select…" : "Sélectionner…"}</option>
              {q.options.length > 0
                ? q.options.map(o => <option key={o.key} value={o.key}>{lang === "en" ? o.label_en : o.label_fr}</option>)
                : COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)
              }
            </select>
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        )}
      </motion.div>

      {/* Nav — only shown for non-choice questions, and only once user has a value */}
      {q.type !== "choice" && hasValue && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: active ? 1 : 0, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex items-center gap-3 mt-8">
          {idx > 0 && (
            <button onClick={onBack}
              className="w-12 h-12 rounded-2xl border-2 border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-all flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          )}
          <motion.button onClick={onNext} disabled={saving}
            whileHover={!saving ? { y: -1 } : {}}
            whileTap={!saving ? { scale: 0.98 } : {}}
            className={`flex-1 h-12 rounded-2xl text-[15px] font-semibold transition-all
              ${saving
                ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                : "bg-gradient-to-r from-teal-600 to-emerald-500 text-white hover:from-teal-500 hover:to-emerald-400 shadow-[0_2px_12px_rgba(13,148,136,0.30)]"}`}
          >
            {saving
              ? <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  {lang === "en" ? "Saving…" : "Enregistrement…"}
                </span>
              : isLast
                ? (lang === "en" ? "See my results →" : "Voir mes résultats →")
                : (lang === "en" ? "Next →" : "Suivant →")}
          </motion.button>
        </motion.div>
      )}

      {/* Keyboard hint — only when answered */}
      {q.type !== "choice" && hasValue && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: active ? 0.5 : 0 }} transition={{ delay: 0.2 }}
          className="text-center text-[11px] text-slate-400 mt-4">
          {lang === "en" ? "Press Enter to continue" : "Appuyez sur Entrée pour continuer"}
        </motion.p>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function WebinarAgentPage() {
  const router    = useRouter();
  const webinarId = router.query.webinarId as string;
  const langParam = (router.query.lang as string)?.toLowerCase();

  const [webinar, setWebinar]   = useState<WebinarData | null>(null);
  const [loadingW, setLoadingW] = useState(true);

  const { i18n } = useTranslation();
  const i18nLang = i18n.language?.startsWith("en") ? "en" : "fr";
  const lang = langParam === "en" ? "en" : langParam === "fr" ? "fr" : webinar?.lang === "en" ? "en" : i18nLang;
  const questions = webinar ? [...webinar.questions].sort((a, b) => a.order - b.order) : [];
  const total = questions.length;

  // Steps: 0 = consent, 1..n = questions, n+1 = snapshot
  const [stepIdx, setStepIdx]    = useState(0);
  const [consent, setConsent]    = useState(false);
  const [contact, setContact]    = useState({ nom: "", email: "", entreprise: "" });
  const [submissionId, setSubId] = useState<string | null>(null);
  const [answers, setAnswers]    = useState<Record<string, any>>({});
  const [saving, setSaving]      = useState(false);
  const [scoring, setScoring]    = useState<WebinarScoring | null>(null);

  const isConsent  = stepIdx === 0;
  const isSnapshot = stepIdx === total + 1;
  const isQuestion = !isConsent && !isSnapshot;
  const qIdx       = isQuestion ? stepIdx - 1 : -1;
  const currentQ   = qIdx >= 0 ? questions[qIdx] : null;
  const pct        = isSnapshot ? 100 : isQuestion ? Math.round((stepIdx / total) * 100) : 0;

  // Scroll container ref
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch webinar
  useEffect(() => {
    if (!webinarId) return;
    fetch(`${BACKEND}/webinars/public/${webinarId}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data) setWebinar(d.data); })
      .catch(() => {})
      .finally(() => setLoadingW(false));
  }, [webinarId]);

  useEffect(() => {
    const saved = localStorage.getItem("webinar_submission_id");
    if (saved) setSubId(saved);
  }, []);

  const persistSubId = (id: string) => {
    setSubId(id);
    localStorage.setItem("webinar_submission_id", id);
  };

  const saveStep = useCallback(async (patch: Record<string, any> = {}) => {
    if (!webinarId) return;
    setSaving(true);
    try {
      const merged = { ...answers, ...patch };
      const res = await webinarApi.saveProgress({
        submissionId: submissionId ?? undefined,
        webinarId, lang: lang as any, consent,
        contact: contact.email.trim() ? contact : undefined,
        answers: merged as any,
        source: {
          utm_source:   (router.query.utm_source as string) || "",
          utm_campaign: (router.query.utm_campaign as string) || "",
        },
      });
      persistSubId(res.submissionId);
      setAnswers(merged);
    } finally {
      setSaving(false);
    }
  }, [webinarId, submissionId, lang, consent, contact, answers, router.query]);

  const handleComplete = useCallback(async () => {
    if (!submissionId) return;
    setSaving(true);
    try {
      const sub = await webinarApi.complete(submissionId, answers as any);
      setScoring(sub.scoring ?? null);
      localStorage.removeItem("webinar_submission_id");
      setStepIdx(total + 1);
    } finally {
      setSaving(false);
    }
  }, [submissionId, answers, total]);

  // Scroll to step
  const scrollToStep = useCallback((idx: number) => {
    const el = containerRef.current?.querySelector(`[data-step="${idx}"]`) as HTMLElement | null;
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const goTo = useCallback((idx: number) => {
    setStepIdx(idx);
    setTimeout(() => scrollToStep(idx), 50);
  }, [scrollToStep]);

  const goNext = useCallback(() => goTo(stepIdx + 1), [stepIdx, goTo]);
  const goBack = useCallback(() => goTo(Math.max(0, stepIdx - 1)), [stepIdx, goTo]);

  const saveAndNext = useCallback(async (patch: Record<string, any> = {}) => {
    await saveStep(patch);
    goNext();
  }, [saveStep, goNext]);

  const handleLastQuestion = useCallback(async () => {
    if (currentQ) await saveStep({ [currentQ.key]: answers[currentQ.key] });
    await handleComplete();
  }, [currentQ, saveStep, answers, handleComplete]);

  // Enter key support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || isConsent || isSnapshot) return;
      if (!currentQ) return;
      if (currentQ.type === "choice") return;
      const hasVal = answers[currentQ.key] !== undefined && answers[currentQ.key] !== "";
      if (currentQ.required && !hasVal) return;
      if (qIdx === total - 1) handleLastQuestion();
      else saveAndNext({ [currentQ.key]: answers[currentQ.key] });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentQ, qIdx, total, answers, isConsent, isSnapshot, handleLastQuestion, saveAndNext]);

  if (loadingW) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!webinar || total === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-[14px] text-slate-400">{lang === "en" ? "Webinar not found." : "Webinaire introuvable."}</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Talent AI — {webinar.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
      </Head>

      <div className="min-h-screen bg-white flex flex-col">
        {/* Fixed header */}
        <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
          <Header />
          {/* Progress bar */}
          {!isConsent && !isSnapshot && (
            <div className="bg-white/95 backdrop-blur-sm border-b border-slate-100 px-6 py-2.5">
              <div className="max-w-[620px] mx-auto flex items-center gap-4">
                {/* Dots */}
                <div className="flex items-center gap-1 shrink-0">
                  {questions.map((_, i) => {
                    const done    = i < qIdx;
                    const current = i === qIdx;
                    return (
                      <motion.div key={i}
                        animate={{ width: current ? 20 : 6, background: done ? "#6AD39C" : current ? "#0D9488" : "#E2E8F0" }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="h-1.5 rounded-full cursor-pointer"
                        onClick={() => i < qIdx && goTo(i + 1)}
                      />
                    );
                  })}
                </div>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400"
                    animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: EASE }} />
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                  <span className="text-[13px] font-bold text-slate-800 tabular-nums">{qIdx + 1}</span>
                  <span className="text-[12px] text-slate-400">/ {total}</span>
                  <span className="text-[12px] font-semibold text-teal-600 ml-1 tabular-nums hidden sm:block">{pct}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scrollable content — each step is 100vh */}
        <div
          ref={containerRef}
          className={`flex-1 ${isSnapshot ? "" : "overflow-y-auto snap-y snap-mandatory"}`}
          style={{ scrollBehavior: "smooth", height: isSnapshot ? "auto" : "100vh", paddingTop: isSnapshot ? 0 : "0px" }}
        >
          {/* ── CONSENT SLIDE ── */}
          {!isSnapshot && (
            <div data-step="0"
              className="snap-start flex flex-col justify-center min-h-screen px-5 py-12"
              style={{ paddingTop: "140px" }}>
              <div className="max-w-[560px] mx-auto w-full space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-[12px] font-semibold uppercase tracking-[1.5px] text-slate-400 mb-3">{webinar.title}</p>
                  <h1 className="text-[2rem] sm:text-[2.4rem] font-bold text-slate-900 leading-[1.15] tracking-tight mb-4">
                    {lang === "en" ? "Before we start, a few quick questions" : "Avant de commencer, quelques questions rapides"}
                  </h1>
                  <p className="text-[16px] text-slate-500 leading-relaxed">
                    {lang === "en"
                      ? "Help us personalize your experience. 3 minutes, your answers stay confidential."
                      : "Aidez-nous à personnaliser votre expérience. 3 minutes, vos réponses restent confidentielles."}
                  </p>
                </motion.div>

                {/* ── Contact fields ── */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="space-y-4">

                  {/* Full name */}
                  <div className="relative">
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-[0.8px] mb-2">
                      {lang === "en" ? "Full name" : "Nom complet"} <span className="text-teal-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={contact.nom}
                        onChange={e => setContact(c => ({ ...c, nom: e.target.value }))}
                        placeholder={lang === "en" ? "Jane Doe" : "Jean Dupont"}
                        className={`w-full rounded-2xl border-2 outline-none px-5 py-4 text-[15px] text-slate-800 placeholder:text-slate-300 transition-all bg-white
                          ${contact.nom.trim() ? "border-teal-400 bg-teal-50/20" : "border-slate-200 focus:border-teal-400 focus:bg-teal-50/10"}`}
                      />
                      {contact.nom.trim() && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-500">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  {(() => {
                    const emailVal = contact.email.trim();
                    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
                    const showError = emailVal.length > 0 && !validEmail;
                    return (
                      <div className="relative">
                        <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-[0.8px] mb-2">
                          Email <span className="text-teal-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={contact.email}
                            onChange={e => setContact(c => ({ ...c, email: e.target.value }))}
                            placeholder={lang === "en" ? "you@company.com" : "vous@entreprise.com"}
                            className={`w-full rounded-2xl border-2 outline-none px-5 py-4 text-[15px] text-slate-800 placeholder:text-slate-300 transition-all bg-white
                              ${showError ? "border-red-400 bg-red-50/20" : validEmail ? "border-teal-400 bg-teal-50/20" : "border-slate-200 focus:border-teal-400 focus:bg-teal-50/10"}`}
                          />
                          {validEmail && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-500">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </span>
                          )}
                          {showError && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            </span>
                          )}
                        </div>
                        {showError && (
                          <p className="text-[12px] text-red-400 mt-1.5 ml-1">
                            {lang === "en" ? "Please enter a valid email address" : "Veuillez entrer une adresse email valide"}
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  {/* Company */}
                  <div className="relative">
                    <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-[0.8px] mb-2">
                      {lang === "en" ? "Company" : "Entreprise"} <span className="text-slate-300 font-normal normal-case tracking-normal">{lang === "en" ? "(optional)" : "(optionnel)"}</span>
                    </label>
                    <input
                      type="text"
                      value={contact.entreprise}
                      onChange={e => setContact(c => ({ ...c, entreprise: e.target.value }))}
                      placeholder={lang === "en" ? "Acme Inc." : "Nom de la société"}
                      className="w-full rounded-2xl border-2 border-slate-200 focus:border-teal-400 focus:bg-teal-50/10 outline-none px-5 py-4 text-[15px] text-slate-800 placeholder:text-slate-300 transition-all bg-white"
                    />
                  </div>

                </motion.div>

                <motion.label initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
                  className="flex items-start gap-3 cursor-pointer group">
                  <div onClick={() => setConsent(c => !c)}
                    className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all
                      ${consent ? "border-teal-600 bg-teal-600" : "border-slate-300 group-hover:border-teal-400"}`}>
                    {consent && (
                      <svg width="11" height="9" viewBox="0 0 12 10" fill="none">
                        <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-[14px] text-slate-600 leading-relaxed">
                    {lang === "en"
                      ? "I agree that my answers will be processed to personalize my experience during the webinar."
                      : "J'accepte que mes réponses soient traitées pour personnaliser mon expérience lors du webinaire."}
                  </span>
                </motion.label>

                {(() => {
                  const canStart = consent && contact.nom.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim());
                  return (
                    <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
                      onClick={() => canStart && goNext()} disabled={!canStart}
                      className={`w-full h-14 rounded-2xl text-[16px] font-bold transition-all
                        ${canStart
                          ? "bg-gradient-to-r from-teal-600 to-emerald-500 text-white hover:from-teal-500 hover:to-emerald-400 shadow-[0_4px_20px_rgba(13,148,136,0.35)]"
                          : "bg-slate-100 text-slate-300 cursor-not-allowed"}`}
                    >
                      {lang === "en" ? "Start →" : "Commencer →"}
                    </motion.button>
                  );
                })()}

                <p className="text-[12px] text-slate-400">
                  {lang === "en" ? "Confidential · No spam · Talent AI" : "Données confidentielles · Aucun spam · Talent AI"}
                </p>
              </div>
            </div>
          )}

          {/* ── QUESTION SLIDES ── */}
          {!isSnapshot && questions.map((q, i) => (
            <div key={q.key} data-step={i + 1}
              className="snap-start flex flex-col justify-center min-h-screen bg-gradient-to-b from-white to-slate-50/60"
              style={{ paddingTop: "120px" }}>
              <AnimatePresence mode="wait">
                {stepIdx === i + 1 && (
                  <motion.div key={q.key}
                    initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.35, ease: EASE }}>
                    <QuestionSlide
                      q={q} idx={i} total={total} lang={lang}
                      value={answers[q.key]}
                      onChange={v => setAnswers(prev => ({ ...prev, [q.key]: v }))}
                      onBack={goBack}
                      onNext={i === total - 1
                        ? handleLastQuestion
                        : () => saveAndNext({ [q.key]: answers[q.key] })}
                      saving={saving}
                      isLast={i === total - 1}
                      active={stepIdx === i + 1}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* ── SNAPSHOT ── */}
          {isSnapshot && scoring && (
            <div style={{ paddingTop: "80px" }}>
              <Snapshot scoring={scoring} lang={lang} questions={questions} answers={answers} />
            </div>
          )}
        </div>

        {/* Side navigation arrows (desktop) */}
        {isQuestion && (
          <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40 hidden md:flex">
            <button onClick={goBack} disabled={stepIdx <= 1}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md text-slate-400 hover:text-slate-700 hover:border-slate-300 disabled:opacity-30 transition-all flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
            </button>
            <button onClick={() => {
                if (!currentQ) return;
                if (qIdx === total - 1) handleLastQuestion();
                else saveAndNext({ [currentQ.key]: answers[currentQ.key] });
              }}
              disabled={!!(currentQ?.required && !answers[currentQ?.key])}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md text-slate-400 hover:text-slate-700 hover:border-slate-300 disabled:opacity-30 transition-all flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
        )}

        <footer className="fixed bottom-0 left-0 right-0 px-6 py-2 text-center bg-white/80 backdrop-blur-sm border-t border-slate-100 z-30">
          <p className="text-[11px] text-slate-400">
            Talent AI · {lang === "en" ? "Confidential · No spam" : "Données confidentielles · Aucun spam"}
          </p>
        </footer>
      </div>
    </>
  );
}
