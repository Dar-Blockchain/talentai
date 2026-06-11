import React from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { Grid } from "@mui/material";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import AppButton from "@/components/ui/AppButton";
import MuiToast from "@/components/ui/Toast";
import LoadingState from "@/components/ui/LoadingState";
import { usePlans } from "@/modules/company/plans/hooks";
import {
  SubscriptionBanner, PlanCard, ContactUsModal,
  CancelDialog, DowngradeDialog,
} from "@/modules/company/plans/components";
import { DashboardLayout, PageHeader } from "@/modules/shared/layouts";

export default function PlansPage() {
  const { t } = useTranslation("dashboard");
  const {
    sortedPlans, plansLoading, combinedLoading, cancelling,
    activeSubByPlanName, currentPlanName, cancellingPlanName, checkingOut,
    snackbar, setSnackbar,
    confirmOpen, openCancelDialog, closeCancelDialog,
    contactOpen, setContactOpen,
    downgradePlan, openDowngradeDialog, closeDowngradeDialog,
    handleConfirmCancel, handleEnableAutoRenew,
    handleConfirmDowngrade, handleSubscribe,
  } = usePlans();

  return (
    <DashboardLayout>
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

      <MuiToast
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
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
            <AppButton
              label={t("pages.subscription.payment_history")}
              variant="outlined"
              startIcon={<ReceiptLongOutlined />}
            />
          </Link>
        }
      />

      <SubscriptionBanner />

      {plansLoading || combinedLoading ? (
        <LoadingState message={t("pages.subscription.loading", "Loading plans…")} color="#0D9488" />
      ) : (
        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
          {sortedPlans.map((plan: any) => (
            <Grid key={plan._id} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
              <PlanCard
                plan={plan}
                activeSubscriptionId={activeSubByPlanName[plan.name]?.id ?? null}
                autoRenew={activeSubByPlanName[plan.name]?.autoRenew ?? true}
                cancelling={cancelling}
                currentPlanName={currentPlanName}
                currentSubId={currentPlanName ? (activeSubByPlanName[currentPlanName]?.id ?? null) : null}
                currentAutoRenew={currentPlanName ? (activeSubByPlanName[currentPlanName]?.autoRenew ?? true) : true}
                checkingOut={checkingOut}
                onCancelClick={openCancelDialog}
                onEnableAutoRenewClick={handleEnableAutoRenew}
                onContactUs={() => setContactOpen(true)}
                onDowngradeClick={openDowngradeDialog}
                onSubscribe={handleSubscribe}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <ContactUsModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </DashboardLayout>
  );
}
