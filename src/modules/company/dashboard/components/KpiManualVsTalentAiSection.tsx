"use client";
import React, { memo, useState } from "react";
import { TrendRangeFilter, type TrendRangeTab } from "./KpiAtoms";
import KpiManualVsTalentAiHours from "./KpiManualVsTalentAiHours";

interface Props { postId?: string }

// Hours and cost used to be two separate cards sharing one filter; they're now
// merged into a single card (KpiManualVsTalentAiHours renders both), so this
// wrapper just owns the range filter above it.
const KpiManualVsTalentAiSection = memo<Props>(({ postId }) => {
  const [tab, setTab] = useState<TrendRangeTab>("month");
  const [rangeValue, setRangeValue] = useState<number>(3);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <TrendRangeFilter tab={tab} value={rangeValue} onChange={(newTab, newValue) => { setTab(newTab); setRangeValue(newValue); }} />
      </div>
      <KpiManualVsTalentAiHours postId={postId} tab={tab} rangeValue={rangeValue} />
    </div>
  );
});
KpiManualVsTalentAiSection.displayName = "KpiManualVsTalentAiSection";
export default KpiManualVsTalentAiSection;
