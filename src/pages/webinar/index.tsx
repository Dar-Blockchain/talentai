import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Fraunces } from "next/font/google";
import i18n from "@/i18n/config";
import WebinarHeader from "@/modules/webinar/components/shared/WebinarHeader";
import WebinarFooter from "@/modules/webinar/components/shared/WebinarFooter";
import LoadingScreen from "@/modules/shared/ui/LoadingScreen";
import { WebinarHero } from "@/modules/webinar/components/landing/WebinarHero";
import { WebinarAbout } from "@/modules/webinar/components/landing/WebinarAbout";
import { WebinarHowItWorks } from "@/modules/webinar/components/landing/WebinarHowItWorks";
import { WebinarFinalCta } from "@/modules/webinar/components/landing/WebinarFinalCta";
import { WebinarFunnel } from "@/modules/webinar/components/questionnaire/WebinarFunnel";
import { usePublicWebinarQuery } from "@/modules/webinar/queries";
import type { WebinarContact } from "@/modules/webinar/types";

// Display serif for headlines only — everything else stays on the app's
// Poppins body font. Distinct pairing on purpose: a characterful serif reads
// as "designed", not another SaaS-template geometric sans.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});

interface FunnelSeed {
  contact:      WebinarContact;
  submissionId: string;
  consent:      boolean;
  welcomeBack:  boolean;
}

const WebinarPage: React.FC = () => {
  const router = useRouter();

  // "active" is a literal id the backend treats specially on the same
  // /public/:id route, so previewing a specific webinar (?id=) and showing
  // the currently active one both go through this one endpoint.
  const previewId = (router.query.id as string | undefined) || "active";
  const langParam = (router.query.lang as string)?.toLowerCase();

  const { data: webinar, isLoading: queryLoading } = usePublicWebinarQuery(previewId, router.isReady);
  const loading = !router.isReady || queryLoading;

  // A single-language webinar (fr or en) always renders in that language —
  // no switcher, no falling back to the visitor's browser language. Only a
  // "both" webinar lets the visitor pick, via the header toggle or ?lang=,
  // and defaults to English until they do.
  const lang: "fr" | "en" =
    webinar?.lang === "en"
      ? "en"
      : webinar?.lang === "fr"
        ? "fr"
        : langParam === "fr"
          ? "fr"
          : "en";
  const isEn = lang === "en";
  const t = i18n.getFixedT(lang, "webinar");

  const aboutText    = isEn ? webinar?.about_en : webinar?.about_fr;
  const webinarTitle = (isEn ? webinar?.title_en : webinar?.title_fr) || webinar?.title || "";
  const webinarDesc  = (isEn ? webinar?.description_en : webinar?.description_fr) || webinar?.description || "";
  const formattedDate = webinar?.date
    ? new Date(webinar.date).toLocaleString(isEn ? "en-GB" : "fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })
    : null;
  const formattedEndTime = webinar?.end_date
    ? new Date(webinar.end_date).toLocaleTimeString(isEn ? "en-GB" : "fr-FR", { hour: "2-digit", minute: "2-digit" })
    : null;
  const durationLabel = (() => {
    if (!webinar?.date || !webinar?.end_date) return null;
    const minutes = Math.round((new Date(webinar.end_date).getTime() - new Date(webinar.date).getTime()) / 60000);
    if (minutes <= 0) return null;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h}h`;
    return `${h}h${m}`;
  })();

  // ── Questionnaire funnel — entered once the visitor registers below, or
  // resumed on reload if this device already has an in-progress submission ──
  const [funnelSeed, setFunnelSeed] = useState<FunnelSeed | null>(null);
  const inFunnel = !!funnelSeed;

  useEffect(() => {
    if (!router.isReady) return;
    const saved = localStorage.getItem("webinar_submission_id");
    if (!saved) return;
    let contact: WebinarContact = { nom: "", email: "", entreprise: "" };
    try {
      const savedContact = sessionStorage.getItem("webinar_contact");
      if (savedContact) contact = JSON.parse(savedContact);
    } catch { /* ignore malformed value */ }
    const consent = sessionStorage.getItem("webinar_consent") === "true";
    setFunnelSeed({ contact, submissionId: saved, consent, welcomeBack: false });
  }, [router.isReady]);

  const handleRegistered = useCallback((submissionId: string, contact: WebinarContact, isReturning: boolean) => {
    setFunnelSeed({ contact, submissionId, consent: true, welcomeBack: isReturning });
  }, []);

  const backToLanding = useCallback(() => setFunnelSeed(null), []);

  const showLangSwitch = webinar?.lang === "both";
  const toggleLang = useCallback(() => {
    const next = lang === "fr" ? "en" : "fr";
    router.push({ query: { ...router.query, lang: next } }, undefined, { shallow: true });
  }, [lang, router]);

  return (
    <>
      <div className={`${fraunces.variable} min-h-screen flex flex-col bg-white`}>
        <WebinarHeader
          onBack={inFunnel ? backToLanding : undefined}
          backLabel={t("page.backToLanding")}
          lang={lang}
          onToggleLang={showLangSwitch ? toggleLang : undefined}
        />

        <div className="flex-1 flex flex-col">
          {loading ? (
            inFunnel ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-[#6AD39C]/30 border-t-[#10453F] rounded-full animate-spin" />
              </div>
            ) : (
              <LoadingScreen title={t("page.loading")} />
            )
          ) : !webinar || (inFunnel && webinar.questions.length === 0) ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-[14px] text-slate-400">{t("page.notFound")}</p>
            </div>
          ) : inFunnel ? (
            <WebinarFunnel
              webinar={webinar} lang={lang}
              initialContact={funnelSeed.contact}
              initialSubmissionId={funnelSeed.submissionId}
              initialConsent={funnelSeed.consent}
              welcomeBack={funnelSeed.welcomeBack}
            />
          ) : (
            <>
              <WebinarHero
                lang={lang}
                title={webinarTitle}
                desc={webinarDesc}
                formattedDate={formattedDate}
                formattedEndTime={formattedEndTime}
                durationLabel={durationLabel}
                questionsCount={webinar?.questions.length ?? 0}
                registrations={webinar?.stats?.total_registrations ?? 0}
              />

              {/* ══ Lower content — light canvas, left-aligned with the header/hero ══ */}
              <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-16 md:py-24">
                <WebinarAbout
                  lang={lang}
                  aboutText={aboutText}
                  highlights={webinar?.highlights_enabled === false ? [] : webinar?.highlights}
                />
                <WebinarHowItWorks lang={lang} />
                {/* <WebinarFAQ lang={lang} /> */}
              </div>

              <WebinarFinalCta webinarId={webinar?._id} lang={lang} loading={loading} onRegistered={handleRegistered} />
            </>
          )}
        </div>

        <WebinarFooter />
      </div>
    </>
  );
};

export default WebinarPage;
