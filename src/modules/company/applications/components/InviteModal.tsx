import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box,
} from "@mui/material";
import VideoCallOutlined from "@mui/icons-material/VideoCallOutlined";
import AppButton from "@/components/ui/AppButton";
import { PURPLE } from "./constants";

interface Props {
  open: boolean;
  name: string;
  postTitle: string;
  sending: boolean;
  done: boolean;
  hasLink: boolean;
  onClose: () => void;
  onSend: () => void;
}

const InviteModal: React.FC<Props> = ({ open, name, postTitle, sending, done, hasLink, onClose, onSend }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="xs"
    fullWidth
    slotProps={{ paper: { sx: { borderRadius: "16px", p: 0.5 } } }}
  >
    <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", color: "#111827", pb: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <VideoCallOutlined sx={{ color: PURPLE, fontSize: 22 }} />
        Invite to Interview
      </Box>
    </DialogTitle>

    <DialogContent sx={{ pt: "12px !important" }}>
      {done ? (
        <Typography sx={{ fontSize: "0.88rem", color: "#059669", fontWeight: 600, textAlign: "center", py: 1 }}>
          ✓ Invitation sent successfully!
        </Typography>
      ) : (
        <Typography sx={{ fontSize: "0.88rem", color: "#4B5563", lineHeight: 1.7 }}>
          Send an interview invitation to <strong>{name}</strong> for the <strong>{postTitle}</strong> position?
        </Typography>
      )}
    </DialogContent>

    <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
      <AppButton label="Cancel" variant="text" onClick={onClose} />
      <AppButton
        label="Send Invitation"
        variant="contained"
        loading={sending}
        disabled={!hasLink || done}
        onClick={onSend}
        sx={{ bgcolor: PURPLE, "&:hover": { bgcolor: "#6d0ddb" }, boxShadow: "none" }}
      />
    </DialogActions>
  </Dialog>
);

export default InviteModal;
