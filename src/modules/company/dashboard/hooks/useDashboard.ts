import { useState, useCallback, useMemo } from "react";
import {
  useKpiActionsQuery, useKpiFunnelQuery, useKpiVelocityQuery,
  useKpiSourcingQuery, useKpiRoiQuery, useKpiPostsQuery,
  useKpiPostsStatusQuery,
} from "../queries";

const PAGE_SIZE = 3;

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

  const actionsQ     = useKpiActionsQuery(filterParams);
  const funnelQ      = useKpiFunnelQuery(filterParams);
  const velocityQ    = useKpiVelocityQuery(filterParams);
  const sourcingQ    = useKpiSourcingQuery(filterParams);
  const roiQ         = useKpiRoiQuery();
  const postsQ       = useKpiPostsQuery();
  const postsStatusQ = useKpiPostsStatusQuery(statusParams);

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
    actionsQ,
    funnelQ,
    velocityQ,
    sourcingQ,
    roiQ,
    postsQ,
    postsStatusQ,
  };
};
