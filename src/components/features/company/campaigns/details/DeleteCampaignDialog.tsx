import React from "react";
import {
  Box, Typography, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from "@mui/material";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import CloseOutlined         from "@mui/icons-material/CloseOutlined";
import PeopleAltOutlined     from "@mui/icons-material/PeopleAltOutlined";
import AssignmentOutlined    from "@mui/icons-material/AssignmentOutlined";
import WarningAmberOutlined  from "@mui/icons-material/WarningAmberOutlined";
import AppButton             from "@/components/ui/AppButton";
import { useTranslation, Trans } from "react-i18next";

interface Props {
  open: boolean;
  campaignTitle: string;
  participantCount?: number;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const p = "pages.campaigns.modals.delete";

const DeleteCampaignDialog: React.FC<Props> = ({ open, campaignTitle, participantCount, onClose, onConfirm, loading }) => {
  const { t } = useTranslation("dashboard");

  const impactParticipants =
    participantCount != null && participantCount > 0 ? (
      <Trans
        i18nKey={participantCount === 1 ? `${p}.impact_participants_one` : `${p}.impact_participants_other`}
        ns="dashboard"
        values={{ count: participantCount }}
        components={{ strong: <strong /> }}
      />
    ) : (
      t(`${p}.impact_generic`)
    );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" } } }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, pt: 2.5, pb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: "11px",
              bgcolor: "#FEF2F2", border: "1px solid #FECACA",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <DeleteOutlineOutlined sx={{ fontSize: 19, color: "#DC2626" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>
                {t(`${p}.title`)}
              </Typography>
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF", mt: 0.1 }}>
                {t(`${p}.subtitle`)}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={onClose} disabled={loading} sx={{ color: "#9CA3AF" }}>
            <CloseOutlined sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 1, pt: "0 !important" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

          <Typography sx={{ fontSize: "13.5px", color: "#374151", lineHeight: 1.7 }}>
            {t(`${p}.body_lead`)}{" "}
            <Box component="span" sx={{ fontWeight: 700, color: "#111827" }}>
              {campaignTitle}
            </Box>
            {t(`${p}.body_trail`)}
          </Typography>

          <Box sx={{ borderRadius: "12px", border: "1px solid #FDE68A", bgcolor: "#FFFBEB", p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <WarningAmberOutlined sx={{ fontSize: 15, color: "#D97706", flexShrink: 0 }} />
              <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#92400E" }}>
                {t(`${p}.impact_title`)}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
              <PeopleAltOutlined sx={{ fontSize: 14, color: "#D97706", mt: "2px", flexShrink: 0 }} />
              <Typography sx={{ fontSize: "12.5px", color: "#78350F", lineHeight: 1.6 }}>
                {impactParticipants}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
              <AssignmentOutlined sx={{ fontSize: 14, color: "#D97706", mt: "2px", flexShrink: 0 }} />
              <Typography sx={{ fontSize: "12.5px", color: "#78350F", lineHeight: 1.6 }}>
                {t(`${p}.impact_config`)}
              </Typography>
            </Box>
          </Box>

        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ textTransform: "none", fontWeight: 600, fontSize: "13px", color: "#6B7280", "&:hover": { bgcolor: "#F3F4F6" } }}
        >
          {t(`${p}.cancel`)}
        </Button>
        <AppButton
          label={t(`${p}.confirm`)}
          variant="danger"
          size="medium"
          startIcon={<DeleteOutlineOutlined />}
          loading={loading}
          onClick={onConfirm}
        />
      </DialogActions>
    </Dialog>
  );
};

export default DeleteCampaignDialog;
