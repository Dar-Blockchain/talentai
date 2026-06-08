import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, CircularProgress,
} from "@mui/material";
import AppButton from "@/components/ui/AppButton";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  confirmColor: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open, title, body, confirmLabel, confirmColor,
  loading = false, onClose, onConfirm,
}) => {
  const { t } = useTranslation("dashboard");

  return (
    <Dialog open={open} onClose={onClose} slotProps={{ paper: { sx: { borderRadius: "16px" } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{body}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <AppButton
          label={t("pages.subscription.dialog.keep", "Keep Current")}
          variant="outlined"
          onClick={onClose}
        />
        <AppButton
          label={loading ? t("pages.subscription.card.processing") : confirmLabel}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : undefined}
          onClick={onConfirm}
          sx={{ bgcolor: confirmColor, "&:hover": { bgcolor: confirmColor, filter: "brightness(0.88)" } }}
        />
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
