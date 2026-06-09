import React from "react";
import { Box, Chip, Typography } from "@mui/material";
import { scoreStyle } from "@/modules/company/assessment/detail/components/constants";
import { ConversationTurn } from "../../types";
import { Bar } from "../assessmentAtoms";

interface Props {
  evaluation: NonNullable<ConversationTurn["evaluation"]>;
}

const EvaluationMetrics: React.FC<Props> = ({ evaluation }) => (
  <Box sx={{ ml: 4.25, display: "flex", flexDirection: "column", gap: 0.75 }}>
    {evaluation.qualityScore != null && (
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
          <Typography sx={{ fontSize: "0.63rem", color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Response Quality
          </Typography>
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: scoreStyle(evaluation.qualityScore).color }}>
            {evaluation.qualityScore}%
          </Typography>
        </Box>
        <Bar value={evaluation.qualityScore} color={scoreStyle(evaluation.qualityScore).color} height={5} />
      </Box>
    )}
    <Box sx={{ display: "flex", gap: 0.625, flexWrap: "wrap" }}>
      {evaluation.answeredQuestion != null && (
        <Chip
          label={evaluation.answeredQuestion ? "Answered" : "Not answered"}
          size="small"
          sx={{ height: 20, fontSize: "0.65rem", fontWeight: 600,
            bgcolor: evaluation.answeredQuestion ? "#F0FDF4" : "#FEF2F2",
            color:   evaluation.answeredQuestion ? "#059669" : "#DC2626",
            border: `1px solid ${evaluation.answeredQuestion ? "#BBF7D0" : "#FECACA"}` }} />
      )}
      {evaluation.completeness && (
        <Chip label={evaluation.completeness} size="small"
          sx={{ height: 20, fontSize: "0.65rem", fontWeight: 600, bgcolor: "#F9FAFB", color: "#6B7280", border: "1px solid #F3F4F6" }} />
      )}
      {evaluation.depthLevel && (
        <Chip label={evaluation.depthLevel} size="small"
          sx={{ height: 20, fontSize: "0.65rem", fontWeight: 600, bgcolor: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }} />
      )}
    </Box>
  </Box>
);

export default EvaluationMetrics;
