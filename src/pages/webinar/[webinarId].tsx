import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/modules/shared/layouts/home/HomeHeader";
import { webinarApi } from "@/modules/webinar/api";
import type { WebinarScoring } from "@/modules/webinar/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/modules/shared/ui/shadcn/select";
import { validateEmail, emailKeyDownGuard } from "@/lib/validation/email";

// ── Types ─────────────────────────────────────────────────────────────────────
interface QuestionOption { key: string; label_fr: string; label_en: string; }
interface DBQuestion {
  key: string; order: number; type: "choice" | "scale" | "text" | "select";
  label_fr: string; label_en: string; options: QuestionOption[]; required: boolean;
}
interface WebinarData { _id: string; title: string; questions: DBQuestion[]; lang: string; }

const EASE    = [0.32, 0.72, 0, 1] as [number, number, number, number];
const ALPHA   = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
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

// ── Shared primitives ─────────────────────────────────────────────────────────
function CheckIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}

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
      {selected && <CheckIcon />}
    </motion.button>
  );
}

// ── Scale ─────────────────────────────────────────────────────────────────────
function Scale({ value, onChange, lang }: { value?: number; onChange: (v: number) => void; lang: string }) {
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
        <span>{labels[1]}</span><span>{labels[5]}</span>
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
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (value / 100) * circ }}
        transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }} />
    </svg>
  );
}

// ── Snapshot — congratulations screen shown to the user ──────────────────────
const C = { brand: "#6AD39C", teal: "#0D9488", amber: "#F59E0B", muted: "#94A3B8" };

const SNAP_GRID = {
  backgroundImage: "linear-gradient(rgba(106,211,156,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(106,211,156,0.06) 1px,transparent 1px)",
  backgroundSize: "32px 32px",
};

function Snapshot({ scoring, lang }: { scoring: WebinarScoring; lang: string }) {
  const isEn       = lang === "en";
  const score      = scoring.readiness_score ?? Math.round((scoring.maturite_ia + scoring.intensite_pain) / 2);
  const scoreColor = score >= 65 ? C.brand : score >= 35 ? C.teal : C.amber;
  const scoreLabel = score >= 65
    ? (isEn ? "Strong profile" : "Profil solide")
    : score >= 35
      ? (isEn ? "Good potential" : "Bon potentiel")
      : (isEn ? "Keep growing" : "En progression");

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* Grid texture */}
      <div className="pointer-events-none fixed inset-0" style={SNAP_GRID} />

      {/* Glow blobs */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-20"
        style={{ background: "radial-gradient(ellipse,rgba(13,148,136,0.25) 0%,transparent 70%)" }} />
      <div className="pointer-events-none fixed bottom-0 right-0 w-80 h-80 opacity-10"
        style={{ background: "radial-gradient(circle,rgba(13,148,136,0.4) 0%,transparent 70%)" }} />

      <div className="relative flex-1 flex flex-col items-center justify-center px-5 py-16">
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[420px]">

          {/* Checkmark */}
          <div className="flex justify-center mb-7">
            <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 280, damping: 18 }}
              className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#0D9488 0%,#6AD39C 100%)", boxShadow: "0 8px 32px rgba(106,211,156,0.40)" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </motion.div>
          </div>

          {/* Headline */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-center mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[2.5px] mb-3" style={{ color: C.teal }}>
              Talent AI · {isEn ? "AI Report" : "Rapport IA"}
            </p>
            <h1 className="text-[2.2rem] font-black text-slate-900 leading-[1.1] tracking-tight mb-3">
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
            className="rounded-2xl p-6 mb-4 text-center border border-slate-100"
            style={{ background: "#F8FAFC", boxShadow: "0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(0,0,0,0.04)" }}>

            <p className="text-[10.5px] font-bold uppercase tracking-[2px] mb-4 text-slate-400">
              {isEn ? "Your readiness score" : "Votre score de disposition"}
            </p>

            <div className="flex items-center justify-center gap-6">
              {/* Ring */}
              <div className="relative shrink-0">
                <ArcRing value={score} size={100} stroke={9} color={scoreColor} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[1.7rem] font-black leading-none tabular-nums" style={{ color: scoreColor }}>{score}</span>
                  <span className="text-[9px] font-bold" style={{ color: "rgba(255,255,255,0.35)" }}>/100</span>
                </div>
              </div>

              {/* Score breakdown bars */}
              <div className="flex-1 space-y-2.5 text-left min-w-0">
                {[
                  { label: isEn ? "Knowledge" : "Maîtrise",   value: scoring.maturite_ia,  color: C.brand },
                  { label: isEn ? "Engagement" : "Engagement", value: scoring.intensite_pain, color: C.teal  },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-[10.5px] mb-1 text-slate-400">
                      <span>{label}</span>
                      <span className="font-bold tabular-nums" style={{ color }}>{value}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "#E2E8F0" }}>
                      <motion.div className="h-full rounded-full"
                        style={{ background: color }}
                        initial={{ width: 0 }} animate={{ width: `${value}%` }}
                        transition={{ delay: 0.55, duration: 1, ease: [0.22, 1, 0.36, 1] }} />
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
            className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(13,148,136,0.08)", border: "1px solid rgba(13,148,136,0.15)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

// ── Question slide ─────────────────────────────────────────────────────────────
function QuestionSlide({ q, idx, total, lang, value, onChange, onNext, onBack, saving, isLast, active }: {
  q: DBQuestion; idx: number; total: number; lang: string;
  value: unknown; onChange: (v: unknown) => void;
  onNext: () => void; onBack: () => void; saving: boolean; isLast: boolean; active: boolean;
}) {
  const isEn    = lang === "en";
  const label   = isEn ? q.label_en : q.label_fr;
  const hasValue = value !== undefined && value !== "" && value !== null;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleChoice = (key: string) => {
    onChange(key);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onNext, 400);
  };
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <div className="flex flex-col justify-center px-5 py-12 max-w-[620px] mx-auto w-full">
      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: active ? 1 : 0, x: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="flex items-center gap-2 mb-5">
        <span className="text-[13px] font-black text-teal-600 tabular-nums">{idx + 1}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <span className="text-[13px] text-slate-400">{isEn ? `of ${total}` : `sur ${total}`}</span>
      </motion.div>

      <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: active ? 1 : 0, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-[1.4rem] sm:text-[1.7rem] font-bold text-slate-900 leading-snug mb-8">
        {label}
      </motion.h2>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: active ? 1 : 0, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18 }}>

        {q.type === "choice" && (
          <div className="space-y-2.5">
            {q.options.map((opt, i) => (
              <Option key={opt.key} letter={ALPHA[i]}
                label={isEn ? opt.label_en : opt.label_fr}
                selected={value === opt.key}
                onClick={() => handleChoice(opt.key)}
              />
            ))}
          </div>
        )}

        {q.type === "scale" && <Scale value={value as number | undefined} onChange={onChange} lang={lang} />}

        {q.type === "text" && (
          <textarea value={(value as string) || ""}
            onChange={e => onChange(e.target.value)}
            placeholder={isEn ? "Your answer…" : "Votre réponse…"}
            rows={4}
            className="w-full rounded-2xl border-2 border-slate-200 focus:border-teal-500 outline-none px-5 py-4 text-[15px] text-slate-700 placeholder:text-slate-300 resize-none transition-colors bg-white/80 backdrop-blur-sm"
          />
        )}

        {q.type === "select" && (
          <Select value={(value as string) || undefined} onValueChange={onChange}>
            <SelectTrigger className="w-full h-auto rounded-2xl border-2 border-slate-200 px-5 py-4 text-[15px] text-slate-700 bg-white/80 data-[state=open]:border-teal-500 data-[state=open]:ring-teal-500/20">
              <SelectValue placeholder={isEn ? "Select…" : "Sélectionner…"} />
            </SelectTrigger>
            <SelectContent>
              {q.options.length > 0
                ? q.options.map(o => <SelectItem key={o.key} value={o.key}>{isEn ? o.label_en : o.label_fr}</SelectItem>)
                : COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)
              }
            </SelectContent>
          </Select>
        )}
      </motion.div>

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
                  {isEn ? "Saving…" : "Enregistrement…"}
                </span>
              : isLast
                ? (isEn ? "See my results →" : "Voir mes résultats →")
                : (isEn ? "Next →" : "Suivant →")}
          </motion.button>
        </motion.div>
      )}

      {q.type !== "choice" && hasValue && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: active ? 0.5 : 0 }} transition={{ delay: 0.2 }}
          className="text-center text-[11px] text-slate-400 mt-4">
          {isEn ? "Press Enter to continue" : "Appuyez sur Entrée pour continuer"}
        </motion.p>
      )}
    </div>
  );
}

// ── Contact field ─────────────────────────────────────────────────────────────
function ContactField({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="relative">
      <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-[0.8px] mb-2">{label}</label>
      {children}
      {error && <p className="text-[12px] text-red-400 mt-1.5 ml-1">{error}</p>}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function WebinarAgentPage() {
  const router    = useRouter();
  const webinarId = router.query.webinarId as string;
  const langParam = (router.query.lang as string)?.toLowerCase();

  const [webinar,  setWebinar]  = useState<WebinarData | null>(null);
  const [loadingW, setLoadingW] = useState(true);

  const { i18n } = useTranslation();
  const i18nLang = i18n.language?.startsWith("en") ? "en" : "fr";
  const lang     = langParam === "en" ? "en" : langParam === "fr" ? "fr" : webinar?.lang === "en" ? "en" : i18nLang;
  const isEn     = lang === "en";

  const questions = webinar ? [...webinar.questions].sort((a, b) => a.order - b.order) : [];
  const total     = questions.length;

  const [stepIdx,      setStepIdx]  = useState(0);
  const [consent,      setConsent]  = useState(false);
  const [contact,      setContact]  = useState({ nom: "", email: "", entreprise: "" });
  const [submissionId, setSubId]    = useState<string | null>(null);
  const [answers,      setAnswers]  = useState<Record<string, unknown>>({});
  const [saving,       setSaving]   = useState(false);
  const [scoring,      setScoring]  = useState<WebinarScoring | null>(null);

  const isConsent  = stepIdx === 0;
  const isSnapshot = stepIdx === total + 1;
  const isQuestion = !isConsent && !isSnapshot;
  const qIdx       = isQuestion ? stepIdx - 1 : -1;
  const currentQ   = qIdx >= 0 ? questions[qIdx] : null;
  const pct        = isSnapshot ? 100 : isQuestion ? Math.round((stepIdx / total) * 100) : 0;

  const containerRef = useRef<HTMLDivElement>(null);

  const emailVal       = contact.email.trim();
  const validEmail     = validateEmail(emailVal) === true;
  const showEmailError = emailVal.length > 0 && !validEmail;
  const canStart       = consent && contact.nom.trim() !== "" && validEmail;

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

  const saveStep = useCallback(async (patch: Record<string, unknown> = {}) => {
    if (!webinarId) return;
    setSaving(true);
    try {
      const merged = { ...answers, ...patch };
      const res = await webinarApi.saveProgress({
        submissionId: submissionId ?? undefined,
        webinarId, lang: lang as "fr" | "en", consent,
        contact: contact.email.trim() ? contact : undefined,
        answers: merged as Record<string, string | number>,
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
      const sub = await webinarApi.complete(submissionId, answers as Record<string, string | number>);
      setScoring(sub.scoring ?? null);
      localStorage.removeItem("webinar_submission_id");
      setStepIdx(total + 1);
    } finally {
      setSaving(false);
    }
  }, [submissionId, answers, total]);

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

  const saveAndNext = useCallback(async (patch: Record<string, unknown> = {}) => {
    await saveStep(patch);
    goNext();
  }, [saveStep, goNext]);

  const handleLastQuestion = useCallback(async () => {
    if (currentQ) await saveStep({ [currentQ.key]: answers[currentQ.key] });
    await handleComplete();
  }, [currentQ, saveStep, answers, handleComplete]);

  const handleNavNext = useCallback(() => {
    if (!currentQ) return;
    if (qIdx === total - 1) handleLastQuestion();
    else saveAndNext({ [currentQ.key]: answers[currentQ.key] });
  }, [currentQ, qIdx, total, handleLastQuestion, saveAndNext, answers]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || isConsent || isSnapshot || !currentQ) return;
      if (currentQ.type === "choice") return;
      const hasVal = answers[currentQ.key] !== undefined && answers[currentQ.key] !== "";
      if (currentQ.required && !hasVal) return;
      handleNavNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentQ, answers, isConsent, isSnapshot, handleNavNext]);

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
        <p className="text-[14px] text-slate-400">{isEn ? "Webinar not found." : "Webinaire introuvable."}</p>
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
          {isQuestion && (
            <div className="bg-white/95 backdrop-blur-sm border-b border-slate-100 px-6 py-2.5">
              <div className="max-w-[620px] mx-auto flex items-center gap-4">
                <div className="flex items-center gap-1 shrink-0">
                  {questions.map((_, i) => {
                    const done    = i < qIdx;
                    const current = i === qIdx;
                    return (
                      <motion.div key={i}
                        animate={{ width: current ? 20 : 6, background: done ? "#6AD39C" : current ? "#0D9488" : "#E2E8F0" }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="h-1.5 rounded-full cursor-pointer"
                        onClick={() => done && goTo(i + 1)}
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

        <div
          ref={containerRef}
          className={`flex-1 ${isSnapshot ? "" : "overflow-y-auto snap-y snap-mandatory"}`}
          style={{ scrollBehavior: "smooth", height: isSnapshot ? "auto" : "100vh" }}
        >
          {/* Consent slide */}
          {!isSnapshot && (
            <div data-step="0"
              className="snap-start flex flex-col justify-center min-h-screen px-5 py-12"
              style={{ paddingTop: "140px" }}>
              <div className="max-w-[560px] mx-auto w-full space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-[12px] font-semibold uppercase tracking-[1.5px] text-slate-400 mb-3">{webinar.title}</p>
                  <h1 className="text-[2rem] sm:text-[2.4rem] font-bold text-slate-900 leading-[1.15] tracking-tight mb-4">
                    {isEn ? "Before we start, a few quick questions" : "Avant de commencer, quelques questions rapides"}
                  </h1>
                  <p className="text-[16px] text-slate-500 leading-relaxed">
                    {isEn
                      ? "Help us personalize your experience. 3 minutes, your answers stay confidential."
                      : "Aidez-nous à personnaliser votre expérience. 3 minutes, vos réponses restent confidentielles."}
                  </p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="space-y-4">

                  <ContactField label={`${isEn ? "Full name" : "Nom complet"} *`}>
                    <div className="relative">
                      <input type="text" value={contact.nom}
                        onChange={e => setContact(c => ({ ...c, nom: e.target.value }))}
                        placeholder={isEn ? "Jane Doe" : "Jean Dupont"}
                        className={`w-full rounded-2xl border-2 outline-none px-5 py-4 text-[15px] text-slate-800 placeholder:text-slate-300 transition-all bg-white
                          ${contact.nom.trim() ? "border-teal-400 bg-teal-50/20" : "border-slate-200 focus:border-teal-400 focus:bg-teal-50/10"}`}
                      />
                      {contact.nom.trim() && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-500"><CheckIcon /></span>
                      )}
                    </div>
                  </ContactField>

                  <ContactField label="Email *" error={showEmailError ? (isEn ? "Please enter a valid email address" : "Veuillez entrer une adresse email valide") : undefined}>
                    <div className="relative">
                      <input type="email" value={contact.email}
                        onChange={e => setContact(c => ({ ...c, email: e.target.value }))}
                        onKeyDown={emailKeyDownGuard}
                        placeholder={isEn ? "you@company.com" : "vous@entreprise.com"}
                        className={`w-full rounded-2xl border-2 outline-none px-5 py-4 text-[15px] text-slate-800 placeholder:text-slate-300 transition-all bg-white
                          ${showEmailError ? "border-red-400 bg-red-50/20" : validEmail ? "border-teal-400 bg-teal-50/20" : "border-slate-200 focus:border-teal-400 focus:bg-teal-50/10"}`}
                      />
                      {validEmail && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-500"><CheckIcon /></span>}
                      {showEmailError && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400"><ErrorIcon /></span>
                      )}
                    </div>
                  </ContactField>

                  <ContactField label={`${isEn ? "Company" : "Entreprise"} (${isEn ? "optional" : "optionnel"})`}>
                    <input type="text" value={contact.entreprise}
                      onChange={e => setContact(c => ({ ...c, entreprise: e.target.value }))}
                      placeholder={isEn ? "Acme Inc." : "Nom de la société"}
                      className="w-full rounded-2xl border-2 border-slate-200 focus:border-teal-400 focus:bg-teal-50/10 outline-none px-5 py-4 text-[15px] text-slate-800 placeholder:text-slate-300 transition-all bg-white"
                    />
                  </ContactField>
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
                    {isEn
                      ? "I agree that my answers will be processed to personalize my experience during the webinar."
                      : "J'accepte que mes réponses soient traitées pour personnaliser mon expérience lors du webinaire."}
                  </span>
                </motion.label>

                <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
                  onClick={() => canStart && goNext()} disabled={!canStart}
                  className={`w-full h-14 rounded-2xl text-[16px] font-bold transition-all
                    ${canStart
                      ? "bg-gradient-to-r from-teal-600 to-emerald-500 text-white hover:from-teal-500 hover:to-emerald-400 shadow-[0_4px_20px_rgba(13,148,136,0.35)]"
                      : "bg-slate-100 text-slate-300 cursor-not-allowed"}`}
                >
                  {isEn ? "Start →" : "Commencer →"}
                </motion.button>

                <p className="text-[12px] text-slate-400">
                  {isEn ? "Confidential · No spam · Talent AI" : "Données confidentielles · Aucun spam · Talent AI"}
                </p>
              </div>
            </div>
          )}

          {/* Question slides */}
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
                      onNext={i === total - 1 ? handleLastQuestion : () => saveAndNext({ [q.key]: answers[q.key] })}
                      saving={saving} isLast={i === total - 1} active={stepIdx === i + 1}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* Snapshot */}
          {isSnapshot && scoring && (
            <div style={{ paddingTop: "80px" }}>
              <Snapshot scoring={scoring} lang={lang} />
            </div>
          )}
        </div>

        {/* Desktop nav arrows */}
        {isQuestion && (
          <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40 hidden md:flex">
            <button onClick={goBack} disabled={stepIdx <= 1}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md text-slate-400 hover:text-slate-700 hover:border-slate-300 disabled:opacity-30 transition-all flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
            </button>
            <button onClick={handleNavNext}
              disabled={!!(currentQ?.required && !answers[currentQ?.key])}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md text-slate-400 hover:text-slate-700 hover:border-slate-300 disabled:opacity-30 transition-all flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
        )}

        <footer className="fixed bottom-0 left-0 right-0 px-6 py-2 text-center bg-white/80 backdrop-blur-sm border-t border-slate-100 z-30">
          <p className="text-[11px] text-slate-400">
            Talent AI · {isEn ? "Confidential · No spam" : "Données confidentielles · Aucun spam"}
          </p>
        </footer>
      </div>
    </>
  );
}
