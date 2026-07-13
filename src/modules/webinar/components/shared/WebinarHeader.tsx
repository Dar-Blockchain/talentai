import React from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { scrollToRegister } from "@/modules/webinar/utils/scrollToRegister";

interface WebinarHeaderProps {
  /** Anchor id (without "#") of the registration card to scroll to. Omit to render logo-only (e.g. on the funnel step, which is itself the registration flow). */
  ctaTargetId?: string;
  /** Renders a "back to landing" button on the right instead of the CTA — used on the funnel step, which has no registration form of its own. */
  onBack?: () => void;
  backLabel?: string;
  /** Set false when an ancestor already provides fixed/sticky positioning (e.g. the funnel step's own fixed header wrapper). */
  sticky?: boolean;
}

/**
 * Squeeze header for the webinar page: logo + a single optional CTA.
 * No nav menu, no login link, no hamburger drawer — every extra link is an exit
 * door away from registering.
 */
const WebinarHeader: React.FC<WebinarHeaderProps> = ({ ctaTargetId, onBack, backLabel, sticky = true }) => {
  const { t } = useTranslation("home");

  return (
    <header className={`${sticky ? "sticky top-0 z-50" : ""} bg-white/95 backdrop-blur-sm border-b border-slate-100`}>
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Image src="/logo.svg" alt="TalentAI" width={130} height={36} className="h-8 w-auto object-contain" priority />

        {ctaTargetId && (
          <Button asChild className="rounded-xl bg-[#6AD39C] text-[#0B2A22] hover:bg-[#52C88A]">
            <a href={`#${ctaTargetId}`} onClick={scrollToRegister}>
              {t("webinar.cta")}
            </a>
          </Button>
        )}

        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#10453F] hover:text-[#6AD39C] transition-colors"
          >
            <ArrowLeft size={15} className="shrink-0" />
            <span className="hidden sm:inline">{backLabel}</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default WebinarHeader;
