import React from "react";
import { useTranslation } from "react-i18next";
import type { ApiKey } from "@/modules/settings/company/types";
import { ConfirmDialog } from "@/modules/shared/ui/ConfirmDialog";

type Props = {
  target: ApiKey | null;
  onClose: () => void;
  onConfirm: () => void;
};

const DeleteKeyDialog: React.FC<Props> = ({ target, onClose, onConfirm }) => {
  const { t } = useTranslation("dashboard");

  return (
    <ConfirmDialog
      open={!!target}
      onCancel={onClose}
      onConfirm={onConfirm}
      title={t("pages.settings.api_keys.delete_title")}
      description={
        <>
          {t("pages.settings.api_keys.delete_confirm", { name: target?.name })}
          <br />
          <span className="text-gray-400">{t("pages.settings.api_keys.delete_warning")}</span>
        </>
      }
      cancelLabel={t("pages.settings.api_keys.actions.cancel")}
      confirmLabel={t("pages.settings.api_keys.actions.delete")}
    />
  );
};

export default DeleteKeyDialog;
