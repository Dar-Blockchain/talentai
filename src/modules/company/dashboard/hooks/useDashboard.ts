import { useState, useCallback, useMemo } from "react";
import {
  useKpiHistoryQuery, useKpiFunnelQuery,
  useKpiSourcingQuery, useKpiPostsQuery,
  useKpiPostsStatusQuery, useKpiStatCardsQuery, useKpiAppMetricsQuery,
} from "../queries";
import type { PostsSortColumn } from "../types";

export const POSTS_PAGE_SIZE = 4;
const PAGE_SIZE = POSTS_PAGE_SIZE;

export const useDashboard = () => {
  const [postId,     setPostId]     = useState<string>("");
  const [dateFrom,   setDateFrom]   = useState<string>("");
  const [activeDays, setActiveDays] = useState<number | null>(null);
  const [statusPage, setStatusPage] = useState(1);

  // Posts Overview — clicking a column header cycles its sort (asc → desc →
  // none). Only one column is ever sorted at a time.
  const [sortBy,  setSortBy]  = useState<PostsSortColumn | "">("");
  const [sortDir, setSortDir] = useState<"" | "asc" | "desc">("");

  const filterParams = useMemo(
    () => ({ ...(postId   ? { postId }   : {}), ...(dateFrom ? { dateFrom } : {}) }),
    [postId, dateFrom],
  );

  const statusParams = useMemo(
    () => ({
      ...filterParams,
      page: statusPage,
      limit: PAGE_SIZE,
      ...(sortBy && sortDir ? { sortBy, sortDir } : {}),
    }),
    [filterParams, statusPage, sortBy, sortDir],
  );

  const historyQ     = useKpiHistoryQuery(filterParams);
  const funnelQ      = useKpiFunnelQuery(filterParams);
  const sourcingQ    = useKpiSourcingQuery(filterParams);
  const postsQ       = useKpiPostsQuery();
  const postsStatusQ = useKpiPostsStatusQuery(statusParams);
  const statCardsQ   = useKpiStatCardsQuery(filterParams);
  const appMetricsQ  = useKpiAppMetricsQuery(filterParams);

  const handlePostChange = useCallback((id: string) => {
    setPostId(id);
    setStatusPage(1);
  }, []);

  const handlePeriodChange = useCallback((days: number | null) => {
    setActiveDays(days);
    if (days === null) {
      setDateFrom("");
    } else {
      const d = new Date();
      d.setDate(d.getDate() - days);
      setDateFrom(d.toISOString().slice(0, 10));
    }
    setStatusPage(1);
  }, []);

  const handleStatusPageChange = useCallback((page: number) => setStatusPage(page), []);

  // Cycle: unsorted → asc → desc → unsorted. Switching to a different column
  // always starts fresh at asc.
  const handleSortChange = useCallback((column: PostsSortColumn) => {
    if (sortBy !== column) {
      setSortBy(column);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortBy("");
      setSortDir("");
    }
    setStatusPage(1);
  }, [sortBy, sortDir]);

  return {
    postId,
    activeDays,
    statusPage,
    sortBy,
    sortDir,
    handlePostChange,
    handlePeriodChange,
    handleStatusPageChange,
    handleSortChange,
    historyQ,
    funnelQ,
    sourcingQ,
    postsQ,
    postsStatusQ,
    statCardsQ,
    appMetricsQ,
  };
};
