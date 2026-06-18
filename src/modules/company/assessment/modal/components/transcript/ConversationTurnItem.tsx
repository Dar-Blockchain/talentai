import React from "react";
import { ConversationTurn } from "../../types";
import TurnHeader      from "./TurnHeader";
import { QuestionBubble, ResponseBubble } from "./ChatBubbles";
import EvaluationMetrics from "./EvaluationMetrics";

interface Props {
  turn:   ConversationTurn;
  index:  number;
  isLast: boolean;
}

const ConversationTurnItem: React.FC<Props> = ({ turn, index, isLast }) => (
  <div>
    <TurnHeader index={index} targetArea={turn.targetArea} timestamp={turn.timestamp} />
    {turn.question && <QuestionBubble question={turn.question} />}
    {turn.response && <ResponseBubble response={turn.response} />}
    {turn.evaluation && <EvaluationMetrics evaluation={turn.evaluation} />}
    {!isLast && <div className="mt-4 border-t border-slate-100" />}
  </div>
);

export default ConversationTurnItem;
