import React from "react";
import { Box, Typography, Skeleton } from "@mui/material";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import StarOutlined from "@mui/icons-material/StarOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUp";
import AssignmentIndOutlined from "@mui/icons-material/AssignmentIndOutlined";

interface Props {
  metrics: { totalApplicants: number; totalJobPosts: number; avgCVScore: number; topCVScore: number } | null;
}

const STATS = [
  { key: "totalApplicants", icon: PeopleOutlined,          label: "Total Applicants", color: "#0D9488", bg: "#F0FDFA",  fmt: (v: number) => v },
  { key: "totalJobPosts",   icon: AssignmentIndOutlined,   label: "Job Posts",        color: "#10B981", bg: "#F0FDF4",  fmt: (v: number) => v },
  { key: "avgCVScore",      icon: StarOutlined,            label: "Avg CV Score",     color: "#6366F1", bg: "#EEF2FF",  fmt: (v: number) => v ? `${v}%` : "N/A" },
  { key: "topCVScore",      icon: TrendingUpOutlined,      label: "Top CV Score",     color: "#6366F1", bg: "#EEF2FF",  fmt: (v: number) => v ? `${v}%` : "N/A" },
];

const ApplicationMetrics: React.FC<Props> = ({ metrics }) => (
  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
    {STATS.map(({ key, icon: Icon, label, color, bg, fmt }) => (
      <Box key={key} sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ width: 42, height: 42, borderRadius: "10px", bgcolor: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon sx={{ fontSize: 20, color }} />
        </Box>
        <Box>
          {!metrics ? (
            <Skeleton variant="text" width={50} height={28} />
          ) : (
            <Typography sx={{ fontSize: "1.4rem", fontWeight: 800, color: "#111827", lineHeight: 1 }}>
              {fmt((metrics as any)[key])}
            </Typography>
          )}
          <Typography sx={{ fontSize: "0.68rem", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", mt: 0.4 }}>
            {label}
          </Typography>
        </Box>
      </Box>
    ))}
  </Box>
);

export default ApplicationMetrics;
