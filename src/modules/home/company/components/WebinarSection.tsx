import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Calendar, Users, Zap, ArrowRight } from "lucide-react";

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

  const ICONS = [Zap, Users, Calendar];

  const sortedQuestions = webinar?.questions?.length
    ? [...webinar.questions].sort((a, b) => a.order - b.order)
    : [];

  const filledHighlights = (webinar?.highlights ?? []).filter(h => h.trim() !== "");
  const BENEFITS = filledHighlights.length > 0
    ? filledHighlights.slice(0, 3).map((h, i) => ({ icon: ICONS[i], label: h }))
    : sortedQuestions.slice(0, 3).map((q, i) => ({
        icon: ICONS[i],
        label: lang === "en" ? (q as any).label_en || q.label_fr : q.label_fr,
      }));

  const formattedDate = webinar?.date
    ? new Date(webinar.date).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", {
        day: "numeric", month: "long", year: "numeric",
      })
    : t("webinar.card_sub");

  const registrations = webinar?.stats?.total_registrations ?? 0;
  const AVATARS = ["J", "M", "A", "R", "S"];

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4 animate-pulse">
              <div className="h-4 w-32 bg-slate-200 rounded-full" />
              <div className="h-8 w-3/4 bg-slate-200 rounded-lg" />
              <div className="h-8 w-1/2 bg-slate-200 rounded-lg" />
              <div className="h-16 bg-slate-100 rounded-xl" />
              <div className="h-10 w-40 bg-slate-200 rounded-xl" />
            </div>
            <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  if (!webinar) return null;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-16">
        <div className="max-w-[560px] mx-auto">

          {/* Single card — all data */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={VP} transition={{ duration: 0.6, ease }}
          >
            <div className="relative rounded-2xl border border-slate-100 bg-white shadow-[0_8px_40px_-8px_rgba(15,23,42,0.08)] overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-teal-500 to-emerald-400" />
              <div className="p-8">

                {/* Top row: badge left, live session right */}
                <div className="flex items-start justify-between mb-5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-100 px-3.5 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-teal-700 uppercase tracking-[1.2px]">{t("webinar.overline")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center shrink-0">
                      <Calendar size={13} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-slate-900 leading-tight">{t("webinar.card_type")}</p>
                      <p className="text-[11px] text-slate-400">{formattedDate}</p>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-[1.4rem] font-bold text-slate-900 mb-6 leading-snug">{webinar.title}</h3>

                {/* Benefits */}
                {BENEFITS.length > 0 && (
                  <div className="grid sm:grid-cols-1 gap-2.5 mb-7">
                    {BENEFITS.map(({ icon: Icon, label }) => (
                      <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                          <Icon size={13} className="text-teal-600" />
                        </div>
                        <span className="text-[13px] text-slate-700 font-medium">{label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA button */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 380, damping: 20 }} className="mb-5">
                  <button
                    onClick={() => { window.location.href = `/webinar/${webinar._id}`; }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 text-white text-[14px] font-bold shadow-[0_4px_16px_rgba(13,148,136,0.30)] hover:shadow-[0_6px_24px_rgba(13,148,136,0.40)] transition-shadow"
                  >
                    {t("webinar.cta")}
                    <ArrowRight size={15} />
                  </button>
                </motion.div>

                {/* Footer — avatars + count */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {AVATARS.map((l, i) => (
                        <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-teal-100 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-teal-700">{l}</span>
                        </div>
                      ))}
                    </div>
                    <span className="text-[12px] text-slate-400 font-medium">
                      {registrations > 0
                        ? `${registrations + 10}+ ${lang === "en" ? "registered" : "inscrits"}`
                        : lang === "en" ? "Be the first to register" : "Soyez le premier inscrit"}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">~3 min</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default WebinarSection;
