import axiosInstance from "@/utils/axiosInstance";
import type {
  KpiFilterParams, KpiActionsData, KpiFunnelData,
  KpiVelocityData, KpiSourcingData, KpiRoiData,
  PostsStatusParams, PostsStatusResult, KpiPostOption,
} from "../types";

const qs = (p: Record<string, string | number | undefined>) => {
  const q = new URLSearchParams();
  Object.entries(p).forEach(([k, v]) => { if (v !== undefined && v !== "" && v !== null) q.set(k, String(v)); });
  return q.toString() ? `?${q}` : "";
};

export const fetchKpiActions = async (params: KpiFilterParams): Promise<KpiActionsData> => {
  const res = await axiosInstance.get(`job-applications/company/my/kpi/actions${qs(params as Record<string, string>)}`);
  return res.data?.data ?? res.data;
};

export const fetchKpiFunnel = async (params: KpiFilterParams): Promise<KpiFunnelData> => {
  const res = await axiosInstance.get(`job-applications/company/my/kpi/funnel${qs(params as Record<string, string>)}`);
  return res.data?.data ?? res.data;
};

export const fetchKpiVelocity = async (params: KpiFilterParams): Promise<KpiVelocityData> => {
  const res = await axiosInstance.get(`job-applications/company/my/kpi/velocity${qs(params as Record<string, string>)}`);
  return res.data?.data ?? res.data;
};

export const fetchKpiSourcing = async (params: KpiFilterParams): Promise<KpiSourcingData> => {
  const res = await axiosInstance.get(`job-applications/company/my/kpi/sourcing${qs(params as Record<string, string>)}`);
  return res.data?.data ?? res.data;
};

export const fetchKpiRoi = async (): Promise<KpiRoiData> => {
  const res = await axiosInstance.get("job-applications/company/my/kpi/roi");
  return res.data?.data ?? res.data;
};

export const fetchKpiPostsForFilter = async (): Promise<KpiPostOption[]> => {
  const res = await axiosInstance.get("post/my-posts?limit=100");
  const posts = res.data?.results ?? res.data?.data ?? res.data ?? [];
  const arr = Array.isArray(posts) ? posts : [];
  return arr.map((p: any) => ({
    id:    String(p._id ?? p.id),
    title: p.jobDetails?.title ?? p.title ?? "Untitled",
  }));
};

export const fetchKpiPostsStatus = async (params: PostsStatusParams): Promise<PostsStatusResult> => {
  const res = await axiosInstance.get(`post/kpi/status-by-post${qs(params as Record<string, string | number>)}`);
  return {
    data:       res.data?.data       ?? [],
    pagination: res.data?.pagination ?? { currentPage: 1, totalPages: 1, totalCount: 0 },
  };
};
