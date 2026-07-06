import React from "react";
import { Link2, Lock, EyeOff, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Campaign } from "@/modules/company/campaigns/types/campaign";
import type { CampaignCardData } from "./useCampaignCard";

interface Props {
  campaign: Campaign;
  data: CampaignCardData;
}

const CardChips: React.FC<Props> = ({ campaign, data }) => {
  const { t } = useTranslation("dashboard");
  const p = "pages.campaigns";
  const { moduleConf, moduleLabel } = data;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {moduleConf && moduleLabel && (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold"
          style={{
            backgroundColor: `${moduleConf.color}10`,
            color:           moduleConf.color,
            borderColor:     `${moduleConf.color}28`,
          }}
        >
          {moduleLabel}
        </span>
      )}
      {campaign.accessMethod && (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium"
          style={campaign.accessMethod === "LINK"
            ? { backgroundColor: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }
            : { backgroundColor: "#F5F3FF", color: "#5B21B6", borderColor: "#DDD6FE" }}
        >
          {campaign.accessMethod === "LINK"
            ? <Link2 className="size-2.5" />
            : <Lock className="size-2.5" />}
          {campaign.accessMethod === "LINK"
            ? t(`${p}.card.access_public_link`)
            : t(`${p}.card.access_accounts_only`)}
        </span>
      )}
      {campaign.anonymityMode && (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium"
          style={campaign.anonymityMode === "ANONYMOUS"
            ? { backgroundColor: "#FFF7ED", color: "#9A3412", borderColor: "#FED7AA" }
            : { backgroundColor: "#F0FDF4", color: "#166534", borderColor: "#BBF7D0" }}
        >
          {campaign.anonymityMode === "ANONYMOUS"
            ? <EyeOff className="size-2.5" />
            : <Eye className="size-2.5" />}
          {campaign.anonymityMode === "ANONYMOUS"
            ? t(`${p}.card.privacy_anonymous`)
            : t(`${p}.card.privacy_nominative`)}
        </span>
      )}
    </div>
  );
};

export default CardChips;
