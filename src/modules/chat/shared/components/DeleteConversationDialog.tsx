import React, { memo, useCallback } from "react";
import { ConfirmDialog } from "@/modules/shared/ui/ConfirmDialog";
import { useTranslation } from "react-i18next";

interface DeleteConversationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  title?: string;
  /** Overrides default i18n description (e.g. team chat "delete for me only") */
  description?: string;
}

const DeleteConversationDialog = memo(function DeleteConversationDialog({
  open,
  onClose,
  onConfirm,
  isDeleting,
  title,
  description,
}: DeleteConversationDialogProps) {
  const { t } = useTranslation("shared/chat");
  const handleClose = useCallback(() => {
    if (!isDeleting) onClose();
  }, [isDeleting, onClose]);

  return (
    <ConfirmDialog
      open={open}
      onCancel={handleClose}
      onConfirm={onConfirm}
      loading={isDeleting}
      title={title ?? t("delete_dialog.title")}
      description={description ?? t("delete_dialog.description")}
      cancelLabel={t("delete_dialog.cancel")}
      confirmLabel={t("delete_dialog.delete")}
    />
  );
});

export default DeleteConversationDialog;
