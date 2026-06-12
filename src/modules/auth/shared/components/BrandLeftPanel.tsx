import React from "react";
import Image from "next/image";
import NextLink from "next/link";
import { useTranslation } from "react-i18next";

interface Props {
  tKey: "register_panel" | "signin_panel";
  flex?: string;
}

const BrandLeftPanel: React.FC<Props> = ({ tKey, flex = "0 0 45%" }) => {
  const { t } = useTranslation("auth");

  return (
    <div
      className="hidden md:flex flex-col justify-center relative z-10"
      style={{
        flex,
        paddingLeft:   "clamp(40px, 5vw, 72px)",
        paddingRight:  "clamp(40px, 5vw, 72px)",
        paddingTop:    "clamp(32px, 5vh, 56px)",
        paddingBottom: "clamp(32px, 5vh, 56px)",
      }}
    >
      {/* ── Logo ── */}
      <div className="mb-8">
        <NextLink href="/" className="inline-flex">
          <Image
            src="/images/home/logo.svg"
            alt="TalentAI"
            width={148}
            height={40}
            style={{ objectFit: "contain", width: "clamp(110px, 10vw, 148px)", height: "auto" }}
          />
        </NextLink>
      </div>

      {/* ── Brand content ── */}
      <div style={{ maxWidth: "clamp(240px, 33vw, 420px)" }}>
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 self-start"
          style={{
            backgroundColor: "rgba(16,69,63,0.06)",
            border:           "1px solid rgba(16,69,63,0.15)",
            marginBottom:     "clamp(16px, 3vh, 30px)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#10453F" }} />
          <span className="font-sans font-semibold uppercase tracking-widest"
            style={{ fontSize: "clamp(0.55rem, 0.58vw, 0.7rem)", color: "#10453F" }}>
            {t(`${tKey}.badge`)}
          </span>
        </div>

        {/* Headline */}
        <h1
          className="font-sans font-extrabold leading-[1.06] tracking-tight"
          style={{ color: "#0a2e22", fontSize: "clamp(2rem, 3.6vw, 4.4rem)", marginBottom: "clamp(12px, 2vh, 24px)" }}
        >
          {t(`${tKey}.headline_1`)}<br />
          <span style={{ color: "#10453F" }}>{t(`${tKey}.headline_2`)}</span>
        </h1>

        {/* Divider */}
        <div className="rounded-full" style={{
          width: "clamp(32px, 3.5vw, 48px)", height: 3,
          background: "linear-gradient(to right, #10453F, rgba(16,69,63,0.1))",
          marginBottom: "clamp(12px, 2vh, 22px)",
        }} />

        {/* Body */}
        <p className="font-sans leading-[1.9]"
          style={{ color: "rgba(10,46,34,0.6)", fontSize: "clamp(0.82rem, 0.9vw, 1rem)", marginBottom: "clamp(24px, 4vh, 40px)" }}>
          {t(`${tKey}.body`)}
        </p>

        {/* Feature pills */}
        <div className="flex flex-col gap-3">
          {[
            { icon: "⚡", text: "AI-powered interviews in minutes" },
            { icon: "🎯", text: "Auto-scoring & candidate ranking" },
            { icon: "🔒", text: "Enterprise-grade security" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-lg shrink-0"
                style={{ width: 32, height: 32, backgroundColor: "rgba(16,69,63,0.06)", border: "1px solid rgba(16,69,63,0.12)", fontSize: 15 }}>
                {icon}
              </div>
              <span className="font-sans" style={{ color: "rgba(10,46,34,0.65)", fontSize: "clamp(0.75rem, 0.82vw, 0.92rem)" }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Copyright */}
      <p className="absolute bottom-6 font-sans" style={{ color: "rgba(10,46,34,0.3)", fontSize: "clamp(0.55rem, 0.58vw, 0.68rem)" }}>
        {t(`${tKey}.copyright`)}
      </p>
    </div>
  );
};

export default BrandLeftPanel;
