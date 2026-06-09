"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import ArrowUpwardOutlined from "@mui/icons-material/ArrowUpwardOutlined";
import ArrowDownwardOutlined from "@mui/icons-material/ArrowDownwardOutlined";
import RemoveOutlined from "@mui/icons-material/RemoveOutlined";
import { BORDER, GRAY, GRAY2, NAVY, NAVY2 } from "./kpiTokens";
import { Card, CardContent } from "@/modules/shared/ui/shadcn/card";
import { cn } from "@/lib/utils";

// ── Delta badge ────────────────────────────────────────────────────────────────
export const Delta: React.FC<{ cur: number; prev: number }> = ({ cur, prev }) => {
  const d = cur - prev;
  if (d === 0) return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.25, px: 0.75, py: 0.15, borderRadius: "20px", bgcolor: "#F1F5F9" }}>
      <RemoveOutlined sx={{ fontSize: 11, color: GRAY2 }} />
      <Typography sx={{ fontSize: "0.68rem", fontWeight: 600, color: GRAY2 }}>stable</Typography>
    </Box>
  );
  const up = d > 0;
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.25, px: 0.75, py: 0.15, borderRadius: "20px", bgcolor: up ? "#ECFDF5" : "#FEF2F2" }}>
      {up
        ? <ArrowUpwardOutlined sx={{ fontSize: 11, color: "#10B981" }} />
        : <ArrowDownwardOutlined sx={{ fontSize: 11, color: "#EF4444" }} />}
      <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: up ? "#10B981" : "#EF4444" }}>
        {up ? "+" : ""}{d}
      </Typography>
    </Box>
  );
};

// ── Zone section heading ───────────────────────────────────────────────────────
export const ZoneHeading: React.FC<{ icon: React.ElementType; label: string; color?: string }> = ({ icon: Icon, label, color = "#0D9488" }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 2, mt: 1 }}>
    <Box sx={{ width: 32, height: 32, borderRadius: "9px", bgcolor: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon sx={{ fontSize: 17, color }} />
    </Box>
    <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.92rem", color: NAVY }}>{label}</Typography>
    <Box sx={{ flex: 1, height: "1px", bgcolor: BORDER }} />
  </Box>
);

// ── Generic card wrapper ───────────────────────────────────────────────────────
export const KpiCard: React.FC<{
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, children, className }) => (
  <Card className={cn("rounded-[18px] py-0 gap-0 h-full", className)}>
    <CardContent className="p-4 sm:p-5 h-full">
      {title && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.92rem", color: NAVY }}>{title}</Typography>
          {subtitle && <Typography sx={{ fontFamily: "Poppins", fontSize: "0.74rem", color: GRAY2, mt: 0.25 }}>{subtitle}</Typography>}
        </Box>
      )}
      {children}
    </CardContent>
  </Card>
);

// ── Action card (Zone 1) ───────────────────────────────────────────────────────
export const ActionCard: React.FC<{
  icon: React.ElementType; label: string; value: number;
  color: string; bg: string; trend: number; note: string;
}> = ({ icon: Icon, label, value, color, bg, trend, note }) => (
  <Card className="rounded-[18px] py-0 gap-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,0,0,0.09)]">
    <CardContent className="p-5">
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ width: 44, height: 44, borderRadius: "13px", bgcolor: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon sx={{ fontSize: 22, color }} />
        </Box>
        <Delta cur={value} prev={value - trend} />
      </Box>
      <Typography sx={{ fontFamily: "Poppins", fontWeight: 800, fontSize: "2rem", color: NAVY, lineHeight: 1 }}>{value}</Typography>
      <Typography sx={{ fontFamily: "Poppins", fontSize: "0.78rem", fontWeight: 600, color: NAVY2, mt: 0.5, mb: 0.25 }}>{label}</Typography>
      <Typography sx={{ fontFamily: "Poppins", fontSize: "0.68rem", color: GRAY2 }}>{note}</Typography>
    </CardContent>
  </Card>
);

// ── Metric row ─────────────────────────────────────────────────────────────────
export const MetricRow: React.FC<{ label: string; value: string | number; sub?: string; color?: string; last?: boolean }> = ({ label, value, sub, color = "#0D9488", last }) => (
  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.1, borderBottom: last ? "none" : `1px solid ${BORDER}` }}>
    <Typography sx={{ fontFamily: "Poppins", fontSize: "0.8rem", color: GRAY }}>{label}</Typography>
    <Box sx={{ textAlign: "right" }}>
      <Typography sx={{ fontFamily: "Poppins", fontWeight: 700, fontSize: "0.9rem", color }}>{value}</Typography>
      {sub && <Typography sx={{ fontFamily: "Poppins", fontSize: "0.65rem", color: GRAY2 }}>{sub}</Typography>}
    </Box>
  </Box>
);
