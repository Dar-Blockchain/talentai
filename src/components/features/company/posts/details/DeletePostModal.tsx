import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
} from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import DeleteIcon from "@mui/icons-material/Delete";

const ACCENT = "rgba(224, 62, 92, 1)";

const PAPER_SX = {
  borderRadius: "18px",
  background: "rgba(255,255,255,0.9)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(0,0,0,0.06)",
  boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
  overflow: "hidden",
} as const;

const TITLE_SX = {
  display: "flex", alignItems: "center", gap: 1.2,
  fontSize: "1.2rem", fontWeight: 500, color: "#2d2d2d",
  px: 3, py: 2.5,
  borderBottom: "1px solid rgba(0,0,0,0.07)",
  background: "rgba(250,250,250,0.7)",
} as const;

const CONTENT_SX  = { px: 3, py: 3, color: "#444", background: "white" } as const;
const ACTIONS_SX  = { px: 3, py: 2, background: "rgba(250,250,250,0.9)", borderTop: "1px solid rgba(0,0,0,0.06)" } as const;
const CANCEL_SX   = { textTransform: "none", fontWeight: 600, borderRadius: "8px", px: 2.4, color: "#333", background: "rgba(0,0,0,0.04)", "&:hover": { background: "rgba(0,0,0,0.07)" } } as const;
const CONFIRM_SX  = {
  background: ACCENT, textTransform: "none", fontWeight: 700, borderRadius: "8px", px: 3,
  color: "#fff", boxShadow: "0 4px 14px rgba(224, 62, 92, 0.25)",
  "&:hover": { background: ACCENT, opacity: 0.9, boxShadow: "0 5px 18px rgba(224, 62, 92, 0.35)" },
} as const;

interface DeletePostModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const DeletePostModal = memo<DeletePostModalProps>(({ open, onClose, onDelete, isDeleting }) => {
  const { t } = useTranslation("posts");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth slotProps={{ paper: { sx: PAPER_SX } }}>
      <DialogTitle sx={TITLE_SX}>
        <ErrorIcon sx={{ color: ACCENT, fontSize: 26 }} />
        {t("delete_modal.title")}
      </DialogTitle>

      <DialogContent sx={CONTENT_SX}>
        <Typography sx={{ my: 1.5, fontSize: "0.95rem" }}>{t("delete_modal.body")}</Typography>
        <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#5c5c5c" }}>{t("delete_modal.warning")}</Typography>
      </DialogContent>

      <DialogActions sx={ACTIONS_SX}>
        <Button onClick={onClose} disabled={isDeleting} sx={CANCEL_SX}>
          {t("delete_modal.cancel")}
        </Button>
        <Button
          onClick={onDelete}
          variant="contained"
          disabled={isDeleting}
          startIcon={!isDeleting ? <DeleteIcon /> : null}
          loading={isDeleting}
          sx={CONFIRM_SX}
        >
          {t("delete_modal.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
});
DeletePostModal.displayName = "DeletePostModal";

export default DeletePostModal;
