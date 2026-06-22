import React from "react";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import { PostAssessmentData } from "../types";
import AreaCoverageCard from "./area-coverage/AreaCoverageCard";

interface Props {
  coverage:             PostAssessmentData["coverage"];
  overallCoverageLabel: string;
}

const CoverageTab: React.FC<Props> = ({ coverage, overallCoverageLabel }) => {
  const areas = coverage?.areas || {};

  return (
    <div className="p-6 flex flex-col gap-5">
      {coverage?.overall != null && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">
            {overallCoverageLabel}
          </span>
          <span className="text-[0.78rem] font-extrabold h-6 px-3 rounded-full border bg-teal-50 text-teal-700 border-teal-200 flex items-center">
            {Math.round(coverage.overall)}%
          </span>
          {coverage.nextRecommendedArea && (
            <span className="flex items-center gap-1 h-6 px-3 rounded-full border bg-violet-50 text-violet-700 border-violet-200 text-[0.7rem] font-semibold capitalize">
              <TrendingUpOutlined style={{ fontSize: 11 }} />
              Next: {coverage.nextRecommendedArea.replace(/_/g, " ")}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(areas).map(([area, data]) => (
          <AreaCoverageCard key={area} area={area} data={data} />
        ))}
      </div>
    </div>
  );
};

export default CoverageTab;
