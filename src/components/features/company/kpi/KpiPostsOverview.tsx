"use client";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
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
import { BORDER, GRAY2, LGRAY, NAVY, NAVY2, T, T_BG, WHITE, coverageColor, coverageLabel } from "./kpiTokens";
import { AppDispatch } from "@/store/store";
import {
  fetchPostsStatus,
  selectPostsStatusRows,
  selectPostsStatusLoading,
  selectPostsStatusCurrentPage,
  selectPostsStatusTotalPages,
  selectPostsStatusTotalCount,
  selectKpiPostId,
} from "@/store/slices/kpiSlice";

const PAGE_SIZE = 3;

const RowSkeleton: React.FC = () => (
  <TableRow>
    {[180, 70, 70, 100, 70, 60].map((w, i) => (
      <TableCell key={i} align={i === 0 ? "left" : "center"} sx={{ py: 1.5, borderBottom: `1px solid ${BORDER}` }}>
        <Skeleton variant="rounded" width={w} height={18} sx={{ mx: i === 0 ? 0 : "auto", borderRadius: "8px" }} />
      </TableCell>
    ))}
  </TableRow>
);

const KpiZone2: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const rows        = useSelector(selectPostsStatusRows);
  const loading     = useSelector(selectPostsStatusLoading);
  const currentPage = useSelector(selectPostsStatusCurrentPage);
  const totalPages  = useSelector(selectPostsStatusTotalPages);
  const totalCount  = useSelector(selectPostsStatusTotalCount);
  const postId      = useSelector(selectKpiPostId);

  useEffect(() => {
    dispatch(fetchPostsStatus({ page: 1, limit: PAGE_SIZE, ...(postId ? { postId } : {}) }));
  }, [dispatch, postId]);

  const goTo = (page: number) => {
    dispatch(fetchPostsStatus({ page, limit: PAGE_SIZE, ...(postId ? { postId } : {}) }));
  };

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
              {loading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => <RowSkeleton key={i} />)
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, fontFamily: "Poppins", fontSize: "0.82rem", color: GRAY2 }}>
                    No open posts
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((p, idx) => {
                  const sc = coverageColor(p.coverage, p.deadline ?? 99);
                  const sl = coverageLabel(p.coverage, p.deadline ?? 99);
                  return (
                    <TableRow key={`${p.title}-${idx}`} sx={{
                      bgcolor: idx % 2 === 0 ? WHITE : LGRAY,
                      "&:hover": { bgcolor: T_BG },
                      transition: "background 0.15s",
                      "& td": { fontFamily: "Poppins", fontSize: "0.82rem", color: NAVY2, py: 1.5, borderBottom: `1px solid ${BORDER}` },
                    }}>
                      <TableCell>
                        <Box
                          onClick={() => router.push(`/company/posts/${p.id}`)}
                          sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", "&:hover span": { textDecoration: "underline" } }}
                        >
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: sc, flexShrink: 0 }} />
                          <Typography component="span" sx={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "0.84rem", color: NAVY }}>{p.title}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, bgcolor: `${T}12`, px: 1.1, py: 0.3, borderRadius: "20px" }}>
                          <GroupsOutlined sx={{ fontSize: 12, color: T }} />
                          <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.78rem", color: T }}>{p.shortlisted}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography sx={{ fontFamily: "Poppins", fontWeight: 600, color: NAVY2 }}>
                          {p.velocity !== null ? `${p.velocity}j` : "—"}
                        </Typography>
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
                          {p.deadline !== null && p.deadline < 14 && (
                            <WarningAmberOutlined sx={{ fontSize: 13, color: "#EF4444" }} />
                          )}
                          <Typography sx={{ fontFamily: "Poppins", fontWeight: 600, fontSize: "0.82rem", color: (p.deadline !== null && p.deadline < 14) ? "#EF4444" : NAVY2 }}>
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
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 2, mt: 1, borderTop: `1px solid ${BORDER}` }}>
            <Typography sx={{ fontFamily: "Poppins", fontSize: "0.72rem", color: GRAY2 }}>
              {totalCount} post{totalCount !== 1 ? "s" : ""}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton size="small" disabled={currentPage <= 1 || loading} onClick={() => goTo(currentPage - 1)}
                sx={{ width: 28, height: 28, border: `1px solid ${BORDER}`, borderRadius: "8px", "&:disabled": { opacity: 0.35 } }}>
                <ChevronLeftOutlined sx={{ fontSize: 16 }} />
              </IconButton>
              {Array.from({ length: totalPages }).map((_, i) => (
                <Box key={i} onClick={() => goTo(i + 1)} sx={{
                  width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: "8px", cursor: "pointer",
                  bgcolor: currentPage === i + 1 ? NAVY : "transparent",
                  border: `1px solid ${currentPage === i + 1 ? NAVY : BORDER}`,
                  transition: "all 0.15s",
                  "&:hover": { bgcolor: currentPage === i + 1 ? NAVY : LGRAY },
                }}>
                  <Typography sx={{ fontFamily: "Poppins", fontSize: "0.72rem", fontWeight: 700, color: currentPage === i + 1 ? WHITE : NAVY2 }}>
                    {i + 1}
                  </Typography>
                </Box>
              ))}
              <IconButton size="small" disabled={currentPage >= totalPages || loading} onClick={() => goTo(currentPage + 1)}
                sx={{ width: 28, height: 28, border: `1px solid ${BORDER}`, borderRadius: "8px", "&:disabled": { opacity: 0.35 } }}>
                <ChevronRightOutlined sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>
        )}
      </KpiCard>
    </>
  );
};

export default KpiZone2;
