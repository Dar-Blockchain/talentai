import { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { selectEmployeePermissions } from "@/store/slices/memberSlice";
import {
  fetchCampaigns, deleteCampaign, updateCampaignStatus, fetchCampaignMetrics,
  selectCampaigns, selectCampaignLoading, selectCampaignDeleteLoading,
  selectCampaignPage, selectCampaignLimit, selectCampaignCount,
  setPage,
} from "@/store/slices/campaignSlice";
import { CampaignStatus } from "@/types/campaign";

export function useCampaignsList() {
  const dispatch = useDispatch<AppDispatch>();

  const campaigns     = useSelector(selectCampaigns);
  const loading       = useSelector(selectCampaignLoading);
  const deleteLoading = useSelector(selectCampaignDeleteLoading);
  const page          = useSelector(selectCampaignPage);
  const limit         = useSelector(selectCampaignLimit);
  const count         = useSelector(selectCampaignCount);

  const user     = useSelector((state: RootState) => state.user.connectedUser.user);
  const empPerms = useSelector(selectEmployeePermissions);
  const isEmp    = user?.role === "Employee";
  const canEdit    = !isEmp || empPerms === null || !!empPerms.canEditCampaign || !!empPerms.canCreateCampaign;
  const canDelete  = !isEmp || !!empPerms?.canDeleteCampaign;
  const canPublish = !isEmp || !!empPerms?.canPublishCampaign;

  const [searchInput, setSearchInput] = useState("");
  const [search,      setSearch]      = useState("");
  const [status,      setStatus]      = useState("");
  const [period,      setPeriod]      = useState("");

  const doFetch = useCallback((overrides: Partial<{ search: string; status: string; period: string }> = {}) => {
    dispatch(fetchCampaigns({
      page,
      limit,
      search: overrides.search ?? search,
      status: (overrides.status ?? status) as CampaignStatus | undefined,
      period: overrides.period ?? period,
    }));
  }, [dispatch, page, limit, search, status, period]);

  useEffect(() => { doFetch(); }, [page, limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      dispatch(setPage(1));
      dispatch(fetchCampaigns({ page: 1, limit, search: searchInput, status: status as CampaignStatus | undefined, period }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleStatusChange = useCallback((val: string) => {
    setStatus(val);
    dispatch(setPage(1));
    dispatch(fetchCampaigns({ page: 1, limit, search, status: val as CampaignStatus | undefined, period }));
  }, [dispatch, limit, search, period]);

  const handlePeriodChange = useCallback((val: string) => {
    setPeriod(val);
    dispatch(setPage(1));
    dispatch(fetchCampaigns({ page: 1, limit, search, status: status as CampaignStatus | undefined, period: val }));
  }, [dispatch, limit, search, status]);

  const clearFilters = useCallback(() => {
    setSearchInput(""); setSearch(""); setStatus(""); setPeriod("");
    dispatch(setPage(1));
    dispatch(fetchCampaigns({ page: 1, limit }));
  }, [dispatch, limit]);

  const handleDeleteConfirm = useCallback(async (id: string) => {
    await dispatch(deleteCampaign(id));
    doFetch();
    dispatch(fetchCampaignMetrics());
  }, [dispatch, doFetch]);

  const handleStatusConfirm = useCallback(async (id: string, targetStatus: CampaignStatus) => {
    await dispatch(updateCampaignStatus({ campaignId: id, status: targetStatus }));
    doFetch();
  }, [dispatch, doFetch]);

  const handlePageChange = useCallback((p: number) => dispatch(setPage(p)), [dispatch]);

  return {
    campaigns, loading, deleteLoading, page, limit, count,
    canEdit, canDelete, canPublish,
    searchInput, setSearchInput,
    search, status, period,
    hasActiveFilters: !!(search || status || period),
    handleStatusChange, handlePeriodChange, clearFilters,
    handleDeleteConfirm, handleStatusConfirm, handlePageChange,
    doFetch,
  };
}
