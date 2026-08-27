import React, { memo, useState, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import { Users, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import EmployeeCard from "./EmployeeCard";
import EmployeeSkeletonCard from "./EmployeeSkeletonCard";
import InvitationCard from "./InvitationCard";
import EmployeesFilterBar from "./EmployeesFilterBar";
import type { ExtendedMember } from "@/modules/company/employees/types";
import { Invitation } from "@/modules/company/employees/types/employee";
import { Department } from "@/modules/company/departments/types";
import { PURPLE, AMBER } from "./constants";
import { Pagination } from "@/modules/shared/ui/shadcn/pagination";
import { Alert, AlertDescription } from "@/modules/shared/ui/shadcn/alert";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";
import { cn } from "@/lib/utils";

export type RoleFilter = "all" | string;
export type SortOption = "newest" | "name-asc" | "name-desc";

const GRID_CLASS = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

const SKELETONS_12 = Array.from({ length: 12 }, (_, i) => <EmployeeSkeletonCard key={i} />);

// ─── TabPill ──────────────────────────────────────────────────────────────────

interface TabPillProps {
  id: "employees" | "invitations";
  label: string;
  icon: React.ReactNode;
  count: number | string;
  color: string;
  pulse?: boolean;
  active: boolean;
  onClick: (id: "employees" | "invitations") => void;
}

const TabPill: React.FC<TabPillProps> = memo(({ id, label, icon, count, color, pulse = false, active, onClick }) => {
  const handleClick = useCallback(() => onClick(id), [onClick, id]);

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-[9px] px-4 py-[7px] transition-all duration-[180ms]",
        active ? "bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]" : "bg-transparent hover:bg-[#EAECF0]",
      )}
    >
      <span className={cn("flex text-[16px]", active ? "" : "text-[#6B7280]")} style={active ? { color } : undefined}>
        {icon}
      </span>
      <span className={cn("whitespace-nowrap text-[13px] font-bold", active ? "text-[#111827]" : "text-[#6B7280]")}>
        {label}
      </span>
      <div className="relative">
        <span
          className="flex min-w-[20px] items-center justify-center rounded-[6px] px-[6px] py-0 text-[11px] font-extrabold"
          style={{
            backgroundColor: active ? `${color}18` : (pulse ? `${color}15` : "#E5E7EB"),
            color: active ? color : (pulse ? color : "#9CA3AF"),
          }}
        >
          {count}
        </span>
        {pulse && !active && (
          <span
            className="absolute -top-[3px] -right-[3px] size-[7px] animate-[blink_1.8s_ease-in-out_infinite] rounded-full border-[1.5px] border-[#F3F4F6]"
            style={{ backgroundColor: color }}
          />
        )}
      </div>
    </div>
  );
});
TabPill.displayName = "TabPill";

// ─── Main component ───────────────────────────────────────────────────────────

interface EmployeesListProps {
  members: ExtendedMember[];
  loading: boolean;
  fetchingMembers?: boolean;
  error: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: RoleFilter;
  onRoleFilterChange: (f: RoleFilter) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (d: string) => void;
  departments: Department[];
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
  onEdit: (member: ExtendedMember) => void;
  onDelete: (member: ExtendedMember) => void;
  onSelect: (member: ExtendedMember) => void;
  canInvite?: boolean;
  canAssignRoles?: boolean;
  canRemove?: boolean;
  invitations?: Invitation[];
  fetchingInvitations?: boolean;
  onResend?: (id: string) => Promise<void>;
  onCancel?: (id: string) => Promise<void>;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}

const EmployeesList: React.FC<EmployeesListProps> = memo(({
  members, loading, fetchingMembers = false, error, search, onSearchChange,
  roleFilter, onRoleFilterChange,
  departmentFilter, onDepartmentFilterChange, departments,
  sortBy, onSortChange,
  onEdit, onDelete, onSelect,
  canInvite = true, canAssignRoles = true, canRemove = true,
  invitations = [], fetchingInvitations = false, onResend, onCancel,
  total, page, pageSize, onPageChange,
}) => {
  const { t } = useTranslation("dashboard");
  const router = useRouter();
  // Lets a link elsewhere in the app (e.g. the dashboard's Pending
  // Invitations widget) open straight to the Invitations tab via
  // /company/employees?tab=invitations, instead of always defaulting here.
  const [tab, setTab] = useState<"employees" | "invitations">(
    router.query.tab === "invitations" ? "invitations" : "employees",
  );
  const handleTabChange = useCallback((id: "employees" | "invitations") => setTab(id), []);
  const panelRef = useRef<HTMLDivElement>(null);

  const handlePageChange = useCallback((p: number) => {
    onPageChange(p);
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [onPageChange]);

  const hasAnyFilter = roleFilter !== "all" || departmentFilter !== "all" || search.trim().length > 0;

  const memberCards = useMemo(() => members.map((m, i) => (
    <EmployeeCard key={m._id} member={m} index={i} onEdit={onEdit} onDelete={onDelete} onSelect={onSelect} canAssignRoles={canAssignRoles} canRemove={canRemove} />
  )), [members, onEdit, onDelete, onSelect, canAssignRoles, canRemove]);

  const invitationCards = useMemo(() => (onResend && onCancel)
    ? invitations.map((inv) => <InvitationCard key={inv._id} invitation={inv} onResend={onResend} onCancel={onCancel} />)
    : null,
  [invitations, onResend, onCancel]);

  const empCount = loading ? "…" : total;
  const invCount = fetchingInvitations ? "…" : invitations.length;
  const invPulse = invitations.length > 0;

  return (
    <div>
      {/* Top bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {/* Tab strip */}
        <div className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#F3F4F6] p-0.5">
          <TabPill
            id="employees" active={tab === "employees"}
            label={t("pages.employees.list.tab_employees")}
            icon={<Users className="size-4" />}
            count={empCount} color={PURPLE}
            onClick={handleTabChange}
          />
          {canInvite && (
            <TabPill
              id="invitations" active={tab === "invitations"}
              label={t("pages.employees.list.tab_invitations")}
              icon={<Mail className="size-4" />}
              count={invCount} color={AMBER} pulse={invPulse}
              onClick={handleTabChange}
            />
          )}
        </div>

        {tab === "employees" && (
          <EmployeesFilterBar
            search={search} onSearchChange={onSearchChange}
            roleFilter={roleFilter} onRoleFilterChange={onRoleFilterChange}
            departmentFilter={departmentFilter} onDepartmentFilterChange={onDepartmentFilterChange}
            departments={departments}
            sortBy={sortBy} onSortChange={onSortChange}
            resultCount={total}
          />
        )}

        {/* Mobile full-width break for filter bar */}
        {tab === "employees" && <div className="w-full max-[650px]:block hidden" />}
      </div>

      {/* Panel */}
      <div ref={panelRef} className="scroll-mt-6 rounded-2xl bg-[#F8FAF9] p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6">
        {tab === "employees" && (
          error ? (
            <Alert variant="destructive" className="rounded-xl">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : loading || fetchingMembers ? (
            <div className={GRID_CLASS}>{SKELETONS_12}</div>
          ) : members.length === 0 ? (
            <div className="py-20 text-center">
              <Users className="mx-auto mb-4 size-12 text-[#D1D5DB]" />
              <p className="text-[15px] font-semibold text-[#374151]">
                {hasAnyFilter ? t("pages.employees.list.empty_employees_filtered") : t("pages.employees.list.empty_employees_none")}
              </p>
              <p className="mt-1 text-[13px] text-[#9CA3AF]">
                {hasAnyFilter ? t("pages.employees.list.empty_employees_filtered_hint") : t("pages.employees.list.empty_employees_hint")}
              </p>
            </div>
          ) : (
            <div className={GRID_CLASS}>{memberCards}</div>
          )
        )}

        {tab === "invitations" && (
          fetchingInvitations ? (
            <div className="flex justify-center py-16">
              <Spinner className="size-7" style={{ color: AMBER }} />
            </div>
          ) : invitations.length === 0 ? (
            <div className="py-20 text-center">
              <Mail className="mx-auto mb-4 size-12 text-[#D1D5DB]" />
              <p className="text-[15px] font-semibold text-[#374151]">{t("pages.employees.list.empty_invitations_title")}</p>
              <p className="mt-1 text-[13px] text-[#9CA3AF]">{t("pages.employees.list.empty_invitations_sub")}</p>
            </div>
          ) : (
            <div className={GRID_CLASS}>{invitationCards}</div>
          )
        )}
      </div>

      {tab === "employees" && !loading && !error && (
        <Pagination page={page} totalPages={Math.ceil(total / pageSize)} onPageChange={handlePageChange} className="mt-5 justify-end" />
      )}
    </div>
  );
});

EmployeesList.displayName = "EmployeesList";
export default EmployeesList;
