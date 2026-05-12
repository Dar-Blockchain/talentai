"use client";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Chip, Skeleton } from "@mui/material";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
} from "recharts";
import { ZoneHeading, KpiCard, Delta, MetricRow } from "./KpiAtoms";
import { BORDER, ChartTooltip, GRAY, GRAY2, LGRAY, NAVY, T, WHITE, passRate } from "./kpiTokens";
import { AppDispatch } from "@/store/store";
import { fetchFunnel, selectFunnel, selectFunnelLoading, selectKpiPostId, selectKpiDateFrom } from "@/store/slices/kpiSlice";

const OPACITIES = ["FF", "CC", "AA", "77"];

const StepSkeleton: React.FC = () => (
  <Box sx={{ flex: "1 1 0", minWidth: { xs: "calc(50% - 8px)", md: 0 } }}>
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
);

const KpiZone3: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const dispatch = useDispatch<AppDispatch>();

  const funnel   = useSelector(selectFunnel);
  const loading  = useSelector(selectFunnelLoading);
  const postId   = useSelector(selectKpiPostId);
  const dateFrom = useSelector(selectKpiDateFrom);

  useEffect(() => {
    const p: Record<string, string> = {};
    if (postId)   p.postId   = postId;
    if (dateFrom) p.dateFrom = dateFrom;
    dispatch(fetchFunnel(p));
  }, [dispatch, postId, dateFrom]);

  const applied     = funnel.applied     ?? 0;
  const invited     = funnel.invited     ?? 0;
  const completed   = funnel.completed   ?? 0;
  const shortlisted = funnel.shortlisted ?? 0;

  const STEPS = [
    { key: "funnel_applied",     value: applied     },
    { key: "funnel_invited",     value: invited     },
    { key: "funnel_completed",   value: completed   },
    { key: "funnel_shortlisted", value: shortlisted },
  ];

  return (
    <>
      <ZoneHeading icon={TrendingUpOutlined} label={t("pages.kpi.zone3_title")} color="#10B981" />
      <KpiCard sx={{ mb: 4 }}>
        {/* Funnel step cards */}
        <Box sx={{ display: "flex", gap: { xs: 1, sm: 1.5 }, mb: 3, flexWrap: { xs: "wrap", md: "nowrap" } }}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <StepSkeleton key={i} />)
            : STEPS.map((step, i) => {
                const prevVal = i > 0 ? STEPS[i - 1].value : null;
                const rate    = (prevVal && prevVal > 0) ? Math.round((step.value / prevVal) * 100) : null;
                const fillPct = applied > 0 ? Math.round((step.value / applied) * 100) : 0;
                const color   = `${T}${OPACITIES[i]}`;
                return (
                  <Box key={step.key} sx={{ flex: "1 1 0", minWidth: { xs: "calc(50% - 8px)", md: 0 } }}>
                    <Box sx={{
                      border: `1px solid ${BORDER}`, borderRadius: "14px",
                      p: { xs: 1.5, sm: 2 }, height: "100%",
                      borderTop: `3px solid ${color}`,
                      bgcolor: i === 0 ? `${T}06` : WHITE,
                    }}>
                      <Typography sx={{ fontFamily: "Poppins", fontSize: "0.6rem", fontWeight: 700, color: GRAY2, textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.75 }}>
                        {t(`pages.kpi.${step.key}`)}
                      </Typography>
                      <Typography sx={{ fontFamily: "Poppins", fontWeight: 800, fontSize: { xs: "1.5rem", sm: "1.8rem" }, color: NAVY, lineHeight: 1 }}>
                        {step.value}
                      </Typography>
                      <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                        {rate !== null && (
                          <Chip label={`${rate}%`} size="small" sx={{
                            fontFamily: "Poppins", fontWeight: 700, fontSize: "0.6rem", height: 18,
                            bgcolor: `${T}12`, color: T, "& .MuiChip-label": { px: 0.6 },
                          }} />
                        )}
                        <Delta cur={step.value} prev={step.value} />
                      </Box>
                      <Box sx={{ mt: 1.25, height: 4, borderRadius: "99px", bgcolor: "#F1F5F9", overflow: "hidden" }}>
                        <Box sx={{ width: `${fillPct}%`, height: "100%", bgcolor: color, borderRadius: "99px" }} />
                      </Box>
                    </Box>
                  </Box>
                );
              })}
        </Box>

        {/* Bar chart + Key metrics */}
        <Box sx={{ display: "flex", gap: 2.5, flexDirection: { xs: "column", md: "row" }, alignItems: "stretch" }}>
          <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
            {loading ? (
              <Skeleton variant="rounded" width="100%" height={190} sx={{ borderRadius: "10px" }} />
            ) : (
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={STEPS} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="key"
                    tickFormatter={k => t(`pages.kpi.${k}`)}
                    tick={{ fontFamily: "Poppins", fontSize: 11, fill: GRAY }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis tick={{ fontFamily: "Poppins", fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
                  <RechartsTooltip
                    {...ChartTooltip}
                    formatter={(v: any) => [v, ""]}
                    labelFormatter={(k: string) => t(`pages.kpi.${k}`)}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {STEPS.map((_, i) => (
                      <Cell key={i} fill={`${T}${OPACITIES[i]}`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Box>

          <Box sx={{
            width: { xs: "100%", md: 220 }, flexShrink: 0,
            bgcolor: LGRAY, border: `1px solid ${BORDER}`, borderRadius: "14px",
            p: 2, display: "flex", flexDirection: "column", justifyContent: "center",
          }}>
            <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.7rem", color: GRAY2, textTransform: "uppercase", letterSpacing: "0.07em", mb: 1.25 }}>
              {t("pages.kpi.key_metrics")}
            </Typography>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Box key={i} sx={{ py: 1.1, borderBottom: i < 3 ? `1px solid ${BORDER}` : "none" }}>
                  <Skeleton variant="text" width="100%" height={20} />
                </Box>
              ))
            ) : (
              <>
                {/* no-show = invited but never completed / invited */}
                <MetricRow label={t("pages.kpi.noshow_rate")}     value={passRate(invited - completed, invited)}  color="#EF4444" />
                {/* completion = completed / applied (overall funnel drop) */}
                <MetricRow label={t("pages.kpi.completion_rate")} value={passRate(completed, applied)}            color={T} />
                {/* shortlist rate = shortlisted / completed */}
                <MetricRow label={t("pages.kpi.shortlist_rate")}  value={passRate(shortlisted, completed)}        color="#7C3AED" />
                {/* overall conversion = shortlisted / applied */}
                <MetricRow label={t("pages.kpi.hire_conversion")} value={passRate(shortlisted, applied)}          color="#10B981" last />
              </>
            )}
          </Box>
        </Box>
      </KpiCard>
    </>
  );
};

export default KpiZone3;
