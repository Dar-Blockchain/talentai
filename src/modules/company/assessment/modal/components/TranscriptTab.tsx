import React from "react";
import { ConversationTurn } from "../types";
import ConversationTurnItem from "./transcript/ConversationTurnItem";

interface Props {
  conversation: ConversationTurn[];
}

const TranscriptTab: React.FC<Props> = ({ conversation }) => (
  <div className="p-5 flex flex-col gap-6">
    {conversation.map((turn, i) => (
      <ConversationTurnItem key={i} turn={turn} index={i} isLast={i === conversation.length - 1} />
    ))}
  </div>
);

export default TranscriptTab;
