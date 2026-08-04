import React from "react";
import { Link2, Lock, EyeOff, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Campaign } from "@/modules/company/campaigns/types/campaign";

interface Props {
  campaign: Campaign;
}

const CardChips: React.FC<Props> = ({ campaign }) => {
  const { t } = useTranslation("dashboard");
  const p = "pages.campaigns";

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {campaign.accessMethod && (
        <span
          className="inline-flex items-center gap-[5px] h-[22px] px-2.5 rounded-full text-[11px] font-semibold"
          style={campaign.accessMethod === "LINK"
            ? { backgroundColor: "#EFF6FF", color: "#1D4ED8" }
            : { backgroundColor: "#F5F3FF", color: "#5B21B6" }}
        >
          {campaign.accessMethod === "LINK"
            ? <Link2 className="size-[11px]" />
            : <Lock className="size-[11px]" />}
          {campaign.accessMethod === "LINK"
            ? t(`${p}.card.access_public_link`)
            : t(`${p}.card.access_accounts_only`)}
        </span>
      )}
      {campaign.anonymityMode && (
        <span
          className="inline-flex items-center gap-[5px] h-[22px] px-2.5 rounded-full text-[11px] font-semibold"
          style={campaign.anonymityMode === "ANONYMOUS"
            ? { backgroundColor: "#FFF7ED", color: "#9A3412" }
            : { backgroundColor: "#F0FDF4", color: "#166534" }}
        >
          {campaign.anonymityMode === "ANONYMOUS"
            ? <EyeOff className="size-[11px]" />
            : <Eye className="size-[11px]" />}
          {campaign.anonymityMode === "ANONYMOUS"
            ? t(`${p}.card.privacy_anonymous`)
            : t(`${p}.card.privacy_nominative`)}
        </span>
      )}
    </div>
  );
};

export default CardChips;
