import React from "react";
import { Box, Skeleton } from "@mui/material";

const EmployeeSkeletonCard: React.FC = () => (
  <Box sx={{
    bgcolor: "#fff", border: "1px solid #E8EAED", borderRadius: "20px",
    overflow: "hidden", display: "flex", flexDirection: "column",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  }}>
    {/* Top strip */}
    <Skeleton variant="rectangular" height={4} sx={{ transform: "none" }} />

    {/* Header */}
    <Box sx={{
      px: 2.5, pt: 2.5, pb: 2,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5,
    }}>
      {/* Avatar ring */}
      <Skeleton variant="circular" width={76} height={76} />

      {/* Name + email */}
      <Box sx={{ textAlign: "center", width: "100%" }}>
        <Skeleton variant="text" width="55%" height={18} sx={{ mx: "auto" }} />
        <Skeleton variant="text" width="70%" height={13} sx={{ mx: "auto", mt: 0.5 }} />
      </Box>

      {/* Role pill */}
      <Skeleton variant="rounded" width={90} height={24} sx={{ borderRadius: "999px" }} />
    </Box>

    {/* Divider */}
    <Box sx={{ mx: 2.5, height: "1px", bgcolor: "#F1F5F9" }} />

    {/* Body */}
    <Box sx={{ px: 2.5, pt: 1.75, pb: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Department row */}
      <Skeleton variant="rounded" height={34} sx={{ borderRadius: "10px" }} />

      {/* Footer */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Skeleton variant="rounded" width={60} height={20} sx={{ borderRadius: "999px" }} />
        <Skeleton variant="text" width={72} height={13} />
      </Box>
    </Box>
  </Box>
);

export default EmployeeSkeletonCard;
