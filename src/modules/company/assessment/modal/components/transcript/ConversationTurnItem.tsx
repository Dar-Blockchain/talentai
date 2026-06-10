import React from "react";
import { Box, Divider } from "@mui/material";
import { ConversationTurn } from "../../types";
import TurnHeader      from "./TurnHeader";
import { QuestionBubble, ResponseBubble } from "./ChatBubbles";
import EvaluationMetrics from "./EvaluationMetrics";

interface Props {
  turn:      ConversationTurn;
  index:     number;
  isLast:    boolean;
}

const ConversationTurnItem: React.FC<Props> = ({ turn, index, isLast }) => (
  <Box>
    <TurnHeader index={index} targetArea={turn.targetArea} timestamp={turn.timestamp} />
    {turn.question && <QuestionBubble question={turn.question} />}
    {turn.response && <ResponseBubble response={turn.response} />}
    {turn.evaluation && <EvaluationMetrics evaluation={turn.evaluation} />}
    {!isLast && <Divider sx={{ mt: 2, borderColor: "#F3F4F6" }} />}
  </Box>
);

export default ConversationTurnItem;
