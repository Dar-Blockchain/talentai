import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import i18n from "@/i18n/config";

const VP   = { once: true, margin: "-40px" };
const EASE = [0.22, 1, 0.36, 1] as const;

/** Intro section — the webinar's own "about" copy plus its highlight bullets, both admin-configured and returned by the public webinar endpoint. */
export function WebinarAbout({ lang, aboutText, highlights }: {
  lang: "fr" | "en";
  aboutText?: string;
  highlights?: string[];
}) {
  const t = i18n.getFixedT(lang, "webinar");
  const items = (highlights ?? []).filter(h => h.trim());

  if (!aboutText && items.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={VP} transition={{ duration: 0.5, ease: EASE }}
      className="mb-20 text-center"
    >
      <div className="flex items-center justify-center gap-3 mb-3">
        <span className="w-6 h-px bg-[#6AD39C]" />
        <span className="text-[11px] font-semibold uppercase text-[#10453F]/60" style={{ letterSpacing: "0.16em" }}>
          {t("about.overline")}
        </span>
        <span className="w-6 h-px bg-[#6AD39C]" />
      </div>
      <h2
        className="text-[#10453F] mb-8"
        style={{ fontFamily: "var(--font-fraunces)", fontWeight: 600, fontSize: "clamp(1.6rem, 2vw + 1rem, 2.2rem)", letterSpacing: "-0.01em" }}
      >
        {t("about.heading")}
      </h2>

      {aboutText && (
        <p className="text-[15px] text-slate-600 leading-relaxed whitespace-pre-line max-w-220 mx-auto">
          {aboutText}
        </p>
      )}

      {items.length > 0 && (
        <div
          className={`grid sm:grid-cols-3 gap-4 max-w-240 mx-auto ${aboutText ? "mt-10" : ""}`}
        >
          {items.map((label, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#E7E5DE] bg-[#FBFBF9] p-5 flex flex-col items-center text-center gap-3"
            >
              <span className="w-8 h-8 rounded-full bg-[#6AD39C]/15 flex items-center justify-center shrink-0">
                <CheckCircle size={16} className="text-[#0F9D73]" />
              </span>
              <p className="text-[13.5px] text-slate-600 leading-relaxed">{label}</p>
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
}
