import React, { useState, useCallback } from "react";
import { Box, Button, Divider, Tooltip, Typography } from "@mui/material";
import { ContentCopyOutlined, LinkOutlined } from "@mui/icons-material";
import { Campaign } from "@/types/campaign";
import { STATUS_COLORS, TYPE_LABELS } from "@/constants/campaign";
import { fmtDate } from "@/utils/functions";

const CARD = { bgcolor: "#fff", borderRadius: 3, border: "1px solid #E5E7EB", p: 2.5 } as const;

interface Props {
  campaign: Campaign;
}

const CampaignSidebar: React.FC<Props> = ({ campaign }) => {
  const sc = STATUS_COLORS[campaign.status] || STATUS_COLORS.DRAFT;
  const showLink =
    campaign.linkToken &&
    (campaign.accessMethod === "LINK" || campaign.accessMethod === "BOTH");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {showLink && <CampaignLinkCard linkToken={campaign.linkToken!} />}
      <CampaignOverviewCard campaign={campaign} statusColor={sc.fg} />
    </Box>
  );
};

// ─── Campaign Link card ───────────────────────────────────────────────────────

const CampaignLinkCard: React.FC<{ linkToken: string }> = ({ linkToken }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(`${window.location.origin}/campaign/${linkToken}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [linkToken]);

  return (
    <Box sx={CARD}>
      <Typography sx={{ fontWeight: 700, fontSize: "13px", color: "#111827", mb: 1.5 }}>
        Campaign Link
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          bgcolor: "#F9FAFB",
          border: "1px solid #E5E7EB",
          borderRadius: 2,
          pl: 1.5,
          pr: 0.75,
          py: 0.75,
        }}
      >
        <LinkOutlined sx={{ fontSize: 13, color: "#9CA3AF", flexShrink: 0 }} />
        <Typography
          sx={{
            fontSize: "11px",
            color: "#6B7280",
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {`/campaign/${linkToken}`}
        </Typography>
        <Tooltip title={copied ? "Copied!" : "Copy link"}>
          <Button
            size="small"
            onClick={handleCopy}
            startIcon={<ContentCopyOutlined sx={{ fontSize: "12px !important" }} />}
            sx={{
              minWidth: 0,
              fontSize: "11px",
              fontWeight: 600,
              color: copied ? "#16A34A" : "#0D9488",
              bgcolor: copied ? "#F0FDF4" : "#F0FDFA",
              borderRadius: 1.5,
              px: 1.25,
              py: 0.4,
              textTransform: "none",
              flexShrink: 0,
              "&:hover": { bgcolor: copied ? "#DCFCE7" : "#CCFBF1" },
            }}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
};

// ─── Overview card ────────────────────────────────────────────────────────────

const CampaignOverviewCard: React.FC<{ campaign: Campaign; statusColor: string }> = ({
  campaign,
  statusColor,
}) => (
  <Box sx={CARD}>
    <Typography sx={{ fontWeight: 700, fontSize: "13px", color: "#111827", mb: 1.5 }}>
      Overview
    </Typography>
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <SidebarRow label="Status" value={campaign.status} color={statusColor} dot={statusColor} />
      <Divider sx={{ my: 1.25 }} />
      <SidebarRow label="Type" value={TYPE_LABELS[campaign.type]} />
      <Divider sx={{ my: 1.25 }} />
      <SidebarRow
        label="Module"
        value={`${campaign.module.type}`}
      />
      {campaign.targetDepartment && (
        <>
          <Divider sx={{ my: 1.25 }} />
          <SidebarRow label="Department" value={campaign.targetDepartment} />
        </>
      )}
      {campaign.deadline && (
        <>
          <Divider sx={{ my: 1.25 }} />
          <SidebarRow label="Deadline" value={fmtDate(campaign.deadline)} />
        </>
      )}
      <Divider sx={{ my: 1.25 }} />
      <SidebarRow label="Created" value={fmtDate(campaign.createdAt)} />
      <Divider sx={{ my: 1.25 }} />
      <SidebarRow label="Updated" value={fmtDate(campaign.updatedAt)} />
    </Box>
  </Box>
);

// ─── SidebarRow ───────────────────────────────────────────────────────────────

const SidebarRow: React.FC<{
  label: string;
  value: string;
  color?: string;
  dot?: string;
}> = ({ label, value, color, dot }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <Typography sx={{ fontSize: "12px", color: "#6B7280" }}>{label}</Typography>
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      {dot && <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: dot, flexShrink: 0 }} />}
      <Typography sx={{ fontSize: "12px", fontWeight: 600, color: color || "#111827" }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

export default CampaignSidebar;
