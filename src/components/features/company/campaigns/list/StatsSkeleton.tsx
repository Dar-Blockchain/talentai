"use client";

import React, { memo } from "react";
import { Box, Skeleton } from "@mui/material";

interface StatsSkeletonProps {
  count?: number;
}

const StatsSkeleton: React.FC<StatsSkeletonProps> = ({ count = 4 }) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
        gap: 2,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          sx={{
            backgroundColor: "#fff",
            borderRadius: 2.5,
            px: 2,
            py: 1.75,
            border: "1px solid #f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          {/* Left section */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {/* Icon skeleton */}
            <Skeleton
              variant="rounded"
              width={40}
              height={40}
              sx={{ borderRadius: 2 }}
            />

            {/* Value + label */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {/* Value */}
              <Skeleton variant="text" width={48} height={28} />

              {/* Label */}
              <Skeleton variant="text" width={60} height={14} />
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default memo(StatsSkeleton);