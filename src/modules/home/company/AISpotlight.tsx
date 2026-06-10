import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useTranslation } from "react-i18next";

const VP   = { once: true, margin: "-80px" };
const ease = [0.22, 1, 0.36, 1] as const;
const DRAIN_PER_SECOND = 500 / 86400;

const Counter: React.FC<{ target: number; prefix?: string; suffix?: string; started: boolean }> =
  ({ target, prefix = "", suffix = "", started }) => {
  const raw = useMotionValue(0);
  const num = useTransform(raw, (v) => Math.round(v).toLocaleString());
  useEffect(() => { if (started) animate(raw, target, { duration: 1.8, ease: "easeOut" }); }, [started, raw, target]);
  return (
    <span className="inline-flex items-baseline gap-[2px]">
      {prefix && <span className="font-extrabold text-[85%] leading-none">{prefix}</span>}
      <motion.span className="font-black leading-none" style={{ fontSize: "clamp(28px,3.5vw,42px)" }}>{num}</motion.span>
      {suffix && <span className="font-black text-[85%] leading-none">{suffix}</span>}
    </span>
  );
};

const AISpotlight: React.FC = () => {
  const { t } = useTranslation("home");
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const startTime             = useRef<number | null>(null);

  useEffect(() => {
    if (!inView) return;
    setStarted(true);
    startTime.current = Date.now();
    const id = setInterval(() => setElapsed((Date.now() - startTime.current!) / 1000), 50);
    return () => clearInterval(id);
  }, [inView]);

  const drainedAmount = (elapsed * DRAIN_PER_SECOND).toFixed(2);

  const STATS = [
    { target: 42,  suffix: "+", unit: t("spotlight.stats.days_unit"),     label: t("spotlight.stats.days_label")   },
    { target: 500, prefix: "$", unit: t("spotlight.stats.cost_unit"),     label: t("spotlight.stats.cost_label")   },
    { target: 25,  prefix: "$", suffix: "K", unit: t("spotlight.stats.bad_hire_unit"), label: t("spotlight.stats.bad_hire_label") },
    { target: 200, suffix: "+", unit: t("spotlight.stats.resumes_unit"),  label: t("spotlight.stats.resumes_label") },
  ];

  return (
    <div ref={ref} className="max-w-[1000px] mx-auto px-6 md:px-14 relative text-center">

      {/* Overline */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={VP} transition={{ duration: 0.55, ease }}>
        <div className="inline-flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-full px-4 py-1.5 mb-6">
          <span className="size-1.5 rounded-full bg-primary" />
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-[1px]">
            {t("spotlight.overline")}
          </span>
        </div>
      </motion.div>

      {/* Headline */}
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={VP} transition={{ duration: 0.6, delay: 0.05, ease }}>
        <h2 className="font-extrabold text-[28px] sm:text-[36px] md:text-[48px] leading-[1.1] text-gray-900 mb-3 tracking-[-0.5px] md:tracking-[-1px]">
          {t("spotlight.headline_1")}{" "}
          <span className="text-primary">{t("spotlight.headline_accent")}</span>
        </h2>
        <p className="text-[14px] md:text-base text-gray-400 mb-10 md:mb-14 max-w-[480px] mx-auto">
          {t("spotlight.body")}
        </p>
      </motion.div>

      {/* Stats grid */}
      <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={VP} transition={{ duration: 0.6, delay: 0.1, ease }}>
        <div className="grid grid-cols-2 md:grid-cols-4 mb-10 md:mb-14 rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {STATS.map((s, i) => (
            <div key={i}
              className="relative px-4 md:px-6 py-6 md:py-8 bg-white hover:bg-gray-50 transition-colors"
              style={{
                borderRight:  i < STATS.length - 1 ? "1px solid #E5E7EB" : "none",
                borderBottom: i < 2 ? "1px solid #E5E7EB" : "none",
              }}
            >
              <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <div className="text-gray-900 mb-1.5">
                <Counter target={s.target} prefix={(s as any).prefix} suffix={(s as any).suffix} started={started} />
              </div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.5px]">{s.unit}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Live drain */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={VP} transition={{ duration: 0.6, delay: 0.2, ease }}>
        <div className="mx-auto max-w-[580px] px-6 md:px-10 py-6 md:py-7 rounded-2xl bg-primary/[0.05] border border-primary/20 relative overflow-hidden">
          <div className="flex items-center justify-center gap-2 mb-2">
            <motion.div animate={{ opacity: [1,0.2,1] }} transition={{ duration: 1.2, repeat: Infinity }}>
              <span className="block size-[7px] rounded-full bg-primary" />
            </motion.div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-[1px]">
              {t("spotlight.drain_label")}
            </span>
          </div>
          <p className="font-black text-[36px] md:text-[48px] leading-none tracking-[-2px] text-primary">
            ${drainedAmount}
          </p>
          <p className="text-[12px] text-gray-400 mt-1.5">{t("spotlight.drain_sub")}</p>
        </div>
      </motion.div>

    </div>
  );
};

export default AISpotlight;
