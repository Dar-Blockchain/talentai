import React from "react";
import { Box, Typography } from "@mui/material";
import { Button } from "@/modules/shared/ui/shadcn/button";
import VideoCallOutlined from "@mui/icons-material/VideoCallOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTime";
import LinkOutlined from "@mui/icons-material/LinkOutlined";
import { T, TBG } from "../utils/constants";

interface InterviewBannerProps {
  title: string;
  joinLabel: string;
  interviewDate?: string | null;
  interviewTime?: string | null;
  interviewLink?: string | null;
}

const InterviewBanner: React.FC<InterviewBannerProps> = ({ title, joinLabel, interviewDate, interviewTime, interviewLink }) => (
  <Box sx={{ bgcolor: T, borderRadius: "16px", p: 2.5, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center", boxShadow: `0 4px 16px ${T}40` }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <VideoCallOutlined sx={{ fontSize: 22, color: "#fff" }} />
      <Typography sx={{ fontWeight: 700, color: "#fff", fontSize: "1rem" }}>{title}</Typography>
    </Box>
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, ml: { xs: 0, sm: "auto" } }}>
      {interviewDate && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <CalendarTodayOutlined sx={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }} />
          <Typography sx={{ fontSize: "0.82rem", color: "#fff", fontWeight: 600 }}>{interviewDate}</Typography>
        </Box>
      )}
      {interviewTime && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <AccessTimeOutlined sx={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }} />
          <Typography sx={{ fontSize: "0.82rem", color: "#fff", fontWeight: 600 }}>{interviewTime}</Typography>
        </Box>
      )}
      {interviewLink && (
        <Button
          variant="default"
          size="sm"
          onClick={() => window.open(interviewLink, "_blank")}
          className="rounded-lg px-3.5 text-[0.78rem] font-bold shadow-none"
          style={{ backgroundColor: "#fff", color: T }}
        >
          <LinkOutlined sx={{ fontSize: 14 }} />
          {joinLabel}
        </Button>
      )}
    </Box>
  </Box>
);

export default InterviewBanner;
