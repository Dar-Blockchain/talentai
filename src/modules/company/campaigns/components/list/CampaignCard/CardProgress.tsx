import React from "react";
import { Users, CheckCircle2 } from "lucide-react";
import { Campaign } from "@/modules/company/campaigns/types/campaign";
import type { CampaignCardData } from "./useCampaignCard";

interface Props {
  campaign: Campaign;
  data: CampaignCardData;
}

const CardProgress: React.FC<Props> = ({ campaign, data }) => {
  const { moduleConf, total, completed, pct, showProgress } = data;

  if (campaign.targetEmployeeCount == null && campaign.completedCount == null) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        {campaign.targetEmployeeCount != null && (
          <span className="flex items-center gap-1.5 text-[12px] text-foreground/60">
            <Users className="size-3.5 shrink-0" />
            <strong className="text-foreground font-bold">{total}</strong>
            {" participants"}
          </span>
        )}
        {campaign.completedCount != null && (
          <span className="flex items-center gap-1.5 text-[12px]">
            <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
            <strong className="text-emerald-600 font-bold">{completed}</strong>
            <span className="text-foreground/60">{"passed"}</span>
          </span>
        )}
        {showProgress && (
          <span className="ml-auto text-[11px] font-bold tabular-nums" style={{ color: moduleConf?.color ?? "#6B7280" }}>
            {pct}%
          </span>
        )}
      </div>
      {showProgress && (
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, pct)}%`,
              backgroundColor: pct === 100 ? "#22c55e" : (moduleConf?.color ?? "#6B7280"),
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CardProgress;
