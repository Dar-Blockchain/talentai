import React from "react";
import { Box, Chip, Typography } from "@mui/material";
import {
  AccessTimeOutlined,
  CalendarTodayOutlined,
  GroupOutlined,
  LinkOutlined,
  LockOutlined,
} from "@mui/icons-material";
import { Campaign } from "@/types/campaign";
import { fmtDate, daysLeft } from "@/utils/functions";

const CARD = { bgcolor: "#fff", borderRadius: 3, border: "1px solid #E5E7EB", p: 2.5 } as const;

interface Props {
  campaign: Campaign;
}

const CampaignDetailsCard: React.FC<Props> = ({ campaign }) => {
  const remaining = daysLeft(campaign.deadline);

  return (
    <Box sx={CARD}>
      <Typography sx={{ fontWeight: 700, fontSize: "13px", color: "#111827", mb: 2 }}>
        Campaign Details
      </Typography>
      <Box
        sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}
      >
        <InfoRow
          icon={<LockOutlined sx={{ fontSize: 14 }} />}
          label="Anonymity"
          value={campaign.anonymityMode === "ANONYMOUS" ? "Anonymous" : "Nominative"}
        />
        <InfoRow
          icon={<LinkOutlined sx={{ fontSize: 14 }} />}
          label="Access Method"
          value={
            campaign.accessMethod === "LINK"
              ? "Public Link"
              : campaign.accessMethod === "ACCOUNTS"
                ? "Accounts Only"
                : "Link & Accounts"
          }
        />
        {campaign.targetDepartment && (
          <InfoRow
            icon={<GroupOutlined sx={{ fontSize: 14 }} />}
            label="Target Department"
            value={campaign.targetDepartment}
          />
        )}
        <InfoRow
          icon={<CalendarTodayOutlined sx={{ fontSize: 14 }} />}
          label="Created"
          value={fmtDate(campaign.createdAt)}
        />
        {campaign.deadline && (
          <InfoRow
            icon={<AccessTimeOutlined sx={{ fontSize: 14 }} />}
            label="Deadline"
            value={fmtDate(campaign.deadline)}
            extra={
              remaining !== null ? (
                <Chip
                  label={remaining === 0 ? "Expired" : `${remaining}d left`}
                  size="small"
                  sx={{
                    ml: 1,
                    height: 18,
                    fontSize: "10px",
                    fontWeight: 700,
                    bgcolor: remaining === 0 ? "#FEF2F2" : "#F0FDF4",
                    color: remaining === 0 ? "#EF4444" : "#16A34A",
                  }}
                />
              ) : null
            }
          />
        )}
      </Box>
    </Box>
  );
};

// ─── InfoRow ──────────────────────────────────────────────────────────────────

const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  extra?: React.ReactNode;
}> = ({ icon, label, value, extra }) => (
  <Box sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}>
    <Box
      sx={{
        width: 26,
        height: 26,
        borderRadius: "7px",
        bgcolor: "#F3F4F6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#6B7280",
        flexShrink: 0,
        mt: 0.15,
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography
        sx={{
          fontSize: "10px",
          color: "#9CA3AF",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          mb: 0.25,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography sx={{ fontSize: "13px", color: "#111827", fontWeight: 600 }}>
          {value}
        </Typography>
        {extra}
      </Box>
    </Box>
  </Box>
);

export default CampaignDetailsCard;
