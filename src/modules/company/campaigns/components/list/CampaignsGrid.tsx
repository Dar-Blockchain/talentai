import React, { memo, useCallback, useMemo, useState } from "react";
import { Search, Calendar, X, Megaphone } from "lucide-react";
import { CampaignStatus } from "@/modules/company/campaigns/types/campaign";
import { motion, AnimatePresence } from "framer-motion";
import CampaignCard from "./CampaignCard";
import CampaignsSkeleton from "./CampaignsSkeleton";
import DeleteCampaignDialog from "../details/DeleteCampaignDialog";
import ConfirmStatusChangeDialog from "../details/ConfirmStatusChangeDialog";
import { useCampaignsList } from "../../hooks/useCampaignsList";
import { Pagination } from "@/modules/shared/ui/shadcn/pagination";
import { Input } from "@/modules/shared/ui/shadcn/input";
import { Button } from "@/modules/shared/ui/shadcn/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/modules/shared/ui/shadcn/select";
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

const EMPTY_DIALOG_DELETE = { open: false, id: "", title: "" };
const EMPTY_DIALOG_STATUS = {
  open: false, id: "", title: "",
  currentStatus: "DRAFT" as CampaignStatus,
  targetStatus:  "ACTIVE" as CampaignStatus,
};

// Radix Select requires non-empty item values
const toSelectVal  = (v: string) => v || "__all__";
const fromSelectVal = (v: string) => v === "__all__" ? "" : v;

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

  const activeStatusMeta  = useMemo(() => STATUS_OPTIONS.find((o) => o.value === status), [STATUS_OPTIONS, status]);
  const activePeriodLabel = useMemo(() => PERIOD_OPTIONS.find((o) => o.value === period)?.label, [PERIOD_OPTIONS, period]);

  const openDelete = useCallback((id: string, title: string) =>
    setDeleteDialog({ open: true, id, title }), []);
  const closeDelete = useCallback(() => setDeleteDialog(EMPTY_DIALOG_DELETE), []);

  const openStatus = useCallback(
    (id: string, title: string, currentStatus: CampaignStatus, targetStatus: CampaignStatus) =>
      setStatusDialog({ open: true, id, title, currentStatus, targetStatus }),
    [],
  );
  const closeStatus = useCallback(() => setStatusDialog(EMPTY_DIALOG_STATUS), []);

  const handleDeleteConfirm = useCallback(async () => {
    await confirmDelete(deleteDialog.id);
    closeDelete();
  }, [confirmDelete, deleteDialog.id, closeDelete]);

  const handleStatusConfirm = useCallback(async () => {
    await confirmStatus(statusDialog.id, statusDialog.targetStatus);
    closeStatus();
  }, [confirmStatus, statusDialog.id, statusDialog.targetStatus, closeStatus]);

  const clearSearch       = useCallback(() => setSearchInput(""), [setSearchInput]);
  const clearStatusFilter = useCallback(() => handleStatusChange(""), [handleStatusChange]);
  const clearPeriodFilter = useCallback(() => handlePeriodChange(""), [handlePeriodChange]);

  return (
    <>
      {/* ── Filter bar ──────────────────────────────────────────────────────── */}
      <div className="flex gap-2 items-center flex-wrap mt-5">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-8 bg-card text-sm h-9"
            placeholder={t(`${p}.toolbar.search_placeholder`)}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <Select
          value={toSelectVal(status)}
          onValueChange={(v) => handleStatusChange(fromSelectVal(v))}
        >
          <SelectTrigger className="w-40 bg-card h-9 text-sm">
            <SelectValue placeholder={t(`${p}.toolbar.status_placeholder`)} />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={toSelectVal(o.value)} value={toSelectVal(o.value)}>
                <span className="flex items-center gap-2">
                  {o.value && (
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: o.color }}
                    />
                  )}
                  {o.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={toSelectVal(period)}
          onValueChange={(v) => handlePeriodChange(fromSelectVal(v))}
        >
          <SelectTrigger className="w-40 bg-card h-9 text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder={t(`${p}.toolbar.period_placeholder`)} />
            </span>
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((o) => (
              <SelectItem key={toSelectVal(o.value)} value={toSelectVal(o.value)}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-9 text-muted-foreground"
            onClick={clearFilters}
          >
            <X className="size-3.5" />
            {t(`${p}.toolbar.clear_filters`)}
          </Button>
        )}
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex gap-1.5 flex-wrap mt-2">
          {search && (
            <span className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
              &quot;{search}&quot;
              <button
                onClick={clearSearch}
                className="size-4 rounded-full hover:bg-blue-100 flex items-center justify-center"
              >
                <X className="size-2.5" />
              </button>
            </span>
          )}
          {status && activeStatusMeta && (
            <span
              className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full text-[11px] font-medium border"
              style={{
                backgroundColor: activeStatusMeta.bg,
                color:           activeStatusMeta.color,
                borderColor:     `${activeStatusMeta.color}30`,
              }}
            >
              {activeStatusMeta.label}
              <button
                onClick={clearStatusFilter}
                className="size-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${activeStatusMeta.color}20` }}
              >
                <X className="size-2.5" />
              </button>
            </span>
          )}
          {period && (
            <span className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full text-[11px] font-medium bg-violet-50 text-violet-700 border border-violet-100">
              {activePeriodLabel}
              <button
                onClick={clearPeriodFilter}
                className="size-4 rounded-full hover:bg-violet-100 flex items-center justify-center"
              >
                <X className="size-2.5" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* ── Grid ────────────────────────────────────────────────────────────── */}
      {loading ? (
        <CampaignsSkeleton />
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-64 py-16 text-center gap-4">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center">
            <Megaphone className="size-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-bold text-[1.0625rem] text-foreground mb-1">
              {hasActiveFilters ? t(`${p}.empty.filtered_title`) : t(`${p}.empty.none_title`)}
            </p>
            <p className="text-sm text-muted-foreground max-w-xs">
              {hasActiveFilters ? t(`${p}.empty.filtered_hint`) : t(`${p}.empty.none_hint`)}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
          <AnimatePresence>
            {campaigns.map((camp) => (
              <motion.div
                key={camp._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full"
              >
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
        </div>
      )}

      {count > 0 && (
        <Pagination
          page={page}
          totalPages={Math.ceil(count / limit)}
          onPageChange={handlePageChange}
        />
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
