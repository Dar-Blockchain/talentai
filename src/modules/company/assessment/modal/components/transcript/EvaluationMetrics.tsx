import React from "react";
import { ConversationTurn } from "../../types";
import { ScoreBar, scoreTheme } from "../ui";

interface Props {
  evaluation: NonNullable<ConversationTurn["evaluation"]>;
}

const EvaluationMetrics: React.FC<Props> = ({ evaluation }) => {
  const qSt = evaluation.qualityScore != null ? scoreTheme(evaluation.qualityScore) : null;
  return (
    <div className="ml-[34px] flex flex-col gap-1.5">
      {qSt && evaluation.qualityScore != null && (
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-[0.63rem] text-slate-400 font-bold uppercase tracking-widest">Response Quality</span>
            <span className={`text-[0.72rem] font-extrabold ${qSt.textCls}`}>{evaluation.qualityScore}%</span>
          </div>
          <ScoreBar value={evaluation.qualityScore} color={qSt.color} height={5} />
        </div>
      )}
      <div className="flex gap-1.5 flex-wrap">
        {evaluation.answeredQuestion != null && (
          <span className={`h-5 px-1.5 rounded-full border text-[0.65rem] font-semibold flex items-center ${
            evaluation.answeredQuestion
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}>
            {evaluation.answeredQuestion ? "Answered" : "Not answered"}
          </span>
        )}
        {evaluation.completeness && (
          <span className="h-5 px-1.5 rounded-full border border-slate-100 bg-slate-50 text-slate-500 text-[0.65rem] font-semibold flex items-center">
            {evaluation.completeness}
          </span>
        )}
        {evaluation.depthLevel && (
          <span className="h-5 px-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-[0.65rem] font-semibold flex items-center">
            {evaluation.depthLevel}
          </span>
        )}
      </div>
    </div>
  );
};

export default EvaluationMetrics;
