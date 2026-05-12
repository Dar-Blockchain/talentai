"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, Chip, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import StarOutlined from "@mui/icons-material/StarOutlined";
import { ZoneHeading, KpiCard } from "./KpiAtoms";
import { BORDER, GRAY, GRAY2, LGRAY, NAVY2, SOURCING_CHANNELS, T, T_BG, T_BRD, T_DARK, TOP_CANDIDATES, WHITE } from "./kpiTokens";

const KpiZone5: React.FC = () => {
  const { t } = useTranslation("dashboard");

  const tableHeaders = [
    "#",
    t("pages.kpi.col_candidate"),
    t("pages.kpi.col_post"),
    t("pages.kpi.col_score"),
    t("pages.kpi.col_statut"),
  ];

  return (
    <>
      <ZoneHeading icon={PeopleOutlined} label={t("pages.kpi.zone5_title")} color="#D97706" />
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: 4 }}>
        {/* Score panel */}
        <Grid size={{ xs: 12, sm: 5, md: 4 }}>
          <KpiCard>
            <Box sx={{ p: 2, bgcolor: T_BG, border: `1px solid ${T_BRD}`, borderRadius: "14px", mb: 2.5, textAlign: "center" }}>
              <Typography sx={{ fontFamily: "Poppins", fontSize: "0.68rem", fontWeight: 700, color: T, textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.5 }}>
                {t("pages.kpi.avg_score_label")}
              </Typography>
              <Typography sx={{ fontFamily: "Poppins", fontWeight: 800, fontSize: "3rem", color: T_DARK, lineHeight: 1 }}>76</Typography>
              <Typography sx={{ fontFamily: "Poppins", fontSize: "0.75rem", color: GRAY, mb: 1 }}>/100</Typography>
              <Chip label={t("pages.kpi.score_vs_prev")} size="small" sx={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "0.68rem", bgcolor: WHITE, color: "#10B981", border: "1px solid #10B98130", height: 22 }} />
            </Box>
            <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.7rem", color: GRAY2, textTransform: "uppercase", letterSpacing: "0.07em", mb: 1.25 }}>
              {t("pages.kpi.by_channel")}
            </Typography>
            {SOURCING_CHANNELS.map((ch, i) => (
              <Box key={ch.channel} sx={{ mb: i < SOURCING_CHANNELS.length - 1 ? 1.1 : 0 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
                  <Typography sx={{ fontFamily: "Poppins", fontSize: "0.78rem", color: NAVY2, fontWeight: 500 }}>{ch.channel}</Typography>
                  <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.78rem", color: ch.color }}>{ch.score}</Typography>
                </Box>
                <Box sx={{ height: 6, borderRadius: "99px", bgcolor: "#F1F5F9", overflow: "hidden" }}>
                  <Box sx={{ width: `${ch.score}%`, height: "100%", bgcolor: ch.color, borderRadius: "99px", opacity: 0.85 }} />
                </Box>
              </Box>
            ))}
          </KpiCard>
        </Grid>

        {/* Top 10 table */}
        <Grid size={{ xs: 12, sm: 7, md: 8 }}>
          <KpiCard title={t("pages.kpi.top10_title")} subtitle={t("pages.kpi.top10_subtitle")}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {tableHeaders.map((h, idx) => (
                      <TableCell key={h} align={idx === 1 || idx === 2 ? "left" : "center"} sx={{
                        fontFamily: "Poppins", fontWeight: 700, fontSize: "0.68rem", color: GRAY2,
                        textTransform: "uppercase", letterSpacing: "0.06em",
                        borderBottom: `2px solid ${BORDER}`, py: 1.25, bgcolor: LGRAY,
                      }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {TOP_CANDIDATES.map((c, i) => (
                    <TableRow key={c.name} sx={{
                      "&:hover": { bgcolor: T_BG }, transition: "background 0.15s",
                      "& td": { fontFamily: "Poppins", fontSize: "0.8rem", color: NAVY2, py: 1.1, borderBottom: `1px solid ${BORDER}` },
                    }}>
                      <TableCell align="center">
                        <Box sx={{ width: 22, height: 22, borderRadius: "50%", mx: "auto", bgcolor: i < 3 ? `${T}18` : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.68rem", color: i < 3 ? T : GRAY }}>{i + 1}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                      <TableCell sx={{ color: GRAY }}>{c.post}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4 }}>
                          <StarOutlined sx={{ fontSize: 13, color: "#F59E0B" }} />
                          <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.82rem", color: T }}>{c.score}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={c.status === "shortlisted" ? t("pages.kpi.shortlisted_chip") : t("pages.kpi.completed_chip")}
                          size="small"
                          sx={{
                            fontFamily: "Poppins", fontWeight: 600, fontSize: "0.63rem", height: 20,
                            bgcolor: c.status === "shortlisted" ? `${T}12` : "#EFF6FF",
                            color: c.status === "shortlisted" ? T : "#2563EB",
                            "& .MuiChip-label": { px: 0.9 },
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </KpiCard>
        </Grid>
      </Grid>
    </>
  );
};

export default KpiZone5;
