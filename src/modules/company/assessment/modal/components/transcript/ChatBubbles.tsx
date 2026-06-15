import React from "react";
import { Box, Typography } from "@mui/material";
import ChatBubbleOutlineOutlined from "@mui/icons-material/ChatBubbleOutlineOutlined";
import PersonOutlined            from "@mui/icons-material/PersonOutlined";

export const QuestionBubble: React.FC<{ question: string }> = ({ question }) => (
  <Box sx={{ display: "flex", gap: 1.125, alignItems: "flex-start", mb: 1.125 }}>
    <Box sx={{ width: 26, height: 26, borderRadius: "50%", bgcolor: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <ChatBubbleOutlineOutlined sx={{ fontSize: 12, color: "#fff" }} />
    </Box>
    <Box sx={{ flex: 1, px: 1.75, py: 1.375, borderRadius: "4px 14px 14px 14px", bgcolor: "#F5F3FF", border: "1px solid #EDE9FE" }}>
      <Typography sx={{ fontSize: "0.78rem", color: "#5B21B6", lineHeight: 1.7, fontStyle: "italic" }}>{question}</Typography>
    </Box>
  </Box>
);

export const ResponseBubble: React.FC<{ response: string }> = ({ response }) => (
  <Box sx={{ display: "flex", gap: 1.125, alignItems: "flex-start", flexDirection: "row-reverse", mb: 1 }}>
    <Box sx={{ width: 26, height: 26, borderRadius: "50%", bgcolor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <PersonOutlined sx={{ fontSize: 13, color: "#6B7280" }} />
    </Box>
    <Box sx={{ flex: 1, px: 1.75, py: 1.375, borderRadius: "14px 4px 14px 14px", bgcolor: "#FFFFFF", border: "1px solid #E5E7EB" }}>
      <Typography sx={{ fontSize: "0.82rem", color: "#1F2937", lineHeight: 1.75 }}>{response}</Typography>
    </Box>
  </Box>
);
