import React from "react";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "./ConfirmDialog";
import { DowngradePlan } from "../types";

interface Props {
  downgradePlan: DowngradePlan | null;
  cancelling?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DowngradeDialog: React.FC<Props> = ({ downgradePlan, cancelling = false, onClose, onConfirm }) => {
  const { t } = useTranslation("dashboard");
  return (
    <ConfirmDialog
      open={!!downgradePlan}
      title={t("pages.subscription.downgrade_dialog.title", "Downgrade Plan?")}
      body={t("pages.subscription.downgrade_dialog.text", {
        plan: downgradePlan?.plan?.name ?? "",
        defaultValue: "Your current plan will stay active until it expires. After that, the {{plan}} plan limits will apply.",
      })}
      confirmLabel={t("pages.subscription.downgrade_dialog.confirm", "Confirm Downgrade")}
      confirmColor="#D97706"
      loading={cancelling}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
};

export default DowngradeDialog;
