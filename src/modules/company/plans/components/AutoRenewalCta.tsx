import React from "react";
import { useTranslation } from "react-i18next";
import { BellOff } from "lucide-react";
import AppButton from "@/components/ui/AppButton";

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
      <AppButton
        label={t("pages.subscription.card.disable_auto_renewal")}
        variant="outlined"
        fullWidth
        loading={cancelling}
        onClick={() => onCancel(subscriptionId)}
        sx={{
          borderColor: "#EF4444", color: "#EF4444", fontWeight: 600,
          borderRadius: "10px", py: 0.9, fontSize: "0.78rem",
          "&:hover": { bgcolor: "#FEF2F2", borderColor: "#DC2626" },
        }}
      />
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
      <AppButton
        label={t("pages.subscription.card.reenable")}
        variant="contained"
        loading={cancelling}
        onClick={() => onReEnable(subscriptionId)}
        sx={{
          bgcolor: "#D97706", "&:hover": { bgcolor: "#B45309" },
          fontWeight: 700, borderRadius: "8px", py: 0.4, px: 1.25,
          fontSize: "0.68rem", minWidth: 0, flexShrink: 0,
        }}
      />
    </div>
  );
};

export default AutoRenewalCta;
