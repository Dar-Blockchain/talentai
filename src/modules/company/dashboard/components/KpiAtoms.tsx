"use client";
import React, { memo, useMemo } from "react";
import { Box, Typography, Paper } from "@mui/material";
import ArrowUpwardOutlined   from "@mui/icons-material/ArrowUpwardOutlined";
import ArrowDownwardOutlined from "@mui/icons-material/ArrowDownwardOutlined";
import RemoveOutlined        from "@mui/icons-material/RemoveOutlined";
import { BORDER, GRAY, GRAY2, NAVY, NAVY2, WHITE } from "../utils/kpiTokens";

// ─── Static sx constants ──────────────────────────────────────────────────────

const STABLE_SX      = { display: "inline-flex", alignItems: "center", gap: 0.25, px: 0.75, py: 0.15, borderRadius: "20px", bgcolor: "#F1F5F9" } as const;
const STABLE_ICON_SX = { fontSize: 11, color: GRAY2 } as const;
const STABLE_TEXT_SX = { fontSize: "0.68rem", fontWeight: 600, color: GRAY2 } as const;

const UP_BOX_SX   = { display: "inline-flex", alignItems: "center", gap: 0.25, px: 0.75, py: 0.15, borderRadius: "20px", bgcolor: "#ECFDF5" } as const;
const DOWN_BOX_SX = { display: "inline-flex", alignItems: "center", gap: 0.25, px: 0.75, py: 0.15, borderRadius: "20px", bgcolor: "#FEF2F2" } as const;
const UP_ICON_SX   = { fontSize: 11, color: "#10B981" } as const;
const DOWN_ICON_SX = { fontSize: 11, color: "#EF4444" } as const;
const UP_TEXT_SX   = { fontSize: "0.68rem", fontWeight: 700, color: "#10B981" } as const;
const DOWN_TEXT_SX = { fontSize: "0.68rem", fontWeight: 700, color: "#EF4444" } as const;

const ZONE_ROW_SX      = { display: "flex", alignItems: "center", gap: 1.25, mb: 2, mt: 1 } as const;
const ZONE_ICON_BOX_SX = { width: 32, height: 32, borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } as const;
const ZONE_TITLE_SX    = { fontFamily: "Poppins", fontWeight: 700, fontSize: "0.92rem", color: NAVY } as const;
const ZONE_DIVIDER_SX  = { flex: 1, height: "1px", bgcolor: BORDER } as const;

const KPICARD_PAPER_SX  = { border: `1px solid ${BORDER}`, borderRadius: "18px", p: { xs: 2, sm: 2.5 }, bgcolor: WHITE, height: "100%" } as const;
const KPICARD_TITLE_BOX = { mb: 2 } as const;
const KPICARD_TITLE_SX  = { fontFamily: "Poppins", fontWeight: 700, fontSize: "0.92rem", color: NAVY } as const;
const KPICARD_SUB_SX    = { fontFamily: "Poppins", fontSize: "0.74rem", color: GRAY2, mt: 0.25 } as const;

const ACTION_PAPER_SX   = { border: `1px solid ${BORDER}`, borderRadius: "18px", p: 2.5, bgcolor: WHITE, transition: "box-shadow 0.2s, transform 0.2s", "&:hover": { boxShadow: "0 8px 28px rgba(0,0,0,0.09)", transform: "translateY(-2px)" } } as const;
const ACTION_TOP_ROW_SX = { display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 } as const;
const ACTION_VAL_SX     = { fontFamily: "Poppins", fontWeight: 800, fontSize: "2rem", color: NAVY, lineHeight: 1 } as const;
const ACTION_LABEL_SX   = { fontFamily: "Poppins", fontSize: "0.78rem", fontWeight: 600, color: NAVY2, mt: 0.5, mb: 0.25 } as const;
const ACTION_NOTE_SX    = { fontFamily: "Poppins", fontSize: "0.68rem", color: GRAY2 } as const;
const ACTION_ICON_SX    = { width: 44, height: 44, borderRadius: "13px", display: "flex", alignItems: "center", justifyContent: "center" } as const;

const METRIC_ROW_VAL_SX = { fontFamily: "Poppins", fontWeight: 700, fontSize: "0.9rem" } as const;
const METRIC_ROW_SUB_SX = { fontFamily: "Poppins", fontSize: "0.65rem", color: GRAY2 } as const;
const METRIC_BOX_SX     = { textAlign: "right" } as const;
const METRIC_LABEL_SX   = { fontFamily: "Poppins", fontSize: "0.8rem", color: GRAY } as const;
const METRIC_ROW_LAST_SX = { display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.1 } as const;
const METRIC_ROW_SX      = { display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.1, borderBottom: `1px solid ${BORDER}` } as const;

// ─── Delta badge ──────────────────────────────────────────────────────────────

export const Delta = memo<{ cur: number; prev: number }>(({ cur, prev }) => {
  const d = cur - prev;
  if (d === 0) return (
    <Box sx={STABLE_SX}>
      <RemoveOutlined sx={STABLE_ICON_SX} />
      <Typography sx={STABLE_TEXT_SX}>stable</Typography>
    </Box>
  );
  const up = d > 0;
  return (
    <Box sx={up ? UP_BOX_SX : DOWN_BOX_SX}>
      {up
        ? <ArrowUpwardOutlined   sx={UP_ICON_SX} />
        : <ArrowDownwardOutlined sx={DOWN_ICON_SX} />}
      <Typography sx={up ? UP_TEXT_SX : DOWN_TEXT_SX}>
        {up ? "+" : ""}{d}
      </Typography>
    </Box>
  );
});
Delta.displayName = "Delta";

// ─── Zone section heading ─────────────────────────────────────────────────────

export const ZoneHeading = memo<{ icon: React.ElementType; label: string; color?: string }>(
  ({ icon: Icon, label, color = "#0D9488" }) => {
    const iconBoxSx = useMemo(() => ({ ...ZONE_ICON_BOX_SX, bgcolor: `${color}15` }), [color]);
    const iconSx    = useMemo(() => ({ fontSize: 17, color }), [color]);
    return (
      <Box sx={ZONE_ROW_SX}>
        <Box sx={iconBoxSx}>
          <Icon sx={iconSx} />
        </Box>
        <Typography sx={ZONE_TITLE_SX}>{label}</Typography>
        <Box sx={ZONE_DIVIDER_SX} />
      </Box>
    );
  },
);
ZoneHeading.displayName = "ZoneHeading";

// ─── Generic card wrapper ─────────────────────────────────────────────────────

export const KpiCard = memo<{ title?: string; subtitle?: string; children: React.ReactNode; sx?: object }>(
  ({ title, subtitle, children, sx }) => {
    const paperSx = useMemo(
      () => sx ? { ...KPICARD_PAPER_SX, ...sx } : KPICARD_PAPER_SX,
      [sx],
    );
    return (
      <Paper elevation={0} sx={paperSx}>
        {title && (
          <Box sx={KPICARD_TITLE_BOX}>
            <Typography sx={KPICARD_TITLE_SX}>{title}</Typography>
            {subtitle && <Typography sx={KPICARD_SUB_SX}>{subtitle}</Typography>}
          </Box>
        )}
        {children}
      </Paper>
    );
  },
);
KpiCard.displayName = "KpiCard";

// ─── Action card (Zone 1) ─────────────────────────────────────────────────────

export const ActionCard = memo<{
  icon: React.ElementType; label: string; value: number;
  color: string; bg: string; trend: number; note: string;
}>(({ icon: Icon, label, value, color, bg, trend, note }) => {
  const iconBoxSx = useMemo(() => ({ ...ACTION_ICON_SX, bgcolor: bg }), [bg]);
  const iconSx    = useMemo(() => ({ fontSize: 22, color }), [color]);
  return (
    <Paper elevation={0} sx={ACTION_PAPER_SX}>
      <Box sx={ACTION_TOP_ROW_SX}>
        <Box sx={iconBoxSx}>
          <Icon sx={iconSx} />
        </Box>
        <Delta cur={value} prev={value - trend} />
      </Box>
      <Typography sx={ACTION_VAL_SX}>{value}</Typography>
      <Typography sx={ACTION_LABEL_SX}>{label}</Typography>
      <Typography sx={ACTION_NOTE_SX}>{note}</Typography>
    </Paper>
  );
});
ActionCard.displayName = "ActionCard";

// ─── Metric row ───────────────────────────────────────────────────────────────

export const MetricRow = memo<{ label: string; value: string | number; sub?: string; color?: string; last?: boolean }>(
  ({ label, value, sub, color = "#0D9488", last }) => {
    const valSx = useMemo(() => ({ ...METRIC_ROW_VAL_SX, color }), [color]);
    return (
      <Box sx={last ? METRIC_ROW_LAST_SX : METRIC_ROW_SX}>
        <Typography sx={METRIC_LABEL_SX}>{label}</Typography>
        <Box sx={METRIC_BOX_SX}>
          <Typography sx={valSx}>{value}</Typography>
          {sub && <Typography sx={METRIC_ROW_SUB_SX}>{sub}</Typography>}
        </Box>
      </Box>
    );
  },
);
MetricRow.displayName = "MetricRow";
