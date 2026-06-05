import type { DepartmentsQueryParams } from "../types";

export const departmentKeys = {
  all:     ["departments"] as const,
  lists:   () => [...departmentKeys.all, "list"] as const,
  list:    (params?: DepartmentsQueryParams) =>
    [...departmentKeys.lists(), params ?? {}] as const,
  details: () => [...departmentKeys.all, "detail"] as const,
  detail:  (id: string) => [...departmentKeys.details(), id] as const,
  stats:   () => [...departmentKeys.all, "stats"] as const,
} as const;
