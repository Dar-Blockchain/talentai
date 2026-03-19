import React from "react";
import { Box, Skeleton } from "@mui/material";

const DepartmentSkeletonCard: React.FC = () => (
  <Box
    sx={{
      bgcolor: "#fff",
      border: "1px solid #E5E7EB",
      borderRadius: 3,
      p: 3,
      display: "flex",
      flexDirection: "column",
      gap: 2,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Skeleton variant="rounded" width={42} height={42} />
      <Skeleton variant="text" width={140} height={20} />
    </Box>
    <Skeleton variant="text" width="100%" height={14} />
    <Skeleton variant="text" width="80%" height={14} />
    <Skeleton variant="text" width="60%" height={14} />
    <Box sx={{ pt: 1.5, borderTop: "1px solid #F3F4F6" }}>
      <Skeleton variant="text" width={120} height={12} />
    </Box>
  </Box>
);

export default DepartmentSkeletonCard;
