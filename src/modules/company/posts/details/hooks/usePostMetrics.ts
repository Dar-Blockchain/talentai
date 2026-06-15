import { usePostMetricsQuery } from "@/modules/company/posts/list/queries";

export const usePostMetrics = () => {
  const { data: metrics, isLoading } = usePostMetricsQuery();
  return { metrics: metrics ?? null, loading: isLoading };
};
