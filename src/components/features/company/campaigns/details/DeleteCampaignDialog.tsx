import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import AppButton from "@/components/ui/AppButton";

interface Props {
  open: boolean;
  campaignTitle: string;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteCampaignDialog: React.FC<Props> = ({ open, campaignTitle, onClose, onConfirm }) => (
  <Dialog
    open={open}
    onClose={onClose}
    slotProps={{ paper: { sx: { borderRadius: 3, maxWidth: 420, width: "100%" } } }}
  >
    <DialogTitle sx={{ fontWeight: 700, fontSize: "16px", color: "#111827" }}>
      Delete Campaign
    </DialogTitle>
    <DialogContent>
      <Typography sx={{ fontSize: "14px", color: "#6B7280" }}>
        Are you sure you want to delete{" "}
        <strong style={{ color: "#111827" }}>{campaignTitle}</strong>? This action cannot be undone.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
      <Button
        onClick={onClose}
        sx={{ fontSize: "13px", fontWeight: 600, color: "#6B7280", textTransform: "none" }}
      >
        Cancel
      </Button>
      <AppButton
        label="Delete"
        variant="danger"
        size="small"
        onClick={onConfirm}
        sx={{ px: 2.5 }}
      />
    </DialogActions>
  </Dialog>
);

export default DeleteCampaignDialog;
