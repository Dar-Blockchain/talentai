import React from "react";
import { useTranslation } from "react-i18next";
import { CreditCard } from "lucide-react";
import { PlanLimit } from "@/store/slices/planLimitsSlice";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { ACCENT } from "../constants";
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
  isCheckingOutThis: boolean;
  onCancelClick: (subscriptionId: string) => void;
  onEnableAutoRenewClick: (subscriptionId: string) => void;
  onContactUs: () => void;
  onDowngradeClick: (plan: PlanLimit, currentSubId: string) => void;
  onSubscribe: (planId: string) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan, activeSubscriptionId, autoRenew, cancelling,
  currentPlanName, currentSubId, currentAutoRenew, checkingOut, isCheckingOutThis,
  onCancelClick, onEnableAutoRenewClick, onContactUs, onDowngradeClick, onSubscribe,
}) => {
  const { t } = useTranslation("dashboard");
  const {
    isTrial, isEnterprise, isActive, isHighlighted, isDowngrade, isUpgrade,
    priceLabel, badgeLabel, features,
  } = usePlanCard(plan, activeSubscriptionId, currentPlanName);

  // Color carries meaning: the accent is reserved for "this is your plan"
  // (isActive). "Popular"/"Enterprise" are editorial labels, not user state,
  // so they get a neutral gray highlight instead of competing for the accent.
  const highlightColor = isActive ? ACCENT : "#4B5563";

  return (
    <div
      className="relative flex h-full flex-col rounded-2xl border bg-white transition-shadow duration-200 hover:shadow-md"
      style={{
        borderColor: isActive ? highlightColor : "#E5E7EB",
        boxShadow: isActive ? `0 0 0 1px ${highlightColor}` : undefined,
      }}
    >
      {isHighlighted && (
        <span
          className="absolute right-4 top-4 flex h-[22px] items-center gap-1 rounded-full px-2.5 text-[0.68rem] font-bold tracking-wide text-white"
          style={{ backgroundColor: highlightColor }}
        >
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
            className="font-extrabold leading-none text-gray-900"
            style={{ fontSize: isTrial || isEnterprise ? "1.6rem" : "2.4rem" }}
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
            <FeatureRow key={key} icon={icon} label={label} />
          ))}
        </div>

        {isActive ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-1.5 rounded-[10px] bg-gray-50 py-2.5">
              <span className="text-[0.82rem] font-bold text-gray-700">
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
          <Button variant="default" className="w-full" onClick={onContactUs}>
            {t("pages.subscription.card.contact_us")}
          </Button>
        ) : !isTrial ? (
          <div className="flex flex-col gap-2">
            {isDowngrade ? (
              currentSubId && (
                <DowngradeCta
                  plan={plan}
                  currentSubId={currentSubId}
                  currentAutoRenew={currentAutoRenew}
                  checkingOut={checkingOut}
                  onDowngrade={onDowngradeClick}
                />
              )
            ) : (
              <Button
                variant="default"
                className="w-full"
                loading={isCheckingOutThis}
                onClick={() => onSubscribe(plan._id)}
              >
                <CreditCard size={16} />
                {isUpgrade
                  ? t("pages.subscription.card.upgrade_to_plan", "Upgrade to this plan")
                  : t("pages.subscription.card.add_plan", "Subscribe")}
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PlanCard;
