import React, { memo, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
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
  const err = theme.palette.error;
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
        <Button
          onClick={onClose}
          disabled={isDeleting}
          color="inherit"
          sx={{
            fontWeight: 600,
            textTransform: "none",
            borderRadius: 3,
            px: 2,
          }}
        >
          {t("delete_dialog.cancel")}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isDeleting}
          variant="contained"
          color="error"
          disableElevation
          sx={{
            fontWeight: 700,
            textTransform: "none",
            borderRadius: 3,
            px: 2.5,
            minWidth: 120,
            boxShadow: "none",
            "&:hover": {
              boxShadow: `0 4px 14px ${alpha(err.main, 0.35)}`,
            },
          }}
        >
          {isDeleting ? (
            <CircularProgress size={20} color="inherit" thickness={4} />
          ) : (
            t("delete_dialog.delete")
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

export default DeleteConversationDialog;
