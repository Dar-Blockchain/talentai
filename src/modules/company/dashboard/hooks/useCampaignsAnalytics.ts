import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";

export interface CampaignTrendPoint { date: string; count: number }

export interface CampaignRecentActivityItem {
  id: string;
  campaignId: string | null;
  campaignTitle: string;
  moduleType: "QUESTIONNAIRE" | "AI_INTERVIEW" | "SKILL_TEST" | "TRAINING_PATH" | null;
  participantName: string;
  completedAt: string;
  score: number | null;
}

export interface CampaignsAnalytics {
  totalCampaigns: number;
  moduleTypes: {
    QUESTIONNAIRE: number;
    AI_INTERVIEW: number;
    SKILL_TEST: number;
    TRAINING_PATH: number;
  };
  participants: {
    total: number;
    completed: number;
    inProgress: number;
    invited: number;
    dropped: number;
    completionRate: number;
  };
  avgScore: number | null;
  trend: CampaignTrendPoint[];
  recentActivity: CampaignRecentActivityItem[];
}

const STALE = 60_000;
const sel = (r: any) => r.data?.data ?? r.data;
const fetchCampaignsAnalytics = (): Promise<CampaignsAnalytics> =>
  axiosInstance.get("internal-campaigns/analytics").then(sel);

export const useCampaignsAnalytics = () =>
  useQuery({ queryKey: ["campaignsDashboard", "analytics"], queryFn: fetchCampaignsAnalytics, staleTime: STALE });
