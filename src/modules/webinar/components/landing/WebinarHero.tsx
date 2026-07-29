import { motion } from "framer-motion";
import { ChevronDown, Calendar, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { scrollToRegister } from "@/modules/webinar/utils/scrollToRegister";
import i18n from "@/i18n/config";

const EASE = [0.22, 1, 0.36, 1] as const;

export function WebinarHero({
  lang,
  title,
  desc,
  formattedDate,
  formattedEndTime,
  durationLabel,
  questionsCount,
  registrations,
}: {
  lang: "fr" | "en";
  title: string;
  desc: string;
  formattedDate: string | null;
  formattedEndTime?: string | null;
  durationLabel?: string | null;
  questionsCount: number;
  registrations: number;
}) {
  const t = i18n.getFixedT(lang, "webinar");
  // Long custom titles (admin-entered, up to 80 chars) need to scale down —
  // the default clamp is tuned for the short 2-line fallback copy and looks
  // oversized/cramped once the title runs past a couple of short lines.
  const isLongTitle = (title?.length ?? 0) > 70;

  return (
    <section
      className="relative overflow-hidden flex items-center min-h-[calc(100svh-4rem)]"
      style={{
        background:
          "radial-gradient(120% 100% at 50% 0%, #EAF6F0 0%, #FBFBF9 60%)",
      }}
    >
      <div className="relative w-full max-w-[1200px] mx-auto px-4 md:px-8 py-10 md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="max-w-225 mx-auto text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-6 h-px bg-[#6AD39C]" />
            <span
              className="text-[11px] font-semibold uppercase text-[#10453F]"
              style={{ letterSpacing: "0.16em" }}
            >
              {t("hero.badge")}
            </span>
          </div>

          <h1
            className="font-sans text-[#10453F] mb-4"
            style={{
              fontWeight: 600,
              fontSize: isLongTitle
                ? "clamp(2rem, 2.8vw + 0.9rem, 3.75rem)"
                : "clamp(2rem, 4vw + 1rem, 4.375rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.015em",
              textWrap: "balance",
            }}
          >
            {title || (
              <>
                {t("hero.titleLine1")}
                <br />
                {t("hero.titleLine2")}
              </>
            )}
          </h1>

          <p
            className="text-[1.125rem] md:text-[1.25rem] max-w-160 mx-auto mb-5"
            style={{ color: "#5B6B65", lineHeight: 1.55, fontWeight: 400 }}
          >
            {desc || t("hero.desc")}
          </p>

          <div
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[13.5px] mb-4"
            style={{ color: "#6B7A74" }}
          >
            {formattedDate && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={13} />
                {formattedDate}
                {formattedEndTime ? ` – ${formattedEndTime}` : ""}
              </span>
            )}
            {formattedDate && <span aria-hidden>·</span>}
            <span className="inline-flex items-center gap-1.5">
              <Clock size={13} />
              {durationLabel || t("hero.durationDefault")}
            </span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare size={13} />
              {questionsCount} {t("hero.questions")}
            </span>
          </div>

          <div
            className="flex items-center justify-center gap-2 text-[13px] mb-5"
            style={{ color: "#6B7A74" }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6AD39C] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#6AD39C]" />
            </span>
            {t("hero.registrations", { count: registrations })}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <Button
              asChild
              size="lg"
              className="group rounded-2xl bg-[#0F9D73] font-sans text-[17px] leading-none font-medium tracking-[-0.01em] text-white px-10 h-14 shadow-[0_10px_30px_rgba(15,157,115,0.22)] ring-1 ring-inset ring-white/20 transition-all hover:bg-[#095E44] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
            >
              <a href="#webinar-register" onClick={scrollToRegister}>
                {t("header.cta")}
                <ChevronDown
                  size={18}
                  className="transition-transform group-hover:translate-y-0.5"
                />
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
