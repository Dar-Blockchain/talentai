import React, { memo, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchEmployeeCampaigns,
  selectEmployeeCampaigns,
  selectEmployeeCampaignsLoading,
  selectEmployeeCampaignsError,
  EmployeeCampaignEntry,
} from "@/store/slices/campaignSlice";
import {
  Box, Typography, Chip, Button, LinearProgress, Skeleton, Alert,
} from "@mui/material";
import {
  InsightsOutlined, AccountTreeOutlined, SchoolOutlined, TuneOutlined,
  DescriptionOutlined, PsychologyOutlined, AssignmentTurnedInOutlined, PeopleOutlined,
  AccessTimeOutlined, CheckCircleOutlined, RadioButtonUncheckedOutlined,
  PlayArrowOutlined, VisibilityOutlined, ArrowForwardOutlined, FilterListOutlined,
  EmojiEventsOutlined,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { Campaign, CampaignType, ModuleType, ParticipantStatus } from "@/types/campaign";

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterTab = "ALL" | ParticipantStatus;

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL   = "#0D9488";
const PURPLE = "#8B5CF6";
const BLUE   = "#3B82F6";
const AMBER  = "#F59E0B";
const GREEN  = "#10B981";
const ROSE   = "#F43F5E";

const TYPE_META: Record<CampaignType, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  SKILLS_MAPPING:          { label: "Skills Mapping",          color: TEAL,   bg: "#F0FDFA", icon: AccountTreeOutlined },
  ENABLEMENT:              { label: "Enablement",              color: AMBER,  bg: "#FFFBEB", icon: SchoolOutlined },
  PRODUCTIVITY_DIAGNOSTIC: { label: "Productivity Diagnostic", color: BLUE,   bg: "#EFF6FF", icon: InsightsOutlined },
  CUSTOM:                  { label: "Custom",                  color: PURPLE, bg: "#F5F3FF", icon: TuneOutlined },
};

const MODULE_META: Record<ModuleType, { label: string; icon: React.ElementType; color: string }> = {
  SKILL_TEST:    { label: "Skill Test",    icon: AssignmentTurnedInOutlined, color: GREEN },
  AI_INTERVIEW:  { label: "AI Interview",  icon: PsychologyOutlined,         color: PURPLE },
  QUESTIONNAIRE: { label: "Questionnaire", icon: DescriptionOutlined,        color: BLUE },
  TRAINING_PATH: { label: "Training Path", icon: PeopleOutlined,             color: AMBER },
};

const PARTICIPANT_STATUS_META: Record<ParticipantStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  NOT_STARTED: { label: "Not Started", color: "#9CA3AF", bg: "#F9FAFB",   icon: RadioButtonUncheckedOutlined },
  IN_PROGRESS: { label: "In Progress", color: AMBER,    bg: "#FFFBEB",   icon: PlayArrowOutlined },
  COMPLETED:   { label: "Completed",   color: GREEN,    bg: "#F0FDF4",   icon: CheckCircleOutlined },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (iso?: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const daysLeft = (iso?: string) => {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
};

const scoreColor = (s: number) => s >= 80 ? GREEN : s >= 60 ? TEAL : s >= 40 ? AMBER : ROSE;

// ─── Score Ring ───────────────────────────────────────────────────────────────

const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const size = 56;
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const color = scoreColor(score);
  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={5} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * circ} ${circ}`} />
      </svg>
      <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography sx={{ fontSize: "13px", fontWeight: 800, color: "#111827", lineHeight: 1 }}>{score}%</Typography>
      </Box>
    </Box>
  );
};

// ─── Campaign Card ────────────────────────────────────────────────────────────

const CampaignCard: React.FC<{ campaign: Campaign; index: number; onStart: (id: string) => void }> = memo(
  ({ campaign, index, onStart }) => {
    const tm = TYPE_META[campaign.type];
    const mm = MODULE_META[campaign.module.type];
    const ps = PARTICIPANT_STATUS_META[campaign?.participantStatus || "NOT_STARTED"];
    const TypeIcon = tm.icon;
    const ModIcon  = mm.icon;
    const StatIcon = ps.icon;
    const remaining = daysLeft(campaign.deadline);

    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ delay: index * 0.05, duration: 0.25 }}
        style={{ height: "100%" }}
      >
        <Box sx={{
          bgcolor: "#fff", borderRadius: 3, border: "1px solid #E5E7EB",
          overflow: "hidden", display: "flex", flexDirection: "column", height: "100%",
          "&:hover": { boxShadow: "0 8px 28px rgba(0,0,0,0.08)", transform: "translateY(-2px)" },
          transition: "all 0.22s",
        }}>

          {/* Top accent line per type */}
          <Box sx={{ height: 3, bgcolor: tm.color, opacity: 0.7 }} />

          <Box sx={{ p: 2.5, flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>

            {/* Header row */}
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ p: 1.1, borderRadius: 2, bgcolor: tm.bg, flexShrink: 0 }}>
                  <TypeIcon sx={{ fontSize: 18, color: tm.color }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>
                    {campaign.title}
                  </Typography>
                  <Chip label={tm.label} size="small" sx={{ mt: 0.5, fontSize: "9px", fontWeight: 700, height: 18, bgcolor: tm.bg, color: tm.color, border: `1px solid ${tm.color}30` }} />
                </Box>
              </Box>

              {/* Status badge */}
              <Chip
                icon={<StatIcon sx={{ fontSize: "11px !important" }} />}
                label={ps.label}
                size="small"
                sx={{ fontSize: "10px", fontWeight: 700, height: 22, bgcolor: ps.bg, color: ps.color, border: "none", flexShrink: 0, "& .MuiChip-icon": { color: ps.color } }}
              />
            </Box>

            {/* Description */}
            <Typography sx={{
              fontSize: "12px", color: "#6B7280", lineHeight: 1.6,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {campaign.description}
            </Typography>

            {/* Meta row */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mt: "auto" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <ModIcon sx={{ fontSize: 13, color: mm.color }} />
                <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>{mm.label}</Typography>
              </Box>
              {campaign.deadline && campaign.participantStatus !== "COMPLETED" && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <AccessTimeOutlined sx={{ fontSize: 13, color: remaining !== null && remaining <= 7 ? ROSE : "#9CA3AF" }} />
                  <Typography sx={{ fontSize: "11px", color: remaining !== null && remaining <= 7 ? ROSE : "#6B7280", fontWeight: remaining !== null && remaining <= 7 ? 600 : 400 }}>
                    {remaining !== null && remaining > 0 ? `${remaining}d left` : remaining === 0 ? "Due today" : `Due ${fmtDate(campaign.deadline)}`}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>{campaign.targetEmployeeCount} participants</Typography>
              </Box>
            </Box>
          </Box>

          {/* Footer CTA */}
          <Box sx={{ px: 2.5, py: 2, borderTop: "1px solid #F3F4F6", bgcolor: "#FAFAFA" }}>
            {campaign.participantStatus === "NOT_STARTED" && (
              <Button
                fullWidth
                startIcon={<PlayArrowOutlined />}
                onClick={() => onStart(campaign._id)}
                sx={{
                  bgcolor: TEAL, color: "#fff", fontWeight: 600, fontSize: "13px",
                  textTransform: "none", borderRadius: 2, py: 0.9,
                  "&:hover": { bgcolor: "#0b7a6e" },
                }}
              >
                Start Campaign
              </Button>
            )} 
            {campaign.participantStatus === "IN_PROGRESS" && (
              <Button
                fullWidth
                startIcon={<ArrowForwardOutlined />}
                onClick={() => onStart(campaign._id)}
                sx={{
                  bgcolor: AMBER, color: "#fff", fontWeight: 600, fontSize: "13px",
                  textTransform: "none", borderRadius: 2, py: 0.9,
                  "&:hover": { bgcolor: "#d97706" },
                }}
              >
                Continue
              </Button>
            )}
            {campaign.participantStatus === "COMPLETED" && (
              <Button
                fullWidth
                startIcon={<VisibilityOutlined />}
                onClick={() => onStart(campaign._id)}
                variant="outlined"
                sx={{
                  borderColor: "#E5E7EB", color: "#374151", fontWeight: 600, fontSize: "13px",
                  textTransform: "none", borderRadius: 2, py: 0.9,
                  "&:hover": { borderColor: TEAL, color: TEAL, bgcolor: "#F0FDFA" },
                }}
              >
                View Results
              </Button>
            )}
          </Box>
        </Box>
      </motion.div>
    );
  }
);

// ─── Summary Pill ─────────────────────────────────────────────────────────────

const SummaryPill: React.FC<{ icon: React.ElementType; label: string; value: number; color: string; bg: string; active: boolean; onClick: () => void }> = (
  { icon: Icon, label, value, color, bg, active, onClick }
) => (
  <Box
    onClick={onClick}
    sx={{
      display: "flex", alignItems: "center", gap: 1.5, px: 2.5, py: 1.5,
      borderRadius: 3, border: `1.5px solid ${active ? color : "#E5E7EB"}`,
      bgcolor: active ? bg : "#fff", cursor: "pointer",
      transition: "all 0.18s",
      "&:hover": { borderColor: color, bgcolor: bg },
    }}
  >
    <Box sx={{ p: 0.8, borderRadius: 1.5, bgcolor: active ? `${color}20` : "#F3F4F6" }}>
      <Icon sx={{ fontSize: 18, color: active ? color : "#9CA3AF" }} />
    </Box>
    <Box>
      <Typography sx={{ fontSize: "20px", fontWeight: 800, color: "#111827", lineHeight: 1 }}>{value}</Typography>
      <Typography sx={{ fontSize: "11px", color: active ? color : "#9CA3AF", fontWeight: 600, mt: 0.2 }}>{label}</Typography>
    </Box>
  </Box>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const EmployeeMyCampaigns: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("ALL");

  const userId = useSelector((state: RootState) => state.user.connectedUser.user?._id);
  const campaigns = useSelector(selectEmployeeCampaigns);
  const loading = useSelector(selectEmployeeCampaignsLoading);
  const error = useSelector(selectEmployeeCampaignsError);

  useEffect(() => {
    if (userId) dispatch(fetchEmployeeCampaigns(userId));
  }, [dispatch, userId]);

  const avgScore = 10;

  const handleStart = (id: string) => {
    router.push(`/employee/campaigns/${id}`);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: 3, p: { xs: 2.5, md: 3 }, position: "relative", overflow: "hidden" }}>
          {/* left accent */}
          <Box sx={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", bgcolor: PURPLE, borderRadius: "3px 0 0 3px" }} />
          {/* bg blob */}
          <Box sx={{ position: "absolute", top: -30, right: -20, width: 160, height: 160, borderRadius: "50%", bgcolor: "#F5F3FF", pointerEvents: "none" }} />

          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography sx={{ fontSize: "22px", fontWeight: 800, color: "#111827", letterSpacing: "-0.3px" }}>
              My Campaigns
            </Typography>
            <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.4 }}>
              Track your assigned campaigns, assessments, and learning paths.
            </Typography>
          </Box>
        </Box>
      </motion.div>

      {/* ── Summary Pills ─────────────────────────────────────────────────────── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 2 }}>
        <SummaryPill icon={FilterListOutlined}               label="Total"       value={0}         color={TEAL}   bg="#F0FDFA" active={activeFilter === "ALL"}         onClick={() => setActiveFilter("ALL")} />
        <SummaryPill icon={RadioButtonUncheckedOutlined}     label="Not Started" value={0}  color="#9CA3AF" bg="#F9FAFB" active={activeFilter === "NOT_STARTED"} onClick={() => setActiveFilter("NOT_STARTED")} />
        <SummaryPill icon={PlayArrowOutlined}                label="In Progress" value={0}  color={AMBER}  bg="#FFFBEB" active={activeFilter === "IN_PROGRESS"} onClick={() => setActiveFilter("IN_PROGRESS")} />
        <SummaryPill icon={CheckCircleOutlined}              label="Completed"   value={0}   color={GREEN}  bg="#F0FDF4" active={activeFilter === "COMPLETED"}   onClick={() => setActiveFilter("COMPLETED")} />
      </Box>

      {/* ── Loading skeletons ─────────────────────────────────────────────────── */}
      {loading && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", xl: "repeat(3, 1fr)" }, gap: 3 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={260} sx={{ borderRadius: 3 }} />
          ))}
        </Box>
      )}

      {/* ── Error state ───────────────────────────────────────────────────────── */}
      {!loading && error && (
        <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
      )}

      {/* ── Avg score banner (if any completed) ───────────────────────────────── */}
      {avgScore > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Box sx={{
            display: "flex", alignItems: "center", gap: 2, p: 2, borderRadius: 3,
            bgcolor: `${scoreColor(avgScore)}0D`, border: `1px solid ${scoreColor(avgScore)}30`,
          }}>
            <EmojiEventsOutlined sx={{ fontSize: 28, color: scoreColor(avgScore) }} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>
                Your average score across completed campaigns is <span style={{ color: scoreColor(avgScore) }}>{avgScore}%</span>
              </Typography>
              <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>
                {avgScore >= 80 ? "Outstanding performance — keep it up!" : avgScore >= 60 ? "Good work — a few more campaigns to boost your score." : "Room to grow — complete more assessments to improve."}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={avgScore}
              sx={{ width: 80, height: 6, borderRadius: 3, bgcolor: "#F3F4F6", "& .MuiLinearProgress-bar": { bgcolor: scoreColor(avgScore), borderRadius: 3 } }}
            />
            <Typography sx={{ fontSize: "14px", fontWeight: 800, color: scoreColor(avgScore), minWidth: 36 }}>{avgScore}%</Typography>
          </Box>
        </motion.div>
      )}

      {/* ── Campaign Grid ─────────────────────────────────────────────────────── */}
      {!loading && !error && campaigns.length === 0 ? (
        <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: 3, py: 10, textAlign: "center" }}>
          <CheckCircleOutlined sx={{ fontSize: 40, color: "#E5E7EB", mb: 1.5 }} />
          <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>No campaigns here</Typography>
          <Typography sx={{ fontSize: "13px", color: "#9CA3AF", mt: 0.5 }}>
            {activeFilter === "NOT_STARTED" ? "All campaigns have been started." : activeFilter === "IN_PROGRESS" ? "No campaigns in progress right now." : "You haven't completed any campaigns yet."}
          </Typography>
        </Box>
      ) : !loading && !error ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", xl: "repeat(3, 1fr)" }, gap: 3 }}>
          <AnimatePresence mode="popLayout">
            {campaigns.map((campaign, i) => (
              <CampaignCard key={campaign._id} campaign={campaign} index={i} onStart={handleStart} />
            ))}
          </AnimatePresence>
        </Box>
      ) : null}

    </Box>
  );
};

export default memo(EmployeeMyCampaigns);
