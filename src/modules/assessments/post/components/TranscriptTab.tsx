import React from "react";
import { Box, Chip, Divider, Typography } from "@mui/material";
import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import PersonOutlined            from "@mui/icons-material/PersonOutlined";
import { fmtDate, scoreStyle } from "@/components/features/company/interviews/list/InterviewCard";
import { ConversationTurn } from "../types";
import { Bar, TEAL, TEAL_BG, TEAL_BORDER } from "./assessmentAtoms";

interface Props {
  conversation: ConversationTurn[];
}

const TranscriptTab: React.FC<Props> = ({ conversation }) => (
  <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
    {conversation.map((turn, i) => (
      <Box key={i}>
        {/* Turn header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.25 }}>
          <Box sx={{ width: 22, height: 22, borderRadius: "50%", bgcolor: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Typography sx={{ fontSize: "0.58rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{i + 1}</Typography>
          </Box>
          {turn.targetArea && (
            <Chip label={turn.targetArea.replace(/_/g, " ")} size="small"
              sx={{ height: 20, fontSize: "0.67rem", fontWeight: 600, bgcolor: TEAL_BG, color: TEAL, border: `1px solid ${TEAL_BORDER}`, textTransform: "capitalize" }} />
          )}
          {turn.timestamp && (
            <Typography sx={{ fontSize: "0.65rem", color: "#D1D5DB", ml: "auto", fontWeight: 500 }}>{fmtDate(turn.timestamp)}</Typography>
          )}
        </Box>

        {/* AI question bubble — left aligned */}
        {turn.question && (
          <Box sx={{ display: "flex", gap: 1.125, alignItems: "flex-start", mb: 1.125 }}>
            <Box sx={{ width: 26, height: 26, borderRadius: "50%", bgcolor: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ChatBubbleOutlineOutlined sx={{ fontSize: 12, color: "#fff" }} />
            </Box>
            <Box sx={{ flex: 1, px: 1.75, py: 1.375, borderRadius: "4px 14px 14px 14px", bgcolor: "#F5F3FF", border: "1px solid #EDE9FE" }}>
              <Typography sx={{ fontSize: "0.78rem", color: "#5B21B6", lineHeight: 1.7, fontStyle: "italic" }}>{turn.question}</Typography>
            </Box>
          </Box>
        )}

        {/* Candidate response bubble — right aligned */}
        {turn.response && (
          <Box sx={{ display: "flex", gap: 1.125, alignItems: "flex-start", flexDirection: "row-reverse", mb: 1 }}>
            <Box sx={{ width: 26, height: 26, borderRadius: "50%", bgcolor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <PersonOutlined sx={{ fontSize: 13, color: "#6B7280" }} />
            </Box>
            <Box sx={{ flex: 1, px: 1.75, py: 1.375, borderRadius: "14px 4px 14px 14px", bgcolor: "#FFFFFF", border: "1px solid #E5E7EB" }}>
              <Typography sx={{ fontSize: "0.82rem", color: "#1F2937", lineHeight: 1.75 }}>{turn.response}</Typography>
            </Box>
          </Box>
        )}

        {/* Evaluation row */}
        {turn.evaluation && (
          <Box sx={{ ml: 4.25, display: "flex", flexDirection: "column", gap: 0.75 }}>
            {turn.evaluation.qualityScore != null && (
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                  <Typography sx={{ fontSize: "0.63rem", color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Response Quality
                  </Typography>
                  <Typography sx={{ fontSize: "0.72rem", fontWeight: 800, color: scoreStyle(turn.evaluation.qualityScore).color }}>
                    {turn.evaluation.qualityScore}%
                  </Typography>
                </Box>
                <Bar value={turn.evaluation.qualityScore} color={scoreStyle(turn.evaluation.qualityScore).color} height={5} />
              </Box>
            )}
            <Box sx={{ display: "flex", gap: 0.625, flexWrap: "wrap" }}>
              {turn.evaluation.answeredQuestion != null && (
                <Chip
                  label={turn.evaluation.answeredQuestion ? "Answered" : "Not answered"}
                  size="small"
                  sx={{ height: 20, fontSize: "0.65rem", fontWeight: 600,
                    bgcolor: turn.evaluation.answeredQuestion ? "#F0FDF4" : "#FEF2F2",
                    color:  turn.evaluation.answeredQuestion ? "#059669" : "#DC2626",
                    border: `1px solid ${turn.evaluation.answeredQuestion ? "#BBF7D0" : "#FECACA"}` }} />
              )}
              {turn.evaluation.completeness && (
                <Chip label={turn.evaluation.completeness} size="small"
                  sx={{ height: 20, fontSize: "0.65rem", fontWeight: 600, bgcolor: "#F9FAFB", color: "#6B7280", border: "1px solid #F3F4F6" }} />
              )}
              {turn.evaluation.depthLevel && (
                <Chip label={turn.evaluation.depthLevel} size="small"
                  sx={{ height: 20, fontSize: "0.65rem", fontWeight: 600, bgcolor: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }} />
              )}
            </Box>
          </Box>
        )}

        {i < conversation.length - 1 && <Divider sx={{ mt: 2, borderColor: "#F3F4F6" }} />}
      </Box>
    ))}
  </Box>
);

export default TranscriptTab;
