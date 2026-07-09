import React from "react";
import { Campaign } from "@/modules/company/campaigns/types/campaign";

interface Props {
  campaign: Campaign;
}

const CardInfo: React.FC<Props> = ({ campaign }) => (
  <p className="text-[15.5px] font-bold text-foreground leading-snug tracking-[-0.01em] line-clamp-1">
    {campaign.title}
  </p>
);

export default CardInfo;
