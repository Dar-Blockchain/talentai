import React from "react";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "./ConfirmDialog";

interface Props {
  open: boolean;
  planName: string;
  cancelling?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CancelDialog: React.FC<Props> = ({ open, planName, cancelling = false, onClose, onConfirm }) => {
  const { t } = useTranslation("dashboard");
  return (
    <ConfirmDialog
      open={open}
      title={t("pages.subscription.dialog.title")}
      body={t("pages.subscription.dialog.text", { plan: planName })}
      confirmLabel={t("pages.subscription.dialog.confirm")}
      confirmColor="#ef4444"
      loading={cancelling}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
};

export default CancelDialog;
