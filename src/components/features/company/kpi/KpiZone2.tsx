"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import { ZoneHeading, KpiCard } from "./KpiAtoms";
import { BORDER, GRAY2, LGRAY, NAVY, NAVY2, POSTS_DATA, T, T_BG, WHITE, coverageColor, coverageLabel } from "./kpiTokens";

const KpiZone2: React.FC = () => {
  const { t } = useTranslation("dashboard");

  const sortedPosts = [...POSTS_DATA].sort((a, b) => {
    const order: Record<string, number> = { alerte: 0, moyen: 1, ok: 2 };
    return order[coverageLabel(a.coverage, a.deadline)] - order[coverageLabel(b.coverage, b.deadline)]
      || b.velocity - a.velocity;
  });

  const headers = [
    t("pages.kpi.col_post"),
    t("pages.kpi.col_shortlisted"),
    t("pages.kpi.col_velocity"),
    t("pages.kpi.col_coverage"),
    t("pages.kpi.col_status"),
    t("pages.kpi.col_deadline"),
  ];

  return (
    <>
      <ZoneHeading icon={WorkOutlineOutlined} label={t("pages.kpi.zone2_title")} color="#0891B2" />
      <KpiCard sx={{ mb: 4 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {headers.map((h, idx) => (
                  <TableCell key={h} align={idx === 0 ? "left" : "center"} sx={{
                    fontFamily: "Poppins", fontWeight: 700, fontSize: "0.7rem", color: GRAY2,
                    textTransform: "uppercase", letterSpacing: "0.06em",
                    borderBottom: `2px solid ${BORDER}`, py: 1.5, bgcolor: LGRAY,
                  }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedPosts.map((p, idx) => {
                const sc = coverageColor(p.coverage, p.deadline);
                const sl = coverageLabel(p.coverage, p.deadline);
                return (
                  <TableRow key={p.title} sx={{
                    bgcolor: idx % 2 === 0 ? WHITE : LGRAY,
                    "&:hover": { bgcolor: T_BG },
                    transition: "background 0.15s",
                    "& td": { fontFamily: "Poppins", fontSize: "0.82rem", color: NAVY2, py: 1.5, borderBottom: `1px solid ${BORDER}` },
                  }}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: sc, flexShrink: 0 }} />
                        <Typography sx={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "0.84rem", color: NAVY }}>{p.title}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, bgcolor: `${T}12`, px: 1.1, py: 0.3, borderRadius: "20px" }}>
                        <GroupsOutlined sx={{ fontSize: 12, color: T }} />
                        <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.78rem", color: T }}>{p.shortlisted}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontFamily: "Poppins", fontWeight: 600, color: NAVY2 }}>{p.velocity}j</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                        <Box sx={{ width: 72, height: 7, borderRadius: "99px", bgcolor: "#F1F5F9", overflow: "hidden" }}>
                          <Box sx={{ width: `${Math.min(p.coverage * 100, 100)}%`, height: "100%", bgcolor: sc, borderRadius: "99px" }} />
                        </Box>
                        <Typography sx={{ fontFamily: "Poppins", fontSize: "0.72rem", fontWeight: 700, color: sc, minWidth: 36 }}>
                          {Math.round(p.coverage * 100)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={t(`pages.kpi.status_${sl}`)} size="small" sx={{
                        fontFamily: "Poppins", fontWeight: 700, fontSize: "0.65rem",
                        bgcolor: `${sc}15`, color: sc, border: `1px solid ${sc}35`, height: 22,
                      }} />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                        {p.deadline < 14 && <WarningAmberOutlined sx={{ fontSize: 13, color: "#EF4444" }} />}
                        <Typography sx={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "0.82rem", color: p.deadline < 14 ? "#EF4444" : NAVY2 }}>
                          {p.deadline}j
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </KpiCard>
    </>
  );
};

export default KpiZone2;
