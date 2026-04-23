'use client';
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  verifyPayment, cancelSubscription, selectCancellingSubscription,
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
const AddCircleOutlined     = dynamic(() => import("@mui/icons-material/AddCircleOutlined"));

// ─── Constants ───────────────────────────────────────────

const PLAN_CONFIG: Record<string, { color: string; badge?: string }> = {
  Standard: { color: "#0D9488" },
  Gold:     { color: "#7C3AED", badge: "Popular" },
  Platinum: { color: "#0891B2" },
  Diamond:  { color: "#D97706" },
};

const ORDERED_PLANS = ["Standard", "Gold", "Platinum", "Diamond"];

// ─── Combined Subscription Banner ────────────────────────

const SubscriptionBanner: React.FC = () => {
  const combined = useSelector(selectCombinedDetails);
  const loading  = useSelector(selectCombinedDetailsLoading);

  if (loading) return (
    <Box sx={{ mb: 3, borderRadius: 3, bgcolor: "#fff", border: "1px solid #f3f4f6", p: 3, display: "flex", justifyContent: "center" }}>
      <CircularProgress size={20} />
    </Box>
  );
  if (!combined || !combined.subscriptions.length) return null;

  const { subscriptions, combined: c } = combined;
  const multiPlan = subscriptions.length > 1;
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
                {multiPlan ? `${subscriptions.length} Active Plans` : `Active — ${c.planNames[0]}`}
              </Typography>
            </Box>
            {/* Per-plan chips */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {subscriptions.map((s) => {
                const col = PLAN_CONFIG[s.planName]?.color ?? "#6b7280";
                return (
                  <Chip
                    key={s.id}
                    label={`${s.planName} · expires ${fmt(s.endDate)}`}
                    size="small"
                    sx={{ bgcolor: `${col}12`, color: col, fontWeight: 600, fontSize: "0.72rem" }}
                  />
                );
              })}
            </Box>
          </Box>
          <Chip
            icon={<CalendarTodayOutlined sx={{ fontSize: "13px !important" }} />}
            label={`${c.daysRemaining} day${c.daysRemaining !== 1 ? "s" : ""} until next expiry`}
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
                  Job posts used {multiPlan && <span style={{ color: "#9ca3af" }}>(combined)</span>}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: postsPct >= 90 ? "#ef4444" : primaryColor, fontWeight: 700 }}>{postsPct}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={postsPct}
                sx={{ height: 6, borderRadius: 3, bgcolor: "#f3f4f6", "& .MuiLinearProgress-bar": { bgcolor: postsPct >= 90 ? "#ef4444" : primaryColor, borderRadius: 3 } }} />
              <Typography sx={{ fontSize: "0.7rem", color: "#9ca3af", mt: 0.5 }}>
                {c.usage.posts.used} / {c.usage.posts.limit} posts · {c.usage.posts.remaining} remaining
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography sx={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 500 }}>
                  Interviews this month {multiPlan && <span style={{ color: "#9ca3af" }}>(combined)</span>}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: intPct >= 90 ? "#ef4444" : primaryColor, fontWeight: 700 }}>{intPct}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={intPct}
                sx={{ height: 6, borderRadius: 3, bgcolor: "#f3f4f6", "& .MuiLinearProgress-bar": { bgcolor: intPct >= 90 ? "#ef4444" : primaryColor, borderRadius: 3 } }} />
              <Typography sx={{ fontSize: "0.7rem", color: "#9ca3af", mt: 0.5 }}>
                {c.usage.monthlyInterviews.used} / {c.usage.monthlyInterviews.limit} interviews · {c.usage.monthlyInterviews.remaining} remaining
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

// ─── Plan card ───────────────────────────────────────────

const FeatureRow: React.FC<{ icon: React.ReactNode; label: string; color: string }> = ({ icon, label, color }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
    <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
      {icon}
    </Box>
    <Typography variant="body2" sx={{ color: "#374151", fontWeight: 500 }}>{label}</Typography>
  </Box>
);

interface PlanCardProps {
  plan: PlanLimit;
  activeSubscriptionId: string | null; // subscription ID if this plan is active, null otherwise
  cancelling: boolean;
  onCancelClick: (subscriptionId: string) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, activeSubscriptionId, cancelling, onCancelClick }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const cfg      = PLAN_CONFIG[plan.name] ?? { color: "#6b7280" };
  const isActive = !!activeSubscriptionId;

  const priceLabel = plan.priceUsd != null
    ? `$${plan.priceUsd.toLocaleString("en-US")}`
    : "Contact us";

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      await payWithCard(plan._id);
    } catch (err: any) {
      setError(err?.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      backgroundColor: "#fff",
      borderRadius: 3,
      border: `2px solid ${isActive ? cfg.color : cfg.badge ? cfg.color : "#f3f4f6"}`,
      boxShadow: isActive ? `0 8px 32px ${cfg.color}30` : cfg.badge ? `0 8px 32px ${cfg.color}22` : "0 2px 12px rgba(0,0,0,0.07)",
      p: 3.5, display: "flex", flexDirection: "column", height: "100%",
      position: "relative", transition: "box-shadow 0.2s, transform 0.2s",
      "&:hover": { boxShadow: `0 12px 40px ${cfg.color}28`, transform: "translateY(-2px)" },
    }}>
      {(isActive || cfg.badge) && (
        <Chip
          label={isActive ? "Active" : cfg.badge}
          size="small"
          icon={isActive ? <CheckCircleOutlined sx={{ fontSize: "14px !important" }} /> : undefined}
          sx={{
            position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
            bgcolor: cfg.color, color: "#fff", fontWeight: 700, fontSize: "0.72rem",
            letterSpacing: 0.5, px: 1, "& .MuiChip-icon": { color: "#fff" },
          }}
        />
      )}

      <Typography variant="h6" sx={{ fontWeight: 700, color: cfg.color, mb: 0.5, fontSize: "1.1rem" }}>
        {plan.name}
      </Typography>

      {plan.description && (
        <Typography variant="body2" sx={{ color: "#6b7280", mb: 2, lineHeight: 1.5, minHeight: 36 }}>
          {plan.description}
        </Typography>
      )}

      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, mb: 2.5 }}>
        <Typography sx={{ fontSize: "2.2rem", fontWeight: 800, color: "#111827", lineHeight: 1 }}>
          {priceLabel}
        </Typography>
        <Typography sx={{ color: "#9ca3af", fontSize: "0.85rem" }}>/ month</Typography>
      </Box>

      <Divider sx={{ mb: 2.5 }} />

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
        <FeatureRow icon={<WorkOutlined sx={{ fontSize: 17 }} />} label={`${plan.postsLimit} job posts`} color={cfg.color} />
        <FeatureRow icon={<VideoCallOutlined sx={{ fontSize: 17 }} />} label={`${plan.monthlyInterviewLimit} interviews / month`} color={cfg.color} />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 1.5, fontSize: "0.78rem", py: 0.5 }}>{error}</Alert>}

      {isActive ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <AppButton
            label="Your Current Subscription"
            variant="outlined"
            fullWidth
            disabled
            startIcon={<CheckCircleOutlined />}
            sx={{
              borderColor: cfg.color, color: cfg.color, fontWeight: 700, borderRadius: 2, py: 1.2,
              "&.Mui-disabled": { borderColor: `${cfg.color}80`, color: `${cfg.color}80` },
            }}
          />
          <AppButton
            label={cancelling ? "Cancelling…" : "Cancel This Plan"}
            variant="outlined"
            fullWidth
            disabled={cancelling}
            startIcon={cancelling ? <CircularProgress size={16} color="inherit" /> : undefined}
            onClick={() => onCancelClick(activeSubscriptionId)}
            sx={{
              borderColor: "#ef4444", color: "#ef4444", fontWeight: 600, borderRadius: 2, py: 1, fontSize: "0.82rem",
              "&:hover": { borderColor: "#dc2626", bgcolor: "#fef2f2" },
            }}
          />
        </Box>
      ) : (
        <AppButton
          label={loading ? "Redirecting…" : isActive ? "Add Another" : "Get Started"}
          variant="contained"
          fullWidth
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : isActive ? <AddCircleOutlined /> : <CreditCardOutlined />}
          onClick={handleSubscribe}
          sx={{
            bgcolor: cfg.color, "&:hover": { bgcolor: cfg.color, filter: "brightness(0.9)" },
            fontWeight: 700, borderRadius: 2, py: 1.2,
          }}
        />
      )}
    </Box>
  );
};

// ─── Page ────────────────────────────────────────────────

const PlansPage: React.FC = () => {
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
          showSnack("Payment successful! Your plan has been activated.", "success");
          refreshAll();
        })
        .catch(() => showSnack("Payment received but verification failed. Please contact support.", "error"));
      router.replace("/company/plans", undefined, { shallow: true });
    } else if (status === "cancel") {
      showSnack("Payment was cancelled. No charges were made.", "error");
      router.replace("/company/plans", undefined, { shallow: true });
    }
  }, [router.isReady]);

  const handleCancelClick = (subscriptionId: string) => {
    setCancelSubId(subscriptionId);
    setConfirmOpen(true);
  };

  const handleConfirmCancel = () => {
    if (!cancelSubId) return;
    dispatch(cancelSubscription({ subscriptionId: cancelSubId }))
      .unwrap()
      .then(() => {
        setConfirmOpen(false);
        setCancelSubId(null);
        showSnack("Subscription cancelled successfully.", "success");
        refreshAll();
      })
      .catch(() => {
        setConfirmOpen(false);
        setCancelSubId(null);
        showSnack("Failed to cancel subscription. Please try again.", "error");
      });
  };

  // Build planName → subscriptionId map from combined data
  const activeSubByPlanName = React.useMemo(() => {
    const map: Record<string, string> = {};
    combined?.subscriptions.forEach((s) => { map[s.planName] = s.id; });
    return map;
  }, [combined]);

  const cancellingPlanName = cancelSubId
    ? combined?.subscriptions.find((s) => s.id === cancelSubId)?.planName ?? "this plan"
    : "this plan";

  const sortedPlans = [...plans]
    .filter((p) => p.name !== "Trial")
    .sort((a, b) => (ORDERED_PLANS.indexOf(a.name) ?? 99) - (ORDERED_PLANS.indexOf(b.name) ?? 99));

  return (
    <DashboardLayout>
      {/* Cancel confirm dialog */}
      <Dialog open={confirmOpen} onClose={() => { setConfirmOpen(false); setCancelSubId(null); }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Cancel {cancellingPlanName} Plan?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel the <strong>{cancellingPlanName}</strong> plan?
            {(combined?.subscriptions.length ?? 0) > 1
              ? " Your other active plans will remain unchanged."
              : " Your account will be downgraded to Trial immediately."}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <AppButton label="Keep Plan" variant="outlined" onClick={() => { setConfirmOpen(false); setCancelSubId(null); }} />
          <AppButton
            label={cancelling ? "Cancelling…" : "Yes, Cancel"}
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
        title="Choose a Plan"
        subtitle="Stack multiple plans to combine limits — posts and interviews accumulate across all active subscriptions"
        breadcrumbs={[
          { label: "Dashboard", href: "/company/dashboard" },
          { label: "Settings", href: "/company/settings" },
          { label: "Plans" },
        ]}
        actions={
          <Link href="/company/billing">
            <AppButton label="Payment History" variant="outlined" startIcon={<ReceiptLongOutlined />} />
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
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          {sortedPlans.map((plan) => (
            <Grid key={plan._id} size={{ xs: 12, sm: 6, lg: 3 }}>
              <PlanCard
                plan={plan}
                activeSubscriptionId={activeSubByPlanName[plan.name] ?? null}
                cancelling={cancelling}
                onCancelClick={handleCancelClick}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </DashboardLayout>
  );
};

export default PlansPage;
