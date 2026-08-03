import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import NextLink from "next/link";
import { Mail } from "lucide-react";
import { useRouter } from "next/router";
import { LINKEDIN_URL, TWITTER_URL, CONTACT_EMAIL } from "@/modules/shared/constants";

const FooterLink: React.FC<{ children: React.ReactNode; href?: string }> = ({ children, href = "#" }) => (
  <NextLink
    href={href}
    className="text-[12px] text-gray-600 hover:text-gray-900 transition-colors leading-snug"
  >
    {children}
  </NextLink>
);

const LinkedInSVG = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-[15px]">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const XSVG = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-[14px]">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const SOCIAL = [
  { Icon: LinkedInSVG, href: LINKEDIN_URL, label: "LinkedIn"   },
  { Icon: XSVG,        href: TWITTER_URL,  label: "X / Twitter" },
];

const Footer: React.FC = () => {
  const { t } = useTranslation("common");
  const router = useRouter();

  const goHome = useCallback(() => {
    if (router.pathname === "/") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    router.push("/");
  }, [router]);

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-10">

        {/* Top — logo + disclaimer */}
        <div className="mb-5">
          <div className="mb-2 cursor-pointer inline-block" onClick={goHome}>
            <Image
              src="/logo.svg"
              alt="TalentAI"
              width={130}
              height={36}
              className="h-9 w-auto object-contain"
            />
          </div>
          <p className="text-[11px] text-gray-500 leading-[1.5] mb-1">
            {t("footer.copyright")}
          </p>
          <p className="text-[11px] text-gray-500 leading-[1.6]">
            {t("footer.disclaimer_prefix")}{" "}
            <NextLink href="/terms" className="text-gray-600 underline hover:text-gray-800 transition-colors">
              {t("footer.terms_of_use")}
            </NextLink>
            {" · "}
            <NextLink href="/privacy" className="text-gray-600 underline hover:text-gray-800 transition-colors">
              {t("footer.privacy_policy")}
            </NextLink>
            . {t("footer.disclaimer_suffix")}
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mb-5" />

        {/* Bottom — links, email, socials */}
        <div className="flex flex-col md:flex-row justify-end gap-5 md:gap-8 items-start md:items-center">

          {/* Policy links */}
          <div className="flex gap-5">
            <FooterLink href="/terms">{t("footer.terms_of_use")}</FooterLink>
            <FooterLink href="/privacy">{t("footer.privacy_policy")}</FooterLink>
          </div>

          {/* Contact email */}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="flex items-center gap-1.5 text-[12px] text-gray-600 hover:text-primary transition-colors"
          >
            <Mail className="size-[14px]" />
            {CONTACT_EMAIL}
          </a>

          {/* Social icons */}
          <div className="flex gap-2">
            {SOCIAL.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="size-8 rounded-lg bg-gray-100 hover:bg-primary/10 hover:text-primary flex items-center justify-center text-gray-600 transition-colors"
              >
                <Icon />
              </a>
            ))}
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
