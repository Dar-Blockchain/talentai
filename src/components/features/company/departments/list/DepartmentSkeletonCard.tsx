import React from "react";
import { Box, Skeleton } from "@mui/material";

const DepartmentSkeletonCard: React.FC = () => (
  <Box
    sx={{
      bgcolor: "#fff",
      border: "1px solid #E5E7EB",
      borderRadius: "16px",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "hidden",
      position: "relative",
    }}
  >
    {/* Accent bar placeholder */}
    <Skeleton variant="rectangular" width={4} sx={{ position: "absolute", left: 0, top: 0, bottom: 0, height: "100%", borderRadius: "16px 0 0 16px" }} />

    {/* Body */}
    <Box sx={{ p: 2.5, pl: 3, flex: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: "11px", flexShrink: 0 }} />
        <Skeleton variant="text" width={150} height={20} />
      </Box>
      <Skeleton variant="text" width="100%" height={14} />
      <Skeleton variant="text" width="75%" height={14} />
    </Box>

    {/* Footer */}
    <Box sx={{ px: 2.5, pl: 3, py: 1.75, bgcolor: "#F9FAFB", borderTop: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Skeleton variant="text" width={100} height={14} />
      <Skeleton variant="rounded" width={60} height={26} sx={{ borderRadius: "8px" }} />
    </Box>
  </Box>
);

export default DepartmentSkeletonCard;
