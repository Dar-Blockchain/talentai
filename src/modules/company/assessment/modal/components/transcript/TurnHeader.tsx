import React from "react";
import { fmtDate } from "@/modules/company/assessment/constants";

interface Props {
  index:      number;
  targetArea: string | undefined;
  timestamp:  string | undefined;
}

const TurnHeader: React.FC<Props> = ({ index, targetArea, timestamp }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="w-[22px] h-[22px] rounded-full bg-violet-700 flex items-center justify-center shrink-0">
      <span className="text-[0.58rem] font-extrabold text-white leading-none">{index + 1}</span>
    </div>
    {targetArea && (
      <span className="h-5 px-2 rounded-full border bg-teal-50 text-teal-700 border-teal-200 text-[0.67rem] font-semibold capitalize flex items-center">
        {targetArea.replace(/_/g, " ")}
      </span>
    )}
    {timestamp && (
      <span className="text-[0.65rem] text-slate-300 font-medium ml-auto">{fmtDate(timestamp)}</span>
    )}
  </div>
);

export default TurnHeader;
