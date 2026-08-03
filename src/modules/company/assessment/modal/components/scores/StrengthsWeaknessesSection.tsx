import React from "react";
import { TrendingUp as TrendingUpOutlined, TrendingDown as TrendingDownOutlined } from "lucide-react";
import { PostAssessmentData } from "../../types";

interface Props {
  aiAssessment:   PostAssessmentData["aiAssessment"] | undefined;
  strengthsLabel: string;
  weakAreasLabel: string;
}

const StrengthsWeaknessesSection: React.FC<Props> = ({ aiAssessment, strengthsLabel, weakAreasLabel }) => {
  const hasStrong = (aiAssessment?.strongestAreas?.length ?? 0) > 0;
  const hasWeak   = (aiAssessment?.weakestAreas?.length ?? 0) > 0;
  if (!hasStrong && !hasWeak) return null;

  return (
    <div className="grid grid-cols-2 gap-4">
      {hasStrong && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-3.5 pb-2.5 border-b border-emerald-100">
            <div className="w-5 h-5 rounded-md bg-emerald-100 flex items-center justify-center">
              <TrendingUpOutlined size={12} color="#059669" />
            </div>
            <span className="text-[0.65rem] font-black text-emerald-700 uppercase tracking-widest">
              {strengthsLabel}
            </span>
          </div>
          <div className="px-4 py-3 flex flex-col gap-1.5">
            {aiAssessment!.strongestAreas.map((a, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-[0.79rem] text-emerald-900 capitalize">{a.replace(/_/g, " ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {hasWeak && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-3.5 pb-2.5 border-b border-amber-100">
            <div className="w-5 h-5 rounded-md bg-amber-100 flex items-center justify-center">
              <TrendingDownOutlined size={12} color="#D97706" />
            </div>
            <span className="text-[0.65rem] font-black text-amber-700 uppercase tracking-widest">
              {weakAreasLabel}
            </span>
          </div>
          <div className="px-4 py-3 flex flex-col gap-1.5">
            {aiAssessment!.weakestAreas.map((a, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span className="text-[0.79rem] text-amber-900 capitalize">{a.replace(/_/g, " ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StrengthsWeaknessesSection;
