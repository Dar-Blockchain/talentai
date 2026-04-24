import React, { memo, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { Box, Typography, Chip, Skeleton, LinearProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchEmployeeCampaigns,
  fetchEmployeeCampaignMetrics,
  selectEmployeeCampaigns,
  selectEmployeeCampaignsLoading,
} from "@/store/slices/campaignSlice";
import {
  CampaignOutlined,
  CheckCircleOutlined,
  PlayArrowOutlined,
  ChevronRightOutlined,
  RadioButtonUncheckedOutlined,
  AccessTimeOutlined,
  EmojiEventsOutlined,
  TrendingUpOutlined,
  DescriptionOutlined,
  PsychologyOutlined,
  AssignmentTurnedInOutlined,
  ArrowForwardOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { Campaign, ModuleType, ParticipantStatus } from "@/types/campaign";

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL   = "#0D9488";
const PURPLE = "#8B5CF6";
const BLUE   = "#3B82F6";
const AMBER  = "#F59E0B";
const GREEN  = "#10B981";
const ROSE   = "#F43F5E";

const MODULE_META: Record<ModuleType, { label: string; icon: React.ElementType; color: string }> = {
  SKILL_TEST:    { label: "Skill Test",    icon: AssignmentTurnedInOutlined, color: GREEN  },
  AI_INTERVIEW:  { label: "AI Interview",  icon: PsychologyOutlined,         color: PURPLE },
  QUESTIONNAIRE: { label: "Questionnaire", icon: DescriptionOutlined,        color: BLUE   },
  TRAINING_PATH: { label: "Training Path", icon: CampaignOutlined,           color: AMBER  },
};

const PS_META: Record<ParticipantStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  INVITED:     { label: "Invited",     color: "#0891B2", bg: "#ECFDF5", icon: RadioButtonUncheckedOutlined },
  IN_PROGRESS: { label: "In Progress", color: AMBER,    bg: "#FFFBEB", icon: PlayArrowOutlined },
  COMPLETED:   { label: "Completed",   color: GREEN,    bg: "#F0FDF4", icon: CheckCircleOutlined },
  DROPPED:     { label: "Dropped",     color: ROSE,     bg: "#FEF2F2", icon: RadioButtonUncheckedOutlined },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const daysLeft = (iso?: string) => {
  if (!iso) return null;
  const end = new Date(iso);
  end.setHours(23, 59, 59, 999);
  return Math.ceil((end.getTime() - Date.now()) / 86_400_000);
};

const fmtDate = (iso?: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const scoreColor = (s: number) =>
  s >= 80 ? GREEN : s >= 60 ? TEAL : s >= 40 ? AMBER : ROSE;

// ─── Score Gauge ──────────────────────────────────────────────────────────────

const ScoreGauge: React.FC<{ score: number; size?: number }> = ({ score, size = 80 }) => {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = scoreColor(score);
  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeLinecap="round" strokeDasharray={`${filled} ${circ - filled}`}
          style={{ transition: "stroke-dasharray 0.8s ease" }} />
      </svg>
      <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ fontSize: size < 80 ? "14px" : "18px", fontWeight: 800, color: "#111827", lineHeight: 1 }}>{score}</Typography>
        <Typography sx={{ fontSize: "9px", color: "#9CA3AF", fontWeight: 600 }}>/100</Typography>
      </Box>
    </Box>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string; value: number; icon: React.ElementType;
  color: string; bg: string; active?: boolean; onClick?: () => void; delay?: number;
}> = ({ label, value, icon: Icon, color, bg, onClick, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.28 }}>
    <Box onClick={onClick} sx={{
      bgcolor: "#fff", p: 2.5, borderRadius: 3, border: "1px solid #E5E7EB",
      cursor: onClick ? "pointer" : "default",
      "&:hover": onClick ? { boxShadow: "0 8px 24px rgba(0,0,0,0.07)", transform: "translateY(-2px)" } : {},
      transition: "all 0.2s",
    }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Box sx={{ p: 1.1, borderRadius: 2, bgcolor: bg }}>
          <Icon sx={{ fontSize: 20, color }} />
        </Box>
        <Typography sx={{ fontSize: "28px", fontWeight: 800, color: "#111827", lineHeight: 1 }}>{value}</Typography>
      </Box>
      <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.7 }}>
        {label}
      </Typography>
    </Box>
  </motion.div>
);

// ─── Section Shell ────────────────────────────────────────────────────────────

const Section: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }> = ({
  title, subtitle, action, children,
}) => (
  <Box sx={{ bgcolor: "#fff", borderRadius: 3, border: "1px solid #E5E7EB", overflow: "hidden" }}>
    <Box sx={{ px: 3, pt: 2.5, pb: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Box>
        <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{title}</Typography>
        {subtitle && <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: 0.2 }}>{subtitle}</Typography>}
      </Box>
      {action}
    </Box>
    <Box sx={{ px: 3, pb: 3 }}>{children}</Box>
  </Box>
);

const ViewAll: React.FC<{ color?: string; onClick: () => void }> = ({ color = TEAL, onClick }) => (
  <Typography onClick={onClick} sx={{ fontSize: "12px", fontWeight: 600, color, cursor: "pointer", display: "flex", alignItems: "center", gap: 0.3, "&:hover": { textDecoration: "underline" } }}>
    View all <ChevronRightOutlined sx={{ fontSize: 14 }} />
  </Typography>
);

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <Box sx={{ py: 5, textAlign: "center" }}>
    <CampaignOutlined sx={{ fontSize: 32, color: "#E5E7EB", mb: 1 }} />
    <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>{text}</Typography>
  </Box>
);

const RowSkeleton = () => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1 }}>
    <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: 2, flexShrink: 0 }} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="60%" height={16} />
      <Skeleton variant="text" width="40%" height={12} />
    </Box>
    <Skeleton variant="rounded" width={60} height={22} sx={{ borderRadius: 99 }} />
  </Box>
);

// ─── Campaign Row ─────────────────────────────────────────────────────────────

const CampaignRow: React.FC<{ campaign: Campaign; onAction: () => void }> = ({ campaign, onAction }) => {
  const ps      = PS_META[campaign.participantStatus ?? "INVITED"];
  const mm      = MODULE_META[campaign.module?.type];
  const PsIcon  = ps.icon;
  const ModIcon = mm?.icon;
  const remaining = daysLeft(campaign.deadline);
  const isCompleted = campaign.participantStatus === "COMPLETED";
  const score = (campaign as any).score ?? null;

  return (
    <Box
      onClick={onAction}
      sx={{
        display: "flex", alignItems: "center", gap: 1.5, p: 1.5, borderRadius: 2,
        border: "1px solid #F3F4F6", cursor: "pointer",
        "&:hover": { bgcolor: "#F9FAFB", borderColor: "#E5E7EB" },
        transition: "all 0.15s",
      }}
    >
      <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: `${PURPLE}10`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {ModIcon ? <ModIcon sx={{ fontSize: 18, color: mm.color }} /> : <CampaignOutlined sx={{ fontSize: 18, color: PURPLE }} />}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {campaign.title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.2 }}>
          {mm && <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>{mm.label}</Typography>}
          {!isCompleted && remaining !== null && remaining > 0 && (
            <>
              <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>·</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                <AccessTimeOutlined sx={{ fontSize: 11, color: remaining <= 7 ? ROSE : "#9CA3AF" }} />
                <Typography sx={{ fontSize: "11px", color: remaining <= 7 ? ROSE : "#9CA3AF", fontWeight: remaining <= 7 ? 600 : 400 }}>
                  {remaining}d left
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
        {isCompleted && score !== null && (
          <Box sx={{ px: 1.25, py: 0.4, borderRadius: 1.5, bgcolor: `${scoreColor(score)}12`, border: `1px solid ${scoreColor(score)}25` }}>
            <Typography sx={{ fontSize: "12px", fontWeight: 800, color: scoreColor(score) }}>{score}</Typography>
          </Box>
        )}
        <Chip
          icon={<PsIcon sx={{ fontSize: "10px !important" }} />}
          label={ps.label}
          size="small"
          sx={{ fontSize: "10px", height: 20, bgcolor: ps.bg, color: ps.color, fontWeight: 700, border: "none", "& .MuiChip-icon": { color: ps.color } }}
        />
        {isCompleted
          ? <VisibilityOutlined   sx={{ fontSize: 15, color: "#9CA3AF" }} />
          : <ArrowForwardOutlined sx={{ fontSize: 15, color: "#9CA3AF" }} />
        }
      </Box>
    </Box>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const EmployeeDashboardOverview: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router   = useRouter();

  const userId           = useSelector((state: RootState) => state.user.connectedUser.user?._id);
  const user             = useSelector((state: RootState) => state.user.connectedUser.user);
  const profile          = useSelector((state: RootState) => state.user.connectedUser.profile);
  const companyMembership = useSelector((state: RootState) => state.user.connectedUser.companyMembership);
  const metrics          = useSelector((state: RootState) => state.campaign.employeeMetrics);

  const campaigns        = useSelector(selectEmployeeCampaigns);
  const campaignsLoading = useSelector(selectEmployeeCampaignsLoading);

  useEffect(() => {
    if (!userId) return;
    dispatch(fetchEmployeeCampaigns({ userId, limit: 20 }));
    dispatch(fetchEmployeeCampaignMetrics(userId));
  }, [dispatch, userId]);

  // Derived
  const pending    = useMemo(() => campaigns.filter(c => c.participantStatus === "INVITED" || c.participantStatus === "IN_PROGRESS").slice(0, 5), [campaigns]);
  const completed  = useMemo(() => campaigns.filter(c => c.participantStatus === "COMPLETED").slice(0, 5), [campaigns]);
  const scored     = useMemo(() => completed.filter(c => (c as any).score != null), [completed]);
  const avgScore   = useMemo(() => {
    if (!scored.length) return 0;
    return Math.round(scored.reduce((s, c) => s + (c as any).score, 0) / scored.length);
  }, [scored]);

  const fullName   = `${user?.firstName || profile?.firstName || ""} ${user?.lastName || profile?.lastName || ""}`.trim() || user?.username || "there";
  const companyName = companyMembership?.company?.profile?.companyDetails?.name || companyMembership?.company?.username || null;

  if (campaignsLoading && !campaigns.length) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Skeleton variant="rounded" height={110} sx={{ borderRadius: 3 }} />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 2.5 }}>
          {[0, 1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={110} sx={{ borderRadius: 3 }} />)}
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>
          <Skeleton variant="rounded" height={280} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rounded" height={280} sx={{ borderRadius: 3 }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

      {/* ── Welcome Banner ─────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: 3, p: { xs: 3, md: 3.5 }, position: "relative", overflow: "hidden" }}>
          <Box sx={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", bgcolor: PURPLE, borderRadius: "3px 0 0 3px" }} />
          <Box sx={{ position: "absolute", top: -24, right: 40, width: 140, height: 140, borderRadius: "50%", bgcolor: "#F5F3FF", pointerEvents: "none" }} />
          <Box sx={{ position: "absolute", bottom: -30, right: -20, width: 100, height: 100, borderRadius: "50%", bgcolor: "#F0FDFA", pointerEvents: "none" }} />

          <Box sx={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>

            {/* Left: greeting */}
            <Box>
              <Typography sx={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 500, mb: 0.4 }}>{greeting()},</Typography>
              <Typography sx={{ fontSize: { xs: "20px", md: "24px" }, fontWeight: 800, color: "#111827", letterSpacing: "-0.3px" }}>
                {fullName} 👋
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.5 }}>
                Here's your campaign progress for today.
              </Typography>
              {companyName && (
                <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: 0.5 }}>
                  Member of{" "}
                  <Box component="span" sx={{ fontWeight: 600, color: "#6B7280" }}>{companyName}</Box>
                </Typography>
              )}
            </Box>

            {/* Right: score gauge */}
            {avgScore > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, bgcolor: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 3, px: 2.5, py: 1.5 }}>
                <ScoreGauge score={avgScore} size={72} />
                <Box>
                  <Typography sx={{ fontSize: "12px", color: "#374151", fontWeight: 600 }}>Avg. Score</Typography>
                  <Typography sx={{ fontSize: "11px", color: "#9CA3AF", mt: 0.3 }}>Across {scored.length} assessment{scored.length !== 1 ? "s" : ""}</Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </motion.div>

      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 2.5 }}>
        <StatCard label="Total"       value={metrics?.total      ?? 0} icon={CampaignOutlined}            color={PURPLE}   bg={`${PURPLE}10`}   delay={0.05} onClick={() => router.push("/employee/campaigns")} />
        <StatCard label="Invited"     value={metrics?.invited    ?? 0} icon={RadioButtonUncheckedOutlined} color="#0891B2"  bg="#E0F7FA"          delay={0.08} onClick={() => router.push("/employee/campaigns")} />
        <StatCard label="In Progress" value={metrics?.inProgress ?? 0} icon={PlayArrowOutlined}            color={AMBER}    bg={`${AMBER}12`}    delay={0.11} onClick={() => router.push("/employee/campaigns")} />
        <StatCard label="Completed"   value={metrics?.completed  ?? 0} icon={CheckCircleOutlined}          color={GREEN}    bg={`${GREEN}10`}    delay={0.14} onClick={() => router.push("/employee/campaigns")} />
      </Box>

      {/* ── Two columns: pending + completed ───────────────────────────────── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>

        {/* Active / Invited */}
        <Section
          title="Active Campaigns"
          subtitle={`${pending.length} to complete`}
          action={<ViewAll color={PURPLE} onClick={() => router.push("/employee/campaigns")} />}
        >
          {campaignsLoading ? (
            [0, 1, 2, 3].map(i => <RowSkeleton key={i} />)
          ) : pending.length === 0 ? (
            <EmptyState text="No active campaigns right now" />
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {pending.map(c => {
                const isExpired = c.deadline
                  ? (() => { const e = new Date(c.deadline!); e.setHours(23,59,59,999); return e.getTime() < Date.now(); })()
                  : false;
                return (
                <CampaignRow
                  key={c._id}
                  campaign={c}
                  onAction={() => router.push(
                    !isExpired && c.participantStatus === "IN_PROGRESS"
                      ? `/employee/campaigns/${c._id}/assessment`
                      : `/employee/campaigns/${c._id}`
                  )}
                />
                );
              })}
            </Box>
          )}
        </Section>

        {/* Completed */}
        <Section
          title="Completed Campaigns"
          subtitle={`${metrics?.completed ?? 0} total`}
          action={<ViewAll color={GREEN} onClick={() => router.push("/employee/campaigns?participantStatus=COMPLETED")} />}
        >
          {campaignsLoading ? (
            [0, 1, 2, 3].map(i => <RowSkeleton key={i} />)
          ) : completed.length === 0 ? (
            <EmptyState text="No completed campaigns yet" />
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {completed.map(c => (
                <CampaignRow
                  key={c._id}
                  campaign={c}
                  onAction={() => router.push(`/employee/campaigns/${c._id}/results`)}
                />
              ))}
            </Box>
          )}
        </Section>

      </Box>

      {/* ── Score breakdown (only if has scored assessments) ───────────────── */}
      {scored.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.3 }}>
          <Box sx={{ bgcolor: "#fff", borderRadius: 3, border: "1px solid #E5E7EB", p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
              <Box>
                <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Score Breakdown</Typography>
                <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: 0.2 }}>Based on {scored.length} scored assessment{scored.length !== 1 ? "s" : ""}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: `${scoreColor(avgScore)}10`, borderRadius: 2, px: 2, py: 0.75 }}>
                <TrendingUpOutlined sx={{ fontSize: 16, color: scoreColor(avgScore) }} />
                <Typography sx={{ fontSize: "13px", fontWeight: 700, color: scoreColor(avgScore) }}>{avgScore} avg</Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
              <ScoreGauge score={avgScore} size={104} />

              <Box sx={{ flex: 1, minWidth: 180, display: "flex", flexDirection: "column", gap: 2 }}>
                {[
                  { label: "Excellent (≥80)", value: scored.filter(c => (c as any).score >= 80).length, color: GREEN },
                  { label: "Good (60–79)",    value: scored.filter(c => { const s = (c as any).score; return s >= 60 && s < 80; }).length, color: TEAL },
                  { label: "Below 60",        value: scored.filter(c => (c as any).score < 60).length, color: ROSE },
                ].map(row => (
                  <Box key={row.label}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography sx={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>{row.label}</Typography>
                      <Typography sx={{ fontSize: "12px", color: "#374151", fontWeight: 700 }}>{row.value}/{scored.length}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={scored.length > 0 ? (row.value / scored.length) * 100 : 0}
                      sx={{ height: 6, borderRadius: 3, bgcolor: "#F3F4F6", "& .MuiLinearProgress-bar": { bgcolor: row.color, borderRadius: 3 } }}
                    />
                  </Box>
                ))}
              </Box>

              <Box sx={{ display: { xs: "none", xl: "flex" }, flexDirection: "column", gap: 1, minWidth: 200 }}>
                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.6, mb: 0.5 }}>
                  Recent scores
                </Typography>
                {scored.slice(0, 5).map(c => (
                  <Box key={c._id} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: scoreColor((c as any).score), flexShrink: 0 }} />
                    <Typography sx={{ fontSize: "12px", color: "#374151", fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.title}
                    </Typography>
                    <Typography sx={{ fontSize: "12px", fontWeight: 700, color: scoreColor((c as any).score) }}>{(c as any).score}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </motion.div>
      )}

    </Box>
  );
};

export default memo(EmployeeDashboardOverview);
