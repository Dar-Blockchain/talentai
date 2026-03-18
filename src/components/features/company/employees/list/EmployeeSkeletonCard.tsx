import React from "react";
import { Box, Skeleton } from "@mui/material";

const EmployeeSkeletonCard: React.FC = () => (
  <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: 3, p: 3, display: "flex", flexDirection: "column", gap: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Skeleton variant="circular" width={42} height={42} />
        <Box>
          <Skeleton variant="text" width={120} height={18} />
          <Skeleton variant="text" width={90} height={13} />
        </Box>
      </Box>
      <Skeleton variant="circular" width={28} height={28} />
    </Box>
    <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: "6px" }} />
    <Box sx={{ pt: 1.5, borderTop: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between" }}>
      <Skeleton variant="text" width={60} height={13} />
      <Skeleton variant="text" width={80} height={13} />
    </Box>
  </Box>
);

export default EmployeeSkeletonCard;
