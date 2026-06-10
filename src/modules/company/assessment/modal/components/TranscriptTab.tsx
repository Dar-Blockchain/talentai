import React from "react";
import { Box } from "@mui/material";
import { ConversationTurn } from "../types";
import ConversationTurnItem from "./transcript/ConversationTurnItem";

interface Props {
  conversation: ConversationTurn[];
}

const TranscriptTab: React.FC<Props> = ({ conversation }) => (
  <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
    {conversation.map((turn, i) => (
      <ConversationTurnItem key={i} turn={turn} index={i} isLast={i === conversation.length - 1} />
    ))}
  </Box>
);

export default TranscriptTab;
