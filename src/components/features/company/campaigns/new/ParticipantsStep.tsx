"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Box, Typography, Checkbox, Avatar, Chip, Skeleton, Alert,
} from "@mui/material";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import { fetchMembers, selectMembers, FetchMembersFilters } from "@/store/slices/memberSlice";
import { fetchDepartments, selectDepartments } from "@/store/slices/departmentSlice";
import Pagination from "@/components/ui/Pagination";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import EmployeesFilterBar from "@/components/features/company/employees/list/EmployeesFilterBar";
import { RoleFilter, SortOption } from "@/components/features/company/employees/list/EmployeesList";
import { ROLE_LABELS, ROLE_STYLES } from "@/components/features/company/employees/list/EmployeeCard";
import { ROLES } from "@/constants/employee";

const PURPLE = "#8310FF";
const PAGE_SIZE = 10;

const SORT_MAP: Record<SortOption, Pick<FetchMembersFilters, "sortBy" | "order">> = {
  newest:    { sortBy: "date", order: "desc" },
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

const EmployeeRowSkeleton: React.FC = () => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 2, px: 2, py: 1.5, borderBottom: "1px solid #F3F4F6" }}>
    <Skeleton variant="rectangular" width={20} height={20} sx={{ borderRadius: 0.5, flexShrink: 0 }} />
    <Skeleton variant="circular" width={36} height={36} sx={{ flexShrink: 0 }} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="35%" height={16} />
      <Skeleton variant="text" width="55%" height={13} />
    </Box>
    <Skeleton variant="rounded" width={72} height={22} sx={{ borderRadius: "6px", flexShrink: 0 }} />
  </Box>
);

interface ParticipantsStepProps {
  selected: string[];
  onChange: (ids: string[]) => void;
}

const ParticipantsStep: React.FC<ParticipantsStepProps> = ({ selected, onChange }) => {
  const dispatch    = useDispatch<AppDispatch>();
  const { members, pageTotal, loading, error } = useSelector(selectMembers);
  const departments = useSelector(selectDepartments);

  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter,      setRoleFilter]      = useState<RoleFilter>("all");
  const [deptFilter,      setDeptFilter]      = useState("all");
  const [sortBy,          setSortBy]          = useState<SortOption>("newest");
  const [page,            setPage]            = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    dispatch(fetchDepartments(undefined));
  }, [dispatch]);

  // debounce search
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  }, []);

  // reset page when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, roleFilter, deptFilter, sortBy]);

  // fetch members
  useEffect(() => {
    const { sortBy: sortByParam, order } = SORT_MAP[sortBy];
    dispatch(fetchMembers({
      search:       debouncedSearch || undefined,
      role:         roleFilter !== "all" ? roleFilter : undefined,
      departmentId: deptFilter  !== "all" ? deptFilter  : undefined,
      sortBy:       sortByParam,
      order,
      page,
      limit: PAGE_SIZE,
    }));
  }, [dispatch, debouncedSearch, roleFilter, deptFilter, sortBy, page]);

  const pageIds         = members.map((m) => m._id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.includes(id));
  const somePageSelected = pageIds.some((id) => selected.includes(id)) && !allPageSelected;

  const toggleMember = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  const toggleAllOnPage = () => {
    if (allPageSelected) onChange(selected.filter((id) => !pageIds.includes(id)));
    else                 onChange([...new Set([...selected, ...pageIds])]);
  };

  return (
    <Box>
      {/* Info banner */}
      <Box sx={{
        display: "flex", alignItems: "center", gap: 1.5,
        p: 2, mb: 2.5, borderRadius: 2,
        bgcolor: "#F5F3FF", border: `1px solid ${PURPLE}20`,
      }}>
        <PeopleAltOutlined sx={{ fontSize: 18, color: PURPLE, flexShrink: 0 }} />
        <Typography sx={{ fontSize: "13px", color: "#374151" }}>
          Select the employees who can participate in this campaign. Leave empty to allow all employees.
        </Typography>
        {selected.length > 0 && (
          <Chip
            label={`${selected.length} selected`}
            size="small"
            sx={{
              fontWeight: 700, fontSize: "12px",
              bgcolor: PURPLE, color: "#fff",
              ml: "auto", flexShrink: 0,
              "& .MuiChip-label": { px: 1.5 },
            }}
          />
        )}
      </Box>

      {/* Filter bar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <EmployeesFilterBar
          search={search}               onSearchChange={handleSearchChange}
          roleFilter={roleFilter}       onRoleFilterChange={(f) => { setRoleFilter(f); setPage(1); }}
          departmentFilter={deptFilter} onDepartmentFilterChange={(d) => { setDeptFilter(d); setPage(1); }}
          departments={departments}
          sortBy={sortBy}               onSortChange={(s) => { setSortBy(s); setPage(1); }}
          resultCount={pageTotal}
        />
      </Box>

      {/* Results count */}
      {!loading && !error && (
        <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mb: 1.5 }}>
          {pageTotal} employee{pageTotal !== 1 ? "s" : ""}
          {search || roleFilter !== "all" || deptFilter !== "all" ? " match your filters" : " total"}
        </Typography>
      )}

      {/* Employee list */}
      <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: 3, overflow: "hidden" }}>
        {/* Select all header */}
        {!loading && !error && members.length > 0 && (
          <Box sx={{
            display: "flex", alignItems: "center", gap: 1.5,
            px: 2, py: 1.25, bgcolor: "#F9FAFB", borderBottom: "1px solid #E5E7EB",
          }}>
            <Checkbox
              size="small"
              checked={allPageSelected}
              indeterminate={somePageSelected}
              onChange={toggleAllOnPage}
              sx={{ color: "#D1D5DB", "&.Mui-checked": { color: PURPLE }, "&.MuiCheckbox-indeterminate": { color: PURPLE }, p: 0 }}
            />
            <Typography sx={{ fontSize: "12px", fontWeight: 600, color: "#6B7280" }}>
              Select all on this page ({members.length})
            </Typography>
          </Box>
        )}

        {error ? (
          <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>{error}</Alert>
        ) : loading ? (
          <Box>{Array.from({ length: 6 }).map((_, i) => <EmployeeRowSkeleton key={i} />)}</Box>
        ) : members.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <PeopleAltOutlined sx={{ fontSize: 40, color: "#D1D5DB", mb: 1.5 }} />
            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>
              {search || roleFilter !== "all" || deptFilter !== "all"
                ? "No employees match your filters"
                : "No employees found"}
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#9CA3AF", mt: 0.5 }}>
              {search || roleFilter !== "all" || deptFilter !== "all"
                ? "Try adjusting your filters."
                : "Invite employees to your workspace first."}
            </Typography>
          </Box>
        ) : (
          members.map((member, i) => {
            const isSelected = selected.includes(member._id);
            const name = (member.firstName && member.lastName)
              ? `${member.firstName} ${member.lastName}`
              : member.firstName || member.lastName || member.username || "Pending";
            const email      = member.email || "";
            const letter     = name[0]?.toUpperCase() || "U";
            const roleStr    = member.role as string;
            const roleEntry  = ROLES.find((r) => r.value === roleStr || r.value === roleStr.toLowerCase());
            const roleColor  = roleEntry?.color ?? ROLE_STYLES[member.role]?.color ?? "#6B7280";
            const roleLabel  = roleEntry?.label ?? ROLE_LABELS[member.role] ?? member.role;
            const RoleIcon   = roleEntry?.icon ?? null;
            const dept       = (member as any).department?.name ?? (member as any).departmentName ?? null;

            return (
              <Box
                key={member._id}
                onClick={() => toggleMember(member._id)}
                sx={{
                  display: "flex", alignItems: "center", gap: 2,
                  px: 2, py: 1.5, cursor: "pointer",
                  borderBottom: i < members.length - 1 ? "1px solid #F3F4F6" : "none",
                  bgcolor: isSelected ? "#F5F3FF" : "transparent",
                  "&:hover": { bgcolor: isSelected ? "#EDE9FE" : "#F9FAFB" },
                  transition: "background-color 0.15s",
                }}
              >
                <Checkbox
                  size="small" checked={isSelected}
                  onChange={() => toggleMember(member._id)}
                  onClick={(e) => e.stopPropagation()}
                  sx={{ color: "#D1D5DB", "&.Mui-checked": { color: PURPLE }, p: 0, flexShrink: 0 }}
                />
                <Avatar sx={{
                  width: 36, height: 36, fontSize: "0.85rem", fontWeight: 700, color: "#fff",
                  background: `linear-gradient(${pickGradient(email || name)})`, flexShrink: 0,
                }}>
                  {letter}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#111827", lineHeight: 1.3 }}>
                    {name}
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {email}
                  </Typography>
                  {dept && (
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, mt: 0.4 }}>
                      <BusinessOutlined sx={{ fontSize: 11, color: "#94A3B8" }} />
                      <Typography sx={{ fontSize: "11px", color: "#94A3B8", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {dept}
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Box sx={{
                  display: "inline-flex", alignItems: "center", gap: 0.6,
                  px: 1.25, py: "4px", borderRadius: "999px", flexShrink: 0,
                  bgcolor: `${roleColor}10`, border: `1.5px solid ${roleColor}25`,
                }}>
                  {RoleIcon && (
                    <Box sx={{ color: roleColor, display: "flex", alignItems: "center", "& svg": { fontSize: 11 } }}>
                      <RoleIcon />
                    </Box>
                  )}
                  <Typography sx={{ fontSize: "11px", fontWeight: 700, color: roleColor, letterSpacing: "0.01em" }}>
                    {roleLabel}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      {/* Pagination */}
      {!loading && pageTotal > PAGE_SIZE && (
        <Pagination page={page} total={pageTotal} pageSize={PAGE_SIZE} onPageChange={setPage} />
      )}
    </Box>
  );
};

export default ParticipantsStep;
