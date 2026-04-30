import React, { useState } from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import ArrowBackOutlined        from "@mui/icons-material/ArrowBackOutlined";
import DeleteOutlineOutlined    from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlined             from "@mui/icons-material/EditOutlined";
import PlayArrowOutlined        from "@mui/icons-material/PlayArrow";
import PauseOutlined            from "@mui/icons-material/PauseOutlined";
import StopOutlined             from "@mui/icons-material/StopOutlined";
import CalendarTodayOutlined    from "@mui/icons-material/CalendarTodayOutlined";
import WarningAmberOutlined     from "@mui/icons-material/WarningAmberOutlined";
import CampaignOutlined         from "@mui/icons-material/CampaignOutlined";
import { Campaign, CampaignStatus } from "@/types/campaign";
import {
  STATUS_COLORS,
  STATUS_TRANSITIONS,
  CAMPAIGN_TYPES,
} from "@/constants/campaign";
import { daysLeft } from "@/utils/functions";
import ConfirmStatusChangeDialog from "./ConfirmStatusChangeDialog";

const CD = "detail";
const CW = "create_wizard";

interface Props {
  campaign: Campaign;
  onChangeStatus?: (id: string, status: CampaignStatus) => void;
  onDeleteClick?: () => void;
  onEditClick?: () => void;
  backLabel?: string;
  backUrl?: string;
  actionsNode?: React.ReactNode;
}

const STATUS_ICONS: Partial<Record<CampaignStatus, React.ElementType>> = {
  ACTIVE: PlayArrowOutlined,
  PAUSED: PauseOutlined,
  CLOSED: StopOutlined,
};

const CampaignHeader: React.FC<Props> = ({
  campaign, onChangeStatus, onDeleteClick, onEditClick,
  backLabel = "Campaigns", backUrl = "/company/campaigns",
  actionsNode,
}) => {
  const router = useRouter();
  const [pendingStatus, setPendingStatus] = useState<CampaignStatus | null>(null);
  const { t } = useTranslation("campaign");

  const sc          = STATUS_COLORS[campaign.status]  ?? STATUS_COLORS.DRAFT;
  const typeEntry   = CAMPAIGN_TYPES.find((ty) => ty.value === campaign.type);
  const TypeIcon    = typeEntry?.icon;
  const typeColor   = typeEntry?.color ?? "#6B7280";
  const modType     = campaign.module?.type;
  const modLabel =
    modType != null
      ? t(`${CW}.modules.${modType}.label`)
      : undefined;
  const transitions    = STATUS_TRANSITIONS[campaign.status] ?? [];
  const remaining      = daysLeft(campaign.deadline);
  const moduleConfigured = campaign.module?.config != null;

  const transitionLabel = (target: CampaignStatus) => {
    if (target === "ACTIVE") return t(`${CD}.transition_btn_active`);
    if (target === "PAUSED") return t(`${CD}.transition_btn_pause`);
    return t(`${CD}.transition_btn_close`);
  };

  const statusLabel = t(`status.${campaign.status}`, { defaultValue: campaign.status });

  return (
    <Box sx={{
      bgcolor: "#fff",
      border: "1px solid #EDEEF0",
      borderRadius: "22px",
      overflow: "hidden",
      boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
      background: `linear-gradient(135deg, ${typeColor}07 0%, transparent 50%)`,
    }}>
      <Box sx={{ px: { xs: 2.5, sm: 3.5 }, pt: 2.5, pb: 3 }}>

        {/* ── Nav row: back + actions ── */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Box
            onClick={() => router.push(backUrl)}
            sx={{
              display: "inline-flex", alignItems: "center", gap: 0.75,
              cursor: "pointer", color: "#94A3B8",
              transition: "color 0.15s", "&:hover": { color: "#475569" },
            }}
          >
            <ArrowBackOutlined sx={{ fontSize: 15 }} />
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "inherit" }}>
              {backLabel}
            </Typography>
          </Box>

          {actionsNode ?? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.875 }}>
              {/* Edit button — DRAFT only, disabled otherwise */}
              {onEditClick && (
                campaign.status === "DRAFT" ? (
                  <Box
                    onClick={onEditClick}
                    sx={{
                      display: "flex", alignItems: "center", gap: 0.625,
                      px: 1.625, py: 0.75, borderRadius: "10px", cursor: "pointer",
                      border: "1px solid #E2E8F0", bgcolor: "#F8FAFC",
                      transition: "all 0.15s",
                      "&:hover": { bgcolor: "#EEF2FF", borderColor: "#C7D2FE", "& *": { color: "#6366F1" } },
                    }}
                  >
                    <EditOutlined sx={{ fontSize: 14, color: "#64748B" }} />
                    <Typography sx={{ fontSize: "0.775rem", fontWeight: 600, color: "#475569" }}>
                      {t(`${CD}.header_edit`)}
                    </Typography>
                  </Box>
                ) : (
                  <Tooltip title={t(`${CD}.header_edit_tooltip`)} placement="top" arrow>
                    <Box
                      sx={{
                        display: "flex", alignItems: "center", gap: 0.625,
                        px: 1.625, py: 0.75, borderRadius: "10px", cursor: "not-allowed",
                        border: "1px solid #E2E8F0", bgcolor: "#F8FAFC",
                        opacity: 0.45,
                      }}
                    >
                      <EditOutlined sx={{ fontSize: 14, color: "#94A3B8" }} />
                      <Typography sx={{ fontSize: "0.775rem", fontWeight: 600, color: "#94A3B8" }}>
                        {t(`${CD}.header_edit`)}
                      </Typography>
                    </Box>
                  </Tooltip>
                )
              )}

              {/* Inline status transition buttons — only if caller passed onChangeStatus */}
              {onChangeStatus && transitions.map((s) => {
                const blocked  = s === "ACTIVE" && !moduleConfigured;
                const sColor   = STATUS_COLORS[s];
                const Icon     = STATUS_ICONS[s];
                const label    = transitionLabel(s);

                const btn = (
                  <Box
                    key={s}
                    onClick={() => !blocked && setPendingStatus(s)}
                    sx={{
                      display: "flex", alignItems: "center", gap: 0.5,
                      px: 1.5, py: 0.75, borderRadius: "10px",
                      cursor: blocked ? "not-allowed" : "pointer",
                      border: `1px solid ${sColor?.fg ?? "#E2E8F0"}30`,
                      bgcolor: `${sColor?.bg ?? "#F8FAFC"}`,
                      opacity: blocked ? 0.5 : 1,
                      transition: "all 0.15s",
                      "&:hover": blocked ? {} : {
                        bgcolor: `${sColor?.fg ?? "#6B7280"}12`,
                        borderColor: `${sColor?.fg ?? "#6B7280"}50`,
                      },
                    }}
                  >
                    {Icon && <Icon sx={{ fontSize: 14, color: sColor?.fg ?? "#6B7280" }} />}
                    <Typography sx={{ fontSize: "0.775rem", fontWeight: 700, color: sColor?.fg ?? "#475569" }}>
                      {label}
                    </Typography>
                  </Box>
                );

                return blocked ? (
                  <Tooltip key={s} title={t(`${CD}.tooltip_activate_requires_module`)} placement="top" arrow>
                    <span>{btn}</span>
                  </Tooltip>
                ) : btn;
              })}

              {/* Delete — only if caller passed onDeleteClick */}
              {onDeleteClick && (
                <Box
                  onClick={onDeleteClick}
                  sx={{
                    display: "flex", alignItems: "center", gap: 0.625,
                    px: 1.625, py: 0.75, borderRadius: "10px", cursor: "pointer",
                    border: "1px solid #FECACA", bgcolor: "#FEF7F7",
                    transition: "all 0.15s",
                    "&:hover": { bgcolor: "#FEE2E2", borderColor: "#FCA5A5" },
                  }}
                >
                  <DeleteOutlineOutlined sx={{ fontSize: 14, color: "#F87171" }} />
                  <Typography sx={{ fontSize: "0.775rem", fontWeight: 600, color: "#EF4444" }}>
                    {t(`${CD}.header_delete`)}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* ── Identity row ── */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" }}>
          {/* Campaign type icon */}
          <Box sx={{
            width: 72, height: 72, borderRadius: "18px", flexShrink: 0,
            bgcolor: `${typeColor}10`, border: `1px solid ${typeColor}22`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 18px ${typeColor}20`,
          }}>
            {TypeIcon
              ? <TypeIcon sx={{ fontSize: 32, color: typeColor }} />
              : <CampaignOutlined sx={{ fontSize: 32, color: typeColor }} />
            }
          </Box>

          {/* Title / description / pills */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "1.125rem", color: "#0F172A", lineHeight: 1.25 }}>
              {campaign.title}
            </Typography>
            {campaign.description && (
              <Typography sx={{ fontSize: "0.8125rem", color: "#94A3B8", mt: 0.3, maxWidth: 520, lineHeight: 1.5 }}>
                {campaign.description}
              </Typography>
            )}

            {/* Pills */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1.25, flexWrap: "wrap" }}>
              {/* Status */}
              <Box sx={{
                display: "inline-flex", alignItems: "center", gap: 0.5,
                px: 1.125, py: "3px", borderRadius: "999px", bgcolor: sc.bg,
              }}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: sc.fg }} />
                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: sc.fg }}>
                  {statusLabel}
                </Typography>
              </Box>

              {/* Module */}
              {modLabel && (
                <Box sx={{
                  display: "inline-flex", alignItems: "center", gap: 0.5,
                  px: 1.25, py: "4px", borderRadius: "999px",
                  bgcolor: "#F1F5F9", border: "1px solid #E2E8F0",
                }}>
                  <Typography sx={{ fontSize: "11.5px", fontWeight: 600, color: "#475569" }}>
                    {modLabel}
                  </Typography>
                </Box>
              )}

              {/* Not-configured warning (DRAFT only) */}
              {campaign.status === "DRAFT" && !moduleConfigured && (
                <Tooltip title={t(`${CD}.tooltip_module_required`)} placement="top" arrow>
                  <Box sx={{
                    display: "inline-flex", alignItems: "center", gap: 0.4,
                    px: 1, py: "3px", borderRadius: "999px",
                    bgcolor: "#FFFBEB", border: "1px solid #FDE68A", cursor: "default",
                  }}>
                    <WarningAmberOutlined sx={{ fontSize: 11, color: "#D97706" }} />
                    <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#D97706" }}>
                      {t(`${CD}.header_not_configured`)}
                    </Typography>
                  </Box>
                </Tooltip>
              )}

              {/* Deadline */}
              {remaining !== null && (
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                  <CalendarTodayOutlined sx={{ fontSize: 11, color: "#CBD5E1" }} />
                  <Typography sx={{ fontSize: "11.5px", color: "#94A3B8", fontWeight: 500 }}>
                    {remaining === 0
                      ? t(`${CD}.header_deadline_short_passed`)
                      : t(`${CD}.header_deadline_short_left`, { count: remaining })}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

      </Box>

      {/* ── Status confirmation dialog ── */}
      {pendingStatus && (
        <ConfirmStatusChangeDialog
          open
          campaignTitle={campaign.title}
          currentStatus={campaign.status}
          targetStatus={pendingStatus}
          onClose={() => setPendingStatus(null)}
          onConfirm={() => { onChangeStatus?.(campaign._id, pendingStatus); setPendingStatus(null); }}
        />
      )}
    </Box>
  );
};

export default CampaignHeader;
