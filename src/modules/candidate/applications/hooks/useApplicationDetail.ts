import { useApplicationDetailQuery } from "../queries";

export function useApplicationDetail(id: string | string[] | undefined) {
  const normalizedId = typeof id === "string" ? id : undefined;
  const { data: app, isLoading: loading } = useApplicationDetailQuery(normalizedId);

  return { app: app ?? null, loading };
}
