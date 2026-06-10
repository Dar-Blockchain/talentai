"use client";
import React, { memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, Paper, Divider, Chip, FormControl, InputLabel, Select, MenuItem, OutlinedInput } from "@mui/material";
import FilterListOutlined from "@mui/icons-material/FilterListOutlined";
import { BORDER, GRAY, LGRAY, NAVY, T, T_DARK, WHITE } from "../utils/kpiTokens";
import type { KpiPostOption } from "../types";

// ─── Static constants ─────────────────────────────────────────────────────────

const PERIODS: { label: string; days: number | null }[] = [
  { label: "7d",  days: 7  },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "All", days: null },
] as const;

const PAPER_SX       = { border: `1px solid ${BORDER}`, borderRadius: "14px", px: { xs: 2, sm: 2.5 }, py: 1.5, mb: 3, display: "flex", flexWrap: "wrap", gap: { xs: 1.5, sm: 2 }, alignItems: "center" } as const;
const LABEL_ROW_SX   = { display: "flex", alignItems: "center", gap: 0.75 } as const;
const LABEL_ICON_SX  = { fontSize: 17, color: T } as const;
const LABEL_TEXT_SX  = { fontFamily: "Poppins", fontWeight: 700, fontSize: "0.8rem", color: NAVY } as const;
const DIVIDER_SX     = { borderColor: BORDER, display: { xs: "none", sm: "block" } } as const;
const CHIPS_ROW_SX   = { display: "flex", gap: 0.6, flexWrap: "wrap" } as const;
const DROPDOWN_SX    = { ml: { sm: "auto" } } as const;
const CONTROL_SX     = { minWidth: 200 } as const;
const INPUT_LABEL_SX = { fontFamily: "Poppins", fontSize: "0.75rem" } as const;
const SELECT_SX      = { fontFamily: "Poppins", fontSize: "0.78rem", borderRadius: "10px", "& .MuiOutlinedInput-notchedOutline": { borderColor: BORDER } } as const;
const ALL_ITEM_SX    = { fontFamily: "Poppins", fontSize: "0.78rem", color: GRAY } as const;
const ITEM_SX        = { fontFamily: "Poppins", fontSize: "0.78rem" } as const;
const CHIP_BASE_SX   = { fontFamily: "Poppins", fontWeight: 600, fontSize: "0.7rem", height: 26, cursor: "pointer", transition: "all 0.15s", "& .MuiChip-label": { px: 1.25 } } as const;

// ─── PeriodChip ───────────────────────────────────────────────────────────────

const PeriodChip = memo<{ label: string; active: boolean; onSelect: () => void }>(
  ({ label, active, onSelect }) => {
    const sx = useMemo(() => ({
      ...CHIP_BASE_SX,
      bgcolor: active ? T     : LGRAY,
      color:   active ? WHITE : GRAY,
      border: `1px solid ${active ? T : BORDER}`,
      "&:hover": { bgcolor: active ? T_DARK : "#F1F5F9" },
    }), [active]);
    return <Chip label={label} size="small" onClick={onSelect} sx={sx} />;
  },
);
PeriodChip.displayName = "PeriodChip";

// ─── KpiFiltersBar ────────────────────────────────────────────────────────────

interface KpiFiltersBarProps {
  postId:           string;
  activeDays:       number | null;
  availablePosts:   KpiPostOption[];
  onPostChange:     (id: string) => void;
  onPeriodChange:   (days: number | null) => void;
}

const KpiFiltersBar = memo<KpiFiltersBarProps>(({ postId, activeDays, availablePosts, onPostChange, onPeriodChange }) => {
  const { t } = useTranslation("dashboard");

  const periodHandlers = useMemo(() =>
    PERIODS.map((p) => () => onPeriodChange(p.days)),
  [onPeriodChange]);

  const activePeriod = useMemo(() =>
    PERIODS.find((p) =>
      p.days === null ? activeDays === null : activeDays !== null && Math.abs(activeDays - p.days) <= 1,
    )?.days ?? null,
  [activeDays]);

  const handleSelectChange = useCallback((e: any) => onPostChange(e.target.value as string), [onPostChange]);

  const postLabel = t("pages.kpi.post");

  return (
    <Paper elevation={0} sx={PAPER_SX}>
      <Box sx={LABEL_ROW_SX}>
        <FilterListOutlined sx={LABEL_ICON_SX} />
        <Typography sx={LABEL_TEXT_SX}>{t("pages.kpi.filters")}</Typography>
      </Box>

      <Divider orientation="vertical" flexItem sx={DIVIDER_SX} />

      <Box sx={CHIPS_ROW_SX}>
        {PERIODS.map((p, i) => {
          const active = p.days === activePeriod && (p.days !== null || activeDays === null);
          return <PeriodChip key={p.label} label={p.label} active={active} onSelect={periodHandlers[i]} />;
        })}
      </Box>

      <Divider orientation="vertical" flexItem sx={DIVIDER_SX} />

      <Box sx={DROPDOWN_SX}>
        <FormControl size="small" sx={CONTROL_SX}>
          <InputLabel sx={INPUT_LABEL_SX}>{postLabel}</InputLabel>
          <Select
            value={postId}
            onChange={handleSelectChange}
            input={<OutlinedInput label={postLabel} />}
            sx={SELECT_SX}
          >
            <MenuItem value="" sx={ALL_ITEM_SX}>{t("pages.kpi.all_posts")}</MenuItem>
            {availablePosts.map((p) => (
              <MenuItem key={p.id} value={p.id} sx={ITEM_SX}>{p.title}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
});
KpiFiltersBar.displayName = "KpiFiltersBar";

export default KpiFiltersBar;
