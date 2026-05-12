"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, Chip, Grid } from "@mui/material";
import SpeedOutlined from "@mui/icons-material/SpeedOutlined";
import TrendingDownOutlined from "@mui/icons-material/TrendingDownOutlined";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
} from "recharts";
import { ZoneHeading, KpiCard } from "./KpiAtoms";
import { ChartTooltip, GRAY, GRAY2, LGRAY, T, VELOCITY_TREND, WHITE } from "./kpiTokens";

const KpiZone4: React.FC = () => {
  const { t } = useTranslation("dashboard");

  return (
    <>
      <ZoneHeading icon={SpeedOutlined} label={t("pages.kpi.zone4_title")} color="#0891B2" />
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: 4 }}>
        {/* Time-to-shortlist */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <KpiCard title={t("pages.kpi.tts_title")} subtitle={t("pages.kpi.tts_subtitle")}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75 }}>
                  <Typography sx={{ fontFamily: "Poppins", fontWeight: 800, fontSize: "2.8rem", color: T, lineHeight: 1 }}>4.1</Typography>
                  <Typography sx={{ fontFamily: "Poppins", fontSize: "0.85rem", color: GRAY2 }}>{t("pages.kpi.days")}</Typography>
                </Box>
                <Chip label={t("pages.kpi.tts_chip")} size="small" sx={{ mt: 0.75, fontFamily: "Poppins", fontWeight: 600, fontSize: "0.68rem", bgcolor: "#ECFDF5", color: "#10B981", height: 22 }} />
              </Box>
              <Box sx={{ textAlign: "center", px: 2, py: 1.5, bgcolor: LGRAY, borderRadius: "12px" }}>
                <TrendingDownOutlined sx={{ fontSize: 28, color: "#10B981" }} />
                <Typography sx={{ fontFamily: "Poppins", fontSize: "0.65rem", fontWeight: 600, color: "#10B981" }}>{t("pages.kpi.trending_down")}</Typography>
              </Box>
            </Box>
            <ResponsiveContainer width="100%" height={110}>
              <LineChart data={VELOCITY_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="period" tick={{ fontFamily: "Poppins", fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontFamily: "Poppins", fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} domain={[3, 8]} />
                <RechartsTooltip {...ChartTooltip} />
                <Line type="monotone" dataKey="tts" stroke={T} strokeWidth={2.5} dot={{ r: 4, fill: WHITE, stroke: T, strokeWidth: 2 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </KpiCard>
        </Grid>

        {/* Time-to-hire */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <KpiCard title={t("pages.kpi.tth_title")} subtitle={t("pages.kpi.tth_subtitle")}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75 }}>
                  <Typography sx={{ fontFamily: "Poppins", fontWeight: 800, fontSize: "2.8rem", color: "#7C3AED", lineHeight: 1 }}>20</Typography>
                  <Typography sx={{ fontFamily: "Poppins", fontSize: "0.85rem", color: GRAY2 }}>{t("pages.kpi.days")}</Typography>
                </Box>
                <Chip label={t("pages.kpi.tth_chip")} size="small" sx={{ mt: 0.75, fontFamily: "Poppins", fontWeight: 600, fontSize: "0.68rem", bgcolor: "#ECFDF5", color: "#10B981", height: 22 }} />
              </Box>
              <Box sx={{ textAlign: "center", px: 2, py: 1.5, bgcolor: "#F5F3FF", borderRadius: "12px" }}>
                <TrendingDownOutlined sx={{ fontSize: 28, color: "#10B981" }} />
                <Typography sx={{ fontFamily: "Poppins", fontSize: "0.65rem", fontWeight: 600, color: "#10B981" }}>{t("pages.kpi.trending_down")}</Typography>
              </Box>
            </Box>
            <ResponsiveContainer width="100%" height={110}>
              <LineChart data={VELOCITY_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="period" tick={{ fontFamily: "Poppins", fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontFamily: "Poppins", fontSize: 10, fill: GRAY }} axisLine={false} tickLine={false} domain={[15, 32]} />
                <RechartsTooltip {...ChartTooltip} />
                <Line type="monotone" dataKey="tth" stroke="#7C3AED" strokeWidth={2.5} dot={{ r: 4, fill: WHITE, stroke: "#7C3AED", strokeWidth: 2 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </KpiCard>
        </Grid>
      </Grid>
    </>
  );
};

export default KpiZone4;
