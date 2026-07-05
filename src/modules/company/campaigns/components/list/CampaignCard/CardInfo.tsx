import React from "react";
import { Campaign } from "@/modules/company/campaigns/types/campaign";
import type { CampaignCardData } from "./useCampaignCard";

interface Props {
  campaign: Campaign;
  data: CampaignCardData;
}

const CardInfo: React.FC<Props> = ({ campaign, data }) => {
  const { moduleConf } = data;
  const ModuleIcon = moduleConf?.icon;

  return (
    <div className="flex gap-3 items-start">
      {moduleConf && ModuleIcon && (
        <div
          className="size-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ backgroundColor: `${moduleConf.color}18` }}
        >
          <ModuleIcon style={{ fontSize: 18, color: moduleConf.color }} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[15.5px] font-extrabold text-foreground leading-snug tracking-tight">
          {campaign.title}
        </p>
        {campaign.description && (
          <p className="text-[12.5px] text-foreground/55 leading-relaxed line-clamp-2 mt-0.5">
            {campaign.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default CardInfo;
