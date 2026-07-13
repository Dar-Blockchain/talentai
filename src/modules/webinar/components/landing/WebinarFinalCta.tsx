import { WebinarRegisterForm } from "./WebinarRegisterForm";
import type { WebinarContact } from "@/modules/webinar/types";

/** Closing section — restates the value prop and hosts the registration form. */
export function WebinarFinalCta({ webinarId, lang, loading, onRegistered }: {
  webinarId?: string; lang: "fr" | "en"; loading: boolean;
  onRegistered: (submissionId: string, contact: WebinarContact, isReturning: boolean) => void;
}) {
  const isEn = lang === "en";

  return (
    <section
      id="webinar-register"
      className="relative overflow-hidden scroll-mt-0"
      style={{ background: "radial-gradient(120% 100% at 88% 100%, #EAF6F0 0%, #FBFBF9 60%)" }}
    >
      <div className="relative max-w-[1200px] mx-auto px-4 md:px-8 py-20 md:py-28 flex flex-col items-center text-center">
        <div className="flex items-center gap-3 mb-7">
          <span className="w-6 h-px bg-[#6AD39C]" />
          <span className="text-[11px] font-semibold uppercase text-[#10453F]" style={{ letterSpacing: "0.16em" }}>
            {isEn ? "Last step" : "Dernière étape"}
          </span>
          <span className="w-6 h-px bg-[#6AD39C]" />
        </div>

        <h2
          className="text-[#10453F] mb-4"
          style={{ fontFamily: "var(--font-fraunces)", fontWeight: 600, fontSize: "clamp(1.75rem, 3vw + 1rem, 3rem)", letterSpacing: "-0.01em" }}
        >
          {isEn ? "Ready to see where you stand?" : "Prêt à connaître votre position ?"}
        </h2>
        <p className="max-w-[480px] mb-10" style={{ color: "#5B6B65", lineHeight: 1.55 }}>
          {isEn
            ? "Fill in your details below — your personalised AI report is one form away."
            : "Renseignez vos coordonnées ci-dessous — votre rapport IA personnalisé n'est plus qu'à un formulaire."}
        </p>

        <WebinarRegisterForm webinarId={webinarId} lang={lang} loading={loading} onRegistered={onRegistered} />
      </div>
    </section>
  );
}
