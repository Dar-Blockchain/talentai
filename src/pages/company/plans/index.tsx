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
import { fetchPlanLimits, selectPlanLimits, selectPlanLimitsLoading, selectCurrentPlanLimit, PlanLimit } from "@/store/slices/planLimitsSlice";
import { getMyProfile } from "@/store/slices/userSlice";
import { payWithCard } from "@/services/stripeService";
import {
  verifyPayment, cancelSubscription, enableAutoRenew, selectCancellingSubscription,
  fetchCombinedSubscriptionDetails, selectCombinedDetails, selectCombinedDetailsLoading,
} from "@/store/slices/paymentSlice";
import {
  Box, Grid, Typography, Chip, Divider, CircularProgress, Alert, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, LinearProgress,
  TextField,
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
const ArrowDownwardOutlined    = dynamic(() => import("@mui/icons-material/ArrowDownwardOutlined"));

// ─── Constants ───────────────────────────────────────────

const PLAN_CONFIG: Record<string, { color: string; badge?: string }> = {
  Trial:     { color: "#6B7280" },
  Starter:   { color: "#0D9488" },
  Pro:       { color: "#7C3AED", badge: "Popular" },
  Business:  { color: "#0891B2" },
  Unlimited: { color: "#D97706", badge: "Enterprise" },
};

const ORDERED_PLANS = ["Trial", "Starter", "Pro", "Business", "Unlimited"];

// ─── Combined Subscription Banner ────────────────────────

const SubscriptionBanner: React.FC = () => {
  const { t, i18n } = useTranslation("dashboard");
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
  const dateLocale    = i18n.language?.startsWith("fr") ? "fr-FR" : "en-US";
  const fmt           = (d: string) => new Date(d).toLocaleDateString(dateLocale, { month: "short", day: "numeric", year: "numeric" });

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
                {multiPlan
                  ? t("pages.subscription.banner.active_plans", { count: validSubs.length })
                  : t("pages.subscription.banner.active_single", {
                      name:
                        c.planNames.filter(Boolean)[0] ??
                        validSubs[0]?.planName ??
                        t("pages.subscription.banner.plan_fallback"),
                    })}
              </Typography>
            </Box>
            {/* Per-plan chips */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {validSubs.map((s) => {
                const col = PLAN_CONFIG[s.planName]?.color ?? "#6b7280";
                return (
                  <Chip
                    key={s.id}
                    label={`${s.planName} · ${t("pages.subscription.banner.expires", { date: fmt(s.endDate) })}`}
                    size="small"
                    sx={{ bgcolor: `${col}12`, color: col, fontWeight: 600, fontSize: "0.72rem" }}
                  />
                );
              })}
            </Box>
          </Box>
          <Chip
            icon={<CalendarTodayOutlined sx={{ fontSize: "13px !important" }} />}
            label={t("pages.subscription.banner.days_remaining", { count: Math.max(0, c.daysRemaining) })}
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
                  {t("pages.subscription.banner.job_posts_used")} {multiPlan && <span style={{ color: "#9ca3af" }}>{t("pages.subscription.banner.combined")}</span>}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: primaryColor, fontWeight: 700 }}>
                {c.usage.posts.limit === -1 ? "∞" : `${postsPct}%`}
              </Typography>
              </Box>
              <LinearProgress variant="determinate" value={c.usage.posts.limit === -1 ? 0 : postsPct}
                sx={{ height: 6, borderRadius: 3, bgcolor: "#f3f4f6", "& .MuiLinearProgress-bar": { bgcolor: postsPct >= 90 ? "#ef4444" : primaryColor, borderRadius: 3 } }} />
              <Typography sx={{ fontSize: "0.7rem", color: "#9ca3af", mt: 0.5 }}>
                {c.usage.posts.limit === -1
                  ? t("pages.subscription.banner.posts_footer_unlimited", { used: c.usage.posts.used })
                  : t("pages.subscription.banner.posts_remaining", {
                      used: c.usage.posts.used,
                      limit: c.usage.posts.limit,
                      remaining: c.usage.posts.remaining,
                    })}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography sx={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 500 }}>
                  {t("pages.subscription.banner.interviews_month")} {multiPlan && <span style={{ color: "#9ca3af" }}>{t("pages.subscription.banner.combined")}</span>}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: intPct >= 90 ? "#ef4444" : primaryColor, fontWeight: 700 }}>
                {c.usage.monthlyInterviews.limit === -1 ? "∞" : `${intPct}%`}
              </Typography>
              </Box>
              <LinearProgress variant="determinate" value={c.usage.monthlyInterviews.limit === -1 ? 0 : intPct}
                sx={{ height: 6, borderRadius: 3, bgcolor: "#f3f4f6", "& .MuiLinearProgress-bar": { bgcolor: intPct >= 90 ? "#ef4444" : primaryColor, borderRadius: 3 } }} />
              <Typography sx={{ fontSize: "0.7rem", color: "#9ca3af", mt: 0.5 }}>
                {c.usage.monthlyInterviews.limit === -1
                  ? t("pages.subscription.banner.interviews_footer_unlimited", { used: c.usage.monthlyInterviews.used })
                  : t("pages.subscription.banner.interviews_remaining", {
                      used: c.usage.monthlyInterviews.used,
                      limit: c.usage.monthlyInterviews.limit,
                      remaining: c.usage.monthlyInterviews.remaining,
                    })}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

// ─── Plan card ───────────────────────────────────────────

// ─── Contact Us Modal (Unlimited plan) ───────────────────

const ContactUsModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { t } = useTranslation("dashboard");
  const [form, setForm]     = useState({ name: "", email: "", company: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent]     = useState(false);

  const handleSend = async () => {
    if (!form.name || !form.email) return;
    setSending(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}contact/enterprise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, plan: "Unlimited" }),
      });
    } catch { /* silent — show success regardless */ }
    setSending(false);
    setSent(true);
  };

  const handleClose = () => { setForm({ name: "", email: "", company: "", message: "" }); setSent(false); onClose(); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "16px" } }}>
      <DialogTitle sx={{ fontWeight: 800, fontSize: "1.1rem", pb: 0.5 }}>
        {t("pages.subscription.enterprise_modal.title")}
      </DialogTitle>
      <DialogContent>
        {sent ? (
          <Box sx={{ py: 3, textAlign: "center" }}>
            <CheckCircleOutlined sx={{ fontSize: 48, color: "#D97706", mb: 1 }} />
            <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#111827", mb: 0.5 }}>
              {t("pages.subscription.enterprise_modal.message_sent")}
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", color: "#6B7280" }}>
              {t("pages.subscription.enterprise_modal.follow_up")}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <Typography sx={{ fontSize: "0.85rem", color: "#6B7280" }}>
              {t("pages.subscription.enterprise_modal.intro")}
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField size="small" label={t("pages.subscription.enterprise_modal.full_name")} fullWidth value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              <TextField size="small" label={t("pages.subscription.enterprise_modal.email")} fullWidth value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </Box>
            <TextField size="small" label={t("pages.subscription.enterprise_modal.company")} fullWidth value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
            <TextField size="small" label={t("pages.subscription.enterprise_modal.message")} fullWidth multiline rows={3} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder={t("pages.subscription.enterprise_modal.message_placeholder")} />
          </Box>
        )}
      </DialogContent>
      {!sent && (
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <AppButton label={t("pages.subscription.enterprise_modal.cancel")} variant="outlined" onClick={handleClose} />
          <AppButton
            label={sending ? t("pages.subscription.enterprise_modal.sending") : t("pages.subscription.enterprise_modal.send")}
            variant="contained"
            disabled={sending || !form.name || !form.email}
            onClick={handleSend}
            sx={{ bgcolor: "#D97706", "&:hover": { bgcolor: "#B45309" } }}
          />
        </DialogActions>
      )}
    </Dialog>
  );
};

// ─── Plan card ───────────────────────────────────────────

interface PlanCardProps {
  plan: PlanLimit;
  activeSubscriptionId: string | null;
  autoRenew: boolean;
  cancelling: boolean;
  currentPlanName: string | null;
  currentSubId: string | null;
  currentAutoRenew: boolean;
  onCancelClick: (subscriptionId: string) => void;
  onEnableAutoRenewClick: (subscriptionId: string) => void;
  onContactUs: () => void;
  onDowngradeClick: (plan: PlanLimit, currentSubId: string) => void;
  onActivateFree: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, activeSubscriptionId, autoRenew, cancelling, currentPlanName, currentSubId, currentAutoRenew, onCancelClick, onEnableAutoRenewClick, onContactUs, onDowngradeClick, onActivateFree }) => {
  const { t, i18n } = useTranslation("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const cfg         = PLAN_CONFIG[plan.name] ?? { color: "#6b7280" };
  const isTrial     = plan.priceUsd === 0;
  // Trial is auto-assigned by backend with no subscription record — treat as active when it's the current plan
  const isActive    = !!activeSubscriptionId || (isTrial && currentPlanName === "Trial");
  const isPopular   = cfg.badge === "Popular";
  const isEnterprise = plan.name === "Unlimited";

  const currentIdx = currentPlanName ? ORDERED_PLANS.indexOf(currentPlanName) : -1;
  const thisIdx    = ORDERED_PLANS.indexOf(plan.name);
  const isDowngrade = !isActive && currentIdx !== -1 && thisIdx !== -1 && thisIdx < currentIdx;
  const isUpgrade   = !isActive && currentIdx !== -1 && thisIdx !== -1 && thisIdx > currentIdx;

  const priceLocale = i18n.language?.startsWith("fr") ? "fr-FR" : "en-US";
  const priceLabel = isTrial
    ? t("pages.subscription.card.trial_label")
    : isEnterprise
      ? t("pages.subscription.card.contact_us")
      : `$${plan.priceUsd?.toLocaleString(priceLocale)}`;

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isTrial) {
        await import("@/utils/axiosInstance").then(({ default: axiosInstance }) =>
          axiosInstance.post("subscriptions/activate-free", { planId: plan._id })
        );
        onActivateFree();
      } else {
        await payWithCard(plan._id);
      }
    } catch (err: any) {
      setError(err?.message || t("pages.subscription.card.payment_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      backgroundColor: "#fff",
      borderRadius: "20px",
      border: `2px solid ${isActive ? cfg.color : (isPopular || isEnterprise) ? cfg.color : "#E5E7EB"}`,
      boxShadow: isActive
        ? `0 8px 32px ${cfg.color}28`
        : (isPopular || isEnterprise)
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
      {(isActive || isPopular || isEnterprise) && (
        <Chip
          label={
            isActive
              ? t("pages.subscription.card.active_badge")
              : isEnterprise
                ? t("pages.subscription.card.enterprise_badge")
                : isPopular
                  ? t("pages.subscription.card.popular_badge")
                  : cfg.badge ?? ""
          }
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

        {/* Features */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1.25, mb: 2.5 }}>
          {([
            {
              key: "ai",
              icon: <VideoCallOutlined sx={{ fontSize: 15 }} />,
              label:
                plan.monthlyInterviewLimit === -1
                  ? t("pages.subscription.card.interviews_unlimited")
                  : t("pages.subscription.card.interviews_month", { count: plan.monthlyInterviewLimit }),
            },
            {
              key: "posts",
              icon: <WorkOutlined sx={{ fontSize: 15 }} />,
              label:
                plan.postsLimit === -1
                  ? t("pages.subscription.card.job_posts_unlimited")
                  : t("pages.subscription.card.job_posts", { count: plan.postsLimit }),
            },
          ] as const).map(({ key, icon, label }) => (
            <Box key={key} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: cfg.color }}>
                {t("pages.subscription.card.current_plan_banner")}
              </Typography>
            </Box>
            {plan.name !== "Trial" && (autoRenew ? (
              <AppButton
                label={cancelling ? t("pages.subscription.card.processing") : t("pages.subscription.card.disable_auto_renewal")}
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
                  <Typography sx={{ fontSize: "0.73rem", fontWeight: 700, color: "#92400E" }}>
                    {t("pages.subscription.card.auto_renewal_off")}
                  </Typography>
                  <Typography sx={{ fontSize: "0.68rem", color: "#B45309" }}>
                    {t("pages.subscription.card.wont_renew_detail")}
                  </Typography>
                </Box>
                <AppButton
                  label={cancelling ? t("pages.subscription.card.processing") : t("pages.subscription.card.reenable")}
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
        ) : isEnterprise ? (
          <AppButton
            label={t("pages.subscription.card.contact_us")}
            variant="contained"
            fullWidth
            onClick={onContactUs}
            sx={{
              bgcolor: cfg.color, "&:hover": { bgcolor: cfg.color, filter: "brightness(0.88)" },
              fontWeight: 700, borderRadius: "10px", py: 1.1, fontSize: "0.85rem",
              boxShadow: `0 4px 14px ${cfg.color}30`, textTransform: "none",
            }}
          />
        ) : isDowngrade ? (
          currentAutoRenew === false ? (
            <Box sx={{
              display: "flex", alignItems: "flex-start", gap: 1,
              px: 1.5, py: 1.25, borderRadius: "10px",
              bgcolor: "#FFFBEB", border: "1px solid #FDE68A",
            }}>
              <ArrowDownwardOutlined sx={{ fontSize: 16, color: "#D97706", flexShrink: 0, mt: 0.2 }} />
              <Box>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#92400E" }}>
                  Downgrade scheduled
                </Typography>
                <Typography sx={{ fontSize: "0.68rem", color: "#B45309", lineHeight: 1.4 }}>
                  This plan activates when your current plan expires.
                </Typography>
              </Box>
            </Box>
          ) : (
            <AppButton
              label={loading ? t("pages.subscription.card.redirecting") : "Downgrade to this plan"}
              variant="outlined"
              fullWidth
              disabled={loading}
              startIcon={loading ? <CircularProgress size={15} color="inherit" /> : <ArrowDownwardOutlined sx={{ fontSize: "16px !important" }} />}
              onClick={() => onDowngradeClick(plan, currentSubId!)}
              sx={{
                borderColor: "#D97706", color: "#D97706",
                "&:hover": { bgcolor: "#FFFBEB", borderColor: "#B45309", color: "#B45309" },
                fontWeight: 700, borderRadius: "10px", py: 1.1, fontSize: "0.85rem",
                textTransform: "none",
              }}
            />
          )
        ) : !currentPlanName ? (
          <AppButton
            label={loading ? t("pages.subscription.card.redirecting") : isTrial ? t("pages.subscription.card.get_started_free") : t("pages.subscription.card.get_started")}
            variant="contained"
            fullWidth
            disabled={loading}
            startIcon={loading ? <CircularProgress size={15} color="inherit" /> : <CreditCardOutlined sx={{ fontSize: "16px !important" }} />}
            onClick={handleSubscribe}
            sx={{
              bgcolor: cfg.color, "&:hover": { bgcolor: cfg.color, filter: "brightness(0.88)" },
              fontWeight: 700, borderRadius: "10px", py: 1.1, fontSize: "0.85rem",
              boxShadow: `0 4px 14px ${cfg.color}30`, textTransform: "none",
            }}
          />
        ) : null}
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
  const combined           = useSelector(selectCombinedDetails);
  const combinedLoading    = useSelector(selectCombinedDetailsLoading);
  const profileLoading     = useSelector((state: any) => state.user?.connectedUser?.loading);
  const userPlanLimits     = useSelector((state: any) => state.user?.connectedUser?.planLimits);

  const [snackbar, setSnackbar]             = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });
  const [confirmOpen, setConfirmOpen]       = useState(false);
  const [cancelSubId, setCancelSubId]       = useState<string | null>(null);
  const [contactOpen, setContactOpen]       = useState(false);
  const [downgradePlan, setDowngradePlan]   = useState<{ plan: PlanLimit; currentSubId: string } | null>(null);

  const showSnack = (message: string, severity: "success" | "error") =>
    setSnackbar({ open: true, message, severity });

  const refreshAll = () => {
    dispatch(getMyProfile());
    dispatch(fetchPlanLimits());
    dispatch(fetchCombinedSubscriptionDetails());
  };

  useEffect(() => {
    dispatch(getMyProfile());
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
          showSnack(t("pages.subscription.snack.payment_success"), "success");
          refreshAll();
        })
        .catch(() => showSnack(t("pages.subscription.snack.payment_verify_error"), "error"));
      router.replace("/company/plans", undefined, { shallow: true });
    } else if (status === "cancel") {
      showSnack(t("pages.subscription.snack.payment_cancelled"), "error");
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
        showSnack(t("pages.subscription.snack.auto_renew_enabled"), "success");
        refreshAll();
      })
      .catch(() => showSnack(t("pages.subscription.snack.auto_renew_error"), "error"));
  };

  const handleConfirmCancel = () => {
    if (!cancelSubId) return;
    dispatch(cancelSubscription({ subscriptionId: cancelSubId }))
      .unwrap()
      .then(() => {
        setConfirmOpen(false);
        setCancelSubId(null);
        showSnack(t("pages.subscription.snack.cancelled"), "success");
        refreshAll();
      })
      .catch(() => {
        setConfirmOpen(false);
        setCancelSubId(null);
        showSnack(t("pages.subscription.snack.cancel_error"), "error");
      });
  };

  const handleDowngradeClick = (plan: PlanLimit, currentSubId: string) =>
    setDowngradePlan({ plan, currentSubId });

  const handleConfirmDowngrade = async () => {
    if (!downgradePlan) return;
    const { currentSubId } = downgradePlan;
    setDowngradePlan(null);
    try {
      const currentAutoRenew = currentPlanName ? activeSubByPlanName[currentPlanName]?.autoRenew : true;
      if (currentAutoRenew !== false) {
        await dispatch(cancelSubscription({ subscriptionId: currentSubId, reason: "downgrade" })).unwrap();
      }
      showSnack(
        t("pages.subscription.snack.downgrade_scheduled", "Downgrade scheduled. Your current plan stays active until it expires, then the lower plan applies."),
        "success"
      );
      refreshAll();
    } catch (err: any) {
      showSnack(typeof err === "string" ? err : err?.message || t("pages.subscription.snack.downgrade_error", "Failed to schedule downgrade"), "error");
    }
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
    ? combined?.subscriptions.find((s) => s.id === cancelSubId)?.planName ?? t("pages.subscription.this_plan")
    : t("pages.subscription.this_plan");

  // Current plan name — use userPlanLimits (from profile) as primary source,
  // fall back to highest-tier active subscription from combined data
  const currentPlanName = React.useMemo(() => {
    // 1. Try to extract name from userPlanLimits (various backend shapes)
    const fromProfile =
      userPlanLimits?.name ||
      userPlanLimits?.planName ||
      userPlanLimits?.plan?.name ||
      userPlanLimits?.planId?.name ||
      null;
    if (fromProfile && ORDERED_PLANS.includes(fromProfile)) return fromProfile;

    // 2. Fall back to active subscriptions from combined data
    const names = Object.keys(activeSubByPlanName);
    if (names.length) return names.sort((a, b) => ORDERED_PLANS.indexOf(b) - ORDERED_PLANS.indexOf(a))[0];

    // 3. Try combined.combined.planNames (backend may list Trial here)
    const combinedNames = combined?.combined?.planNames ?? [];
    if (combinedNames.length) {
      const validName = combinedNames.find((n: string) => ORDERED_PLANS.includes(n));
      if (validName) return validName;
    }

    // 4. If profile has any planLimits set, backend auto-assigned Trial — treat as Trial
    if (userPlanLimits) return "Trial";

    return null;
  }, [activeSubByPlanName, userPlanLimits, combined]);

  if (process.env.NODE_ENV === "development") {
    console.log("[Plans] userPlanLimits:", userPlanLimits, "| currentPlanName:", currentPlanName, "| activeSubByPlanName:", activeSubByPlanName);
  }

  const sortedPlans = [...plans]
    .sort((a, b) => (ORDERED_PLANS.indexOf(a.name) ?? 99) - (ORDERED_PLANS.indexOf(b.name) ?? 99));

  return (
    <DashboardLayout>
      {/* Downgrade confirm dialog */}
      <Dialog open={!!downgradePlan} onClose={() => setDowngradePlan(null)} PaperProps={{ sx: { borderRadius: "16px" } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {t("pages.subscription.downgrade_dialog.title", "Downgrade Plan?")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("pages.subscription.downgrade_dialog.text", {
              plan: downgradePlan?.plan?.name ?? "",
              defaultValue: `Your current plan will stay active until it expires. After that, the {{plan}} plan limits will apply. No charge until your next billing cycle.`,
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <AppButton label={t("pages.subscription.dialog.keep", "Keep Current")} variant="outlined" onClick={() => setDowngradePlan(null)} />
          <AppButton
            label={cancelling ? t("pages.subscription.card.processing") : t("pages.subscription.downgrade_dialog.confirm", "Confirm Downgrade")}
            variant="contained"
            disabled={cancelling}
            startIcon={cancelling ? <CircularProgress size={14} color="inherit" /> : undefined}
            onClick={handleConfirmDowngrade}
            sx={{ bgcolor: "#D97706", "&:hover": { bgcolor: "#B45309" } }}
          />
        </DialogActions>
      </Dialog>

      {/* Cancel confirm dialog */}
      <Dialog open={confirmOpen} onClose={() => { setConfirmOpen(false); setCancelSubId(null); }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{t("pages.subscription.dialog.title")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("pages.subscription.dialog.text", { plan: cancellingPlanName })}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <AppButton label={t("pages.subscription.dialog.keep")} variant="outlined" onClick={() => { setConfirmOpen(false); setCancelSubId(null); }} />
          <AppButton
            label={cancelling ? t("pages.subscription.card.processing") : t("pages.subscription.dialog.confirm")}
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
        title={t("pages.subscription.title")}
        subtitle={t("pages.subscription.subtitle")}
        breadcrumbs={[
          { label: t("pages.common.dashboard"), href: "/company/dashboard" },
          { label: t("pages.subscription.settings_breadcrumb"), href: "/company/settings" },
          { label: t("pages.subscription.breadcrumb") },
        ]}
        actions={
          <Link href="/company/billing">
            <AppButton label={t("pages.subscription.payment_history")} variant="outlined" startIcon={<ReceiptLongOutlined />} />
          </Link>
        }
      />

      {/* Combined subscription usage banner */}
      <SubscriptionBanner />

      {plansLoading || combinedLoading || profileLoading ? (
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
                currentPlanName={currentPlanName}
                currentSubId={currentPlanName ? (activeSubByPlanName[currentPlanName]?.id ?? null) : null}
                currentAutoRenew={currentPlanName ? (activeSubByPlanName[currentPlanName]?.autoRenew ?? true) : true}
                onCancelClick={handleCancelClick}
                onEnableAutoRenewClick={handleEnableAutoRenew}
                onContactUs={() => setContactOpen(true)}
                onDowngradeClick={handleDowngradeClick}
                onActivateFree={refreshAll}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <ContactUsModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </DashboardLayout>
  );
};

export default PlansPage;
