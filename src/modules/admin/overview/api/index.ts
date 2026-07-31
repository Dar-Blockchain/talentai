import axiosInstance from "@/utils/axiosInstance";
import { apiCall } from "@/utils/apiCall";
import { AdminDashboardStats, AdminMapUser, UserGrowthPoint, AdminRevenueSummary, RecentSignup } from "../types";

const defaultStats: AdminDashboardStats = {
  users: 0,
  posts: 0,
  jobAssessments: 0,
  jobAssessmentsWithScore: 0,
  jobAssessmentsWithScorePercentage: 0,
  feedback: 0,
  avgOverallScore: 0,
  totalSkills: 0,
  totalHardSkills: 0,
  totalSoftSkills: 0,
  hardSkillsPercentage: 0,
  softSkillsPercentage: 0,
  topSkills: [],
};

export const adminOverviewApi = {
  fetchStats: () =>
    apiCall(
      async () => {
        const { data } = await axiosInstance.get("dashboard/getCounts");
        return (data?.success && data?.data ? data.data : defaultStats) as AdminDashboardStats;
      },
      "Failed to load dashboard stats.",
    ),

  fetchAllUsersForMap: () =>
    apiCall(
      async () => {
        const { data } = await axiosInstance.get("dashboard/getAllUsers", { params: { limit: 1000 } });
        return (data?.users ?? []) as AdminMapUser[];
      },
      "Failed to load users for map.",
    ),

  fetchUserGrowthData: () =>
    apiCall(
      async () => {
        const { data } = await axiosInstance.get("dashboard/getUserCountsByDay");
        if (!data?.success || !data?.data) return [] as UserGrowthPoint[];

        const processedData: UserGrowthPoint[] = data.data.usersCreatedByDay.map((item: { day: string; userCount: number }) => ({
          day: new Date(item.day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          users: item.userCount,
          posts: 0,
          assessments: 0,
          fullDate: item.day,
        }));

        (data.data.postsCreatedByDay || []).forEach((postItem: { day: string; postCount: number }) => {
          const existing = processedData.find((i) => i.fullDate === postItem.day);
          if (existing) {
            existing.posts = postItem.postCount;
          } else {
            processedData.push({
              day: new Date(postItem.day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              users: 0, posts: postItem.postCount, assessments: 0, fullDate: postItem.day,
            });
          }
        });

        (data.data.jobAssessmentsCreatedByDay || []).forEach((a: { day: string; jobAssessmentCount: number }) => {
          const existing = processedData.find((i) => i.fullDate === a.day);
          if (existing) {
            existing.assessments = a.jobAssessmentCount;
          } else {
            processedData.push({
              day: new Date(a.day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              users: 0, posts: 0, assessments: a.jobAssessmentCount, fullDate: a.day,
            });
          }
        });

        processedData.sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
        return processedData;
      },
      "Failed to load user growth data.",
    ),

  fetchRevenueSummary: () =>
    apiCall(
      async () => {
        const { data } = await axiosInstance.get("dashboard/adminRevenueSummary");
        return (data?.data ?? { mrr: 0, totalActiveSubscriptions: 0, byPlan: [] }) as AdminRevenueSummary;
      },
      "Failed to load revenue summary.",
    ),

  fetchRecentSignups: (limit = 8) =>
    apiCall(
      async () => {
        const { data } = await axiosInstance.get("dashboard/recentSignups", { params: { limit } });
        return (data?.data ?? []) as RecentSignup[];
      },
      "Failed to load recent signups.",
    ),
};
