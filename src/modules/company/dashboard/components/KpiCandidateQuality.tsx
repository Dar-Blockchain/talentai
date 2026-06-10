"use client";
import React, { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Box, Typography, Chip, Grid, Skeleton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from "@mui/material";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import StarOutlined from "@mui/icons-material/StarOutlined";
import { ZoneHeading, KpiCard } from "./KpiAtoms";
import { BORDER, GRAY, GRAY2, LGRAY, NAVY2, T, T_BG, T_BRD, T_DARK, WHITE } from "../utils/kpiTokens";
import type { KpiSourcingData, SourcingCandidate } from "../types";

// ─── Static constants ─────────────────────────────────────────────────────────

const GRID_SX        = { mb: 4 } as const;
const SCORE_BOX_SX   = { p: 2, bgcolor: T_BG, border: `1px solid ${T_BRD}`, borderRadius: "14px", mb: 2.5, textAlign: "center" } as const;
const SCORE_LABEL_SX = { fontFamily: "Poppins", fontSize: "0.68rem", fontWeight: 700, color: T, textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.5 } as const;
const SCORE_VAL_SX   = { fontFamily: "Poppins", fontWeight: 800, fontSize: "3rem", color: T_DARK, lineHeight: 1 } as const;
const SCORE_DIV_SX   = { fontFamily: "Poppins", fontSize: "0.75rem", color: GRAY, mb: 1 } as const;
const CHAN_TITLE_SX  = { fontFamily: "Poppins", fontWeight: 700, fontSize: "0.7rem", color: GRAY2, textTransform: "uppercase", letterSpacing: "0.07em", mb: 1.25 } as const;
const CHAN_LABEL_SX  = { fontFamily: "Poppins", fontSize: "0.78rem", color: NAVY2, fontWeight: 500 } as const;
const CHAN_RAIL_SX   = { height: 6, borderRadius: "99px", bgcolor: "#F1F5F9", overflow: "hidden" } as const;
const NO_DATA_SX     = { fontFamily: "Poppins", fontSize: "0.78rem", color: GRAY2 } as const;

const TH_SX               = { fontFamily: "Poppins", fontWeight: 700, fontSize: "0.68rem", color: GRAY2, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `2px solid ${BORDER}`, py: 1.25, bgcolor: LGRAY } as const;
const TR_SX               = { "&:hover": { bgcolor: T_BG }, transition: "background 0.15s", "& td": { fontFamily: "Poppins", fontSize: "0.8rem", color: NAVY2, py: 1.1, borderBottom: `1px solid ${BORDER}` } } as const;
const TD_SX               = { py: 1.1, borderBottom: `1px solid ${BORDER}` } as const;
const RANK_BOX_SX         = { width: 22, height: 22, borderRadius: "50%", mx: "auto", display: "flex", alignItems: "center", justifyContent: "center" } as const;
const STAR_SX             = { fontSize: 13, color: "#F59E0B" } as const;
const SCORE_CELL_SX       = { display: "inline-flex", alignItems: "center", gap: 0.4 } as const;
const SCORE_TXT_SX        = { fontFamily: "Poppins", fontWeight: 700, fontSize: "0.82rem", color: T } as const;
const EMPTY_CELL_SX       = { py: 4, fontFamily: "Poppins", fontSize: "0.82rem", color: GRAY2 } as const;
const NO_SCORE_SX         = { fontFamily: "Poppins", fontSize: "0.82rem", color: GRAY2 } as const;
const SHORTLISTED_CHIP_SX = { fontFamily: "Poppins", fontWeight: 600, fontSize: "0.63rem", height: 20, bgcolor: `${T}12`, color: T, "& .MuiChip-label": { px: 0.9 } } as const;
const COMPLETED_CHIP_SX   = { fontFamily: "Poppins", fontWeight: 600, fontSize: "0.63rem", height: 20, bgcolor: "#EFF6FF", color: "#2563EB", "& .MuiChip-label": { px: 0.9 } } as const;

const SKEL_CHAN   = [0, 1, 2, 3] as const;
const SKEL_ROWS   = [0, 1, 2, 3, 4] as const;
const SKEL_WIDTHS = [22, 120, 110, 40, 70] as const;

// ─── CandidateRow ─────────────────────────────────────────────────────────────

const CandidateRow = memo<{ c: SourcingCandidate; shortlistedLabel: string; completedLabel: string }>(
  ({ c, shortlistedLabel, completedLabel }) => {
    const isTop  = c.rank <= 3;
    const chipSx = c.status === "shortlisted" ? SHORTLISTED_CHIP_SX : COMPLETED_CHIP_SX;
    return (
      <TableRow sx={TR_SX}>
        <TableCell align="center">
          <Box sx={{ ...RANK_BOX_SX, bgcolor: isTop ? `${T}18` : "#F1F5F9" }}>
            <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.68rem", color: isTop ? T : GRAY }}>{c.rank}</Typography>
          </Box>
        </TableCell>
        <TableCell sx={{ fontWeight: 600 }}>{c.firstName} {c.lastName}</TableCell>
        <TableCell sx={{ color: GRAY }}>{c.postTitle}</TableCell>
        <TableCell align="center">
          {c.score !== null ? (
            <Box sx={SCORE_CELL_SX}>
              <StarOutlined sx={STAR_SX} />
              <Typography sx={SCORE_TXT_SX}>{c.score}</Typography>
            </Box>
          ) : (
            <Typography sx={NO_SCORE_SX}>—</Typography>
          )}
        </TableCell>
        <TableCell align="center">
          <Chip label={c.status === "shortlisted" ? shortlistedLabel : completedLabel} size="small" sx={chipSx} />
        </TableCell>
      </TableRow>
    );
  },
);
CandidateRow.displayName = "CandidateRow";

// ─── KpiCandidateQuality ─────────────────────────────────────────────────────

interface KpiCandidateQualityProps {
  data:    KpiSourcingData | undefined;
  loading: boolean;
}

const KpiCandidateQuality = memo<KpiCandidateQualityProps>(({ data, loading }) => {
  const { t } = useTranslation("dashboard");

  const tableHeaders = useMemo(() => [
    "#", t("pages.kpi.col_candidate"), t("pages.kpi.col_post"),
    t("pages.kpi.col_score"), t("pages.kpi.col_statut"),
  ], [t]);

  const shortlistedLabel = t("pages.kpi.shortlisted_chip");
  const completedLabel   = t("pages.kpi.completed_chip");

  const deltaLabel = useMemo(() =>
    data?.avgDelta !== null && data?.avgDelta !== undefined
      ? `${data.avgDelta >= 0 ? "↑ +" : "↓ "}${data.avgDelta} vs prev. period`
      : "—",
  [data?.avgDelta]);

  const deltaColor = useMemo(() =>
    data?.avgDelta !== null && data?.avgDelta !== undefined && data.avgDelta >= 0 ? "#10B981" : "#EF4444",
  [data?.avgDelta]);

  const deltaChipSx = useMemo(() => ({
    fontFamily: "Poppins", fontWeight: 600, fontSize: "0.68rem",
    bgcolor: WHITE, color: deltaColor, border: `1px solid ${deltaColor}30`, height: 22,
  }), [deltaColor]);

  const byPost = data?.byPost ?? [];
  const top10  = data?.top10  ?? [];

  return (
    <>
      <ZoneHeading icon={PeopleOutlined} label={t("pages.kpi.zone5_title")} color="#D97706" />
      <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={GRID_SX}>

        {/* Score panel */}
        <Grid size={{ xs: 12, sm: 5, md: 4 }}>
          <KpiCard>
            <Box sx={SCORE_BOX_SX}>
              <Typography sx={SCORE_LABEL_SX}>{t("pages.kpi.avg_score_label")}</Typography>
              {loading
                ? <Skeleton variant="text" width={60} height={56} sx={{ mx: "auto" }} />
                : <Typography sx={SCORE_VAL_SX}>{data?.avgCurrent ?? "—"}</Typography>}
              <Typography sx={SCORE_DIV_SX}>/100</Typography>
              {loading
                ? <Skeleton variant="rounded" width={140} height={22} sx={{ mx: "auto", borderRadius: "20px" }} />
                : <Chip label={deltaLabel} size="small" sx={deltaChipSx} />}
            </Box>

            <Typography sx={CHAN_TITLE_SX}>{t("pages.kpi.by_channel")}</Typography>
            {loading
              ? SKEL_CHAN.map((i) => (
                  <Box key={i} sx={{ mb: 1.1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
                      <Skeleton variant="text" width={90} height={16} />
                      <Skeleton variant="text" width={24} height={16} />
                    </Box>
                    <Skeleton variant="rounded" width="100%" height={6} sx={{ borderRadius: "99px" }} />
                  </Box>
                ))
              : byPost.length === 0
              ? <Typography sx={NO_DATA_SX}>No data yet</Typography>
              : byPost.map((ch, i) => (
                  <Box key={ch.label} sx={{ mb: i < byPost.length - 1 ? 1.1 : 0 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
                      <Typography sx={CHAN_LABEL_SX}>{ch.label}</Typography>
                      <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.78rem", color: ch.color }}>{ch.score}</Typography>
                    </Box>
                    <Box sx={CHAN_RAIL_SX}>
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
                      <TableCell key={h} align={idx === 1 || idx === 2 ? "left" : "center"} sx={TH_SX}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading
                    ? SKEL_ROWS.map((i) => (
                        <TableRow key={i}>
                          {SKEL_WIDTHS.map((w, j) => (
                            <TableCell key={j} align={j === 1 || j === 2 ? "left" : "center"} sx={TD_SX}>
                              <Skeleton variant="rounded" width={w} height={16} sx={{ mx: j === 1 || j === 2 ? 0 : "auto", borderRadius: "8px" }} />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : top10.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={EMPTY_CELL_SX}>No completed interviews yet</TableCell>
                        </TableRow>
                      )
                    : top10.map((c) => (
                        <CandidateRow key={c.rank} c={c} shortlistedLabel={shortlistedLabel} completedLabel={completedLabel} />
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
});
KpiCandidateQuality.displayName = "KpiCandidateQuality";

export default KpiCandidateQuality;
