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

  // No pagination UI is built on this hook — every consumer (dropdowns,
  // badges, charts) expects the full department list, so request the
  // backend's max page size instead of its 20-item default.
  const { data, isLoading, error } = useDepartmentsQuery({
    limit: 100,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  });

  return {
    departments: data?.data ?? [],
    total:       data?.pagination?.total ?? 0,
    loading:     isLoading,
    error:       error ? (extractAxiosErrorMessage(error) ?? null) : null,
    search,
    onSearch:    handleSearch,
  };
};
