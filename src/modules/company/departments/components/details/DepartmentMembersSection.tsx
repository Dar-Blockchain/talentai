"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation }           from "react-i18next";
import { Users, UserPlus, Mail, Loader2, AlertTriangle } from "lucide-react";
import type { Member } from "@/modules/company/members/types";
import {
  useMembersQuery,
  useInviteEmployeeMutation,
  useResendInvitationMutation,
  useCancelInvitationMutation,
  useInvitationsByDepartmentQuery,
} from "@/modules/company/employees/queries";

const GRID_CLS = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";
import { Button }                   from "@/modules/shared/ui/shadcn/button";
import { useToast }                 from "@/hooks/useToast";
import { cn }                       from "@/lib/utils";
import AddEmployeeModal from "@/modules/company/employees/components/create/AddEmployeeModal";
import { AMBER, EmployeeCard, EmployeesFilterBar, EmployeeSkeletonCard, InvitationCard, RoleFilter, SortOption } from "@/modules/company/employees/components/list";
import { PURPLE } from "@/modules/company/constants";
import { Pagination } from "@/modules/shared/ui/shadcn/pagination";

const PAGE_SIZE = 9;

const SORT_MAP: Record<SortOption, { sortBy: "date" | "name"; order: "asc" | "desc" }> = {
  newest:      { sortBy: "date", order: "desc" },
  "name-asc":  { sortBy: "name", order: "asc"  },
  "name-desc": { sortBy: "name", order: "desc" },
};

interface DepartmentMembersSectionProps {
  departmentId:    string;
  canManage?:      boolean;
  canAssignRoles?: boolean;
  canRemove?:      boolean;
  onEdit?:   (member: Member) => void;
  onDelete?: (member: Member) => void;
}

const TabPill: React.FC<{
  active:  boolean;
  label:   string;
  icon:    React.ReactNode;
  count:   number | string;
  color:   string;
  pulse?:  boolean;
  onClick: () => void;
}> = ({ active, label, icon, count, color, pulse, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-all",
      active ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:bg-gray-200/60",
    )}
  >
    <span style={{ color: active ? color : undefined }}>{icon}</span>
    <span>{label}</span>
    <span
      className={cn(
        "relative min-w-5 h-5 px-1.5 rounded-md flex items-center justify-center text-[11px] font-extrabold",
        active ? "" : pulse ? "" : "bg-gray-200 text-gray-400",
      )}
      style={active || pulse ? { backgroundColor: `${color}18`, color } : undefined}
    >
      {count}
      {pulse && !active && (
        <span
          className="absolute -top-1 -right-1 size-1.5 rounded-full border-[1.5px] border-gray-100 animate-pulse"
          style={{ backgroundColor: color }}
        />
      )}
    </span>
  </button>
);

const DepartmentMembersSection: React.FC<DepartmentMembersSectionProps> = ({
  departmentId, canManage = true, canAssignRoles = true, canRemove = true,
  onEdit, onDelete,
}) => {
  const { t }        = useTranslation("dashboard");
  const { showToast } = useToast();

  const [tab,             setTab]             = useState<"members" | "invitations">("members");
  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter,      setRoleFilter]      = useState<RoleFilter>("all");
  const [sortBy,          setSortBy]          = useState<SortOption>("newest");
  const [page,            setPage]            = useState(1);
  const [inviteOpen,      setInviteOpen]      = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { sortBy: sb, order } = SORT_MAP[sortBy];
  const { data: membersData, isLoading: loading, error: membersError } = useMembersQuery({
    departmentId, search: debouncedSearch || undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
    sortBy: sb, order, page, limit: PAGE_SIZE,
  });
  const members   = membersData?.members ?? [];
  const pageTotal = membersData?.total   ?? 0;
  const error     = membersError ? (membersError as Error).message : null;

  const {
    data: invitations = [],
    isLoading: invLoading,
    invalidate: invalidateInvitations,
  } = useInvitationsByDepartmentQuery(departmentId);

  const inviteMutation = useInviteEmployeeMutation();
  const resendMutation = useResendInvitationMutation();
  const cancelMutation = useCancelInvitationMutation();

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current!);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(value); setPage(1); }, 300);
  }, []);

  useEffect(() => { setPage(1); }, [debouncedSearch, roleFilter, sortBy]);

  const handleInvite = useCallback(async (email: string, role: string, deptId?: string) => {
    await inviteMutation.mutateAsync({ email, role, departmentId: deptId || departmentId });
    setInviteOpen(false);
    showToast({ message: t("pages.departments.members_panel.toast_invite_sent"), severity: "success" });
    invalidateInvitations();
  }, [inviteMutation, departmentId, showToast, t, invalidateInvitations]);

  const handleResend = useCallback(async (id: string) => {
    await resendMutation.mutateAsync(id);
    showToast({ message: t("pages.departments.members_panel.toast_invite_resent"), severity: "success" });
    invalidateInvitations();
  }, [resendMutation, showToast, t, invalidateInvitations]);

  const handleCancel = useCallback(async (id: string) => {
    await cancelMutation.mutateAsync(id);
    showToast({ message: t("pages.departments.members_panel.toast_invite_cancelled"), severity: "info" });
  }, [cancelMutation, showToast, t]);

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Tabs */}
        <div className="inline-flex items-center bg-gray-100 rounded-xl p-1 gap-1 shrink-0">
          <TabPill
            active={tab === "members"}
            label={t("pages.departments.members_panel.tab_members")}
            icon={<Users className="size-4" />}
            count={loading ? t("pages.departments.detail.loading_short") : pageTotal}
            color={PURPLE}
            onClick={() => setTab("members")}
          />
          <TabPill
            active={tab === "invitations"}
            label={t("pages.departments.members_panel.tab_invitations")}
            icon={<Mail className="size-4" />}
            count={invLoading ? t("pages.departments.detail.loading_short") : invitations.length}
            color={AMBER}
            pulse={invitations.length > 0}
            onClick={() => setTab("invitations")}
          />
        </div>

        {tab === "members" && (
          <EmployeesFilterBar
            search={search}           onSearchChange={handleSearchChange}
            roleFilter={roleFilter}   onRoleFilterChange={f => { setRoleFilter(f); setPage(1); }}
            departmentFilter="all"    onDepartmentFilterChange={() => {}}
            departments={[]}
            sortBy={sortBy}           onSortChange={s => { setSortBy(s); setPage(1); }}
            resultCount={pageTotal}
            hideDepartmentFilter
          />
        )}

        {canManage && (
          <div className="ml-auto">
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              <UserPlus className="size-3.5" />
              {t("pages.departments.members_panel.invite_employee")}
            </Button>
          </div>
        )}
      </div>

      {/* Panel */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">

        {tab === "members" && (
          error ? (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
              <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          ) : loading ? (
            <div className={GRID_CLS}>
              {Array.from({ length: PAGE_SIZE }).map((_, i) => <EmployeeSkeletonCard key={i} />)}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="size-12 text-gray-300 mx-auto mb-3" />
              <p className="text-[15px] font-semibold text-gray-700">
                {search || roleFilter !== "all"
                  ? t("pages.departments.members_panel.empty_members_filtered_title")
                  : t("pages.departments.members_panel.empty_members_title")}
              </p>
              <p className="text-[13px] text-gray-400 mt-1">
                {search || roleFilter !== "all"
                  ? t("pages.departments.members_panel.empty_members_filtered_hint")
                  : t("pages.departments.members_panel.empty_members_hint")}
              </p>
            </div>
          ) : (
            <div className={GRID_CLS}>
              {members.map((m, i) => (
                <EmployeeCard
                  key={m._id} member={m as Member} index={i}
                  onEdit={m => onEdit?.(m)} onDelete={m => onDelete?.(m)}
                  onSelect={() => {}}
                  canAssignRoles={canAssignRoles} canRemove={canRemove}
                />
              ))}
            </div>
          )
        )}

        {tab === "invitations" && (
          invLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="size-6 animate-spin" style={{ color: AMBER }} />
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="size-12 text-gray-300 mx-auto mb-3" />
              <p className="text-[15px] font-semibold text-gray-700">
                {t("pages.departments.members_panel.empty_invitations_title")}
              </p>
              <p className="text-[13px] text-gray-400 mt-1">
                {t("pages.departments.members_panel.empty_invitations_hint")}
              </p>
            </div>
          ) : (
            <div className={GRID_CLS}>
              {invitations.map(inv => (
                <InvitationCard
                  key={inv._id} invitation={inv}
                  onResend={handleResend} onCancel={handleCancel}
                />
              ))}
            </div>
          )
        )}
      </div>

      {tab === "members" && !loading && !error && (
        <Pagination page={page} totalPages={Math.ceil(pageTotal / PAGE_SIZE)} onPageChange={setPage} />
      )}

      <AddEmployeeModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSave={handleInvite}
        defaultDepartmentId={departmentId}
      />
    </div>
  );
};

export default DepartmentMembersSection;
