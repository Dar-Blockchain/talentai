import React from "react";
import Image from "next/image";
import { ArrowLeft, Globe } from "lucide-react";
import { scrollToRegister } from "@/modules/webinar/utils/scrollToRegister";
import { WebinarSubmitButton } from "@/modules/webinar/components/landing/WebinarSubmitButton";
import i18n from "@/i18n/config";

interface WebinarHeaderProps {
  /** Anchor id (without "#") of the registration card to scroll to. Omit to render logo-only (e.g. on the funnel step, which is itself the registration flow). */
  ctaTargetId?: string;
  /** Renders a "back to landing" button on the right instead of the CTA — used on the funnel step, which has no registration form of its own. */
  onBack?: () => void;
  backLabel?: string;
  /** Set false when an ancestor already provides fixed/sticky positioning (e.g. the funnel step's own fixed header wrapper). */
  sticky?: boolean;
  /** The webinar's active render language — drives every label in this header, not just the FR/EN toggle. */
  lang: "fr" | "en";
  /** Only set for a "both"-language webinar; renders the FR/EN toggle button. */
  onToggleLang?: () => void;
}

/**
 * Squeeze header for the webinar page: logo + a single optional CTA.
 * No nav menu, no login link, no hamburger drawer — every extra link is an exit
 * door away from registering.
 */
const WebinarHeader: React.FC<WebinarHeaderProps> = ({
  ctaTargetId,
  onBack,
  backLabel,
  sticky = true,
  lang,
  onToggleLang,
}) => {
  const t = i18n.getFixedT(lang, "webinar");

  return (
    <header
      className={`${sticky ? "sticky top-0 z-50" : ""} bg-white/95 backdrop-blur-sm border-b border-slate-100`}
    >
      <div className="max-w-[1200px] mx-auto px-3 sm:px-4 md:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        <Image
          src="/logo.svg"
          alt="TalentAI"
          width={130}
          height={36}
          className="h-6 sm:h-8 w-auto object-contain shrink-0"
          priority
        />

        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {onToggleLang && (
            <button
              onClick={onToggleLang}
              title={lang === "fr" ? t("header.switchToEnglish") : t("header.switchToFrench")}
              className="inline-flex items-center gap-1 sm:gap-1.5 rounded-xl border border-slate-200 px-2 py-1 sm:px-2.5 sm:py-1.5 font-sans text-[13px] sm:text-[15px] leading-none font-medium tracking-[-0.01em] text-[#10453F] hover:border-[#6AD39C] hover:bg-[#6AD39C]/10 transition-colors shrink-0"
            >
              <Globe size={13} className="shrink-0" />
              {lang === "fr" ? "EN" : "FR"}
            </button>
          )}

          {ctaTargetId && (
            <WebinarSubmitButton
              href={`#${ctaTargetId}`}
              onClick={scrollToRegister}
              label={t("header.cta")}
              className="h-8 sm:h-11 px-3 sm:px-7 text-[12.5px] sm:text-[15px] gap-1 sm:gap-2 [&_svg]:size-3.5 sm:[&_svg]:size-4"
            />
          )}

          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 font-sans text-[13px] sm:text-[15px] leading-none font-medium tracking-[-0.01em] text-[#10453F] hover:text-[#6AD39C] transition-colors shrink-0"
            >
              <ArrowLeft size={15} className="shrink-0" />
              <span className="hidden sm:inline">{backLabel}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default WebinarHeader;
