import React, { memo, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
  alpha,
} from "@mui/material";
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
  const theme = useTheme();
  const handleClose = useCallback(() => {
    if (!isDeleting) onClose();
  }, [isDeleting, onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          elevation: 12,
          sx: {
            borderRadius: 2,
            minWidth: { xs: "min(100%, 360px)", sm: 400 },
            border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === "dark" ? 0.4 : 0.9)}`,
          },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: "text.primary", fontSize: "1rem", pb: 0.5 }}>
        {title ?? t("delete_dialog.title")}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: "text.secondary", fontSize: "0.8125rem", lineHeight: 1.55, mt: 0.5 }}>
          {description ?? t("delete_dialog.description")}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2, pt: 0.5, gap: 1 }}>
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
      </DialogActions>
    </Dialog>
  );
});

export default DeleteConversationDialog;
