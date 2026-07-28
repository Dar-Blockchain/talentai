"use client";

import React, { memo } from "react";
import { Megaphone, CheckCircle2, FileText, Pause } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCampaignMetricsQuery } from "../../queries";
import CampaignStatsRow, { CampaignStatItem } from "./CampaignStatsRow";

const STAT_DEFS = [
  { key: "total",  Icon: Megaphone,    color: "#6B7280" },
  { key: "active", Icon: CheckCircle2, color: "#10B981" },
  { key: "drafts", Icon: FileText,     color: "#3B82F6" },
  { key: "paused", Icon: Pause,        color: "#F59E0B" },
] as const;

const CampaignsStats: React.FC = memo(() => {
  const { t } = useTranslation("dashboard");
  const p = "pages.campaigns.stats";

  const { data: metrics, isLoading } = useCampaignMetricsQuery();

  const values: Record<string, number> = {
    total:  metrics?.total  ?? 0,
    active: metrics?.active ?? 0,
    drafts: metrics?.draft  ?? 0,
    paused: metrics?.paused ?? 0,
  };

  const items: CampaignStatItem[] = STAT_DEFS.map(({ key, Icon, color }) => ({
    key, icon: Icon, color, value: values[key], label: t(`${p}.${key}`),
  }));

  return <CampaignStatsRow items={items} loading={isLoading || !metrics} />;
});

CampaignsStats.displayName = "CampaignsStats";
export default CampaignsStats;
