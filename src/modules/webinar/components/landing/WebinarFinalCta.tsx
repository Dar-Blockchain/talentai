import { WebinarRegisterForm } from "./WebinarRegisterForm";
import i18n from "@/i18n/config";
import type { WebinarContact } from "@/modules/webinar/types";

/** Closing section — restates the value prop and hosts the registration form. */
export function WebinarFinalCta({ webinarId, lang, loading, onRegistered }: {
  webinarId?: string; lang: "fr" | "en"; loading: boolean;
  onRegistered: (submissionId: string, contact: WebinarContact, isReturning: boolean) => void;
}) {
  const t = i18n.getFixedT(lang, "webinar");

  return (
    <section
      id="webinar-register"
      className="relative overflow-hidden -scroll-mt-8"
      style={{ background: "radial-gradient(120% 100% at 88% 100%, #EAF6F0 0%, #FBFBF9 60%)" }}
    >
      <div className="relative max-w-[1200px] mx-auto px-4 md:px-8 py-14 md:py-20 flex flex-col items-center text-center">
        <div className="flex items-center gap-3 mb-5">
          <span className="w-6 h-px bg-[#6AD39C]" />
          <span className="text-[11px] font-semibold uppercase text-[#10453F]" style={{ letterSpacing: "0.16em" }}>
            {t("finalCta.overline")}
          </span>
          <span className="w-6 h-px bg-[#6AD39C]" />
        </div>

        <h2
          className="text-[#10453F] mb-3"
          style={{ fontFamily: "var(--font-fraunces)", fontWeight: 600, fontSize: "clamp(1.75rem, 3vw + 1rem, 3rem)", letterSpacing: "-0.01em" }}
        >
          {t("finalCta.heading")}
        </h2>
        <p className="max-w-[480px] mb-7" style={{ color: "#5B6B65", lineHeight: 1.55 }}>
          {t("finalCta.body")}
        </p>

        <WebinarRegisterForm webinarId={webinarId} lang={lang} loading={loading} onRegistered={onRegistered} />
      </div>
    </section>
  );
}
