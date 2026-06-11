import React           from "react";
import { Clock, Ban }  from "lucide-react";
import { Button }      from "@/modules/shared/ui/shadcn/button";
import { motion }      from "framer-motion";
import { useTranslation } from "react-i18next";

const CALENDLY = "https://calendly.com/talent__ai/30min";
const ease     = [0.22, 1, 0.36, 1] as const;
const VP       = { once: true, margin: "-60px" };

const CtaSection: React.FC = () => {
  const { t } = useTranslation("home");

  const TRUST_BADGES = [
    { Icon: Clock, label: t("cta.trust_setup") },
    { Icon: Ban,   label: t("cta.trust_cancel") },
  ];

  return (
    <div className="relative overflow-hidden py-16 md:py-24">

      {/* Subtle animated grid */}
      <motion.div
        animate={{ backgroundPosition: ["0px 0px", "64px 64px"] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.035) 1px,transparent 1px)", backgroundSize: "64px 64px" }}
      />

      {/* Ambient glows */}
      <motion.div animate={{ scale: [1,1.15,1], opacity: [0.6,0.3,0.6] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[60vh] rounded-[50%]"
        style={{ background: "radial-gradient(ellipse,rgba(13,148,136,0.10) 0%,transparent 65%)" }} />
      <motion.div animate={{ x: [0,40,0], y: [0,30,0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-24 -left-24 w-[500px] h-[500px] rounded-[50%]"
        style={{ background: "radial-gradient(circle,rgba(13,148,136,0.08) 0%,transparent 70%)" }} />
      <motion.div animate={{ x: [0,-35,0], y: [0,-25,0] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="pointer-events-none absolute -bottom-24 -right-24 w-[450px] h-[450px] rounded-[50%]"
        style={{ background: "radial-gradient(circle,rgba(99,102,241,0.06) 0%,transparent 70%)" }} />

      {/* Concentric rings */}
      {[{ size: 500, dur: 7, delay: 0 }, { size: 750, dur: 10, delay: 1.5 }, { size: 1050, dur: 13, delay: 3 }].map(({ size, dur, delay }, i) => (
        <motion.div key={i}
          animate={{ scale: [1,1.06,1], opacity: [0.06 - i * 0.015, 0.02, 0.06 - i * 0.015] }}
          transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay }}
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%]"
          style={{ width: size, height: size, border: `1px solid rgba(13,148,136,${0.12 - i * 0.03})` }} />
      ))}

      {/* Floating diamonds — hidden on mobile to avoid overlapping text */}
      <motion.div animate={{ y: [0,-24,0], rotate: [45,70,45], opacity: [0.12,0.22,0.12] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none hidden sm:block absolute top-[10%] left-[5%] size-14 border border-primary/30 rotate-45" />
      <motion.div animate={{ y: [0,20,0], rotate: [45,20,45], opacity: [0.08,0.18,0.08] }} transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="pointer-events-none hidden sm:block absolute bottom-[15%] right-[6%] size-11 border border-primary/25 rotate-45" />
      <motion.div animate={{ y: [0,-16,0], rotate: [45,65,45], opacity: [0.06,0.14,0.06] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        className="pointer-events-none hidden sm:block absolute top-[55%] right-[3%] size-8 border border-primary/20 rotate-45" />

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-16 text-center relative">
        <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={VP} transition={{ duration: 0.6, ease }}>

          <div className="inline-flex items-center rounded-full bg-primary/10 border border-primary/25 px-4 py-1.5 sm:px-5 sm:py-2 mb-6">
            <span className="text-[11px] font-bold text-primary uppercase tracking-[1.2px]">
              {t("cta.overline")}
            </span>
          </div>

          <h2 className="font-extrabold text-[28px] sm:text-[36px] md:text-[52px] leading-[1.1] text-gray-900 tracking-[-0.5px] md:tracking-[-1px] mb-4 mx-auto w-full max-w-[780px]">
            {t("cta.headline_1")}{" "}
            <span className="italic text-gray-600">{t("cta.headline_accent")}</span>
          </h2>

          <p className="text-[15px] md:text-[17px] text-gray-500 leading-[1.75] max-w-[520px] mx-auto mb-10">
            {t("cta.body")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 20 }}>
              <Button onClick={() => window.open(CALENDLY, "_blank")}
                size="xl"
                className="rounded-xl shadow-[0_4px_20px_rgba(13,148,136,0.35)] hover:shadow-[0_8px_30px_rgba(13,148,136,0.45)]">
                {t("cta.btn_primary")}
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 20 }}>
              <Button variant="outline" onClick={() => window.open(CALENDLY, "_blank")}
                size="xl"
                className="rounded-xl border-gray-300 text-gray-600">
                {t("cta.btn_secondary")}
              </Button>
            </motion.div>
          </div>

          <div className="flex flex-wrap gap-6 justify-center">
            {TRUST_BADGES.map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-gray-500">
                <Icon className="size-3" />
                <span className="text-[12px] font-medium">{label}</span>
              </div>
            ))}
          </div>

        </motion.div>

      </div>
    </div>
  );
};

export default CtaSection;
