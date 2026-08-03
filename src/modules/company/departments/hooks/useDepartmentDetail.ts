import { useDepartmentQuery } from "../queries";
import { extractAxiosErrorMessage } from "../utils/departmentI18n";
import type { Department } from "../types";

export interface UseDepartmentDetailReturn {
  department: Department | null;
  loading:    boolean;
  error:      string | null;
}

export const useDepartmentDetail = (id: string | null): UseDepartmentDetailReturn => {
  const { data, isLoading, error } = useDepartmentQuery(id);

  return {
    department: data ?? null,
    loading:    isLoading,
    error:      error ? (extractAxiosErrorMessage(error) ?? null) : null,
  };
};
