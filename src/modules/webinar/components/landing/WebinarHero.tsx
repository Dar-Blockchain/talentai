import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ChevronDown, Calendar, Clock, MessageSquare, Video } from "lucide-react";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { scrollToRegister } from "@/modules/webinar/utils/scrollToRegister";

const EASE = [0.22, 1, 0.36, 1] as const;

export function WebinarHero({ lang, title, desc, formattedDate, questionsCount, registrations, webinarLink }: {
  lang: "fr" | "en";
  title: string;
  desc: string;
  formattedDate: string | null;
  questionsCount: number;
  registrations: number;
  webinarLink?: string;
}) {
  const { t } = useTranslation("home");
  const isEn = lang === "en";

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "radial-gradient(120% 100% at 50% 0%, #EAF6F0 0%, #FBFBF9 60%)" }}
    >
      <div className="relative max-w-[1200px] mx-auto px-4 md:px-8 py-20 md:py-28">

        <motion.div
          initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="max-w-[640px] mx-auto text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-7">
            <span className="w-6 h-px bg-[#6AD39C]" />
            <span className="text-[11px] font-semibold uppercase text-[#10453F]" style={{ letterSpacing: "0.16em" }}>
              {isEn ? "Free live session" : "Session live gratuite"}
            </span>
          </div>

          <h1
            className="text-[#10453F] mb-6"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontWeight: 600,
              fontSize: "clamp(2rem, 4vw + 1rem, 4.375rem)",
              lineHeight: 1.08,
              letterSpacing: "-0.015em",
            }}
          >
            {title || (isEn
              ? <>Discover your AI<br />recruitment readiness</>
              : <>Découvrez votre<br />maturité IA en recrutement</>)}
          </h1>

          <p
            className="text-[1.125rem] md:text-[1.25rem] max-w-[480px] mx-auto mb-9"
            style={{ color: "#5B6B65", lineHeight: 1.55, fontWeight: 400 }}
          >
            {desc || (isEn
              ? "A focused, 3-minute conversation with our AI — turned into a personal report on where your hiring stands today."
              : "Un échange ciblé de 3 minutes avec notre IA, transformé en un rapport personnalisé sur l'état de votre recrutement.")}
          </p>

          <div
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[13.5px] mb-8"
            style={{ color: "#6B7A74" }}
          >
            {formattedDate && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={13} />{formattedDate}
              </span>
            )}
            {formattedDate && <span aria-hidden>·</span>}
            <span className="inline-flex items-center gap-1.5">
              <Clock size={13} />~3 min
            </span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare size={13} />
              {questionsCount} {isEn ? "questions" : "questions"}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 text-[13px] mb-8" style={{ color: "#6B7A74" }}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6AD39C] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#6AD39C]" />
            </span>
            {registrations}+ {isEn ? "professionals already registered" : "professionnels déjà inscrits"}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild size="lg"
              className="rounded-lg bg-[#6AD39C] text-[#0B2A22] hover:bg-[#52C88A] font-semibold"
            >
              <a href="#webinar-register" onClick={scrollToRegister}>
                {t("webinar.cta")}
                <ChevronDown size={16} />
              </a>
            </Button>

            {webinarLink && (
              <Button
                asChild size="lg" variant="outline"
                className="rounded-lg font-semibold"
              >
                <a href={webinarLink} target="_blank" rel="noopener noreferrer">
                  <Video size={16} />
                  {isEn ? "Join Webinar" : "Rejoindre le webinar"}
                </a>
              </Button>
            )}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
