import { Settings2, Bot, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const VP   = { once: true, margin: "-60px" };
const ease = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  {
    Icon:   Settings2,
    number: "01",
    accent: {
      text: "text-primary", bg: "bg-primary/10", border: "border-primary/20",
      solid: "bg-primary", ring: "rgba(13,148,136,0.15)", line: "#0D9488",
    },
    features: ["30-min setup", "No IT required", "Custom thresholds"],
  },
  {
    Icon:   Bot,
    number: "02",
    accent: {
      text: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100",
      solid: "bg-violet-600", ring: "rgba(124,58,237,0.12)", line: "#7C3AED",
    },
    features: ["Runs 24/7", "Zero bias", "Adaptive questions"],
  },
  {
    Icon:   BadgeCheck,
    number: "03",
    accent: {
      text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100",
      solid: "bg-emerald-600", ring: "rgba(5,150,105,0.12)", line: "#059669",
    },
    features: ["Auto-ranked", "Auditable scores", "One-click offer"],
  },
];

export default function ProcessStepper() {
  const { t } = useTranslation("home");

  const steps = STEPS.map((s, i) => ({
    ...s,
    tag:   t(`plan.step_${i + 1}_tag`),
    label: t(`plan.step_${i + 1}_label`),
    desc:  t(`plan.step_${i + 1}_desc`),
  }));

  return (
    <div className="max-w-[1100px] mx-auto">

      {/* ── Desktop ── */}
      <div className="hidden md:block">

        {/* Step number row */}
        <div className="relative grid grid-cols-3 mb-6">

          {/* Connecting line */}
          <div className="absolute top-[28px] left-[calc(100%/6)] right-[calc(100%/6)] h-px z-0">
            <div className="h-full bg-gray-200 rounded-full" />
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={VP}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: "linear-gradient(90deg,#0D9488,#7C3AED,#059669)" }}
            />
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, scale: 0.7 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={VP}
              transition={{ duration: 0.45, delay: i * 0.15 + 0.1, ease }}
              className="flex flex-col items-center gap-2 relative z-10"
            >
              {/* Circle */}
              <div
                className={`size-14 rounded-full ${step.accent.solid} flex items-center justify-center shadow-[0_4px_16px_var(--ring)]`}
                style={{ "--ring": step.accent.ring } as React.CSSProperties}
              >
                <span className="font-black text-[15px] text-white tracking-[0.5px]">
                  {step.number}
                </span>
              </div>
              <span className={`text-[10.5px] font-bold uppercase tracking-[0.8px] ${step.accent.text}`}>
                {step.tag}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Cards row */}
        <div className="grid grid-cols-3 gap-4 items-stretch">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VP}
              transition={{ duration: 0.55, delay: i * 0.13 + 0.3, ease }}
              whileHover={{ y: -5, transition: { type: "spring", stiffness: 300, damping: 20 } }}
              className="h-full"
            >
              <div
                className="relative h-full bg-white rounded-2xl border border-gray-200 overflow-hidden p-6 flex flex-col gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.10)] transition-shadow duration-200"
              >
                {/* Top accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-[3px]"
                  style={{ background: `linear-gradient(90deg,${step.accent.line},transparent)` }}
                />

                {/* Ghost number */}
                <span className="absolute bottom-2 right-4 font-black text-[88px] leading-none select-none pointer-events-none tracking-[-5px]"
                  style={{ color: `${step.accent.line}08` }}>
                  {step.number}
                </span>

                {/* Icon */}
                <div
                  className={`size-11 rounded-xl flex items-center justify-center ${step.accent.bg} border ${step.accent.border}`}
                  style={{ boxShadow: `0 0 0 5px ${step.accent.ring}` }}
                >
                  <step.Icon className={`size-5 ${step.accent.text}`} />
                </div>

                {/* Title + desc */}
                <div className="flex-1">
                  <h3 className="font-bold text-[18px] text-gray-900 leading-snug mb-2">
                    {step.label}
                  </h3>
                  <p className="text-[13.5px] text-gray-500 leading-[1.75]">
                    {step.desc}
                  </p>
                </div>

                {/* Mini features — pinned to bottom */}
                <div className="flex flex-col gap-1.5 pt-3 border-t border-gray-100">
                  {step.features.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <span className={`size-1.5 rounded-full flex-shrink-0 ${step.accent.solid}`} />
                      <span className="text-[12px] text-gray-500 leading-none">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Mobile: vertical timeline ── */}
      <div className="flex flex-col gap-0 md:hidden">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={VP}
            transition={{ duration: 0.5, delay: i * 0.1, ease }}
            className="flex gap-4 items-start"
          >
            {/* Left: circle + line */}
            <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
              <div className={`size-10 rounded-full ${step.accent.solid} flex items-center justify-center flex-shrink-0`}>
                <span className="font-black text-[12px] text-white">{step.number}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="w-px flex-1 min-h-[44px] my-2"
                  style={{ background: `linear-gradient(180deg,${step.accent.line},transparent)` }} />
              )}
            </div>

            {/* Content */}
            <div className={i < steps.length - 1 ? "pb-6 sm:pb-8 flex-1" : "flex-1"}>
              <span className={`text-[10px] font-bold uppercase tracking-[0.8px] ${step.accent.text} mb-1 block`}>
                {step.tag}
              </span>
              <h3 className="font-bold text-[16px] text-gray-900 leading-snug mb-1.5">
                {step.label}
              </h3>
              <p className="text-[13px] text-gray-500 leading-[1.7] mb-3">{step.desc}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {step.features.map((f) => (
                  <div key={f} className="flex items-center gap-1.5">
                    <span className={`size-1.5 rounded-full ${step.accent.solid}`} />
                    <span className="text-[11.5px] text-gray-500">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
