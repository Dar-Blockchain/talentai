"use client";
import React, { memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import {
  Box, Typography, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Skeleton, IconButton,
} from "@mui/material";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutlineOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import ChevronLeftOutlined from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import { ZoneHeading, KpiCard } from "./KpiAtoms";
import { BORDER, GRAY2, LGRAY, NAVY, NAVY2, T, T_BG, WHITE, coverageColor, coverageLabel } from "../utils/kpiTokens";
import type { PostsStatusResult } from "../types";

// ─── Static constants ─────────────────────────────────────────────────────────

const TH_SX        = { fontFamily: "Poppins", fontWeight: 700, fontSize: "0.7rem", color: GRAY2, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `2px solid ${BORDER}`, py: 1.5, bgcolor: LGRAY } as const;
const TD_ROW_SX    = { "&:hover": { bgcolor: T_BG }, transition: "background 0.15s", "& td": { fontFamily: "Poppins", fontSize: "0.82rem", color: NAVY2, py: 1.5, borderBottom: `1px solid ${BORDER}` } } as const;
const TD_CELL_SX   = { py: 1.5, borderBottom: `1px solid ${BORDER}` } as const;
const TITLE_BOX_SX = { display: "flex", alignItems: "center", gap: 1, cursor: "pointer", "&:hover span": { textDecoration: "underline" } } as const;
const TITLE_SX     = { fontFamily: "Poppins", fontWeight: 600, fontSize: "0.84rem", color: NAVY } as const;
const GROUPS_ICON  = { fontSize: 12, color: T } as const;
const GROUPS_TEXT  = { fontFamily: "Poppins", fontWeight: 700, fontSize: "0.78rem", color: T } as const;
const VELOCITY_SX  = { fontFamily: "Poppins", fontWeight: 600, color: NAVY2 } as const;
const COVER_ROW_SX = { display: "flex", alignItems: "center", justifyContent: "center", gap: 1 } as const;
const COVER_BAR_SX = { width: 72, height: 7, borderRadius: "99px", bgcolor: "#F1F5F9", overflow: "hidden" } as const;
const EMPTY_TD_SX  = { py: 4, fontFamily: "Poppins", fontSize: "0.82rem", color: GRAY2 } as const;
const PAGER_SX     = { display: "flex", alignItems: "center", justifyContent: "space-between", pt: 2, mt: 1, borderTop: `1px solid ${BORDER}` } as const;
const PAGER_CNT_SX = { fontFamily: "Poppins", fontSize: "0.72rem", color: GRAY2 } as const;
const PAGER_ROW_SX = { display: "flex", alignItems: "center", gap: 0.5 } as const;
const PAGE_BTN_SX  = { width: 28, height: 28, border: `1px solid ${BORDER}`, borderRadius: "8px", "&:disabled": { opacity: 0.35 } } as const;
const WARN_ICON_SX = { fontSize: 13, color: "#EF4444" } as const;
const DEAD_ROW_SX  = { display: "inline-flex", alignItems: "center", gap: 0.5 } as const;

const SKEL_WIDTHS = [180, 70, 70, 100, 70, 60] as const;
const SKEL_ROWS   = [null, null, null] as const;

// ─── RowSkeleton ─────────────────────────────────────────────────────────────

const RowSkeleton = memo(() => (
  <TableRow>
    {SKEL_WIDTHS.map((w, i) => (
      <TableCell key={i} align={i === 0 ? "left" : "center"} sx={TD_CELL_SX}>
        <Skeleton variant="rounded" width={w} height={18} sx={{ mx: i === 0 ? 0 : "auto", borderRadius: "8px" }} />
      </TableCell>
    ))}
  </TableRow>
));
RowSkeleton.displayName = "RowSkeleton";

// ─── PageButton ───────────────────────────────────────────────────────────────

const PageButton = memo<{ page: number; active: boolean; onGoTo: (p: number) => void }>(
  ({ page, active, onGoTo }) => {
    const handleClick = useCallback(() => onGoTo(page), [onGoTo, page]);
    const sx = useMemo(() => ({
      width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
      borderRadius: "8px", cursor: "pointer",
      bgcolor: active ? NAVY : "transparent",
      border: `1px solid ${active ? NAVY : BORDER}`,
      transition: "all 0.15s",
      "&:hover": { bgcolor: active ? NAVY : LGRAY },
    }), [active]);
    return (
      <Box onClick={handleClick} sx={sx}>
        <Typography sx={{ fontFamily: "Poppins", fontSize: "0.72rem", fontWeight: 700, color: active ? WHITE : NAVY2 }}>
          {page}
        </Typography>
      </Box>
    );
  },
);
PageButton.displayName = "PageButton";

// ─── KpiPostsOverview ────────────────────────────────────────────────────────

interface KpiPostsOverviewProps {
  data:       PostsStatusResult | undefined;
  loading:    boolean;
  page:       number;
  onPageChange: (page: number) => void;
}

const KpiPostsOverview = memo<KpiPostsOverviewProps>(({ data, loading, page, onPageChange }) => {
  const { t }  = useTranslation("dashboard");
  const router = useRouter();

  const rows       = data?.data       ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;
  const totalCount = data?.pagination?.totalCount ?? 0;

  const goPrev = useCallback(() => onPageChange(page - 1), [onPageChange, page]);
  const goNext = useCallback(() => onPageChange(page + 1), [onPageChange, page]);

  const headers = useMemo(() => [
    t("pages.kpi.col_post"), t("pages.kpi.col_shortlisted"),
    t("pages.kpi.col_velocity"), t("pages.kpi.col_coverage"),
    t("pages.kpi.col_status"), t("pages.kpi.col_deadline"),
  ], [t]);

  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, i) => i + 1), [totalPages]);

  return (
    <>
      <ZoneHeading icon={WorkOutlineOutlined} label={t("pages.kpi.zone2_title")} color="#0891B2" />
      <KpiCard sx={{ mb: 4 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {headers.map((h, idx) => (
                  <TableCell key={h} align={idx === 0 ? "left" : "center"} sx={TH_SX}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                SKEL_ROWS.map((_, i) => <RowSkeleton key={i} />)
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={EMPTY_TD_SX}>No open posts</TableCell>
                </TableRow>
              ) : (
                rows.map((p, idx) => {
                  const sc      = coverageColor(p.coverage, p.deadline ?? 99);
                  const sl      = coverageLabel(p.coverage, p.deadline ?? 99);
                  const rowBg   = idx % 2 === 0 ? WHITE : LGRAY;
                  const isAlert = p.deadline !== null && p.deadline < 14;
                  return (
                    <TableRow key={`${p.title}-${idx}`} sx={{ ...TD_ROW_SX, bgcolor: rowBg }}>
                      <TableCell>
                        <Box onClick={() => router.push(`/company/posts/${p.id}`)} sx={TITLE_BOX_SX}>
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: sc, flexShrink: 0 }} />
                          <Typography component="span" sx={TITLE_SX}>{p.title}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, bgcolor: `${T}12`, px: 1.1, py: 0.3, borderRadius: "20px" }}>
                          <GroupsOutlined sx={GROUPS_ICON} />
                          <Typography sx={GROUPS_TEXT}>{p.shortlisted}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography sx={VELOCITY_SX}>{p.velocity !== null ? `${p.velocity}j` : "—"}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={COVER_ROW_SX}>
                          <Box sx={COVER_BAR_SX}>
                            <Box sx={{ width: `${Math.min(p.coverage * 100, 100)}%`, height: "100%", bgcolor: sc, borderRadius: "99px" }} />
                          </Box>
                          <Typography sx={{ fontFamily: "Poppins", fontSize: "0.72rem", fontWeight: 700, color: sc, minWidth: 36 }}>
                            {Math.round(p.coverage * 100)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={t(`pages.kpi.status_${sl}`)} size="small" sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.65rem", bgcolor: `${sc}15`, color: sc, border: `1px solid ${sc}35`, height: 22 }} />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={DEAD_ROW_SX}>
                          {isAlert && <WarningAmberOutlined sx={WARN_ICON_SX} />}
                          <Typography sx={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "0.82rem", color: isAlert ? "#EF4444" : NAVY2 }}>
                            {p.deadline !== null ? `${p.deadline}j` : "—"}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Box sx={PAGER_SX}>
            <Typography sx={PAGER_CNT_SX}>{totalCount} post{totalCount !== 1 ? "s" : ""}</Typography>
            <Box sx={PAGER_ROW_SX}>
              <IconButton size="small" disabled={page <= 1 || loading} onClick={goPrev} sx={PAGE_BTN_SX}>
                <ChevronLeftOutlined sx={{ fontSize: 16 }} />
              </IconButton>
              {pageNumbers.map((n) => (
                <PageButton key={n} page={n} active={page === n} onGoTo={onPageChange} />
              ))}
              <IconButton size="small" disabled={page >= totalPages || loading} onClick={goNext} sx={PAGE_BTN_SX}>
                <ChevronRightOutlined sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>
        )}
      </KpiCard>
    </>
  );
});
KpiPostsOverview.displayName = "KpiPostsOverview";

export default KpiPostsOverview;
