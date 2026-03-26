import React, { useState } from "react";
import { Box, Typography, Menu, MenuItem, Tooltip } from "@mui/material";
import { useRouter } from "next/router";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlined from "@mui/icons-material/EditOutlined";
import KeyboardArrowDownOutlined from "@mui/icons-material/KeyboardArrowDownOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
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

const CampaignHeader: React.FC<Props> = ({
  campaign, onChangeStatus, onDeleteClick, onEditClick,
  backLabel = "Campaigns", backUrl = "/company/campaigns",
  actionsNode,
}) => {
  const router = useRouter();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

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
            <Box sx={{ display: "flex", gap: 0.875 }}>
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
              {transitions.length > 0 && (
                <>
                  <Box
                    onClick={(e) => setAnchor(e.currentTarget)}
                    sx={{
                      display: "flex", alignItems: "center", gap: 0.625,
                      px: 1.625, py: 0.75, borderRadius: "10px", cursor: "pointer",
                      border: "1px solid #E2E8F0", bgcolor: "#F8FAFC",
                      transition: "all 0.15s",
                      "&:hover": { bgcolor: `${typeColor}08`, borderColor: `${typeColor}30`, "& *": { color: typeColor } },
                    }}
                  >
                    <Typography sx={{ fontSize: "0.775rem", fontWeight: 600, color: "#475569" }}>
                      Change Status
                    </Typography>
                    <KeyboardArrowDownOutlined sx={{ fontSize: 14, color: "#64748B" }} />
                  </Box>
                  <Menu
                    anchorEl={anchor}
                    open={Boolean(anchor)}
                    onClose={() => setAnchor(null)}
                    slotProps={{ paper: { sx: { borderRadius: 2, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", minWidth: 160, border: "1px solid #F3F4F6", mt: 0.5 } } }}
                  >
                    {transitions.map((s) => {
                      const blocked = s === "ACTIVE" && !moduleConfigured;
                      return (
                        <Tooltip
                          key={s}
                          title={blocked ? "Configure the module before activating this campaign." : ""}
                          placement="left"
                          arrow
                        >
                          <span>
                            <MenuItem
                              disabled={blocked}
                              onClick={() => { setAnchor(null); onChangeStatus?.(campaign._id, s); }}
                              sx={{ fontSize: "13px", fontWeight: 600, color: STATUS_COLORS[s]?.fg }}
                            >
                              {STATUS_TRANSITION_LABELS[s]}
                            </MenuItem>
                          </span>
                        </Tooltip>
                      );
                    })}
                  </Menu>
                </>
              )}
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
    </Box>
  );
};

export default CampaignHeader;
