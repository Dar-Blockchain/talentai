import { useState } from "react";
import { CheckCircle2, Play, Sparkles, ShieldCheck, Target, BarChart3 } from "lucide-react";
import { Button }       from "@/modules/shared/ui/shadcn/button";
import CaptchaModal     from "./CaptchaModal";
import DemoVideoModal   from "./DemoVideoModal";
import { motion }       from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const CALENDLY = "https://calendly.com/talent__ai/30min";
const VP   = { once: true, margin: "-80px" };
const ease = [0.22, 1, 0.36, 1] as const;

const BULLET_ICONS = [Play, ShieldCheck, Target, BarChart3];

const QUICK_STATS = [
  { value: "75%",    key: "less_work", color: "text-primary"    },
  { value: "30 min", key: "go_live",   color: "text-violet-600" },
  { value: "10×",    key: "shortlisting", color: "text-emerald-600" },
];

const BiasFreeEvaluation: React.FC = () => {
  const { t } = useTranslation("home");
  const [captchaOpen, setCaptchaOpen] = useState(false);
  const [videoOpen,   setVideoOpen]   = useState(false);
  const handleVerified = () => window.open(CALENDLY, "_blank");

  const BULLETS = [
    t("solution.bullet_video"),
    t("solution.bullet_pipeline"),
    t("solution.bullet_shortlists"),
    t("solution.bullet_credits"),
  ];

  return (
    <div id="features" className="max-w-[1200px] mx-auto px-4 md:px-8">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={VP} transition={{ duration: 0.6, ease }}
        className="mb-12 md:mb-16"
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/[0.07] border border-primary/20 px-4 py-1.5 mb-5">
          <Sparkles className="size-3 text-primary" />
          <span className="text-[11.5px] font-bold text-primary uppercase tracking-[0.9px]">
            {t("solution.overline")}
          </span>
        </div>

        <h2 className="font-extrabold text-[28px] sm:text-[36px] md:text-[50px] leading-[1.1] tracking-[-0.5px] md:tracking-[-1.5px] text-gray-900 mb-4">
          {t("solution.headline_1")}{" "}
          <span className="text-primary">{t("solution.headline_accent")}</span>
        </h2>

        <p className="text-[15px] md:text-[16px] leading-[1.75] text-gray-400 max-w-[520px]">
          {t("solution.body")}
        </p>
      </motion.div>

      {/* ── Two-column body ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-start">

        {/* LEFT — video + stats */}
        <motion.div
          initial={{ opacity: 0, x: -32 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={VP} transition={{ duration: 0.65, ease }}
          className="flex flex-col gap-4"
        >
          {/* Video card */}
          <div
            onClick={() => setVideoOpen(true)}
            className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-[0_12px_40px_rgba(0,0,0,0.14),_0_0_0_1px_rgba(13,148,136,0.12)] hover:shadow-[0_20px_56px_rgba(0,0,0,0.18),_0_0_0_2px_rgba(13,148,136,0.30)] hover:-translate-y-1 transition-all duration-250"
          >
            <img src="/images/home/Iframe.png" alt="AI Interview Demo" className="w-full h-auto block" />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/35 via-black/10 to-transparent" />

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-[64px] rounded-full bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:border-primary transition-all duration-250">
                <Play className="size-6 text-white ml-0.5" fill="white" />
              </div>
            </div>

            {/* Badge */}
            <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1 border border-white/10">
              <span className="size-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10.5px] font-bold text-white tracking-[0.8px]">{t("solution.demo_badge")}</span>
            </div>
          </div>

          {/* Quick stats */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={VP}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } } }}
          >
            <div className="grid grid-cols-3 gap-2.5">
              {QUICK_STATS.map((s) => (
                <motion.div
                  key={s.key}
                  variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease } } }}
                  whileHover={{ y: -3, transition: { type: "spring", stiffness: 320, damping: 18 } }}
                >
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.05)] px-4 py-4 text-center">
                    <p className={cn("font-black text-[22px] leading-none mb-1", s.color)}>{s.value}</p>
                    <p className="text-[11px] text-gray-400 leading-snug">{t(`solution.stats.${s.key}`)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT — bullets + CTA */}
        <motion.div
          initial={{ opacity: 0, x: 32 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={VP} transition={{ duration: 0.65, delay: 0.1, ease }}
        >
          {/* Sub-headline */}
          <div className="mb-7">
            <h3 className="font-extrabold text-[20px] md:text-[28px] leading-[1.2] text-gray-900 mb-2 tracking-[-0.3px]">
              {t("solution.right_headline_1")}{" "}
              <span className="text-primary">{t("solution.right_headline_accent")}</span>
            </h3>
            <p className="text-[14px] md:text-[15px] text-gray-400 leading-[1.75]">
              {t("solution.right_body")}
            </p>
          </div>

          {/* Bullets */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={VP}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } }}
            className="flex flex-col gap-2.5 mb-8"
          >
            {BULLETS.map((b, i) => {
              const Icon = BULLET_ICONS[i];
              return (
                <motion.div
                  key={b}
                  variants={{ hidden: { opacity: 0, x: 18 }, visible: { opacity: 1, x: 0, transition: { duration: 0.42, ease } } }}
                  whileHover={{ x: 4, transition: { type: "spring", stiffness: 300, damping: 22 } }}
                >
                  <div className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl bg-white border border-gray-200 shadow-[0_1px_6px_rgba(0,0,0,0.04)] hover:border-primary/30 hover:shadow-[0_4px_16px_rgba(13,148,136,0.08)] transition-all duration-150 group">
                    <div className="size-7 rounded-lg bg-primary/[0.08] border border-primary/15 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/[0.12] transition-colors">
                      <Icon className="size-3.5 text-primary" />
                    </div>
                    <span className="text-[13.5px] font-medium text-gray-700 leading-snug">{b}</span>
                    <CheckCircle2 className="size-4 text-primary/40 ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* CTA */}
          <motion.div
            whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="inline-block"
          >
            <Button
              onClick={() => setCaptchaOpen(true)}
              size="xl"
              className="rounded-xl shadow-[0_4px_20px_rgba(13,148,136,0.38)] hover:shadow-[0_8px_28px_rgba(13,148,136,0.48)]"
            >
              {t("solution.cta")}
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <CaptchaModal   open={captchaOpen} onVerified={handleVerified} onClose={() => setCaptchaOpen(false)} />
      <DemoVideoModal open={videoOpen}   onClose={() => setVideoOpen(false)} />
    </div>
  );
};

export default BiasFreeEvaluation;
