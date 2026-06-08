import React from "react";
import { useTranslation } from "react-i18next";
import {
  Box, Typography, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions,
} from "@mui/material";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import AppButton from "@/components/ui/AppButton";
import { useContactForm } from "../hooks/useContactForm";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ContactUsModal: React.FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation("dashboard");
  const { form, status, canSubmit, setField, handleSend, handleClose } = useContactForm(onClose);

  const sending = status === "sending";
  const sent    = status === "sent";

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: "16px" } } }}>
      <DialogTitle sx={{ fontWeight: 800, fontSize: "1.1rem", pb: 0.5 }}>
        {t("pages.subscription.enterprise_modal.title")}
      </DialogTitle>

      <DialogContent>
        {sent ? (
          <Box sx={{ py: 3, textAlign: "center" }}>
            <CheckCircleOutlined sx={{ fontSize: 48, color: "#D97706", mb: 1 }} />
            <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#111827", mb: 0.5 }}>
              {t("pages.subscription.enterprise_modal.message_sent")}
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", color: "#6B7280" }}>
              {t("pages.subscription.enterprise_modal.follow_up")}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <Typography sx={{ fontSize: "0.85rem", color: "#6B7280" }}>
              {t("pages.subscription.enterprise_modal.intro")}
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField size="small" fullWidth
                label={t("pages.subscription.enterprise_modal.full_name")}
                value={form.name} onChange={setField("name")} />
              <TextField size="small" fullWidth
                label={t("pages.subscription.enterprise_modal.email")}
                value={form.email} onChange={setField("email")} />
            </Box>
            <TextField size="small" fullWidth
              label={t("pages.subscription.enterprise_modal.company")}
              value={form.company} onChange={setField("company")} />
            <TextField size="small" fullWidth multiline rows={3}
              label={t("pages.subscription.enterprise_modal.message")}
              placeholder={t("pages.subscription.enterprise_modal.message_placeholder")}
              value={form.message} onChange={setField("message")} />
          </Box>
        )}
      </DialogContent>

      {!sent && (
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <AppButton
            label={t("pages.subscription.enterprise_modal.cancel")}
            variant="outlined"
            onClick={handleClose}
          />
          <AppButton
            label={sending
              ? t("pages.subscription.enterprise_modal.sending")
              : t("pages.subscription.enterprise_modal.send")}
            variant="contained"
            disabled={sending || !canSubmit}
            onClick={handleSend}
            sx={{ bgcolor: "#D97706", "&:hover": { bgcolor: "#B45309" } }}
          />
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ContactUsModal;
