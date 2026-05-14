"use client";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
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
import { BORDER, ChartTooltip, GRAY, GRAY2, LGRAY, T, WHITE } from "./kpiTokens";
import { AppDispatch } from "@/store/store";
import { fetchVelocity, selectVelocity, selectVelocityLoading } from "@/store/slices/kpiSlice";
import { useKpiParams } from "./useKpiParams";

const VelocityCard: React.FC<{
  title: string;
  subtitle: string;
  value: number | null;
  delta: number | null;
  dataKey: string;
  color: string;
  bgColor: string;
  trend: Array<{ period: string; tts: number | null; tth: number | null }>;
  loading: boolean;
}> = ({ title, subtitle, value, delta, dataKey, color, bgColor, trend, loading }) => {
  const { t } = useTranslation("dashboard");

  const isDown    = delta !== null && delta < 0;
  const isUp      = delta !== null && delta > 0;
  const deltaAbs  = delta !== null ? Math.abs(delta) : null;

  const trendIcon = isDown
    ? <TrendingDownOutlined sx={{ fontSize: 28, color: "#10B981" }} />
    : isUp
    ? <TrendingUpOutlined sx={{ fontSize: 28, color: "#EF4444" }} />
    : <RemoveOutlined sx={{ fontSize: 28, color: GRAY2 }} />;

  const trendColor = isDown ? "#10B981" : isUp ? "#EF4444" : GRAY2;
  const trendBg    = isDown ? "#ECFDF5" : isUp ? "#FEF2F2" : "#F1F5F9";
  const chipLabel  = deltaAbs !== null
    ? `${isDown ? "↓" : isUp ? "↑" : "→"} ${deltaAbs}d vs prev. period`
    : "—";

  // Compute Y domain from non-null values
  const vals = trend.map(r => r[dataKey as "tts" | "tth"]).filter((v): v is number => v !== null);
  const minY = vals.length ? Math.floor(Math.min(...vals) * 0.85) : 0;
  const maxY = vals.length ? Math.ceil(Math.max(...vals) * 1.15) : 10;

  return (
    <KpiCard title={title} subtitle={subtitle}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
        <Box sx={{ flex: 1 }}>
          {loading ? (
            <Skeleton variant="text" width={80} height={56} />
          ) : (
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75 }}>
              <Typography sx={{ fontFamily: "Poppins", fontWeight: 800, fontSize: "2.8rem", color, lineHeight: 1 }}>
                {value !== null ? value : "—"}
              </Typography>
              <Typography sx={{ fontFamily: "Poppins", fontSize: "0.85rem", color: GRAY2 }}>
                {t("pages.kpi.days")}
              </Typography>
            </Box>
          )}
          {loading ? (
            <Skeleton variant="rounded" width={160} height={22} sx={{ mt: 0.75, borderRadius: "20px" }} />
          ) : (
            <Chip
              label={chipLabel}
              size="small"
              sx={{ mt: 0.75, fontFamily: "Poppins", fontWeight: 600, fontSize: "0.68rem", bgcolor: trendBg, color: trendColor, height: 22 }}
            />
          )}
        </Box>
        <Box sx={{ textAlign: "center", px: 2, py: 1.5, bgcolor: bgColor, borderRadius: "12px" }}>
          {loading ? <Skeleton variant="circular" width={28} height={28} /> : trendIcon}
          {loading
            ? <Skeleton variant="text" width={40} height={14} sx={{ mt: 0.25 }} />
            : <Typography sx={{ fontFamily: "Poppins", fontSize: "0.65rem", fontWeight: 600, color: trendColor }}>
                {isDown ? t("pages.kpi.trending_down") : isUp ? "Rising" : "Stable"}
              </Typography>
          }
        </Box>
      </Box>

      {loading ? (
        <Skeleton variant="rounded" width="100%" height={110} sx={{ borderRadius: "10px" }} />
      ) : (
        <ResponsiveContainer width="100%" height={110}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="period" tick={{ fontFamily: "Poppins", fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontFamily: "Poppins", fontSize: 10, fill: GRAY }}
              axisLine={false} tickLine={false}
              domain={[minY, maxY]}
              allowDataOverflow
            />
            <RechartsTooltip {...ChartTooltip} formatter={(v: any) => [`${v}d`, ""]} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2.5}
              connectNulls
              dot={{ r: 4, fill: WHITE, stroke: color, strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </KpiCard>
  );
};

const KpiZone4: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const dispatch = useDispatch<AppDispatch>();

  const velocity = useSelector(selectVelocity);
  const loading  = useSelector(selectVelocityLoading);
  const { postId, dateFrom, params } = useKpiParams();

  useEffect(() => {
    dispatch(fetchVelocity(params));
  }, [dispatch, postId, dateFrom]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <ZoneHeading icon={SpeedOutlined} label={t("pages.kpi.zone4_title")} color="#0891B2" />
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <VelocityCard
            title={t("pages.kpi.tts_title")}
            subtitle={t("pages.kpi.tts_subtitle")}
            value={velocity.tts}
            delta={velocity.ttsDelta}
            dataKey="tts"
            color={T}
            bgColor={`${T}12`}
            trend={velocity.trend}
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <VelocityCard
            title={t("pages.kpi.tth_title")}
            subtitle={t("pages.kpi.tth_subtitle")}
            value={velocity.tth}
            delta={velocity.tthDelta}
            dataKey="tth"
            color="#7C3AED"
            bgColor="#F5F3FF"
            trend={velocity.trend}
            loading={loading}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default KpiZone4;
