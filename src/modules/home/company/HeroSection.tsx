import { useState, useEffect, useRef } from "react";
import { PlayCircle }  from "lucide-react";
import { Button }      from "@/modules/shared/ui/shadcn/button";
import CaptchaModal    from "./CaptchaModal";
import DemoVideoModal  from "./DemoVideoModal";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const CALENDLY      = "https://calendly.com/talent__ai/30min";
const STAT_TARGETS  = [90, 10, 24, 75];
const STAT_SUFFIXES = ["%", "×", "/7", "%"];

const StatCard: React.FC<{
  target: number; suffix: string;
  label: string; sub: string;
  delay: number; isLast: boolean;
}> = ({ target, suffix, label, sub, delay, isLast }) => {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const raw    = useMotionValue(0);
  const num    = useTransform(raw, (v) => Math.round(v).toString());

  useEffect(() => {
    if (inView) animate(raw, target, { duration: 1.8, ease: "easeOut" });
  }, [inView, raw, target]);

  return (
    <motion.div
      ref={ref}
      variants={{
        hidden:  { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const } },
      }}
      whileHover={{ y: -4, transition: { type: "spring", stiffness: 340, damping: 20 } }}
    >
      <div className={cn("px-2 pl-0 py-1", !isLast && "border-r border-gray-200")}>
        <div className="flex items-baseline gap-0.5 mb-1.5">
          <span className="font-black text-[28px] md:text-[34px] leading-none bg-gradient-to-br from-primary to-emerald-600 bg-clip-text text-transparent">
            <motion.span>{num}</motion.span>
          </span>
          <span className="font-extrabold text-base md:text-lg leading-none bg-gradient-to-br from-primary to-emerald-600 bg-clip-text text-transparent">
            {suffix}
          </span>
        </div>
        <p className="font-bold text-[11.5px] text-gray-900 leading-snug">{label}</p>
        <p className="text-[10px] text-gray-400 leading-snug mt-0.5">{sub}</p>
      </div>
    </motion.div>
  );
};

const fadeUp   = (delay = 0) => ({ initial: { opacity: 0, y: 28 },  animate: { opacity: 1, y: 0 },  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const } });
const fadeRight = (delay = 0) => ({ initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const } });

const CompanyHeroSection = () => {
  const { t } = useTranslation("home");
  const [captchaOpen, setCaptchaOpen] = useState(false);
  const [videoOpen,   setVideoOpen]   = useState(false);
  const handleVerified = () => window.open(CALENDLY, "_blank");

  const STATS = [
    { label: t("hero.stats.screening_label"), sub: t("hero.stats.screening_sub") },
    { label: t("hero.stats.cheaper_label"),   sub: t("hero.stats.cheaper_sub")   },
    { label: t("hero.stats.interviews_label"),sub: t("hero.stats.interviews_sub") },
    { label: t("hero.stats.faster_label"),    sub: t("hero.stats.faster_sub")    },
  ];

  return (
    <section
      className="relative overflow-hidden pt-12 md:pt-16 pb-8 md:pb-12"
      style={{
        backgroundImage: `
          linear-gradient(0deg, #F2F4F7, #F2F4F7),
          linear-gradient(90deg, rgba(13,148,136,0.08) 1px, transparent 1px),
          linear-gradient(180deg, rgba(13,148,136,0.08) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
        backgroundBlendMode: "overlay",
      }}
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">

        {/* LEFT */}
        <div>
          <motion.div {...fadeUp(0)}>
            <h1 className="font-bold text-[36px] sm:text-[44px] md:text-[52px] leading-[1.08] text-gray-900 mb-5">
              {t("hero.headline_1")}
              <br />
              {t("hero.headline_2")}{" "}
              <span className="text-primary">{t("hero.headline_accent")}</span>
            </h1>
          </motion.div>

          <motion.div {...fadeUp(0.12)}>
            <p className="text-[15px] md:text-base text-gray-500 leading-[1.75] mb-7 max-w-[520px]">
              {t("hero.body")}{" "}
              <span className="text-gray-900 font-semibold">{t("hero.body_accent")}</span>.
            </p>
          </motion.div>

          <motion.div {...fadeUp(0.24)}>
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <motion.div
                whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Button
                  onClick={() => setCaptchaOpen(true)}
                  className="bg-primary text-white hover:bg-primary/90 rounded-[10px] px-7 py-5 text-[15px] font-bold shadow-[0_4px_18px_rgba(13,148,136,0.4)] hover:shadow-[0_8px_28px_rgba(13,148,136,0.5)]"
                >
                  {t("hero.cta_primary")}
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Button
                  variant="outline"
                  onClick={() => setVideoOpen(true)}
                  className="border-2 border-gray-300 text-gray-700 rounded-[10px] px-7 py-5 text-[15px] font-medium hover:bg-gray-900 hover:border-gray-900 hover:text-white gap-2"
                >
                  <PlayCircle className="size-[18px]" />
                  {t("hero.cta_demo")}
                </Button>
              </motion.div>
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.32)}>
            <p className="text-[13px] text-gray-400 mb-8">{t("hero.trust")}</p>
          </motion.div>

          {/* Stats row */}
          <div className="border-t border-gray-200 pt-5">
            <motion.div
              initial="hidden" animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.42 } } }}
            >
              <div className="grid grid-cols-4 gap-0">
                {STATS.map((s, i) => (
                  <StatCard
                    key={i}
                    target={STAT_TARGETS[i]}
                    suffix={STAT_SUFFIXES[i]}
                    label={s.label}
                    sub={s.sub}
                    delay={0.42 + i * 0.1}
                    isLast={i === STATS.length - 1}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* RIGHT */}
        <motion.div {...fadeRight(0.18)} className="hidden md:flex justify-end">
          <div className="relative w-[110%] ml-auto">
            <img
              src="/images/home/HeroSectionLanding.png"
              alt="TalentAI Dashboard"
              className="w-full h-auto rounded-xl block"
            />
          </div>
        </motion.div>

      </div>

      <CaptchaModal open={captchaOpen} onVerified={handleVerified} onClose={() => setCaptchaOpen(false)} />
      <DemoVideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
    </section>
  );
};

export default CompanyHeroSection;
