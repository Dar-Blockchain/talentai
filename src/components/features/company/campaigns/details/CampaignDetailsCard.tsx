import React from "react";
import { Box, Chip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import LockOutlined from "@mui/icons-material/LockOutlined";
import LockOpenOutlined from "@mui/icons-material/LockOpenOutlined";
import LinkOutlined from "@mui/icons-material/LinkOutlined";
import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import GroupOutlined from "@mui/icons-material/GroupOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import UpdateOutlined from "@mui/icons-material/UpdateOutlined";
import { Campaign } from "@/types/campaign";
import { fmtDate, daysLeft } from "@/utils/functions";

const CD = "detail";
const CW = "create_wizard";

const CARD = {
  bgcolor: "#fff",
  border: "1px solid #EDEEF0",
  borderRadius: "18px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
} as const;

// ─── InfoBlock ────────────────────────────────────────────────────────────────

const InfoBlock: React.FC<{
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  children: React.ReactNode;
}> = ({ icon, iconColor, label, children }) => (
  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
    <Box sx={{
      width: 36, height: 36, borderRadius: "10px", flexShrink: 0,
      bgcolor: `${iconColor}10`, border: `1px solid ${iconColor}18`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: iconColor,
    }}>
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", mb: 0.3 }}>
        {label}
      </Typography>
      {children}
    </Box>
  </Box>
);

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  campaign: Campaign;
}

const CampaignDetailsCard: React.FC<Props> = ({ campaign }) => {
  const { t } = useTranslation("campaign");
  const remaining    = daysLeft(campaign.deadline);
  const anonymous    = campaign.anonymityMode === "ANONYMOUS";

  const accessLabel =
    campaign.accessMethod === "LINK"
      ? t(`${CD}.details_access_public_link`)
      : campaign.accessMethod === "ACCOUNTS"
        ? t(`${CD}.details_access_accounts_only`)
        : t(`${CD}.details_access_link_and_accounts`);
  const accessSub =
    campaign.accessMethod === "LINK"
      ? t(`${CD}.details_access_sub_link`)
      : campaign.accessMethod === "ACCOUNTS"
        ? t(`${CD}.details_access_sub_accounts`)
        : t(`${CD}.details_access_sub_both`);
  const deadlineColor =
    remaining === null ? "#6B7280" :
    remaining === 0    ? "#DC2626" :
    remaining <= 7     ? "#D97706" : "#16A34A";

  return (
    <Box sx={{ ...CARD, p: 0, overflow: "hidden" }}>
      {/* Header */}
      <Box sx={{ px: 2.5, pt: 2.25, pb: 1.75, borderBottom: "1px solid #F3F4F6" }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#0F172A" }}>
          {t(`${CD}.details_settings_heading`)}
        </Typography>
      </Box>

      {/* Info grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, p: 2.5 }}>

        {/* Anonymity */}
        <InfoBlock
          icon={anonymous ? <LockOutlined sx={{ fontSize: 16 }} /> : <LockOpenOutlined sx={{ fontSize: 16 }} />}
          iconColor={anonymous ? "#8310FF" : "#0891B2"}
          label={t(`${CD}.details_anonymity_heading`)}
        >
          <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0F172A" }}>
            {anonymous ? t(`${CW}.anonymity_anonymous_label`) : t(`${CW}.anonymity_nominative_label`)}
          </Typography>
          <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8", mt: 0.15 }}>
            {anonymous ? t(`${CD}.details_responses_hidden`) : t(`${CD}.details_responses_identified`)}
          </Typography>
        </InfoBlock>

        {/* Access method */}
        <InfoBlock
          icon={campaign.accessMethod === "ACCOUNTS"
            ? <AccountCircleOutlined sx={{ fontSize: 16 }} />
            : <LinkOutlined sx={{ fontSize: 16 }} />}
          iconColor="#0D9488"
          label={t(`${CD}.details_access_method_heading`)}
        >
          <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0F172A" }}>
            {accessLabel}
          </Typography>
          <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8", mt: 0.15 }}>
            {accessSub}
          </Typography>
        </InfoBlock>

        {/* Target department */}
        {campaign.targetDepartment && (
          <InfoBlock icon={<GroupOutlined sx={{ fontSize: 16 }} />} iconColor="#F59E0B" label={t(`${CD}.details_target_department`)}>
            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0F172A" }}>
              {campaign.targetDepartment}
            </Typography>
          </InfoBlock>
        )}

        {/* Created */}
        <InfoBlock icon={<CalendarTodayOutlined sx={{ fontSize: 16 }} />} iconColor="#6B7280" label={t(`${CD}.details_label_created`)}>
          <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0F172A" }}>
            {fmtDate(campaign.createdAt)}
          </Typography>
        </InfoBlock>

        {/* Deadline */}
        {campaign.deadline && (
          <InfoBlock icon={<AccessTimeOutlined sx={{ fontSize: 16 }} />} iconColor={deadlineColor} label={t(`${CD}.details_label_deadline`)}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0F172A" }}>
                {fmtDate(campaign.deadline)}
              </Typography>
              {remaining !== null && (
                <Chip
                  label={
                    remaining === 0
                      ? t(`${CD}.details_chip_expired`)
                      : t(`${CD}.header_deadline_short_left`, { count: remaining })
                  }
                  size="small"
                  sx={{
                    height: 18, fontSize: "10px", fontWeight: 700,
                    bgcolor: remaining === 0 ? "#FEF2F2" : remaining <= 7 ? "#FFFBEB" : "#F0FDF4",
                    color:   deadlineColor,
                    "& .MuiChip-label": { px: 1 },
                  }}
                />
              )}
            </Box>
          </InfoBlock>
        )}

        {/* Last updated */}
        <InfoBlock icon={<UpdateOutlined sx={{ fontSize: 16 }} />} iconColor="#94A3B8" label={t(`${CD}.details_label_last_updated`)}>
          <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0F172A" }}>
            {fmtDate(campaign.updatedAt)}
          </Typography>
        </InfoBlock>

      </Box>
    </Box>
  );
};

export default CampaignDetailsCard;
