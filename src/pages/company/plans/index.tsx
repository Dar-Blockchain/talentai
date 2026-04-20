'use client';
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import { AppDispatch, RootState } from "@/store/store";
import { fetchPlanLimits, selectPlanLimits, selectPlanLimitsLoading, PlanLimit } from "@/store/slices/planLimitsSlice";
import { payWithCard } from "@/services/stripeService";
import {
  Box,
  Grid,
  Typography,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import AppButton from "@/components/ui/AppButton";

const CreditCardOutlined = dynamic(() => import("@mui/icons-material/CreditCardOutlined"));
const WorkOutlined = dynamic(() => import("@mui/icons-material/WorkOutlined"));
const VideoCallOutlined = dynamic(() => import("@mui/icons-material/VideoCallOutlined"));
const CheckCircleOutlined = dynamic(() => import("@mui/icons-material/CheckCircleOutlined"));
const OpenInNewOutlined = dynamic(() => import("@mui/icons-material/OpenInNewOutlined"));

const PLAN_CONFIG: Record<string, { color: string; badge?: string; priceLabel: string; priceNote: string; postsDisplay?: number; interviewsDisplay?: number }> = {
  Standard: { color: "#0D9488", priceLabel: "$99", priceNote: "/ month" },
  Gold: { color: "#7C3AED", badge: "Popular", priceLabel: "$499", priceNote: "/ month" },
  Platinum: { color: "#0891B2", priceLabel: "$999", priceNote: "/ month" },
  Diamond: { color: "#D97706", priceLabel: "$1,499", priceNote: "/ month", postsDisplay: 100, interviewsDisplay: 500 },
};

const PlanCard: React.FC<{ plan: PlanLimit; isCurrentPlan: boolean }> = ({ plan, isCurrentPlan }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    <Box
      sx={{
        backgroundColor: "#fff",
        borderRadius: 3,
        border: `2px solid ${isCurrentPlan ? cfg.color : cfg.badge ? cfg.color : "#f3f4f6"}`,
        boxShadow: isCurrentPlan
          ? `0 8px 32px ${cfg.color}30`
          : cfg.badge
          ? `0 8px 32px ${cfg.color}22`
          : "0 2px 12px rgba(0,0,0,0.07)",
        p: 3.5,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
        transition: "box-shadow 0.2s, transform 0.2s",
        "&:hover": {
          boxShadow: `0 12px 40px ${cfg.color}28`,
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* Current plan badge */}
      {isCurrentPlan && (
        <Chip
          label="Current Plan"
          size="small"
          icon={<CheckCircleOutlined sx={{ fontSize: "14px !important" }} />}
          sx={{
            position: "absolute",
            top: -14,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: cfg.color,
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.72rem",
            letterSpacing: 0.5,
            px: 1,
            "& .MuiChip-icon": { color: "#fff" },
          }}
        />
      )}

      {/* Popular badge (only if not current plan) */}
      {cfg.badge && !isCurrentPlan && (
        <Chip
          label={cfg.badge}
          size="small"
          sx={{
            position: "absolute",
            top: -14,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: cfg.color,
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.72rem",
            letterSpacing: 0.5,
            px: 1,
          }}
        />
      )}

      {/* Plan name */}
      <Typography variant="h6" sx={{ fontWeight: 700, color: cfg.color, mb: 0.5, fontSize: "1.1rem" }}>
        {plan.name}
      </Typography>

      {plan.description && (
        <Typography variant="body2" sx={{ color: "#6b7280", mb: 2, lineHeight: 1.5, minHeight: 36 }}>
          {plan.description}
        </Typography>
      )}

      {/* Price */}
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, mb: 2.5 }}>
        <Typography sx={{ fontSize: "2.2rem", fontWeight: 800, color: "#111827", lineHeight: 1 }}>
          {cfg.priceLabel}
        </Typography>
        {cfg.priceNote && (
          <Typography sx={{ color: "#9ca3af", fontSize: "0.85rem" }}>{cfg.priceNote}</Typography>
        )}
      </Box>

      <Divider sx={{ mb: 2.5 }} />

      {/* Features */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
        <FeatureRow
          icon={<WorkOutlined sx={{ fontSize: 17 }} />}
          label={`${cfg.postsDisplay ?? plan.postsLimit} job posts`}
          color={cfg.color}
        />
        <FeatureRow
          icon={<VideoCallOutlined sx={{ fontSize: 17 }} />}
          label={`${cfg.interviewsDisplay ?? plan.monthlyInterviewLimit} interviews / month`}
          color={cfg.color}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 1.5, fontSize: "0.78rem", py: 0.5 }}>
          {error}
        </Alert>
      )}

      {isCurrentPlan ? (
        <AppButton
          label="Manage Subscription"
          variant="outlined"
          fullWidth
          startIcon={<OpenInNewOutlined />}
          onClick={() => window.open("https://billing.stripe.com/p/login/test_eVa6p10Fz2lH7pS000", "_blank", "noopener,noreferrer")}
          sx={{
            borderColor: cfg.color,
            color: cfg.color,
            fontWeight: 700,
            borderRadius: 2,
            py: 1.2,
            "&:hover": { borderColor: cfg.color, bgcolor: `${cfg.color}0a` },
          }}
        />
      ) : (
        <AppButton
          label={loading ? "Redirecting…" : "Get Started"}
          variant="contained"
          fullWidth
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CreditCardOutlined />}
          onClick={handleSubscribe}
          sx={{
            bgcolor: cfg.color,
            "&:hover": { bgcolor: cfg.color, filter: "brightness(0.9)" },
            fontWeight: 700,
            borderRadius: 2,
            py: 1.2,
          }}
        />
      )}
    </Box>
  );
};

const FeatureRow: React.FC<{ icon: React.ReactNode; label: string; color: string }> = ({ icon, label, color }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
    <Box
      sx={{
        width: 28, height: 28, borderRadius: "50%",
        bgcolor: `${color}14`, display: "flex", alignItems: "center",
        justifyContent: "center", color, flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Typography variant="body2" sx={{ color: "#374151", fontWeight: 500 }}>
      {label}
    </Typography>
  </Box>
);

const PlansPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const plans = useSelector(selectPlanLimits);
  const loading = useSelector(selectPlanLimitsLoading);
  const currentPlanLimits = useSelector((state: RootState) => state.user.connectedUser.planLimits);

  const currentPlanId = typeof currentPlanLimits === "object" && currentPlanLimits !== null
    ? (currentPlanLimits as any)._id ?? currentPlanLimits
    : currentPlanLimits;

  useEffect(() => {
    dispatch(fetchPlanLimits());
  }, [dispatch]);

  const orderedPlanNames = ["Standard", "Gold", "Platinum", "Diamond"];
  const sortedPlans = [...plans]
    .filter((p) => p.name !== "Trial")
    .sort((a, b) => {
      const ai = orderedPlanNames.indexOf(a.name);
      const bi = orderedPlanNames.indexOf(b.name);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });

  return (
    <DashboardLayout>
      <PageHeader
        title="Choose a Plan"
        subtitle="Upgrade your workspace to unlock more posts, interviews, and candidate insights"
        breadcrumbs={[
          { label: "Dashboard", href: "/company/dashboard" },
          { label: "Settings", href: "/company/settings" },
          { label: "Plans" },
        ]}
      />

      {loading ? (
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
              />
            </Grid>
          ))}
        </Grid>
      )}
    </DashboardLayout>
  );
};

export default PlansPage;
