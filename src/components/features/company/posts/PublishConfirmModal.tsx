import React from "react";
import { Box, Dialog, DialogContent, Typography, CircularProgress } from "@mui/material";
import PublishOutlined from "@mui/icons-material/PublishOutlined";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import AppButton from "@/components/ui/AppButton";

interface PublishConfirmModalProps {
  open: boolean;
  publishing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const PublishConfirmModal: React.FC<PublishConfirmModalProps> = ({ open, publishing, onClose, onConfirm }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="xs"
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: "16px",
        p: 0,
        overflow: "hidden",
        boxShadow: "0 24px 48px rgba(0,0,0,0.14)",
      },
    }}
  >
    {/* Amber top bar */}
    <Box sx={{ height: 4, bgcolor: "#F59E0B" }} />

    <DialogContent sx={{ p: 3.5 }}>
      {/* Icon */}
      <Box sx={{
        width: 52, height: 52, borderRadius: "14px",
        bgcolor: "#FFFBEB", border: "1.5px solid #FDE68A",
        display: "flex", alignItems: "center", justifyContent: "center",
        mb: 2,
      }}>
        <PublishOutlined sx={{ fontSize: 26, color: "#D97706" }} />
      </Box>

      <Typography sx={{ fontSize: "16px", fontWeight: 800, color: "#111827", mb: 0.75 }}>
        Publish this job post?
      </Typography>
      <Typography sx={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.65, mb: 2.5 }}>
        Once published, this post will be <strong style={{ color: "#111827" }}>visible to all candidates</strong> and they can start applying immediately.
      </Typography>

      {/* Warning box */}
      <Box sx={{
        display: "flex", alignItems: "flex-start", gap: 1.25,
        p: 1.5, borderRadius: "10px",
        bgcolor: "#FEF2F2", border: "1px solid #FECACA",
        mb: 3,
      }}>
        <WarningAmberOutlined sx={{ fontSize: 16, color: "#DC2626", flexShrink: 0, mt: "1px" }} />
        <Typography sx={{ fontSize: "12px", color: "#991B1B", lineHeight: 1.55 }}>
          <strong>You won't be able to edit the post after publishing.</strong> Make sure all job details are correct before continuing.
        </Typography>
      </Box>

      {/* Actions */}
      <Box sx={{ display: "flex", gap: 1.5 }}>
        <AppButton
          label="Cancel"
          variant="outlined"
          fullWidth
          onClick={onClose}
          disabled={publishing}
          sx={{ borderRadius: "10px", py: 1.1, fontWeight: 600, borderColor: "#E5E7EB", color: "#374151", "&:hover": { borderColor: "#D1D5DB", bgcolor: "#F9FAFB" } }}
        />
        <AppButton
          label={publishing ? "Publishing…" : "Yes, Publish"}
          variant="contained"
          fullWidth
          disabled={publishing}
          startIcon={publishing ? <CircularProgress size={14} color="inherit" /> : <PublishOutlined sx={{ fontSize: 16 }} />}
          onClick={onConfirm}
          sx={{ borderRadius: "10px", py: 1.1, fontWeight: 700, bgcolor: "#D97706", "&:hover": { bgcolor: "#B45309" } }}
        />
      </Box>
    </DialogContent>
  </Dialog>
);

export default PublishConfirmModal;
