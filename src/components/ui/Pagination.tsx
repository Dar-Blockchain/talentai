"use client";

import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  limit,
  total,
  onPageChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <Box
      sx={{
        mt: 3,
        mb: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
      }}
    >
      {/* Previous */}
      <IconButton
        size="small"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        sx={{
          width: 32,
          height: 32,
          borderRadius: 2,
          border: "1px solid #E5E7EB",
          color: "#475569",
          "&:hover": {
            backgroundColor: "#F8FAFC",
          },
        }}
      >
        <ChevronLeft fontSize="small" />
      </IconButton>

      {/* Page indicator */}
      <Typography
        sx={{
          fontSize: 12.5,
          color: "#64748B",
          minWidth: 90,
          textAlign: "center",
        }}
      >
        Page{" "}
        <Box component="span" sx={{ color: "#0F172A" }}>
          {page}
        </Box>{" "}
        of {totalPages}
      </Typography>

      {/* Next */}
      <IconButton
        size="small"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        sx={{
          width: 32,
          height: 32,
          borderRadius: 2,
          border: "1px solid #E5E7EB",
          color: "#475569",
          "&:hover": {
            backgroundColor: "#F8FAFC",
          },
        }}
      >
        <ChevronRight fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default Pagination;