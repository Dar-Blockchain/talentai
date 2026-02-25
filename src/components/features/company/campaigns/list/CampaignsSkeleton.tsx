import React, { memo } from "react";
import { Box, Skeleton } from "@mui/material";

interface CampaignsSkeletonProps {
  count?: number;
}

const CampaignsSkeleton: React.FC<CampaignsSkeletonProps> = ({ count = 6 }) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)",
        },
        gap: 3,
        mt: 3,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          sx={{
            bgcolor: "#fff",
            borderRadius: 3,
            border: "1px solid #E5E7EB",
            overflow: "hidden",
          }}
        >
          {/* Top content */}
          <Box sx={{ p: 3 }}>
            {/* Status + type chips */}
            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
              <Skeleton variant="rounded" width={60} height={22} />
              <Skeleton variant="rounded" width={70} height={22} />
            </Box>

            {/* Title */}
            <Skeleton variant="text" width="80%" height={22} />

            {/* Description */}
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="90%" height={16} />

            {/* Modules */}
            <Box sx={{ display: "flex", gap: 0.7, mt: 2, flexWrap: "wrap" }}>
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton
                  key={j}
                  variant="rounded"
                  width={60}
                  height={24}
                />
              ))}
            </Box>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              px: 3,
              py: 2,
              bgcolor: "#F9FAFB",
              borderTop: "1px solid #E5E7EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Skeleton variant="text" width={120} height={16} />
            <Skeleton variant="rounded" width={60} height={28} />
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default memo(CampaignsSkeleton);