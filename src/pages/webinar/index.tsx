import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Fraunces } from "next/font/google";
import WebinarHeader from "@/modules/webinar/components/shared/WebinarHeader";
import WebinarFooter from "@/modules/webinar/components/shared/WebinarFooter";
import LoadingScreen from "@/modules/shared/ui/LoadingScreen";
import { WebinarHero } from "@/modules/webinar/components/landing/WebinarHero";
import { WebinarHowItWorks } from "@/modules/webinar/components/landing/WebinarHowItWorks";
import { WebinarFAQ } from "@/modules/webinar/components/landing/WebinarFAQ";
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
  const { i18n } = useTranslation();

  // "active" is a literal id the backend treats specially on the same
  // /public/:id route, so previewing a specific webinar (?id=) and showing
  // the currently active one both go through this one endpoint.
  const previewId = (router.query.id as string | undefined) || "active";
  const langParam = (router.query.lang as string)?.toLowerCase();
  const i18nLang: "fr" | "en" = i18n.language?.startsWith("en") ? "en" : "fr";

  const { data: webinar, isLoading: queryLoading } = usePublicWebinarQuery(previewId, router.isReady);
  const loading = !router.isReady || queryLoading;

  // Prefer an explicit ?lang=, then the webinar's own configured language,
  // then the visitor's browser/app language.
  const lang: "fr" | "en" =
    langParam === "en" ? "en" : langParam === "fr" ? "fr" : webinar?.lang === "en" ? "en" : i18nLang;
  const isEn = lang === "en";

  const aboutText    = isEn ? webinar?.about_en : webinar?.about_fr;
  const webinarTitle = webinar?.title       ?? "";
  const webinarDesc  = webinar?.description ?? "";
  const formattedDate = webinar?.date
    ? new Date(webinar.date).toLocaleDateString(isEn ? "en-GB" : "fr-FR", { day: "numeric", month: "long" })
    : null;

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

  return (
    <>
      <div className={`${fraunces.variable} min-h-screen flex flex-col bg-white`}>
        <WebinarHeader
          ctaTargetId={inFunnel ? undefined : "webinar-register"}
          onBack={inFunnel ? backToLanding : undefined}
          backLabel={isEn ? "Back to landing page" : "Retour à la page d'accueil"}
        />

        <div className="flex-1 flex flex-col">
          {inFunnel ? (
            loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-[#6AD39C]/30 border-t-[#10453F] rounded-full animate-spin" />
              </div>
            ) : !webinar || webinar.questions.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[14px] text-slate-400">{isEn ? "Webinar not found." : "Webinaire introuvable."}</p>
              </div>
            ) : (
              <WebinarFunnel
                webinar={webinar} lang={lang}
                initialContact={funnelSeed.contact}
                initialSubmissionId={funnelSeed.submissionId}
                initialConsent={funnelSeed.consent}
                welcomeBack={funnelSeed.welcomeBack}
              />
            )
          ) : loading ? (
            <LoadingScreen title={isEn ? "Loading webinar…" : "Chargement du webinar…"} />
          ) : (
            <>
              <WebinarHero
                lang={lang}
                title={webinarTitle}
                desc={webinarDesc}
                formattedDate={formattedDate}
                questionsCount={webinar?.questions.length ?? 0}
                registrations={webinar?.stats?.total_registrations ?? 0}
              />

              {/* ══ Lower content — light canvas, left-aligned with the header/hero ══ */}
              <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-16 md:py-24">
                <WebinarHowItWorks lang={lang} />
                <WebinarFAQ lang={lang} aboutText={aboutText} />
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
