"use client";

import React, { memo } from "react";
import { Box } from "@mui/material";
import CampaignOutlined from "@mui/icons-material/CampaignOutlined";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import EditNoteOutlined from "@mui/icons-material/EditNoteOutlined";
import HourglassEmptyOutlined from "@mui/icons-material/HourglassEmptyOutlined";
import { useSelector } from "react-redux";
import { selectCampaigns } from "@/store/slices/campaignSlice";
import StatCard from "@/components/ui/StatCard";

const CampaignsStats: React.FC = () => {
  const campaigns = useSelector(selectCampaigns);

  const total = campaigns.length;
  const active = campaigns.filter(c => c.status === "ACTIVE").length;
  const drafts = campaigns.filter(c => c.status === "DRAFT").length;
  const closed = campaigns.filter(
    c => c.status === "CLOSED" || c.status === "EXPIRED"
  ).length;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
        gap: 2,
      }}
    >
      <StatCard
        icon={<CampaignOutlined sx={{ fontSize: 18 }} />}
        label="Total"
        value={total}
        color="#6B7280"
      />

      <StatCard
        icon={<CheckCircleOutline sx={{ fontSize: 18 }} />}
        label="Active"
        value={active}
        color="#10B981"
      />

      <StatCard
        icon={<EditNoteOutlined sx={{ fontSize: 18 }} />}
        label="Drafts"
        value={drafts}
        color="#3B82F6"
      />

      <StatCard
        icon={<HourglassEmptyOutlined sx={{ fontSize: 18 }} />}
        label="Closed"
        value={closed}
        color="#8B5CF6"
      />
    </Box>
  );
};

export default memo(CampaignsStats);