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
import ConfigureModuleModal from "./configure/ConfigureModuleModal";
import EditCampaignModal from "./EditCampaignModal";
import { useSelector } from "react-redux";
import {
  selectCampaignParticipantsTotal,
  selectCampaignSessionsTotal,
} from "@/store/slices/campaignSlice";
import PeopleAltOutlined    from "@mui/icons-material/PeopleAltOutlined";
import AssignmentOutlined   from "@mui/icons-material/AssignmentOutlined";
import AccessTimeOutlined   from "@mui/icons-material/AccessTimeOutlined";
import DashboardOutlined    from "@mui/icons-material/DashboardOutlined";
import EmojiEventsOutlined  from "@mui/icons-material/EmojiEventsOutlined";
import PlayArrowOutlined    from "@mui/icons-material/PlayArrow";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import VisibilityOutlined   from "@mui/icons-material/VisibilityOutlined";
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
}

const CampaignDetail: React.FC<Props> = ({
  campaign,
  mode = "company",
  onDelete,
  onChangeStatus,
  onSaveModuleConfig,
}) => {
  const router = useRouter();
  const isEmployee = mode === "employee";

  const [tab,                 setTab]                 = useState<TabKey>("overview");
  const [deleteOpen,          setDeleteOpen]          = useState(false);
  const [editOpen,            setEditOpen]            = useState(false);
  const [configureModuleType, setConfigureModuleType] = useState<ModuleType | null>(null);

  const participantsTotal = useSelector(selectCampaignParticipantsTotal);
  const sessionsTotal     = useSelector(selectCampaignSessionsTotal);

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

  // Employee-mode: participant status + CTA
  const pStatus   = campaign.participantStatus ?? "INVITED";
  const ps        = PS_CONFIG[pStatus];
  const typeEntry = (isEmployee ? require("@/constants/campaign").CAMPAIGN_TYPES.find((t: any) => t.value === campaign.type) : null);
  const typeColor = typeEntry?.color ?? "#6B7280";
  const canStart  = pStatus === "INVITED" || pStatus === "IN_PROGRESS";
  const moduleType = campaign.module?.type;
  const supportsAction = moduleType === "AI_INTERVIEW" || moduleType === "SKILL_TEST" || moduleType === "QUESTIONNAIRE";
  const supportsResults = moduleType === "AI_INTERVIEW" || moduleType === "SKILL_TEST" || moduleType === "QUESTIONNAIRE";

  const handleAssessmentAction = () => {
    router.push(`/employee/campaigns/${campaign._id}/assessment`);
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
          bgcolor: "#F0FDF4", border: "1px solid #BBF7D0",
          transition: "all 0.15s", "&:hover": { opacity: 0.85 },
        }}>
          <VisibilityOutlined sx={{ fontSize: 14, color: "#16A34A" }} />
          <Typography sx={{ fontSize: "0.775rem", fontWeight: 700, color: "#16A34A" }}>View Results</Typography>
        </Box>
      )}
    </Box>
  ) : undefined;

  const STATS = isEmployee
    ? [
        {
          icon: PeopleAltOutlined,
          color: PURPLE,
          bg: `${PURPLE}08`,
          label: "Participants",
          value: participantsTotal > 0
            ? String(participantsTotal)
            : campaign.targetEmployeeCount ? String(campaign.targetEmployeeCount) : "—",
        },
        {
          icon: ModIcon,
          color: modCfg?.color ?? "#6B7280",
          bg: `${modCfg?.color ?? "#6B7280"}08`,
          label: "Module",
          value: modCfg?.label ?? campaign.module?.type ?? "—",
        },
        {
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
      ] as const
    : [
        {
          icon: PeopleAltOutlined,
          color: PURPLE,
          bg: `${PURPLE}08`,
          label: "Participants",
          value: participantsTotal > 0
            ? String(participantsTotal)
            : campaign.targetEmployeeCount ? String(campaign.targetEmployeeCount) : "—",
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
          value: sessionsTotal > 0 ? String(sessionsTotal) : "—",
        },
        {
          icon: AccessTimeOutlined,
          color: remaining === null ? "#6B7280" : remaining === 0 ? "#DC2626" : remaining <= 7 ? "#D97706" : "#16A34A",
          bg:   remaining === null ? "#F3F4F6"  : remaining === 0 ? "#FEF2F2" : remaining <= 7 ? "#FFFBEB" : "#F0FDF4",
          label: "Deadline",
          value: remaining === null ? "No deadline" : remaining === 0 ? "Expired" : `${remaining}d left`,
        },
      ] as const;

  const TABS: { key: TabKey; label: string; icon: React.ReactNode; count?: number | string; color: string }[] = [
    { key: "overview",     label: "Overview",     icon: <DashboardOutlined  sx={{ fontSize: 16 }} />, color: PURPLE,    count: undefined },
    { key: "participants", label: "Participants", icon: <PeopleAltOutlined  sx={{ fontSize: 16 }} />, color: PURPLE,    count: participantsTotal || undefined },
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
        onChangeStatus={onChangeStatus}
        onDeleteClick={() => setDeleteOpen(true)}
        onEditClick={!isEmployee ? () => setEditOpen(true) : undefined}
        backLabel={isEmployee ? "My Campaigns" : "Campaigns"}
        backUrl={isEmployee ? "/employee/campaigns" : "/company/campaigns"}
        actionsNode={employeeActionsNode}
      />

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
                  onConfigureModule={!isEmployee ? setConfigureModuleType : undefined}
                  showConfigure={!isEmployee}
                />
              </Box>
              <CampaignSidebar campaign={campaign} showLastUpdated={!isEmployee} />
            </Box>
          )}

          {tab === "participants" && (
            <CampaignParticipantsTab campaignId={campaign._id} mode={mode} />
          )}

          {tab === "sessions" && (
            <CampaignSessionsTab campaignId={campaign._id} />
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
            onClose={() => setDeleteOpen(false)}
            onConfirm={() => {
              setDeleteOpen(false);
              onDelete?.(campaign._id, campaign.title);
            }}
          />
          <ConfigureModuleModal
            open={configureModuleType !== null}
            campaignId={campaign._id}
            moduleType={configureModuleType}
            currentConfig={currentModuleConfig}
            onClose={() => setConfigureModuleType(null)}
            onSave={handleSaveConfig}
          />
        </>
      )}
    </Box>
  );
};

export default CampaignDetail;
