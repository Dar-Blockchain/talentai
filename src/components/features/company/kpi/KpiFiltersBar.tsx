"use client";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Paper, Divider, Chip, FormControl, InputLabel, Select, MenuItem, OutlinedInput } from "@mui/material";
import FilterListOutlined from "@mui/icons-material/FilterListOutlined";
import { BORDER, GRAY, LGRAY, NAVY, T, T_DARK, WHITE } from "./kpiTokens";
import { AppDispatch } from "@/store/store";
import {
  fetchMyPostsForFilter,
  setKpiFilter,
  selectKpiPostId,
  selectKpiDateFrom,
  selectKpiAvailablePosts,
  fetchPendingShortlists,
  fetchUnreviewedInterviews,
  fetchNoshows,
  fetchPostsInAlert,
  fetchPostsStatus,
  fetchFunnel,
  fetchVelocity,
  fetchSourcing,
} from "@/store/slices/kpiSlice";

const PAGE_SIZE = 3;

const PERIODS: { label: string; days: number | null }[] = [
  { label: "7d",  days: 7  },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "All", days: null },
];

const KpiFiltersBar: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const dispatch = useDispatch<AppDispatch>();

  const postId         = useSelector(selectKpiPostId);
  const dateFrom       = useSelector(selectKpiDateFrom);
  const availablePosts = useSelector(selectKpiAvailablePosts);

  useEffect(() => {
    dispatch(fetchMyPostsForFilter());
  }, [dispatch]);

  const refetchAll = (newPostId: string | null, newDateFrom: string | null) => {
    const p: Record<string, string> = {};
    if (newPostId)   p.postId   = newPostId;
    if (newDateFrom) p.dateFrom = newDateFrom;
    dispatch(fetchPendingShortlists(p));
    dispatch(fetchUnreviewedInterviews(p));
    dispatch(fetchNoshows(p));
    dispatch(fetchPostsInAlert());
    dispatch(fetchPostsStatus({ page: 1, limit: PAGE_SIZE }));
    dispatch(fetchFunnel(p));
    dispatch(fetchVelocity(p));
    dispatch(fetchSourcing(p));
  };

  const handlePostChange = (value: string) => {
    const newPostId = value === "" ? null : value;
    dispatch(setKpiFilter({ postId: newPostId }));
    refetchAll(newPostId, dateFrom);
  };

  const handlePeriodChange = (days: number | null) => {
    const newDateFrom = days
      ? new Date(Date.now() - days * 86400000).toISOString()
      : null;
    dispatch(setKpiFilter({ dateFrom: newDateFrom }));
    refetchAll(postId, newDateFrom);
  };

  const activeDays = dateFrom
    ? Math.round((Date.now() - new Date(dateFrom).getTime()) / 86400000)
    : null;

  const activePeriod = PERIODS.find(p =>
    p.days === null ? activeDays === null : activeDays !== null && Math.abs(activeDays - p.days) <= 1
  )?.days ?? null;

  return (
    <Paper elevation={0} sx={{
      border: `1px solid ${BORDER}`, borderRadius: "14px",
      px: { xs: 2, sm: 2.5 }, py: 1.5, mb: 3,
      display: "flex", flexWrap: "wrap", gap: { xs: 1.5, sm: 2 }, alignItems: "center",
    }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <FilterListOutlined sx={{ fontSize: 17, color: T }} />
        <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.8rem", color: NAVY }}>
          {t("pages.kpi.filters")}
        </Typography>
      </Box>

      <Divider orientation="vertical" flexItem sx={{ borderColor: BORDER, display: { xs: "none", sm: "block" } }} />

      {/* Period chips */}
      <Box sx={{ display: "flex", gap: 0.6, flexWrap: "wrap" }}>
        {PERIODS.map(p => {
          const active = p.days === activePeriod && (p.days !== null || activeDays === null);
          return (
            <Chip
              key={p.label}
              label={p.label}
              size="small"
              onClick={() => handlePeriodChange(p.days)}
              sx={{
                fontFamily: "Poppins", fontWeight: 600, fontSize: "0.7rem", height: 26,
                bgcolor: active ? T : LGRAY,
                color:   active ? WHITE : GRAY,
                border: `1px solid ${active ? T : BORDER}`,
                cursor: "pointer", transition: "all 0.15s",
                "&:hover": { bgcolor: active ? T_DARK : "#F1F5F9" },
                "& .MuiChip-label": { px: 1.25 },
              }}
            />
          );
        })}
      </Box>

      <Divider orientation="vertical" flexItem sx={{ borderColor: BORDER, display: { xs: "none", sm: "block" } }} />

      {/* Post dropdown */}
      <Box sx={{ ml: { sm: "auto" } }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel sx={{ fontFamily: "Poppins", fontSize: "0.75rem" }}>
            {t("pages.kpi.post")}
          </InputLabel>
          <Select
            value={postId ?? ""}
            onChange={e => handlePostChange(e.target.value as string)}
            input={<OutlinedInput label={t("pages.kpi.post")} />}
            sx={{ fontFamily: "Poppins", fontSize: "0.78rem", borderRadius: "10px", "& .MuiOutlinedInput-notchedOutline": { borderColor: BORDER } }}
          >
            <MenuItem value="" sx={{ fontFamily: "Poppins", fontSize: "0.78rem", color: GRAY }}>
              {t("pages.kpi.all_posts")}
            </MenuItem>
            {availablePosts.map(p => (
              <MenuItem key={p.id} value={p.id} sx={{ fontFamily: "Poppins", fontSize: "0.78rem" }}>
                {p.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
};

export default KpiFiltersBar;
