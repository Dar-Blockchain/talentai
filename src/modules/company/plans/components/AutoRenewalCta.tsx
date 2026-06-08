import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, CircularProgress } from "@mui/material";
import NotificationsOffOutlined from "@mui/icons-material/NotificationsOffOutlined";
import AppButton from "@/components/ui/AppButton";

interface Props {
  autoRenew: boolean;
  cancelling: boolean;
  subscriptionId: string;
  onCancel: (id: string) => void;
  onReEnable: (id: string) => void;
}

const AutoRenewalCta: React.FC<Props> = ({ autoRenew, cancelling, subscriptionId, onCancel, onReEnable }) => {
  const { t } = useTranslation("dashboard");
  const processing = t("pages.subscription.card.processing");

  if (autoRenew) {
    return (
      <AppButton
        label={cancelling ? processing : t("pages.subscription.card.disable_auto_renewal")}
        variant="outlined" fullWidth disabled={cancelling}
        startIcon={cancelling ? <CircularProgress size={14} color="inherit" /> : undefined}
        onClick={() => onCancel(subscriptionId)}
        sx={{
          borderColor: "#EF4444", color: "#EF4444", fontWeight: 600,
          borderRadius: "10px", py: 0.9, fontSize: "0.78rem",
          "&:hover": { bgcolor: "#FEF2F2", borderColor: "#DC2626" },
        }}
      />
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 1, borderRadius: "10px", bgcolor: "#FFFBEB", border: "1px solid #FDE68A" }}>
      <NotificationsOffOutlined sx={{ fontSize: 16, color: "#D97706", flexShrink: 0 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: "0.73rem", fontWeight: 700, color: "#92400E" }}>
          {t("pages.subscription.card.auto_renewal_off")}
        </Typography>
        <Typography sx={{ fontSize: "0.68rem", color: "#B45309" }}>
          {t("pages.subscription.card.wont_renew_detail")}
        </Typography>
      </Box>
      <AppButton
        label={cancelling ? processing : t("pages.subscription.card.reenable")}
        variant="contained" disabled={cancelling}
        onClick={() => onReEnable(subscriptionId)}
        sx={{
          bgcolor: "#D97706", "&:hover": { bgcolor: "#B45309" },
          fontWeight: 700, borderRadius: "8px", py: 0.4, px: 1.25,
          fontSize: "0.68rem", minWidth: 0, flexShrink: 0,
        }}
      />
    </Box>
  );
};

export default AutoRenewalCta;
