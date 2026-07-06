import React from "react";
import { useTranslation } from "react-i18next";
import { BellOff } from "lucide-react";
import { Button } from "@/modules/shared/ui/shadcn/button";

interface Props {
  autoRenew: boolean;
  cancelling: boolean;
  subscriptionId: string;
  onCancel: (id: string) => void;
  onReEnable: (id: string) => void;
}

const AutoRenewalCta: React.FC<Props> = ({ autoRenew, cancelling, subscriptionId, onCancel, onReEnable }) => {
  const { t } = useTranslation("dashboard");

  if (autoRenew) {
    return (
      <Button
        variant="outline"
        className="w-full border-red-500 text-red-500 hover:border-red-600 hover:bg-red-50"
        loading={cancelling}
        onClick={() => onCancel(subscriptionId)}
      >
        {t("pages.subscription.card.disable_auto_renewal")}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-[10px] border border-amber-200 bg-amber-50 px-3 py-2">
      <BellOff size={16} className="flex-shrink-0 text-amber-600" />
      <div className="min-w-0 flex-1">
        <p className="text-[0.73rem] font-bold text-amber-800">
          {t("pages.subscription.card.auto_renewal_off")}
        </p>
        <p className="text-[0.68rem] text-amber-700">
          {t("pages.subscription.card.wont_renew_detail")}
        </p>
      </div>
      <Button
        variant="warning"
        size="sm"
        loading={cancelling}
        onClick={() => onReEnable(subscriptionId)}
        className="shrink-0"
      >
        {t("pages.subscription.card.reenable")}
      </Button>
    </div>
  );
};

export default AutoRenewalCta;
