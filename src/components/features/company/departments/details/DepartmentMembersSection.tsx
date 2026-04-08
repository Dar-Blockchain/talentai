"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Box, Typography, Alert } from "@mui/material";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import PersonAddOutlined  from "@mui/icons-material/PersonAddOutlined";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  fetchMembers, selectMembers, addEmployee,
  clearAddMemberSuccess, Member,
} from "@/store/slices/memberSlice";
import { RoleFilter, SortOption } from "@/components/features/company/employees/list/EmployeesList";
import EmployeesFilterBar from "@/components/features/company/employees/list/EmployeesFilterBar";
import EmployeeCard from "@/components/features/company/employees/list/EmployeeCard";
import EmployeeSkeletonCard from "@/components/features/company/employees/list/EmployeeSkeletonCard";
import Pagination from "@/components/ui/Pagination";
import { GRID } from "@/components/features/company/employees/list/constants";
import AddEmployeeModal from "@/components/features/company/employees/create/AddEmployeeModal";
import AppButton from "@/components/ui/AppButton";

const PAGE_SIZE = 9;

const SORT_MAP: Record<SortOption, { sortBy: "date" | "name"; order: "asc" | "desc" }> = {
  newest:      { sortBy: "date", order: "desc" },
  "name-asc":  { sortBy: "name", order: "asc"  },
  "name-desc": { sortBy: "name", order: "desc" },
};

interface DepartmentMembersSectionProps {
  departmentId: string;
  canManage?: boolean;
  canAssignRoles?: boolean;
  canRemove?: boolean;
  onEdit?: (member: Member) => void;
  onDelete?: (member: Member) => void;
}

const DepartmentMembersSection: React.FC<DepartmentMembersSectionProps> = ({
  departmentId, canManage = true, canAssignRoles = true, canRemove = true,
  onEdit, onDelete,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { members, pageTotal, loading, error } = useSelector(selectMembers);

  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter,      setRoleFilter]      = useState<RoleFilter>("all");
  const [sortBy,          setSortBy]          = useState<SortOption>("newest");
  const [page,            setPage]            = useState(1);
  const [inviteOpen,      setInviteOpen]      = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current!);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  }, []);

  // reset page on filter change
  useEffect(() => { setPage(1); }, [debouncedSearch, roleFilter, sortBy]);

  const handleInvite = useCallback(async (email: string, role: string, deptId?: string) => {
    await dispatch(addEmployee({ email, role, departmentId: deptId || departmentId })).unwrap();
    setInviteOpen(false);
    // Refresh members list
    const { sortBy: sortByParam, order } = SORT_MAP[sortBy];
    dispatch(fetchMembers({ departmentId, search: debouncedSearch || undefined, role: roleFilter !== "all" ? roleFilter : undefined, sortBy: sortByParam, order, page, limit: PAGE_SIZE }));
  }, [dispatch, departmentId, sortBy, debouncedSearch, roleFilter, page]);

  useEffect(() => {
    const { sortBy: sortByParam, order } = SORT_MAP[sortBy];
    dispatch(fetchMembers({
      departmentId,
      search:  debouncedSearch || undefined,
      role:    roleFilter !== "all" ? roleFilter : undefined,
      sortBy:  sortByParam,
      order,
      page,
      limit:   PAGE_SIZE,
    }));
  }, [dispatch, departmentId, debouncedSearch, roleFilter, sortBy, page]);

  return (
    <Box sx={{
      bgcolor: "#fff", border: "1px solid #EDEEF0",
      borderRadius: "18px", p: { xs: 2, sm: 3 },
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 2.5, flexWrap: "wrap" }}>
        <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "#0F172A" }}>
          Team Members
          {!loading && (
            <Typography component="span" sx={{ ml: 1, fontSize: "0.75rem", color: "#94A3B8", fontWeight: 500 }}>
              {pageTotal} total
            </Typography>
          )}
        </Typography>
        {canManage && (
          <AppButton
            label="Invite Employee"
            variant="contained"
            size="small"
            startIcon={<PersonAddOutlined sx={{ fontSize: 15 }} />}
            onClick={() => setInviteOpen(true)}
          />
        )}
      </Box>

      {/* Filter bar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
        <EmployeesFilterBar
          search={search}               onSearchChange={handleSearchChange}
          roleFilter={roleFilter}       onRoleFilterChange={(f) => { setRoleFilter(f); setPage(1); }}
          departmentFilter="all"        onDepartmentFilterChange={() => {}}
          departments={[]}
          sortBy={sortBy}               onSortChange={(s) => { setSortBy(s); setPage(1); }}
          resultCount={pageTotal}
          hideDepartmentFilter
        />
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={GRID}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => <EmployeeSkeletonCard key={i} />)}
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      ) : members.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <PeopleAltOutlined sx={{ fontSize: 40, color: "#D1D5DB", mb: 1.5 }} />
          <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#374151" }}>
            {search || roleFilter !== "all" ? "No members match your filters" : "No members yet"}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF", mt: 0.5 }}>
            {search || roleFilter !== "all"
              ? "Try adjusting your filters."
              : "Assign employees to this department to see them here."}
          </Typography>
        </Box>
      ) : (
        <Box sx={GRID}>
          {members.map((m, i) => (
            <EmployeeCard
              key={m._id}
              member={m as Member}
              index={i}
              onEdit={(m) => onEdit?.(m)}
              onDelete={(m) => onDelete?.(m)}
              onSelect={() => {}}
              canAssignRoles={canAssignRoles}
              canRemove={canRemove}
            />
          ))}
        </Box>
      )}

      {/* Pagination */}
      {!loading && !error && pageTotal > PAGE_SIZE && (
        <Pagination page={page} total={pageTotal} pageSize={PAGE_SIZE} onPageChange={setPage} />
      )}

      <AddEmployeeModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSave={handleInvite}
        defaultDepartmentId={departmentId}
      />
    </Box>
  );
};

export default DepartmentMembersSection;
