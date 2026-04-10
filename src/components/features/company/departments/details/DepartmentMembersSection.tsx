"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import PersonAddOutlined  from "@mui/icons-material/PersonAddOutlined";
import EmailOutlined      from "@mui/icons-material/EmailOutlined";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  fetchMembers, selectMembers, addEmployee,
  fetchInvitationsByDepartment, cancelInvitation, resendInvitation,
  Invitation, Member,
} from "@/store/slices/memberSlice";
import { RoleFilter, SortOption } from "@/components/features/company/employees/list/EmployeesList";
import EmployeesFilterBar   from "@/components/features/company/employees/list/EmployeesFilterBar";
import EmployeeCard         from "@/components/features/company/employees/list/EmployeeCard";
import EmployeeSkeletonCard from "@/components/features/company/employees/list/EmployeeSkeletonCard";
import InvitationCard       from "@/components/features/company/employees/list/InvitationCard";
import Pagination           from "@/components/ui/Pagination";
import { PURPLE, AMBER, GRID } from "@/components/features/company/employees/list/constants";
import AddEmployeeModal     from "@/components/features/company/employees/create/AddEmployeeModal";
import AppButton            from "@/components/ui/AppButton";
import { useToast }         from "@/hooks/useToast";
import { Invitation as InvitationType } from "@/types/employee";

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

// ─── Tab pill (same style as EmployeesList) ───────────────────────────────────

const TabPill: React.FC<{
  active: boolean;
  label:  string;
  icon:   React.ReactNode;
  count:  number | string;
  color:  string;
  pulse?: boolean;
  onClick: () => void;
}> = ({ active, label, icon, count, color, pulse, onClick }) => (
  <Box onClick={onClick} sx={{
    display: "flex", alignItems: "center", gap: 1,
    px: 2, py: 0.875, borderRadius: "9px", cursor: "pointer",
    transition: "all 0.18s ease",
    bgcolor: active ? "#fff" : "transparent",
    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
    "&:hover": !active ? { bgcolor: "#EAECF0" } : {},
  }}>
    <Box sx={{ color: active ? color : "#6B7280", display: "flex", fontSize: 16 }}>{icon}</Box>
    <Typography sx={{ fontSize: "13px", fontWeight: 700, color: active ? "#111827" : "#6B7280", whiteSpace: "nowrap" }}>
      {label}
    </Typography>
    <Box sx={{
      minWidth: 20, height: 20, borderRadius: "6px", px: 0.75, position: "relative",
      display: "flex", alignItems: "center", justifyContent: "center",
      bgcolor: active ? `${color}18` : (pulse ? `${color}15` : "#E5E7EB"),
    }}>
      <Typography sx={{ fontSize: "11px", fontWeight: 800, color: active ? color : (pulse ? color : "#9CA3AF") }}>
        {count}
      </Typography>
      {pulse && !active && (
        <Box sx={{
          position: "absolute", top: -3, right: -3, width: 7, height: 7,
          borderRadius: "50%", bgcolor: color, border: "1.5px solid #F3F4F6",
          animation: "blink 1.8s ease-in-out infinite",
          "@keyframes blink": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.3 } },
        }} />
      )}
    </Box>
  </Box>
);

// ─── Main component ───────────────────────────────────────────────────────────

const DepartmentMembersSection: React.FC<DepartmentMembersSectionProps> = ({
  departmentId, canManage = true, canAssignRoles = true, canRemove = true,
  onEdit, onDelete,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const { members, pageTotal, loading, error } = useSelector(selectMembers);

  const [tab,             setTab]             = useState<"members" | "invitations">("members");
  const [search,          setSearch]          = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter,      setRoleFilter]      = useState<RoleFilter>("all");
  const [sortBy,          setSortBy]          = useState<SortOption>("newest");
  const [page,            setPage]            = useState(1);
  const [inviteOpen,      setInviteOpen]      = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Invitations local state
  const [invitations,  setInvitations]  = useState<InvitationType[]>([]);
  const [invLoading,   setInvLoading]   = useState(false);

  const loadInvitations = useCallback(async () => {
    setInvLoading(true);
    try {
      const result = await dispatch(fetchInvitationsByDepartment(departmentId)).unwrap();
      setInvitations(result as unknown as InvitationType[]);
    } catch { /* silent */ }
    finally { setInvLoading(false); }
  }, [dispatch, departmentId]);

  useEffect(() => { loadInvitations(); }, [loadInvitations]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current!);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(value); setPage(1); }, 300);
  }, []);

  useEffect(() => { setPage(1); }, [debouncedSearch, roleFilter, sortBy]);

  const refreshMembers = useCallback(() => {
    const { sortBy: sb, order } = SORT_MAP[sortBy];
    dispatch(fetchMembers({
      departmentId,
      search:  debouncedSearch || undefined,
      role:    roleFilter !== "all" ? roleFilter : undefined,
      sortBy: sb, order, page, limit: PAGE_SIZE,
    }));
  }, [dispatch, departmentId, sortBy, debouncedSearch, roleFilter, page]);

  useEffect(() => { refreshMembers(); }, [refreshMembers]);

  const handleInvite = useCallback(async (email: string, role: string, deptId?: string) => {
    await dispatch(addEmployee({ email, role, departmentId: deptId || departmentId })).unwrap();
    setInviteOpen(false);
    showToast({ message: "Invitation sent successfully!", severity: "success" });
    refreshMembers();
    loadInvitations();
  }, [dispatch, departmentId, refreshMembers, loadInvitations, showToast]);

  const handleResend = useCallback(async (id: string) => {
    await dispatch(resendInvitation(id)).unwrap();
    showToast({ message: "Invitation resent!", severity: "success" });
    loadInvitations();
  }, [dispatch, showToast, loadInvitations]);

  const handleCancel = useCallback(async (id: string) => {
    await dispatch(cancelInvitation(id)).unwrap();
    setInvitations((prev) => prev.filter((i) => i._id !== id));
    showToast({ message: "Invitation cancelled", severity: "info" });
  }, [dispatch, showToast]);

  return (
    <Box>
      {/* ── Top bar: tabs + filter + invite button ── */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5, flexWrap: "wrap" }}>

        {/* Tabs */}
        <Box sx={{ display: "inline-flex", alignItems: "center", bgcolor: "#F3F4F6", borderRadius: "12px", p: 0.5, gap: 0.5, flexShrink: 0 }}>
          <TabPill
            active={tab === "members"}
            label="Members"
            icon={<PeopleAltOutlined sx={{ fontSize: 16 }} />}
            count={loading ? "…" : pageTotal}
            color={PURPLE}
            onClick={() => setTab("members")}
          />
          <TabPill
            active={tab === "invitations"}
            label="Invitations"
            icon={<EmailOutlined sx={{ fontSize: 16 }} />}
            count={invLoading ? "…" : invitations.length}
            color={AMBER}
            pulse={invitations.length > 0}
            onClick={() => setTab("invitations")}
          />
        </Box>

        {/* Filter bar — members tab only */}
        {tab === "members" && (
          <EmployeesFilterBar
            search={search}           onSearchChange={handleSearchChange}
            roleFilter={roleFilter}   onRoleFilterChange={(f) => { setRoleFilter(f); setPage(1); }}
            departmentFilter="all"    onDepartmentFilterChange={() => {}}
            departments={[]}
            sortBy={sortBy}           onSortChange={(s) => { setSortBy(s); setPage(1); }}
            resultCount={pageTotal}
            hideDepartmentFilter
          />
        )}

        {/* Invite button */}
        {canManage && (
          <Box sx={{ ml: "auto" }}>
            <AppButton
              label="Invite Employee"
              variant="contained"
              size="small"
              startIcon={<PersonAddOutlined sx={{ fontSize: 15 }} />}
              onClick={() => setInviteOpen(true)}
            />
          </Box>
        )}
      </Box>

      {/* ── Tab panels ── */}
      <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", p: { xs: 2, sm: 3 } }}>

        {/* Members tab */}
        {tab === "members" && (
          error ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
          ) : loading ? (
            <Box sx={GRID}>
              {Array.from({ length: PAGE_SIZE }).map((_, i) => <EmployeeSkeletonCard key={i} />)}
            </Box>
          ) : members.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 10 }}>
              <PeopleAltOutlined sx={{ fontSize: 48, color: "#D1D5DB", mb: 2 }} />
              <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>
                {search || roleFilter !== "all" ? "No members match your filters" : "No members yet"}
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "#9CA3AF", mt: 0.5 }}>
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
          )
        )}

        {/* Invitations tab */}
        {tab === "invitations" && (
          invLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={28} sx={{ color: AMBER }} />
            </Box>
          ) : invitations.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 10 }}>
              <EmailOutlined sx={{ fontSize: 48, color: "#D1D5DB", mb: 2 }} />
              <Typography sx={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>
                No pending invitations
              </Typography>
              <Typography sx={{ fontSize: "13px", color: "#9CA3AF", mt: 0.5 }}>
                Invitations you send for this department will appear here.
              </Typography>
            </Box>
          ) : (
            <Box sx={GRID}>
              {invitations.map((inv) => (
                <InvitationCard
                  key={inv._id}
                  invitation={inv}
                  onResend={handleResend}
                  onCancel={handleCancel}
                />
              ))}
            </Box>
          )
        )}
      </Box>

      {/* Pagination — members tab only */}
      {tab === "members" && !loading && !error && (
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
