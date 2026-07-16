import { useState, useCallback, useMemo } from "react";
import {
  useKpiHistoryQuery, useKpiFunnelQuery,
  useKpiSourcingQuery, useKpiRoiQuery, useKpiPostsQuery,
  useKpiPostsStatusQuery, useKpiStatCardsQuery, useKpiAppMetricsQuery,
} from "../queries";

const PAGE_SIZE = 4;

export const useDashboard = () => {
  const [postId,     setPostId]     = useState<string>("");
  const [dateFrom,   setDateFrom]   = useState<string>("");
  const [activeDays, setActiveDays] = useState<number | null>(null);
  const [statusPage, setStatusPage] = useState(1);

  const filterParams = useMemo(
    () => ({ ...(postId   ? { postId }   : {}), ...(dateFrom ? { dateFrom } : {}) }),
    [postId, dateFrom],
  );

  const statusParams = useMemo(
    () => ({ ...filterParams, page: statusPage, limit: PAGE_SIZE }),
    [filterParams, statusPage],
  );

  const historyQ     = useKpiHistoryQuery(filterParams);
  const funnelQ      = useKpiFunnelQuery(filterParams);
  const sourcingQ    = useKpiSourcingQuery(filterParams);
  const roiQ         = useKpiRoiQuery(filterParams);
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

  return {
    postId,
    activeDays,
    statusPage,
    handlePostChange,
    handlePeriodChange,
    handleStatusPageChange,
    historyQ,
    funnelQ,
    sourcingQ,
    roiQ,
    postsQ,
    postsStatusQ,
    statCardsQ,
    appMetricsQ,
  };
};
