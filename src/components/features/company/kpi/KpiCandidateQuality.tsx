"use client";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  Box, Typography, Chip, Grid, Skeleton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from "@mui/material";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import StarOutlined from "@mui/icons-material/StarOutlined";
import { ZoneHeading, KpiCard } from "./KpiAtoms";
import { BORDER, GRAY, GRAY2, LGRAY, NAVY2, T, T_BG, T_BRD, T_DARK, WHITE } from "./kpiTokens";
import { AppDispatch } from "@/store/store";
import { fetchSourcing, selectSourcing, selectSourcingLoading, selectKpiPostId, selectKpiDateFrom } from "@/store/slices/kpiSlice";

const KpiZone5: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const dispatch = useDispatch<AppDispatch>();

  const sourcing = useSelector(selectSourcing);
  const loading  = useSelector(selectSourcingLoading);
  const postId   = useSelector(selectKpiPostId);
  const dateFrom = useSelector(selectKpiDateFrom);

  useEffect(() => {
    const p: Record<string, string> = {};
    if (postId)   p.postId   = postId;
    if (dateFrom) p.dateFrom = dateFrom;
    dispatch(fetchSourcing(p));
  }, [dispatch, postId, dateFrom]);

  const tableHeaders = [
    "#",
    t("pages.kpi.col_candidate"),
    t("pages.kpi.col_post"),
    t("pages.kpi.col_score"),
    t("pages.kpi.col_statut"),
  ];

  const deltaLabel = sourcing.avgDelta !== null
    ? `${sourcing.avgDelta >= 0 ? "↑ +" : "↓ "}${sourcing.avgDelta} vs prev. period`
    : "—";
  const deltaColor = sourcing.avgDelta !== null && sourcing.avgDelta >= 0 ? "#10B981" : "#EF4444";

  return (
    <>
      <ZoneHeading icon={PeopleOutlined} label={t("pages.kpi.zone5_title")} color="#D97706" />
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mb: 4 }}>

        {/* Score panel */}
        <Grid size={{ xs: 12, sm: 5, md: 4 }}>
          <KpiCard>
            {/* Global avg */}
            <Box sx={{ p: 2, bgcolor: T_BG, border: `1px solid ${T_BRD}`, borderRadius: "14px", mb: 2.5, textAlign: "center" }}>
              <Typography sx={{ fontFamily: "Poppins", fontSize: "0.68rem", fontWeight: 700, color: T, textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.5 }}>
                {t("pages.kpi.avg_score_label")}
              </Typography>
              {loading ? (
                <Skeleton variant="text" width={60} height={56} sx={{ mx: "auto" }} />
              ) : (
                <Typography sx={{ fontFamily: "Poppins", fontWeight: 800, fontSize: "3rem", color: T_DARK, lineHeight: 1 }}>
                  {sourcing.avgCurrent ?? "—"}
                </Typography>
              )}
              <Typography sx={{ fontFamily: "Poppins", fontSize: "0.75rem", color: GRAY, mb: 1 }}>/100</Typography>
              {loading ? (
                <Skeleton variant="rounded" width={140} height={22} sx={{ mx: "auto", borderRadius: "20px" }} />
              ) : (
                <Chip
                  label={deltaLabel}
                  size="small"
                  sx={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "0.68rem", bgcolor: WHITE, color: deltaColor, border: `1px solid ${deltaColor}30`, height: 22 }}
                />
              )}
            </Box>

            {/* By post */}
            <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.7rem", color: GRAY2, textTransform: "uppercase", letterSpacing: "0.07em", mb: 1.25 }}>
              {t("pages.kpi.by_channel")}
            </Typography>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Box key={i} sx={{ mb: 1.1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
                      <Skeleton variant="text" width={90} height={16} />
                      <Skeleton variant="text" width={24} height={16} />
                    </Box>
                    <Skeleton variant="rounded" width="100%" height={6} sx={{ borderRadius: "99px" }} />
                  </Box>
                ))
              : sourcing.byPost.length === 0
              ? <Typography sx={{ fontFamily: "Poppins", fontSize: "0.78rem", color: GRAY2 }}>No data yet</Typography>
              : sourcing.byPost.map((ch, i) => (
                  <Box key={ch.label} sx={{ mb: i < sourcing.byPost.length - 1 ? 1.1 : 0 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
                      <Typography sx={{ fontFamily: "Poppins", fontSize: "0.78rem", color: NAVY2, fontWeight: 500 }}>{ch.label}</Typography>
                      <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.78rem", color: ch.color }}>{ch.score}</Typography>
                    </Box>
                    <Box sx={{ height: 6, borderRadius: "99px", bgcolor: "#F1F5F9", overflow: "hidden" }}>
                      <Box sx={{ width: `${ch.score}%`, height: "100%", bgcolor: ch.color, borderRadius: "99px", opacity: 0.85 }} />
                    </Box>
                  </Box>
                ))
            }
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
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          {[22, 120, 110, 40, 70].map((w, j) => (
                            <TableCell key={j} align={j === 1 || j === 2 ? "left" : "center"} sx={{ py: 1.1, borderBottom: `1px solid ${BORDER}` }}>
                              <Skeleton variant="rounded" width={w} height={16} sx={{ mx: j === 1 || j === 2 ? 0 : "auto", borderRadius: "8px" }} />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : sourcing.top10.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 4, fontFamily: "Poppins", fontSize: "0.82rem", color: GRAY2 }}>
                            No completed interviews yet
                          </TableCell>
                        </TableRow>
                      )
                    : sourcing.top10.map((c) => (
                        <TableRow key={c.rank} sx={{
                          "&:hover": { bgcolor: T_BG }, transition: "background 0.15s",
                          "& td": { fontFamily: "Poppins", fontSize: "0.8rem", color: NAVY2, py: 1.1, borderBottom: `1px solid ${BORDER}` },
                        }}>
                          <TableCell align="center">
                            <Box sx={{ width: 22, height: 22, borderRadius: "50%", mx: "auto", bgcolor: c.rank <= 3 ? `${T}18` : "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.68rem", color: c.rank <= 3 ? T : GRAY }}>{c.rank}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{c.firstName} {c.lastName}</TableCell>
                          <TableCell sx={{ color: GRAY }}>{c.postTitle}</TableCell>
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
                                color:   c.status === "shortlisted" ? T       : "#2563EB",
                                "& .MuiChip-label": { px: 0.9 },
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                  }
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
