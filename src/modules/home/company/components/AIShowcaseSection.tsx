import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Clock, DollarSign, AlertTriangle, FileSearch } from "lucide-react";

const VP   = { once: true, margin: "-80px" };
const ease = [0.22, 1, 0.36, 1] as const;
const DRAIN_PER_SECOND = 500 / 86400;

const STAT_ICONS = [
  { Icon: Clock,         hex: "#ef4444", bg: "#fef2f2" },
  { Icon: DollarSign,    hex: "#f97316", bg: "#fff7ed" },
  { Icon: AlertTriangle, hex: "#eab308", bg: "#fefce8" },
  { Icon: FileSearch,    hex: "#8b5cf6", bg: "#f5f3ff" },
];

const Counter: React.FC<{ target: number; prefix?: string; suffix?: string; started: boolean }> =
  ({ target, prefix = "", suffix = "", started }) => {
  const raw = useMotionValue(0);
  const num = useTransform(raw, (v) => Math.round(v).toLocaleString());
  useEffect(() => { if (started) animate(raw, target, { duration: 1.8, ease: "easeOut" }); }, [started, raw, target]);
  return (
    <span className="inline-flex items-baseline gap-[2px]">
      {prefix && <span className="font-extrabold text-[85%] leading-none">{prefix}</span>}
      <motion.span className="font-black leading-none">{num}</motion.span>
      {suffix && <span className="font-extrabold text-[85%] leading-none">{suffix}</span>}
    </span>
  );
};

const AIShowcaseSection: React.FC = () => {
  const { t } = useTranslation("home");
  const ref     = useRef<HTMLDivElement>(null);
  const inView  = useInView(ref, { once: true, margin: "-80px" });
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    if (!inView) return;
    setStarted(true);
    startTime.current = Date.now();
    const id = setInterval(() => setElapsed((Date.now() - startTime.current!) / 1000), 50);
    return () => clearInterval(id);
  }, [inView]);

  const drainedAmount = (elapsed * DRAIN_PER_SECOND).toFixed(2);

  const STATS = [
    { target: 42,  suffix: "+",          unit: t("spotlight.stats.days_unit"),     label: t("spotlight.stats.days_label")     },
    { target: 500, prefix: "$",          unit: t("spotlight.stats.cost_unit"),     label: t("spotlight.stats.cost_label")     },
    { target: 25,  prefix: "$", suffix: "K", unit: t("spotlight.stats.bad_hire_unit"), label: t("spotlight.stats.bad_hire_label") },
    { target: 200, suffix: "+",          unit: t("spotlight.stats.resumes_unit"),  label: t("spotlight.stats.resumes_label")  },
  ];

  return (
    <div ref={ref} className="max-w-[1100px] mx-auto px-4 md:px-8">

      {/* ── Header ── */}
      <div className="text-center mb-10 md:mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={VP} transition={{ duration: 0.55, ease }}
        >
          <div className="inline-flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-full px-4 py-1.5 mb-6">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-[1px]">
              {t("spotlight.overline")}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={VP} transition={{ duration: 0.6, delay: 0.05, ease }}
        >
          <h2 className="font-extrabold text-[28px] sm:text-[36px] md:text-[48px] leading-[1.1] text-gray-900 mb-3 tracking-[-0.5px] md:tracking-[-1px]">
            {t("spotlight.headline_1")}{" "}
            <span className="italic text-gray-600">{t("spotlight.headline_accent")}</span>
          </h2>
          <p className="text-[14px] md:text-base text-gray-500 max-w-[480px] mx-auto">
            {t("spotlight.body")}
          </p>
        </motion.div>
      </div>

      {/* ── Two-column body ── */}
      <div className="flex flex-col-reverse md:grid md:grid-cols-[1fr_360px] gap-4">

        {/* LEFT — stat rows */}
        <div className="flex flex-col gap-3">
          {STATS.map((s, i) => {
            const { Icon, hex, bg } = STAT_ICONS[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={VP}
                transition={{ duration: 0.5, delay: i * 0.09, ease }}
                whileHover={{ x: 5, transition: { type: "spring", stiffness: 300, damping: 22 } }}
                className="relative flex items-center gap-4 bg-white rounded-2xl border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] transition-shadow duration-200 px-4 sm:px-5 py-4 sm:py-5 overflow-hidden group cursor-default"
              >
                {/* Colored left accent bar */}
                <div
                  className="absolute left-0 inset-y-0 w-[3px] rounded-l-2xl"
                  style={{ background: hex }}
                />

                {/* Icon badge */}
                <div
                  className="size-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: bg }}
                >
                  <Icon className="size-[18px]" style={{ color: hex }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span
                      className="leading-none tracking-tight"
                      style={{ fontSize: "clamp(22px,2.8vw,36px)", color: "#111827" }}
                    >
                      <Counter
                        target={s.target}
                        prefix={s.prefix}
                        suffix={s.suffix}
                        started={started}
                      />
                    </span>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.5px]">
                      {s.unit}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-gray-500 leading-snug">{s.label}</p>
                </div>

                {/* Subtle hover radial glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                  style={{ background: `radial-gradient(circle at 8% 50%, ${hex}0d, transparent 55%)` }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* RIGHT — Live drain panel */}
        <motion.div
          initial={{ opacity: 0, x: 28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={VP}
          transition={{ duration: 0.65, delay: 0.2, ease }}
        >
          <div
            className="h-full min-h-[200px] sm:min-h-[260px] rounded-2xl relative overflow-hidden flex flex-col items-center justify-center px-4 sm:px-6 py-7 sm:py-10 text-center border border-emerald-100 shadow-[0_4px_20px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)]"
            style={{ background: "linear-gradient(150deg,#fdfffd 0%,#f7fef9 50%,#fdfffd 100%)" }}
          >
            {/* Soft green glow from bottom */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 110%, rgba(16,185,129,0.12) 0%, transparent 65%)" }}
            />

            {/* Pulsing rings */}
            <motion.div
              animate={{ scale: [1, 1.18, 1], opacity: [0.18, 0.04, 0.18] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute size-52 rounded-full border border-emerald-300/50 pointer-events-none"
            />
            <motion.div
              animate={{ scale: [1, 1.35, 1], opacity: [0.10, 0, 0.10] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              className="absolute size-52 rounded-full border border-emerald-200/40 pointer-events-none"
            />

            {/* Live badge */}
            <div className="flex items-center gap-2 mb-6 bg-white/70 border border-emerald-200 rounded-full px-3 py-1.5 shadow-sm">
              <div className="relative">
                <motion.span
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="block size-[7px] rounded-full bg-emerald-500"
                />
                <motion.span
                  animate={{ scale: [1, 2.4, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full bg-emerald-500"
                />
              </div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-[1.2px]">
                {t("spotlight.drain_label")}
              </span>
            </div>

            {/* Drain amount */}
            <p className="font-black leading-none tracking-[-3px] text-gray-900 tabular-nums mb-3"
              style={{ fontSize: "clamp(36px,5vw,64px)" }}>
              ${drainedAmount}
            </p>

            <p className="text-[12px] text-gray-500 leading-[1.75] max-w-[220px] sm:max-w-[190px]">
              {t("spotlight.drain_sub")}
            </p>

            {/* Bottom edge fade */}
            <div
              className="absolute inset-x-0 bottom-0 h-10 pointer-events-none"
              style={{ background: "linear-gradient(to top, rgba(253,255,253,0.7), transparent)" }}
            />
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default AIShowcaseSection;
