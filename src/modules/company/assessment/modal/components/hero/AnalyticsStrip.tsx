import React from "react";
import { Box } from "@mui/material";
import AccessTimeOutlined        from "@mui/icons-material/AccessTimeOutlined";
import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import TrendingUpOutlined        from "@mui/icons-material/TrendingUpOutlined";
import VolumeOffOutlined         from "@mui/icons-material/VolumeOffOutlined";
import { fmtDuration } from "@/modules/company/assessment/detail/components/constants";
import { PostAssessmentData } from "../../types";
import { InfoChip, TEAL } from "../assessmentAtoms";

interface Props {
  analytics: PostAssessmentData["analytics"];
}

const AnalyticsStrip: React.FC<Props> = ({ analytics }) => {
  if (!analytics) return null;
  return (
    <Box sx={{ px: 3.5, pb: 2.5, display: "flex", flexWrap: "wrap", gap: 0.75 }}>
      {analytics.duration !== undefined && (
        <InfoChip icon={<AccessTimeOutlined sx={{ fontSize: 12 }} />} label={fmtDuration(analytics.duration)} />
      )}
      {analytics.messageCount !== undefined && (
        <InfoChip icon={<ChatBubbleOutlineOutlined sx={{ fontSize: 12 }} />} label={`${analytics.messageCount} exchanges`} />
      )}
      {analytics.completedAreas !== undefined && analytics.totalAreas !== undefined && (
        <InfoChip icon={<TrendingUpOutlined sx={{ fontSize: 12 }} />} label={`${analytics.completedAreas}/${analytics.totalAreas} areas`} iconColor={TEAL} />
      )}
      {(analytics.silenceEvents ?? 0) > 0 && (
        <InfoChip icon={<VolumeOffOutlined sx={{ fontSize: 12 }} />} label={`${analytics.silenceEvents} silence${analytics.silenceEvents! > 1 ? "s" : ""}`} iconColor="#D97706" />
      )}
      {analytics.averageResponseLength !== undefined && (
        <InfoChip icon={<ChatBubbleOutlineOutlined sx={{ fontSize: 12 }} />} label={`~${analytics.averageResponseLength} words`} />
      )}
    </Box>
  );
};

export default AnalyticsStrip;
