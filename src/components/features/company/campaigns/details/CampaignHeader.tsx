import React, { useState } from "react";
import { Box, Typography, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { useRouter } from "next/router";
import ArrowBackOutlined        from "@mui/icons-material/ArrowBackOutlined";
import DeleteOutlineOutlined    from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlined             from "@mui/icons-material/EditOutlined";
import PlayArrowOutlined        from "@mui/icons-material/PlayArrow";
import PauseOutlined            from "@mui/icons-material/PauseOutlined";
import StopOutlined             from "@mui/icons-material/StopOutlined";
import CalendarTodayOutlined    from "@mui/icons-material/CalendarTodayOutlined";
import WarningAmberOutlined     from "@mui/icons-material/WarningAmberOutlined";
import { Campaign, CampaignStatus } from "@/types/campaign";
import {
  STATUS_COLORS,
  STATUS_TRANSITION_LABELS,
  STATUS_TRANSITIONS,
  TYPE_COLORS,
  TYPE_LABELS,
  CAMPAIGN_TYPES,
  MODULE_CONFIG,
} from "@/constants/campaign";
import { daysLeft } from "@/utils/functions";

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

const STATUS_CHANGE_DESCRIPTIONS: Partial<Record<CampaignStatus, string>> = {
  ACTIVE: "Participants will be able to access and start the assessment.",
  PAUSED: "Participants will no longer be able to start new sessions until the campaign is resumed.",
  CLOSED: "The campaign will be permanently closed. Participants will lose access.",
};

const CampaignHeader: React.FC<Props> = ({
  campaign, onChangeStatus, onDeleteClick, onEditClick,
  backLabel = "Campaigns", backUrl = "/company/campaigns",
  actionsNode,
}) => {
  const router = useRouter();
  const [pendingStatus, setPendingStatus] = useState<CampaignStatus | null>(null);

  const sc          = STATUS_COLORS[campaign.status]  ?? STATUS_COLORS.DRAFT;
  const tc          = TYPE_COLORS[campaign.type]       ?? TYPE_COLORS.CUSTOM;
  const typeEntry   = CAMPAIGN_TYPES.find((t) => t.value === campaign.type);
  const TypeIcon    = typeEntry?.icon;
  const typeColor   = typeEntry?.color ?? "#6B7280";
  const modLabel       = MODULE_CONFIG[campaign.module?.type]?.label ?? campaign.module?.type;
  const transitions    = STATUS_TRANSITIONS[campaign.status] ?? [];
  const remaining      = daysLeft(campaign.deadline);
  const moduleConfigured = campaign.module?.config != null;

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
              {/* Edit button — DRAFT only */}
              {campaign.status === "DRAFT" && onEditClick && (
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
                  <Typography sx={{ fontSize: "0.775rem", fontWeight: 600, color: "#475569" }}>Edit</Typography>
                </Box>
              )}

              {/* Inline status transition buttons */}
              {transitions.map((s) => {
                const blocked  = s === "ACTIVE" && !moduleConfigured;
                const sColor   = STATUS_COLORS[s];
                const Icon     = STATUS_ICONS[s];
                const label    = STATUS_TRANSITION_LABELS[s];

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
                  <Tooltip key={s} title="Configure the module before activating this campaign." placement="top" arrow>
                    <span>{btn}</span>
                  </Tooltip>
                ) : btn;
              })}

              {/* Delete */}
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
                <Typography sx={{ fontSize: "0.775rem", fontWeight: 600, color: "#EF4444" }}>Delete</Typography>
              </Box>
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
            {TypeIcon && <TypeIcon sx={{ fontSize: 32, color: typeColor }} />}
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
                  {campaign.status}
                </Typography>
              </Box>

              {/* Type */}
              <Box sx={{
                display: "inline-flex", alignItems: "center", gap: 0.5,
                px: 1.125, py: "3px", borderRadius: "999px",
                bgcolor: tc.bg, border: `1px solid ${tc.border}`,
              }}>
                <Typography sx={{ fontSize: "11px", fontWeight: 700, color: tc.fg }}>
                  {TYPE_LABELS[campaign.type]}
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
                <Tooltip title="Module not configured — required before activating." placement="top" arrow>
                  <Box sx={{
                    display: "inline-flex", alignItems: "center", gap: 0.4,
                    px: 1, py: "3px", borderRadius: "999px",
                    bgcolor: "#FFFBEB", border: "1px solid #FDE68A", cursor: "default",
                  }}>
                    <WarningAmberOutlined sx={{ fontSize: 11, color: "#D97706" }} />
                    <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#D97706" }}>
                      Not configured
                    </Typography>
                  </Box>
                </Tooltip>
              )}

              {/* Deadline */}
              {remaining !== null && (
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                  <CalendarTodayOutlined sx={{ fontSize: 11, color: "#CBD5E1" }} />
                  <Typography sx={{ fontSize: "11.5px", color: "#94A3B8", fontWeight: 500 }}>
                    {remaining === 0 ? "Deadline passed" : `${remaining}d left`}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

      </Box>

      {/* ── Status confirmation dialog ── */}
      {pendingStatus && (() => {
        const sColor = STATUS_COLORS[pendingStatus];
        const Icon   = STATUS_ICONS[pendingStatus];
        const label  = STATUS_TRANSITION_LABELS[pendingStatus];
        const desc   = STATUS_CHANGE_DESCRIPTIONS[pendingStatus];
        return (
          <Dialog
            open
            onClose={() => setPendingStatus(null)}
            maxWidth="xs"
            fullWidth
            slotProps={{ paper: { sx: { borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" } } }}
          >
            <DialogTitle sx={{ pb: 1.5, pt: 2.5, px: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{
                  width: 38, height: 38, borderRadius: "10px", flexShrink: 0,
                  bgcolor: `${sColor?.bg}`, border: `1px solid ${sColor?.fg}25`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {Icon && <Icon sx={{ fontSize: 18, color: sColor?.fg }} />}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "15px", color: "#0F172A" }}>
                    {label} Campaign
                  </Typography>
                  <Typography sx={{ fontSize: "11px", color: "#94A3B8", mt: 0.25 }}>
                    {campaign.title}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>

            <DialogContent sx={{ px: 3, pb: 1 }}>
              <Typography sx={{ fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>
                {desc}
              </Typography>
              <Box sx={{
                mt: 1.5, px: 1.5, py: 1, borderRadius: "8px",
                bgcolor: "#F8FAFC", border: "1px solid #E2E8F0",
                display: "flex", alignItems: "center", gap: 1,
              }}>
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: "2px", borderRadius: "999px", bgcolor: sc.bg }}>
                  <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: sc.fg }} />
                  <Typography sx={{ fontSize: "11px", fontWeight: 700, color: sc.fg }}>{campaign.status}</Typography>
                </Box>
                <Typography sx={{ fontSize: "12px", color: "#94A3B8" }}>→</Typography>
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: "2px", borderRadius: "999px", bgcolor: sColor?.bg }}>
                  <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: sColor?.fg }} />
                  <Typography sx={{ fontSize: "11px", fontWeight: 700, color: sColor?.fg }}>{pendingStatus}</Typography>
                </Box>
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
              <Button
                onClick={() => setPendingStatus(null)}
                sx={{ textTransform: "none", fontWeight: 600, fontSize: "13px", color: "#6B7280", "&:hover": { bgcolor: "#F3F4F6" } }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => { onChangeStatus?.(campaign._id, pendingStatus); setPendingStatus(null); }}
                variant="contained"
                disableElevation
                sx={{
                  textTransform: "none", fontWeight: 700, fontSize: "13px",
                  bgcolor: sColor?.fg, borderRadius: "8px",
                  "&:hover": { bgcolor: sColor?.fg, opacity: 0.88 },
                }}
              >
                Confirm
              </Button>
            </DialogActions>
          </Dialog>
        );
      })()}
    </Box>
  );
};

export default CampaignHeader;
