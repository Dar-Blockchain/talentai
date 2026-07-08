import React from "react";
import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/modules/shared/ui/ConfirmDialog";

interface DeletePostModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const DeletePostModal: React.FC<DeletePostModalProps> = ({ open, onClose, onDelete, isDeleting }) => {
  const { t } = useTranslation("posts");

  return (
    <ConfirmDialog
      open={open}
      onCancel={onClose}
      onConfirm={onDelete}
      loading={isDeleting}
      title={t("delete_modal.title")}
      description={
        <>
          {t("delete_modal.body")}
          <br />
          <span className="font-semibold text-gray-600">{t("delete_modal.warning")}</span>
        </>
      }
      cancelLabel={t("delete_modal.cancel")}
      confirmLabel={t("delete_modal.confirm")}
    />
  );
};

export default DeletePostModal;
