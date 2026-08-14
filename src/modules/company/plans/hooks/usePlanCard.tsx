import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Video, Briefcase, Sparkles } from "lucide-react";
import { PlanLimit } from "@/store/slices/planLimitsSlice";
import { PLAN_CONFIG, ORDERED_PLANS } from "../constants";

export function usePlanCard(
  plan: PlanLimit,
  activeSubscriptionId: string | null,
  currentPlanName: string | null,
) {
  const { t, i18n } = useTranslation("dashboard");

  const cfg          = PLAN_CONFIG[plan.name] ?? {};
  const isTrial      = plan.priceUsd === 0;
  const isEnterprise = plan.name === "Unlimited";
  const isPopular    = cfg.badge === "Popular";
  const isActive     = !!activeSubscriptionId || (isTrial && currentPlanName === "Trial");
  const isHighlighted = isActive || isPopular || isEnterprise;
  const isDowngrade  = !isActive
    && currentPlanName !== null
    && ORDERED_PLANS.indexOf(plan.name) < ORDERED_PLANS.indexOf(currentPlanName);
  // An "upgrade" target: the company already holds a paid (non-Trial) plan
  // and this card is a strictly higher tier. Only upgrades may be purchased
  // while a plan is active — see subscriptionService.assertUpgradeEligible.
  const isUpgrade = !isActive
    && currentPlanName !== null
    && currentPlanName !== "Trial"
    && ORDERED_PLANS.indexOf(plan.name) > ORDERED_PLANS.indexOf(currentPlanName);

  const priceLocale = i18n.language?.startsWith("fr") ? "fr-FR" : "en-US";

  const priceLabel = isTrial
    ? t("pages.subscription.card.trial_label")
    : isEnterprise
      ? t("pages.subscription.card.contact_us")
      : `$${plan.priceUsd?.toLocaleString(priceLocale)}`;

  const badgeLabel = isActive
    ? t("pages.subscription.card.active_badge")
    : isEnterprise
      ? t("pages.subscription.card.enterprise_badge")
      : t("pages.subscription.card.popular_badge");

  const features = useMemo(() => [
    {
      key: "interviews",
      icon: <Video size={15} />,
      label: plan.monthlyInterviewLimit === -1
        ? t("pages.subscription.card.interviews_unlimited")
        : t("pages.subscription.card.interviews_month", { count: plan.monthlyInterviewLimit }),
    },
    {
      key: "posts",
      icon: <Briefcase size={15} />,
      label: plan.postsLimit === -1
        ? t("pages.subscription.card.job_posts_unlimited")
        : t("pages.subscription.card.job_posts", { count: plan.postsLimit }),
    },
    {
      key: "generations",
      icon: <Sparkles size={15} />,
      label: plan.postGenerationsLimit === -1
        ? t("pages.subscription.card.generations_unlimited")
        : t("pages.subscription.card.generations_month", { count: plan.postGenerationsLimit }),
    },
  ], [plan.monthlyInterviewLimit, plan.postsLimit, plan.postGenerationsLimit, t]);

  return {
    cfg, isTrial, isEnterprise, isPopular, isActive, isHighlighted, isDowngrade, isUpgrade,
    priceLabel, badgeLabel, features,
  };
}
