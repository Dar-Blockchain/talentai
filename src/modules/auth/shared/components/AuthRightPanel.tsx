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
    <div className="flex-1 min-h-0 overflow-y-auto relative z-10">
      <div className="min-h-full flex flex-col items-center justify-center px-3 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10">

        {/* Mobile logo */}
        <div className="md:hidden flex justify-center shrink-0 mb-5">
          <NextLink href="/">
            <Image
              src="/images/home/logo.svg"
              alt="TalentAI"
              width={130}
              height={36}
              style={{ objectFit: "contain" }}
            />
          </NextLink>
        </div>

        <div className={cn("w-full shrink-0", maxWidthClass)}>
          {/* Card */}
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius:     20,
            overflow:         "hidden",
            border:           "1px solid rgba(16,69,63,0.1)",
            boxShadow:        "0 4px 6px rgba(16,69,63,0.04), 0 16px 48px rgba(16,69,63,0.1), 0 2px 8px rgba(0,0,0,0.04)",
          }}>
            {/* Top accent bar */}
            <div style={{
              height:     3,
              background: "linear-gradient(to right, #10453F, #6AD39C, #52e899)",
            }} />
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
