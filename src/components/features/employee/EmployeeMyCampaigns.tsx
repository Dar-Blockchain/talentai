import React, { memo, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchEmployeeCampaigns,
  fetchEmployeeCampaignMetrics,
  selectEmployeeCampaigns,
  selectEmployeeCampaignsLoading,
  selectEmployeeCampaignsError,
  EmployeeCampaignEntry,
  EmployeeCampaignFilters,
} from "@/store/slices/campaignSlice";
import {
  Box, Typography, Chip, Button, LinearProgress, Skeleton, Alert, IconButton, Tooltip,
  TextField, InputAdornment, MenuItem, Select, FormControl,
} from "@mui/material";
import {
  InsightsOutlined, AccountTreeOutlined, SchoolOutlined, TuneOutlined,
  DescriptionOutlined, PsychologyOutlined, AssignmentTurnedInOutlined, PeopleOutlined,
  AccessTimeOutlined, CheckCircleOutlined, RadioButtonUncheckedOutlined,
  PlayArrowOutlined, VisibilityOutlined, ArrowForwardOutlined, FilterListOutlined,
  EmojiEventsOutlined, InfoOutlined, SearchOutlined, CalendarTodayOutlined, CloseOutlined,
  PauseCircleOutlined, StopCircleOutlined,
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
  INVITED:     { label: "Invited",     color: "#0891B2", bg: "#ECFDF5",   icon: RadioButtonUncheckedOutlined },
  IN_PROGRESS: { label: "In Progress", color: AMBER,    bg: "#FFFBEB",   icon: PlayArrowOutlined },
  COMPLETED:   { label: "Completed",   color: GREEN,    bg: "#F0FDF4",   icon: CheckCircleOutlined },
  DROPPED:     { label: "Dropped",     color: ROSE,     bg: "#FEF2F2",   icon: RadioButtonUncheckedOutlined },
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

// ─── Campaign Card ────────────────────────────────────────────────────────────

const CampaignCard: React.FC<{ campaign: Campaign; index: number; onStart: (id: string) => void; onDetails: (id: string) => void }> = memo(
  ({ campaign, index, onStart, onDetails }) => {
    const tm = campaign.type ? TYPE_META[campaign.type] : null;
    const mm = MODULE_META[campaign.module.type];
    const ps = PARTICIPANT_STATUS_META[campaign?.participantStatus || "INVITED"];
    const TypeIcon = tm?.icon ?? null;
    const ModIcon  = mm.icon;
    const StatIcon = ps.icon;
    const remaining = daysLeft(campaign.deadline);
    const isExpired = campaign.deadline
      ? new Date(campaign.deadline).getTime() < Date.now()
      : false;
    const isPaused  = campaign.status === "PAUSED";
    const isClosed  = campaign.status === "CLOSED";
    const campaignAccessible = !isPaused && !isClosed;
    const isActive = (campaign.participantStatus === "INVITED" || campaign.participantStatus === "IN_PROGRESS") && campaignAccessible;

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
          <Box sx={{ height: 3, bgcolor: tm?.color ?? "#E5E7EB", opacity: 0.7 }} />

          <Box sx={{ p: 2.5, flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>

            {/* Header row */}
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                {tm && TypeIcon && (
                  <Box sx={{ p: 1.1, borderRadius: 2, bgcolor: tm.bg, flexShrink: 0 }}>
                    <TypeIcon sx={{ fontSize: 18, color: tm.color }} />
                  </Box>
                )}
                <Box>
                  <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>
                    {campaign.title}
                  </Typography>
                  {tm && (
                    <Chip label={tm.label} size="small" sx={{ mt: 0.5, fontSize: "9px", fontWeight: 700, height: 18, bgcolor: tm.bg, color: tm.color, border: `1px solid ${tm.color}30` }} />
                  )}
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
                  <AccessTimeOutlined sx={{ fontSize: 13, color: isExpired ? ROSE : remaining !== null && remaining <= 7 ? ROSE : "#9CA3AF" }} />
                  <Typography sx={{ fontSize: "11px", color: isExpired ? ROSE : remaining !== null && remaining <= 7 ? ROSE : "#6B7280", fontWeight: isExpired || (remaining !== null && remaining <= 7) ? 600 : 400 }}>
                    {isExpired ? "Expired" : remaining !== null && remaining > 0 ? `${remaining}d left` : "Due today"}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>{campaign.targetEmployeeCount} participants</Typography>
              </Box>
            </Box>
          </Box>

          {/* Footer CTA */}
          <Box sx={{ px: 2.5, py: 2, borderTop: "1px solid #F3F4F6", bgcolor: "#FAFAFA", display: "flex", gap: 1, alignItems: "center" }}>
            {isPaused && campaign.participantStatus !== "COMPLETED" && (
              <Box sx={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75,
                py: 0.9, borderRadius: 2, bgcolor: "#FFFBEB", border: "1px solid #FDE68A",
              }}>
                <PauseCircleOutlined sx={{ fontSize: 15, color: "#D97706" }} />
                <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#D97706" }}>Campaign paused</Typography>
              </Box>
            )}
            {isClosed && campaign.participantStatus !== "COMPLETED" && (
              <Box sx={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75,
                py: 0.9, borderRadius: 2, bgcolor: "#EFF6FF", border: "1px solid #BFDBFE",
              }}>
                <StopCircleOutlined sx={{ fontSize: 15, color: "#2563EB" }} />
                <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#2563EB" }}>Campaign closed</Typography>
              </Box>
            )}
            {isActive && isExpired && (
              <Box sx={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75,
                py: 0.9, borderRadius: 2, bgcolor: "#FEF2F2", border: "1px solid #FECACA",
              }}>
                <AccessTimeOutlined sx={{ fontSize: 15, color: "#EF4444" }} />
                <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#EF4444" }}>Deadline passed</Typography>
              </Box>
            )}
            {campaign.participantStatus === "INVITED" && !isExpired && campaignAccessible && (
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
            {campaign.participantStatus === "IN_PROGRESS" && !isExpired && campaignAccessible && (
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
              <>
                {campaign.score != null && (
                  <Box sx={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    px: 1.5, py: 0.6, borderRadius: 2, flexShrink: 0,
                    bgcolor: `${scoreColor(campaign.score)}15`,
                    border: `1px solid ${scoreColor(campaign.score)}30`,
                  }}>
                    <Typography sx={{ fontSize: "15px", fontWeight: 800, color: scoreColor(campaign.score), lineHeight: 1 }}>
                      {campaign.score}
                    </Typography>
                    <Typography sx={{ fontSize: "9px", color: scoreColor(campaign.score), fontWeight: 600, opacity: 0.8 }}>
                      /100
                    </Typography>
                  </Box>
                )}
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
                  View Details
                </Button>
              </>
            )}
            <Tooltip title="Campaign details" arrow>
              <IconButton
                onClick={() => onDetails(campaign._id)}
                size="small"
                sx={{
                  flexShrink: 0, border: "1px solid #E5E7EB", borderRadius: 2,
                  color: "#6B7280", bgcolor: "#fff", p: 0.9,
                  "&:hover": { borderColor: PURPLE, color: PURPLE, bgcolor: "#F5F3FF" },
                }}
              >
                <InfoOutlined sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
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

const PERIOD_OPTIONS = [
  { value: "",    label: "All time"      },
  { value: "7d",  label: "Last 7 days"  },
  { value: "30d", label: "Last 30 days" },
  { value: "3m",  label: "Last 3 months"},
  { value: "6m",  label: "Last 6 months"},
  { value: "1y",  label: "Last year"    },
];

// ─── Main Component ────────────────────────────────────────────────────────────

const EmployeeMyCampaigns: React.FC = () => {
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [activeFilter, setActiveFilter] = useState<FilterTab>("ALL");
  const [search,  setSearch]  = useState("");
  const [period,  setPeriod]  = useState("");
  const [searchInput, setSearchInput] = useState("");

  const userId   = useSelector((state: RootState) => state.user.connectedUser.user?._id);
  const campaigns = useSelector(selectEmployeeCampaigns);
  const loading   = useSelector(selectEmployeeCampaignsLoading);
  const error     = useSelector(selectEmployeeCampaignsError);
  const metrics   = useSelector((state: RootState) => state.campaign.employeeMetrics);

  const doFetch = useCallback((filters: Partial<EmployeeCampaignFilters> = {}) => {
    if (!userId) return;
    dispatch(fetchEmployeeCampaigns({
      userId,
      search:            filters.search            ?? search,
      participantStatus: filters.participantStatus ?? (activeFilter !== "ALL" ? activeFilter : undefined),
      period:            filters.period            ?? period,
    }));
  }, [dispatch, userId, search, activeFilter, period]);

  // initial load + metrics
  useEffect(() => {
    if (userId) {
      doFetch();
      dispatch(fetchEmployeeCampaignMetrics(userId));
    }
  }, [userId]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      if (userId) dispatch(fetchEmployeeCampaigns({
        userId,
        search: searchInput,
        participantStatus: activeFilter !== "ALL" ? activeFilter : undefined,
        period,
      }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleFilterChange = (tab: FilterTab) => {
    setActiveFilter(tab);
    if (!userId) return;
    dispatch(fetchEmployeeCampaigns({
      userId, search,
      participantStatus: tab !== "ALL" ? tab : undefined,
      period,
    }));
  };

  const handlePeriodChange = (val: string) => {
    setPeriod(val);
    if (!userId) return;
    dispatch(fetchEmployeeCampaigns({
      userId, search,
      participantStatus: activeFilter !== "ALL" ? activeFilter : undefined,
      period: val,
    }));
  };

  const clearFilters = () => {
    setSearchInput(""); setSearch(""); setPeriod(""); setActiveFilter("ALL");
    if (userId) dispatch(fetchEmployeeCampaigns({ userId }));
  };

  const hasActiveFilters = search || period || activeFilter !== "ALL";

  const avgScore = 10;

  const handleStart = (id: string) => {
    router.push(`/employee/campaigns/${id}`);
  };

  const handleDetails = (id: string) => {
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
        <SummaryPill icon={FilterListOutlined}               label="Total"       value={metrics?.total      ?? 0} color={TEAL}    bg="#F0FDFA" active={activeFilter === "ALL"}          onClick={() => handleFilterChange("ALL")} />
        <SummaryPill icon={RadioButtonUncheckedOutlined}     label="Invited"     value={metrics?.invited    ?? 0} color="#0891B2" bg="#ECFDF5" active={activeFilter === "INVITED"}      onClick={() => handleFilterChange("INVITED")} />
        <SummaryPill icon={PlayArrowOutlined}                label="In Progress" value={metrics?.inProgress ?? 0} color={AMBER}   bg="#FFFBEB" active={activeFilter === "IN_PROGRESS"} onClick={() => handleFilterChange("IN_PROGRESS")} />
        <SummaryPill icon={CheckCircleOutlined}              label="Completed"   value={metrics?.completed  ?? 0} color={GREEN}   bg="#F0FDF4" active={activeFilter === "COMPLETED"}   onClick={() => handleFilterChange("COMPLETED")} />
      </Box>

      {/* ── Filters bar ───────────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
        {/* Search */}
        <TextField
          size="small"
          placeholder="Search campaigns…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined sx={{ fontSize: 16, color: "#9CA3AF" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            flex: 1, minWidth: 200,
            "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fff", fontSize: 13 },
          }}
        />

        {/* Period */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value)}
            displayEmpty
            renderValue={(v) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarTodayOutlined sx={{ fontSize: 14, color: "#9CA3AF" }} />
                <Typography sx={{ fontSize: 13, color: v ? "#111827" : "#9CA3AF" }}>
                  {PERIOD_OPTIONS.find(o => o.value === v)?.label ?? "Period"}
                </Typography>
              </Box>
            )}
            sx={{ borderRadius: 2, bgcolor: "#fff", fontSize: 13 }}
          >
            {PERIOD_OPTIONS.map(o => (
              <MenuItem key={o.value} value={o.value} sx={{ fontSize: 13 }}>{o.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button
            size="small"
            startIcon={<CloseOutlined sx={{ fontSize: 14 }} />}
            onClick={clearFilters}
            sx={{ textTransform: "none", fontSize: 12, color: "#6B7280", borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "#fff", px: 1.5, whiteSpace: "nowrap" }}
          >
            Clear
          </Button>
        )}
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

      {/* ── Campaign Grid ─────────────────────────────────────────────────────── */}
      {!loading && !error && campaigns.length === 0 ? (
        <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: 3, py: 10, textAlign: "center" }}>
          <CheckCircleOutlined sx={{ fontSize: 40, color: "#E5E7EB", mb: 1.5 }} />
          <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>No campaigns here</Typography>
          <Typography sx={{ fontSize: "13px", color: "#9CA3AF", mt: 0.5 }}>
            {activeFilter === "INVITED" ? "You have been invited to join campaigns." : activeFilter === "IN_PROGRESS" ? "No campaigns in progress right now." : "You haven't completed any campaigns yet."}
          </Typography>
        </Box>
      ) : !loading && !error ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", xl: "repeat(3, 1fr)" }, gap: 3 }}>
          <AnimatePresence mode="popLayout">
            {campaigns.map((campaign, i) => (
              <CampaignCard key={campaign._id} campaign={campaign} index={i} onStart={handleStart} onDetails={handleDetails} />
            ))}
          </AnimatePresence>
        </Box>
      ) : null}
    </Box>
  );
};

export default memo(EmployeeMyCampaigns);
