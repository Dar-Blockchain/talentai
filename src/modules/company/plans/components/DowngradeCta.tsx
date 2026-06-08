import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";
import ArrowDownwardOutlined from "@mui/icons-material/ArrowDownwardOutlined";
import { PlanLimit } from "@/store/slices/planLimitsSlice";
import AppButton from "@/components/ui/AppButton";

const warningBox = {
  display: "flex", alignItems: "flex-start", gap: 1,
  px: 1.5, py: 1.25, borderRadius: "10px",
  bgcolor: "#FFFBEB", border: "1px solid #FDE68A",
} as const;

interface Props {
  plan: PlanLimit;
  currentSubId: string;
  currentAutoRenew: boolean;
  checkingOut: boolean;
  onDowngrade: (plan: PlanLimit, subId: string) => void;
}

const DowngradeCta: React.FC<Props> = ({ plan, currentSubId, currentAutoRenew, checkingOut, onDowngrade }) => {
  const { t } = useTranslation("dashboard");

  if (!currentAutoRenew) {
    return (
      <Box sx={warningBox}>
        <ArrowDownwardOutlined sx={{ fontSize: 16, color: "#D97706", flexShrink: 0, mt: 0.2 }} />
        <Box>
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#92400E" }}>
            {t("pages.subscription.card.downgrade_scheduled", "Downgrade scheduled")}
          </Typography>
          <Typography sx={{ fontSize: "0.68rem", color: "#B45309", lineHeight: 1.4 }}>
            {t("pages.subscription.card.downgrade_detail", "This plan activates when your current plan expires.")}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <AppButton
      label={t("pages.subscription.card.downgrade_to", "Downgrade to this plan")}
      variant="outlined" fullWidth disabled={checkingOut}
      startIcon={<ArrowDownwardOutlined sx={{ fontSize: "16px !important" }} />}
      onClick={() => onDowngrade(plan, currentSubId)}
      sx={{
        borderColor: "#D97706", color: "#D97706",
        "&:hover": { bgcolor: "#FFFBEB", borderColor: "#B45309", color: "#B45309" },
        fontWeight: 700, borderRadius: "10px", py: 1.1,
        fontSize: "0.85rem", textTransform: "none",
      }}
    />
  );
};

export default DowngradeCta;
