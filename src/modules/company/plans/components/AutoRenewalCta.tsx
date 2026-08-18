import React from "react";
import { useTranslation } from "react-i18next";
import { Switch } from "@/modules/shared/ui/shadcn/switch";

interface Props {
  autoRenew: boolean;
  cancelling: boolean;
  subscriptionId: string;
  onCancel: (id: string) => void;
  onReEnable: (id: string) => void;
}

const AutoRenewalCta: React.FC<Props> = ({ autoRenew, cancelling, subscriptionId, onCancel, onReEnable }) => {
  const { t } = useTranslation("dashboard");

  const handleToggle = (checked: boolean) => {
    if (checked) onReEnable(subscriptionId);
    else onCancel(subscriptionId);
  };

  return (
    <div
      className={`flex flex-col gap-1.5 rounded-[10px] border px-3 py-2.5 transition-colors ${
        autoRenew ? "border-gray-200 bg-gray-50" : "border-amber-200 bg-amber-50"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[0.78rem] font-bold ${autoRenew ? "text-gray-700" : "text-amber-800"}`}>
          {autoRenew
            ? t("pages.subscription.card.auto_renewal_on")
            : t("pages.subscription.card.auto_renewal_off")}
        </span>
        <Switch
          checked={autoRenew}
          disabled={cancelling}
          onCheckedChange={handleToggle}
          aria-label={t("pages.subscription.card.disable_auto_renewal")}
        />
      </div>
      {!autoRenew && (
        <p className="text-[0.68rem] text-amber-700">
          {t("pages.subscription.card.wont_renew_detail")}
        </p>
      )}
    </div>
  );
};

export default AutoRenewalCta;
