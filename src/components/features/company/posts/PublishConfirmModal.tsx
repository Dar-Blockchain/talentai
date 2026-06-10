import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { Box, Dialog, DialogContent, Typography, CircularProgress } from "@mui/material";
import PublishOutlined      from "@mui/icons-material/PublishOutlined";
import EditOutlined         from "@mui/icons-material/EditOutlined";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import AppButton from "@/components/ui/AppButton";

// ─── Static constants ─────────────────────────────────────────────────────────

const PAPER_SX      = { borderRadius: "16px", p: 0, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.14)" } as const;
const TOP_BAR_SX    = { height: 4, bgcolor: "#F59E0B" } as const;
const CONTENT_SX    = { p: 3.5 } as const;
const ICON_BOX_SX   = { width: 52, height: 52, borderRadius: "14px", bgcolor: "#FFFBEB", border: "1.5px solid #FDE68A", display: "flex", alignItems: "center", justifyContent: "center", mb: 2 } as const;
const TITLE_SX      = { fontSize: "16px", fontWeight: 800, color: "#111827", mb: 0.75 } as const;
const BODY_SX       = { fontSize: "13px", color: "#6B7280", lineHeight: 1.65, mb: 2.5 } as const;
const WARN_BOX_SX   = { display: "flex", alignItems: "flex-start", gap: 1.25, p: 1.5, borderRadius: "10px", bgcolor: "#FEF2F2", border: "1px solid #FECACA", mb: 3 } as const;
const WARN_TEXT_SX  = { fontSize: "12px", color: "#991B1B", lineHeight: 1.55 } as const;
const EDIT_BTN_SX   = { borderRadius: "10px", py: 1.1, fontWeight: 600, mb: 1.5, borderColor: "#BFDBFE", color: "#2563EB", "&:hover": { borderColor: "#93C5FD", bgcolor: "#EFF6FF" } } as const;
const ACTIONS_ROW_SX = { display: "flex", gap: 1.5 } as const;
const CANCEL_BTN_SX = { borderRadius: "10px", py: 1.1, fontWeight: 600, borderColor: "#E5E7EB", color: "#374151", "&:hover": { borderColor: "#D1D5DB", bgcolor: "#F9FAFB" } } as const;
const CONFIRM_BTN_SX = { borderRadius: "10px", py: 1.1, fontWeight: 700, bgcolor: "#D97706", "&:hover": { bgcolor: "#B45309" } } as const;

// ─── Component ────────────────────────────────────────────────────────────────

interface PublishConfirmModalProps {
  open: boolean;
  publishing: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onEdit: () => void;
}

const PublishConfirmModal = memo<PublishConfirmModalProps>(({ open, publishing, onClose, onConfirm, onEdit }) => {
  const { t } = useTranslation("posts");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: PAPER_SX }}>
      <Box sx={TOP_BAR_SX} />

      <DialogContent sx={CONTENT_SX}>
        <Box sx={ICON_BOX_SX}>
          <PublishOutlined sx={{ fontSize: 26, color: "#D97706" }} />
        </Box>

        <Typography sx={TITLE_SX}>{t("detail.publish_modal.title")}</Typography>
        <Typography sx={BODY_SX}>
          {t("detail.publish_modal.body_pre")}{" "}
          <strong style={{ color: "#111827" }}>{t("detail.publish_modal.body_highlight")}</strong>{" "}
          {t("detail.publish_modal.body_post")}
        </Typography>

        <Box sx={WARN_BOX_SX}>
          <WarningAmberOutlined sx={{ fontSize: 16, color: "#DC2626", flexShrink: 0, mt: "1px" }} />
          <Typography sx={WARN_TEXT_SX}>{t("detail.publish_modal.warning")}</Typography>
        </Box>

        <AppButton
          label={t("detail.publish_modal.edit_post", "Edit Post")}
          variant="outlined"
          fullWidth
          disabled={publishing}
          startIcon={<EditOutlined sx={{ fontSize: 16 }} />}
          onClick={onEdit}
          sx={EDIT_BTN_SX}
        />

        <Box sx={ACTIONS_ROW_SX}>
          <AppButton
            label={t("detail.publish_modal.cancel")}
            variant="outlined"
            fullWidth
            onClick={onClose}
            disabled={publishing}
            sx={CANCEL_BTN_SX}
          />
          <AppButton
            label={publishing ? t("detail.publish_modal.publishing") : t("detail.publish_modal.confirm")}
            variant="contained"
            fullWidth
            disabled={publishing}
            startIcon={publishing ? <CircularProgress size={14} color="inherit" /> : <PublishOutlined sx={{ fontSize: 16 }} />}
            onClick={onConfirm}
            sx={CONFIRM_BTN_SX}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
});
PublishConfirmModal.displayName = "PublishConfirmModal";

export default PublishConfirmModal;
