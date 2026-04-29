'use client';
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Link from "next/link";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import { AppDispatch } from "@/store/store";
import { fetchPlanLimits, selectPlanLimits, selectPlanLimitsLoading, PlanLimit } from "@/store/slices/planLimitsSlice";
import { getMyProfile } from "@/store/slices/userSlice";
import { payWithCard } from "@/services/stripeService";
import {
  verifyPayment, cancelSubscription, enableAutoRenew, selectCancellingSubscription,
  fetchCombinedSubscriptionDetails, selectCombinedDetails, selectCombinedDetailsLoading,
} from "@/store/slices/paymentSlice";
import {
  Box, Grid, Typography, Chip, Divider, CircularProgress, Alert, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, LinearProgress,
} from "@mui/material";
import AppButton from "@/components/ui/AppButton";

const CreditCardOutlined    = dynamic(() => import("@mui/icons-material/CreditCardOutlined"));
const ReceiptLongOutlined   = dynamic(() => import("@mui/icons-material/ReceiptLongOutlined"));
const WorkOutlined          = dynamic(() => import("@mui/icons-material/WorkOutlined"));
const VideoCallOutlined     = dynamic(() => import("@mui/icons-material/VideoCallOutlined"));
const CheckCircleOutlined   = dynamic(() => import("@mui/icons-material/CheckCircleOutlined"));
const CalendarTodayOutlined = dynamic(() => import("@mui/icons-material/CalendarTodayOutlined"));
const AddCircleOutlined        = dynamic(() => import("@mui/icons-material/AddCircleOutlined"));
const NotificationsOffOutlined = dynamic(() => import("@mui/icons-material/NotificationsOffOutlined"));

// ─── Constants ───────────────────────────────────────────

const PLAN_CONFIG: Record<string, { color: string; badge?: string }> = {
  Free:      { color: "#6B7280" },
  Starter:   { color: "#0D9488" },
  Pro:       { color: "#7C3AED", badge: "Popular" },
  Business:  { color: "#0891B2" },
  Unlimited: { color: "#D97706" },
};

const ORDERED_PLANS = ["Free", "Starter", "Pro", "Business", "Unlimited"];

// ─── Combined Subscription Banner ────────────────────────

const SubscriptionBanner: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const combined = useSelector(selectCombinedDetails);
  const loading  = useSelector(selectCombinedDetailsLoading);

  if (loading) return (
    <Box sx={{ mb: 3, borderRadius: 3, bgcolor: "#fff", border: "1px solid #f3f4f6", p: 3, display: "flex", justifyContent: "center" }}>
      <CircularProgress size={20} />
    </Box>
  );
  if (!combined || !combined.subscriptions.length) return null;

  const { subscriptions, combined: c } = combined;
  // Filter out orphaned subs whose planId was deleted (planName undefined)
  const validSubs = subscriptions.filter((s) => !!s.planName);
  if (!validSubs.length) return null;

  const multiPlan = validSubs.length > 1;
  const primaryColor = PLAN_CONFIG[c.planNames[0]]?.color ?? "#0D9488";

  const postsPct      = c.usage.posts.limit > 0 ? Math.min(100, Math.round((c.usage.posts.used / c.usage.posts.limit) * 100)) : 0;
  const intPct        = c.usage.monthlyInterviews.limit > 0 ? Math.min(100, Math.round((c.usage.monthlyInterviews.used / c.usage.monthlyInterviews.limit) * 100)) : 0;
  const fmt           = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <Box sx={{ mb: 3, borderRadius: 3, bgcolor: "#fff", border: `1.5px solid ${primaryColor}30`, boxShadow: `0 4px 20px ${primaryColor}18`, overflow: "hidden" }}>
      <Box sx={{ height: 4, background: multiPlan ? `linear-gradient(90deg, ${c.planNames.map((n, i) => `${PLAN_CONFIG[n]?.color ?? "#0D9488"} ${Math.round(i * 100 / c.planNames.length)}%, ${PLAN_CONFIG[n]?.color ?? "#0D9488"} ${Math.round((i + 1) * 100 / c.planNames.length)}%`).join(", ")})` : primaryColor }} />
      <Box sx={{ p: 3 }}>

        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 2.5 }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <CheckCircleOutlined sx={{ color: primaryColor, fontSize: 20 }} />
              <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#111827" }}>
                {multiPlan ? `${validSubs.length} Active Plans` : `Active — ${c.planNames.filter(Boolean)[0] ?? validSubs[0]?.planName ?? "Plan"}`}
              </Typography>
            </Box>
            {/* Per-plan chips */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {validSubs.map((s) => {
                const col = PLAN_CONFIG[s.planName]?.color ?? "#6b7280";
                return (
                  <Chip
                    key={s.id}
                    label={`${s.planName} · ${t("pages.plans.banner.expires", { date: fmt(s.endDate) })}`}
                    size="small"
                    sx={{ bgcolor: `${col}12`, color: col, fontWeight: 600, fontSize: "0.72rem" }}
                  />
                );
              })}
            </Box>
          </Box>
          <Chip
            icon={<CalendarTodayOutlined sx={{ fontSize: "13px !important" }} />}
            label={t("pages.plans.banner.days_remaining", { count: c.daysRemaining })}
            size="small"
            sx={{ bgcolor: `${primaryColor}12`, color: primaryColor, fontWeight: 600, fontSize: "0.75rem", "& .MuiChip-icon": { color: primaryColor } }}
          />
        </Box>

        {/* Combined usage bars */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography sx={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 500 }}>
                  {t("pages.plans.banner.job_posts_used")} {multiPlan && <span style={{ color: "#9ca3af" }}>{t("pages.plans.banner.combined")}</span>}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: primaryColor, fontWeight: 700 }}>
                {c.usage.posts.limit === -1 ? "∞" : `${postsPct}%`}
              </Typography>
              </Box>
              <LinearProgress variant="determinate" value={c.usage.posts.limit === -1 ? 0 : postsPct}
                sx={{ height: 6, borderRadius: 3, bgcolor: "#f3f4f6", "& .MuiLinearProgress-bar": { bgcolor: postsPct >= 90 ? "#ef4444" : primaryColor, borderRadius: 3 } }} />
              <Typography sx={{ fontSize: "0.7rem", color: "#9ca3af", mt: 0.5 }}>
                {c.usage.posts.limit === -1
                  ? `${c.usage.posts.used} used · Unlimited`
                  : `${c.usage.posts.used} / ${c.usage.posts.limit} posts · ${c.usage.posts.remaining} remaining`}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography sx={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 500 }}>
                  {t("pages.plans.banner.interviews_month")} {multiPlan && <span style={{ color: "#9ca3af" }}>{t("pages.plans.banner.combined")}</span>}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: intPct >= 90 ? "#ef4444" : primaryColor, fontWeight: 700 }}>
                {c.usage.monthlyInterviews.limit === -1 ? "∞" : `${intPct}%`}
              </Typography>
              </Box>
              <LinearProgress variant="determinate" value={c.usage.monthlyInterviews.limit === -1 ? 0 : intPct}
                sx={{ height: 6, borderRadius: 3, bgcolor: "#f3f4f6", "& .MuiLinearProgress-bar": { bgcolor: intPct >= 90 ? "#ef4444" : primaryColor, borderRadius: 3 } }} />
              <Typography sx={{ fontSize: "0.7rem", color: "#9ca3af", mt: 0.5 }}>
                {c.usage.monthlyInterviews.limit === -1
                  ? `${c.usage.monthlyInterviews.used} used · Unlimited`
                  : `${c.usage.monthlyInterviews.used} / ${c.usage.monthlyInterviews.limit} interviews · ${c.usage.monthlyInterviews.remaining} remaining`}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

// ─── Plan card ───────────────────────────────────────────

interface PlanCardProps {
  plan: PlanLimit;
  activeSubscriptionId: string | null;
  autoRenew: boolean;
  cancelling: boolean;
  onCancelClick: (subscriptionId: string) => void;
  onEnableAutoRenewClick: (subscriptionId: string) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, activeSubscriptionId, autoRenew, cancelling, onCancelClick, onEnableAutoRenewClick }) => {
  const { t } = useTranslation("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const cfg      = PLAN_CONFIG[plan.name] ?? { color: "#6b7280" };
  const isActive = !!activeSubscriptionId;
  const isPopular = cfg.badge === "Popular";
  const isFree    = plan.priceUsd === 0;

  const priceLabel = isFree ? "Free" : plan.priceUsd != null ? `$${plan.priceUsd.toLocaleString("en-US")}` : "Contact us";

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      await payWithCard(plan._id);
    } catch (err: any) {
      setError(err?.message || t("pages.plans.card.payment_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      backgroundColor: "#fff",
      borderRadius: "20px",
      border: `2px solid ${isActive ? cfg.color : isPopular ? cfg.color : "#E5E7EB"}`,
      boxShadow: isActive
        ? `0 8px 32px ${cfg.color}28`
        : isPopular
        ? `0 12px 40px ${cfg.color}22`
        : "0 2px 8px rgba(0,0,0,0.06)",
      display: "flex", flexDirection: "column", height: "100%",
      position: "relative", transition: "box-shadow 0.2s, transform 0.2s, border-color 0.2s",
      overflow: "hidden",
      "&:hover": { boxShadow: `0 16px 48px ${cfg.color}28`, transform: "translateY(-3px)", borderColor: cfg.color },
    }}>

      {/* Top color bar */}
      <Box sx={{ height: 5, bgcolor: cfg.color, flexShrink: 0 }} />

      {/* Badge */}
      {(isActive || isPopular) && (
        <Chip
          label={isActive ? "Active" : "Popular"}
          size="small"
          icon={isActive ? <CheckCircleOutlined sx={{ fontSize: "13px !important" }} /> : undefined}
          sx={{
            position: "absolute", top: 17, right: 16,
            bgcolor: cfg.color, color: "#fff", fontWeight: 700, fontSize: "0.68rem",
            letterSpacing: 0.4, height: 22, "& .MuiChip-icon": { color: "#fff" },
          }}
        />
      )}

      <Box sx={{ p: 3, display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Plan name */}
        <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "#111827", mb: 0.25, letterSpacing: "-0.01em" }}>
          {plan.name}
        </Typography>
        {plan.description && (
          <Typography sx={{ fontSize: "0.78rem", color: "#9CA3AF", lineHeight: 1.5, mb: 2.5, minHeight: 32 }}>
            {plan.description}
          </Typography>
        )}

        {/* Price */}
        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.5, mb: 2.5 }}>
          <Typography sx={{ fontSize: isFree ? "2rem" : "2.4rem", fontWeight: 800, color: cfg.color, lineHeight: 1 }}>
            {priceLabel}
          </Typography>
          {!isFree && (
            <Typography sx={{ color: "#9CA3AF", fontSize: "0.8rem", mb: 0.4 }}> / mo</Typography>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Features */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1.25, mb: 2.5 }}>
          {[
            {
              icon: <VideoCallOutlined sx={{ fontSize: 15 }} />,
              label: `${plan.monthlyInterviewLimit} AI interviews / month`,
            },
            {
              icon: <WorkOutlined sx={{ fontSize: 15 }} />,
              label: plan.postsLimit === -1 ? "Unlimited job posts" : `${plan.postsLimit} job post${plan.postsLimit !== 1 ? "s" : ""}`,
            },
          ].map(({ icon, label }) => (
            <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{
                width: 24, height: 24, borderRadius: "6px", flexShrink: 0,
                bgcolor: `${cfg.color}12`, border: `1px solid ${cfg.color}22`,
                display: "flex", alignItems: "center", justifyContent: "center", color: cfg.color,
              }}>
                {icon}
              </Box>
              <Typography sx={{ fontSize: "0.82rem", color: "#374151", fontWeight: 500 }}>{label}</Typography>
            </Box>
          ))}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 1.5, fontSize: "0.75rem", py: 0.4 }}>{error}</Alert>}

        {/* CTA */}
        {isActive ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75,
              py: 1.1, borderRadius: "10px",
              bgcolor: `${cfg.color}10`, border: `1.5px solid ${cfg.color}30`,
            }}>
              <CheckCircleOutlined sx={{ fontSize: 16, color: cfg.color }} />
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: cfg.color }}>Current Plan</Typography>
            </Box>
            {plan.name !== "Free" && (autoRenew ? (
              <AppButton
                label={cancelling ? "Processing…" : "Disable Auto-Renewal"}
                variant="outlined"
                fullWidth
                disabled={cancelling}
                startIcon={cancelling ? <CircularProgress size={14} color="inherit" /> : undefined}
                onClick={() => onCancelClick(activeSubscriptionId!)}
                sx={{
                  borderColor: "#EF4444", color: "#EF4444", fontWeight: 600, borderRadius: "10px",
                  py: 0.9, fontSize: "0.78rem", "&:hover": { bgcolor: "#FEF2F2", borderColor: "#DC2626" },
                }}
              />
            ) : (
              <Box sx={{
                display: "flex", alignItems: "center", gap: 1,
                px: 1.5, py: 1, borderRadius: "10px",
                bgcolor: "#FFFBEB", border: "1px solid #FDE68A",
              }}>
                <NotificationsOffOutlined sx={{ fontSize: 16, color: "#D97706", flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: "0.73rem", fontWeight: 700, color: "#92400E" }}>Auto-renewal off</Typography>
                  <Typography sx={{ fontSize: "0.68rem", color: "#B45309" }}>Won't renew after expiry</Typography>
                </Box>
                <AppButton
                  label={cancelling ? "…" : "Re-enable"}
                  variant="contained"
                  disabled={cancelling}
                  onClick={() => onEnableAutoRenewClick(activeSubscriptionId!)}
                  sx={{
                    bgcolor: "#D97706", "&:hover": { bgcolor: "#B45309" },
                    fontWeight: 700, borderRadius: "8px", py: 0.4, px: 1.25,
                    fontSize: "0.68rem", minWidth: 0, flexShrink: 0,
                  }}
                />
              </Box>
            ))}
          </Box>
        ) : (
          <AppButton
            label={loading ? "Redirecting…" : isFree ? "Get Started Free" : "Get Started"}
            variant="contained"
            fullWidth
            disabled={loading}
            startIcon={loading ? <CircularProgress size={15} color="inherit" /> : <CreditCardOutlined sx={{ fontSize: "16px !important" }} />}
            onClick={handleSubscribe}
            sx={{
              bgcolor: cfg.color, "&:hover": { bgcolor: cfg.color, filter: "brightness(0.88)" },
              fontWeight: 700, borderRadius: "10px", py: 1.1, fontSize: "0.85rem",
              boxShadow: `0 4px 14px ${cfg.color}30`,
              textTransform: "none",
            }}
          />
        )}
      </Box>
    </Box>
  );
};

// ─── Page ────────────────────────────────────────────────

const PlansPage: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const dispatch     = useDispatch<AppDispatch>();
  const router       = useRouter();
  const plans        = useSelector(selectPlanLimits);
  const plansLoading = useSelector(selectPlanLimitsLoading);
  const cancelling   = useSelector(selectCancellingSubscription);
  const combined     = useSelector(selectCombinedDetails);

  const [snackbar, setSnackbar]         = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });
  const [confirmOpen, setConfirmOpen]   = useState(false);
  const [cancelSubId, setCancelSubId]   = useState<string | null>(null);

  const showSnack = (message: string, severity: "success" | "error") =>
    setSnackbar({ open: true, message, severity });

  const refreshAll = () => {
    dispatch(getMyProfile());
    dispatch(fetchPlanLimits());
    dispatch(fetchCombinedSubscriptionDetails());
  };

  useEffect(() => {
    dispatch(fetchPlanLimits());
    dispatch(fetchCombinedSubscriptionDetails());
  }, [dispatch]);

  useEffect(() => {
    if (!router.isReady) return;
    const { status, session_id } = router.query;
    if (status === "success" && session_id) {
      dispatch(verifyPayment({ sessionId: session_id as string }))
        .unwrap()
        .then(() => {
          localStorage.removeItem("pending_payment_id");
          showSnack(t("pages.plans.snack.payment_success"), "success");
          refreshAll();
        })
        .catch(() => showSnack(t("pages.plans.snack.payment_verify_error"), "error"));
      router.replace("/company/plans", undefined, { shallow: true });
    } else if (status === "cancel") {
      showSnack(t("pages.plans.snack.payment_cancelled"), "error");
      router.replace("/company/plans", undefined, { shallow: true });
    }
  }, [router.isReady]);

  const handleCancelClick = (subscriptionId: string) => {
    setCancelSubId(subscriptionId);
    setConfirmOpen(true);
  };

  const handleEnableAutoRenew = (subscriptionId: string) => {
    dispatch(enableAutoRenew({ subscriptionId }))
      .unwrap()
      .then(() => {
        showSnack(t("pages.plans.snack.auto_renew_enabled"), "success");
        refreshAll();
      })
      .catch(() => showSnack(t("pages.plans.snack.auto_renew_error"), "error"));
  };

  const handleConfirmCancel = () => {
    if (!cancelSubId) return;
    dispatch(cancelSubscription({ subscriptionId: cancelSubId }))
      .unwrap()
      .then(() => {
        setConfirmOpen(false);
        setCancelSubId(null);
        showSnack(t("pages.plans.snack.cancelled"), "success");
        refreshAll();
      })
      .catch(() => {
        setConfirmOpen(false);
        setCancelSubId(null);
        showSnack(t("pages.plans.snack.cancel_error"), "error");
      });
  };

  // Build planName → { id, autoRenew } map from combined data
  const activeSubByPlanName = React.useMemo(() => {
    const map: Record<string, { id: string; autoRenew: boolean }> = {};
    combined?.subscriptions
      .filter((s) => !!s.planName)
      .forEach((s) => { map[s.planName] = { id: s.id, autoRenew: s.autoRenew }; });
    return map;
  }, [combined]);

  const cancellingPlanName = cancelSubId
    ? combined?.subscriptions.find((s) => s.id === cancelSubId)?.planName ?? t("pages.plans.this_plan")
    : t("pages.plans.this_plan");

  const sortedPlans = [...plans]
    .filter((p) => p.name !== "Trial")
    .sort((a, b) => (ORDERED_PLANS.indexOf(a.name) ?? 99) - (ORDERED_PLANS.indexOf(b.name) ?? 99));

  return (
    <DashboardLayout>
      {/* Cancel confirm dialog */}
      <Dialog open={confirmOpen} onClose={() => { setConfirmOpen(false); setCancelSubId(null); }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{t("pages.plans.dialog.title")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("pages.plans.dialog.text", { plan: cancellingPlanName })}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <AppButton label={t("pages.plans.dialog.keep")} variant="outlined" onClick={() => { setConfirmOpen(false); setCancelSubId(null); }} />
          <AppButton
            label={cancelling ? t("pages.plans.card.processing") : t("pages.plans.dialog.confirm")}
            variant="contained"
            disabled={cancelling}
            onClick={handleConfirmCancel}
            sx={{ bgcolor: "#ef4444", "&:hover": { bgcolor: "#dc2626" } }}
          />
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} sx={{ fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <PageHeader
        title={t("pages.plans.title")}
        subtitle={t("pages.plans.subtitle")}
        breadcrumbs={[
          { label: t("pages.common.dashboard"), href: "/company/dashboard" },
          { label: t("pages.plans.settings_breadcrumb"), href: "/company/settings" },
          { label: t("pages.plans.breadcrumb") },
        ]}
        actions={
          <Link href="/company/billing">
            <AppButton label={t("pages.plans.payment_history")} variant="outlined" startIcon={<ReceiptLongOutlined />} />
          </Link>
        }
      />

      {/* Combined subscription usage banner */}
      <SubscriptionBanner />

      {plansLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
          {sortedPlans.map((plan) => (
            <Grid key={plan._id} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
              <PlanCard
                plan={plan}
                activeSubscriptionId={activeSubByPlanName[plan.name]?.id ?? null}
                autoRenew={activeSubByPlanName[plan.name]?.autoRenew ?? true}
                cancelling={cancelling}
                onCancelClick={handleCancelClick}
                onEnableAutoRenewClick={handleEnableAutoRenew}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </DashboardLayout>
  );
};

export default PlansPage;
