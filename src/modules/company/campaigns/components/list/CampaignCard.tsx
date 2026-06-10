import React, { memo, useCallback, useMemo, useState } from "react";
import {
  Box, Chip, IconButton, Menu, MenuItem, Tooltip, Typography,
} from "@mui/material";
import {
  AccessTimeOutlined, ChevronRightOutlined, DeleteOutlineOutlined,
  MoreVertOutlined, PeopleAltOutlined, PlayArrowOutlined, PauseOutlined,
  StopOutlined, LinkOutlined, LockPersonOutlined, VisibilityOffOutlined, VisibilityOutlined,
} from "@mui/icons-material";
import { daysLeft, fmtDate } from "@/utils/functions";
import { MODULE_CONFIG, STATUS_COLORS, STATUS_TRANSITIONS } from "@/constants/campaign";
import { CampaignStatus, ModuleType, Campaign } from "@/types/campaign";
import AppButton from "@/components/ui/AppButton";
import Link from "next/link";
import { useTranslation, Trans } from "react-i18next";

// ─── Static constants ─────────────────────────────────────────────────────────

const STATUS_ICONS: Partial<Record<CampaignStatus, React.ElementType>> = {
  ACTIVE: PlayArrowOutlined,
  PAUSED: PauseOutlined,
  CLOSED: StopOutlined,
};

const STATUS_ACCENT: Record<string, string> = {
  DRAFT:   "#9CA3AF",
  ACTIVE:  "#16A34A",
  PAUSED:  "#D97706",
  CLOSED:  "#2563EB",
  EXPIRED: "#DC2626",
};

const CARD_SX = {
  bgcolor: "#fff", borderRadius: 3, border: "1px solid #E5E7EB",
  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.10)", borderColor: "#D1D5DB" },
  transition: "box-shadow 0.2s, border-color 0.2s",
  overflow: "hidden", display: "flex", flexDirection: "column",
  height: "100%", position: "relative",
} as const;

const BODY_SX      = { p: 2.5, pl: 3, flex: 1, display: "flex", flexDirection: "column", gap: 1.5 } as const;
const HEADER_ROW_SX = { display: "flex", alignItems: "flex-start", justifyContent: "space-between" } as const;
const CHIP_FLAGS_SX = { display: "flex", gap: 0.75, flexWrap: "wrap", flex: 1, mr: 1 } as const;
const MENU_BTN_SX  = { color: "#9CA3AF", p: 0.25, "&:hover": { color: "#6B7280" } } as const;
const MENU_PAPER_SX = {
  borderRadius: "14px", minWidth: 190, p: 0.75, bgcolor: "#fff",
  boxShadow: "0 8px 30px rgba(15,23,42,0.10)", border: "1px solid #E5E7EB",
} as const;
const SECTION_LABEL_SX = {
  fontSize: "10px", fontWeight: 700, color: "#9CA3AF",
  textTransform: "uppercase", letterSpacing: "0.06em",
} as const;
const DIVIDER_SX   = { my: 0.75, mx: 1, height: "1px", bgcolor: "#F3F4F6" } as const;
const DEL_ITEM_SX  = { borderRadius: "9px", px: 1.25, py: 0.875, gap: 1.25, minHeight: 36, "&:hover": { bgcolor: "#FEF2F2" } } as const;
const DEL_ICON_BOX = { width: 26, height: 26, borderRadius: "7px", flexShrink: 0, bgcolor: "#FEF2F2", border: "1px solid #FECACA", display: "flex", alignItems: "center", justifyContent: "center" } as const;
const DEL_TEXT_SX  = { fontSize: "13px", fontWeight: 600, color: "#DC2626" } as const;
const TITLE_SX     = { fontSize: "15px", fontWeight: 700, color: "#111827", lineHeight: 1.3 } as const;
const DESC_SX      = { fontSize: "12px", color: "#6B7280", mt: 0.5, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as const;
const MODULE_ROW_SX = { display: "flex", alignItems: "center", gap: 0.75 } as const;
const MODULE_LABEL_SX = { fontSize: "12px", color: "#4B5563", fontWeight: 500 } as const;
const PEOPLE_ROW_SX = { display: "flex", alignItems: "center", gap: 0.75 } as const;
const PEOPLE_ICON_SX = { fontSize: 14, color: "#9CA3AF" } as const;
const PEOPLE_TEXT_SX = { fontSize: "11.5px", color: "#6B7280" } as const;
const FLAGS_ROW_SX = { display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" } as const;
const FOOTER_SX    = { px: 2.5, pl: 3, py: 1.75, bgcolor: "#F9FAFB", borderTop: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between" } as const;
const FOOTER_LEFT_SX = { display: "flex", alignItems: "center", gap: 0.75 } as const;
const CHEVRON_SX   = { fontSize: 14 } as const;

// ─── Component ────────────────────────────────────────────────────────────────

interface CampaignCardProps {
  campaign: Campaign;
  onViewDetails: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onStatusChange: (id: string, title: string, currentStatus: Campaign["status"], targetStatus: CampaignStatus) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canPublish?: boolean;
}

const CampaignCard: React.FC<CampaignCardProps> = memo(({
  campaign, onDelete, onStatusChange, canDelete = true, canPublish = true,
}) => {
  const { t } = useTranslation("dashboard");
  const p = "pages.campaigns";

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const sc          = useMemo(() => STATUS_COLORS[campaign.status] || STATUS_COLORS.DRAFT, [campaign.status]);
  const accentColor = useMemo(() => STATUS_ACCENT[campaign.status] || "#9CA3AF", [campaign.status]);
  const remaining   = useMemo(() => daysLeft(campaign.deadline), [campaign.deadline]);
  const isUrgent    = useMemo(() => remaining !== null && remaining <= 3 && remaining >= 0, [remaining]);
  const isToday     = useMemo(() =>
    campaign.deadline ? new Date(campaign.deadline).toDateString() === new Date().toDateString() : false,
  [campaign.deadline]);

  const moduleConf  = useMemo(() => campaign.module ? MODULE_CONFIG[campaign.module.type] : null, [campaign.module]);
  const ModuleIcon  = moduleConf?.icon;
  const moduleLabel = useMemo(() =>
    campaign.module?.type ? t(`${p}.module.${campaign.module.type as ModuleType}`) : null,
  [campaign.module?.type, t]);

  const statusLabel = useMemo(() => t(`${p}.status.${campaign.status}`), [campaign.status, t]);

  const stripSx     = useMemo(() => ({
    position: "absolute", left: 0, top: 0, bottom: 0,
    width: 4, bgcolor: accentColor, borderRadius: "12px 0 0 12px",
  }), [accentColor]);

  const chipSx = useMemo(() => ({
    bgcolor: sc.bg, color: sc.fg,
    fontSize: "11px", fontWeight: 700, fontFamily: "Poppins, sans-serif",
    height: 22, px: 0.5,
  }), [sc]);

  const timeIconSx = useMemo(() => ({
    fontSize: 14, color: isUrgent ? "#EF4444" : "#9CA3AF",
  }), [isUrgent]);

  const openMenu  = useCallback((e: React.MouseEvent<HTMLElement>) => setMenuAnchor(e.currentTarget), []);
  const closeMenu = useCallback(() => setMenuAnchor(null), []);
  const handleDelete = useCallback(() => { closeMenu(); onDelete(campaign._id, campaign.title); }, [closeMenu, onDelete, campaign._id, campaign.title]);

  const transitions = useMemo(() => STATUS_TRANSITIONS[campaign.status] ?? [], [campaign.status]);

  const accessBadgeSx = useMemo(() => ({
    display: "flex", alignItems: "center", gap: 0.5, px: 1, py: 0.35, borderRadius: "6px",
    bgcolor: campaign.accessMethod === "LINK" ? "#EFF6FF" : "#F5F3FF",
    border: `1px solid ${campaign.accessMethod === "LINK" ? "#BFDBFE" : "#DDD6FE"}`,
  }), [campaign.accessMethod]);

  const accessTextColor = useMemo(() =>
    campaign.accessMethod === "LINK" ? "#1D4ED8" : "#5B21B6",
  [campaign.accessMethod]);

  const anonymityBadgeSx = useMemo(() => ({
    display: "flex", alignItems: "center", gap: 0.5, px: 1, py: 0.35, borderRadius: "6px",
    bgcolor: campaign.anonymityMode === "ANONYMOUS" ? "#FFF7ED" : "#F0FDF4",
    border: `1px solid ${campaign.anonymityMode === "ANONYMOUS" ? "#FED7AA" : "#BBF7D0"}`,
  }), [campaign.anonymityMode]);

  const anonymityTextColor = useMemo(() =>
    campaign.anonymityMode === "ANONYMOUS" ? "#9A3412" : "#166534",
  [campaign.anonymityMode]);

  const deadlineText = useMemo(() => {
    if (!campaign.deadline) {
      return <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>{t(`${p}.card.no_deadline`)}</Typography>;
    }
    const dateStr = fmtDate(campaign.deadline);
    if (remaining === 0) {
      return (
        <Typography component="span" sx={{ fontSize: "11px", color: "#EF4444", cursor: "default" }}>
          <Box component="strong" sx={{ color: "#EF4444" }}>{t(`${p}.card.deadline_expired`)}</Box>
        </Typography>
      );
    }
    if (isToday) {
      return (
        <Typography component="span" sx={{ fontSize: "11px", color: "#EF4444", cursor: "default" }}>
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
          <Box component="strong" sx={{ color: "#F59E0B" }}>{t(`${p}.card.days_left`, { count: remaining })}</Box>
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
  }, [campaign.deadline, remaining, isToday, t]);

  return (
    <Box sx={CARD_SX}>
      <Box sx={stripSx} />

      <Box sx={BODY_SX}>
        <Box sx={HEADER_ROW_SX}>
          <Box sx={CHIP_FLAGS_SX}>
            <Chip label={statusLabel} size="small" sx={chipSx} />
          </Box>
          {(canPublish || canDelete) && (
            <>
              <IconButton size="small" sx={MENU_BTN_SX} onClick={openMenu}>
                <MoreVertOutlined sx={{ fontSize: 18 }} />
              </IconButton>
              <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}
                slotProps={{ paper: { sx: MENU_PAPER_SX } }}>
                {canPublish && transitions.length > 0 && (
                  <Box sx={{ px: 1.25, pt: 0.5, pb: 0.75 }}>
                    <Typography sx={SECTION_LABEL_SX}>{t(`${p}.card.menu_section_change_status`)}</Typography>
                  </Box>
                )}

                {canPublish && transitions.map((s) => {
                  const sColor = STATUS_COLORS[s];
                  const Icon   = STATUS_ICONS[s];
                  return (
                    <MenuItem
                      key={s}
                      onClick={() => { closeMenu(); onStatusChange(campaign._id, campaign.title, campaign.status, s); }}
                      sx={{ borderRadius: "9px", px: 1.25, py: 0.875, gap: 1.25, minHeight: 36, "&:hover": { bgcolor: sColor?.bg } }}
                    >
                      <Box sx={{ width: 26, height: 26, borderRadius: "7px", flexShrink: 0, bgcolor: sColor?.bg, border: `1px solid ${sColor?.fg}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {Icon && <Icon sx={{ fontSize: 14, color: sColor?.fg }} />}
                      </Box>
                      <Typography sx={{ fontSize: "13px", fontWeight: 600, color: sColor?.fg }}>
                        {t(`${p}.card.menu_transition.${s}`)}
                      </Typography>
                    </MenuItem>
                  );
                })}

                {canPublish && canDelete && transitions.length > 0 && <Box sx={DIVIDER_SX} />}

                {canDelete && (
                  <MenuItem onClick={handleDelete} sx={DEL_ITEM_SX}>
                    <Box sx={DEL_ICON_BOX}>
                      <DeleteOutlineOutlined sx={{ fontSize: 14, color: "#DC2626" }} />
                    </Box>
                    <Typography sx={DEL_TEXT_SX}>{t(`${p}.card.menu_delete`)}</Typography>
                  </MenuItem>
                )}
              </Menu>
            </>
          )}
        </Box>

        <Box>
          <Typography sx={TITLE_SX}>{campaign.title}</Typography>
          {campaign.description && (
            <Typography sx={DESC_SX}>{campaign.description}</Typography>
          )}
        </Box>

        {moduleConf && ModuleIcon && moduleLabel && (
          <Box sx={MODULE_ROW_SX}>
            <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: `${moduleConf.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ModuleIcon sx={{ fontSize: 15, color: moduleConf.color }} />
            </Box>
            <Typography sx={MODULE_LABEL_SX}>{moduleLabel}</Typography>
          </Box>
        )}

        {campaign.targetEmployeeCount != null && (
          <Box sx={PEOPLE_ROW_SX}>
            <PeopleAltOutlined sx={PEOPLE_ICON_SX} />
            <Typography component="span" sx={PEOPLE_TEXT_SX}>
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
          <Box sx={FLAGS_ROW_SX}>
            {campaign.accessMethod && (
              <Box sx={accessBadgeSx}>
                {campaign.accessMethod === "LINK"
                  ? <LinkOutlined sx={{ fontSize: 11, color: "#3B82F6" }} />
                  : <LockPersonOutlined sx={{ fontSize: 11, color: "#8B5CF6" }} />}
                <Typography sx={{ fontSize: "10px", fontWeight: 600, color: accessTextColor }}>
                  {campaign.accessMethod === "LINK" ? t(`${p}.card.access_public_link`) : t(`${p}.card.access_accounts_only`)}
                </Typography>
              </Box>
            )}
            {campaign.anonymityMode && (
              <Box sx={anonymityBadgeSx}>
                {campaign.anonymityMode === "ANONYMOUS"
                  ? <VisibilityOffOutlined sx={{ fontSize: 11, color: "#EA580C" }} />
                  : <VisibilityOutlined sx={{ fontSize: 11, color: "#10B981" }} />}
                <Typography sx={{ fontSize: "10px", fontWeight: 600, color: anonymityTextColor }}>
                  {campaign.anonymityMode === "ANONYMOUS" ? t(`${p}.card.privacy_anonymous`) : t(`${p}.card.privacy_nominative`)}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      <Box sx={FOOTER_SX}>
        <Box sx={FOOTER_LEFT_SX}>
          <AccessTimeOutlined sx={timeIconSx} />
          {campaign.deadline ? (
            <Tooltip title={fmtDate(campaign.deadline)} placement="top" arrow>
              <Box>{deadlineText}</Box>
            </Tooltip>
          ) : deadlineText}
        </Box>
        <Link href={`/company/campaigns/${campaign._id}`}>
          <AppButton endIcon={<ChevronRightOutlined sx={CHEVRON_SX} />} label={t(`${p}.card.view`)} size="xs" />
        </Link>
      </Box>
    </Box>
  );
});

CampaignCard.displayName = "CampaignCard";
export default CampaignCard;
