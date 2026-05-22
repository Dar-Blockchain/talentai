import React from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import DeleteIcon from "@mui/icons-material/Delete";
import AppButton from "@/components/ui/AppButton";

interface DeletePostModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const DeletePostModal: React.FC<DeletePostModalProps> = ({ open, onClose, onDelete, isDeleting }) => {
  const { t } = useTranslation("posts");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "18px",
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
            overflow: "hidden",
          },
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.2, fontSize: "1.2rem", fontWeight: 500, color: "#2d2d2d", px: 3, py: 2.5, borderBottom: "1px solid rgba(0,0,0,0.07)", background: "rgba(250,250,250,0.7)" }}>
        <ErrorIcon sx={{ color: "#E03E5C", fontSize: 26 }} />
        {t("delete_modal.title")}
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3, color: "#444", background: "white" }}>
        <Typography sx={{ my: 1.5, fontSize: "0.95rem" }}>{t("delete_modal.body")}</Typography>
        <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#5c5c5c" }}>{t("delete_modal.warning")}</Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1, background: "rgba(250,250,250,0.9)", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <AppButton
          label={t("delete_modal.cancel")}
          variant="text"
          disabled={isDeleting}
          onClick={onClose}
          sx={{ color: "#333", "&:hover": { bgcolor: "rgba(0,0,0,0.04)" } }}
        />
        <AppButton
          label={t("delete_modal.confirm")}
          variant="danger"
          loading={isDeleting}
          startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
          onClick={onDelete}
          sx={{ borderRadius: "8px", px: 3, boxShadow: "0 4px 14px rgba(224,62,92,0.25)", "&:hover": { boxShadow: "0 5px 18px rgba(224,62,92,0.35)" } }}
        />
      </DialogActions>
    </Dialog>
  );
};

export default DeletePostModal;
