import React, { memo } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  message?: string;
}

const CampaignDetailError: React.FC<Props> = memo(({ message }) => {
  const { t } = useTranslation("dashboard");
  return (
    <div className="flex flex-col items-center gap-1 py-20">
      <p className="font-bold text-[1.1rem] text-slate-700">{t("pages.campaigns.detail.not_found_title")}</p>
      {message && <p className="text-sm text-slate-400">{message}</p>}
    </div>
  );
});

CampaignDetailError.displayName = "CampaignDetailError";
export default CampaignDetailError;
