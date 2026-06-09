import React from "react";
import { Box, Typography } from "@mui/material";
import HourglassEmptyOutlined from "@mui/icons-material/HourglassEmptyOutlined";
import VerifiedOutlined       from "@mui/icons-material/VerifiedOutlined";
import { fmtDate } from "@/modules/company/assessment/detail/components/constants";
import { PostAssessmentData } from "../../types";

interface Props {
  recruiterReview: PostAssessmentData["recruiterReview"];
}

const RecruiterReviewCard: React.FC<Props> = ({ recruiterReview }) => {
  if (!recruiterReview) return null;

  if (recruiterReview.reviewed) {
    return (
      <Box sx={{ mx: 3.5, mb: 2.5, px: 1.75, py: 1.125, borderRadius: "12px", bgcolor: "#F0FDF4", border: "1px solid #BBF7D0", display: "flex", alignItems: "flex-start", gap: 1 }}>
        <VerifiedOutlined sx={{ fontSize: 14, color: "#059669", mt: "1px", flexShrink: 0 }} />
        <Box>
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#059669" }}>
            Reviewed{recruiterReview.reviewedAt ? ` · ${fmtDate(recruiterReview.reviewedAt)}` : ""}
          </Typography>
          {recruiterReview.feedback && (
            <Typography sx={{ fontSize: "0.72rem", color: "#065F46", mt: 0.25 }}>{recruiterReview.feedback}</Typography>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ mx: 3.5, mb: 2.5, px: 1.75, py: 1, borderRadius: "12px", bgcolor: "#FFFBEB", border: "1px solid #FDE68A", display: "flex", alignItems: "center", gap: 0.875 }}>
      <HourglassEmptyOutlined sx={{ fontSize: 13, color: "#D97706", flexShrink: 0 }} />
      <Typography sx={{ fontSize: "0.72rem", fontWeight: 600, color: "#92400E" }}>Pending recruiter review</Typography>
    </Box>
  );
};

export default RecruiterReviewCard;
