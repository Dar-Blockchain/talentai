import React, { memo, useCallback, useMemo, useState } from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import { useRouter } from "next/router";
import ArrowBackOutlined     from "@mui/icons-material/ArrowBackOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlined          from "@mui/icons-material/EditOutlined";
import PlayArrowOutlined     from "@mui/icons-material/PlayArrow";
import PauseOutlined         from "@mui/icons-material/PauseOutlined";
import StopOutlined          from "@mui/icons-material/StopOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import WarningAmberOutlined  from "@mui/icons-material/WarningAmberOutlined";
import CampaignOutlined      from "@mui/icons-material/CampaignOutlined";
import { Campaign, CampaignStatus } from "@/types/campaign";
import { STATUS_COLORS, STATUS_TRANSITIONS, CAMPAIGN_TYPES } from "@/constants/campaign";
import { daysLeft } from "@/utils/functions";
import ConfirmStatusChangeDialog from "./ConfirmStatusChangeDialog";
import { useTranslation } from "react-i18next";

// ─── Static constants ─────────────────────────────────────────────────────────

const STATUS_ICONS: Partial<Record<CampaignStatus, React.ElementType>> = {
  ACTIVE: PlayArrowOutlined,
  PAUSED: PauseOutlined,
  CLOSED: StopOutlined,
};

const NAV_ROW_SX   = { display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 } as const;
const BACK_SX      = { display: "inline-flex", alignItems: "center", gap: 0.75, cursor: "pointer", color: "#94A3B8", transition: "color 0.15s", "&:hover": { color: "#475569" } } as const;
const BACK_ICON_SX = { fontSize: 15 } as const;
const BACK_TEXT_SX = { fontSize: "0.8rem", fontWeight: 600, color: "inherit" } as const;
const ACTIONS_SX   = { display: "flex", alignItems: "center", gap: 0.875 } as const;
const IDENTITY_SX  = { display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" } as const;
const META_BOX_SX  = { flex: 1, minWidth: 0 } as const;
const TITLE_SX     = { fontWeight: 700, fontSize: "1.125rem", color: "#0F172A", lineHeight: 1.25 } as const;
const DESC_SX      = { fontSize: "0.8125rem", color: "#94A3B8", mt: 0.3, maxWidth: 520, lineHeight: 1.5 } as const;
const PILLS_SX     = { display: "flex", alignItems: "center", gap: 0.75, mt: 1.25, flexWrap: "wrap" } as const;
const MOD_PILL_SX  = { display: "inline-flex", alignItems: "center", gap: 0.5, px: 1.25, py: "4px", borderRadius: "999px", bgcolor: "#F1F5F9", border: "1px solid #E2E8F0" } as const;
const MOD_TEXT_SX  = { fontSize: "11.5px", fontWeight: 600, color: "#475569" } as const;
const WARN_BOX_SX  = { display: "inline-flex", alignItems: "center", gap: 0.4, px: 1, py: "3px", borderRadius: "999px", bgcolor: "#FFFBEB", border: "1px solid #FDE68A", cursor: "default" } as const;
const WARN_ICON_SX = { fontSize: 11, color: "#D97706" } as const;
const WARN_TEXT_SX = { fontSize: "11px", fontWeight: 700, color: "#D97706" } as const;
const DL_ROW_SX    = { display: "inline-flex", alignItems: "center", gap: 0.5 } as const;
const DL_ICON_SX   = { fontSize: 11, color: "#CBD5E1" } as const;
const DL_TEXT_SX   = { fontSize: "11.5px", color: "#94A3B8", fontWeight: 500 } as const;
const EDIT_BTN_SX  = { display: "flex", alignItems: "center", gap: 0.625, px: 1.625, py: 0.75, borderRadius: "10px", cursor: "pointer", border: "1px solid #E2E8F0", bgcolor: "#F8FAFC", transition: "all 0.15s", "&:hover": { bgcolor: "#EEF2FF", borderColor: "#C7D2FE", "& *": { color: "#6366F1" } } } as const;
const EDIT_DISABLED_SX = { display: "flex", alignItems: "center", gap: 0.625, px: 1.625, py: 0.75, borderRadius: "10px", cursor: "not-allowed", border: "1px solid #E2E8F0", bgcolor: "#F8FAFC", opacity: 0.45 } as const;
const DEL_BTN_SX   = { display: "flex", alignItems: "center", gap: 0.625, px: 1.625, py: 0.75, borderRadius: "10px", cursor: "pointer", border: "1px solid #FECACA", bgcolor: "#FEF7F7", transition: "all 0.15s", "&:hover": { bgcolor: "#FEE2E2", borderColor: "#FCA5A5" } } as const;
const EDIT_TEXT_SX = { fontSize: "0.775rem", fontWeight: 600, color: "#475569" } as const;
const DEL_TEXT_SX  = { fontSize: "0.775rem", fontWeight: 600, color: "#EF4444" } as const;

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  campaign: Campaign;
  onChangeStatus?: (id: string, status: CampaignStatus) => void;
  onDeleteClick?: () => void;
  onEditClick?: () => void;
  backLabel?: string;
  backUrl?: string;
  actionsNode?: React.ReactNode;
}

const CampaignHeader: React.FC<Props> = memo(({
  campaign, onChangeStatus, onDeleteClick, onEditClick,
  backUrl = "/company/campaigns", backLabel, actionsNode,
}) => {
  const router = useRouter();
  const { t } = useTranslation("dashboard");
  const tp = "pages.campaigns.detail";
  const [pendingStatus, setPendingStatus] = useState<CampaignStatus | null>(null);

  const resolvedBackLabel = backLabel ?? t(`${tp}.back_company`);

  const handleBack = useCallback(() => router.push(backUrl), [router, backUrl]);
  const closePending = useCallback(() => setPendingStatus(null), []);
  const handleStatusConfirm = useCallback(() => {
    if (pendingStatus) onChangeStatus?.(campaign._id, pendingStatus);
    setPendingStatus(null);
  }, [onChangeStatus, campaign._id, pendingStatus]);

  const sc             = useMemo(() => STATUS_COLORS[campaign.status] ?? STATUS_COLORS.DRAFT, [campaign.status]);
  const typeEntry      = useMemo(() => CAMPAIGN_TYPES.find((ct) => ct.value === campaign.type), [campaign.type]);
  const TypeIcon       = typeEntry?.icon;
  const typeColor      = typeEntry?.color ?? "#6B7280";
  const transitions    = useMemo(() => STATUS_TRANSITIONS[campaign.status] ?? [], [campaign.status]);
  const remaining      = useMemo(() => daysLeft(campaign.deadline), [campaign.deadline]);
  const moduleConfigured = campaign.module?.config != null;

  const modLabel = useMemo(() =>
    campaign.module?.type != null ? t(`pages.campaigns.module.${campaign.module.type}`) : campaign.module?.type,
  [campaign.module?.type, t]);

  const statusPillSx = useMemo(() => ({
    display: "inline-flex", alignItems: "center", gap: 0.5,
    px: 1.125, py: "3px", borderRadius: "999px", bgcolor: sc.bg,
  }), [sc.bg]);
  const statusDotSx = useMemo(() => ({ width: 6, height: 6, borderRadius: "50%", bgcolor: sc.fg }), [sc.fg]);
  const statusTextSx = useMemo(() => ({ fontSize: "11px", fontWeight: 700, color: sc.fg }), [sc.fg]);

  const heroBg = useMemo(() => ({
    bgcolor: "#fff", border: "1px solid #EDEEF0", borderRadius: "22px",
    overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
    background: `linear-gradient(135deg, ${typeColor}07 0%, transparent 50%)`,
  }), [typeColor]);

  const iconBoxSx = useMemo(() => ({
    width: 72, height: 72, borderRadius: "18px", flexShrink: 0,
    bgcolor: `${typeColor}10`, border: `1px solid ${typeColor}22`,
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: `0 4px 18px ${typeColor}20`,
  }), [typeColor]);

  return (
    <Box sx={heroBg}>
      <Box sx={{ px: { xs: 2.5, sm: 3.5 }, pt: 2.5, pb: 3 }}>

        {/* Nav row */}
        <Box sx={NAV_ROW_SX}>
          <Box onClick={handleBack} sx={BACK_SX}>
            <ArrowBackOutlined sx={BACK_ICON_SX} />
            <Typography sx={BACK_TEXT_SX}>{resolvedBackLabel}</Typography>
          </Box>

          {actionsNode ?? (
            <Box sx={ACTIONS_SX}>
              {onEditClick && (
                campaign.status === "DRAFT" ? (
                  <Box onClick={onEditClick} sx={EDIT_BTN_SX}>
                    <EditOutlined sx={{ fontSize: 14, color: "#64748B" }} />
                    <Typography sx={EDIT_TEXT_SX}>{t(`${tp}.edit`)}</Typography>
                  </Box>
                ) : (
                  <Tooltip title={t(`${tp}.edit_draft_only_tooltip`)} placement="top" arrow>
                    <Box sx={EDIT_DISABLED_SX}>
                      <EditOutlined sx={{ fontSize: 14, color: "#94A3B8" }} />
                      <Typography sx={{ fontSize: "0.775rem", fontWeight: 600, color: "#94A3B8" }}>{t(`${tp}.edit`)}</Typography>
                    </Box>
                  </Tooltip>
                )
              )}

              {onChangeStatus && transitions.map((s) => {
                const blocked = s === "ACTIVE" && !moduleConfigured;
                const sColor  = STATUS_COLORS[s];
                const Icon    = STATUS_ICONS[s];
                const label   = t(`${tp}.transition.${s}`);
                const btn = (
                  <Box
                    key={s}
                    onClick={() => !blocked && setPendingStatus(s)}
                    sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1.5, py: 0.75, borderRadius: "10px", cursor: blocked ? "not-allowed" : "pointer", border: `1px solid ${sColor?.fg ?? "#E2E8F0"}30`, bgcolor: `${sColor?.bg ?? "#F8FAFC"}`, opacity: blocked ? 0.5 : 1, transition: "all 0.15s", "&:hover": blocked ? {} : { bgcolor: `${sColor?.fg ?? "#6B7280"}12`, borderColor: `${sColor?.fg ?? "#6B7280"}50` } }}
                  >
                    {Icon && <Icon sx={{ fontSize: 14, color: sColor?.fg ?? "#6B7280" }} />}
                    <Typography sx={{ fontSize: "0.775rem", fontWeight: 700, color: sColor?.fg ?? "#475569" }}>{label}</Typography>
                  </Box>
                );
                return blocked ? (
                  <Tooltip key={s} title={t(`${tp}.activate_blocked_tooltip`)} placement="top" arrow><span>{btn}</span></Tooltip>
                ) : btn;
              })}

              {onDeleteClick && (
                <Box onClick={onDeleteClick} sx={DEL_BTN_SX}>
                  <DeleteOutlineOutlined sx={{ fontSize: 14, color: "#F87171" }} />
                  <Typography sx={DEL_TEXT_SX}>{t(`${tp}.delete`)}</Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Identity row */}
        <Box sx={IDENTITY_SX}>
          <Box sx={iconBoxSx}>
            {TypeIcon ? <TypeIcon sx={{ fontSize: 32, color: typeColor }} /> : <CampaignOutlined sx={{ fontSize: 32, color: typeColor }} />}
          </Box>
          <Box sx={META_BOX_SX}>
            <Typography sx={TITLE_SX}>{campaign.title}</Typography>
            {campaign.description && <Typography sx={DESC_SX}>{campaign.description}</Typography>}
            <Box sx={PILLS_SX}>
              <Box sx={statusPillSx}>
                <Box sx={statusDotSx} />
                <Typography sx={statusTextSx}>{t(`pages.campaigns.status.${campaign.status}`)}</Typography>
              </Box>
              {modLabel && (
                <Box sx={MOD_PILL_SX}>
                  <Typography sx={MOD_TEXT_SX}>{modLabel}</Typography>
                </Box>
              )}
              {campaign.status === "DRAFT" && !moduleConfigured && (
                <Tooltip title={t(`${tp}.module_not_configured_tooltip`)} placement="top" arrow>
                  <Box sx={WARN_BOX_SX}>
                    <WarningAmberOutlined sx={WARN_ICON_SX} />
                    <Typography sx={WARN_TEXT_SX}>{t(`${tp}.module_not_configured_badge`)}</Typography>
                  </Box>
                </Tooltip>
              )}
              {remaining !== null && (
                <Box sx={DL_ROW_SX}>
                  <CalendarTodayOutlined sx={DL_ICON_SX} />
                  <Typography sx={DL_TEXT_SX}>
                    {remaining === 0 ? t(`${tp}.deadline_passed`) : t(`${tp}.days_left_short`, { count: remaining })}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {pendingStatus && (
        <ConfirmStatusChangeDialog
          open
          campaignTitle={campaign.title}
          currentStatus={campaign.status}
          targetStatus={pendingStatus}
          onClose={closePending}
          onConfirm={handleStatusConfirm}
        />
      )}
    </Box>
  );
});

CampaignHeader.displayName = "CampaignHeader";
export default CampaignHeader;
