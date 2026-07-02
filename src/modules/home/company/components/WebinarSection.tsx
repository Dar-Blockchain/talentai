import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Calendar, Users, Zap, ArrowRight, CheckCircle, Clock, Globe, MessageSquare, Star, TrendingUp } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;
const VP   = { once: true, margin: "-60px" };

interface WebinarData {
  _id: string;
  title: string;
  description: string;
  date?: string;
  lang: string;
  highlights?: string[];
  questions: { key: string; label_fr: string; label_en: string; order: number }[];
  stats: { total_registrations: number };
}

interface WebinarSectionProps {
  previewId?: string;
  routerReady?: boolean;
}

const AVATARS = ["J", "M", "A", "R", "S"];
const ICONS   = [Zap, TrendingUp, Star] as const;

const WebinarSection: React.FC<WebinarSectionProps> = ({ previewId, routerReady = true }) => {
  const { t, i18n } = useTranslation("home");
  const lang = i18n.language?.startsWith("en") ? "en" : "fr";

  const [webinar, setWebinar] = useState<WebinarData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!routerReady) return;
    const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const url = previewId
      ? `${BACKEND}/webinars/public/${previewId}`
      : `${BACKEND}/webinars/public/active`;
    setLoading(true);
    setWebinar(null);
    fetch(url)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.data) setWebinar(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [previewId, routerReady]);

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-8 md:px-16">
          <div className="h-80 bg-slate-100 rounded-3xl animate-pulse" />
        </div>
      </section>
    );
  }

  if (!webinar) return null;

  const sortedQuestions = webinar.questions?.length
    ? [...webinar.questions].sort((a, b) => a.order - b.order)
    : [];

  const filledHighlights = (webinar.highlights ?? []).filter(h => h.trim() !== "");
  const benefits = filledHighlights.length > 0
    ? filledHighlights.slice(0, 3).map((h, i) => ({ Icon: ICONS[i], label: h }))
    : sortedQuestions.slice(0, 3).map((q, i) => ({
        Icon: ICONS[i],
        label: lang === "en" ? (q as any).label_en || q.label_fr : q.label_fr,
      }));

  const formattedDate = webinar.date
    ? new Date(webinar.date).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", {
        day: "numeric", month: "long", year: "numeric",
      })
    : lang === "en" ? "Online · Free" : "En ligne · Gratuit";

  const registrations = webinar.stats?.total_registrations ?? 0;
  const questionCount = sortedQuestions.length;
  const webinarLang   = webinar.lang === "en" ? "English" : webinar.lang === "fr" ? "Français" : "FR / EN";

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-8 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={VP} transition={{ duration: 0.6, ease }}
        >
          <div className="relative rounded-3xl border border-slate-100 bg-white shadow-[0_12px_48px_-8px_rgba(15,23,42,0.10)] overflow-hidden">
            {/* Top accent bar */}
            <div className="h-1 bg-gradient-to-r from-teal-500 to-emerald-400" />

            <div className="grid md:grid-cols-[1fr_1px_1fr]">

              {/* ── LEFT ── */}
              <div className="p-8 md:p-10 flex flex-col gap-7">

                {/* Badge + date row */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-100 px-3.5 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-teal-700 uppercase tracking-[1.2px]">{t("webinar.overline")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center">
                      <Calendar size={13} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-slate-800 leading-tight">{t("webinar.card_type")}</p>
                      <p className="text-[11px] text-slate-400">{formattedDate}</p>
                    </div>
                  </div>
                </div>

                {/* Title + description */}
                <div>
                  <h3 className="text-[1.75rem] font-extrabold text-slate-900 leading-[1.15] tracking-tight mb-3">
                    {webinar.title}
                  </h3>
                  {webinar.description && webinar.description !== webinar.title && (
                    <p className="text-[14px] text-slate-500 leading-relaxed">{webinar.description}</p>
                  )}
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Clock size={14} className="text-teal-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{lang === "en" ? "Duration" : "Durée"}</p>
                      <p className="text-[13px] font-bold text-slate-700">~3 min</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <MessageSquare size={14} className="text-teal-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{lang === "en" ? "Questions" : "Questions"}</p>
                      <p className="text-[13px] font-bold text-slate-700">{questionCount} {lang === "en" ? "total" : "au total"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Globe size={14} className="text-teal-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{lang === "en" ? "Language" : "Langue"}</p>
                      <p className="text-[13px] font-bold text-slate-700">{webinarLang}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Users size={14} className="text-teal-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{lang === "en" ? "Registered" : "Inscrits"}</p>
                      <p className="text-[13px] font-bold text-slate-700">{registrations + 10}+</p>
                    </div>
                  </div>
                </div>

                {/* Included pills */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { icon: CheckCircle, label: lang === "en" ? "100% Free" : "100% Gratuit" },
                    { icon: CheckCircle, label: lang === "en" ? "No signup required" : "Sans inscription" },
                    { icon: CheckCircle, label: lang === "en" ? "AI-generated report" : "Rapport IA offert" },
                  ].map(({ icon: Icon, label }) => (
                    <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] font-semibold text-emerald-700">
                      <Icon size={10} />
                      {label}
                    </span>
                  ))}
                </div>

                {/* CTA + avatars */}
                <div>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 380, damping: 20 }}
                    onClick={() => { window.location.href = `/webinar/${webinar._id}`; }}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 text-white text-[15px] font-bold shadow-[0_4px_20px_rgba(13,148,136,0.30)] hover:shadow-[0_6px_28px_rgba(13,148,136,0.42)] transition-shadow mb-4"
                  >
                    {t("webinar.cta")}
                    <ArrowRight size={16} />
                  </motion.button>
                  <div className="flex items-center gap-2.5">
                    <div className="flex -space-x-2">
                      {AVATARS.map((l, i) => (
                        <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-teal-100 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-teal-700">{l}</span>
                        </div>
                      ))}
                    </div>
                    <span className="text-[12px] text-slate-400 font-medium">
                      {registrations > 0
                        ? `${registrations + 10}+ ${lang === "en" ? "professionals already registered" : "professionnels inscrits"}`
                        : lang === "en" ? "Be the first to register" : "Soyez le premier inscrit"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vertical divider */}
              <div className="hidden md:block bg-slate-100" />

              {/* ── RIGHT ── */}
              <div className="p-8 md:p-10 bg-slate-50/50 flex flex-col gap-5">

                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[1.4px] mb-1">
                    {lang === "en" ? "What you'll get" : "Ce que vous obtiendrez"}
                  </p>
                  <p className="text-[13px] text-slate-500">
                    {lang === "en"
                      ? "Answer a few questions and receive a personalized AI analysis of your recruitment maturity."
                      : "Répondez à quelques questions et recevez une analyse IA personnalisée de votre maturité recrutement."}
                  </p>
                </div>

                {/* Benefit cards */}
                <div className="flex flex-col gap-3">
                  {benefits.map(({ Icon, label }, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={VP} transition={{ duration: 0.4, ease, delay: i * 0.09 }}
                      className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-teal-200 hover:shadow-md transition-all"
                    >
                      <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon size={15} className="text-teal-600" />
                      </div>
                      <div>
                        <span className="text-[13px] text-slate-700 font-semibold leading-snug">{label}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>


              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WebinarSection;
