import React from "react";
import Image from "next/image";
import NextLink from "next/link";
import { useTranslation } from "react-i18next";
import { Zap, Target, ShieldCheck } from "lucide-react";

interface Props {
  tKey: "register_panel" | "signin_panel";
  flex?: string;
}

const BrandLeftPanel: React.FC<Props> = ({ tKey, flex = "0 0 45%" }) => {
  const { t } = useTranslation("auth");

  return (
    <div
      className="hidden lg:flex flex-col z-10 relative pr-10 pt-[clamp(20px,2.5vh,32px)] pb-[clamp(20px,2.5vh,32px)]"
      style={{ flex }}
    >
      {/* ── Logo ── */}
      <div className="mb-[clamp(24px,4vh,48px)]">
        <NextLink href="/" className="inline-flex transition-opacity duration-200 hover:opacity-80">
          <Image
            src="/images/home/logo.svg"
            alt="TalentAI"
            width={148}
            height={36}
            className="h-9 w-auto object-contain"
          />
        </NextLink>
      </div>

      {/* ── Brand content ── */}
      <div className="flex-1 flex flex-col justify-center max-w-[clamp(240px,33vw,420px)]">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 self-start mb-[clamp(16px,3vh,30px)] bg-[rgba(16,69,63,0.06)] border border-[rgba(16,69,63,0.15)]">
          <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#10453F]" />
          <span className="font-sans font-semibold uppercase tracking-widest text-[clamp(0.55rem,0.58vw,0.7rem)] text-[#10453F]">
            {t(`${tKey}.badge`)}
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-sans font-extrabold leading-[1.06] tracking-tight text-[#0a2e22] text-[clamp(2rem,3.6vw,4.4rem)] mb-[clamp(12px,2vh,24px)]">
          {t(`${tKey}.headline_1`)}<br />
          <span className="text-[#10453F]">{t(`${tKey}.headline_2`)}</span>
        </h1>

        {/* Divider */}
        <div className="rounded-full h-[3px] w-[clamp(32px,3.5vw,48px)] mb-[clamp(12px,2vh,22px)] bg-linear-to-r from-[#10453F] to-[rgba(16,69,63,0.1)]" />

        {/* Body */}
        <p className="font-sans leading-[1.9] text-[rgba(10,46,34,0.6)] text-[clamp(0.82rem,0.9vw,1rem)] mb-[clamp(24px,4vh,40px)]">
          {t(`${tKey}.body`)}
        </p>

        {/* Feature pills */}
        <div className="flex flex-col gap-3">
          {[
            { Icon: Zap,         text: "AI-powered interviews in minutes" },
            { Icon: Target,      text: "Auto-scoring & candidate ranking" },
            { Icon: ShieldCheck, text: "Enterprise-grade security" },
          ].map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-lg shrink-0 w-8 h-8 bg-[rgba(16,69,63,0.06)] border border-[rgba(16,69,63,0.12)]">
                <Icon className="size-4 text-[#10453F]" />
              </div>
              <span className="font-sans text-[rgba(10,46,34,0.65)] text-[clamp(0.75rem,0.82vw,0.92rem)]">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Copyright ── */}
      <p className="font-sans text-[rgba(10,46,34,0.3)] text-[clamp(0.55rem,0.58vw,0.68rem)] mt-[clamp(16px,3vh,28px)]">
        {t(`${tKey}.copyright`)}
      </p>
    </div>
  );
};

export default BrandLeftPanel;
