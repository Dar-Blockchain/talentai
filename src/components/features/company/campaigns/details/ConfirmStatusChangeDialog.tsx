import React from "react";
import {
  Box, Typography, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import PlayArrowOutlined from "@mui/icons-material/PlayArrow";
import PauseOutlined     from "@mui/icons-material/PauseOutlined";
import StopOutlined      from "@mui/icons-material/StopOutlined";
import { CampaignStatus } from "@/types/campaign";
import { STATUS_COLORS, STATUS_TRANSITION_LABELS } from "@/constants/campaign";

const STATUS_ICONS: Partial<Record<CampaignStatus, React.ElementType>> = {
  ACTIVE: PlayArrowOutlined,
  PAUSED: PauseOutlined,
  CLOSED: StopOutlined,
};

const STATUS_CHANGE_DESCRIPTIONS: Partial<Record<CampaignStatus, string>> = {
  ACTIVE: "Participants will be able to access and start the assessment.",
  PAUSED: "Participants will no longer be able to start new sessions until the campaign is resumed.",
  CLOSED: "The campaign will be permanently closed. Participants will lose access.",
};

interface Props {
  open: boolean;
  campaignTitle: string;
  currentStatus: CampaignStatus;
  targetStatus: CampaignStatus;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmStatusChangeDialog: React.FC<Props> = ({
  open, campaignTitle, currentStatus, targetStatus, onClose, onConfirm,
}) => {
  const sColor = STATUS_COLORS[targetStatus];
  const cColor = STATUS_COLORS[currentStatus] ?? STATUS_COLORS.DRAFT;
  const Icon   = STATUS_ICONS[targetStatus];
  const label  = STATUS_TRANSITION_LABELS[targetStatus];
  const desc   = STATUS_CHANGE_DESCRIPTIONS[targetStatus];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" } } }}
    >
      <DialogTitle sx={{ pb: 1.5, pt: 2.5, px: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{
            width: 38, height: 38, borderRadius: "10px", flexShrink: 0,
            bgcolor: sColor?.bg, border: `1px solid ${sColor?.fg}25`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {Icon && <Icon sx={{ fontSize: 18, color: sColor?.fg }} />}
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#0F172A" }}>
              {label} Campaign
            </Typography>
            <Typography sx={{ fontSize: "11px", color: "#94A3B8", mt: 0.25 }}>
              {campaignTitle}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 1 }}>
        <Typography sx={{ fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
          {desc}
        </Typography>
        <Box sx={{
          mt: 1.5, px: 1.5, py: 1, borderRadius: "8px",
          bgcolor: "#F8FAFC", border: "1px solid #E2E8F0",
          display: "flex", alignItems: "center", gap: 1,
        }}>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: "2px", borderRadius: "999px", bgcolor: cColor.bg }}>
            <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: cColor.fg }} />
            <Typography sx={{ fontSize: "11px", fontWeight: 700, color: cColor.fg }}>{currentStatus}</Typography>
          </Box>
          <Typography sx={{ fontSize: "12px", color: "#94A3B8" }}>→</Typography>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: "2px", borderRadius: "999px", bgcolor: sColor?.bg }}>
            <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: sColor?.fg }} />
            <Typography sx={{ fontSize: "11px", fontWeight: 700, color: sColor?.fg }}>{targetStatus}</Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{ textTransform: "none", fontWeight: 600, fontSize: "13px", color: "#6B7280", "&:hover": { bgcolor: "#F3F4F6" } }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disableElevation
          sx={{
            textTransform: "none", fontWeight: 700, fontSize: "13px",
            bgcolor: sColor?.fg, borderRadius: "8px",
            "&:hover": { bgcolor: sColor?.fg, opacity: 0.88 },
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmStatusChangeDialog;
