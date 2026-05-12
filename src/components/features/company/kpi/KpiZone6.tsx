"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, Grid } from "@mui/material";
import SecurityOutlined from "@mui/icons-material/SecurityOutlined";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import { ZoneHeading, KpiCard, MetricRow } from "./KpiAtoms";
import { BORDER, GRAY, LGRAY, T } from "./kpiTokens";

const KpiZone6: React.FC = () => {
  const { t } = useTranslation("dashboard");

  return (
    <>
      <ZoneHeading icon={SecurityOutlined} label={t("pages.kpi.zone6_title")} color="#0891B2" />
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: 4 }}>
        {/* GDPR card */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <KpiCard title={t("pages.kpi.rgpd_title")}>
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              {[
                { label: t("pages.kpi.audit_ready"), value: "91%", color: T          },
                { label: t("pages.kpi.rgpd_consent"), value: "98%", color: "#10B981" },
              ].map(s => (
                <Grid size={6} key={s.label}>
                  <Box sx={{ textAlign: "center", p: 1.5, bgcolor: LGRAY, borderRadius: "12px", border: `1px solid ${BORDER}` }}>
                    <Typography sx={{ fontFamily: "Poppins", fontWeight: 800, fontSize: "1.6rem", color: s.color }}>{s.value}</Typography>
                    <Typography sx={{ fontFamily: "Poppins", fontSize: "0.68rem", color: GRAY, mt: 0.25, lineHeight: 1.3 }}>{s.label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ p: 1.75, borderRadius: "12px", bgcolor: "#FFFBEB", border: "1px solid #FDE68A", display: "flex", gap: 1.25 }}>
              <WarningAmberOutlined sx={{ fontSize: 18, color: "#D97706", flexShrink: 0, mt: 0.1 }} />
              <Box>
                <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.75rem", color: "#92400E" }}>{t("pages.kpi.equity_title")}</Typography>
                <Typography sx={{ fontFamily: "Poppins", fontSize: "0.68rem", color: "#B45309", mt: 0.25 }}>{t("pages.kpi.equity_sub")}</Typography>
              </Box>
            </Box>
          </KpiCard>
        </Grid>

        {/* Security card */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <KpiCard title={t("pages.kpi.security_title")}>
            <MetricRow label={t("pages.kpi.log_complete")} value="89%" />
            <MetricRow label={t("pages.kpi.sessions")}     value="152" />
            <MetricRow label={t("pages.kpi.anomalies")}    value="0" color="#10B981" last />
            <Box sx={{ mt: 2.5, p: 1.75, borderRadius: "12px", bgcolor: "#ECFDF5", border: "1px solid #A7F3D0", display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircleOutlined sx={{ fontSize: 18, color: "#10B981" }} />
              <Typography sx={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "0.75rem", color: "#065F46" }}>{t("pages.kpi.no_incident")}</Typography>
            </Box>
          </KpiCard>
        </Grid>
      </Grid>
    </>
  );
};

export default KpiZone6;
