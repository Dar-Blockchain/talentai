import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import Link from "next/link";
import { Linkedin, Twitter, Mail } from "lucide-react";
import { useRouter } from "next/router";

const FooterLink: React.FC<{ href?: string; children: React.ReactNode }> = ({
  href = "#",
  children,
}) => (
  <Link
    href={href}
    className="text-white font-normal text-[12px] leading-[18px] hover:text-gray-300 transition-colors no-underline"
    style={{ fontFamily: "Fustat, sans-serif" }}
  >
    {children}
  </Link>
);

const HomeFooter: React.FC = () => {
  const { t }  = useTranslation("common");
  const router = useRouter();

  const goHome = useCallback(() => {
    if (router.pathname === "/") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    router.push("/");
  }, [router]);

  return (
    <footer className="bg-[#111827] text-white py-8 px-6 pb-10 md:pb-12">
      <div className="max-w-[1200px] mx-auto">
        {/* Logo + copyright + disclaimer */}
        <div className="mb-3">
          <div className="mb-3">
            <Image
              onClick={goHome}
              src="/images/home/logoDark.svg"
              alt="TalentAI"
              width={140}
              height={40}
              className="object-contain cursor-pointer"
            />
          </div>
          <p
            className="text-[10px] leading-[15px]"
            style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Fustat, sans-serif" }}
          >
            {t("footer.copyright")}
          </p>
          <p
            className="text-[10px] leading-[16px] mt-1"
            style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Poppins, sans-serif" }}
          >
            {t("footer.disclaimer_prefix")}{" "}
            <Link href="/terms" className="underline hover:text-white/80 transition-colors" style={{ color: "rgba(255,255,255,0.5)" }}>
              {t("footer.terms_of_use")}
            </Link>{" "}
            ·{" "}
            <Link href="/privacy" className="underline hover:text-white/80 transition-colors" style={{ color: "rgba(255,255,255,0.5)" }}>
              {t("footer.privacy_policy")}
            </Link>
            . {t("footer.disclaimer_suffix")}
          </p>
        </div>

        <hr className="border-0 border-b border-white/15 mb-5" />

        {/* Bottom row: policy links + email + social */}
        <div className="flex flex-col md:flex-row md:justify-end gap-6 md:gap-12 items-start md:items-center">
          {/* Policy links */}
          <div className="flex gap-6">
            <FooterLink href="/terms">{t("footer.terms_of_use")}</FooterLink>
            <FooterLink href="/privacy">{t("footer.privacy_policy")}</FooterLink>
          </div>

          {/* Contact */}
          <a
            href="mailto:contact@talentai.bid"
            className="flex items-center gap-[6px] text-[12px] transition-colors no-underline"
            style={{ color: "rgba(255,255,255,0.7)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#fff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.7)"; }}
          >
            <Mail className="size-4" />
            contact@talentai.bid
          </a>

          {/* Social */}
          <div className="flex gap-3">
            <a
              href="https://www.linkedin.com/company/talentai-bid/"
              target="_blank"
              rel="noopener noreferrer"
              className="size-8 bg-white rounded-[4px] flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <Linkedin className="size-4 text-[#121212]" />
            </a>
            <a
              href="https://x.com/talentai_bid"
              target="_blank"
              rel="noopener noreferrer"
              className="size-8 bg-white rounded-[4px] flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <Twitter className="size-4 text-[#121212]" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
