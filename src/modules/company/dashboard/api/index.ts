import axiosInstance from "@/utils/axiosInstance";
import type {
  KpiFilterParams, KpiActionsData, KpiFunnelData,
  KpiVelocityData, KpiSourcingData, KpiRoiData,
  PostsStatusParams, PostsStatusResult, KpiPostOption,
} from "../types";

const qs = (p: Record<string, string | number | undefined | null>) => {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(p)) {
    if (v != null && v !== "") q.set(k, String(v));
  }
  return q.toString() ? `?${q}` : "";
};

const sel = <T>(res: { data: any }): T => res.data?.data ?? res.data;

export const fetchKpiActions = (params: KpiFilterParams): Promise<KpiActionsData> =>
  axiosInstance.get(`job-applications/company/my/kpi/actions${qs(params)}`).then(sel);

export const fetchKpiFunnel = (params: KpiFilterParams): Promise<KpiFunnelData> =>
  axiosInstance.get(`job-applications/company/my/kpi/funnel${qs(params)}`).then(sel);

export const fetchKpiVelocity = (params: KpiFilterParams): Promise<KpiVelocityData> =>
  axiosInstance.get(`job-applications/company/my/kpi/velocity${qs(params)}`).then(sel);

export const fetchKpiSourcing = (params: KpiFilterParams): Promise<KpiSourcingData> =>
  axiosInstance.get(`job-applications/company/my/kpi/sourcing${qs(params)}`).then(sel);

export const fetchKpiRoi = (): Promise<KpiRoiData> =>
  axiosInstance.get("job-applications/company/my/kpi/roi").then(sel);

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
