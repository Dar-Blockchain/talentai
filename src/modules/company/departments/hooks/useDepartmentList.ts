import { useState, useRef, useCallback } from "react";
import { extractAxiosErrorMessage } from "../utils/departmentI18n";
import { useDepartmentsQuery } from "../queries";
import type { Department } from "../types";

export interface UseDepartmentListReturn {
  departments: Department[];
  total:       number;
  loading:     boolean;
  error:       string | null;
  search:      string;
  onSearch:    (val: string) => void;
}

export const useDepartmentList = (): UseDepartmentListReturn => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(val), 400);
  }, []);

  const { data, isLoading, error } = useDepartmentsQuery(
    debouncedSearch ? { search: debouncedSearch } : undefined,
  );

  return {
    departments: data?.data ?? [],
    total:       data?.pagination?.total ?? 0,
    loading:     isLoading,
    error:       error ? (extractAxiosErrorMessage(error) ?? null) : null,
    search,
    onSearch:    handleSearch,
  };
};
