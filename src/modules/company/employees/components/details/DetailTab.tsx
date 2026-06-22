import React, { memo, useMemo } from "react";
import { Box, Typography } from "@mui/material";

const PURPLE = "#8310FF";

const BASE_SX = {
  display: "flex", alignItems: "center", gap: 0.875,
  px: 2, py: 0.875, borderRadius: "10px", cursor: "pointer",
  transition: "all 0.18s ease",
} as const;

const ICON_SX = { display: "flex", "& svg": { fontSize: 16 } } as const;

interface DetailTabProps {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const DetailTab: React.FC<DetailTabProps> = memo(({ active, label, icon, onClick }) => {
  const sx = useMemo(() => ({
    ...BASE_SX,
    bgcolor: active ? "#fff" : "transparent",
    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
    color: active ? PURPLE : "#6B7280",
    "&:hover": !active ? { bgcolor: "#EAECF0" } : {},
  }), [active]);

  const labelSx = useMemo(() => ({
    fontSize: "13px", fontWeight: 700,
    color: active ? "#111827" : "#6B7280",
    whiteSpace: "nowrap",
  }), [active]);

  return (
    <Box onClick={onClick} sx={sx}>
      <Box sx={ICON_SX}>{icon}</Box>
      <Typography sx={labelSx}>{label}</Typography>
    </Box>
  );
});

DetailTab.displayName = "DetailTab";
export default DetailTab;
