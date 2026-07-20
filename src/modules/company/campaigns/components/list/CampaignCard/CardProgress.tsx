import React from "react";
import { Campaign } from "@/modules/company/campaigns/types/campaign";
import type { CampaignCardData } from "./useCampaignCard";

interface Props {
  campaign: Campaign;
  data: CampaignCardData;
}

const segClass = "flex-1 flex flex-col items-center gap-1 pt-2.5 pr-1 pb-2.5 pl-1 text-center border-r border-border last:border-r-0";
const numClass = "text-[18px] font-bold leading-none tracking-[-0.01em] tabular-nums text-foreground";
const labelClass = "text-[10px] font-bold uppercase tracking-[0.05em] text-muted-foreground";

const CardProgress: React.FC<Props> = ({ campaign, data }) => {
  const { total, completed, pct, showPercentage } = data;
  const isLinkAccess = campaign.accessMethod === "LINK";

  if (campaign.targetEmployeeCount == null && campaign.completedCount == null) return null;

  return (
    <div className="flex rounded-[11px] border-2 border-border overflow-hidden bg-muted">
      {campaign.targetEmployeeCount != null && (
        <div className={segClass}>
          <span className={numClass}>{total}</span>
          <span className={labelClass}>{isLinkAccess ? "Joined" : "Employees"}</span>
        </div>
      )}
      {campaign.completedCount != null && (
        <div className={segClass}>
          <span className={numClass}>{completed}</span>
          <span className={labelClass}>{isLinkAccess ? "Responses" : "Completed"}</span>
        </div>
      )}
      {showPercentage && (
        <div className={segClass}>
          <span className={numClass}>{pct}%</span>
          <span className={labelClass}>Completion</span>
        </div>
      )}
    </div>
  );
};

export default CardProgress;
