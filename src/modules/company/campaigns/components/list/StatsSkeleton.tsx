"use client";

import React, { memo } from "react";
import { Box, Skeleton } from "@mui/material";

const GRID_SX = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" } as const,
  gap: 2,
} as const;

const CARD_SX = {
  backgroundColor: "#fff",
  borderRadius: 2.5,
  px: 2, py: 1.75,
  border: "1px solid #f3f4f6",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1.5,
} as const;

const LEFT_SX = { display: "flex", alignItems: "center", gap: 1.5 } as const;
const VALUE_COL_SX = { display: "flex", flexDirection: "column", gap: 0.5 } as const;

interface StatsSkeletonProps {
  count?: number;
}

const StatsSkeleton = memo<StatsSkeletonProps>(({ count = 4 }) => (
  <Box sx={GRID_SX}>
    {Array.from({ length: count }).map((_, i) => (
      <Box key={i} sx={CARD_SX}>
        <Box sx={LEFT_SX}>
          <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 2 }} />
          <Box sx={VALUE_COL_SX}>
            <Skeleton variant="text" width={48} height={28} />
            <Skeleton variant="text" width={60} height={14} />
          </Box>
        </Box>
      </Box>
    ))}
  </Box>
));
StatsSkeleton.displayName = "StatsSkeleton";

export default StatsSkeleton;
