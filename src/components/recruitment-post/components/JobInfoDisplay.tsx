import React from "react";
import { Box, Typography } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import WorkIcon from "@mui/icons-material/Work";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const GREEN_MAIN = "#00FF9D";

interface JobInfoDisplayProps {
  jobDetails: {
    location: string;
    salary: {
      currency: string;
      min: number;
      max: number;
    };
    employmentType: string;
    experienceLevel: string;
  };
}

const JobInfoDisplay: React.FC<JobInfoDisplayProps> = ({ jobDetails }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        mb: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <LocationOnIcon sx={{ color: GREEN_MAIN, fontSize: 20 }} />
        <Typography
          variant="body2"
          sx={{ color: "#1E293B", fontWeight: 600 }}
        >
          {jobDetails.location}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <AttachMoneyIcon sx={{ color: GREEN_MAIN, fontSize: 20 }} />
        <Typography
          variant="body2"
          sx={{ color: "#1E293B", fontWeight: 600 }}
        >
          {jobDetails.salary.currency}
          {jobDetails.salary.min.toLocaleString()} -{" "}
          {jobDetails.salary.currency}
          {jobDetails.salary.max.toLocaleString()}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <WorkIcon sx={{ color: GREEN_MAIN, fontSize: 20 }} />
        <Typography
          variant="body2"
          sx={{ color: "#1E293B", fontWeight: 600 }}
        >
          {jobDetails.employmentType}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TrendingUpIcon sx={{ color: GREEN_MAIN, fontSize: 20 }} />
        <Typography
          variant="body2"
          sx={{ color: "#1E293B", fontWeight: 600 }}
        >
          {jobDetails.experienceLevel}
        </Typography>
      </Box>
    </Box>
  );
};

export default JobInfoDisplay;