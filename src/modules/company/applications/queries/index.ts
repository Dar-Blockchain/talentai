import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const APPLICATION_QUERY_KEYS = {
  summary: (params: ApplicationListParams) => ["applications", "summary", params] as const,
  metrics: ()                              => ["applications", "metrics"]         as const,
  posts:   (params: PostPickerParams)      => ["my-posts", params]                as const,
};

// ─── Param types ──────────────────────────────────────────────────────────────

export interface ApplicationListParams {
  search?: string;
  status?: string;
  postId?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface PostPickerParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface PostPickerItem {
  _id?: string;
  id?: string;
  title?: string;
  createdAt?: string;
  jobDetails?: { title?: string; employmentType?: string };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export const useApplicationsSummaryQuery = (params: ApplicationListParams) =>
  useQuery({
    queryKey: APPLICATION_QUERY_KEYS.summary(params),
    queryFn:  async () => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") query.set(k, String(v));
      });
      const { data } = await axiosInstance.get(
        `job-applications/company/my/summary${query.toString() ? `?${query}` : ""}`,
      );
      return {
        data:       (data.data       ?? []) as import("@/store/slices/jobApplicationSlice").ApplicationSummaryItem[],
        pagination: (data.pagination ?? { currentPage: 1, totalPages: 1, totalCount: 0 }) as {
          currentPage: number; totalPages: number; totalCount: number;
        },
      };
    },
    staleTime:       30 * 1000,
    placeholderData: (prev) => prev,
  });

export const useApplicationMetricsQuery = () =>
  useQuery({
    queryKey: APPLICATION_QUERY_KEYS.metrics(),
    queryFn:  async () => {
      const { data } = await axiosInstance.get("job-applications/company/my/metrics");
      return data?.data ?? data;
    },
    staleTime: 60 * 1000,
  });

export const useMyPostsPickerQuery = (params: PostPickerParams, enabled: boolean) =>
  useQuery({
    queryKey: APPLICATION_QUERY_KEYS.posts(params),
    queryFn:  async () => {
      const query = new URLSearchParams({
        page:  String(params.page  ?? 1),
        limit: String(params.limit ?? 8),
        ...(params.search ? { search: params.search } : {}),
      });
      const { data } = await axiosInstance.get(`post/my-posts?${query}`);
      return {
        posts:      (data.results ?? []) as PostPickerItem[],
        totalPages: (data.totalPages ?? 1) as number,
      };
    },
    enabled,
    staleTime:       60 * 1000,
    placeholderData: (prev) => prev,
  });
