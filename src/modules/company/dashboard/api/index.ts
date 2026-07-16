import axiosInstance from "@/utils/axiosInstance";
import type {
  KpiFilterParams, KpiFunnelData,
  KpiSourcingData, KpiRoiData,
  PostsStatusParams, PostsStatusResult, KpiPostOption,
  ApplicationHistoryData,
} from "../types";

const qs = (p: object) => {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(p) as [string, unknown][]) {
    if (v != null && v !== "") q.set(k, String(v));
  }
  return q.toString() ? `?${q}` : "";
};

const sel = (res: { data: any }): any => res.data?.data ?? res.data;

export const fetchKpiHistory = (params: KpiFilterParams): Promise<ApplicationHistoryData> =>
  axiosInstance.get(`job-applications/company/my/kpi/history${qs({ ...params, limit: 4 })}`).then(sel);

export const fetchKpiFunnel = (params: KpiFilterParams): Promise<KpiFunnelData> =>
  axiosInstance.get(`job-applications/company/my/kpi/funnel${qs(params)}`).then(sel);

export const fetchKpiSourcing = (params: KpiFilterParams): Promise<KpiSourcingData> =>
  axiosInstance.get(`job-applications/company/my/kpi/sourcing${qs(params)}`).then(sel);

export const fetchKpiRoi = (params: KpiFilterParams): Promise<KpiRoiData> =>
  axiosInstance.get(`job-applications/company/my/kpi/roi${qs(params)}`).then(sel);

export const fetchKpiPostsForFilter = async (): Promise<KpiPostOption[]> => {
  const res  = await axiosInstance.get("post/my-posts?limit=100");
  const raw  = res.data?.results ?? res.data?.data ?? res.data ?? [];
  const arr  = Array.isArray(raw) ? raw : [];
  return arr.map((p: any) => ({
    id:    String(p._id ?? p.id),
    title: p.jobDetails?.title ?? p.title ?? "Untitled",
  }));
};

export const fetchKpiPostsStatus = async (params: PostsStatusParams): Promise<PostsStatusResult> => {
  const res = await axiosInstance.get(`post/kpi/status-by-post${qs(params)}`);
  return {
    data:       res.data?.data       ?? [],
    pagination: res.data?.pagination ?? { currentPage: 1, totalPages: 1, totalCount: 0 },
  };
};

export const fetchDashboardStats = (params: KpiFilterParams) =>
  axiosInstance.get(`dashboard/statsCards${qs(params)}`).then(sel);

export const fetchAppMetrics = (params: KpiFilterParams) =>
  axiosInstance.get(`job-applications/company/my/metrics${qs(params)}`).then(sel);
