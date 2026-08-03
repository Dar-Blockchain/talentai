import { useCallback, useMemo, useState } from "react";
import type { StatusFilter, SortOption } from "../types";
import { useMyPostsQuery } from "../queries";

const STATUS_MAP: Record<StatusFilter, string | undefined> = {
  all: undefined, active: "open", draft: "draft", expired: "closed",
};
const SORT_MAP: Record<SortOption, string> = {
  newest: "newest", oldest: "oldest", "title-asc": "title_asc", "title-desc": "title_desc",
};

export const useMyPosts = ({ initialPage = 1, limit = 9 } = {}) => {
  const [page,         setPage]         = useState(initialPage);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy,       setSortBy]       = useState<SortOption>("newest");

  const params = useMemo(() => ({
    page, limit,
    search: search || undefined,
    sort:   SORT_MAP[sortBy],
    status: STATUS_MAP[statusFilter],
  }), [page, limit, search, sortBy, statusFilter]);

  const { data, isLoading, error, refetch } = useMyPostsQuery(params);

  const resetPage = useCallback(() => setPage(1), []);

  const handleSearchChange = useCallback((v: string)       => { setSearch(v);       resetPage(); }, [resetPage]);
  const handleStatusChange = useCallback((v: StatusFilter) => { setStatusFilter(v); resetPage(); }, [resetPage]);
  const handleSortChange   = useCallback((v: SortOption)   => { setSortBy(v);       resetPage(); }, [resetPage]);

  return {
    posts:      data?.posts      ?? [],
    pagination: data?.pagination ?? null,
    loading:    isLoading,
    error:      error ? String(error) : null,
    page, search, statusFilter, sortBy,
    hasFilters: !!search || statusFilter !== "all",
    setPage,
    handleSearchChange, handleStatusChange, handleSortChange,
    reload: refetch,
  };
};
