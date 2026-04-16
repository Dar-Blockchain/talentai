import React from "react";
import { Box, Typography } from "@mui/material";

const PURPLE = "#8310FF";

interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  /** Show "Showing X–Y of Z" label on the left. Default: true */
  showInfo?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({ page, total, pageSize, onPageChange, showInfo = true }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  if (totalPages <= 1) return null;

  const NavBtn: React.FC<{ disabled: boolean; onClick: () => void; children: React.ReactNode }> = ({ disabled, onClick, children }) => (
    <Box
      onClick={() => !disabled && onClick()}
      sx={{
        width: 32, height: 32, borderRadius: "9px",
        display: "flex", alignItems: "center", justifyContent: "center",
        bgcolor: disabled ? "#F9FAFB" : "#fff",
        border: "1px solid #E5E7EB",
        cursor: disabled ? "default" : "pointer",
        color: disabled ? "#D1D5DB" : "#374151",
        transition: "all 0.15s",
        userSelect: "none",
        "&:hover": !disabled ? { bgcolor: "#F3F4F6", borderColor: "#D1D5DB" } : {},
      }}
    >
      {children}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 2.5, px: 0.5 }}>

      {/* Info label */}
      {showInfo ? (
        <Typography sx={{ fontSize: "12.5px", color: "#9CA3AF" }}>
          Showing{" "}
          <Box component="span" sx={{ fontWeight: 700, color: "#374151" }}>{from}–{to}</Box>
          {" "}of{" "}
          <Box component="span" sx={{ fontWeight: 700, color: "#374151" }}>{total}</Box>
        </Typography>
      ) : <Box />}

      {/* Page buttons */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <NavBtn disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <Typography sx={{ fontSize: "14px", lineHeight: 1 }}>‹</Typography>
        </NavBtn>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
          const isActive = p === page;
          const isEdge   = p === 1 || p === totalPages;
          const isNear   = Math.abs(p - page) <= 1;

          if (!isEdge && !isNear) {
            if (p === 2 || p === totalPages - 1)
              return <Typography key={p} sx={{ fontSize: "12px", color: "#D1D5DB", px: 0.25, userSelect: "none" }}>…</Typography>;
            return null;
          }

          return (
            <Box key={p} onClick={() => onPageChange(p)} sx={{
              minWidth: 32, height: 32, px: 0.75, borderRadius: "9px",
              display: "flex", alignItems: "center", justifyContent: "center",
              bgcolor: isActive ? PURPLE : "#fff",
              border: `1px solid ${isActive ? PURPLE : "#E5E7EB"}`,
              cursor: "pointer",
              userSelect: "none",
              transition: "all 0.15s",
              "&:hover": !isActive ? { bgcolor: "#F3F4F6", borderColor: "#D1D5DB" } : {},
            }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: isActive ? "#fff" : "#374151" }}>{p}</Typography>
            </Box>
          );
        })}

        <NavBtn disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <Typography sx={{ fontSize: "14px", lineHeight: 1 }}>›</Typography>
        </NavBtn>
      </Box>
    </Box>
  );
};

export default Pagination;
