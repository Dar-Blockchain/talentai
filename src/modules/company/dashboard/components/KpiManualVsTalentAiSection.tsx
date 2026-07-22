"use client";
import React, { memo, useState } from "react";
import { TrendRangeFilter, type TrendRangeTab } from "./KpiAtoms";
import KpiManualVsTalentAiHours from "./KpiManualVsTalentAiHours";
import KpiManualVsTalentAiCost from "./KpiManualVsTalentAiCost";

interface Props { postId?: string }

// Hours and Cost are two views of the same underlying comparison (manual vs
// TalentAI), so they share one range filter instead of each carrying its own —
// changing the period moves both together rather than leaving one stale.
const KpiManualVsTalentAiSection = memo<Props>(({ postId }) => {
  const [tab, setTab] = useState<TrendRangeTab>("month");
  const [rangeValue, setRangeValue] = useState<number>(3);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <TrendRangeFilter tab={tab} value={rangeValue} onChange={(newTab, newValue) => { setTab(newTab); setRangeValue(newValue); }} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
        <div className="lg:col-span-2">
          <KpiManualVsTalentAiHours postId={postId} tab={tab} rangeValue={rangeValue} />
        </div>
        <div className="lg:col-span-1">
          <KpiManualVsTalentAiCost postId={postId} tab={tab} rangeValue={rangeValue} />
        </div>
      </div>
    </div>
  );
});
KpiManualVsTalentAiSection.displayName = "KpiManualVsTalentAiSection";
export default KpiManualVsTalentAiSection;
