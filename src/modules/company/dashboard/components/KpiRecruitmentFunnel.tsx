"use client";
import React, { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, Chip, Skeleton } from "@mui/material";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
} from "recharts";
import { ZoneHeading, KpiCard, Delta, MetricRow } from "./KpiAtoms";
import { BORDER, ChartTooltip, GRAY, GRAY2, LGRAY, NAVY, T, WHITE, passRate } from "../utils/kpiTokens";
import type { KpiFunnelData } from "../types";

// ─── Static constants ─────────────────────────────────────────────────────────

const OPACITIES  = ["FF", "AA", "77"] as const;
const STEPS_KEYS = ["funnel_applied", "funnel_completed", "funnel_shortlisted"] as const;

const STEPS_ROW_SX   = { display: "flex", gap: { xs: 1, sm: 1.5 }, mb: 3, flexWrap: { xs: "wrap", md: "nowrap" } } as const;
const STEP_OUTER_SX  = { flex: "1 1 0", minWidth: { xs: "calc(50% - 8px)", md: 0 } } as const;
const STEP_TITLE_SX  = { fontFamily: "Poppins", fontSize: "0.6rem", fontWeight: 700, color: GRAY2, textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.75 } as const;
const STEP_VAL_SX    = { fontFamily: "Poppins", fontWeight: 800, fontSize: { xs: "1.5rem", sm: "1.8rem" }, color: NAVY, lineHeight: 1 } as const;
const STEP_BADGE_ROW = { mt: 1, display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" } as const;
const RATE_CHIP_SX   = { fontFamily: "Poppins", fontWeight: 700, fontSize: "0.6rem", height: 18, bgcolor: `${T}12`, color: T, "& .MuiChip-label": { px: 0.6 } } as const;
const FILL_RAIL_SX   = { mt: 1.25, height: 4, borderRadius: "99px", bgcolor: "#F1F5F9", overflow: "hidden" } as const;
const CHART_ROW_SX   = { display: "flex", gap: 2.5, flexDirection: { xs: "column", md: "row" }, alignItems: "stretch" } as const;
const CHART_BOX_SX   = { flex: "1 1 0", minWidth: 0 } as const;
const METRICS_BOX_SX = { width: { xs: "100%", md: 220 }, flexShrink: 0, bgcolor: LGRAY, border: `1px solid ${BORDER}`, borderRadius: "14px", p: 2, display: "flex", flexDirection: "column", justifyContent: "center" } as const;
const METRICS_TTL_SX = { fontFamily: "Poppins", fontWeight: 700, fontSize: "0.7rem", color: GRAY2, textTransform: "uppercase", letterSpacing: "0.07em", mb: 1.25 } as const;

const SKEL_SKELS   = [null, null, null] as const;
const SKEL_METRICS = [0, 1, 2, 3, 4] as const;

// ─── StepSkeleton ─────────────────────────────────────────────────────────────

const StepSkeleton = memo(() => (
  <Box sx={STEP_OUTER_SX}>
    <Box sx={{ border: `1px solid ${BORDER}`, borderRadius: "14px", p: { xs: 1.5, sm: 2 } }}>
      <Skeleton variant="text" width={60} height={14} />
      <Skeleton variant="text" width={48} height={42} sx={{ mt: 0.5 }} />
      <Box sx={{ display: "flex", gap: 0.75, mt: 1 }}>
        <Skeleton variant="rounded" width={36} height={18} sx={{ borderRadius: "20px" }} />
        <Skeleton variant="rounded" width={48} height={18} sx={{ borderRadius: "20px" }} />
      </Box>
      <Skeleton variant="rounded" width="100%" height={4} sx={{ mt: 1.25, borderRadius: "99px" }} />
    </Box>
  </Box>
));
StepSkeleton.displayName = "StepSkeleton";

// ─── KpiRecruitmentFunnel ─────────────────────────────────────────────────────

interface KpiRecruitmentFunnelProps {
  data:    KpiFunnelData | undefined;
  loading: boolean;
}

const KpiRecruitmentFunnel = memo<KpiRecruitmentFunnelProps>(({ data, loading }) => {
  const { t } = useTranslation("dashboard");

  const applied     = data?.applied     ?? 0;
  const completed   = data?.completed   ?? 0;
  const shortlisted = data?.shortlisted ?? 0;

  const steps = useMemo(() => [
    { key: STEPS_KEYS[0], value: applied     },
    { key: STEPS_KEYS[1], value: completed   },
    { key: STEPS_KEYS[2], value: shortlisted },
  ], [applied, completed, shortlisted]);

  const tickFormatter  = useMemo(() => (k: string) => t(`pages.kpi.${k}`), [t]);
  const labelFormatter = useMemo(() => (k: string) => t(`pages.kpi.${k}`), [t]);

  return (
    <>
      <ZoneHeading icon={TrendingUpOutlined} label={t("pages.kpi.zone3_title")} color="#10B981" />
      <KpiCard className="mb-4">
        <Box sx={STEPS_ROW_SX}>
          {loading
            ? SKEL_SKELS.map((_, i) => <StepSkeleton key={i} />)
            : steps.map((step, i) => {
                const rate    = (i > 0 && applied > 0) ? Math.min(Math.round((step.value / applied) * 100), 100) : null;
                const fillPct = applied > 0 ? Math.round((step.value / applied) * 100) : 0;
                const color   = `${T}${OPACITIES[i]}`;
                return (
                  <Box key={step.key} sx={STEP_OUTER_SX}>
                    <Box sx={{ border: `1px solid ${BORDER}`, borderRadius: "14px", p: { xs: 1.5, sm: 2 }, height: "100%", bgcolor: i === 0 ? `${T}06` : WHITE }}>
                      <Typography sx={STEP_TITLE_SX}>{t(`pages.kpi.${step.key}`)}</Typography>
                      <Typography sx={STEP_VAL_SX}>{step.value}</Typography>
                      <Box sx={STEP_BADGE_ROW}>
                        {rate !== null && <Chip label={`${rate}%`} size="small" sx={RATE_CHIP_SX} />}
                        <Delta cur={step.value} prev={step.value} />
                      </Box>
                      <Box sx={FILL_RAIL_SX}>
                        <Box sx={{ width: `${fillPct}%`, height: "100%", bgcolor: color, borderRadius: "99px" }} />
                      </Box>
                    </Box>
                  </Box>
                );
              })}
        </Box>

        <Box sx={CHART_ROW_SX}>
          <Box sx={CHART_BOX_SX}>
            {loading ? (
              <Skeleton variant="rounded" width="100%" height={190} sx={{ borderRadius: "10px" }} />
            ) : (
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={steps} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="key" tickFormatter={tickFormatter} tick={{ fontFamily: "Poppins", fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontFamily: "Poppins", fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
                  <RechartsTooltip {...ChartTooltip} formatter={(v: any) => [v, ""]} labelFormatter={labelFormatter} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {steps.map((_, i) => <Cell key={i} fill={`${T}${OPACITIES[i]}`} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Box>

          <Box sx={METRICS_BOX_SX}>
            <Typography sx={METRICS_TTL_SX}>{t("pages.kpi.key_metrics")}</Typography>
            {loading ? (
              SKEL_METRICS.map((i) => (
                <Box key={i} sx={{ py: 1.1, borderBottom: i < 4 ? `1px solid ${BORDER}` : "none" }}>
                  <Skeleton variant="text" width="100%" height={20} />
                </Box>
              ))
            ) : (
              <>
                <MetricRow label={t("pages.kpi.completed_rate")}  value={passRate(completed, applied)}   color="#7C3AED" />
                <MetricRow label={t("pages.kpi.shortlist_rate")}  value={passRate(shortlisted, applied)} color="#F59E0B" />
                <MetricRow label={t("pages.kpi.hire_conversion")} value={passRate(shortlisted, applied)} color="#10B981" last />
              </>
            )}
          </Box>
        </Box>
      </KpiCard>
    </>
  );
});
KpiRecruitmentFunnel.displayName = "KpiRecruitmentFunnel";

export default KpiRecruitmentFunnel;
