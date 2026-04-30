"use client";

import React from "react";
import {
  Box, Typography, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import PlayArrowOutlined  from "@mui/icons-material/PlayArrow";
import PauseOutlined      from "@mui/icons-material/PauseOutlined";
import StopOutlined       from "@mui/icons-material/StopOutlined";
import InfoOutlined       from "@mui/icons-material/InfoOutlined";
import { CampaignStatus } from "@/types/campaign";
import { STATUS_COLORS } from "@/constants/campaign";
import { useTranslation } from "react-i18next";

const STATUS_ICONS: Partial<Record<CampaignStatus, React.ElementType>> = {
  ACTIVE: PlayArrowOutlined,
  PAUSED: PauseOutlined,
  CLOSED: StopOutlined,
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
  const { t } = useTranslation("campaign");

  const sColor = STATUS_COLORS[targetStatus];
  const cColor = STATUS_COLORS[currentStatus] ?? STATUS_COLORS.DRAFT;
  const Icon   = STATUS_ICONS[targetStatus];
  const titleKey = `dialogs.transition_title.${targetStatus}` as const;
  const bodyKey = `dialogs.transition_body.${targetStatus}` as const;
  const transitionTitle = t(titleKey);
  const desc = t(bodyKey);

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
              {transitionTitle}
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
            <Typography sx={{ fontSize: "11px", fontWeight: 700, color: cColor.fg }}>{t(`status.${currentStatus}`)}</Typography>
          </Box>
          <Typography sx={{ fontSize: "12px", color: "#94A3B8" }}>→</Typography>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: "2px", borderRadius: "999px", bgcolor: sColor?.bg }}>
            <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: sColor?.fg }} />
            <Typography sx={{ fontSize: "11px", fontWeight: 700, color: sColor?.fg }}>{t(`status.${targetStatus}`)}</Typography>
          </Box>
        </Box>

        {targetStatus === "ACTIVE" && (
          <Box sx={{
            display: "flex", alignItems: "flex-start", gap: 1,
            mt: 1.5, px: 1.5, py: 1, borderRadius: "8px",
            bgcolor: "#FFF7ED", border: "1px solid #FED7AA",
          }}>
            <InfoOutlined sx={{ fontSize: 14, color: "#EA580C", flexShrink: 0, mt: "1px" }} />
            <Typography sx={{ fontSize: "11.5px", color: "#9A3412", lineHeight: 1.5 }}>
              {t("dialogs.activate_edit_warning")}
            </Typography>
          </Box>
        )}

      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{ textTransform: "none", fontWeight: 600, fontSize: "13px", color: "#6B7280", "&:hover": { bgcolor: "#F3F4F6" } }}
        >
          {t("dialogs.cancel")}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disableElevation
          sx={{
            textTransform: "none", fontWeight: 700, fontSize: "13px",
            bgcolor: sColor?.fg, borderRadius: "8px", color: "#fff",
            "&:hover": { bgcolor: sColor?.fg, opacity: 0.88 },
          }}
        >
          {t("dialogs.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmStatusChangeDialog;
