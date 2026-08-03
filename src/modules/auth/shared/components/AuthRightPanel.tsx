import React from "react";
import Image from "next/image";
import NextLink from "next/link";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface Props {
  children:       React.ReactNode;
  footerTKey?:    string;
  maxWidthClass?: string;
}

const AuthRightPanel: React.FC<Props> = ({ children, footerTKey, maxWidthClass = "max-w-sm sm:max-w-md lg:max-w-lg" }) => {
  const { t } = useTranslation("auth");

  return (
    <div className="flex-1 w-full relative z-10 flex flex-col">
      <div className="flex-1 w-full flex flex-col items-center justify-center py-6 sm:py-8 lg:py-10">

        {/* Mobile logo */}
        <div className="lg:hidden flex justify-center shrink-0 mb-5">
          <NextLink href="/" className="inline-flex transition-opacity duration-200 hover:opacity-80">
            <Image
              src="/logo.svg"
              alt="TalentAI"
              width={148}
              height={36}
              className="h-9 w-auto object-contain"
              priority
            />
          </NextLink>
        </div>

        <div className={cn("w-full mx-auto shrink-0", maxWidthClass)}>
          {/* Card */}
          <div className="bg-white rounded-xl overflow-hidden border border-primary/10 shadow-[0_4px_6px_rgba(16,69,63,0.04),0_16px_48px_rgba(16,69,63,0.1),0_2px_8px_rgba(0,0,0,0.04)]">
            {/* Top accent bar */}
            <div className="h-0.75 bg-linear-to-r from-[#10453F] via-[#6AD39C] to-[#52e899]" />
            <div className="px-4 sm:px-7 lg:px-9 pt-5 sm:pt-7 lg:pt-8 pb-6 sm:pb-8 lg:pb-9">
              {children}
            </div>
          </div>

          {/* Terms footer */}
          {footerTKey && (
            <p className="mt-5 text-[11px] text-muted-foreground font-sans text-center leading-relaxed px-2 wrap-break-word">
              {t(`${footerTKey}.footer_prefix`)}{" "}
              <NextLink href="/terms"   className="font-semibold text-primary no-underline hover:underline">{t(`${footerTKey}.terms`)}</NextLink>
              {" "}{t(`${footerTKey}.footer_and`)}{" "}
              <NextLink href="/privacy" className="font-semibold text-primary no-underline hover:underline">{t(`${footerTKey}.privacy`)}</NextLink>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthRightPanel;
