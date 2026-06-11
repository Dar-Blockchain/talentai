"use client";

import React, { memo, useMemo } from "react";
import { Box } from "@mui/material";
import CampaignOutlined       from "@mui/icons-material/CampaignOutlined";
import CheckCircleOutline     from "@mui/icons-material/CheckCircleOutline";
import EditNoteOutlined       from "@mui/icons-material/EditNoteOutlined";
import HourglassEmptyOutlined from "@mui/icons-material/HourglassEmptyOutlined";
import StatCard               from "@/components/ui/StatCard";
import StatsSkeleton          from "./StatsSkeleton";
import { useTranslation }     from "react-i18next";
import { useCampaignMetricsQuery } from "../../queries";

const GRID_SX = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
  gap: 2,
} as const;

const ICON_SX = { fontSize: 18 } as const;

const CampaignsStats: React.FC = memo(() => {
  const { t } = useTranslation("dashboard");
  const p = "pages.campaigns.stats";

  const { data: metrics, isLoading } = useCampaignMetricsQuery();

  const closedExpired = useMemo(
    () => (metrics ? metrics.closed + metrics.expired : 0),
    [metrics?.closed, metrics?.expired],
  );

  if (isLoading || !metrics) return <StatsSkeleton />;

  return (
    <Box sx={GRID_SX}>
      <StatCard icon={<CampaignOutlined       sx={ICON_SX} />} label={t(`${p}.total`)}          value={metrics.total}  color="#6B7280" />
      <StatCard icon={<CheckCircleOutline     sx={ICON_SX} />} label={t(`${p}.active`)}          value={metrics.active} color="#10B981" />
      <StatCard icon={<EditNoteOutlined       sx={ICON_SX} />} label={t(`${p}.drafts`)}          value={metrics.draft}  color="#3B82F6" />
      <StatCard icon={<HourglassEmptyOutlined sx={ICON_SX} />} label={t(`${p}.closed_expired`)}  value={closedExpired}  color="#8B5CF6" />
    </Box>
  );
});

CampaignsStats.displayName = "CampaignsStats";
export default CampaignsStats;
