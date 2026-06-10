import { Clock3, Users2, BarChart2, ListFilter, TrendingUp, MoveRight, X, CheckCircle2, Zap, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const VP   = { once: true, margin: "-60px" };
const ease = [0.22, 1, 0.36, 1] as const;

const ROW_ICONS = [Clock3, Users2, BarChart2, TrendingUp, ListFilter];

interface Stat {
  value:   string;
  label:   string;
  context: string;
  hex:     string;
  hexDim:  string;
}

const STATS: Stat[] = [
  { value: "4×",   label: "Faster hiring",      context: "vs. traditional recruiting",     hex: "#10B981", hexDim: "#D1FAE5" },
  { value: "75%",  label: "Less manual work",   context: "Scheduling & screening gone",    hex: "#0D9488", hexDim: "#CCFBF1" },
  { value: "< 5%", label: "Bad hire rate",      context: "Down from industry avg. of 39%", hex: "#7C3AED", hexDim: "#EDE9FE" },
];

export default function SuccessSection() {
  const { t } = useTranslation("home");

  const ROWS = [
    { metric: t("transformation.row_1_metric"), before: "42 days",       after: "10 days",     delta: t("transformation.row_1_delta") },
    { metric: t("transformation.row_2_metric"), before: "23 hrs / week", after: "0 hrs",        delta: t("transformation.row_2_delta") },
    { metric: t("transformation.row_3_metric"), before: "39%",           after: "< 5%",         delta: t("transformation.row_3_delta") },
    { metric: t("transformation.row_4_metric"), before: "40%",           after: "98%",          delta: t("transformation.row_4_delta") },
    { metric: t("transformation.row_5_metric"), before: "200+ reviewed", after: "5 top-ranked", delta: t("transformation.row_5_delta") },
  ];

  return (
    <div className="max-w-[1160px] mx-auto px-4 md:px-8">

      {/* ── Section header ── */}
      <motion.div
        initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={VP} transition={{ duration: 0.6, ease }}
        className="mb-10 md:mb-12"
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 border border-gray-200 px-4 py-1.5 mb-5">
          <TrendingUp className="size-3.5 text-gray-500" />
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-[1px]">
            {t("transformation.overline")}
          </span>
        </div>

        <h2 className="font-extrabold text-[30px] sm:text-[40px] md:text-[54px] leading-[1.05] tracking-[-1px] md:tracking-[-2px] text-gray-900 mb-4">
          {t("transformation.headline_1")}{" "}
          <span className="italic text-gray-600">{t("transformation.headline_accent")}</span>
        </h2>

        <p className="text-[14px] sm:text-[15px] md:text-[16.5px] text-gray-500 leading-[1.8] max-w-[460px]">
          {t("transformation.body")}
        </p>
      </motion.div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
        {STATS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VP}
            transition={{ duration: 0.5, delay: i * 0.1, ease }}
            whileHover={{ y: -4, transition: { type: "spring", stiffness: 320, damping: 22 } }}
            className="h-full"
          >
            <div className="relative h-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_32px_rgba(0,0,0,0.10)] transition-shadow duration-200 flex flex-col">

              {/* Colored top strip */}
              <div className="h-1 w-full flex-shrink-0" style={{ background: s.hex }} />

              <div className="flex flex-col flex-1 p-2 sm:p-3 md:p-6">

                {/* Icon badge */}
                <div
                  className="mb-2 sm:mb-3 md:mb-4 size-7 sm:size-9 md:size-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: s.hexDim }}
                >
                  <ArrowUpRight className="size-4 md:size-[18px]" style={{ color: s.hex }} />
                </div>

                {/* Value */}
                <p
                  className="font-black text-[20px] sm:text-[30px] md:text-[52px] leading-none tracking-[-1px] md:tracking-[-2px] mb-1.5"
                  style={{ color: s.hex }}
                >
                  {s.value}
                </p>

                {/* Label */}
                <p className="text-[10px] sm:text-[12px] md:text-[13.5px] font-bold text-gray-800 leading-snug mb-1">
                  {s.label}
                </p>

                {/* Context */}
                <p className="text-[11px] md:text-[12px] text-gray-500 leading-snug mt-auto pt-2 hidden md:block">
                  {s.context}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Before / After table ── */}
      <motion.div
        initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={VP} transition={{ duration: 0.7, delay: 0.12, ease }}
      >
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-[0_4px_24px_rgba(0,0,0,0.06)] min-w-[540px]">

          {/* Column headers */}
          <div className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[2fr_1fr_1fr]">

            <div className="bg-gray-50 border-b border-gray-200 px-5 md:px-7 py-3 flex items-center">
              <span className="text-[11px] font-bold uppercase tracking-[1px] text-gray-500">Metric</span>
            </div>

            <div className="bg-rose-50 border-b border-l border-gray-200 px-3 md:px-7 py-3 flex items-center gap-1.5 min-w-[70px] sm:min-w-[100px] md:min-w-0">
              <X className="size-3 text-rose-400 flex-shrink-0" />
              <span className="text-[10.5px] font-bold uppercase tracking-[1px] text-rose-500 whitespace-nowrap">Before</span>
            </div>

            <div className="bg-primary/[0.07] border-b border-l border-primary/15 px-3 md:px-7 py-3 flex items-center gap-1.5 min-w-[90px] sm:min-w-[120px] md:min-w-0">
              <CheckCircle2 className="size-3 text-primary flex-shrink-0" />
              <span className="text-[10.5px] font-bold uppercase tracking-[1px] text-primary whitespace-nowrap">With TalentAI</span>
            </div>
          </div>

          {/* Data rows */}
          {ROWS.map((row, i) => {
            const Icon   = ROW_ICONS[i];
            const isLast = i === ROWS.length - 1;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={VP}
                transition={{ duration: 0.35, delay: 0.08 + i * 0.06, ease }}
              >
                <div className={`grid grid-cols-[1fr_auto_auto] md:grid-cols-[2fr_1fr_1fr] group hover:bg-gray-50/70 transition-colors duration-150 ${!isLast ? "border-b border-gray-100" : ""}`}>

                  {/* Metric */}
                  <div className="px-5 md:px-7 py-3.5 md:py-4 flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-gray-100 group-hover:bg-primary/[0.08] border border-gray-200 group-hover:border-primary/15 flex items-center justify-center flex-shrink-0 transition-colors duration-150">
                      <Icon className="size-3.5 text-gray-500 group-hover:text-primary transition-colors duration-150" />
                    </div>
                    <span className="text-[12.5px] md:text-[13.5px] font-semibold text-gray-700 leading-snug">
                      {row.metric}
                    </span>
                  </div>

                  {/* Before */}
                  <div className="min-w-[70px] sm:min-w-[100px] md:min-w-0 border-l border-gray-100 px-3 md:px-7 py-3.5 md:py-4 flex items-center bg-rose-50/25 group-hover:bg-rose-50/50 transition-colors">
                    <span className="font-mono text-[12px] md:text-[13.5px] font-medium text-gray-400 tabular-nums line-through decoration-gray-300 decoration-[1.5px]">
                      {row.before}
                    </span>
                  </div>

                  {/* After */}
                  <div className="min-w-[90px] sm:min-w-[120px] md:min-w-0 border-l border-primary/10 px-3 md:px-7 py-3.5 md:py-4 flex items-center justify-between gap-2 bg-primary/[0.02] group-hover:bg-primary/[0.05] transition-colors">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MoveRight className="size-3 text-primary/40 flex-shrink-0 hidden md:block" />
                      <span className="font-mono text-[12px] md:text-[13.5px] font-bold text-gray-900 tabular-nums">
                        {row.after}
                      </span>
                    </div>
                    <span
                      className="hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap text-white flex-shrink-0"
                      style={{ background: "#0D9488" }}
                    >
                      {row.delta}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Footer */}
          <div className="border-t border-gray-100 bg-gray-50 px-5 md:px-7 py-3 flex items-center gap-2">
            <Zap className="size-3.5 text-primary flex-shrink-0" />
            <p className="text-[11.5px] font-medium text-gray-500">
              Results based on teams using TalentAI for 90+ days.{" "}
              <span className="font-semibold text-gray-600">Average across all customers.</span>
            </p>
          </div>
        </div>
        </div>
      </motion.div>

    </div>
  );
}
