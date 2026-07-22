"use client";
import React, { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Scale as ScaleOutlined } from "lucide-react";
import { ZoneHeading, TrendRangeFilter, type TrendRangeTab } from "./KpiAtoms";
import KpiManualVsTalentAiHours from "./KpiManualVsTalentAiHours";

interface Props { postId?: string }

// Hours and cost used to be two separate cards sharing one filter; they're now
// merged into a single card (KpiManualVsTalentAiHours renders both), so this
// wrapper just owns the zone heading and the range filter above it — same
// pattern as every other dashboard zone (icon + title + divider via ZoneHeading).
const KpiManualVsTalentAiSection = memo<Props>(({ postId }) => {
  const { t } = useTranslation("dashboard");
  const [tab, setTab] = useState<TrendRangeTab>("month");
  const [rangeValue, setRangeValue] = useState<number>(3);

  return (
    <div className="flex flex-col gap-3">
      <ZoneHeading icon={ScaleOutlined} label={t("pages.kpi.zone_manual_vs_ai_title", "Manual vs TalentAI")} color="#0D9488" />
      <div className="flex justify-end -mt-2">
        <TrendRangeFilter tab={tab} value={rangeValue} onChange={(newTab, newValue) => { setTab(newTab); setRangeValue(newValue); }} />
      </div>
      <KpiManualVsTalentAiHours postId={postId} tab={tab} rangeValue={rangeValue} />
    </div>
  );
});
KpiManualVsTalentAiSection.displayName = "KpiManualVsTalentAiSection";
export default KpiManualVsTalentAiSection;
