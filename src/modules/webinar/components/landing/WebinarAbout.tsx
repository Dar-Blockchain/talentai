import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const VP   = { once: true, margin: "-40px" };
const EASE = [0.22, 1, 0.36, 1] as const;

/** Intro section — the webinar's own "about" copy plus its highlight bullets, both admin-configured and returned by the public webinar endpoint. */
export function WebinarAbout({ lang, aboutText, highlights }: {
  lang: "fr" | "en";
  aboutText?: string;
  highlights?: string[];
}) {
  const isEn = lang === "en";
  const items = (highlights ?? []).filter(h => h.trim());

  if (!aboutText && items.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={VP} transition={{ duration: 0.5, ease: EASE }}
      className="mb-20"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="w-6 h-px bg-[#6AD39C]" />
        <span className="text-[11px] font-semibold uppercase text-[#10453F]/60" style={{ letterSpacing: "0.16em" }}>
          {isEn ? "About" : "À propos"}
        </span>
      </div>
      <h2
        className="text-[#10453F] mb-6"
        style={{ fontFamily: "var(--font-fraunces)", fontWeight: 600, fontSize: "clamp(1.6rem, 2vw + 1rem, 2.2rem)", letterSpacing: "-0.01em" }}
      >
        {isEn ? "What is this webinar?" : "C'est quoi ce webinar ?"}
      </h2>

      {aboutText && (
        <p className="text-[15px] text-slate-600 leading-relaxed whitespace-pre-line mb-6 max-w-[720px]">
          {aboutText}
        </p>
      )}

      {items.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-3 max-w-[720px]">
          {items.map((label, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-xl border border-[#E7E5DE] bg-[#FBFBF9] px-4 py-3 text-[13.5px] text-slate-600"
            >
              <CheckCircle size={16} className="text-[#6AD39C] shrink-0" />
              {label}
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
}
