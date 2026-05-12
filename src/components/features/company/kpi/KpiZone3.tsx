"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, Chip } from "@mui/material";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
} from "recharts";
import { ZoneHeading, KpiCard, Delta, MetricRow } from "./KpiAtoms";
import { BORDER, ChartTooltip, FUNNEL_DATA, GRAY, GRAY2, LGRAY, NAVY, T, WHITE, passRate } from "./kpiTokens";

const KpiZone3: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const OPACITIES = ["FF", "CC", "AA", "77", "55"];

  return (
    <>
      <ZoneHeading icon={TrendingUpOutlined} label={t("pages.kpi.zone3_title")} color="#10B981" />
      <KpiCard sx={{ mb: 4 }}>
        {/* Funnel step cards */}
        <Box sx={{ display: "flex", gap: { xs: 1, sm: 1.5 }, mb: 3, flexWrap: { xs: "wrap", md: "nowrap" } }}>
          {FUNNEL_DATA.map((step, i) => {
            const prevVal = i > 0 ? FUNNEL_DATA[i - 1].value : null;
            const rate    = prevVal ? Math.round((step.value / prevVal) * 100) : null;
            const fillPct = Math.round((step.value / FUNNEL_DATA[0].value) * 100);
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
                    <Delta cur={step.value} prev={step.prev} />
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
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={FUNNEL_DATA} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="key" tickFormatter={k => t(`pages.kpi.${k}`)} tick={{ fontFamily: "Poppins", fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontFamily: "Poppins", fontSize: 11, fill: GRAY }} axisLine={false} tickLine={false} />
                <RechartsTooltip {...ChartTooltip} formatter={v => [v, ""]} labelFormatter={k => t(`pages.kpi.${k}`)} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {FUNNEL_DATA.map((_, i) => (
                    <Cell key={i} fill={`${T}${OPACITIES[i]}`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <Box sx={{
            width: { xs: "100%", md: 220 }, flexShrink: 0,
            bgcolor: LGRAY, border: `1px solid ${BORDER}`, borderRadius: "14px",
            p: 2, display: "flex", flexDirection: "column", justifyContent: "center",
          }}>
            <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.7rem", color: GRAY2, textTransform: "uppercase", letterSpacing: "0.07em", mb: 1.25 }}>
              {t("pages.kpi.key_metrics")}
            </Typography>
            <MetricRow label={t("pages.kpi.noshow_rate")}     value={passRate(FUNNEL_DATA[0].value - FUNNEL_DATA[1].value, FUNNEL_DATA[0].value)} color="#EF4444" />
            <MetricRow label={t("pages.kpi.completion_rate")} value={passRate(FUNNEL_DATA[2].value, FUNNEL_DATA[1].value)} color={T} />
            <MetricRow label={t("pages.kpi.shortlist_rate")}  value={passRate(FUNNEL_DATA[3].value, FUNNEL_DATA[2].value)} color="#7C3AED" />
            <MetricRow label={t("pages.kpi.hire_conversion")} value={passRate(FUNNEL_DATA[4].value, FUNNEL_DATA[3].value)} color="#10B981" last />
          </Box>
        </Box>
      </KpiCard>
    </>
  );
};

export default KpiZone3;
