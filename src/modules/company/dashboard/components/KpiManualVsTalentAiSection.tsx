"use client";
import React, { memo, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Scale as ScaleOutlined } from "lucide-react";
import type { RootState } from "@/store/store";
import { ZoneHeading, type TrendRangeTab } from "./KpiAtoms";
import KpiManualVsTalentAiHours from "./KpiManualVsTalentAiHours";

interface Props { postId?: string }

// Hours and cost used to be two separate cards sharing one filter; they're now
// merged into a single card (KpiManualVsTalentAiHours renders both), so this
// wrapper just owns the zone heading — the range filter itself now lives
// inside that card's header, above its title.
const KpiManualVsTalentAiSection = memo<Props>(({ postId }) => {
  const { t } = useTranslation("dashboard");
  const [tab, setTab] = useState<TrendRangeTab>("month");
  const [rangeValue, setRangeValue] = useState<number>(3);
  const createdAt = useSelector((s: RootState) => s.user.connectedUser.profile?.createdAt);

  return (
    <div className="flex flex-col gap-3">
      <ZoneHeading icon={ScaleOutlined} label={t("pages.kpi.zone_manual_vs_ai_title", "Manual vs TalentAI")} color="#0D9488" />
      <KpiManualVsTalentAiHours
        postId={postId}
        tab={tab}
        rangeValue={rangeValue}
        onRangeChange={(newTab, newValue) => { setTab(newTab); setRangeValue(newValue); }}
        createdAt={createdAt}
      />
    </div>
  );
});
KpiManualVsTalentAiSection.displayName = "KpiManualVsTalentAiSection";
export default KpiManualVsTalentAiSection;
