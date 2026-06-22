import React, { memo, useCallback, useMemo, useState } from "react";
import {
  Box, TextField, InputAdornment, MenuItem, Select, FormControl,
  Button, Typography, Chip,
} from "@mui/material";
import { CampaignStatus } from "@/types/campaign";
import { motion, AnimatePresence } from "framer-motion";
import CampaignCard from "./CampaignCard";
import CampaignsSkeleton from "./CampaignsSkeleton";
import DeleteCampaignDialog from "../details/DeleteCampaignDialog";
import ConfirmStatusChangeDialog from "../details/ConfirmStatusChangeDialog";
import { useCampaignsList } from "../../hooks/useCampaignsList";
import Pagination from "@/components/ui/Pagination";
import SearchOutlined     from "@mui/icons-material/SearchOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import CloseOutlined      from "@mui/icons-material/CloseOutlined";
import EmptyState         from "@/components/ui/EmptyState";
import CampaignOutlined   from "@mui/icons-material/CampaignOutlined";
import { useTranslation } from "react-i18next";

// ─── Static constants ─────────────────────────────────────────────────────────

type StatusOpt = { value: string; label: string; color: string; bg: string };

const STATUS_META: Omit<StatusOpt, "label">[] = [
  { value: "",        color: "#6B7280", bg: "#F3F4F6" },
  { value: "DRAFT",   color: "#6B7280", bg: "#F3F4F6" },
  { value: "ACTIVE",  color: "#059669", bg: "#ECFDF5" },
  { value: "PAUSED",  color: "#D97706", bg: "#FFFBEB" },
  { value: "CLOSED",  color: "#DC2626", bg: "#FEF2F2" },
  { value: "EXPIRED", color: "#7C3AED", bg: "#F5F3FF" },
];

const PERIOD_VALUES = ["", "7d", "30d", "3m", "6m", "1y"] as const;

const FILTER_BAR_SX = { display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap", mt: 3 } as const;
const SEARCH_SX     = { flex: 1, minWidth: 200, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "#fff", fontSize: 13 } } as const;
const SELECT_SX     = { borderRadius: 2, bgcolor: "#fff", fontSize: 13 } as const;
const STATUS_FC_SX  = { minWidth: 150 } as const;
const PERIOD_FC_SX  = { minWidth: 150 } as const;
const CLEAR_BTN_SX  = { textTransform: "none", fontSize: 12, color: "#6B7280", borderRadius: 2, border: "1px solid #E5E7EB", bgcolor: "#fff", px: 1.5, whiteSpace: "nowrap" } as const;
const CHIPS_ROW_SX  = { display: "flex", gap: 1, flexWrap: "wrap", mt: 1.5 } as const;
const SEARCH_CHIP_SX = { fontSize: 11, bgcolor: "#EFF6FF", color: "#2563EB", border: "none" } as const;
const PERIOD_CHIP_SX = { fontSize: 11, bgcolor: "#F5F3FF", color: "#7C3AED", border: "none" } as const;
const GRID_SX       = { display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }, gap: 3, mt: 1 } as const;
const SEARCH_ICON_SX = { fontSize: 16, color: "#9CA3AF" } as const;
const CAL_ICON_SX   = { fontSize: 14, color: "#9CA3AF" } as const;
const CLOSE_ICON_SX = { fontSize: 14 } as const;
const MOTION_STYLE  = { height: "100%" } as const;

const EMPTY_DIALOG_DELETE = { open: false, id: "", title: "" };
const EMPTY_DIALOG_STATUS = { open: false, id: "", title: "", currentStatus: "DRAFT" as CampaignStatus, targetStatus: "ACTIVE" as CampaignStatus };

// ─── Component ────────────────────────────────────────────────────────────────

const CampaignsGrid: React.FC = memo(() => {
  const { t } = useTranslation("dashboard");
  const p = "pages.campaigns";

  const {
    campaigns, loading, deleteLoading, page, limit, count,
    canEdit, canDelete, canPublish,
    searchInput, setSearchInput,
    search, status, period,
    hasActiveFilters,
    handleStatusChange, handlePeriodChange, clearFilters,
    handleDeleteConfirm: confirmDelete,
    handleStatusConfirm: confirmStatus,
    handlePageChange,
  } = useCampaignsList();

  const [deleteDialog, setDeleteDialog] = useState(EMPTY_DIALOG_DELETE);
  const [statusDialog, setStatusDialog] = useState(EMPTY_DIALOG_STATUS);

  const STATUS_OPTIONS: StatusOpt[] = useMemo(
    () => STATUS_META.map((o) => ({
      ...o,
      label: o.value === "" ? t(`${p}.toolbar.status.all`) : t(`${p}.toolbar.status.${o.value}`),
    })),
    [t],
  );

  const PERIOD_OPTIONS = useMemo(
    () => PERIOD_VALUES.map((value) => ({
      value,
      label: value === "" ? t(`${p}.toolbar.period.all`) : t(`${p}.toolbar.period.${value}`),
    })),
    [t],
  );

  const activeStatusMeta = useMemo(() => STATUS_OPTIONS.find((o) => o.value === status), [STATUS_OPTIONS, status]);
  const activePeriodLabel = useMemo(() => PERIOD_OPTIONS.find((o) => o.value === period)?.label, [PERIOD_OPTIONS, period]);

  const openDelete = useCallback((id: string, title: string) => setDeleteDialog({ open: true, id, title }), []);
  const closeDelete = useCallback(() => setDeleteDialog(EMPTY_DIALOG_DELETE), []);
  const openStatus = useCallback((id: string, title: string, currentStatus: CampaignStatus, targetStatus: CampaignStatus) =>
    setStatusDialog({ open: true, id, title, currentStatus, targetStatus }),
  []);
  const closeStatus = useCallback(() => setStatusDialog(EMPTY_DIALOG_STATUS), []);

  const handleDeleteConfirm = useCallback(async () => {
    await confirmDelete(deleteDialog.id);
    closeDelete();
  }, [confirmDelete, deleteDialog.id, closeDelete]);

  const handleStatusConfirm = useCallback(async () => {
    await confirmStatus(statusDialog.id, statusDialog.targetStatus);
    closeStatus();
  }, [confirmStatus, statusDialog.id, statusDialog.targetStatus, closeStatus]);

  const clearSearch = useCallback(() => setSearchInput(""), [setSearchInput]);
  const clearStatus = useCallback(() => handleStatusChange(""), [handleStatusChange]);
  const clearPeriod = useCallback(() => handlePeriodChange(""), [handlePeriodChange]);

  const onSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value), [setSearchInput]);
  const onStatusChange = useCallback((e: any) => handleStatusChange(e.target.value), [handleStatusChange]);
  const onPeriodChange = useCallback((e: any) => handlePeriodChange(e.target.value), [handlePeriodChange]);

  return (
    <>
      {/* ── Filter bar ────────────────────────────────────────────────────── */}
      <Box sx={FILTER_BAR_SX}>
        <TextField
          size="small"
          placeholder={t(`${p}.toolbar.search_placeholder`)}
          value={searchInput}
          onChange={onSearchChange}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined sx={SEARCH_ICON_SX} /></InputAdornment> }}
          sx={SEARCH_SX}
        />

        <FormControl size="small" sx={STATUS_FC_SX}>
          <Select
            value={status}
            onChange={onStatusChange}
            displayEmpty
            renderValue={(v) => {
              const opt = STATUS_OPTIONS.find((o) => o.value === v);
              return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {v ? <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: opt?.color, flexShrink: 0 }} /> : null}
                  <Typography sx={{ fontSize: 13, color: v ? "#111827" : "#9CA3AF" }}>
                    {opt?.label ?? t(`${p}.toolbar.status_placeholder`)}
                  </Typography>
                </Box>
              );
            }}
            sx={SELECT_SX}
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

        <FormControl size="small" sx={PERIOD_FC_SX}>
          <Select
            value={period}
            onChange={onPeriodChange}
            displayEmpty
            renderValue={(v) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarTodayOutlined sx={CAL_ICON_SX} />
                <Typography sx={{ fontSize: 13, color: v ? "#111827" : "#9CA3AF" }}>
                  {PERIOD_OPTIONS.find((o) => o.value === v)?.label ?? t(`${p}.toolbar.period_placeholder`)}
                </Typography>
              </Box>
            )}
            sx={SELECT_SX}
          >
            {PERIOD_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value} sx={{ fontSize: 13 }}>{o.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {hasActiveFilters && (
          <Button size="small" startIcon={<CloseOutlined sx={CLOSE_ICON_SX} />} onClick={clearFilters} sx={CLEAR_BTN_SX}>
            {t(`${p}.toolbar.clear_filters`)}
          </Button>
        )}
      </Box>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <Box sx={CHIPS_ROW_SX}>
          {search && <Chip size="small" label={`"${search}"`} onDelete={clearSearch} sx={SEARCH_CHIP_SX} />}
          {status && activeStatusMeta && (
            <Chip size="small" label={activeStatusMeta.label} onDelete={clearStatus}
              sx={{ fontSize: 11, bgcolor: activeStatusMeta.bg, color: activeStatusMeta.color, border: "none" }} />
          )}
          {period && <Chip size="small" label={activePeriodLabel} onDelete={clearPeriod} sx={PERIOD_CHIP_SX} />}
        </Box>
      )}

      {/* ── Grid ──────────────────────────────────────────────────────────── */}
      {loading ? (
        <CampaignsSkeleton />
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={<CampaignOutlined />}
          title={hasActiveFilters ? t(`${p}.empty.filtered_title`) : t(`${p}.empty.none_title`)}
          description={hasActiveFilters ? t(`${p}.empty.filtered_hint`) : t(`${p}.empty.none_hint`)}
        />
      ) : (
        <Box sx={GRID_SX}>
          <AnimatePresence>
            {campaigns.map((camp) => (
              <motion.div key={camp._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} style={MOTION_STYLE}>
                <CampaignCard
                  campaign={camp}
                  onViewDetails={() => {}}
                  onDelete={openDelete}
                  onStatusChange={openStatus}
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
        <Pagination page={page} pageSize={limit} total={count} onPageChange={handlePageChange} />
      )}

      <DeleteCampaignDialog
        open={deleteDialog.open}
        campaignTitle={deleteDialog.title}
        onClose={closeDelete}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />

      <ConfirmStatusChangeDialog
        open={statusDialog.open}
        campaignTitle={statusDialog.title}
        currentStatus={statusDialog.currentStatus}
        targetStatus={statusDialog.targetStatus}
        onClose={closeStatus}
        onConfirm={handleStatusConfirm}
      />
    </>
  );
});

CampaignsGrid.displayName = "CampaignsGrid";
export default CampaignsGrid;
