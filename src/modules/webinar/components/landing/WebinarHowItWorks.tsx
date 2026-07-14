import { motion } from "framer-motion";
import { Card } from "@/modules/shared/ui/shadcn/card";
import i18n from "@/i18n/config";

const VP   = { once: true, margin: "-40px" };
const EASE = [0.22, 1, 0.36, 1] as const;

export function WebinarHowItWorks({ lang }: { lang: "fr" | "en" }) {
  const t = i18n.getFixedT(lang, "webinar");
  const steps = t("howItWorks.steps", { returnObjects: true }) as { title: string; desc: string }[];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={VP} transition={{ duration: 0.5, ease: EASE }}
      className="text-center"
    >
      <div className="flex items-center justify-center gap-3 mb-3">
        <span className="w-6 h-px bg-[#6AD39C]" />
        <span className="text-[11px] font-semibold uppercase text-[#10453F]/60" style={{ letterSpacing: "0.16em" }}>
          {t("howItWorks.overline")}
        </span>
        <span className="w-6 h-px bg-[#6AD39C]" />
      </div>
      <h2
        className="text-[#10453F] mb-8"
        style={{ fontFamily: "var(--font-fraunces)", fontWeight: 600, fontSize: "clamp(1.6rem, 2vw + 1rem, 2.2rem)", letterSpacing: "-0.01em" }}
      >
        {t("howItWorks.heading")}
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
        {steps.map((s, i) => (
          <Card
            key={i}
            className="bg-[#FBFBF9] border-[#E7E5DE] p-5 gap-0 shadow-[0_10px_30px_-16px_rgba(16,69,63,0.25)] hover:border-[#6AD39C]/50 hover:shadow-[0_14px_34px_-14px_rgba(16,69,63,0.3)] transition-all"
          >
            <span
              className="block text-[1.75rem] leading-none text-[#6AD39C] mb-3"
              style={{ fontFamily: "var(--font-fraunces)", fontWeight: 500 }}
            >
              0{i + 1}
            </span>
            <h3 className="text-[15px] font-semibold text-[#10453F] mb-1.5">{s.title}</h3>
            <p className="text-[13.5px] text-slate-500 leading-relaxed">{s.desc}</p>
          </Card>
        ))}
      </div>
    </motion.section>
  );
}
