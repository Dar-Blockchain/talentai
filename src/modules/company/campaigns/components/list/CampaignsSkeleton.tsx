import React, { memo } from "react";
import { Box, Skeleton } from "@mui/material";

const GRID_SX = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    md: "repeat(2, 1fr)",
    lg: "repeat(3, 1fr)",
  },
  gap: 3,
  mt: 3,
} as const;

const CARD_SX = {
  bgcolor: "#fff",
  borderRadius: 3,
  border: "1px solid #E5E7EB",
  overflow: "hidden",
} as const;

const FOOTER_SX = {
  px: 3, py: 2,
  bgcolor: "#F9FAFB",
  borderTop: "1px solid #E5E7EB",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
} as const;

const MODULE_CHIPS_3 = Array.from({ length: 3 });

interface CampaignsSkeletonProps {
  count?: number;
}

const CampaignsSkeleton = memo<CampaignsSkeletonProps>(({ count = 6 }) => (
  <Box sx={GRID_SX}>
    {Array.from({ length: count }).map((_, i) => (
      <Box key={i} sx={CARD_SX}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <Skeleton variant="rounded" width={60} height={22} />
            <Skeleton variant="rounded" width={70} height={22} />
          </Box>
          <Skeleton variant="text" width="80%" height={22} />
          <Skeleton variant="text" width="100%" height={16} />
          <Skeleton variant="text" width="90%" height={16} />
          <Box sx={{ display: "flex", gap: 0.7, mt: 2, flexWrap: "wrap" }}>
            {MODULE_CHIPS_3.map((_, j) => (
              <Skeleton key={j} variant="rounded" width={60} height={24} />
            ))}
          </Box>
        </Box>
        <Box sx={FOOTER_SX}>
          <Skeleton variant="text" width={120} height={16} />
          <Skeleton variant="rounded" width={60} height={28} />
        </Box>
      </Box>
    ))}
  </Box>
));
CampaignsSkeleton.displayName = "CampaignsSkeleton";

export default CampaignsSkeleton;
