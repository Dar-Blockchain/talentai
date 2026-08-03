import { useJobDetailQuery } from "../queries";

export const useJobDetail = (jobId: string | undefined) => {
  const { data: job, isLoading, error } = useJobDetailQuery(jobId);
  return { job: job ?? null, loading: isLoading, error: error ? String(error) : null };
};
