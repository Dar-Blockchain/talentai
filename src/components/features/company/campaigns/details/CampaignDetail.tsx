import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { Campaign, CampaignModule, CampaignStatus, ModuleType, ParticipantStatus } from "@/types/campaign";
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
import { useSelector } from "react-redux";
import {
  selectCampaignParticipantsTotal,
  selectCampaignSessionsTotal,
  selectCampaignDeleteLoading,
} from "@/store/slices/campaignSlice";
import PeopleAltOutlined       from "@mui/icons-material/PeopleAltOutlined";
import AssignmentOutlined      from "@mui/icons-material/AssignmentOutlined";
import AccessTimeOutlined      from "@mui/icons-material/AccessTimeOutlined";
import DashboardOutlined       from "@mui/icons-material/DashboardOutlined";
import EmojiEventsOutlined     from "@mui/icons-material/EmojiEventsOutlined";
import PlayArrowOutlined       from "@mui/icons-material/PlayArrow";
import ArrowForwardOutlined    from "@mui/icons-material/ArrowForwardOutlined";
import VisibilityOutlined      from "@mui/icons-material/VisibilityOutlined";
import CheckCircleOutlined     from "@mui/icons-material/CheckCircleOutlined";
import RadioButtonUncheckedOutlined from "@mui/icons-material/RadioButtonUnchecked";
import TuneOutlined            from "@mui/icons-material/TuneOutlined";
import RocketLaunchOutlined    from "@mui/icons-material/RocketLaunchOutlined";
import VisibilityOffOutlined   from "@mui/icons-material/VisibilityOffOutlined";
import { MODULE_CONFIG } from "@/constants/campaign";
import { daysLeft } from "@/utils/functions";

const PURPLE = "#8310FF";
const CARD = { bgcolor: "#fff", border: "1px solid #EDEEF0", borderRadius: "18px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" } as const;

const PS_CONFIG: Record<ParticipantStatus, { label: string; color: string; bg: string }> = {
  INVITED:     { label: "Invited",     color: "#0891B2", bg: "#ECFDF5" },
  IN_PROGRESS: { label: "In Progress", color: "#D97706", bg: "#FFFBEB" },
  COMPLETED:   { label: "Completed",   color: "#16A34A", bg: "#F0FDF4" },
  DROPPED:     { label: "Dropped",     color: "#EF4444", bg: "#FEF2F2" },
};

type TabKey = "overview" | "participants" | "sessions";

interface Props {
  campaign: Campaign;
  mode?: "company" | "employee";
  onDelete?: (id: string, title: string) => void;
  onChangeStatus?: (id: string, status: CampaignStatus) => void;
  onSaveModuleConfig?: (
    campaignId: string,
    moduleType: ModuleType,
    config: NonNullable<CampaignModule["config"]>,
  ) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canPublish?: boolean;
}

const CampaignDetail: React.FC<Props> = ({
  campaign,
  mode = "company",
  onDelete,
  onChangeStatus,
  onSaveModuleConfig,
  canEdit = true,
  canDelete = true,
  canPublish = true,
}) => {
  const router = useRouter();
  const isEmployee = mode === "employee";

  const [tab,                 setTab]                 = useState<TabKey>("overview");
  const [deleteOpen,          setDeleteOpen]          = useState(false);
  const [editOpen,            setEditOpen]            = useState(false);
  const [configureModuleType, setConfigureModuleType] = useState<ModuleType | null>(null);
  const [pendingActivate,     setPendingActivate]     = useState(false);

  const participantsTotal = useSelector(selectCampaignParticipantsTotal);
  const sessionsTotal     = useSelector(selectCampaignSessionsTotal);
  const deleteLoading     = useSelector(selectCampaignDeleteLoading);

  const currentModuleConfig = configureModuleType ? (campaign.module?.config ?? null) : null;

  const handleSaveConfig = (
    campaignId: string,
    moduleType: ModuleType,
    config: NonNullable<CampaignModule["config"]>,
  ) => {
    onSaveModuleConfig?.(campaignId, moduleType, config);
    setConfigureModuleType(null);
  };

  const modCfg    = MODULE_CONFIG[campaign.module?.type];
  const ModIcon   = modCfg?.icon;
  const remaining = daysLeft(campaign.deadline);
  const isExpired = campaign.deadline
    ? new Date(campaign.deadline).getTime() < Date.now()
    : false;

  // Employee-mode: participant status + CTA
  const pStatus   = campaign.participantStatus ?? "INVITED";
  const ps        = PS_CONFIG[pStatus];
  const typeColor = "#8310FF";
  const campaignAccessible = campaign.status === "ACTIVE";
  const canStart  = (pStatus === "INVITED" || pStatus === "IN_PROGRESS") && !isExpired && campaignAccessible;
  const moduleType = campaign.module?.type;
  const supportsAction = moduleType === "AI_INTERVIEW" || moduleType === "SKILL_TEST" || moduleType === "QUESTIONNAIRE";
  const supportsResults = moduleType === "AI_INTERVIEW" || moduleType === "SKILL_TEST" || moduleType === "QUESTIONNAIRE";

  const handleAssessmentAction = () => {
    window.open(`/employee/campaigns/${campaign._id}/assessment`, "_blank", "noopener,noreferrer");
  };

  const handleViewResults = () => {
    router.push(`/employee/campaigns/${campaign._id}/results`);
  };

  // Header actions slot (employee mode)
  const employeeActionsNode = isEmployee ? (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.875 }}>
      <Box sx={{
        display: "inline-flex", alignItems: "center", gap: 0.5,
        px: 1.125, py: "4px", borderRadius: "999px", bgcolor: ps.bg,
      }}>
        <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: ps.color }} />
        <Typography sx={{ fontSize: "11px", fontWeight: 700, color: ps.color }}>{ps.label}</Typography>
      </Box>

      {isExpired && pStatus !== "COMPLETED" && (
        <Box sx={{
          display: "inline-flex", alignItems: "center", gap: 0.5,
          px: 1.125, py: "4px", borderRadius: "999px",
          bgcolor: "#FEF2F2", border: "1px solid #FECACA",
        }}>
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#EF4444" }} />
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#EF4444" }}>Deadline passed</Typography>
        </Box>
      )}

      {campaign.status === "PAUSED" && (
        <Box sx={{
          display: "inline-flex", alignItems: "center", gap: 0.5,
          px: 1.125, py: "4px", borderRadius: "999px",
          bgcolor: "#FFFBEB", border: "1px solid #FDE68A",
        }}>
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#D97706" }} />
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#D97706" }}>Campaign paused</Typography>
        </Box>
      )}

      {campaign.status === "CLOSED" && (
        <Box sx={{
          display: "inline-flex", alignItems: "center", gap: 0.5,
          px: 1.125, py: "4px", borderRadius: "999px",
          bgcolor: "#EFF6FF", border: "1px solid #BFDBFE",
        }}>
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#2563EB" }} />
          <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#2563EB" }}>Campaign closed</Typography>
        </Box>
      )}

      {supportsAction && canStart && (
        <Box onClick={handleAssessmentAction} sx={{
          display: "flex", alignItems: "center", gap: 0.625,
          px: 1.625, py: 0.75, borderRadius: "10px", cursor: "pointer",
          bgcolor: pStatus === "IN_PROGRESS" ? "#FFFBEB" : `${typeColor}10`,
          border: `1px solid ${pStatus === "IN_PROGRESS" ? "#FDE68A" : `${typeColor}30`}`,
          transition: "all 0.15s", "&:hover": { opacity: 0.85 },
        }}>
          {pStatus === "IN_PROGRESS"
            ? <ArrowForwardOutlined sx={{ fontSize: 14, color: "#D97706" }} />
            : <PlayArrowOutlined    sx={{ fontSize: 14, color: typeColor }} />}
          <Typography sx={{ fontSize: "0.775rem", fontWeight: 700, color: pStatus === "IN_PROGRESS" ? "#D97706" : typeColor }}>
            {pStatus === "IN_PROGRESS"
              ? "Continue"
              : moduleType === "QUESTIONNAIRE"
              ? "Start Questionnaire"
              : "Start Assessment"}
          </Typography>
        </Box>
      )}

      {supportsResults && pStatus === "COMPLETED" && (
        <Box onClick={handleViewResults} sx={{
          display: "flex", alignItems: "center", gap: 0.625,
          px: 1.625, py: 0.75, borderRadius: "10px", cursor: "pointer",
          background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
          boxShadow: "0 3px 10px rgba(139,92,246,0.35)",
          transition: "all 0.15s",
          "&:hover": { boxShadow: "0 5px 16px rgba(139,92,246,0.45)", transform: "translateY(-1px)" },
        }}>
          <VisibilityOutlined sx={{ fontSize: 14, color: "#fff" }} />
          <Typography sx={{ fontSize: "0.775rem", fontWeight: 700, color: "#fff" }}>View Results</Typography>
        </Box>
      )}
    </Box>
  ) : undefined;

  const score = campaign.score ?? null;
  const scoreCol = score === null ? "#6B7280" : score >= 80 ? "#16A34A" : score >= 60 ? "#0D9488" : score >= 40 ? "#D97706" : "#EF4444";

  const STATS = isEmployee
    ? [
        {
          icon: PeopleAltOutlined,
          color: PURPLE,
          bg: `${PURPLE}08`,
          label: "Participants",
          value: campaign.participantCount !== undefined
            ? String(campaign.participantCount)
            : participantsTotal > 0 ? String(participantsTotal) : "—",
        },
        {
          icon: ModIcon,
          color: modCfg?.color ?? "#6B7280",
          bg: `${modCfg?.color ?? "#6B7280"}08`,
          label: "Module",
          value: modCfg?.label ?? campaign.module?.type ?? "—",
        },
        pStatus === "COMPLETED" && score !== null
          ? {
              icon: EmojiEventsOutlined,
              color: scoreCol,
              bg: `${scoreCol}12`,
              label: "My Score",
              value: `${score} / 100`,
            }
          : {
              icon: EmojiEventsOutlined,
              color: ps.color,
              bg: ps.bg,
              label: "My Status",
              value: ps.label,
            },
        {
          icon: AccessTimeOutlined,
          color: remaining === null ? "#6B7280" : remaining === 0 ? "#DC2626" : remaining <= 7 ? "#D97706" : "#16A34A",
          bg:   remaining === null ? "#F3F4F6"  : remaining === 0 ? "#FEF2F2" : remaining <= 7 ? "#FFFBEB" : "#F0FDF4",
          label: "Deadline",
          value: remaining === null ? "No deadline" : remaining === 0 ? "Expired" : `${remaining}d left`,
        },
      ]
    : [
        {
          icon: PeopleAltOutlined,
          color: PURPLE,
          bg: `${PURPLE}08`,
          label: "Participants",
          value: campaign.participantCount !== undefined
            ? String(campaign.participantCount)
            : participantsTotal > 0 ? String(participantsTotal) : "—",
        },
        {
          icon: ModIcon,
          color: modCfg?.color ?? "#6B7280",
          bg: `${modCfg?.color ?? "#6B7280"}08`,
          label: "Module",
          value: modCfg?.label ?? campaign.module?.type ?? "—",
        },
        {
          icon: AssignmentOutlined,
          color: "#0891B2",
          bg: "#E0F2FE",
          label: "Sessions",
          value: campaign.sessionCount !== undefined
            ? String(campaign.sessionCount)
            : sessionsTotal > 0 ? String(sessionsTotal) : "—",
        },
        {
          icon: AccessTimeOutlined,
          color: remaining === null ? "#6B7280" : remaining === 0 ? "#DC2626" : remaining <= 7 ? "#D97706" : "#16A34A",
          bg:   remaining === null ? "#F3F4F6"  : remaining === 0 ? "#FEF2F2" : remaining <= 7 ? "#FFFBEB" : "#F0FDF4",
          label: "Deadline",
          value: remaining === null ? "No deadline" : remaining === 0 ? "Expired" : `${remaining}d left`,
        },
      ] as const;

  const isLinkBased = campaign.accessMethod === "LINK";
  const moduleConfigured = campaign.module?.config != null;
  const showSetupBanner = !isEmployee && campaign.status === "DRAFT";

  const TABS: { key: TabKey; label: string; icon: React.ReactNode; count?: number | string; color: string }[] = [
    { key: "overview",     label: "Overview",     icon: <DashboardOutlined  sx={{ fontSize: 16 }} />, color: PURPLE,    count: undefined },
    ...(!isLinkBased ? [{ key: "participants" as TabKey, label: "Participants", icon: <PeopleAltOutlined sx={{ fontSize: 16 }} />, color: PURPLE, count: participantsTotal || undefined }] : []),
    ...(!isEmployee ? [{ key: "sessions" as TabKey, label: "Sessions", icon: <AssignmentOutlined sx={{ fontSize: 16 }} />, color: "#0891B2", count: sessionsTotal || undefined }] : []),
  ];

  /* ── Tab pill (same design as EmployeesList) ── */
  const TabPill = ({ tabKey, label, icon, count, color }: {
    tabKey: TabKey; label: string; icon: React.ReactNode; count?: number | string; color: string;
  }) => (
    <Box onClick={() => setTab(tabKey)} sx={{
      display: "flex", alignItems: "center", gap: 1,
      px: 2, py: 0.875, borderRadius: "9px", cursor: "pointer",
      transition: "all 0.18s ease",
      bgcolor: tab === tabKey ? "#fff" : "transparent",
      boxShadow: tab === tabKey ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
      "&:hover": tab !== tabKey ? { bgcolor: "#EAECF0" } : {},
    }}>
      <Box sx={{ color: tab === tabKey ? color : "#6B7280", display: "flex", fontSize: 16 }}>{icon}</Box>
      <Typography sx={{ fontSize: "13px", fontWeight: 700, color: tab === tabKey ? "#111827" : "#6B7280", whiteSpace: "nowrap" }}>
        {label}
      </Typography>
      {count !== undefined && (
        <Box sx={{
          minWidth: 20, height: 20, borderRadius: "6px", px: 0.75,
          display: "flex", alignItems: "center", justifyContent: "center",
          bgcolor: tab === tabKey ? `${color}18` : "#E5E7EB",
        }}>
          <Typography sx={{ fontSize: "11px", fontWeight: 800, color: tab === tabKey ? color : "#9CA3AF" }}>
            {count}
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Header */}
      <CampaignHeader
        campaign={campaign}
        onChangeStatus={canPublish ? onChangeStatus : undefined}
        onDeleteClick={canDelete && !isEmployee ? () => setDeleteOpen(true) : undefined}
        onEditClick={canEdit && !isEmployee ? () => setEditOpen(true) : undefined}
        backLabel={isEmployee ? "My Campaigns" : "Campaigns"}
        backUrl={isEmployee ? "/employee/campaigns" : "/company/campaigns"}
        actionsNode={employeeActionsNode}
      />

      {/* ── Setup checklist banner (DRAFT only) ── */}
      {showSetupBanner && (
        <Box sx={{
          bgcolor: "#fff",
          border: "1px solid #E2E8F0",
          borderRadius: "18px",
          p: 2.5,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          overflow: "hidden",
          position: "relative",
        }}>
          {/* Background gradient hint */}
          <Box sx={{
            position: "absolute", inset: 0, opacity: 0.035,
            background: "linear-gradient(135deg, #F59E0B 0%, #8310FF 100%)",
            pointerEvents: "none",
          }} />

          {/* Title row */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 2 }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: "9px",
              bgcolor: "#FFFBEB", border: "1px solid #FDE68A",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <VisibilityOffOutlined sx={{ fontSize: 16, color: "#D97706" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "13.5px", fontWeight: 700, color: "#111827" }}>
                Campaign not visible to participants yet
              </Typography>
              <Typography sx={{ fontSize: "11.5px", color: "#9CA3AF", mt: 0.1 }}>
                Complete the steps below to launch it.
              </Typography>
            </Box>
          </Box>

          {/* Steps */}
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5 }}>

            {/* Step 1 — Configure module */}
            <Box sx={{
              flex: 1, borderRadius: "14px", p: 2,
              border: `1.5px solid ${moduleConfigured ? "#86EFAC" : "#FDE68A"}`,
              bgcolor: moduleConfigured ? "#F0FDF4" : "#FFFBEB",
              display: "flex", flexDirection: "column", gap: 1,
            }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{
                    width: 28, height: 28, borderRadius: "8px", flexShrink: 0,
                    bgcolor: moduleConfigured ? "#DCFCE7" : "#FEF3C7",
                    border: `1px solid ${moduleConfigured ? "#86EFAC" : "#FDE68A"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {moduleConfigured
                      ? <CheckCircleOutlined sx={{ fontSize: 15, color: "#16A34A" }} />
                      : <TuneOutlined sx={{ fontSize: 15, color: "#D97706" }} />}
                  </Box>
                  <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: moduleConfigured ? "#15803D" : "#92400E" }}>
                    Step 1 — Configure Module
                  </Typography>
                </Box>
                {moduleConfigured
                  ? <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, px: 0.875, py: "2px", borderRadius: "999px", bgcolor: "#DCFCE7" }}>
                      <CheckCircleOutlined sx={{ fontSize: 11, color: "#16A34A" }} />
                      <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#16A34A" }}>Done</Typography>
                    </Box>
                  : <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, px: 0.875, py: "2px", borderRadius: "999px", bgcolor: "#FEF3C7" }}>
                      <RadioButtonUncheckedOutlined sx={{ fontSize: 11, color: "#D97706" }} />
                      <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#D97706" }}>Pending</Typography>
                    </Box>
                }
              </Box>
              <Typography sx={{ fontSize: "11.5px", color: moduleConfigured ? "#166534" : "#78350F", lineHeight: 1.5 }}>
                {moduleConfigured
                  ? `Module is configured and ready.`
                  : `Set up the assessment module so participants know what to expect.`}
              </Typography>
              {!moduleConfigured && campaign.module?.type && canEdit && (
                <Box
                  onClick={() => setConfigureModuleType(campaign.module!.type)}
                  sx={{
                    mt: 0.25, alignSelf: "flex-start",
                    display: "flex", alignItems: "center", gap: 0.5,
                    px: 1.25, py: 0.625, borderRadius: "8px", cursor: "pointer",
                    bgcolor: "#FEF3C7", border: "1px solid #FDE68A",
                    transition: "all 0.15s", "&:hover": { bgcolor: "#FDE68A" },
                  }}
                >
                  <TuneOutlined sx={{ fontSize: 13, color: "#D97706" }} />
                  <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#D97706" }}>Configure now</Typography>
                </Box>
              )}
            </Box>

            {/* Arrow */}
            <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", color: "#D1D5DB", fontSize: 22, fontWeight: 300 }}>
              →
            </Box>

            {/* Step 2 — Activate */}
            <Box sx={{
              flex: 1, borderRadius: "14px", p: 2,
              border: `1.5px solid ${moduleConfigured ? "#BFDBFE" : "#E5E7EB"}`,
              bgcolor: moduleConfigured ? "#EFF6FF" : "#F9FAFB",
              opacity: moduleConfigured ? 1 : 0.6,
              display: "flex", flexDirection: "column", gap: 1,
            }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{
                    width: 28, height: 28, borderRadius: "8px", flexShrink: 0,
                    bgcolor: moduleConfigured ? "#DBEAFE" : "#F3F4F6",
                    border: `1px solid ${moduleConfigured ? "#BFDBFE" : "#E5E7EB"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <RocketLaunchOutlined sx={{ fontSize: 15, color: moduleConfigured ? "#2563EB" : "#9CA3AF" }} />
                  </Box>
                  <Typography sx={{ fontSize: "12.5px", fontWeight: 700, color: moduleConfigured ? "#1E40AF" : "#6B7280" }}>
                    Step 2 — Activate Campaign
                  </Typography>
                </Box>
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, px: 0.875, py: "2px", borderRadius: "999px", bgcolor: moduleConfigured ? "#DBEAFE" : "#F3F4F6" }}>
                  <RadioButtonUncheckedOutlined sx={{ fontSize: 11, color: moduleConfigured ? "#2563EB" : "#9CA3AF" }} />
                  <Typography sx={{ fontSize: "10px", fontWeight: 700, color: moduleConfigured ? "#2563EB" : "#9CA3AF" }}>Pending</Typography>
                </Box>
              </Box>
              <Typography sx={{ fontSize: "11.5px", color: moduleConfigured ? "#1E40AF" : "#9CA3AF", lineHeight: 1.5 }}>
                {moduleConfigured
                  ? `Ready to go! Activate the campaign to make it visible to participants.`
                  : `Complete step 1 first, then activate the campaign.`}
              </Typography>
              {moduleConfigured && canPublish && (
                <Box
                  onClick={() => setPendingActivate(true)}
                  sx={{
                    mt: 0.25, alignSelf: "flex-start",
                    display: "flex", alignItems: "center", gap: 0.5,
                    px: 1.25, py: 0.625, borderRadius: "8px", cursor: "pointer",
                    bgcolor: "#2563EB", border: "1px solid #1D4ED8",
                    transition: "all 0.15s", "&:hover": { bgcolor: "#1D4ED8" },
                  }}
                >
                  <RocketLaunchOutlined sx={{ fontSize: 13, color: "#fff" }} />
                  <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>Activate now</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Stats row */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 1.5 }}>
        {STATS.map(({ icon: Icon, color, bg, label, value }) => (
          <Box key={label} sx={{ ...CARD, p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{
              width: 38, height: 38, borderRadius: "10px",
              bgcolor: bg, border: `1px solid ${color}20`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {Icon && <Icon sx={{ fontSize: 18, color }} />}
            </Box>
            <Box>
              <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {label}
              </Typography>
              <Typography sx={{ fontSize: "15px", fontWeight: 800, color: "#111827", lineHeight: 1.2, mt: 0.25 }}>
                {value}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Tab container */}
      <Box sx={{ ...CARD, p: 0, overflow: "hidden" }}>
        {/* Tab bar — pill-in-pill style */}
        <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 1.25, borderBottom: "1px solid #F3F4F6" }}>
          <Box sx={{ display: "inline-flex", alignItems: "center", bgcolor: "#F3F4F6", borderRadius: "12px", p: 0.5, gap: 0.5 }}>
            {TABS.map(({ key, label, icon, count, color }) => (
              <TabPill key={key} tabKey={key} label={label} icon={icon} count={count} color={color} />
            ))}
          </Box>
        </Box>

        {/* Tab content */}
        <Box sx={{ p: 2.5 }}>
          {tab === "overview" && (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 280px" }, gap: 1.5, alignItems: "start" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <CampaignDetailsCard campaign={campaign} />
                <CampaignModuleCard
                  module={campaign.module}
                  onConfigureModule={(canEdit && !isEmployee && campaign.status !== "ACTIVE") ? setConfigureModuleType : undefined}
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
          <EditCampaignModal
            open={editOpen}
            campaign={campaign}
            onClose={() => setEditOpen(false)}
            onSaved={() => setEditOpen(false)}
          />
          <DeleteCampaignDialog
            open={deleteOpen}
            campaignTitle={campaign.title}
            participantCount={campaign.participantCount}
            loading={deleteLoading}
            onClose={() => setDeleteOpen(false)}
            onConfirm={() => onDelete?.(campaign._id, campaign.title)}
          />
          <ConfigureModuleModal
            open={configureModuleType !== null}
            campaignId={campaign._id}
            moduleType={configureModuleType}
            currentConfig={currentModuleConfig}
            onClose={() => setConfigureModuleType(null)}
            onSave={handleSaveConfig}
          />
          <ConfirmStatusChangeDialog
            open={pendingActivate}
            campaignTitle={campaign.title}
            currentStatus={campaign.status}
            targetStatus="ACTIVE"
            onClose={() => setPendingActivate(false)}
            onConfirm={() => { onChangeStatus?.(campaign._id, "ACTIVE"); setPendingActivate(false); }}
          />
        </>
      )}
    </Box>
  );
};

export default CampaignDetail;
