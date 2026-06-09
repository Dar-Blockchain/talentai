import React, { useMemo } from "react";
import { Box, Chip, CircularProgress, Grid, LinearProgress, Paper, Typography } from "@mui/material";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import CheckCircleOutlined   from "@mui/icons-material/CheckCircleOutlined";
import VideoCallOutlined     from "@mui/icons-material/VideoCallOutlined";
import WorkOutlined          from "@mui/icons-material/WorkOutlined";
import { useCombinedDetailsQuery } from "../queries";
import { TEAL, PLAN_COLORS } from "../constants";
import UsageBar from "./UsageBar";

const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const ActiveSubscriptionCard: React.FC = () => {
  const { data: combined, isLoading: loading } = useCombinedDetailsQuery();

  if (loading) return (
    <Paper sx={{ borderRadius: 3, p: 3, mb: 3, display: "flex", justifyContent: "center" }}>
      <CircularProgress size={24} sx={{ color: TEAL }} />
    </Paper>
  );
  if (!combined || combined.subscriptions.length === 0) return null;

  const { combined: c, subscriptions } = combined;
  const isMulti = subscriptions.length > 1;

  const { postsPct, interviewsPct, periodPct } = useMemo(() => {
    const posts      = c.usage.posts.limit > 0
      ? Math.min(100, Math.round((c.usage.posts.used / c.usage.posts.limit) * 100)) : 0;
    const interviews = c.usage.monthlyInterviews.limit > 0
      ? Math.min(100, Math.round((c.usage.monthlyInterviews.used / c.usage.monthlyInterviews.limit) * 100)) : 0;
    const durationDays = Math.max(1, Math.round(
      (new Date(subscriptions[0].endDate).getTime() - new Date(subscriptions[0].startDate).getTime()) / 86400000,
    ));
    const period = Math.min(100, Math.max(0, 100 - Math.round((c.daysRemaining / durationDays) * 100)));
    return { postsPct: posts, interviewsPct: interviews, periodPct: period };
  }, [c, subscriptions]);

  return (
    <Paper sx={{ borderRadius: 3, overflow: "hidden", boxShadow: `0 4px 20px ${TEAL}18`, border: `1.5px solid ${TEAL}25`, mb: 3 }}>
      {isMulti
        ? <Box sx={{ height: 4, background: "linear-gradient(90deg, #0D9488, #7C3AED, #0891B2)" }} />
        : <Box sx={{ height: 4, bgcolor: PLAN_COLORS[subscriptions[0].planName] ?? TEAL }} />
      }

      <Box sx={{ p: 3 }}>
        {/* Header row */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: `${TEAL}14`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircleOutlined sx={{ color: TEAL, fontSize: 22 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#111827" }}>
                {isMulti ? `${subscriptions.length} Active Plans` : `Active — ${subscriptions[0].planName} Plan`}
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", color: "#6b7280" }}>
                {isMulti
                  ? `Expires soonest: ${fmt(c.soonestExpiry)}`
                  : `${fmt(subscriptions[0].startDate)} → ${fmt(subscriptions[0].endDate)}`
                }
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
            {isMulti && subscriptions.map((s) => (
              <Chip key={s.id} label={s.planName} size="small"
                sx={{ bgcolor: `${PLAN_COLORS[s.planName] ?? TEAL}18`, color: PLAN_COLORS[s.planName] ?? TEAL,
                  fontWeight: 700, fontSize: "0.72rem", border: `1px solid ${PLAN_COLORS[s.planName] ?? TEAL}40` }} />
            ))}
            <Chip
              icon={<CalendarTodayOutlined sx={{ fontSize: "13px !important" }} />}
              label={`${c.daysRemaining} day${c.daysRemaining !== 1 ? "s" : ""} left`}
              size="small"
              sx={{ bgcolor: `${TEAL}12`, color: TEAL, fontWeight: 700, fontSize: "0.75rem", "& .MuiChip-icon": { color: TEAL } }}
            />
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Subscription period / active plans list */}
          <Grid size={{ xs: 12, sm: 4 }}>
            {isMulti ? (
              <Box>
                <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151", mb: 1 }}>Active Plans</Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                  {subscriptions.map((s) => (
                    <Box key={s.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                        <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: PLAN_COLORS[s.planName] ?? TEAL }} />
                        <Typography sx={{ fontSize: "0.75rem", color: "#374151", fontWeight: 600 }}>{s.planName}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: "0.72rem", color: "#9ca3af" }}>{fmt(s.endDate)}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.6 }}>
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151" }}>Subscription period</Typography>
                  <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: TEAL }}>{c.daysRemaining} days left</Typography>
                </Box>
                <LinearProgress variant="determinate" value={periodPct}
                  sx={{ height: 7, borderRadius: 4, bgcolor: `${TEAL}18`, "& .MuiLinearProgress-bar": { bgcolor: TEAL, borderRadius: 4 } }} />
                <Typography sx={{ fontSize: "0.69rem", color: "#9ca3af", mt: 0.4 }}>
                  expires {fmt(subscriptions[0].endDate)}
                </Typography>
              </Box>
            )}
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <UsageBar
              label={isMulti ? "Job Posts (combined)" : "Job Posts"}
              used={c.usage.posts.used} limit={c.usage.posts.limit}
              remaining={c.usage.posts.remaining} pct={postsPct}
              icon={<WorkOutlined sx={{ fontSize: 15 }} />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <UsageBar
              label={isMulti ? "Interviews (combined)" : "Interviews (this month)"}
              used={c.usage.monthlyInterviews.used} limit={c.usage.monthlyInterviews.limit}
              remaining={c.usage.monthlyInterviews.remaining} pct={interviewsPct}
              icon={<VideoCallOutlined sx={{ fontSize: 15 }} />}
            />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ActiveSubscriptionCard;
