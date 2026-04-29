import React, { useState, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import ContentCopyOutlined from "@mui/icons-material/ContentCopyOutlined";
import LinkOutlined from "@mui/icons-material/LinkOutlined";
import OpenInNewOutlined from "@mui/icons-material/OpenInNewOutlined";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import UpdateOutlined from "@mui/icons-material/UpdateOutlined";
import SecurityOutlined from "@mui/icons-material/SecurityOutlined";
import GroupOutlined from "@mui/icons-material/GroupOutlined";
import { Campaign } from "@/types/campaign";
import { STATUS_COLORS } from "@/constants/campaign";
import { fmtDate } from "@/utils/functions";

const CD = "detail";
const CW = "create_wizard";

const TEAL  = "#0D9488";
const CARD  = {
  bgcolor: "#fff",
  border: "1px solid #EDEEF0",
  borderRadius: "18px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
} as const;

interface Props {
  campaign: Campaign;
  showLastUpdated?: boolean;
}

const CampaignSidebar: React.FC<Props> = ({ campaign, showLastUpdated = true }) => {
  const showLink =
    !!campaign.linkToken &&
    (campaign.accessMethod === "LINK");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {showLink && <CampaignLinkCard linkToken={campaign.linkToken!} />}
      <CampaignInfoCard campaign={campaign} showLastUpdated={showLastUpdated} />
    </Box>
  );
};

// ─── Campaign Link card ───────────────────────────────────────────────────────

const CampaignLinkCard: React.FC<{ linkToken: string }> = ({ linkToken }) => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation("campaign");
  const url = typeof window !== "undefined"
    ? `${window.location.origin}/campaign/${linkToken}`
    : `/campaign/${linkToken}`;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [url]);

  return (
    <Box sx={{
      ...CARD, p: 0, overflow: "hidden",
      background: `linear-gradient(135deg, ${TEAL}06 0%, transparent 60%)`,
    }}>
      {/* Header */}
      <Box sx={{ px: 2.25, pt: 2, pb: 1.5, borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: `${TEAL}10`, border: `1px solid ${TEAL}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LinkOutlined sx={{ fontSize: 14, color: TEAL }} />
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: "0.8125rem", color: "#0F172A" }}>
          {t(`${CD}.sidebar_campaign_link`)}
        </Typography>
      </Box>

      <Box sx={{ p: 2.25 }}>
        {/* URL display */}
        <Box sx={{
          bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px",
          px: 1.5, py: 1, mb: 1.25,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          <Typography sx={{ fontSize: "11px", color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {url}
          </Typography>
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Box
            onClick={handleCopy}
            sx={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 0.625,
              py: 0.875, borderRadius: "9px", cursor: "pointer",
              bgcolor: copied ? "#F0FDF4" : `${TEAL}10`,
              border: `1px solid ${copied ? "#86EFAC" : `${TEAL}25`}`,
              transition: "all 0.15s", "&:hover": { opacity: 0.85 },
            }}
          >
            {copied
              ? <CheckOutlined sx={{ fontSize: 13, color: "#16A34A" }} />
              : <ContentCopyOutlined sx={{ fontSize: 13, color: TEAL }} />}
            <Typography sx={{ fontSize: "12px", fontWeight: 700, color: copied ? "#16A34A" : TEAL }}>
              {copied ? t(`${CD}.sidebar_copied`) : t(`${CD}.sidebar_copy`)}
            </Typography>
          </Box>
          <Box
            component="a"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 0.625,
              px: 1.5, py: 0.875, borderRadius: "9px", cursor: "pointer", textDecoration: "none",
              bgcolor: "#F8FAFC", border: "1px solid #E2E8F0",
              transition: "all 0.15s", "&:hover": { bgcolor: "#F1F5F9", borderColor: "#CBD5E1" },
            }}
          >
            <OpenInNewOutlined sx={{ fontSize: 13, color: "#64748B" }} />
            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>{t(`${CD}.sidebar_open`)}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// ─── Info card ────────────────────────────────────────────────────────────────

const InfoRow: React.FC<{
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: React.ReactNode;
}> = ({ icon, iconColor, label, value }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, py: 1.25, borderBottom: "1px solid #F8FAFC", "&:last-child": { borderBottom: "none", pb: 0 } }}>
    <Box sx={{
      width: 30, height: 30, borderRadius: "8px", flexShrink: 0,
      bgcolor: `${iconColor}10`, border: `1px solid ${iconColor}15`,
      display: "flex", alignItems: "center", justifyContent: "center", color: iconColor,
    }}>
      {icon}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </Typography>
      <Typography component="div" sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#0F172A", mt: 0.1 }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

const CampaignInfoCard: React.FC<{ campaign: Campaign; showLastUpdated?: boolean }> = ({ campaign, showLastUpdated = true }) => {
  const { t } = useTranslation("campaign");
  const sc       = STATUS_COLORS[campaign.status] ?? STATUS_COLORS.DRAFT;
  const modType  = campaign.module?.type;
  const modLabel =
    modType != null ? t(`${CW}.modules.${modType}.label`) : undefined;
  const statusLabel = t(`status.${campaign.status}`, { defaultValue: campaign.status });

  return (
    <Box sx={{ ...CARD, p: 0, overflow: "hidden" }}>
      <Box sx={{ px: 2.25, pt: 2, pb: 1.5, borderBottom: "1px solid #F3F4F6" }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.8125rem", color: "#0F172A" }}>{t(`${CD}.sidebar_quick_info`)}</Typography>
      </Box>
      <Box sx={{ px: 2.25, pt: 0.5, pb: 1.75 }}>

        {/* Status */}
        <InfoRow
          icon={<Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: sc.fg }} />}
          iconColor={sc.fg}
          label={t(`${CD}.sidebar_label_status`)}
          value={
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1, py: 0.2, borderRadius: "999px", bgcolor: sc.bg }}>
              <Typography sx={{ fontSize: "11px", fontWeight: 700, color: sc.fg }}>{statusLabel}</Typography>
            </Box>
          }
        />

        {/* Module */}
        <InfoRow
          icon={<SecurityOutlined sx={{ fontSize: 14 }} />}
          iconColor="#8310FF"
          label={t(`${CD}.sidebar_label_module`)}
          value={modLabel}
        />

        {/* Target department */}
        {campaign.targetDepartment && (
          <InfoRow
            icon={<GroupOutlined sx={{ fontSize: 14 }} />}
            iconColor="#F59E0B"
            label={t(`${CD}.sidebar_label_department`)}
            value={campaign.targetDepartment}
          />
        )}

        {/* Created */}
        <InfoRow
          icon={<CalendarTodayOutlined sx={{ fontSize: 14 }} />}
          iconColor="#64748B"
          label={t(`${CD}.sidebar_label_created`)}
          value={fmtDate(campaign.createdAt)}
        />

        {/* Updated */}
        {showLastUpdated && (
          <InfoRow
            icon={<UpdateOutlined sx={{ fontSize: 14 }} />}
            iconColor="#94A3B8"
            label={t(`${CD}.sidebar_label_updated`)}
            value={fmtDate(campaign.updatedAt)}
          />
        )}

      </Box>
    </Box>
  );
};

export default CampaignSidebar;
