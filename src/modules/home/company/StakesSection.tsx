import { useState, useEffect, useRef } from "react";
import { ArrowRight, Clock, Ban, DollarSign, AlertTriangle, CalendarClock, TrendingDown } from "lucide-react";
import { Button }   from "@/modules/shared/ui/shadcn/button";
import CaptchaModal from "./CaptchaModal";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const CALENDLY = "https://calendly.com/talent__ai/30min";
const VP   = { once: true, margin: "-60px" };
const ease = [0.22, 1, 0.36, 1] as const;

const Counter: React.FC<{ target: number; prefix: string; suffix: string }> = ({ target, prefix, suffix }) => {
  const ref    = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const raw    = useMotionValue(0);
  const num    = useTransform(raw, (v) => Math.round(v).toLocaleString());
  useEffect(() => { if (inView) animate(raw, target, { duration: 1.8, ease: "easeOut" }); }, [inView, raw, target]);
  return (
    <span ref={ref} className="inline-flex items-baseline gap-px">
      {prefix}<motion.span>{num}</motion.span>{suffix}
    </span>
  );
};

const STAT_META = [
  { Icon: DollarSign,    color: "text-rose-500",   bg: "bg-rose-50",   border: "border-rose-100",   bar: 55 },
  { Icon: AlertTriangle, color: "text-orange-500",  bg: "bg-orange-50", border: "border-orange-100", bar: 80 },
  { Icon: CalendarClock, color: "text-amber-500",   bg: "bg-amber-50",  border: "border-amber-100",  bar: 70 },
  { Icon: TrendingDown,  color: "text-red-500",     bg: "bg-red-50",    border: "border-red-100",    bar: 45 },
];

const StakesSection: React.FC = () => {
  const { t } = useTranslation("home");
  const [captchaOpen, setCaptchaOpen] = useState(false);
  const handleVerified = () => window.open(CALENDLY, "_blank");

  const STATS = [
    { target: 500, prefix: "$", suffix: "+", unit: t("stakes.stat_1_unit"), desc: t("stakes.stat_1_desc") },
    { target: 25,  prefix: "$", suffix: "K", unit: t("stakes.stat_2_unit"), desc: t("stakes.stat_2_desc") },
    { target: 42,  prefix: "",  suffix: "",  unit: t("stakes.stat_3_unit"), desc: t("stakes.stat_3_desc") },
    { target: 24,  prefix: "",  suffix: "%", unit: t("stakes.stat_4_unit"), desc: t("stakes.stat_4_desc") },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 relative overflow-hidden">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={VP}
        transition={{ duration: 0.6, ease }}>
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 border border-rose-200 px-4 py-1.5 mb-6">
            <AlertTriangle className="size-3 text-rose-500" />
            <span className="text-[12px] font-bold text-rose-500 uppercase tracking-[0.9px]">
              {t("stakes.overline")}
            </span>
          </div>
          <h2 className="font-extrabold text-[28px] sm:text-[36px] md:text-[50px] leading-[1.08] text-gray-900 mb-4 tracking-[-0.5px] md:tracking-[-1px]">
            {t("stakes.headline_1")}{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-gray-900">{t("stakes.headline_accent")}</span>
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={VP}
                transition={{ duration: 0.7, delay: 0.4, ease }}
                className="absolute bottom-[6%] left-0 right-0 h-[8px] bg-rose-100 origin-left -z-[1] rounded"
              />
            </span>
          </h2>
          <p className="text-[15px] md:text-base text-gray-400 max-w-[520px] mx-auto leading-[1.7]">
            {t("stakes.body")}
          </p>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial="hidden" whileInView="visible" viewport={VP}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8"
      >
        {STATS.map((s, i) => {
          const { Icon, color, bg, border, bar } = STAT_META[i];
          return (
            <motion.div
              key={i}
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease } } }}
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 340, damping: 20 } }}
            >
              <div className="h-full bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.05)] px-5 py-5 flex flex-col gap-3 overflow-hidden relative">
                <div className={cn("absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl", bg.replace("50", "200"))} />
                <div className={cn("size-9 rounded-xl flex items-center justify-center flex-shrink-0", bg, "border", border)}>
                  <Icon className={cn("size-4", color)} />
                </div>
                <div>
                  <p className="font-black text-[32px] md:text-[40px] leading-none tracking-[-1.5px] text-gray-900 mb-1">
                    <Counter target={s.target} prefix={s.prefix} suffix={s.suffix} />
                  </p>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.6px]">
                    {s.unit}
                  </p>
                </div>
                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${bar}%` }}
                    viewport={VP}
                    transition={{ duration: 1.4, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                    className={cn("h-full rounded-full", bg.replace("50", "300"))}
                  />
                </div>
                <p className="text-[11.5px] text-gray-500 leading-snug">{s.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Source */}
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={VP}
        transition={{ duration: 0.5, delay: 0.3 }}>
        <p className="text-[10px] text-gray-300 text-center mb-8 md:mb-10 tracking-[0.4px]">
          {t("stakes.source")}
        </p>
      </motion.div>

      {/* CTA banner */}
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={VP}
        transition={{ duration: 0.6, delay: 0.2, ease }}>
        <div className="relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8 px-6 md:px-10 py-7 md:py-8 rounded-2xl bg-gray-950 border border-gray-800">
          <div className="pointer-events-none absolute -top-16 -left-16 size-[260px] rounded-full"
            style={{ background: "radial-gradient(circle,rgba(13,148,136,0.12) 0%,transparent 70%)" }} />
          <div className="relative flex-1">
            <p className="text-[11px] font-semibold text-primary uppercase tracking-[1px] mb-1.5">
              Stop losing money
            </p>
            <h3 className="font-bold text-[18px] md:text-[22px] text-white mb-1 leading-snug">
              {t("stakes.cta_headline_1")}{" "}
              <span className="text-primary">{t("stakes.cta_headline_accent")}</span>
            </h3>
            <p className="text-[13px] text-white/50">{t("stakes.cta_body")}</p>
          </div>
          <div className="relative flex flex-col gap-3 items-start md:items-end flex-shrink-0">
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}>
              <Button
                onClick={() => setCaptchaOpen(true)}
                className="bg-primary text-white hover:bg-primary/90 rounded-[10px] px-8 py-5 text-[15px] font-bold shadow-[0_4px_18px_rgba(13,148,136,0.4)] hover:shadow-[0_6px_24px_rgba(13,148,136,0.5)] gap-2 whitespace-nowrap"
              >
                {t("stakes.cta_button")}
                <ArrowRight className="size-4" />
              </Button>
            </motion.div>
            <div className="flex gap-5">
              {[{ Icon: Clock, label: t("stakes.trust_live") }, { Icon: Ban, label: t("stakes.trust_cancel") }].map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon className="size-3 text-white/30" />
                  <span className="text-[11px] text-white/35">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <CaptchaModal open={captchaOpen} onVerified={handleVerified} onClose={() => setCaptchaOpen(false)} />
    </div>
  );
};

export default StakesSection;
