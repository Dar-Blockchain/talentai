"use client";
import React, { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, Chip, Grid, Skeleton } from "@mui/material";
import SpeedOutlined from "@mui/icons-material/SpeedOutlined";
import TrendingDownOutlined from "@mui/icons-material/TrendingDownOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import RemoveOutlined from "@mui/icons-material/RemoveOutlined";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
} from "recharts";
import { ZoneHeading, KpiCard } from "./KpiAtoms";
import { BORDER, ChartTooltip, GRAY, GRAY2, T, WHITE } from "../utils/kpiTokens";
import type { KpiVelocityData } from "../types";

// ─── Static constants ─────────────────────────────────────────────────────────

const HEADER_ROW_SX = { display: "flex", alignItems: "center", gap: 2, mb: 2.5 } as const;
const VAL_ROW_SX    = { display: "flex", alignItems: "baseline", gap: 0.75 } as const;
const UNIT_SX       = { fontFamily: "Poppins", fontSize: "0.85rem", color: GRAY2 } as const;
const TREND_BOX_SX  = { textAlign: "center", px: 2, py: 1.5, borderRadius: "12px" } as const;
const TREND_TXT_SX  = { fontFamily: "Poppins", fontSize: "0.65rem", fontWeight: 600 } as const;
const CHIP_SX_BASE  = { mt: 0.75, fontFamily: "Poppins", fontWeight: 600, fontSize: "0.68rem", height: 22 } as const;
const GRID_SX       = { mb: 4 } as const;
const HALF_SX       = { xs: 12, sm: 6 } as const;

// ─── VelocityCard ─────────────────────────────────────────────────────────────

interface VelocityCardProps {
  title:    string;
  subtitle: string;
  value:    number | null;
  delta:    number | null;
  dataKey:  string;
  color:    string;
  bgColor:  string;
  trend:    Array<{ period: string; tts: number | null; tth: number | null }>;
  loading:  boolean;
}

const VelocityCard = memo<VelocityCardProps>(({ title, subtitle, value, delta, dataKey, color, bgColor, trend, loading }) => {
  const { t } = useTranslation("dashboard");

  const isDown   = delta !== null && delta < 0;
  const isUp     = delta !== null && delta > 0;
  const deltaAbs = delta !== null ? Math.abs(delta) : null;

  const trendColor = useMemo(() => isDown ? "#10B981" : isUp ? "#EF4444" : GRAY2,     [isDown, isUp]);
  const trendBg    = useMemo(() => isDown ? "#ECFDF5" : isUp ? "#FEF2F2" : "#F1F5F9", [isDown, isUp]);
  const chipLabel  = useMemo(() =>
    deltaAbs !== null ? `${isDown ? "↓" : isUp ? "↑" : "→"} ${deltaAbs}d vs prev. period` : "—",
  [deltaAbs, isDown, isUp]);

  const trendIcon = useMemo(() =>
    isDown ? <TrendingDownOutlined sx={{ fontSize: 28, color: "#10B981" }} />
    : isUp  ? <TrendingUpOutlined   sx={{ fontSize: 28, color: "#EF4444" }} />
    :         <RemoveOutlined       sx={{ fontSize: 28, color: GRAY2      }} />,
  [isDown, isUp]);

  const trendLabel = useMemo(() =>
    isDown ? t("pages.kpi.trending_down") : isUp ? t("pages.kpi.trending_up") : t("pages.kpi.trending_stable"),
  [isDown, isUp, t]);

  const valSx      = useMemo(() => ({ fontFamily: "Poppins", fontWeight: 800, fontSize: "2.8rem", color, lineHeight: 1 }), [color]);
  const chipSx     = useMemo(() => ({ ...CHIP_SX_BASE, bgcolor: trendBg, color: trendColor }),  [trendBg, trendColor]);
  const trendBoxSx = useMemo(() => ({ ...TREND_BOX_SX, bgcolor: bgColor }), [bgColor]);
  const trendTxtSx = useMemo(() => ({ ...TREND_TXT_SX, color: trendColor }), [trendColor]);

  const [minY, maxY] = useMemo(() => {
    const vals = trend.map((r) => r[dataKey as "tts" | "tth"]).filter((v): v is number => v !== null);
    return vals.length
      ? [Math.floor(Math.min(...vals) * 0.85), Math.ceil(Math.max(...vals) * 1.15)]
      : [0, 10];
  }, [trend, dataKey]);

  const dot        = useMemo(() => ({ r: 4, fill: WHITE, stroke: color, strokeWidth: 2 }), [color]);
  const tooltipFmt = useMemo(() => (v: any) => [`${v}d`, ""], []);

  return (
    <KpiCard title={title} subtitle={subtitle}>
      <Box sx={HEADER_ROW_SX}>
        <Box sx={{ flex: 1 }}>
          {loading ? (
            <Skeleton variant="text" width={80} height={56} />
          ) : (
            <Box sx={VAL_ROW_SX}>
              <Typography sx={valSx}>{value !== null ? value : "—"}</Typography>
              <Typography sx={UNIT_SX}>{t("pages.kpi.days")}</Typography>
            </Box>
          )}
          {loading ? (
            <Skeleton variant="rounded" width={160} height={22} sx={{ mt: 0.75, borderRadius: "20px" }} />
          ) : (
            <Chip label={chipLabel} size="small" sx={chipSx} />
          )}
        </Box>
        <Box sx={trendBoxSx}>
          {loading ? <Skeleton variant="circular" width={28} height={28} /> : trendIcon}
          {loading
            ? <Skeleton variant="text" width={40} height={14} sx={{ mt: 0.25 }} />
            : <Typography sx={trendTxtSx}>{trendLabel}</Typography>}
        </Box>
      </Box>

      {loading ? (
        <Skeleton variant="rounded" width="100%" height={110} sx={{ borderRadius: "10px" }} />
      ) : (
        <ResponsiveContainer width="100%" height={110}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="period" tick={{ fontFamily: "Poppins", fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontFamily: "Poppins", fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} domain={[minY, maxY]} allowDataOverflow />
            <RechartsTooltip {...ChartTooltip} formatter={tooltipFmt} />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} connectNulls dot={dot} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </KpiCard>
  );
});
VelocityCard.displayName = "VelocityCard";

// ─── KpiHiringVelocity ────────────────────────────────────────────────────────

interface KpiHiringVelocityProps {
  data:    KpiVelocityData | undefined;
  loading: boolean;
}

const KpiHiringVelocity = memo<KpiHiringVelocityProps>(({ data, loading }) => {
  const { t }  = useTranslation("dashboard");
  const ttsBg  = useMemo(() => `${T}12`, []);
  const trend  = useMemo(() => data?.trend ?? [], [data?.trend]);

  return (
    <>
      <ZoneHeading icon={SpeedOutlined} label={t("pages.kpi.zone4_title")} color="#0891B2" />
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={GRID_SX}>
        <Grid size={HALF_SX}>
          <VelocityCard
            title={t("pages.kpi.tts_title")} subtitle={t("pages.kpi.tts_subtitle")}
            value={data?.tts ?? null} delta={data?.ttsDelta ?? null}
            dataKey="tts" color={T} bgColor={ttsBg}
            trend={trend} loading={loading}
          />
        </Grid>
        <Grid size={HALF_SX}>
          <VelocityCard
            title={t("pages.kpi.tth_title")} subtitle={t("pages.kpi.tth_subtitle")}
            value={data?.tth ?? null} delta={data?.tthDelta ?? null}
            dataKey="tth" color="#7C3AED" bgColor="#F5F3FF"
            trend={trend} loading={loading}
          />
        </Grid>
      </Grid>
    </>
  );
});
KpiHiringVelocity.displayName = "KpiHiringVelocity";

export default KpiHiringVelocity;
