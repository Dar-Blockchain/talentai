"use client";
import React, { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, Grid, Paper, Skeleton } from "@mui/material";
import SavingsOutlined from "@mui/icons-material/SavingsOutlined";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
} from "recharts";
import { ZoneHeading, KpiCard, MetricRow } from "./KpiAtoms";
import { BORDER, ChartTooltip, GRAY, GRAY2, T, T_BG, T_BRD, T_DARK, WHITE } from "../utils/kpiTokens";
import type { KpiRoiData } from "../types";

// ─── Static constants ─────────────────────────────────────────────────────────

const BASELINE = 35;

const GRID_SX        = { mb: 2 } as const;
const COL_BOX_SX     = { display: "flex", flexDirection: "column", gap: 2, height: "100%" } as const;
const SAVED_PAPER_SX = { border: `1px solid ${T_BRD}`, borderRadius: "18px", p: 2.5, background: `linear-gradient(135deg, ${T_BG} 0%, #ECFDF5 100%)`, flex: "0 0 auto" } as const;
const SAVED_LABEL_SX = { fontFamily: "Poppins", fontSize: "0.68rem", fontWeight: 700, color: T, textTransform: "uppercase", letterSpacing: "0.08em", mb: 1 } as const;
const SAVED_VAL_SX   = { fontFamily: "Poppins", fontWeight: 800, fontSize: "2.8rem", color: T_DARK, lineHeight: 1 } as const;
const SAVED_SUB_SX   = { fontFamily: "Poppins", fontSize: "0.72rem", color: GRAY, mt: 0.5 } as const;
const COSTS_PAPER_SX = { border: `1px solid ${BORDER}`, borderRadius: "18px", p: 2.5, bgcolor: WHITE, flex: "1 1 auto" } as const;
const COSTS_LABEL_SX = { fontFamily: "Poppins", fontWeight: 700, fontSize: "0.7rem", color: GRAY2, textTransform: "uppercase", letterSpacing: "0.07em", mb: 1.5 } as const;
const EMPTY_BOX_SX   = { height: 230, display: "flex", alignItems: "center", justifyContent: "center" } as const;
const EMPTY_TXT_SX   = { fontFamily: "Poppins", fontSize: "0.82rem", color: GRAY2 } as const;
const LEGEND_ROW_SX  = { display: "flex", gap: 2.5, mt: 1.5 } as const;
const LEGEND_ITEM_SX = { display: "flex", alignItems: "center", gap: 0.75 } as const;
const LEGEND_LINE_SX = { width: 18, height: 2.5, bgcolor: T, borderRadius: 2 } as const;
const LEGEND_DASH_SX = { width: 18, height: 0, border: "1px dashed #94A3B8" } as const;
const LEGEND_TXT_SX  = { fontFamily: "Poppins", fontSize: "0.72rem", color: GRAY, fontWeight: 500 } as const;
const CHART_DOT      = { r: 4, fill: WHITE, stroke: T, strokeWidth: 2 } as const;

// ─── KpiRoiSavings ────────────────────────────────────────────────────────────

interface KpiRoiSavingsProps {
  data:    KpiRoiData | undefined;
  loading: boolean;
}

const KpiRoiSavings = memo<KpiRoiSavingsProps>(({ data, loading }) => {
  const { t } = useTranslation("dashboard");

  const chartData = useMemo(() =>
    (data?.trend ?? []).map((p) => ({ month: p.month, tth: p.tth, baseline: BASELINE })),
  [data?.trend]);

  const [minY, maxY] = useMemo(() => {
    const vals = (data?.trend ?? []).map((p) => p.tth).filter((v): v is number => v !== null);
    return vals.length
      ? [Math.floor(Math.min(...vals, BASELINE) * 0.75), Math.ceil(Math.max(...vals, BASELINE) * 1.2)]
      : [10, 50];
  }, [data?.trend]);

  const isNoData = useMemo(() => chartData.every((p) => p.tth === null), [chartData]);

  const fmt = useMemo(() => (v: number | null) => v !== null ? `€${v}` : "—", []);

  const savedHoursText = useMemo(() =>
    `${data?.completedInterviews ?? 0} ${t("pages.kpi.saved_hours_formula")}`,
  [data?.completedInterviews, t]);

  const legendTalentai = t("pages.kpi.legend_talentai");
  const legendBaseline = t("pages.kpi.legend_baseline");

  return (
    <>
      <ZoneHeading icon={SavingsOutlined} label={t("pages.kpi.zone7_title")} color="#7C3AED" />
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={GRID_SX}>

        {/* Stats column */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={COL_BOX_SX}>
            <Paper elevation={0} sx={SAVED_PAPER_SX}>
              <Typography sx={SAVED_LABEL_SX}>{t("pages.kpi.saved_hours_label")}</Typography>
              {loading
                ? <Skeleton variant="text" width={80} height={52} />
                : <Typography sx={SAVED_VAL_SX}>{data?.savedHours !== null && data?.savedHours !== undefined ? `${data.savedHours}h` : "—"}</Typography>}
              <Typography sx={SAVED_SUB_SX}>
                {loading ? <Skeleton variant="text" width={160} /> : savedHoursText}
              </Typography>
            </Paper>

            <Paper elevation={0} sx={COSTS_PAPER_SX}>
              <Typography sx={COSTS_LABEL_SX}>{t("pages.kpi.costs_label")}</Typography>
              {loading ? (
                <>
                  <Skeleton variant="rounded" width="100%" height={36} sx={{ mb: 1, borderRadius: "8px" }} />
                  <Skeleton variant="rounded" width="100%" height={36} sx={{ borderRadius: "8px" }} />
                </>
              ) : (
                <>
                  <MetricRow label={t("pages.kpi.cost_per_hire")}      value={fmt(data?.costPerHire ?? null)}        sub={t("pages.kpi.cost_per_hire_sub")}      color="#7C3AED" />
                  <MetricRow label={t("pages.kpi.cost_per_shortlist")} value={fmt(data?.costPerShortlisted ?? null)} sub={t("pages.kpi.cost_per_shortlist_sub")} color="#0891B2" last />
                </>
              )}
            </Paper>
          </Box>
        </Grid>

        {/* TTH trend chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <KpiCard title={t("pages.kpi.chart_title")} subtitle={t("pages.kpi.chart_subtitle")}>
            {loading ? (
              <Skeleton variant="rounded" width="100%" height={230} sx={{ borderRadius: "10px" }} />
            ) : isNoData ? (
              <Box sx={EMPTY_BOX_SX}>
                <Typography sx={EMPTY_TXT_SX}>No data yet</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tthGrad7" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={T}        stopOpacity={0.18} />
                      <stop offset="95%" stopColor={T}        stopOpacity={0}    />
                    </linearGradient>
                    <linearGradient id="baseGrad7" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#94A3B8" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#94A3B8" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontFamily: "Poppins", fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontFamily: "Poppins", fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} domain={[minY, maxY]} unit="d" />
                  <RechartsTooltip {...ChartTooltip} formatter={(v: any) => [`${v}d`, ""]} />
                  <Area type="monotone" dataKey="baseline" stroke="#94A3B8" fill="url(#baseGrad7)" strokeWidth={1.5} strokeDasharray="5 4" name={legendBaseline} dot={false} connectNulls />
                  <Area type="monotone" dataKey="tth" stroke={T} fill="url(#tthGrad7)" strokeWidth={2.5} name={legendTalentai} dot={CHART_DOT} activeDot={{ r: 5 }} connectNulls />
                </AreaChart>
              </ResponsiveContainer>
            )}
            <Box sx={LEGEND_ROW_SX}>
              <Box sx={LEGEND_ITEM_SX}>
                <Box sx={LEGEND_LINE_SX} />
                <Typography sx={LEGEND_TXT_SX}>{legendTalentai}</Typography>
              </Box>
              <Box sx={LEGEND_ITEM_SX}>
                <Box sx={LEGEND_DASH_SX} />
                <Typography sx={LEGEND_TXT_SX}>{legendBaseline}</Typography>
              </Box>
            </Box>
          </KpiCard>
        </Grid>
      </Grid>
    </>
  );
});
KpiRoiSavings.displayName = "KpiRoiSavings";

export default KpiRoiSavings;
