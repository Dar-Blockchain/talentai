import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowRight, Calendar, Clock, Users, MessageSquare, CheckCircle } from "lucide-react";

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
    return <div className="h-72 bg-slate-200 rounded-2xl animate-pulse" />;
  }

  if (!webinar) return null;

  const sortedQuestions = webinar.questions?.length
    ? [...webinar.questions].sort((a, b) => a.order - b.order)
    : [];

  const formattedDate = webinar.date
    ? new Date(webinar.date).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  const registrations = webinar.stats?.total_registrations ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={VP} transition={{ duration: 0.5, ease }}
      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md"
    >
      {/* Top accent */}
      <div className="h-1.5 bg-gradient-to-r from-teal-500 to-emerald-400" />

      <div className="p-6">

        {/* Badge + date */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-teal-50 text-teal-700 border border-teal-200">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            {lang === "en" ? "Live webinar" : "Webinar en direct"}
          </span>
          {formattedDate && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-50 text-slate-500 border border-slate-200">
              <Calendar size={9} />
              {formattedDate}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-[1.2rem] font-black text-slate-900 leading-snug tracking-tight mb-2">
          {webinar.title}
        </h3>

        {/* Description */}
        {webinar.description && webinar.description !== webinar.title && (
          <p className="text-[13px] text-slate-500 leading-relaxed mb-5">
            {webinar.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5">
          {[
            { icon: Clock,         value: "~3 min",                       label: lang === "en" ? "Duration"  : "Durée"     },
            { icon: MessageSquare, value: String(sortedQuestions.length), label: lang === "en" ? "Questions" : "Questions" },
            { icon: Users,         value: `${registrations + 10}+`,       label: lang === "en" ? "Inscrits"  : "Inscrits"  },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <s.icon size={12} className="text-teal-500 shrink-0" />
              <span className="text-[12px] font-bold text-slate-700">{s.value}</span>
              <span className="text-[11px] text-slate-400">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100 mb-5" />

        {/* Included */}
        <div className="space-y-2 mb-6">
          {[
            lang === "en" ? "100% free, no credit card" : "100% gratuit, sans carte bancaire",
            lang === "en" ? "No registration required" : "Sans inscription requise",
            lang === "en" ? "AI report sent by email" : "Rapport IA envoyé par email",
          ].map(label => (
            <div key={label} className="flex items-center gap-2 text-[12px] text-slate-600">
              <CheckCircle size={13} className="text-teal-500 shrink-0" />
              {label}
            </div>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.975 }}
          transition={{ type: "spring", stiffness: 340, damping: 22 }}
          onClick={() => { window.location.href = `/webinar/${webinar._id}`; }}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors mb-4"
        >
          {t("webinar.cta")}
          <ArrowRight size={15} />
        </motion.button>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-2">
          <div className="flex -space-x-1.5">
            {AVATARS.map((l, i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-teal-100 flex items-center justify-center text-[9px] font-bold text-teal-700">
                {l}
              </div>
            ))}
          </div>
          <span className="text-[11px] text-slate-400">
            {registrations + 10}+ {lang === "en" ? "already registered" : "déjà inscrits"}
          </span>
        </div>

      </div>
    </motion.div>
  );
};

export default WebinarSection;
