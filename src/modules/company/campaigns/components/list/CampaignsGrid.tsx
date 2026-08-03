import React, { memo, useCallback, useMemo, useState } from "react";
import { Megaphone } from "lucide-react";
import { CampaignStatus } from "@/modules/company/campaigns/types/campaign";
import { motion, AnimatePresence } from "framer-motion";
import CampaignCard from "./CampaignCard";
import CampaignsSkeleton from "./CampaignsSkeleton";
import CampaignsFilterBar, {
  toSelectVal,
  fromSelectVal,
} from "./CampaignsFilterBar";
import DeleteCampaignDialog from "../details/DeleteCampaignDialog";
import ConfirmStatusChangeDialog from "../details/ConfirmStatusChangeDialog";
import { useCampaignsList } from "../../hooks/useCampaignsList";
import { Pagination } from "@/modules/shared/ui/shadcn/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/shared/ui/shadcn/select";
import { useTranslation } from "react-i18next";

// ─── Static constants ─────────────────────────────────────────────────────────

type StatusOpt = { value: string; label: string; color: string; bg: string };

// Colors mirror STATUS_BADGE dot colors in CampaignCard/constants.ts so the
// filter dropdown matches the status badges shown on the campaign cards.
const STATUS_META: Omit<StatusOpt, "label">[] = [
  { value: "", color: "#6B7280", bg: "#F3F4F6" },
  { value: "DRAFT", color: "#94A3B8", bg: "#F1F5F9" },
  { value: "ACTIVE", color: "#10B981", bg: "#ECFDF5" },
  { value: "PAUSED", color: "#F59E0B", bg: "#FFFBEB" },
  { value: "CLOSED", color: "#2563EB", bg: "#EFF6FF" },
  { value: "EXPIRED", color: "#EF4444", bg: "#FEF2F2" },
];

const PERIOD_VALUES = ["", "7d", "30d", "3m", "6m", "1y"] as const;

const EMPTY_DIALOG_DELETE = { open: false, id: "", title: "" };
const EMPTY_DIALOG_STATUS = {
  open: false,
  id: "",
  title: "",
  currentStatus: "DRAFT" as CampaignStatus,
  targetStatus: "ACTIVE" as CampaignStatus,
};

// ─── Component ────────────────────────────────────────────────────────────────

const CampaignsGrid: React.FC = memo(() => {
  const { t } = useTranslation("dashboard");
  const p = "pages.campaigns";

  const {
    campaigns,
    loading,
    deleteLoading,
    page,
    limit,
    count,
    canEdit,
    canDelete,
    canPublish,
    searchInput,
    setSearchInput,
    status,
    period,
    hasActiveFilters,
    handleStatusChange,
    handlePeriodChange,
    clearFilters,
    handleDeleteConfirm: confirmDelete,
    handleStatusConfirm: confirmStatus,
    handlePageChange,
  } = useCampaignsList();

  const [deleteDialog, setDeleteDialog] = useState(EMPTY_DIALOG_DELETE);
  const [statusDialog, setStatusDialog] = useState(EMPTY_DIALOG_STATUS);

  const STATUS_OPTIONS: StatusOpt[] = useMemo(
    () =>
      STATUS_META.map((o) => ({
        ...o,
        label:
          o.value === ""
            ? t(`${p}.toolbar.status.all`)
            : t(`${p}.toolbar.status.${o.value}`),
      })),
    [t],
  );

  const PERIOD_OPTIONS = useMemo(
    () =>
      PERIOD_VALUES.map((value) => ({
        value,
        label:
          value === ""
            ? t(`${p}.toolbar.period.all`)
            : t(`${p}.toolbar.period.${value}`),
      })),
    [t],
  );

  const openDelete = useCallback(
    (id: string, title: string) => setDeleteDialog({ open: true, id, title }),
    [],
  );
  const closeDelete = useCallback(
    () => setDeleteDialog(EMPTY_DIALOG_DELETE),
    [],
  );

  const openStatus = useCallback(
    (
      id: string,
      title: string,
      currentStatus: CampaignStatus,
      targetStatus: CampaignStatus,
    ) =>
      setStatusDialog({ open: true, id, title, currentStatus, targetStatus }),
    [],
  );
  const closeStatus = useCallback(
    () => setStatusDialog(EMPTY_DIALOG_STATUS),
    [],
  );

  const handleDeleteConfirm = useCallback(async () => {
    await confirmDelete(deleteDialog.id);
    closeDelete();
  }, [confirmDelete, deleteDialog.id, closeDelete]);

  const handleStatusConfirm = useCallback(async () => {
    await confirmStatus(statusDialog.id, statusDialog.targetStatus);
    closeStatus();
  }, [confirmStatus, statusDialog.id, statusDialog.targetStatus, closeStatus]);

  return (
    <>
      {/* ── Filter bar ──────────────────────────────────────────────────────── */}
      <div className="mt-5">
        <CampaignsFilterBar
          search={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder={t(`${p}.toolbar.search_placeholder`)}
          period={period}
          onPeriodChange={handlePeriodChange}
          periodOptions={PERIOD_OPTIONS}
          periodPlaceholder={t(`${p}.toolbar.period_placeholder`)}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
          clearLabel={t(`${p}.toolbar.clear_filters`)}
          extraFilters={
            <Select
              value={toSelectVal(status)}
              onValueChange={(v) => handleStatusChange(fromSelectVal(v))}
            >
              <SelectTrigger className="w-40 bg-card h-9 text-sm">
                <SelectValue
                  placeholder={t(`${p}.toolbar.status_placeholder`)}
                />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem
                    key={toSelectVal(o.value)}
                    value={toSelectVal(o.value)}
                  >
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
          }
        />
      </div>

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
              {hasActiveFilters
                ? t(`${p}.empty.filtered_title`)
                : t(`${p}.empty.none_title`)}
            </p>
            <p className="text-sm text-muted-foreground max-w-xs">
              {hasActiveFilters
                ? t(`${p}.empty.filtered_hint`)
                : t(`${p}.empty.none_hint`)}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-5">
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
