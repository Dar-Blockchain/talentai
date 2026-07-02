import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import LandingPageLayout from "@/modules/home/shared/components/LandingPageLayout";
import WebinarSection from "@/modules/home/company/components/WebinarSection";
import { SITE_URL, OG_IMAGE } from "@/modules/shared/constants";

const CANONICAL = `${SITE_URL}/webinar`;
const VP = { once: true, margin: "-40px" };
const ease = [0.22, 1, 0.36, 1] as const;


const STEPS_FR = [
  { n: "1", title: "Accédez au webinar", desc: "Cliquez sur le bouton d'inscription ci-contre. Aucun compte requis." },
  { n: "2", title: "Répondez aux questions", desc: "3 minutes de questions ciblées sur votre maturité IA et vos défis recrutement." },
  { n: "3", title: "L'IA analyse votre profil", desc: "Notre moteur calcule votre score de maturité et identifie vos douleurs clés." },
  { n: "4", title: "Recevez votre rapport", desc: "Un rapport personnalisé livré directement dans votre boîte email." },
];

const STEPS_EN = [
  { n: "1", title: "Access the webinar", desc: "Click the registration button. No account required." },
  { n: "2", title: "Answer the questions", desc: "3 minutes of targeted questions about your AI maturity and hiring challenges." },
  { n: "3", title: "AI analyses your profile", desc: "Our engine calculates your maturity score and identifies your key pain points." },
  { n: "4", title: "Receive your report", desc: "A personalised report delivered directly to your email inbox." },
];

const WebinarPage: React.FC = () => {
  const router = useRouter();
  const { i18n } = useTranslation();
  const previewId = router.isReady ? (router.query.id as string | undefined) : undefined;
  const routerReady = router.isReady;
  const lang: "fr" | "en" =
    (router.query.lang as string) === "en" || i18n.language?.startsWith("en") ? "en" : "fr";

  const steps = lang === "en" ? STEPS_EN : STEPS_FR;

  const [aboutFr, setAboutFr] = useState<string>("");
  const [aboutEn, setAboutEn] = useState<string>("");

  useEffect(() => {
    if (!routerReady) return;
    const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const url = previewId
      ? `${BACKEND}/webinars/public/${previewId}`
      : `${BACKEND}/webinars/public/active`;
    fetch(url)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.data) {
          setAboutFr(d.data.about_fr || "");
          setAboutEn(d.data.about_en || "");
        }
      })
      .catch(() => {});
  }, [previewId, routerReady]);

  const aboutText = lang === "en" ? aboutEn : aboutFr;

  return (
    <>
      <Head>
        <title>Talent AI — Webinaire gratuit : L'IA en recrutement</title>
        <meta name="description" content="Rejoignez notre webinaire gratuit et découvrez comment l'IA transforme le recrutement. Session live de 60 minutes avec cas concrets et Q&A en direct." />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:title" content="Talent AI — Webinaire gratuit : L'IA en recrutement" />
        <meta property="og:description" content="Session live gratuite de 60 min. Cas concrets, Q&A en direct. Inscrivez-vous maintenant." />
        <meta property="og:image" content={OG_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Talent AI — Webinaire gratuit : L'IA en recrutement" />
        <meta name="twitter:image" content={OG_IMAGE} />
      </Head>

      <LandingPageLayout>

        {/* ── HERO BAND ── */}
        <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-500 text-white">
          <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-16 md:py-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="max-w-[640px]"
            >
              <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-[11px] font-bold uppercase tracking-widest mb-5 border border-white/20">
                {lang === "en" ? "Free · Live · AI-powered" : "Gratuit · Live · IA"}
              </span>
              <h1 className="text-[2.6rem] md:text-[3.4rem] font-black leading-[1.07] tracking-tight mb-5">
                {lang === "en"
                  ? "The free webinar that reveals your AI recruitment readiness"
                  : "Le webinar gratuit qui révèle votre maturité IA en recrutement"}
              </h1>
              <p className="text-[17px] text-white/80 leading-relaxed mb-8 max-w-[520px]">
                {lang === "en"
                  ? "Answer 3 minutes of questions and instantly receive a complete, personalised AI analysis of your recruitment challenges — at no cost."
                  : "Répondez à 3 minutes de questions et recevez instantanément une analyse IA complète et personnalisée de vos défis recrutement — gratuitement."}
              </p>
              <div className="flex flex-wrap gap-4 text-[13px] text-white/70">
                {(lang === "en"
                  ? ["✓ No registration", "✓ Results in 3 min", "✓ AI report by email"]
                  : ["✓ Sans inscription", "✓ Résultats en 3 min", "✓ Rapport IA par email"]
                ).map(t => <span key={t} className="font-semibold">{t}</span>)}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── MAIN CONTENT + STICKY CARD ── */}
        <div className="bg-slate-50">
          <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-14 md:py-20">
            <div className="grid md:grid-cols-[1fr_380px] gap-12 md:gap-16 items-start">

              {/* LEFT — editorial content */}
              <div>

                {/* What is it */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={VP} transition={{ duration: 0.5, ease }}
                  className="mb-14"
                >
                  <h2 className="text-[1.5rem] font-black text-slate-900 tracking-tight mb-4">
                    {lang === "en" ? "What is this webinar?" : "C'est quoi ce webinar ?"}
                  </h2>
                  {aboutText ? (
                    <div className="text-[15px] text-slate-600 leading-relaxed whitespace-pre-line">
                      {aboutText}
                    </div>
                  ) : (
                    <div className="prose prose-slate max-w-none text-[15px] text-slate-600 leading-relaxed space-y-3">
                      <p>
                        {lang === "en"
                          ? "This is not a classic webinar where you passively watch a presentation. It's an interactive AI-powered assessment that analyses your recruitment maturity in real time and delivers a tailored report directly to your inbox."
                          : "Ce n'est pas un webinar classique où vous regardez passivement une présentation. C'est une évaluation interactive propulsée par l'IA qui analyse votre maturité recrutement en temps réel et vous livre un rapport personnalisé directement dans votre boîte mail."}
                      </p>
                      <p>
                        {lang === "en"
                          ? "In just 3 minutes, our AI engine measures your AI adoption level, identifies your main recruitment pain points, and generates a concrete action plan tailored to your profile."
                          : "En seulement 3 minutes, notre moteur IA mesure votre niveau d'adoption de l'IA, identifie vos principaux points de douleur recrutement, et génère un plan d'action concret adapté à votre profil."}
                      </p>
                    </div>
                  )}
                </motion.section>

                {/* How it works */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={VP} transition={{ duration: 0.5, ease }}
                  className="mb-14"
                >
                  <h2 className="text-[1.5rem] font-black text-slate-900 tracking-tight mb-6">
                    {lang === "en" ? "How does it work?" : "Comment ça marche ?"}
                  </h2>
                  <div className="space-y-0">
                    {steps.map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                        viewport={VP} transition={{ duration: 0.4, ease, delay: i * 0.07 }}
                        className="flex gap-5 pb-7 relative"
                      >
                        {/* Line */}
                        {i < steps.length - 1 && (
                          <div className="absolute left-[18px] top-10 bottom-0 w-px bg-teal-100" />
                        )}
                        {/* Number */}
                        <div className="shrink-0 w-9 h-9 rounded-full bg-teal-600 text-white text-[13px] font-black flex items-center justify-center z-10">
                          {s.n}
                        </div>
                        <div className="pt-1 min-w-0">
                          <h3 className="text-[15px] font-bold text-slate-900 mb-1">{s.title}</h3>
                          <p className="text-[13px] text-slate-500 leading-relaxed">{s.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>


              </div>

              {/* RIGHT — sticky registration card */}
              <div className="md:sticky md:top-8">
                <WebinarSection previewId={previewId} routerReady={routerReady} />
              </div>

            </div>
          </div>
        </div>

      </LandingPageLayout>
    </>
  );
};

export default WebinarPage;
