import React from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { Receipt } from "lucide-react";
import { Button } from "@/modules/shared/ui/shadcn/button";
import LoadingState from "@/modules/shared/ui/LoadingState";
import { usePlans } from "@/modules/company/plans/hooks";
import {
  SubscriptionBanner, PlanCard, ContactUsModal,
  CancelDialog, DowngradeDialog,
} from "@/modules/company/plans/components";
import { getDashboardLayout, PageHeader } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";
import type { PlanLimit } from "@/store/slices/planLimitsSlice";

const PlansPage: NextPageWithLayout = function PlansPage() {
  const { t } = useTranslation("dashboard");
  const {
    sortedPlans, plansLoading, combinedLoading, cancelling,
    activeSubByPlanName, currentPlanName, cancellingPlanName, checkingOut, checkingOutPlanId,
    confirmOpen, openCancelDialog, closeCancelDialog,
    contactOpen, setContactOpen,
    downgradePlan, openDowngradeDialog, closeDowngradeDialog,
    handleConfirmCancel, handleEnableAutoRenew,
    handleConfirmDowngrade, handleSubscribe,
  } = usePlans();

  return (
    <>
      <DowngradeDialog
        downgradePlan={downgradePlan}
        cancelling={cancelling}
        onClose={closeDowngradeDialog}
        onConfirm={handleConfirmDowngrade}
      />

      <CancelDialog
        open={confirmOpen}
        planName={cancellingPlanName}
        cancelling={cancelling}
        onClose={closeCancelDialog}
        onConfirm={handleConfirmCancel}
      />

      <PageHeader
        title={t("pages.subscription.title")}
        subtitle={t("pages.subscription.subtitle")}
        breadcrumbs={[
          { label: t("pages.common.dashboard"), href: "/company/dashboard" },
          { label: t("pages.subscription.settings_breadcrumb"), href: "/settings" },
          { label: t("pages.subscription.breadcrumb") },
        ]}
        actions={
          <Link href="/company/billing">
            <Button variant="outline">
              <Receipt size={18} />
              {t("pages.subscription.payment_history")}
            </Button>
          </Link>
        }
      />

      <SubscriptionBanner />

      {plansLoading || combinedLoading ? (
        <LoadingState message={t("pages.subscription.loading", "Loading plans…")} color="#0D9488" />
      ) : (
        <div className="mt-1 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {sortedPlans.map((plan: PlanLimit) => (
            <PlanCard
              key={plan._id}
              plan={plan}
              activeSubscriptionId={activeSubByPlanName[plan.name]?.id ?? null}
              autoRenew={activeSubByPlanName[plan.name]?.autoRenew ?? true}
              cancelling={cancelling}
              currentPlanName={currentPlanName}
              currentSubId={currentPlanName ? (activeSubByPlanName[currentPlanName]?.id ?? null) : null}
              currentAutoRenew={currentPlanName ? (activeSubByPlanName[currentPlanName]?.autoRenew ?? true) : true}
              checkingOut={checkingOut}
              isCheckingOutThis={checkingOutPlanId === plan._id}
              onCancelClick={openCancelDialog}
              onEnableAutoRenewClick={handleEnableAutoRenew}
              onContactUs={() => setContactOpen(true)}
              onDowngradeClick={openDowngradeDialog}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>
      )}

      <ContactUsModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
};
PlansPage.getLayout = getDashboardLayout;

export default PlansPage;
