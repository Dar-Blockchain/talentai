"use client";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { StatCard } from "../KpiAtoms";
import { useCampaignsAnalytics } from "../../hooks/useCampaignsAnalytics";
import {
  Megaphone as CampaignOutlined,
  Users as GroupsOutlined,
  CheckCircle2 as CheckCircleOutlined,
  Sparkles as SparklesOutlined,
} from "lucide-react";

const CampaignsStatCards = memo(() => {
  const { t } = useTranslation("dashboard");
  const { data, isLoading } = useCampaignsAnalytics();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        icon={CampaignOutlined}
        color="#F59E0B" bg="#FFFBEB"
        loading={isLoading} value={data?.totalCampaigns ?? 0}
        label={t("campaigns_dashboard.stat.total_campaigns", "Total Campaigns")}
        href="/company/campaigns"
      />
      <StatCard
        icon={GroupsOutlined}
        color="#0EA5E9" bg="#F0F9FF"
        loading={isLoading} value={data?.participants.total ?? 0}
        label={t("campaigns_dashboard.stat.total_participants", "Total Participants")}
      />
      <StatCard
        icon={CheckCircleOutlined}
        color="#10B981" bg="#F0FDF4"
        loading={isLoading} value={`${data?.participants.completionRate ?? 0}%`}
        label={t("campaigns_dashboard.stat.completion_rate", "Completion Rate")}
      />
      <StatCard
        icon={SparklesOutlined}
        color="#A855F7" bg="#FDF4FF"
        loading={isLoading}
        value={data?.avgScore != null ? `${data.avgScore}%` : t("campaigns_dashboard.stat.not_enough_data", "N/A")}
        label={t("campaigns_dashboard.stat.avg_score", "Avg. AI Score")}
      />
    </div>
  );
});
CampaignsStatCards.displayName = "CampaignsStatCards";
export default CampaignsStatCards;
