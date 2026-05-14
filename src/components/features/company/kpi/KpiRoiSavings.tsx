"use client";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Grid, Paper, Skeleton } from "@mui/material";
import SavingsOutlined from "@mui/icons-material/SavingsOutlined";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
} from "recharts";
import { ZoneHeading, KpiCard, MetricRow } from "./KpiAtoms";
import { BORDER, ChartTooltip, GRAY, GRAY2, T, T_BG, T_BRD, T_DARK, WHITE } from "./kpiTokens";
import { AppDispatch } from "@/store/store";
import { fetchRoi, selectRoi, selectRoiLoading } from "@/store/slices/kpiSlice";

const BASELINE = 35; // pre-TalentAI baseline days

const KpiZone7: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const dispatch = useDispatch<AppDispatch>();

  const roi     = useSelector(selectRoi);
  const loading = useSelector(selectRoiLoading);

  useEffect(() => {
    dispatch(fetchRoi());
  }, [dispatch]);

  // Build chart data: real TTH trend + fixed baseline
  const chartData = roi.trend.map(p => ({
    month:    p.month,
    tth:      p.tth,
    baseline: BASELINE,
  }));

  // Y-axis domain
  const tthVals = roi.trend.map(p => p.tth).filter((v): v is number => v !== null);
  const minY = tthVals.length ? Math.floor(Math.min(...tthVals, BASELINE) * 0.75) : 10;
  const maxY = tthVals.length ? Math.ceil(Math.max(...tthVals, BASELINE)  * 1.2)  : 50;

  const fmt = (v: number | null) => v !== null ? `€${v}` : "—";

  return (
    <>
      <ZoneHeading icon={SavingsOutlined} label={t("pages.kpi.zone7_title")} color="#7C3AED" />
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: 2 }}>

        {/* Stats column */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, height: "100%" }}>

            {/* Saved hours */}
            <Paper elevation={0} sx={{
              border: `1px solid ${T_BRD}`, borderRadius: "18px", p: 2.5,
              background: `linear-gradient(135deg, ${T_BG} 0%, #ECFDF5 100%)`,
              flex: "0 0 auto",
            }}>
              <Typography sx={{ fontFamily: "Poppins", fontSize: "0.68rem", fontWeight: 700, color: T, textTransform: "uppercase", letterSpacing: "0.08em", mb: 1 }}>
                {t("pages.kpi.saved_hours_label")}
              </Typography>
              {loading ? (
                <Skeleton variant="text" width={80} height={52} />
              ) : (
                <Typography sx={{ fontFamily: "Poppins", fontWeight: 800, fontSize: "2.8rem", color: T_DARK, lineHeight: 1 }}>
                  {roi.savedHours !== null ? `${roi.savedHours}h` : "—"}
                </Typography>
              )}
              <Typography sx={{ fontFamily: "Poppins", fontSize: "0.72rem", color: GRAY, mt: 0.5 }}>
                {loading ? <Skeleton variant="text" width={160} /> : `${roi.completedInterviews ?? 0} ${t("pages.kpi.saved_hours_formula")}`}
              </Typography>
            </Paper>

            {/* Costs */}
            <Paper elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: "18px", p: 2.5, bgcolor: WHITE, flex: "1 1 auto" }}>
              <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.7rem", color: GRAY2, textTransform: "uppercase", letterSpacing: "0.07em", mb: 1.5 }}>
                {t("pages.kpi.costs_label")}
              </Typography>
              {loading ? (
                <>
                  <Skeleton variant="rounded" width="100%" height={36} sx={{ mb: 1, borderRadius: "8px" }} />
                  <Skeleton variant="rounded" width="100%" height={36} sx={{ borderRadius: "8px" }} />
                </>
              ) : (
                <>
                  <MetricRow
                    label={t("pages.kpi.cost_per_hire")}
                    value={fmt(roi.costPerHire)}
                    sub={t("pages.kpi.cost_per_hire_sub")}
                    color="#7C3AED"
                  />
                  <MetricRow
                    label={t("pages.kpi.cost_per_shortlist")}
                    value={fmt(roi.costPerShortlisted)}
                    sub={t("pages.kpi.cost_per_shortlist_sub")}
                    color="#0891B2"
                    last
                  />
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
            ) : chartData.every(p => p.tth === null) ? (
              <Box sx={{ height: 230, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography sx={{ fontFamily: "Poppins", fontSize: "0.82rem", color: GRAY2 }}>
                  No data yet
                </Typography>
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
                  <YAxis
                    tick={{ fontFamily: "Poppins", fontSize: 11, fill: GRAY }}
                    axisLine={false} tickLine={false}
                    domain={[minY, maxY]}
                    unit="d"
                  />
                  <RechartsTooltip {...ChartTooltip} formatter={(v: any) => [`${v}d`, ""]} />
                  <Area type="monotone" dataKey="baseline" stroke="#94A3B8" fill="url(#baseGrad7)" strokeWidth={1.5} strokeDasharray="5 4" name={t("pages.kpi.legend_baseline")} dot={false} connectNulls />
                  <Area type="monotone" dataKey="tth" stroke={T} fill="url(#tthGrad7)" strokeWidth={2.5} name={t("pages.kpi.legend_talentai")}
                    dot={{ r: 4, fill: WHITE, stroke: T, strokeWidth: 2 }} activeDot={{ r: 5 }} connectNulls />
                </AreaChart>
              </ResponsiveContainer>
            )}
            <Box sx={{ display: "flex", gap: 2.5, mt: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Box sx={{ width: 18, height: 2.5, bgcolor: T, borderRadius: 2 }} />
                <Typography sx={{ fontFamily: "Poppins", fontSize: "0.72rem", color: GRAY, fontWeight: 500 }}>{t("pages.kpi.legend_talentai")}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Box sx={{ width: 18, height: 0, border: "1px dashed #94A3B8" }} />
                <Typography sx={{ fontFamily: "Poppins", fontSize: "0.72rem", color: GRAY, fontWeight: 500 }}>{t("pages.kpi.legend_baseline")}</Typography>
              </Box>
            </Box>
          </KpiCard>
        </Grid>
      </Grid>
    </>
  );
};

export default KpiZone7;
