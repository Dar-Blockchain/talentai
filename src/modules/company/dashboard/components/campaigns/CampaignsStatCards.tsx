"use client";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { StatCard } from "../KpiAtoms";
import { useCampaignsAnalytics } from "../../hooks/useCampaignsAnalytics";
import {
  Megaphone as CampaignOutlined,
  Users as GroupsOutlined,
  CheckCircle2 as CheckCircleOutlined,
  Zap as ZapOutlined,
} from "lucide-react";

const selMetrics = (r: any) => r.data?.data ?? r.data;
const fetchCampaignMetrics = () => axiosInstance.get("internal-campaigns/metrics").then(selMetrics);

const CampaignsStatCards = memo(() => {
  const { t } = useTranslation("dashboard");
  const { data, isLoading } = useCampaignsAnalytics();
  // Same queryKey CampaignsStatusOverview uses for this same endpoint — React
  // Query dedupes/shares the cache entry since both widgets render together
  // on this page, so this doesn't cost a second network request.
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["teamDashboard", "campaignMetrics"], queryFn: fetchCampaignMetrics, staleTime: 60_000,
  });

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
        icon={ZapOutlined}
        color="#A855F7" bg="#FDF4FF"
        loading={metricsLoading} value={metrics?.active ?? 0}
        label={t("campaigns_dashboard.stat.active_campaigns", "Active Campaigns")}
        href="/company/campaigns"
      />
    </div>
  );
});
CampaignsStatCards.displayName = "CampaignsStatCards";
export default CampaignsStatCards;
