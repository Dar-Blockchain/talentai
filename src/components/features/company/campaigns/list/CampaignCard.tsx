import React, { memo, useState } from "react";
import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AccessTimeOutlined,
  ChevronRightOutlined,
  DeleteOutlineOutlined,
  MoreVertOutlined,
  PeopleAltOutlined,
  PlayArrowOutlined,
  PauseOutlined,
  StopOutlined,
  LinkOutlined,
  LockPersonOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { daysLeft, fmtDate } from "@/utils/functions";
import {
  MODULE_CONFIG,
  STATUS_COLORS,
  STATUS_TRANSITIONS,
} from "@/constants/campaign";
import { CampaignStatus, ModuleType, Campaign } from "@/types/campaign";
import AppButton from "@/components/ui/AppButton";
import Link from "next/link";
import { useTranslation, Trans } from "react-i18next";

const STATUS_ICONS: Partial<Record<CampaignStatus, React.ElementType>> = {
  ACTIVE: PlayArrowOutlined,
  PAUSED: PauseOutlined,
  CLOSED: StopOutlined,
};

const STATUS_ACCENT: Record<string, string> = {
  DRAFT: "#9CA3AF",
  ACTIVE: "#16A34A",
  PAUSED: "#D97706",
  CLOSED: "#2563EB",
  EXPIRED: "#DC2626",
};

const CampaignCard: React.FC<{
  campaign: Campaign;
  onViewDetails: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onStatusChange: (id: string, title: string, currentStatus: Campaign["status"], targetStatus: CampaignStatus) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canPublish?: boolean;
}> = memo(({ campaign, onDelete, onStatusChange, canDelete = true, canPublish = true }) => {
  const { t } = useTranslation("dashboard");
  const p = "pages.campaigns";

  const sc = STATUS_COLORS[campaign.status] || STATUS_COLORS.DRAFT;
  const accentColor = STATUS_ACCENT[campaign.status] || "#9CA3AF";
  const remaining = daysLeft(campaign.deadline);
  const isToday = campaign.deadline
    ? new Date(campaign.deadline).toDateString() === new Date().toDateString()
    : false;
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const moduleConf = campaign.module ? MODULE_CONFIG[campaign.module.type] : null;
  const ModuleIcon = moduleConf?.icon;

  const isUrgent = remaining !== null && remaining <= 3 && remaining >= 0;

  const statusLabel = t(`${p}.status.${campaign.status}`);

  const moduleLabel = campaign.module?.type
    ? t(`${p}.module.${campaign.module.type as ModuleType}`)
    : null;

  const transitionLabel = (s: CampaignStatus) =>
    t(`${p}.card.menu_transition.${s}`);

  const deadlineBlock = () => {
    if (!campaign.deadline) {
      return <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>{t(`${p}.card.no_deadline`)}</Typography>;
    }
    const dateStr = fmtDate(campaign.deadline);
    if (remaining === 0) {
      return (
        <Typography component="span" sx={{ fontSize: "11px", color: isUrgent ? "#EF4444" : "#6B7280", cursor: "default" }}>
          <Box component="strong" sx={{ color: "#EF4444" }}>{t(`${p}.card.deadline_expired`)}</Box>
        </Typography>
      );
    }
    if (isToday) {
      return (
        <Typography component="span" sx={{ fontSize: "11px", color: isUrgent ? "#EF4444" : "#6B7280", cursor: "default" }}>
          <Box component="strong" sx={{ color: "#EF4444" }}>{t(`${p}.card.expires_today`)}</Box>
        </Typography>
      );
    }
    if (remaining === 1) {
      return (
        <Typography sx={{ fontSize: "11px", color: "#6B7280", cursor: "default" }}>
          <Box component="strong" sx={{ color: "#F59E0B" }}>{t(`${p}.card.tomorrow_prefix`)}</Box>
          {" "}· {dateStr}
        </Typography>
      );
    }
    if (remaining !== null && remaining <= 3) {
      return (
        <Typography sx={{ fontSize: "11px", color: "#6B7280", cursor: "default" }}>
          <Box component="strong" sx={{ color: "#F59E0B" }}>
            {t(`${p}.card.days_left`, { count: remaining })}
          </Box>
          {" "}· {dateStr}
        </Typography>
      );
    }
    return (
      <Typography sx={{ fontSize: "11px", color: "#6B7280", cursor: "default" }}>
        {t(`${p}.card.due_prefix`)}{" "}
        <Box component="strong" sx={{ color: "#374151" }}>{dateStr}</Box>
      </Typography>
    );
  };

  return (
    <Box
      sx={{
        bgcolor: "#fff",
        borderRadius: 3,
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.10)", borderColor: "#D1D5DB" },
        transition: "box-shadow 0.2s, border-color 0.2s",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          bgcolor: accentColor,
          borderRadius: "12px 0 0 12px",
        }}
      />

      <Box sx={{ p: 2.5, pl: 3, flex: 1, display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", flex: 1, mr: 1 }}>
            <Chip
              label={statusLabel}
              size="small"
              sx={{
                bgcolor: sc.bg,
                color: sc.fg,
                fontSize: "11px",
                fontWeight: 700,
                fontFamily: "Poppins, sans-serif",
                height: 22,
                px: 0.5,
              }}
            />
          </Box>
          {(canPublish || canDelete) && (
            <>
              <IconButton
                size="small"
                sx={{ color: "#9CA3AF", p: 0.25, "&:hover": { color: "#6B7280" } }}
                onClick={(e) => setMenuAnchor(e.currentTarget)}
              >
                <MoreVertOutlined sx={{ fontSize: 18 }} />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
                slotProps={{
                  paper: {
                    sx: {
                      borderRadius: "14px",
                      minWidth: 190,
                      p: 0.75,
                      bgcolor: "#fff",
                      boxShadow: "0 8px 30px rgba(15,23,42,0.10)",
                      border: "1px solid #E5E7EB",
                    },
                  },
                }}
              >
                {canPublish && (STATUS_TRANSITIONS[campaign.status]?.length ?? 0) > 0 && (
                  <Box sx={{ px: 1.25, pt: 0.5, pb: 0.75 }}>
                    <Typography sx={{ fontSize: "10px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {t(`${p}.card.menu_section_change_status`)}
                    </Typography>
                  </Box>
                )}

                {canPublish
                  ? (STATUS_TRANSITIONS[campaign.status] ?? []).map((s) => {
                    const sColor = STATUS_COLORS[s];
                    const Icon   = STATUS_ICONS[s];
                    const label  = transitionLabel(s);
                    return (
                      <MenuItem
                        key={s}
                        onClick={() => { setMenuAnchor(null); onStatusChange(campaign._id, campaign.title, campaign.status, s); }}
                        sx={{
                          borderRadius: "9px", px: 1.25, py: 0.875, gap: 1.25, minHeight: 36,
                          "&:hover": { bgcolor: `${sColor?.bg}` },
                        }}
                      >
                        <Box sx={{
                          width: 26, height: 26, borderRadius: "7px", flexShrink: 0,
                          bgcolor: sColor?.bg, border: `1px solid ${sColor?.fg}25`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {Icon && <Icon sx={{ fontSize: 14, color: sColor?.fg }} />}
                        </Box>
                        <Typography sx={{ fontSize: "13px", fontWeight: 600, color: sColor?.fg }}>
                          {label}
                        </Typography>
                      </MenuItem>
                    );
                  })
                  : null}

                {canPublish && canDelete && (STATUS_TRANSITIONS[campaign.status]?.length ?? 0) > 0 && (
                  <Box sx={{ my: 0.75, mx: 1, height: "1px", bgcolor: "#F3F4F6" }} />
                )}

                {canDelete && (
                  <MenuItem
                    onClick={() => { setMenuAnchor(null); onDelete(campaign._id, campaign.title); }}
                    sx={{
                      borderRadius: "9px", px: 1.25, py: 0.875, gap: 1.25, minHeight: 36,
                      "&:hover": { bgcolor: "#FEF2F2" },
                    }}
                  >
                    <Box sx={{
                      width: 26, height: 26, borderRadius: "7px", flexShrink: 0,
                      bgcolor: "#FEF2F2", border: "1px solid #FECACA",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <DeleteOutlineOutlined sx={{ fontSize: 14, color: "#DC2626" }} />
                    </Box>
                    <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#DC2626" }}>
                      {t(`${p}.card.menu_delete`)}
                    </Typography>
                  </MenuItem>
                )}
              </Menu>
            </>
          )}
        </Box>

        <Box>
          <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>
            {campaign.title}
          </Typography>
          {campaign.description && (
            <Typography
              sx={{
                fontSize: "12px",
                color: "#6B7280",
                mt: 0.5,
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {campaign.description}
            </Typography>
          )}
        </Box>

        {moduleConf && ModuleIcon && moduleLabel && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1.5,
                bgcolor: `${moduleConf.color}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ModuleIcon sx={{ fontSize: 15, color: moduleConf.color }} />
            </Box>
            <Typography sx={{ fontSize: "12px", color: "#4B5563", fontWeight: 500 }}>
              {moduleLabel}
            </Typography>
          </Box>
        )}

        {campaign.targetEmployeeCount != null && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <PeopleAltOutlined sx={{ fontSize: 14, color: "#9CA3AF" }} />
            <Typography component="span" sx={{ fontSize: "11.5px", color: "#6B7280" }}>
              <Trans
                i18nKey={`${p}.card.target_participants`}
                ns="dashboard"
                count={campaign.targetEmployeeCount}
                components={{ strong: <strong style={{ color: "#374151" }} /> }}
                values={{ count: campaign.targetEmployeeCount }}
              />
            </Typography>
          </Box>
        )}

        {(campaign.accessMethod || campaign.anonymityMode) && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            {campaign.accessMethod && (
              <Box sx={{
                display: "flex", alignItems: "center", gap: 0.5,
                px: 1, py: 0.35, borderRadius: "6px",
                bgcolor: campaign.accessMethod === "LINK" ? "#EFF6FF" : "#F5F3FF",
                border: `1px solid ${campaign.accessMethod === "LINK" ? "#BFDBFE" : "#DDD6FE"}`,
              }}>
                {campaign.accessMethod === "LINK"
                  ? <LinkOutlined sx={{ fontSize: 11, color: "#3B82F6" }} />
                  : <LockPersonOutlined sx={{ fontSize: 11, color: "#8B5CF6" }} />
                }
                <Typography sx={{ fontSize: "10px", fontWeight: 600, color: campaign.accessMethod === "LINK" ? "#1D4ED8" : "#5B21B6" }}>
                  {campaign.accessMethod === "LINK"
                    ? t(`${p}.card.access_public_link`)
                    : t(`${p}.card.access_accounts_only`)
                  }
                </Typography>
              </Box>
            )}
            {campaign.anonymityMode && (
              <Box sx={{
                display: "flex", alignItems: "center", gap: 0.5,
                px: 1, py: 0.35, borderRadius: "6px",
                bgcolor: campaign.anonymityMode === "ANONYMOUS" ? "#FFF7ED" : "#F0FDF4",
                border: `1px solid ${campaign.anonymityMode === "ANONYMOUS" ? "#FED7AA" : "#BBF7D0"}`,
              }}>
                {campaign.anonymityMode === "ANONYMOUS"
                  ? <VisibilityOffOutlined sx={{ fontSize: 11, color: "#EA580C" }} />
                  : <VisibilityOutlined sx={{ fontSize: 11, color: "#10B981" }} />
                }
                <Typography sx={{ fontSize: "10px", fontWeight: 600, color: campaign.anonymityMode === "ANONYMOUS" ? "#9A3412" : "#166534" }}>
                  {campaign.anonymityMode === "ANONYMOUS"
                    ? t(`${p}.card.privacy_anonymous`)
                    : t(`${p}.card.privacy_nominative`)
                  }
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          px: 2.5,
          pl: 3,
          py: 1.75,
          bgcolor: "#F9FAFB",
          borderTop: "1px solid #E5E7EB",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <AccessTimeOutlined sx={{ fontSize: 14, color: isUrgent ? "#EF4444" : "#9CA3AF" }} />
          {campaign.deadline ? (
            <Tooltip title={fmtDate(campaign.deadline)} placement="top" arrow>
              <Typography sx={{ fontSize: "11px", color: isUrgent ? "#EF4444" : "#6B7280", cursor: "default" }}>
                {deadlineBlock()}
              </Typography>
            </Tooltip>
          ) : (
            deadlineBlock()
          )}
        </Box>
        <Link href={`/company/campaigns/${campaign._id}`}>
          <AppButton
            endIcon={<ChevronRightOutlined sx={{ fontSize: 14 }} />}
            label={t(`${p}.card.view`)}
            size="xs"
          />
        </Link>
      </Box>
    </Box>
  );
});

CampaignCard.displayName = "CampaignCard";

export default CampaignCard;
