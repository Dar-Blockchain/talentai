import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  fetchMyPosts,
  selectMyPosts,
  selectMyPostsLoading,
  selectMyPostsError,
  selectMyPostsPagination,
} from "@/store/slices/postSlice";
import type { StatusFilter, SortOption, TypeFilter } from "../types";

interface UseMyPostsOptions {
  initialPage?: number;
  limit?: number;
}

export const useMyPosts = ({ initialPage = 1, limit = 8 }: UseMyPostsOptions = {}) => {
  const dispatch   = useDispatch<AppDispatch>();
  const posts      = useSelector(selectMyPosts);
  const loading    = useSelector(selectMyPostsLoading);
  const error      = useSelector(selectMyPostsError);
  const pagination = useSelector(selectMyPostsPagination);

  const [page,         setPage]         = useState(initialPage);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter,   setTypeFilter]   = useState<TypeFilter>("all");
  const [sortBy,       setSortBy]       = useState<SortOption>("newest");

  const apiStatus = statusFilter === "all"     ? undefined
                  : statusFilter === "active"  ? "open"
                  : statusFilter === "draft"   ? "draft"
                  : statusFilter === "expired" ? "closed"
                  : undefined;

  const apiSort = sortBy === "title-asc"  ? "title_asc"
                : sortBy === "title-desc" ? "title_desc"
                : sortBy;

  const load = useCallback(() => {
    dispatch(fetchMyPosts({
      page,
      limit,
      search:       search       || undefined,
      sort:         apiSort,
      status:       apiStatus,
      creationType: typeFilter !== "all" ? typeFilter : undefined,
    }));
  }, [dispatch, page, limit, search, apiSort, apiStatus, typeFilter]);

  useEffect(() => { load(); }, [load]);

  const resetPage = () => setPage(1);

  const handleSearchChange = (v: string)       => { setSearch(v);       resetPage(); };
  const handleStatusChange = (v: StatusFilter) => { setStatusFilter(v); resetPage(); };
  const handleTypeChange   = (v: TypeFilter)   => { setTypeFilter(v);   resetPage(); };
  const handleSortChange   = (v: SortOption)   => { setSortBy(v);       resetPage(); };

  const hasFilters = !!search || statusFilter !== "all" || typeFilter !== "all";

  return {
    posts, loading, error, pagination,
    page, search, statusFilter, typeFilter, sortBy,
    hasFilters,
    setPage,
    handleSearchChange,
    handleStatusChange,
    handleTypeChange,
    handleSortChange,
    reload: load,
  };
};
