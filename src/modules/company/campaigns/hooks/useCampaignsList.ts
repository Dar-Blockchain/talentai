import { useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { usePermissionsQuery } from "@/modules/company/employees/queries";
import { CampaignStatus } from "@/modules/company/campaigns/types/campaign";
import {
  useCampaignsListQuery, useCampaignMetricsQuery,
  useDeleteCampaignMutation,
} from "../queries";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { apiUpdateCampaignStatus } from "../api";
import { CAMPAIGN_KEYS } from "../queries";

const DEFAULT_LIMIT = 6;

export function useCampaignsList() {
  const user     = useSelector((s: RootState) => s.user.connectedUser.user);
  const { data: empPerms } = usePermissionsQuery(user?._id);
  const isEmp    = user?.role === "Employee";
  const canEdit    = !isEmp || empPerms === null || !!empPerms?.canEditCampaign || !!empPerms?.canCreateCampaign;
  const canDelete  = !isEmp || !!empPerms?.canDeleteCampaign;
  const canPublish = !isEmp || !!empPerms?.canPublishCampaign;

  const [page,        setPage]        = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search,      setSearch]      = useState("");
  const [status,      setStatus]      = useState("");
  const [period,      setPeriod]      = useState("");

  const handleSearchInput = useCallback((val: string) => {
    setSearchInput(val);
    const timer = setTimeout(() => { setSearch(val); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, []);

  const params = useMemo(
    () => ({ page, limit: DEFAULT_LIMIT, search, status, period }),
    [page, search, status, period],
  );

  const listQ    = useCampaignsListQuery(params);
  const metricsQ = useCampaignMetricsQuery();
  const deleteMut = useDeleteCampaignMutation();

  // Status mutation that accepts both campaignId and status (no per-id hook needed)
  const qc = useQueryClient();
  const statusMut = useMutation({
    mutationFn: ({ campaignId, newStatus }: { campaignId: string; newStatus: CampaignStatus }) =>
      apiUpdateCampaignStatus(campaignId, newStatus),
    onSuccess: (updated, { campaignId }) => {
      qc.setQueryData(CAMPAIGN_KEYS.detail(campaignId), updated);
      qc.invalidateQueries({ queryKey: CAMPAIGN_KEYS.list({}) });
      qc.invalidateQueries({ queryKey: CAMPAIGN_KEYS.metrics() });
    },
  });

  const campaigns = listQ.data?.data       ?? [];
  const count     = listQ.data?.pagination?.total ?? 0;
  const loading   = listQ.isLoading || listQ.isFetching;

  const handleStatusChange = useCallback((val: string) => {
    setStatus(val); setPage(1);
  }, []);

  const handlePeriodChange = useCallback((val: string) => {
    setPeriod(val); setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchInput(""); setSearch(""); setStatus(""); setPeriod(""); setPage(1);
  }, []);

  const handleDeleteConfirm = useCallback(async (id: string) => {
    await deleteMut.mutateAsync(id);
  }, [deleteMut]);

  const handleStatusConfirm = useCallback(async (id: string, targetStatus: CampaignStatus) => {
    await statusMut.mutateAsync({ campaignId: id, newStatus: targetStatus });
  }, [statusMut]);

  const handlePageChange = useCallback((p: number) => setPage(p), []);

  return {
    campaigns,
    loading,
    deleteLoading: deleteMut.isPending,
    statusLoading: statusMut.isPending,
    page,
    limit: DEFAULT_LIMIT,
    count,
    metrics:        metricsQ.data ?? null,
    metricsLoading: metricsQ.isLoading,
    canEdit, canDelete, canPublish,
    searchInput,
    setSearchInput: handleSearchInput,
    search, status, period,
    hasActiveFilters: !!(search || status || period),
    handleStatusChange, handlePeriodChange, clearFilters,
    handleDeleteConfirm, handleStatusConfirm, handlePageChange,
  };
}
