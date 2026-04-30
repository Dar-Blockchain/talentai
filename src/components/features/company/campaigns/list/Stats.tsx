"use client";

import React, { memo, useEffect } from "react";
import { Box } from "@mui/material";
import CampaignOutlined from "@mui/icons-material/CampaignOutlined";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import EditNoteOutlined from "@mui/icons-material/EditNoteOutlined";
import HourglassEmptyOutlined from "@mui/icons-material/HourglassEmptyOutlined";
import { useSelector } from "react-redux";
import { fetchCampaignMetrics, selectCampaignMetrics, selectCampaignMetricsLoading } from "@/store/slices/campaignSlice";
import StatCard from "@/components/ui/StatCard";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import StatsSkeleton from "./StatsSkeleton";
import { useTranslation } from "react-i18next";

const CampaignsStats: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const p = "pages.campaigns.stats";
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchCampaignMetrics());
  }, [dispatch]);

  const metrics = useSelector(selectCampaignMetrics);
  const loading = useSelector(selectCampaignMetricsLoading);

  if (loading || !metrics) return <StatsSkeleton />;

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
        label={t(`${p}.total`)}
        value={metrics.total}
        color="#6B7280"
      />

      <StatCard
        icon={<CheckCircleOutline sx={{ fontSize: 18 }} />}
        label={t(`${p}.active`)}
        value={metrics.active}
        color="#10B981"
      />

      <StatCard
        icon={<EditNoteOutlined sx={{ fontSize: 18 }} />}
        label={t(`${p}.drafts`)}
        value={metrics.draft}
        color="#3B82F6"
      />

      <StatCard
        icon={<HourglassEmptyOutlined sx={{ fontSize: 18 }} />}
        label={t(`${p}.closed_expired`)}
        value={metrics.closed + metrics.expired}
        color="#8B5CF6"
      />
    </Box>
  );
};

export default memo(CampaignsStats);
