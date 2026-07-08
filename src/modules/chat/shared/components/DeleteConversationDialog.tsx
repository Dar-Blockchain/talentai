import React, { memo, useCallback } from "react";
import { Dialog, DialogContent, DialogFooter } from "@/modules/shared/ui/shadcn/dialog";
import { Button } from "@/modules/shared/ui/shadcn/button";
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
    <Dialog open={open} onOpenChange={(next) => { if (!next) handleClose(); }}>
      <DialogContent className="min-w-[min(100%,360px)] sm:min-w-[400px] rounded-xl border border-[rgba(0,0,0,0.1)]">
        <p className="pb-1 text-[1rem] font-bold text-[#111827]">
          {title ?? t("delete_dialog.title")}
        </p>
        <p className="mt-0.5 text-[0.8125rem] leading-[1.55] text-[#6B7280]">
          {description ?? t("delete_dialog.description")}
        </p>
        <DialogFooter>
          <Button onClick={onClose} disabled={isDeleting} variant="ghost" className="rounded-xl px-4 font-semibold">
            {t("delete_dialog.cancel")}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            loading={isDeleting}
            variant="destructive"
            className="min-w-[120px] rounded-xl px-5 font-bold shadow-none"
          >
            {t("delete_dialog.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

export default DeleteConversationDialog;
