import React from "react";
import NextLink from "next/link";
import { useTranslation } from "react-i18next";
import { CONTACT_EMAIL } from "@/modules/shared/constants";

/**
 * Minimal footer for webinar landing/funnel pages: copyright + the legally
 * required Terms/Privacy links (this flow collects name + email) + a support
 * contact. No sitemap, no social links, no other products — those are exit
 * doors on a page with a single conversion goal.
 */
const WebinarFooter: React.FC = () => {
  const { t } = useTranslation("common");

  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[11px] text-gray-500">{t("footer.copyright")}</p>
        <div className="flex items-center gap-4 text-[11px] text-gray-500">
          <NextLink href="/terms" className="underline hover:text-gray-800 transition-colors">
            {t("footer.terms_of_use")}
          </NextLink>
          <NextLink href="/privacy" className="underline hover:text-gray-800 transition-colors">
            {t("footer.privacy_policy")}
          </NextLink>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-gray-800 transition-colors">
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default WebinarFooter;
