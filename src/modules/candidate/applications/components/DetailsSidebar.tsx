import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import WorkOutlineOutlined from "@mui/icons-material/WorkOutline";
import BusinessCenterOutlined from "@mui/icons-material/BusinessCenterOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import { fmtDate } from "../utils/constants";

interface DetailsSidebarProps {
  title: string;
  location?: string;
  employmentType?: string;
  workMode?: string;
  appliedAt?: string;
  appliedOnLabel: (date: string) => string;
}

const DetailsSidebar: React.FC<DetailsSidebarProps> = ({ title, location, employmentType, workMode, appliedAt, appliedOnLabel }) => (
  <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
    <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", mb: 1.25 }}>
      {title}
    </Typography>
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
      {location && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LocationOnOutlined sx={{ fontSize: 14, color: "#9CA3AF", flexShrink: 0 }} />
          <Typography sx={{ fontSize: "0.78rem", color: "#374151" }}>{location}</Typography>
        </Box>
      )}
      {employmentType && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WorkOutlineOutlined sx={{ fontSize: 14, color: "#9CA3AF", flexShrink: 0 }} />
          <Typography sx={{ fontSize: "0.78rem", color: "#374151" }}>{employmentType}</Typography>
        </Box>
      )}
      {workMode && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <BusinessCenterOutlined sx={{ fontSize: 14, color: "#9CA3AF", flexShrink: 0 }} />
          <Typography sx={{ fontSize: "0.78rem", color: "#374151" }}>{workMode}</Typography>
        </Box>
      )}
      <Divider />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <CalendarTodayOutlined sx={{ fontSize: 14, color: "#9CA3AF", flexShrink: 0 }} />
        <Typography sx={{ fontSize: "0.75rem", color: "#6B7280" }}>{appliedOnLabel(fmtDate(appliedAt))}</Typography>
      </Box>
    </Box>
  </Box>
);

export default DetailsSidebar;
