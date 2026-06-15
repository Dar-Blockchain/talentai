import React from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, Chip, CircularProgress, LinearProgress, Grid } from "@mui/material";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import { PLAN_CONFIG } from "../constants";
import { useSubscriptionBanner } from "../hooks/useSubscriptionBanner";
import type { SubscriptionItem } from "../types";

const SubscriptionBanner: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const { isLoading, data } = useSubscriptionBanner();

  if (isLoading) return (
    <Box sx={{ mb: 3, borderRadius: 3, bgcolor: "#fff", border: "1px solid #f3f4f6", p: 3, display: "flex", justifyContent: "center" }}>
      <CircularProgress size={20} />
    </Box>
  );
  if (!data) return null;

  const { validSubs, c, multiPlan, primaryColor, gradientBar, bars, fmt } = data;

  return (
    <Box sx={{ mb: 3, borderRadius: 3, bgcolor: "#fff", border: `1.5px solid ${primaryColor}30`, boxShadow: `0 4px 20px ${primaryColor}18`, overflow: "hidden" }}>
      <Box sx={{ height: 4, background: gradientBar }} />
      <Box sx={{ p: 3 }}>

        {/* Header row */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 2.5 }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <CheckCircleOutlined sx={{ color: primaryColor, fontSize: 20 }} />
              <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#111827" }}>
                {multiPlan
                  ? t("pages.subscription.banner.active_plans", { count: validSubs.length })
                  : t("pages.subscription.banner.active_single", {
                      name: c.planNames.filter(Boolean)[0] ?? validSubs[0]?.planName ?? t("pages.subscription.banner.plan_fallback"),
                    })}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {validSubs.map((s: SubscriptionItem) => {
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

        {/* Usage bars */}
        <Grid container spacing={3}>
          {bars.map(({ key, pct, limit, used, remaining, labelKey, unlimitedKey, remainingKey }) => (
            <Grid key={key} size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography sx={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 500 }}>
                  {t(labelKey)}{multiPlan && <span style={{ color: "#9ca3af" }}> {t("pages.subscription.banner.combined")}</span>}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: pct >= 90 ? "#ef4444" : primaryColor, fontWeight: 700 }}>
                  {limit === -1 ? "∞" : `${pct}%`}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={limit === -1 ? 0 : pct}
                sx={{ height: 6, borderRadius: 3, bgcolor: "#f3f4f6", "& .MuiLinearProgress-bar": { bgcolor: pct >= 90 ? "#ef4444" : primaryColor, borderRadius: 3 } }}
              />
              <Typography sx={{ fontSize: "0.7rem", color: "#9ca3af", mt: 0.5 }}>
                {limit === -1 ? t(unlimitedKey, { used }) : t(remainingKey, { used, limit, remaining })}
              </Typography>
            </Grid>
          ))}
        </Grid>

      </Box>
    </Box>
  );
};

export default SubscriptionBanner;
