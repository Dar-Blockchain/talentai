import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, Chip, Divider } from "@mui/material";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import CreditCardOutlined from "@mui/icons-material/CreditCardOutlined";
import { PlanLimit } from "@/store/slices/planLimitsSlice";
import AppButton from "@/components/ui/AppButton";
import { usePlanCard } from "../hooks/usePlanCard";
import { planCardSx, primaryBtnSx, activeBannerSx, badgeChipSx } from "./planCard.styles";
import FeatureRow from "./FeatureRow";
import AutoRenewalCta from "./AutoRenewalCta";
import DowngradeCta from "./DowngradeCta";

export interface PlanCardProps {
  plan: PlanLimit;
  activeSubscriptionId: string | null;
  autoRenew: boolean;
  cancelling: boolean;
  currentPlanName: string | null;
  currentSubId: string | null;
  currentAutoRenew: boolean;
  checkingOut: boolean;
  onCancelClick: (subscriptionId: string) => void;
  onEnableAutoRenewClick: (subscriptionId: string) => void;
  onContactUs: () => void;
  onDowngradeClick: (plan: PlanLimit, currentSubId: string) => void;
  onSubscribe: (planId: string) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan, activeSubscriptionId, autoRenew, cancelling,
  currentPlanName, currentSubId, currentAutoRenew, checkingOut,
  onCancelClick, onEnableAutoRenewClick, onContactUs, onDowngradeClick, onSubscribe,
}) => {
  const { t } = useTranslation("dashboard");
  const {
    cfg, isTrial, isEnterprise, isActive, isHighlighted, isDowngrade,
    priceLabel, badgeLabel, features,
  } = usePlanCard(plan, activeSubscriptionId, currentPlanName);

  return (
    <Box sx={planCardSx(cfg.color, isHighlighted, isActive)}>

      <Box sx={{ height: 5, bgcolor: cfg.color, flexShrink: 0 }} />

      {isHighlighted && (
        <Chip
          label={badgeLabel}
          size="small"
          icon={isActive ? <CheckCircleOutlined sx={{ fontSize: "13px !important" }} /> : undefined}
          sx={badgeChipSx(cfg.color)}
        />
      )}

      <Box sx={{ p: 3, display: "flex", flexDirection: "column", flex: 1 }}>

        <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "#111827", mb: 0.25, letterSpacing: "-0.01em" }}>
          {plan.name}
        </Typography>
        {plan.description && (
          <Typography sx={{ fontSize: "0.78rem", color: "#9CA3AF", lineHeight: 1.5, mb: 2.5, minHeight: 32 }}>
            {plan.description}
          </Typography>
        )}

        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.5, mb: 2.5 }}>
          <Typography sx={{ fontSize: (isTrial || isEnterprise) ? "1.6rem" : "2.4rem", fontWeight: 800, color: cfg.color, lineHeight: 1 }}>
            {priceLabel}
          </Typography>
          {!isTrial && !isEnterprise && (
            <Typography sx={{ color: "#9CA3AF", fontSize: "0.8rem", mb: 0.4 }}>
              {t("pages.subscription.card.per_month")}
            </Typography>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1.25, mb: 2.5 }}>
          {features.map(({ key, icon, label }) => (
            <FeatureRow key={key} icon={icon} label={label} color={cfg.color} />
          ))}
        </Box>

        {isActive ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={activeBannerSx(cfg.color)}>
              <CheckCircleOutlined sx={{ fontSize: 16, color: cfg.color }} />
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: cfg.color }}>
                {t("pages.subscription.card.current_plan_banner")}
              </Typography>
            </Box>
            {!isTrial && (
              <AutoRenewalCta
                autoRenew={autoRenew}
                cancelling={cancelling}
                subscriptionId={activeSubscriptionId!}
                onCancel={onCancelClick}
                onReEnable={onEnableAutoRenewClick}
              />
            )}
          </Box>
        ) : isEnterprise ? (
          <AppButton
            label={t("pages.subscription.card.contact_us")}
            variant="contained" fullWidth
            onClick={onContactUs}
            sx={primaryBtnSx(cfg.color)}
          />
        ) : !isTrial ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <AppButton
              label={t("pages.subscription.card.add_plan", "Add Plan")}
              variant="contained" fullWidth loading={checkingOut}
              startIcon={<CreditCardOutlined sx={{ fontSize: "16px !important" }} />}
              onClick={() => onSubscribe(plan._id)}
              sx={primaryBtnSx(cfg.color)}
            />
            {isDowngrade && currentSubId && (
              <DowngradeCta
                plan={plan}
                currentSubId={currentSubId}
                currentAutoRenew={currentAutoRenew}
                checkingOut={checkingOut}
                onDowngrade={onDowngradeClick}
              />
            )}
          </Box>
        ) : null}

      </Box>
    </Box>
  );
};

export default PlanCard;
