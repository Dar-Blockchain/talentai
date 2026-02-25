"use client";

import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import AppButton from "./AppButton";

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limits?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  limits = [6, 12, 18, 24],
}) => {
  const totalPages = Math.ceil(total / limit);

  const renderPageButtons = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }

    return pages.map((p, idx) =>
      typeof p === "number" ? (
        <AppButton
          key={idx}
          label={p.toString()}
          size="medium"
          variant={p === page ? "contained" : "outlined"}
          onClick={() => onPageChange(p)}
          sx={{
            minWidth: 36,
            fontWeight: p === page ? 700 : 500,
          }}
        />
      ) : (
        <Typography
          key={idx}
          sx={{ px: 1, fontSize: 14, color: "#9CA3AF", fontWeight: 500 }}
        >
          {p}
        </Typography>
      )
    );
  };

  return (
    <Box
      sx={{
        mt: 3,
        mb: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 1,
      }}
    >
      {/* Page Buttons */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton
          size="small"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: 2,
            "&:hover": { backgroundColor: "#f3f4f6" },
          }}
        >
          <ChevronLeft fontSize="small" />
        </IconButton>

        {renderPageButtons()}

        <IconButton
          size="small"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: 2,
            "&:hover": { backgroundColor: "#f3f4f6" },
          }}
        >
          <ChevronRight fontSize="small" />
        </IconButton>
      </Box>

      {/* Limit Selector */}
      {onLimitChange && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: 12, color: "#6B7280" }}>Show:</Typography>
          {limits.map((l) => (
            <AppButton
              key={l}
              label={l.toString()}
              size="small"
              variant={l === limit ? "contained" : "outlined"}
              onClick={() => onLimitChange(l)}
              sx={{ minWidth: 36, fontWeight: l === limit ? 600 : 500 }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Pagination;