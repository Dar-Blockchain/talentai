import axiosInstance from "@/utils/axiosInstance";
import type {
  KpiFilterParams, KpiFunnelData,
  KpiSourcingData, KpiRoiData, KpiHoursComparisonData, HoursComparisonParams,
  KpiCostComparisonData, CostComparisonParams,
  PostsStatusParams, PostsStatusResult, KpiPostOption,
  ApplicationHistoryData, ApplicationHistoryParams, ApplicationHistoryResult, KpiDepartmentData,
} from "../types";

const qs = (p: object) => {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(p) as [string, unknown][]) {
    if (v != null && v !== "") q.set(k, String(v));
  }
  return q.toString() ? `?${q}` : "";
};

// The API sometimes wraps the payload as `{ data: T }` and sometimes returns `T`
// directly; the precise shape (T) is determined by each call site's declared
// return type, so we accept `unknown` here and let the caller's annotation drive it.
const sel = <T,>(res: { data: unknown }): T => {
  const body = res.data as { data?: T } | undefined;
  return (body?.data ?? body) as T;
};

export const fetchKpiHistory = (params: KpiFilterParams): Promise<ApplicationHistoryData> =>
  axiosInstance.get(`job-applications/company/my/kpi/history${qs({ ...params, limit: 4 })}`).then(sel<ApplicationHistoryData>);

export const fetchKpiHistoryPaged = async (params: ApplicationHistoryParams): Promise<ApplicationHistoryResult> => {
  const res = await axiosInstance.get(`job-applications/company/my/kpi/history${qs({ page: 1, limit: 20, ...params })}`);
  return {
    data:       res.data?.data       ?? [],
    pagination: res.data?.pagination ?? { currentPage: 1, totalPages: 1, totalCount: 0, limit: 20, hasNextPage: false, hasPrevPage: false },
  };
};

export const fetchKpiFunnel = (params: KpiFilterParams): Promise<KpiFunnelData> =>
  axiosInstance.get(`job-applications/company/my/kpi/funnel${qs(params)}`).then(sel<KpiFunnelData>);

export const fetchKpiSourcing = (params: KpiFilterParams): Promise<KpiSourcingData> =>
  axiosInstance.get(`job-applications/company/my/kpi/sourcing${qs(params)}`).then(sel<KpiSourcingData>);

export const fetchKpiRoi = (params: KpiFilterParams): Promise<KpiRoiData> =>
  axiosInstance.get(`job-applications/company/my/kpi/roi${qs(params)}`).then(sel<KpiRoiData>);

export const fetchKpiHoursComparison = (params: HoursComparisonParams): Promise<KpiHoursComparisonData> =>
  axiosInstance.get(`job-applications/company/my/kpi/hours-comparison${qs(params)}`).then(sel<KpiHoursComparisonData>);

export const fetchKpiCostComparison = (params: CostComparisonParams): Promise<KpiCostComparisonData> =>
  axiosInstance.get(`job-applications/company/my/kpi/cost-comparison${qs(params)}`).then(sel<KpiCostComparisonData>);

type RawPostOption = { _id?: string; id?: string; jobDetails?: { title?: string }; title?: string };

export const fetchKpiPostsForFilter = async (): Promise<KpiPostOption[]> => {
  const res  = await axiosInstance.get("post/my-posts?limit=100");
  const raw  = res.data?.results ?? res.data?.data ?? res.data ?? [];
  const arr: RawPostOption[] = Array.isArray(raw) ? raw : [];
  return arr.map((p) => ({
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

export const fetchKpiJobsByDepartment = (): Promise<KpiDepartmentData> =>
  axiosInstance.get("post/kpi/by-department").then(sel<KpiDepartmentData>);
