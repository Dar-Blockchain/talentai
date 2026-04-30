import React, { useEffect, memo, useState, useCallback, useMemo } from "react";
import {
  Box, TextField, InputAdornment, MenuItem, Select, FormControl,
  Button, Typography, Chip,
} from "@mui/material";
import { Campaign, CampaignStatus } from "@/types/campaign";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { selectEmployeePermissions } from "@/store/slices/memberSlice";
import { motion, AnimatePresence } from "framer-motion";
import CampaignCard from "./CampaignCard";
import CampaignsSkeleton from "./CampaignsSkeleton";
import DeleteCampaignDialog from "../details/DeleteCampaignDialog";
import ConfirmStatusChangeDialog from "../details/ConfirmStatusChangeDialog";
import {
  selectCampaignLoading,
  selectCampaigns,
  fetchCampaigns,
  deleteCampaign,
  updateCampaignStatus,
  fetchCampaignMetrics,
  selectCampaignLimit,
  selectCampaignPage,
  selectCampaignCount,
  selectCampaignDeleteLoading,
  setPage,
} from "@/store/slices/campaignSlice";
import Pagination from "@/components/ui/Pagination";
import CampaignOutlined   from "@mui/icons-material/CampaignOutlined";
import SearchOutlined     from "@mui/icons-material/SearchOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import CloseOutlined      from "@mui/icons-material/CloseOutlined";
import EmptyState  from "@/components/ui/EmptyState";
import { useTranslation } from "react-i18next";

// ─── Options built from i18n (labels + fixed colors) ──────────────────────────


const CampaignsGrid: React.FC = () => {
  const { t } = useTranslation("campaign");
  const dispatch = useDispatch<AppDispatch>();

  const STATUS_OPTIONS = useMemo(
    () =>
      [
        { value: "", label: t("filters.status_label"), color: "#6B7280", bg: "#F3F4F6" },
        { value: "DRAFT", label: t("status.DRAFT"), color: "#6B7280", bg: "#F3F4F6" },
        { value: "ACTIVE", label: t("status.ACTIVE"), color: "#059669", bg: "#ECFDF5" },
        { value: "PAUSED", label: t("status.PAUSED"), color: "#D97706", bg: "#FFFBEB" },
        { value: "CLOSED", label: t("status.CLOSED"), color: "#DC2626", bg: "#FEF2F2" },
        { value: "EXPIRED", label: t("status.EXPIRED"), color: "#7C3AED", bg: "#F5F3FF" },
      ] as const,
    [t],
  );

  const PERIOD_OPTIONS = useMemo(
    () =>
      [
        { value: "", label: t("filters.period_label") },
        { value: "7d", label: t("filters.last_7_days") },
        { value: "30d", label: t("filters.last_30_days") },
        { value: "3m", label: t("filters.last_3_months") },
        { value: "6m", label: t("filters.last_6_months") },
        { value: "1y", label: t("filters.last_year") },
      ] as const,
    [t],
  );

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

  const doFetch = useCallback((overrides: Record<string, any> = {}) => {
    dispatch(fetchCampaigns({
      page,
      limit,
      search: overrides.search  ?? search,
      status: (overrides.status ?? status) as CampaignStatus | undefined,
      period: overrides.period  ?? period,
    }));
  }, [dispatch, page, limit, search, status, period]);

  // initial + page/limit changes
  useEffect(() => { doFetch(); }, [page, limit]);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      dispatch(setPage(1));
      dispatch(fetchCampaigns({ page: 1, limit, search: searchInput, status: status as CampaignStatus | undefined, period }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleStatusChange = (val: string) => {
    setStatus(val);
    dispatch(setPage(1));
    dispatch(fetchCampaigns({ page: 1, limit, search, status: val as CampaignStatus | undefined, period }));
  };

  const handlePeriodChange = (val: string) => {
    setPeriod(val);
    dispatch(setPage(1));
    dispatch(fetchCampaigns({ page: 1, limit, search, status: status as CampaignStatus | undefined, period: val }));
  };

  const clearFilters = () => {
    setSearchInput(""); setSearch(""); setStatus(""); setPeriod("");
    dispatch(setPage(1));
    dispatch(fetchCampaigns({ page: 1, limit }));
  };

  const hasActiveFilters = search || status || period;

  // ─── Dialogs ──────────────────────────────────────────────────────────────

  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: "", title: "" });
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean; id: string; title: string; currentStatus: CampaignStatus; targetStatus: CampaignStatus;
  }>({ open: false, id: "", title: "", currentStatus: "DRAFT", targetStatus: "ACTIVE" });

  const handleDeleteConfirm = async () => {
    await dispatch(deleteCampaign(deleteDialog.id));
    setDeleteDialog({ open: false, id: "", title: "" });
    doFetch();
    dispatch(fetchCampaignMetrics());
  };

  const handleStatusConfirm = async () => {
    await dispatch(updateCampaignStatus({ campaignId: statusDialog.id, status: statusDialog.targetStatus }));
    setStatusDialog({ open: false, id: "", title: "", currentStatus: "DRAFT", targetStatus: "ACTIVE" });
    doFetch();
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const activeStatusMeta = STATUS_OPTIONS.find((o) => o.value === status);

  return (
    <>
      {/* ── Filter bar ──────────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap", mt: 3 }}>

        {/* Search */}
        <TextField
          size="small"
          placeholder={t("filters.search_placeholder")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined sx={{ fontSize: 16, color: "#9CA3AF" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            flex: 1, minWidth: 200,
            "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fff", fontSize: 13 },
          }}
        />

        {/* Status */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            displayEmpty
            renderValue={(v) => {
              const opt = STATUS_OPTIONS.find(o => o.value === v);
              return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {v ? (
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: opt?.color, flexShrink: 0 }} />
                  ) : null}
                  <Typography sx={{ fontSize: 13, color: v ? "#111827" : "#9CA3AF" }}>
                    {opt?.label ?? t("filters.status_placeholder")}
                  </Typography>
                </Box>
              );
            }}
            sx={{ borderRadius: 2, bgcolor: "#fff", fontSize: 13 }}
          >
            {STATUS_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  {o.value && <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: o.color, flexShrink: 0 }} />}
                  <Typography sx={{ fontSize: 13 }}>{o.label}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Period */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value)}
            displayEmpty
            renderValue={(v) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarTodayOutlined sx={{ fontSize: 14, color: "#9CA3AF" }} />
                <Typography sx={{ fontSize: 13, color: v ? "#111827" : "#9CA3AF" }}>
                  {PERIOD_OPTIONS.find((o) => o.value === v)?.label ?? t("filters.period_placeholder")}
                </Typography>
              </Box>
            )}
            sx={{ borderRadius: 2, bgcolor: "#fff", fontSize: 13 }}
          >
            {PERIOD_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value} sx={{ fontSize: 13 }}>{o.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Clear */}
        {hasActiveFilters && (
          <Button
            size="small"
            startIcon={<CloseOutlined sx={{ fontSize: 14 }} />}
            onClick={clearFilters}
            sx={{
              textTransform: "none", fontSize: 12, color: "#6B7280",
              borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "#fff",
              px: 1.5, whiteSpace: "nowrap",
            }}
          >
            {t("filters.clear")}
          </Button>
        )}
      </Box>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1.5 }}>
          {search && (
            <Chip size="small" label={`"${search}"`} onDelete={() => { setSearchInput(""); setSearch(""); doFetch({ search: "" }); }}
              sx={{ fontSize: 11, bgcolor: "#EFF6FF", color: "#2563EB", border: "none" }} />
          )}
          {status && activeStatusMeta && (
            <Chip size="small" label={activeStatusMeta.label} onDelete={() => handleStatusChange("")}
              sx={{ fontSize: 11, bgcolor: activeStatusMeta.bg, color: activeStatusMeta.color, border: "none" }} />
          )}
          {period && (
            <Chip size="small" label={PERIOD_OPTIONS.find((o) => o.value === period)?.label} onDelete={() => handlePeriodChange("")}
              sx={{ fontSize: 11, bgcolor: "#F5F3FF", color: "#7C3AED", border: "none" }} />
          )}
        </Box>
      )}

      {/* ── Grid ────────────────────────────────────────────────────────────── */}
      {loading ? (
        <CampaignsSkeleton />
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={<CampaignOutlined />}
          title={hasActiveFilters ? t("list.no_results") : t("list.empty")}
          description={hasActiveFilters ? t("list.no_results_description") : t("list.empty_description")}
        />
      ) : (
        <Box sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
          gap: 3, mt: 1,
        }}>
          <AnimatePresence>
            {campaigns.map((camp) => (
              <motion.div key={camp._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} style={{ height: "100%" }}>
                <CampaignCard
                  campaign={camp}
                  onViewDetails={() => {}}
                  onDelete={(id, title) => setDeleteDialog({ open: true, id, title })}
                  onStatusChange={(id, title, currentStatus, targetStatus) => setStatusDialog({ open: true, id, title, currentStatus, targetStatus })}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  canPublish={canPublish}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>
      )}

      {count > 0 && (
        <Pagination page={page} pageSize={limit} total={count} onPageChange={(p) => dispatch(setPage(p))} />
      )}

      <DeleteCampaignDialog
        open={deleteDialog.open}
        campaignTitle={deleteDialog.title}
        onClose={() => setDeleteDialog({ open: false, id: "", title: "" })}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />

      <ConfirmStatusChangeDialog
        open={statusDialog.open}
        campaignTitle={statusDialog.title}
        currentStatus={statusDialog.currentStatus}
        targetStatus={statusDialog.targetStatus}
        onClose={() => setStatusDialog({ open: false, id: "", title: "", currentStatus: "DRAFT", targetStatus: "ACTIVE" })}
        onConfirm={handleStatusConfirm}
      />
    </>
  );
};

export default memo(CampaignsGrid);
