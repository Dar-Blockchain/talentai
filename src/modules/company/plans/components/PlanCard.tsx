import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, CreditCard } from "lucide-react";
import { PlanLimit } from "@/store/slices/planLimitsSlice";
import AppButton from "@/components/ui/AppButton";
import { usePlanCard } from "../hooks/usePlanCard";
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
    <div
      className="group relative flex h-full flex-col overflow-hidden rounded-[20px] border-2 bg-white transition-all duration-200 hover:-translate-y-[3px]"
      style={{
        borderColor: isHighlighted ? cfg.color : "#E5E7EB",
        boxShadow: isActive
          ? `0 8px 32px ${cfg.color}28`
          : isHighlighted
            ? `0 12px 40px ${cfg.color}22`
            : "0 2px 8px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 16px 48px ${cfg.color}28`;
        e.currentTarget.style.borderColor = cfg.color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isHighlighted ? cfg.color : "#E5E7EB";
        e.currentTarget.style.boxShadow = isActive
          ? `0 8px 32px ${cfg.color}28`
          : isHighlighted
            ? `0 12px 40px ${cfg.color}22`
            : "0 2px 8px rgba(0,0,0,0.06)";
      }}
    >
      <div className="h-[5px] flex-shrink-0" style={{ backgroundColor: cfg.color }} />

      {isHighlighted && (
        <span
          className="absolute right-4 top-[17px] flex h-[22px] items-center gap-1 rounded-full px-2.5 text-[0.68rem] font-bold tracking-wide text-white"
          style={{ backgroundColor: cfg.color }}
        >
          {isActive && <CheckCircle size={13} />}
          {badgeLabel}
        </span>
      )}

      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-0.5 text-[1.05rem] font-extrabold tracking-tight text-gray-900">
          {plan.name}
        </h3>
        {plan.description && (
          <p className="mb-5 min-h-[32px] text-[0.78rem] leading-relaxed text-gray-400">
            {plan.description}
          </p>
        )}

        <div className="mb-5 flex items-end gap-1">
          <span
            className="font-extrabold leading-none"
            style={{ color: cfg.color, fontSize: isTrial || isEnterprise ? "1.6rem" : "2.4rem" }}
          >
            {priceLabel}
          </span>
          {!isTrial && !isEnterprise && (
            <span className="mb-1 text-[0.8rem] text-gray-400">
              {t("pages.subscription.card.per_month")}
            </span>
          )}
        </div>

        <hr className="mb-4 border-gray-200" />

        <div className="mb-5 flex flex-1 flex-col gap-3">
          {features.map(({ key, icon, label }) => (
            <FeatureRow key={key} icon={icon} label={label} color={cfg.color} />
          ))}
        </div>

        {isActive ? (
          <div className="flex flex-col gap-2">
            <div
              className="flex items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] py-2.5"
              style={{ backgroundColor: `${cfg.color}10`, borderColor: `${cfg.color}30` }}
            >
              <CheckCircle size={16} style={{ color: cfg.color }} />
              <span className="text-[0.82rem] font-bold" style={{ color: cfg.color }}>
                {t("pages.subscription.card.current_plan_banner")}
              </span>
            </div>
            {!isTrial && (
              <AutoRenewalCta
                autoRenew={autoRenew}
                cancelling={cancelling}
                subscriptionId={activeSubscriptionId!}
                onCancel={onCancelClick}
                onReEnable={onEnableAutoRenewClick}
              />
            )}
          </div>
        ) : isEnterprise ? (
          <AppButton
            label={t("pages.subscription.card.contact_us")}
            variant="contained" fullWidth
            onClick={onContactUs}
            sx={{
              bgcolor: cfg.color,
              "&:hover": { bgcolor: cfg.color, filter: "brightness(0.88)" },
              fontWeight: 700, borderRadius: "10px", py: 1.1,
              fontSize: "0.85rem", boxShadow: `0 4px 14px ${cfg.color}30`,
              textTransform: "none",
            }}
          />
        ) : !isTrial ? (
          <div className="flex flex-col gap-2">
            <AppButton
              label={t("pages.subscription.card.add_plan", "Add Plan")}
              variant="contained" fullWidth loading={checkingOut}
              startIcon={<CreditCard size={16} />}
              onClick={() => onSubscribe(plan._id)}
              sx={{
                bgcolor: cfg.color,
                "&:hover": { bgcolor: cfg.color, filter: "brightness(0.88)" },
                fontWeight: 700, borderRadius: "10px", py: 1.1,
                fontSize: "0.85rem", boxShadow: `0 4px 14px ${cfg.color}30`,
                textTransform: "none",
              }}
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
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PlanCard;
