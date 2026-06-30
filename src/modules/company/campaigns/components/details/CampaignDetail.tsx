import React, { memo, useState, useMemo, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Campaign, CampaignModule, CampaignStatus, ModuleType, ParticipantStatus } from "@/modules/company/campaigns/types/campaign";
import CampaignHeader from "./CampaignHeader";
import CampaignDetailsCard from "./CampaignDetailsCard";
import CampaignModuleCard from "./CampaignModuleCard";
import CampaignSidebar from "./CampaignSidebar";
import CampaignParticipantsTab from "./CampaignParticipantsTab";
import CampaignSessionsTab from "./CampaignSessionsTab";
import DeleteCampaignDialog from "./DeleteCampaignDialog";
import ConfirmStatusChangeDialog from "./ConfirmStatusChangeDialog";
import ConfigureModuleModal from "./configure/ConfigureModuleModal";
import EditCampaignModal from "./EditCampaignModal";
import { useDeleteCampaignMutation } from "../../queries";
import PeopleAltOutlined            from "@mui/icons-material/PeopleAltOutlined";
import AssignmentOutlined           from "@mui/icons-material/AssignmentOutlined";
import AccessTimeOutlined           from "@mui/icons-material/AccessTimeOutlined";
import DashboardOutlined            from "@mui/icons-material/DashboardOutlined";
import EmojiEventsOutlined          from "@mui/icons-material/EmojiEventsOutlined";
import PlayArrowOutlined            from "@mui/icons-material/PlayArrow";
import ArrowForwardOutlined         from "@mui/icons-material/ArrowForwardOutlined";
import CheckCircleOutlined          from "@mui/icons-material/CheckCircleOutlined";
import RadioButtonUncheckedOutlined from "@mui/icons-material/RadioButtonUnchecked";
import TuneOutlined                 from "@mui/icons-material/TuneOutlined";
import RocketLaunchOutlined         from "@mui/icons-material/RocketLaunchOutlined";
import VisibilityOffOutlined        from "@mui/icons-material/VisibilityOffOutlined";
import { MODULE_CONFIG } from "@/modules/shared/constants/campaign";
import { daysLeft, isDeadlinePassed } from "@/utils/functions";
import { buildInterviewUrl } from "@/lib/interviewSession";

// ─── Static constants ─────────────────────────────────────────────────────────

const PURPLE = "#8310FF";

const CARD_SX = {
  bgcolor: "#fff", border: "1px solid #EDEEF0",
  borderRadius: "18px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
} as const;

const PARTICIPANT_STATUS_STYLE: Record<ParticipantStatus, { color: string; bg: string }> = {
  INVITED:     { color: "#0891B2", bg: "#ECFDF5" },
  IN_PROGRESS: { color: "#D97706", bg: "#FFFBEB" },
  COMPLETED:   { color: "#16A34A", bg: "#F0FDF4" },
  DROPPED:     { color: "#EF4444", bg: "#FEF2F2" },
};

const PAGE_SX        = { display: "flex", flexDirection: "column", gap: 1.5 } as const;
const STATS_GRID_SX  = { display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 1.5 } as const;
const STAT_CARD_SX   = { ...CARD_SX, p: 2, display: "flex", alignItems: "center", gap: 1.5 } as const;
const STAT_LABEL_SX  = { fontSize: "10px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.02em" } as const;
const STAT_VALUE_SX  = { fontSize: "15px", fontWeight: 800, color: "#111827", lineHeight: 1.2, mt: 0.25 } as const;
const TAB_SHELL_SX   = { ...CARD_SX, p: 0, overflow: "hidden" } as const;
const TAB_BAR_SX     = { display: "flex", alignItems: "center", px: 2, py: 1.25, borderBottom: "1px solid #F3F4F6" } as const;
const TAB_STRIP_SX   = { display: "inline-flex", alignItems: "center", bgcolor: "#F3F4F6", borderRadius: "12px", p: 0.5, gap: 0.5 } as const;
const TAB_CONTENT_SX = { p: 2.5 } as const;
const OV_GRID_SX     = { display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 280px" }, gap: 1.5, alignItems: "start" } as const;
const OV_LEFT_SX     = { display: "flex", flexDirection: "column", gap: 1.5 } as const;
const SETUP_BG_SX    = { position: "absolute", inset: 0, opacity: 0.035, background: "linear-gradient(135deg, #F59E0B 0%, #8310FF 100%)", pointerEvents: "none" } as const;
const SETUP_TITLE_ROW_SX = { display: "flex", alignItems: "center", gap: 1.25, mb: 2 } as const;
const SETUP_STEPS_SX = { display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5 } as const;
const SETUP_ARROW_SX = { display: { xs: "none", sm: "flex" }, alignItems: "center", color: "#D1D5DB", fontSize: 22, fontWeight: 300 } as const;
const SETUP_BANNER_SX = { bgcolor: "#fff", border: "1px solid #E2E8F0", borderRadius: "18px", p: 2.5, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", overflow: "hidden", position: "relative" } as const;
const SETUP_ICON_BOX_SX = { width: 32, height: 32, borderRadius: "9px", bgcolor: "#FFFBEB", border: "1px solid #FDE68A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } as const;
const SETUP_CONFIGURE_BTN_SX = { mt: 0.25, alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 0.5, px: 1.25, py: 0.625, borderRadius: "8px", cursor: "pointer", bgcolor: "#FEF3C7", border: "1px solid #FDE68A", transition: "all 0.15s", "&:hover": { bgcolor: "#FDE68A" } } as const;
const SETUP_ACTIVATE_BTN_SX = { mt: 0.25, alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 0.5, px: 1.25, py: 0.625, borderRadius: "8px", cursor: "pointer", bgcolor: "#2563EB", border: "1px solid #1D4ED8", transition: "all 0.15s", "&:hover": { bgcolor: "#1D4ED8" } } as const;
const BADGE_EXPIRED_SX = { display: "inline-flex", alignItems: "center", gap: 0.5, px: 1.125, py: "4px", borderRadius: "999px", bgcolor: "#FEF2F2", border: "1px solid #FECACA" } as const;
const BADGE_PAUSED_SX  = { display: "inline-flex", alignItems: "center", gap: 0.5, px: 1.125, py: "4px", borderRadius: "999px", bgcolor: "#FFFBEB", border: "1px solid #FDE68A" } as const;
const BADGE_CLOSED_SX  = { display: "inline-flex", alignItems: "center", gap: 0.5, px: 1.125, py: "4px", borderRadius: "999px", bgcolor: "#EFF6FF", border: "1px solid #BFDBFE" } as const;
const EXP_DOT_SX   = { width: 6, height: 6, borderRadius: "50%", bgcolor: "#EF4444" } as const;
const EXP_TEXT_SX  = { fontSize: "11px", fontWeight: 700, color: "#EF4444" } as const;
const PAU_DOT_SX   = { width: 6, height: 6, borderRadius: "50%", bgcolor: "#D97706" } as const;
const PAU_TEXT_SX  = { fontSize: "11px", fontWeight: 700, color: "#D97706" } as const;
const CLO_DOT_SX   = { width: 6, height: 6, borderRadius: "50%", bgcolor: "#2563EB" } as const;
const CLO_TEXT_SX  = { fontSize: "11px", fontWeight: 700, color: "#2563EB" } as const;
const STAT_ICON_SX_BASE = { width: 38, height: 38, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } as const;

// ─── TabPill ──────────────────────────────────────────────────────────────────

type TabKey = "overview" | "participants" | "sessions";

interface TabPillProps {
  tabKey: TabKey;
  label: string;
  icon: React.ReactNode;
  count?: number | string;
  color: string;
  active: boolean;
  onClick: (key: TabKey) => void;
}

const TAB_PILL_BASE = { display: "flex", alignItems: "center", gap: 1, px: 2, py: 0.875, borderRadius: "9px", cursor: "pointer", transition: "all 0.18s ease" } as const;

const TabPill: React.FC<TabPillProps> = memo(({ tabKey, label, icon, count, color, active, onClick }) => {
  const containerSx = useMemo(() => ({
    ...TAB_PILL_BASE,
    bgcolor: active ? "#fff" : "transparent",
    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
    "&:hover": active ? {} : { bgcolor: "#EAECF0" },
  }), [active]);

  const iconSx = useMemo(() => ({ color: active ? color : "#6B7280", display: "flex", fontSize: 16 }), [active, color]);
  const labelSx = useMemo(() => ({ fontSize: "13px", fontWeight: 700, color: active ? "#111827" : "#6B7280", whiteSpace: "nowrap" }), [active]);
  const badgeSx = useMemo(() => ({
    minWidth: 20, height: 20, borderRadius: "6px", px: 0.75,
    display: "flex", alignItems: "center", justifyContent: "center",
    bgcolor: active ? `${color}18` : "#E5E7EB",
  }), [active, color]);
  const countSx = useMemo(() => ({ fontSize: "11px", fontWeight: 800, color: active ? color : "#9CA3AF" }), [active, color]);

  const handleClick = useCallback(() => onClick(tabKey), [onClick, tabKey]);

  return (
    <Box onClick={handleClick} sx={containerSx}>
      <Box sx={iconSx}>{icon}</Box>
      <Typography sx={labelSx}>{label}</Typography>
      {count !== undefined && (
        <Box sx={badgeSx}>
          <Typography sx={countSx}>{count}</Typography>
        </Box>
      )}
    </Box>
  );
});
TabPill.displayName = "TabPill";

// ─── CampaignDetail ───────────────────────────────────────────────────────────

interface Props {
  campaign: Campaign;
  mode?: "company" | "employee";
  onDelete?: (id: string, title: string) => void;
  onChangeStatus?: (id: string, status: CampaignStatus) => void;
  onSaveModuleConfig?: (campaignId: string, moduleType: ModuleType, config: NonNullable<CampaignModule["config"]>) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canPublish?: boolean;
}

const CampaignDetail: React.FC<Props> = memo(({
  campaign, mode = "company", onDelete, onChangeStatus, onSaveModuleConfig,
  canEdit = true, canDelete = true, canPublish = true,
}) => {
  const { t, i18n } = useTranslation("dashboard");
  const tp = "pages.campaigns.detail";
  const translationLang = i18n.resolvedLanguage ?? i18n.language;
  const isEmployee = mode === "employee";

  const [tab,                 setTab]                 = useState<TabKey>("overview");
  const [deleteOpen,          setDeleteOpen]          = useState(false);
  const [editOpen,            setEditOpen]            = useState(false);
  const [configureModuleType, setConfigureModuleType] = useState<ModuleType | null>(null);
  const [pendingActivate,     setPendingActivate]     = useState(false);

  const deleteMut         = useDeleteCampaignMutation();
  const participantsTotal = campaign.participantCount ?? 0;
  const sessionsTotal     = (campaign as any).sessionCount ?? 0;
  const deleteLoading     = deleteMut.isPending;

  const participantStatusLabel = useCallback((s: ParticipantStatus) =>
    t(`pages.campaigns.detail.participants.participant_status.${s}`),
  [t, translationLang]);

  // ─── Event handlers ───────────────────────────────────────────────────────

  const handleTabChange   = useCallback((key: TabKey) => setTab(key), []);
  const openDelete        = useCallback(() => setDeleteOpen(true), []);
  const closeDelete       = useCallback(() => setDeleteOpen(false), []);
  const openEdit          = useCallback(() => setEditOpen(true), []);
  const closeEdit         = useCallback(() => setEditOpen(false), []);
  const closeConfig       = useCallback(() => setConfigureModuleType(null), []);
  const closePending      = useCallback(() => setPendingActivate(false), []);
  const openPending       = useCallback(() => setPendingActivate(true), []);

  const handleDeleteConfirm = useCallback(() => onDelete?.(campaign._id, campaign.title), [onDelete, campaign._id, campaign.title]);
  const handleActivateConfirm = useCallback(() => {
    onChangeStatus?.(campaign._id, "ACTIVE");
    setPendingActivate(false);
  }, [onChangeStatus, campaign._id]);

  const handleSaveConfig = useCallback((
    campaignId: string,
    moduleType: ModuleType,
    config: NonNullable<CampaignModule["config"]>,
  ) => {
    onSaveModuleConfig?.(campaignId, moduleType, config);
    setConfigureModuleType(null);
  }, [onSaveModuleConfig]);

  const openConfigureModule = useCallback((type: ModuleType) => setConfigureModuleType(type), []);

  const handleAssessmentAction = useCallback(() => {
    const modType = campaign.module?.type;
    const url = modType === 'QUESTIONNAIRE'
      ? `/campaign/questionnaire/${campaign._id}`
      : buildInterviewUrl({ type: 'campaign', campaignId: campaign._id, moduleType: modType as 'AI_INTERVIEW' | 'SKILL_TEST' });
    window.open(url, "_blank", "noopener,noreferrer");
  }, [campaign._id, campaign.module?.type]);

  // ─── Derived values ───────────────────────────────────────────────────────

  const modCfg       = useMemo(() => MODULE_CONFIG[campaign.module?.type], [campaign.module?.type]);
  const ModIcon      = modCfg?.icon;
  const remaining    = useMemo(() => daysLeft(campaign.deadline), [campaign.deadline]);
  const isExpired    = useMemo(() => isDeadlinePassed(campaign.deadline), [campaign.deadline]);
  const pStatus      = campaign.participantStatus ?? "INVITED";
  const ps           = PARTICIPANT_STATUS_STYLE[pStatus];
  const campaignAccessible = campaign.status === "ACTIVE";
  const canStart     = (pStatus === "INVITED" || pStatus === "IN_PROGRESS") && !isExpired && campaignAccessible;
  const moduleType   = campaign.module?.type;
  const supportsAction  = moduleType === "AI_INTERVIEW" || moduleType === "SKILL_TEST" || moduleType === "QUESTIONNAIRE";
  const isLinkBased     = campaign.accessMethod === "LINK";
  const moduleConfigured = campaign.module?.config != null;
  const showSetupBanner  = !isEmployee && campaign.status === "DRAFT";

  const score    = campaign.score ?? null;
  const scoreCol = useMemo(() =>
    score === null ? "#6B7280" : score >= 80 ? "#16A34A" : score >= 60 ? "#0D9488" : score >= 40 ? "#D97706" : "#EF4444",
  [score]);

  const moduleLabel = useMemo(() =>
    campaign.module?.type ? t(`pages.campaigns.module.${campaign.module.type}`) : "—",
  [campaign.module?.type, t]);

  const deadlineStatValue = useMemo(() =>
    remaining === null ? t(`${tp}.stats_no_deadline`)
      : remaining === 0 ? t(`${tp}.stats_expired`)
      : t(`${tp}.days_left_short`, { count: remaining }),
  [remaining, t, tp]);

  const deadlineColor = useMemo(() =>
    remaining === null ? "#6B7280" : remaining === 0 ? "#DC2626" : remaining <= 7 ? "#D97706" : "#16A34A",
  [remaining]);
  const deadlineBg = useMemo(() =>
    remaining === null ? "#F3F4F6" : remaining === 0 ? "#FEF2F2" : remaining <= 7 ? "#FFFBEB" : "#F0FDF4",
  [remaining]);

  const currentModuleConfig = useMemo(() =>
    configureModuleType ? (campaign.module?.config ?? null) : null,
  [configureModuleType, campaign.module?.config]);

  const STATS = useMemo(() => (isEmployee
    ? [
        { icon: PeopleAltOutlined, color: PURPLE, bg: `${PURPLE}08`, label: t(`${tp}.stats_participants`), value: campaign.participantCount !== undefined ? String(campaign.participantCount) : participantsTotal > 0 ? String(participantsTotal) : "—" },
        { icon: ModIcon, color: modCfg?.color ?? "#6B7280", bg: `${modCfg?.color ?? "#6B7280"}08`, label: t(`${tp}.stats_module`), value: moduleLabel },
        pStatus === "COMPLETED" && score !== null
          ? { icon: EmojiEventsOutlined, color: scoreCol, bg: `${scoreCol}12`, label: t(`${tp}.stats_my_score`), value: `${score} / 100` }
          : { icon: EmojiEventsOutlined, color: ps.color, bg: ps.bg, label: t(`${tp}.stats_my_status`), value: participantStatusLabel(pStatus) },
        { icon: AccessTimeOutlined, color: deadlineColor, bg: deadlineBg, label: t(`${tp}.stats_deadline`), value: deadlineStatValue },
      ]
    : [
        { icon: PeopleAltOutlined, color: PURPLE, bg: `${PURPLE}08`, label: t(`${tp}.stats_participants`), value: campaign.participantCount !== undefined ? String(campaign.participantCount) : participantsTotal > 0 ? String(participantsTotal) : "—" },
        { icon: ModIcon, color: modCfg?.color ?? "#6B7280", bg: `${modCfg?.color ?? "#6B7280"}08`, label: t(`${tp}.stats_module`), value: moduleLabel },
        { icon: AssignmentOutlined, color: "#0891B2", bg: "#E0F2FE", label: t(`${tp}.stats_sessions`), value: campaign.sessionCount !== undefined ? String(campaign.sessionCount) : sessionsTotal > 0 ? String(sessionsTotal) : "—" },
        { icon: AccessTimeOutlined, color: deadlineColor, bg: deadlineBg, label: t(`${tp}.stats_deadline`), value: deadlineStatValue },
      ]),
  [isEmployee, campaign.participantCount, campaign.sessionCount, participantsTotal, sessionsTotal, modCfg?.color, ModIcon, pStatus, score, scoreCol, ps.color, ps.bg, remaining, t, tp, moduleLabel, deadlineStatValue, deadlineColor, deadlineBg, participantStatusLabel, translationLang]);

  const TABS = useMemo(() => [
    { key: "overview" as TabKey,      label: t(`${tp}.tab_overview`),      icon: <DashboardOutlined sx={{ fontSize: 16 }} />, color: PURPLE,     count: undefined as number | string | undefined },
    ...(!isLinkBased  ? [{ key: "participants" as TabKey, label: t(`${tp}.tab_participants`), icon: <PeopleAltOutlined  sx={{ fontSize: 16 }} />, color: PURPLE,     count: participantsTotal || undefined }] : []),
    ...(!isEmployee   ? [{ key: "sessions"     as TabKey, label: t(`${tp}.tab_sessions`),     icon: <AssignmentOutlined sx={{ fontSize: 16 }} />, color: "#0891B2", count: sessionsTotal || undefined }] : []),
  ], [t, tp, translationLang, isLinkBased, isEmployee, participantsTotal, sessionsTotal]);

  // ─── Employee-mode actions node ───────────────────────────────────────────

  const empBadgeSx = useMemo(() => ({
    display: "inline-flex", alignItems: "center", gap: 0.5,
    px: 1.125, py: "4px", borderRadius: "999px", bgcolor: ps.bg,
  }), [ps.bg]);
  const empDotSx = useMemo(() => ({ width: 6, height: 6, borderRadius: "50%", bgcolor: ps.color }), [ps.color]);
  const empTextSx = useMemo(() => ({ fontSize: "11px", fontWeight: 700, color: ps.color }), [ps.color]);
  const ctaBtnSx = useMemo(() => ({
    display: "flex", alignItems: "center", gap: 0.625,
    px: 1.625, py: 0.75, borderRadius: "10px", cursor: "pointer",
    bgcolor: pStatus === "IN_PROGRESS" ? "#FFFBEB" : `${PURPLE}10`,
    border: `1px solid ${pStatus === "IN_PROGRESS" ? "#FDE68A" : `${PURPLE}30`}`,
    transition: "all 0.15s", "&:hover": { opacity: 0.85 },
  }), [pStatus]);
  const ctaTextSx = useMemo(() => ({ fontSize: "0.775rem", fontWeight: 700, color: pStatus === "IN_PROGRESS" ? "#D97706" : PURPLE }), [pStatus]);

  const employeeActionsNode = useMemo(() => !isEmployee ? undefined : (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.875 }}>
      <Box sx={empBadgeSx}>
        <Box sx={empDotSx} />
        <Typography sx={empTextSx}>{participantStatusLabel(pStatus)}</Typography>
      </Box>

      {isExpired && pStatus !== "COMPLETED" && (
        <Box sx={BADGE_EXPIRED_SX}>
          <Box sx={EXP_DOT_SX} />
          <Typography sx={EXP_TEXT_SX}>{t(`${tp}.employee_deadline_passed`)}</Typography>
        </Box>
      )}
      {campaign.status === "PAUSED" && (
        <Box sx={BADGE_PAUSED_SX}>
          <Box sx={PAU_DOT_SX} />
          <Typography sx={PAU_TEXT_SX}>{t(`${tp}.employee_campaign_paused`)}</Typography>
        </Box>
      )}
      {campaign.status === "CLOSED" && (
        <Box sx={BADGE_CLOSED_SX}>
          <Box sx={CLO_DOT_SX} />
          <Typography sx={CLO_TEXT_SX}>{t(`${tp}.employee_campaign_closed`)}</Typography>
        </Box>
      )}

      {supportsAction && canStart && (
        <Box onClick={handleAssessmentAction} sx={ctaBtnSx}>
          {pStatus === "IN_PROGRESS"
            ? <ArrowForwardOutlined sx={{ fontSize: 14, color: "#D97706" }} />
            : <PlayArrowOutlined    sx={{ fontSize: 14, color: PURPLE }} />}
          <Typography sx={ctaTextSx}>
            {pStatus === "IN_PROGRESS" ? t(`${tp}.continue`) : moduleType === "QUESTIONNAIRE" ? t(`${tp}.start_questionnaire`) : t(`${tp}.start_assessment`)}
          </Typography>
        </Box>
      )}

    </Box>
  ), [isEmployee, pStatus, ps, isExpired, campaign.status, supportsAction, canStart, handleAssessmentAction, moduleType, t, tp, participantStatusLabel, empBadgeSx, empDotSx, empTextSx, ctaBtnSx, ctaTextSx, translationLang]);

  return (
    <Box sx={PAGE_SX}>
      <CampaignHeader
        campaign={campaign}
        onChangeStatus={canPublish ? onChangeStatus : undefined}
        onDeleteClick={canDelete && !isEmployee ? openDelete : undefined}
        onEditClick={canEdit && !isEmployee ? openEdit : undefined}
        backLabel={isEmployee ? t(`${tp}.back_employee`) : t(`${tp}.back_company`)}
        backUrl={isEmployee ? "/employee/campaigns" : "/company/campaigns"}
        actionsNode={employeeActionsNode}
      />

      {/* Setup checklist banner */}
      {showSetupBanner && (
        <Box sx={SETUP_BANNER_SX}>
          <Box sx={SETUP_BG_SX} />
          <Box sx={SETUP_TITLE_ROW_SX}>
            <Box sx={SETUP_ICON_BOX_SX}>
              <VisibilityOffOutlined sx={{ fontSize: 16, color: "#D97706" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: "#111827" }}>{t(`${tp}.setup_banner.title`)}</Typography>
              <Typography sx={{ fontSize: "11.5px", color: "#9CA3AF", mt: 0.1 }}>{t(`${tp}.setup_banner.subtitle`)}</Typography>
            </Box>
          </Box>
          <Box sx={SETUP_STEPS_SX}>
            {/* Step 1 */}
            <Box sx={{ flex: 1, borderRadius: "14px", p: 2, border: `1.5px solid ${moduleConfigured ? "#86EFAC" : "#FDE68A"}`, bgcolor: moduleConfigured ? "#F0FDF4" : "#FFFBEB", display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 28, height: 28, borderRadius: "8px", flexShrink: 0, bgcolor: moduleConfigured ? "#DCFCE7" : "#FEF3C7", border: `1px solid ${moduleConfigured ? "#86EFAC" : "#FDE68A"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {moduleConfigured ? <CheckCircleOutlined sx={{ fontSize: 15, color: "#16A34A" }} /> : <TuneOutlined sx={{ fontSize: 15, color: "#D97706" }} />}
                  </Box>
                  <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: moduleConfigured ? "#15803D" : "#92400E" }}>{t(`${tp}.setup_step1_title`)}</Typography>
                </Box>
                {moduleConfigured
                  ? <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, px: 0.875, py: "2px", borderRadius: "999px", bgcolor: "#DCFCE7" }}><CheckCircleOutlined sx={{ fontSize: 11, color: "#16A34A" }} /><Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#16A34A" }}>{t(`${tp}.setup_step_done`)}</Typography></Box>
                  : <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, px: 0.875, py: "2px", borderRadius: "999px", bgcolor: "#FEF3C7" }}><RadioButtonUncheckedOutlined sx={{ fontSize: 11, color: "#D97706" }} /><Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#D97706" }}>{t(`${tp}.setup_step_pending`)}</Typography></Box>
                }
              </Box>
              <Typography sx={{ fontSize: "11.5px", color: moduleConfigured ? "#166534" : "#78350F", lineHeight: 1.5 }}>
                {moduleConfigured ? t(`${tp}.setup_step1_desc_done`) : t(`${tp}.setup_step1_desc_pending`)}
              </Typography>
              {!moduleConfigured && campaign.module?.type && canEdit && (
                <Box onClick={() => openConfigureModule(campaign.module!.type)} sx={SETUP_CONFIGURE_BTN_SX}>
                  <TuneOutlined sx={{ fontSize: 13, color: "#D97706" }} />
                  <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#D97706" }}>{t(`${tp}.setup_configure_now`)}</Typography>
                </Box>
              )}
            </Box>

            <Box sx={SETUP_ARROW_SX}>→</Box>

            {/* Step 2 */}
            <Box sx={{ flex: 1, borderRadius: "14px", p: 2, border: `1.5px solid ${moduleConfigured ? "#BFDBFE" : "#E5E7EB"}`, bgcolor: moduleConfigured ? "#EFF6FF" : "#F9FAFB", opacity: moduleConfigured ? 1 : 0.6, display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 28, height: 28, borderRadius: "8px", flexShrink: 0, bgcolor: moduleConfigured ? "#DBEAFE" : "#F3F4F6", border: `1px solid ${moduleConfigured ? "#BFDBFE" : "#E5E7EB"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <RocketLaunchOutlined sx={{ fontSize: 15, color: moduleConfigured ? "#2563EB" : "#9CA3AF" }} />
                  </Box>
                  <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: moduleConfigured ? "#1E40AF" : "#6B7280" }}>{t(`${tp}.setup_step2_title`)}</Typography>
                </Box>
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, px: 0.875, py: "2px", borderRadius: "999px", bgcolor: moduleConfigured ? "#DBEAFE" : "#F3F4F6" }}>
                  <RadioButtonUncheckedOutlined sx={{ fontSize: 11, color: moduleConfigured ? "#2563EB" : "#9CA3AF" }} />
                  <Typography sx={{ fontSize: "10px", fontWeight: 700, color: moduleConfigured ? "#2563EB" : "#9CA3AF" }}>{t(`${tp}.setup_step_pending`)}</Typography>
                </Box>
              </Box>
              <Typography sx={{ fontSize: "11.5px", color: moduleConfigured ? "#1E40AF" : "#9CA3AF", lineHeight: 1.5 }}>
                {moduleConfigured ? t(`${tp}.setup_step2_desc_ready`) : t(`${tp}.setup_step2_desc_wait`)}
              </Typography>
              {moduleConfigured && canPublish && (
                <Box onClick={openPending} sx={SETUP_ACTIVATE_BTN_SX}>
                  <RocketLaunchOutlined sx={{ fontSize: 13, color: "#fff" }} />
                  <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>{t(`${tp}.setup_activate_now`)}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Stats row */}
      <Box sx={STATS_GRID_SX}>
        {STATS.map(({ icon: Icon, color, bg, label, value }) => (
          <Box key={label} sx={STAT_CARD_SX}>
            <Box sx={{ ...STAT_ICON_SX_BASE, bgcolor: bg, border: `1px solid ${color}20` }}>
              {Icon && <Icon sx={{ fontSize: 18, color }} />}
            </Box>
            <Box>
              <Typography sx={STAT_LABEL_SX}>{label}</Typography>
              <Typography sx={STAT_VALUE_SX}>{value}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Tab container */}
      <Box sx={TAB_SHELL_SX}>
        <Box sx={TAB_BAR_SX}>
          <Box sx={TAB_STRIP_SX}>
            {TABS.map(({ key, label, icon, count, color }) => (
              <TabPill key={key} tabKey={key} label={label} icon={icon} count={count} color={color} active={tab === key} onClick={handleTabChange} />
            ))}
          </Box>
        </Box>

        <Box sx={TAB_CONTENT_SX}>
          {tab === "overview" && (
            <Box sx={OV_GRID_SX}>
              <Box sx={OV_LEFT_SX}>
                <CampaignDetailsCard campaign={campaign} />
                <CampaignModuleCard
                  module={campaign.module}
                  onConfigureModule={(canEdit && !isEmployee && campaign.status !== "ACTIVE") ? openConfigureModule : undefined}
                  showConfigure={canEdit && !isEmployee && campaign.status !== "ACTIVE"}
                  isEmployee={isEmployee}
                />
              </Box>
              <CampaignSidebar campaign={campaign} showLastUpdated={!isEmployee} />
            </Box>
          )}
          {tab === "participants" && (
            <CampaignParticipantsTab campaignId={campaign._id} mode={mode} anonymityMode={campaign.anonymityMode} />
          )}
          {tab === "sessions" && (
            <CampaignSessionsTab campaignId={campaign._id} anonymityMode={campaign.anonymityMode} />
          )}
        </Box>
      </Box>

      {/* Dialogs (company only) */}
      {!isEmployee && (
        <>
          <EditCampaignModal open={editOpen} campaign={campaign} onClose={closeEdit} onSaved={closeEdit} />
          <DeleteCampaignDialog
            open={deleteOpen}
            campaignTitle={campaign.title}
            participantCount={campaign.participantCount}
            loading={deleteLoading}
            onClose={closeDelete}
            onConfirm={handleDeleteConfirm}
          />
          <ConfigureModuleModal
            open={configureModuleType !== null}
            campaignId={campaign._id}
            moduleType={configureModuleType}
            currentConfig={currentModuleConfig}
            onClose={closeConfig}
            onSave={handleSaveConfig}
          />
          <ConfirmStatusChangeDialog
            open={pendingActivate}
            campaignTitle={campaign.title}
            currentStatus={campaign.status}
            targetStatus="ACTIVE"
            onClose={closePending}
            onConfirm={handleActivateConfirm}
          />
        </>
      )}
    </Box>
  );
});

CampaignDetail.displayName = "CampaignDetail";
export default CampaignDetail;
