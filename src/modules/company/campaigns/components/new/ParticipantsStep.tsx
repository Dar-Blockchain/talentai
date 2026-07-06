"use client";

import React, { memo, useState, useRef, useCallback, useMemo } from "react";
import { Users, Building2 } from "lucide-react";
import type { FetchMembersFilters } from "@/modules/company/members/types";
import { useMembersQuery, useDepartmentsQuery } from "@/modules/company/employees/queries";
import { Pagination } from "@/modules/shared/ui/shadcn/pagination";
import { Checkbox } from "@/modules/shared/ui/shadcn/checkbox";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { EmployeesFilterBar, ROLE_LABELS, ROLE_STYLES } from "@/modules/company/employees/components/list";
import type { RoleFilter, SortOption } from "@/modules/company/employees/components/list";
import { ROLES } from "@/modules/shared/constants/employee";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const SORT_MAP: Record<SortOption, Pick<FetchMembersFilters, "sortBy" | "order">> = {
  newest:      { sortBy: "date", order: "desc" },
  "name-asc":  { sortBy: "name", order: "asc"  },
  "name-desc": { sortBy: "name", order: "desc" },
};

const AVATAR_GRADIENTS = [
  "135deg, #8310FF, #A855F7",
  "135deg, #0D9488, #34D399",
  "135deg, #0891B2, #38BDF8",
  "135deg, #D97706, #FCD34D",
  "135deg, #DC2626, #F87171",
];

function pickGradient(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length];
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

const EmployeeRowSkeleton = memo(() => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 last:border-0">
    <Skeleton className="size-5 rounded shrink-0" />
    <Skeleton className="size-9 rounded-full shrink-0" />
    <div className="flex-1 space-y-1.5">
      <Skeleton className="h-3.5 w-1/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <Skeleton className="h-5 w-16 rounded-full shrink-0" />
  </div>
));
EmployeeRowSkeleton.displayName = "EmployeeRowSkeleton";

// ─── Component ────────────────────────────────────────────────────────────────

interface ParticipantsStepProps {
  selected: string[];
  onChange: (ids: string[]) => void;
}

const ParticipantsStep = memo<ParticipantsStepProps>(({ selected, onChange }) => {
  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter,      setRoleFilter]      = useState<RoleFilter>("all");
  const [deptFilter,      setDeptFilter]      = useState("all");
  const [sortBy,          setSortBy]          = useState<SortOption>("newest");
  const [page,            setPage]            = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { sortBy: sortByParam, order } = SORT_MAP[sortBy];
  const memberFilters = useMemo<FetchMembersFilters>(() => ({
    search:       debouncedSearch || undefined,
    role:         roleFilter !== "all" ? roleFilter : undefined,
    departmentId: deptFilter  !== "all" ? deptFilter  : undefined,
    sortBy:       sortByParam,
    order,
    page,
    limit: PAGE_SIZE,
  }), [debouncedSearch, roleFilter, deptFilter, sortByParam, order, page]);

  const { data: membersRaw, isLoading: loading, error: membersError } = useMembersQuery(memberFilters);
  const { data: deptsRaw } = useDepartmentsQuery();

  const members     = (membersRaw as any)?.members ?? [];
  const pageTotal   = (membersRaw as any)?.total   ?? 0;
  const departments = (Array.isArray(deptsRaw) ? deptsRaw : (deptsRaw as any)?.data) ?? [];
  const error       = membersError ? String(membersError) : null;

  const hasFilters = !!(search || roleFilter !== "all" || deptFilter !== "all");

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current!);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(value); setPage(1); }, 300);
  }, []);

  const pageIds          = members.map((m: any) => m.userId ?? m._id);
  const allPageSelected  = pageIds.length > 0 && pageIds.every((id: string) => selected.includes(id));
  const somePageSelected = pageIds.some((id: string) => selected.includes(id)) && !allPageSelected;

  const toggleMember = useCallback((id: string) =>
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]),
  [onChange, selected]);

  const toggleAllOnPage = useCallback(() => {
    if (allPageSelected) onChange(selected.filter((id) => !pageIds.includes(id)));
    else                 onChange([...new Set([...selected, ...pageIds])]);
  }, [allPageSelected, onChange, selected, pageIds]);

  return (
    <div className="flex flex-col gap-4">
      {selected.length > 0 && (
        <div className="flex justify-end">
          <span className="inline-flex items-center h-6 px-2.5 rounded-full text-[11px] font-bold bg-primary text-primary-foreground shrink-0">
            {selected.length} selected
          </span>
        </div>
      )}

      {/* Filter bar */}
      <EmployeesFilterBar
        search={search}               onSearchChange={handleSearchChange}
        roleFilter={roleFilter}       onRoleFilterChange={(f) => { setRoleFilter(f); setPage(1); }}
        departmentFilter={deptFilter} onDepartmentFilterChange={(d) => { setDeptFilter(d); setPage(1); }}
        departments={departments}
        sortBy={sortBy}               onSortChange={(s) => { setSortBy(s); setPage(1); }}
        resultCount={pageTotal}
      />

      {/* Result count */}
      {!loading && !error && (
        <p className="text-xs text-muted-foreground">
          {pageTotal} employee{pageTotal !== 1 ? "s" : ""}
          {hasFilters ? " match your filters" : " total"}
        </p>
      )}

      {/* List */}
      <div className="border border-border rounded-xl overflow-hidden">
        {/* Select-all header */}
        {!loading && !error && members.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/40 border-b border-border">
            <Checkbox
              checked={allPageSelected}
              // @ts-ignore – indeterminate not typed in shadcn Checkbox but supported via ref
              data-indeterminate={somePageSelected || undefined}
              onCheckedChange={toggleAllOnPage}
              className="shrink-0"
            />
            <span className="text-xs font-semibold text-muted-foreground">
              Select all on this page ({members.length})
            </span>
          </div>
        )}

        {error ? (
          <div className="m-4 p-3.5 rounded-xl bg-destructive/8 border border-destructive/20 text-sm text-destructive">
            {error}
          </div>
        ) : loading ? (
          <div>
            {Array.from({ length: 6 }).map((_, i) => <EmployeeRowSkeleton key={i} />)}
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center">
              <Users className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {hasFilters ? "No employees match your filters" : "No employees found"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {hasFilters ? "Try adjusting your filters." : "Invite employees to your workspace first."}
              </p>
            </div>
          </div>
        ) : (
          members.map((member: any, i: number) => {
            const isSelected = selected.includes(member.userId);
            const name = (member.firstName && member.lastName)
              ? `${member.firstName} ${member.lastName}`
              : member.firstName || member.lastName || member.username || "Pending";
            const email     = member.email || "";
            const letter    = name[0]?.toUpperCase() || "U";
            const roleStr   = member.role as string;
            const roleEntry = ROLES.find((r) => r.value === roleStr || r.value === roleStr?.toLowerCase());
            const roleColor = roleEntry?.color ?? ROLE_STYLES[member.role]?.color ?? "#6B7280";
            const roleLabel = roleEntry?.label ?? ROLE_LABELS[member.role] ?? member.role;
            const RoleIcon  = roleEntry?.icon ?? null;
            const dept      = (member as any).department?.name ?? (member as any).departmentName ?? null;

            return (
              <div
                key={member.userId}
                onClick={() => toggleMember(member.userId)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
                  i < members.length - 1 && "border-b border-border/60",
                  isSelected ? "bg-primary/5" : "hover:bg-muted/40",
                )}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleMember(member.userId)}
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0"
                />

                {/* Avatar */}
                <div
                  className="size-9 rounded-full flex items-center justify-center text-[0.85rem] font-bold text-white shrink-0"
                  style={{ background: `linear-gradient(${pickGradient(email || name)})` }}
                >
                  {letter}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-semibold text-foreground leading-snug truncate">{name}</p>
                  <p className="text-[12px] text-muted-foreground truncate">{email}</p>
                  {dept && (
                    <span className="inline-flex items-center gap-0.5 mt-0.5">
                      <Building2 className="size-2.5 text-muted-foreground/60" />
                      <span className="text-[11px] text-muted-foreground/70 truncate">{dept}</span>
                    </span>
                  )}
                </div>

                {/* Role badge */}
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0"
                  style={{
                    backgroundColor: `${roleColor}10`,
                    border:          `1.5px solid ${roleColor}25`,
                    color:           roleColor,
                  }}
                >
                  {RoleIcon && <RoleIcon style={{ fontSize: 11 }} />}
                  {roleLabel}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {!loading && pageTotal > PAGE_SIZE && (
        <Pagination
          page={page}
          totalPages={Math.ceil(pageTotal / PAGE_SIZE)}
          onPageChange={setPage}
        />
      )}
    </div>
  );
});

ParticipantsStep.displayName = "ParticipantsStep";
export default ParticipantsStep;
