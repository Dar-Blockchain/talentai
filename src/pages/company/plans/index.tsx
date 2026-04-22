'use client';
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Link from "next/link";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import { AppDispatch, RootState } from "@/store/store";
import { fetchPlanLimits, selectPlanLimits, selectPlanLimitsLoading, PlanLimit } from "@/store/slices/planLimitsSlice";
import { getMyProfile } from "@/store/slices/userSlice";
import { payWithCard } from "@/services/stripeService";
import {
  verifyPayment, cancelSubscription, selectCancellingSubscription,
  fetchActiveSubscription, selectActiveSubscription, selectActiveSubscriptionLoading,
} from "@/store/slices/paymentSlice";
import {
  Box, Grid, Typography, Chip, Divider, CircularProgress, Alert, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, LinearProgress,
} from "@mui/material";
import AppButton from "@/components/ui/AppButton";

const CreditCardOutlined   = dynamic(() => import("@mui/icons-material/CreditCardOutlined"));
const ReceiptLongOutlined  = dynamic(() => import("@mui/icons-material/ReceiptLongOutlined"));
const WorkOutlined         = dynamic(() => import("@mui/icons-material/WorkOutlined"));
const VideoCallOutlined    = dynamic(() => import("@mui/icons-material/VideoCallOutlined"));
const CheckCircleOutlined  = dynamic(() => import("@mui/icons-material/CheckCircleOutlined"));
const CalendarTodayOutlined = dynamic(() => import("@mui/icons-material/CalendarTodayOutlined"));
const AutorenewOutlined    = dynamic(() => import("@mui/icons-material/AutorenewOutlined"));

// ─── Constants ───────────────────────────────────────────

const PLAN_CONFIG: Record<string, {
  color: string; badge?: string; priceLabel: string; priceNote: string;
  postsDisplay?: number; interviewsDisplay?: number;
}> = {
  Standard: { color: "#0D9488", priceLabel: "$99",    priceNote: "/ month" },
  Gold:     { color: "#7C3AED", priceLabel: "$499",   priceNote: "/ month", badge: "Popular" },
  Platinum: { color: "#0891B2", priceLabel: "$999",   priceNote: "/ month" },
  Diamond:  { color: "#D97706", priceLabel: "$1,499", priceNote: "/ month", postsDisplay: 100, interviewsDisplay: 500 },
};

const ORDERED_PLANS = ["Standard", "Gold", "Platinum", "Diamond"];

// ─── Active Subscription Banner ──────────────────────────

const SubscriptionBanner: React.FC = () => {
  const sub     = useSelector(selectActiveSubscription);
  const loading = useSelector(selectActiveSubscriptionLoading);

  if (loading) return (
    <Box sx={{ mb: 3, borderRadius: 3, overflow: "hidden", bgcolor: "#fff", border: "1px solid #f3f4f6", p: 3 }}>
      <CircularProgress size={20} />
    </Box>
  );
  if (!sub) return null;

  const plan = sub.planId;
  const cfg  = PLAN_CONFIG[plan?.name] ?? { color: "#0D9488" };
  const color = cfg.color;

  const endDate    = new Date(sub.endDate);
  const startDate  = new Date(sub.startDate);
  const now        = new Date();
  const totalDays  = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86400000));
  const daysLeft   = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / 86400000));
  const pctTime    = Math.round(((totalDays - daysLeft) / totalDays) * 100);

  const postsLimit      = plan?.postsLimit ?? 0;
  const interviewsLimit = plan?.monthlyInterviewLimit ?? 0;
  const postsPct        = postsLimit > 0 ? Math.min(100, Math.round((sub.postsUsed / postsLimit) * 100)) : 0;
  const interviewsPct   = interviewsLimit > 0 ? Math.min(100, Math.round((sub.monthlyInterviewsUsed / interviewsLimit) * 100)) : 0;

  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <Box sx={{
      mb: 3, borderRadius: 3, bgcolor: "#fff",
      border: `1.5px solid ${color}30`,
      boxShadow: `0 4px 20px ${color}18`,
      overflow: "hidden",
    }}>
      {/* Accent bar */}
      <Box sx={{ height: 4, bgcolor: color }} />

      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 2.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2,
              bgcolor: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <CheckCircleOutlined sx={{ color, fontSize: 22 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#111827" }}>
                Active Subscription — {plan?.name}
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", color: "#6b7280" }}>
                {fmt(startDate)} → {fmt(endDate)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Chip
              icon={<CalendarTodayOutlined sx={{ fontSize: "13px !important" }} />}
              label={`${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining`}
              size="small"
              sx={{ bgcolor: `${color}12`, color, fontWeight: 600, fontSize: "0.75rem", "& .MuiChip-icon": { color } }}
            />
            {sub.autoRenew && (
              <Chip
                icon={<AutorenewOutlined sx={{ fontSize: "13px !important" }} />}
                label="Auto-renew on"
                size="small"
                sx={{ bgcolor: "#f0fdf4", color: "#16a34a", fontWeight: 600, fontSize: "0.75rem", "& .MuiChip-icon": { color: "#16a34a" } }}
              />
            )}
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Time left */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography sx={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 500 }}>Subscription period</Typography>
                <Typography sx={{ fontSize: "0.75rem", color, fontWeight: 700 }}>{100 - pctTime}% left</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={pctTime}
                sx={{ height: 6, borderRadius: 3, bgcolor: `${color}18`, "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 3 } }}
              />
              <Typography sx={{ fontSize: "0.7rem", color: "#9ca3af", mt: 0.5 }}>{daysLeft} of {totalDays} days remaining</Typography>
            </Box>
          </Grid>

          {/* Posts usage */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography sx={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 500 }}>Job posts used</Typography>
                <Typography sx={{ fontSize: "0.75rem", color: postsPct >= 90 ? "#ef4444" : color, fontWeight: 700 }}>{postsPct}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={postsPct}
                sx={{ height: 6, borderRadius: 3, bgcolor: "#f3f4f6", "& .MuiLinearProgress-bar": { bgcolor: postsPct >= 90 ? "#ef4444" : color, borderRadius: 3 } }}
              />
              <Typography sx={{ fontSize: "0.7rem", color: "#9ca3af", mt: 0.5 }}>{sub.postsUsed} / {postsLimit} posts</Typography>
            </Box>
          </Grid>

          {/* Interviews usage */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography sx={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 500 }}>Interviews this month</Typography>
                <Typography sx={{ fontSize: "0.75rem", color: interviewsPct >= 90 ? "#ef4444" : color, fontWeight: 700 }}>{interviewsPct}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={interviewsPct}
                sx={{ height: 6, borderRadius: 3, bgcolor: "#f3f4f6", "& .MuiLinearProgress-bar": { bgcolor: interviewsPct >= 90 ? "#ef4444" : color, borderRadius: 3 } }}
              />
              <Typography sx={{ fontSize: "0.7rem", color: "#9ca3af", mt: 0.5 }}>{sub.monthlyInterviewsUsed} / {interviewsLimit} interviews</Typography>
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
  isCurrentPlan: boolean;
  hasActivePlan: boolean;
  cancelling: boolean;
  onCancelClick: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, isCurrentPlan, hasActivePlan, cancelling, onCancelClick }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const cfg = PLAN_CONFIG[plan.name] ?? { color: "#6b7280", priceLabel: "Contact us", priceNote: "" };

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
      border: `2px solid ${isCurrentPlan ? cfg.color : cfg.badge ? cfg.color : "#f3f4f6"}`,
      boxShadow: isCurrentPlan ? `0 8px 32px ${cfg.color}30` : cfg.badge ? `0 8px 32px ${cfg.color}22` : "0 2px 12px rgba(0,0,0,0.07)",
      p: 3.5, display: "flex", flexDirection: "column", height: "100%",
      position: "relative", transition: "box-shadow 0.2s, transform 0.2s",
      "&:hover": { boxShadow: `0 12px 40px ${cfg.color}28`, transform: "translateY(-2px)" },
    }}>
      {(isCurrentPlan || cfg.badge) && (
        <Chip
          label={isCurrentPlan ? "Current Plan" : cfg.badge}
          size="small"
          icon={isCurrentPlan ? <CheckCircleOutlined sx={{ fontSize: "14px !important" }} /> : undefined}
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
          {cfg.priceLabel}
        </Typography>
        {cfg.priceNote && (
          <Typography sx={{ color: "#9ca3af", fontSize: "0.85rem" }}>{cfg.priceNote}</Typography>
        )}
      </Box>

      <Divider sx={{ mb: 2.5 }} />

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
        <FeatureRow icon={<WorkOutlined sx={{ fontSize: 17 }} />} label={`${cfg.postsDisplay ?? plan.postsLimit} job posts`} color={cfg.color} />
        <FeatureRow icon={<VideoCallOutlined sx={{ fontSize: 17 }} />} label={`${cfg.interviewsDisplay ?? plan.monthlyInterviewLimit} interviews / month`} color={cfg.color} />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 1.5, fontSize: "0.78rem", py: 0.5 }}>{error}</Alert>}

      {isCurrentPlan ? (
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
            label={cancelling ? "Cancelling…" : "Cancel Subscription"}
            variant="outlined"
            fullWidth
            disabled={cancelling}
            startIcon={cancelling ? <CircularProgress size={16} color="inherit" /> : undefined}
            onClick={onCancelClick}
            sx={{
              borderColor: "#ef4444", color: "#ef4444", fontWeight: 600, borderRadius: 2, py: 1, fontSize: "0.82rem",
              "&:hover": { borderColor: "#dc2626", bgcolor: "#fef2f2" },
            }}
          />
        </Box>
      ) : (
        <AppButton
          label={loading ? "Redirecting…" : "Get Started"}
          variant="contained"
          fullWidth
          disabled={loading || hasActivePlan}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CreditCardOutlined />}
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
  const currentPlanLimits = useSelector((state: RootState) => state.user.connectedUser.planLimits);

  const [snackbar, setSnackbar]       = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });
  const [confirmOpen, setConfirmOpen] = useState(false);

  const currentPlanId = typeof currentPlanLimits === "object" && currentPlanLimits !== null
    ? (currentPlanLimits as any)._id ?? currentPlanLimits
    : currentPlanLimits;

  const showSnack = (message: string, severity: "success" | "error") =>
    setSnackbar({ open: true, message, severity });

  const refreshAll = () => {
    dispatch(getMyProfile());
    dispatch(fetchPlanLimits());
    dispatch(fetchActiveSubscription());
  };

  useEffect(() => {
    dispatch(fetchPlanLimits());
    dispatch(fetchActiveSubscription());
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

  const handleConfirmCancel = () => {
    dispatch(cancelSubscription())
      .unwrap()
      .then(() => {
        setConfirmOpen(false);
        showSnack("Subscription cancelled successfully.", "success");
        refreshAll();
      })
      .catch(() => {
        setConfirmOpen(false);
        showSnack("Failed to cancel subscription. Please try again.", "error");
      });
  };

  const sortedPlans = [...plans]
    .filter((p) => p.name !== "Trial")
    .sort((a, b) => (ORDERED_PLANS.indexOf(a.name) ?? 99) - (ORDERED_PLANS.indexOf(b.name) ?? 99));

  return (
    <DashboardLayout>
      {/* Cancel confirm dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Cancel Subscription?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure? Your plan will be downgraded to Trial immediately.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <AppButton label="Keep Plan" variant="outlined" onClick={() => setConfirmOpen(false)} />
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
        subtitle="Upgrade your workspace to unlock more posts, interviews, and candidate insights"
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

      {/* Active subscription usage banner */}
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
                isCurrentPlan={plan._id === currentPlanId?.toString()}
                hasActivePlan={!!currentPlanId}
                cancelling={cancelling}
                onCancelClick={() => setConfirmOpen(true)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </DashboardLayout>
  );
};

export default PlansPage;
