"use client";

import React, { memo, useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import {
  Search, X, Users, Building2, CircleCheck, Circle, Clock, Mail, UserPlus, Trash2, Plus,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/modules/shared/ui/shadcn/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/modules/shared/ui/shadcn/select";
import {
  Tooltip, TooltipContent, TooltipTrigger, TooltipProvider,
} from "@/modules/shared/ui/shadcn/tooltip";
import {
  useCampaignParticipantsQuery,
  useNonParticipantsQuery,
  useAddParticipantMutation,
  useRemoveParticipantMutation,
} from "../../queries";
import { useDepartmentsQuery } from "@/modules/company/employees/queries";
import { CampaignParticipant, NonParticipant, ParticipantStatus } from "@/modules/company/campaigns/types/campaign";
import { Pagination } from "@/modules/shared/ui/shadcn/pagination";
import { ROLES } from "@/modules/shared/constants/employee";
import { useTranslation } from "react-i18next";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 9;
const PICKER_PAGE_SIZE = 8;

const AVATAR_GRADIENTS = [
  "135deg, #8310FF, #A855F7",
  "135deg, #0D9488, #34D399",
  "135deg, #0891B2, #38BDF8",
  "135deg, #D97706, #FCD34D",
  "135deg, #DC2626, #F87171",
] as const;

function pickGradient(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length];
}

const PARTICIPANT_STATUS_META: Record<ParticipantStatus, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  IN_PROGRESS: { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", icon: Clock },
  COMPLETED:   { color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0", icon: CircleCheck },
  INVITED:     { color: "#0891B2", bg: "#ECFDF5", border: "#A5F3FC", icon: Circle },
  DROPPED:     { color: "#EF4444", bg: "#FEF2F2", border: "#FECACA", icon: Circle },
};

const SKELETON_CARDS  = Array.from({ length: 6 });
const SKELETON_ROWS_8 = Array.from({ length: PICKER_PAGE_SIZE });

// ─── Card skeleton ────────────────────────────────────────────────────────────

const CardSkeleton = memo(() => (
  <div className="bg-background border border-border rounded-2xl p-4 flex flex-col gap-3.5">
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-3 flex-1">
        <Skeleton className="size-10 rounded-full shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-[15px] w-[60%]" />
          <Skeleton className="h-[13px] w-[75%] mt-1.5" />
        </div>
      </div>
      <Skeleton className="size-7 rounded-full shrink-0" />
    </div>
    <div className="flex items-center justify-between">
      <Skeleton className="h-[22px] w-24 rounded-full" />
      <Skeleton className="h-[22px] w-20 rounded-full" />
    </div>
  </div>
));
CardSkeleton.displayName = "ParticipantCardSkeleton";

const PickerRowSkeleton = memo(() => (
  <div className="flex items-center gap-4 px-5 py-3 border-b border-border/60">
    <Skeleton className="size-[38px] rounded-full shrink-0" />
    <div className="flex-1">
      <Skeleton className="h-3.5 w-[38%]" />
      <Skeleton className="h-[11px] w-[55%] mt-1" />
    </div>
    <Skeleton className="h-6 w-21 rounded-full" />
    <Skeleton className="h-8 w-[72px] rounded-lg" />
  </div>
));
PickerRowSkeleton.displayName = "PickerRowSkeleton";

// ─── Participant card ─────────────────────────────────────────────────────────

interface ParticipantCardProps {
  participant: CampaignParticipant;
  onRemove?: (id: string) => void;
  removing?: boolean;
}

const ParticipantCard = memo<ParticipantCardProps>(({ participant: p, onRemove, removing }) => {
  const router = useRouter();
  const { t } = useTranslation("dashboard");
  const pp = "pages.campaigns.detail.participants";
  const du = "pages.campaigns.detail";

  const name      = (p.firstName && p.lastName) ? `${p.firstName} ${p.lastName}` : p.firstName || p.lastName || t(`${du}.unknown_user`);
  const email     = p.email ?? "";
  const letter    = name[0]?.toUpperCase() || "U";
  const dept      = p.department?.name ?? null;
  const roleStr   = (p.role ?? "") as string;
  const roleEntry = ROLES.find((r) => r.value === roleStr || r.value === roleStr.toLowerCase());
  const roleColor = roleEntry?.color ?? "#6B7280";
  const roleLabel = roleEntry?.label || roleStr || "—";
  const RoleIcon  = roleEntry?.icon ?? null;
  const status    = p.status as ParticipantStatus | undefined;
  const sc        = status ? PARTICIPANT_STATUS_META[status] : null;
  const StatusIcon = sc?.icon ?? null;
  const gradient  = pickGradient(email || name);

  const handleNavigateEmployee = useCallback(() => {
    if (p.employeeId) router.push(`/company/employees/${p.employeeId}`);
  }, [p.employeeId, router]);

  const handleNavigateDept = useCallback((e: React.MouseEvent) => {
    if (p.department?.id) { e.stopPropagation(); router.push(`/company/departments/${p.department.id}`); }
  }, [p.department?.id, router]);

  const handleRemove = useCallback(() => onRemove?.(p._id), [onRemove, p._id]);

  return (
    <div className="bg-background border border-border rounded-2xl p-4 flex flex-col gap-3.5 transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-2">
        <div
          onClick={handleNavigateEmployee}
          className={`group/card flex items-center gap-3 min-w-0 ${p.employeeId ? "cursor-pointer" : ""}`}
        >
          <Avatar className="shrink-0 shadow">
            <AvatarFallback className="text-white font-extrabold text-[0.85rem]" style={{ background: `linear-gradient(${gradient})` }}>
              {letter}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className={`text-[13px] font-bold text-foreground leading-tight truncate transition-colors ${p.employeeId ? "group-hover/card:text-primary" : ""}`}>
              {name}
            </p>
            {email && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 min-w-0 mt-0.5">
                    <Mail className="size-2.5 text-slate-300 shrink-0" />
                    <span className="text-[11px] text-muted-foreground truncate max-w-[180px]">{email}</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent>{email}</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {onRemove && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleRemove}
                disabled={removing}
                className="shrink-0 text-destructive bg-destructive/5 border border-destructive/20 hover:bg-destructive/10"
              >
                {removing ? <Spinner className="size-3" /> : <Trash2 className="size-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t(`${pp}.tooltip_remove`)}</TooltipContent>
          </Tooltip>
        )}
      </div>

      <span
        onClick={dept ? handleNavigateDept : undefined}
        className={`group/dept self-start flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 transition-colors ${p.department?.id ? "cursor-pointer hover:bg-primary/10" : ""}`}
      >
        <Building2 className="size-2.5 text-slate-400" />
        <span
          className={`text-[10px] font-semibold whitespace-nowrap transition-colors ${
            dept ? "text-slate-500 group-hover/dept:text-primary" : "italic text-slate-400"
          }`}
        >
          {dept ?? t(`${pp}.no_department`)}
        </span>
      </span>

      <div className="flex items-center justify-between gap-2">
        {sc ? (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border"
            style={{ background: sc.bg, borderColor: sc.border }}
          >
            {StatusIcon && <StatusIcon className="size-[11px]" style={{ color: sc.color }} />}
            <span className="text-[11px] font-bold whitespace-nowrap" style={{ color: sc.color }}>
              {status && t(`${pp}.participant_status.${status}`)}
            </span>
          </span>
        ) : (
          <span className="text-[11px] text-slate-300">—</span>
        )}

        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border"
          style={{ background: `${roleColor}0F`, borderColor: `${roleColor}28` }}
        >
          {RoleIcon && <RoleIcon className="!size-[11px]" style={{ color: roleColor }} />}
          <span className="text-[11px] font-bold whitespace-nowrap" style={{ color: roleColor }}>{roleLabel}</span>
        </span>
      </div>
    </div>
  );
});
ParticipantCard.displayName = "ParticipantCard";

// ─── Employee picker row ──────────────────────────────────────────────────────

interface EmployeePickerRowProps {
  employee: NonParticipant;
  isLast: boolean;
  onAdd: (id: string) => void;
  adding: boolean;
  disabled: boolean;
}

const EmployeePickerRow = memo<EmployeePickerRowProps>(({ employee: e, isLast, onAdd, adding, disabled }) => {
  const { t } = useTranslation("dashboard");
  const pp = "pages.campaigns.detail.participants";
  const du = "pages.campaigns.detail";

  const name      = (e.firstName && e.lastName) ? `${e.firstName} ${e.lastName}` : e.firstName || e.username || t(`${du}.unknown_user`);
  const email     = e.email ?? "";
  const letter    = name[0]?.toUpperCase() || "U";
  const roleEntry = ROLES.find((r) => r.value === e.role || r.value === (e.role ?? "").toLowerCase());
  const roleColor = roleEntry?.color ?? "#6B7280";
  const roleLabel = roleEntry?.label || e.role || "—";
  const RoleIcon  = roleEntry?.icon ?? null;
  const gradient  = pickGradient(email || name);

  const handleAdd = useCallback(() => {
    if (!adding && !disabled) onAdd(e._id);
  }, [adding, disabled, onAdd, e._id]);

  return (
    <div className={`flex items-center gap-4 px-5 py-3 transition-colors hover:bg-primary/[0.02] ${isLast ? "" : "border-b border-border/60"}`}>
      <Avatar className="shrink-0 shadow">
        <AvatarFallback className="text-white font-extrabold text-[0.85rem]" style={{ background: `linear-gradient(${gradient})` }}>
          {letter}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-foreground leading-tight truncate">{name}</p>
        <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
          {email && (
            <span className="flex items-center gap-1 min-w-0">
              <Mail className="size-2.5 text-slate-300 shrink-0" />
              <span className="text-[11px] text-muted-foreground truncate max-w-[200px]">{email}</span>
            </span>
          )}
          {e.department && (
            <>
              <span className="size-[3px] rounded-full bg-border shrink-0" />
              <span className="flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded-md bg-slate-100 border border-border">
                <Building2 className="size-2.5 text-slate-500" />
                <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">{e.department.name}</span>
              </span>
            </>
          )}
        </div>
      </div>

      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border shrink-0"
        style={{ background: `${roleColor}0D`, borderColor: `${roleColor}28` }}
      >
        {RoleIcon && <RoleIcon className="!size-2.5" style={{ color: roleColor }} />}
        <span className="text-[11px] font-bold whitespace-nowrap" style={{ color: roleColor }}>{roleLabel}</span>
      </span>

      <Button
        type="button"
        onClick={handleAdd}
        disabled={adding || disabled}
        className="shrink-0 min-w-[72px] justify-center bg-primary/10 text-primary border border-primary/25 hover:bg-primary/15 shadow-none"
      >
        {adding ? <Spinner className="size-3" /> : <Plus className="size-3.5" />}
        {adding ? t(`${pp}.adding`) : t(`${pp}.add_button`)}
      </Button>
    </div>
  );
});
EmployeePickerRow.displayName = "EmployeePickerRow";

// ─── Add Participant Dialog ───────────────────────────────────────────────────

interface AddDialogProps {
  open: boolean;
  campaignId: string;
  onClose: () => void;
}

const AddParticipantDialog = memo<AddDialogProps>(({ open, campaignId, onClose }) => {
  const { t } = useTranslation("dashboard");
  const pp = "pages.campaigns.detail.participants";

  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [department,      setDepartment]      = useState("");
  const [role,            setRole]            = useState("");
  const [page,            setPage]            = useState(1);
  const [addingId,        setAddingId]        = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nonParticipantParams = useMemo(() => ({
    campaignId,
    search:     debouncedSearch || undefined,
    department: department      || undefined,
    role:       role            || undefined,
    page,
    limit: PICKER_PAGE_SIZE,
  }), [campaignId, debouncedSearch, department, role, page]);

  const { data: nonParticipantsRaw, isLoading: loading, error: queryError } = useNonParticipantsQuery(
    open ? nonParticipantParams : { campaignId: "", page: 1 },
  );
  const { data: deptsRaw } = useDepartmentsQuery();
  const addMut = useAddParticipantMutation(campaignId);

  const nonParticipantsData = (nonParticipantsRaw as any)?.data ?? nonParticipantsRaw;
  const employees   = nonParticipantsData?.employees ?? nonParticipantsData?.members ?? nonParticipantsData ?? [];
  const total       = nonParticipantsData?.total ?? 0;
  const error       = queryError ? String(queryError) : null;
  const departments = (Array.isArray(deptsRaw) ? deptsRaw : (deptsRaw as any)?.data) ?? [];

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current!);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(value); setPage(1); }, 300);
  }, []);

  const handleAdd = useCallback(async (employeeId: string) => {
    setAddingId(employeeId);
    addMut.mutate(employeeId, {
      onSettled: () => setAddingId(null),
    });
  }, [addMut]);

  const clearAllFilters = useCallback(() => {
    setSearch(""); setDebouncedSearch(""); setDepartment(""); setRole("");
  }, []);

  const hasFilters = !!debouncedSearch || !!department || !!role;
  const activeDeptLabel = department ? (departments as any[]).find((d) => d._id === department)?.name : null;
  const activeRoleLabel = role ? ROLES.find((r) => r.value === role)?.label : null;

  const subtitleText = loading
    ? t(`${pp}.add_loading_hint`)
    : total === 0
      ? t(`${pp}.add_none_available`)
      : t(`${pp}.add_available`, { count: total });

  const paginationText = total > 0 ? t(`${pp}.pagination_showing`, {
    from: Math.min((page - 1) * PICKER_PAGE_SIZE + 1, total),
    to: Math.min(page * PICKER_PAGE_SIZE, total),
    total,
  }) : "";

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="p-0 gap-0 overflow-hidden rounded-2xl sm:max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 pl-6 pr-10 pt-6 pb-4 bg-gradient-to-br from-primary/5 to-transparent shrink-0">
          <div className="flex items-center justify-center size-10 rounded-xl shrink-0 bg-primary/10 border border-primary/20">
            <UserPlus className="size-[19px] text-primary" />
          </div>
          <div className="min-w-0">
            <DialogTitle className="text-[15px] font-extrabold text-foreground">
              {t(`${pp}.add_dialog_title`)}
            </DialogTitle>
            <DialogDescription className="text-xs mt-0.5">
              {subtitleText}
            </DialogDescription>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-border bg-muted/20 shrink-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex-1 min-w-[190px] flex items-center border border-border rounded-xl px-3 py-1.5 bg-background shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
              <Search className="size-[15px] text-muted-foreground shrink-0 mr-2" />
              <input
                type="text"
                placeholder={t(`${pp}.search_placeholder`)}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                autoFocus
                className="border-none outline-none bg-transparent text-[13px] text-foreground w-full font-[inherit]"
              />
              {search && (
                <button type="button" onClick={() => handleSearchChange("")} className="p-0.5 ml-1 text-muted-foreground hover:text-foreground cursor-pointer">
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <Select
              value={department || "__all__"}
              onValueChange={(v) => setDepartment(v === "__all__" ? "" : v)}
            >
              <SelectTrigger size="sm" className="min-w-[140px] bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t(`${pp}.all_departments`)}</SelectItem>
                {(departments as any[]).map((d) => (
                  <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={role || "__all__"}
              onValueChange={(v) => setRole(v === "__all__" ? "" : v)}
            >
              <SelectTrigger size="sm" className="min-w-[130px] bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t(`${pp}.all_roles`)}</SelectItem>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(activeDeptLabel || activeRoleLabel) && (
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mr-0.5">
                {t(`${pp}.filters_label`)}
              </span>
              {activeDeptLabel && (
                <button
                  type="button"
                  onClick={() => setDepartment("")}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/25 hover:bg-primary/15 cursor-pointer"
                >
                  <span className="text-[11px] font-bold text-primary">{activeDeptLabel}</span>
                  <X className="size-2.5 text-primary" />
                </button>
              )}
              {activeRoleLabel && (
                <button
                  type="button"
                  onClick={() => setRole("")}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/25 hover:bg-primary/15 cursor-pointer"
                >
                  <span className="text-[11px] font-bold text-primary">{activeRoleLabel}</span>
                  <X className="size-2.5 text-primary" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Employee list */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-background">
          {error ? (
            <div className="m-4 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</div>
          ) : loading && (employees as any[]).length === 0 ? (
            <div className="py-1">
              {SKELETON_ROWS_8.map((_, i) => <PickerRowSkeleton key={i} />)}
            </div>
          ) : (employees as any[]).length === 0 ? (
            <div className="text-center py-14 px-6">
              <div className="flex items-center justify-center size-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 mx-auto mb-3">
                <Users className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-bold text-slate-700 mb-1">
                {hasFilters ? t(`${pp}.empty_filtered_title`) : t(`${pp}.empty_all_added_title`)}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {hasFilters ? t(`${pp}.empty_filtered_hint`) : t(`${pp}.empty_all_added_hint`)}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/25 hover:bg-primary/15 cursor-pointer"
                >
                  <X className="size-3.5 text-primary" />
                  <span className="text-xs font-bold text-primary">{t(`${pp}.clear_all_filters`)}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="py-0.5">
              {(employees as NonParticipant[]).map((emp, i) => (
                <EmployeePickerRow
                  key={emp._id}
                  employee={emp}
                  isLast={i === (employees as any[]).length - 1}
                  onAdd={handleAdd}
                  adding={addingId === emp._id}
                  disabled={!!(addMut.isPending && addingId !== emp._id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pt-3 pb-5 border-t border-border bg-muted/20 shrink-0 flex flex-col gap-2.5">
          {!loading && total > PICKER_PAGE_SIZE && (
            <Pagination page={page} totalPages={Math.ceil(total / PICKER_PAGE_SIZE)} onPageChange={setPage} />
          )}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{paginationText}</p>
            <Button type="button" onClick={onClose}>
              {t(`${pp}.done`)}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});
AddParticipantDialog.displayName = "AddParticipantDialog";

// ─── Main component ───────────────────────────────────────────────────────────

interface Props { campaignId: string; mode?: "company" | "employee"; anonymityMode?: string }

const CampaignParticipantsTab = memo<Props>(({ campaignId, mode = "company" }) => {
  const { t } = useTranslation("dashboard");
  const pp = "pages.campaigns.detail.participants";

  const isCompany = mode === "company";

  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter,    setStatusFilter]    = useState<ParticipantStatus | "">("");
  const [page,            setPage]            = useState(1);
  const [addDialogOpen,   setAddDialogOpen]   = useState(false);
  const [removingId,      setRemovingId]      = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const participantParams = useMemo(() => ({
    campaignId,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    page,
    limit: PAGE_SIZE,
  }), [campaignId, debouncedSearch, statusFilter, page]);

  const { data: participantsRaw, isLoading: loading, error: queryError } = useCampaignParticipantsQuery(participantParams);
  const removeMut = useRemoveParticipantMutation(campaignId);

  const participants     = participantsRaw?.data ?? [];
  const total            = participantsRaw?.total ?? 0;
  const statusCounts     = participantsRaw?.statusCounts;
  const error            = queryError ? String(queryError) : null;

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current!);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(value); setPage(1); }, 300);
  }, []);

  const toggleStatusFilter = useCallback((s: ParticipantStatus) => {
    setStatusFilter((prev) => (prev === s ? "" : s));
    setPage(1);
  }, []);

  const clearStatusFilter = useCallback(() => { setStatusFilter(""); setPage(1); }, []);
  const selectStatusFilter = useCallback((s: ParticipantStatus | "") => { setStatusFilter(s); setPage(1); }, []);

  const handleRemoveParticipant = useCallback((participantId: string) => {
    setRemovingId(participantId);
    removeMut.mutate(participantId, {
      onSettled: () => setRemovingId(null),
    });
  }, [removeMut]);

  const openAddDialog  = useCallback(() => setAddDialogOpen(true), []);
  const closeAddDialog = useCallback(() => setAddDialogOpen(false), []);
  const clearSearch    = useCallback(() => handleSearchChange(""), [handleSearchChange]);
  const hasActiveFilters = !!(debouncedSearch || statusFilter);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col gap-4">

        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between gap-3 flex-wrap">

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={clearStatusFilter}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
                !statusFilter ? "bg-primary/10 border-primary/30" : "bg-muted/40 border-border hover:bg-muted/60"
              }`}
            >
              <Users className="size-[13px] text-muted-foreground" />
              <span className="text-xs font-bold text-foreground">{loading ? "…" : total}</span>
              <span className="text-[11px] text-muted-foreground">{t(`${pp}.toolbar_total`)}</span>
            </button>
            {(["COMPLETED", "IN_PROGRESS", "INVITED", "DROPPED"] as ParticipantStatus[]).map((s) => {
              const count = statusCounts?.[s] ?? 0;
              if (!count && statusFilter !== s) return null;
              const sc = PARTICIPANT_STATUS_META[s];
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleStatusFilter(s)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border cursor-pointer transition-all"
                  style={{
                    background: active ? sc.color : sc.bg,
                    borderColor: active ? sc.color : sc.border,
                    boxShadow: active ? `0 0 0 2px ${sc.color}30` : undefined,
                  }}
                >
                  <span className="size-1.5 rounded-full" style={{ background: active ? "#fff" : sc.color }} />
                  <span className="text-[11px] font-bold" style={{ color: active ? "#fff" : sc.color }}>
                    {count} {t(`${pp}.participant_status.${s}`)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={statusFilter || "__all__"}
              onValueChange={(v) => selectStatusFilter(v === "__all__" ? "" : (v as ParticipantStatus))}
            >
              <SelectTrigger size="sm" className="min-w-[150px] bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t(`${pp}.all_statuses`)}</SelectItem>
                {(["INVITED", "IN_PROGRESS", "COMPLETED", "DROPPED"] as ParticipantStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{t(`${pp}.participant_status.${s}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center bg-background border border-border rounded-xl px-3 py-1.5 min-w-[220px] shadow-sm">
              <Search className="size-[15px] text-muted-foreground shrink-0 mr-2" />
              <input
                type="text"
                placeholder={t(`${pp}.search_participants_placeholder`)}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="border-none outline-none bg-transparent text-[13px] text-foreground w-full font-[inherit]"
              />
              {search && (
                <button type="button" onClick={clearSearch} className="p-0.5 text-muted-foreground hover:text-foreground cursor-pointer">
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {isCompany && (
              <Button type="button" onClick={openAddDialog}>
                <UserPlus className="size-[15px]" />
                {t(`${pp}.add_button`)}
              </Button>
            )}
          </div>
        </div>

        {/* ── Participant cards ── */}
        {error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">{error}</div>
        ) : loading && (participants as any[]).length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {SKELETON_CARDS.map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (participants as any[]).length === 0 ? (
          <div className="bg-background border border-border rounded-2xl text-center py-16">
            <div className="flex items-center justify-center size-14 rounded-2xl bg-muted mx-auto mb-3">
              <Users className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-bold text-slate-700">
              {hasActiveFilters ? t(`${pp}.empty_search_title`) : t(`${pp}.empty_title`)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {hasActiveFilters ? t(`${pp}.empty_search_hint`) : t(`${pp}.empty_hint`)}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {(participants as CampaignParticipant[]).map((p) => (
              <ParticipantCard
                key={p._id}
                participant={p}
                onRemove={isCompany ? handleRemoveParticipant : undefined}
                removing={removingId === p._id}
              />
            ))}
          </div>
        )}

        {!loading && total > PAGE_SIZE && (
          <Pagination page={page} totalPages={Math.ceil(total / PAGE_SIZE)} onPageChange={setPage} />
        )}

        {isCompany && (
          <AddParticipantDialog
            open={addDialogOpen}
            campaignId={campaignId}
            onClose={closeAddDialog}
          />
        )}
      </div>
    </TooltipProvider>
  );
});
CampaignParticipantsTab.displayName = "CampaignParticipantsTab";

export default CampaignParticipantsTab;
