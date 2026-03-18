import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import AppButton from "@/components/ui/AppButton";
import PersonAddOutlined from "@mui/icons-material/PersonAddOutlined";
import AddEmployeeModal from "@/components/features/company/employees/create/AddEmployeeModal";
import EditRoleModal from "@/components/features/company/employees/edit/EditRoleModal";
import DeleteMemberDialog from "@/components/features/company/employees/delete/DeleteMemberDialog";
import EmployeesHeader from "@/components/features/company/employees/list/EmployeesHeader";
import EmployeesList, { RoleFilter, SortOption } from "@/components/features/company/employees/list/EmployeesList";
import EmployeeDetail from "@/components/features/company/employees/details/EmployeeDetail";
import { AppDispatch } from "@/store/store";
import {
  fetchMembers,
  fetchInvitations,
  fetchMemberStats,
  addEmployee,
  updateMemberRole,
  deleteMember,
  resendInvitation,
  cancelInvitation,
  selectMembers,
  clearAddMemberSuccess,
  clearUpdateRoleSuccess,
  clearDeleteMemberSuccess,
  clearError,
  Member,
  MemberRole,
} from "@/store/slices/memberSlice";
import { useToast } from "@/hooks/useToast";
import {
  fetchDepartments,
  selectDepartments,
} from "@/store/slices/departmentSlice";

const PAGE_SIZE = 9;

const SORT_MAP: Record<SortOption, { sortBy?: "name" | "date"; order?: "asc" | "desc" }> = {
  newest:      { sortBy: "date", order: "desc" },
  "name-asc":  { sortBy: "name", order: "asc"  },
  "name-desc": { sortBy: "name", order: "desc" },
};

const roleMapping: Record<string, MemberRole> = {
  hr: "RH",
  technical_leader: "TechLead",
  supervisor: "Supervisor",
  manager: "Manager",
  owner: "Owner",
};

const EmployeesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const {
    members, pageTotal, loading, error,
    addMemberSuccess, updateRoleSuccess, deleteMemberSuccess,
    invitations, fetchingInvitations, stats, fetchingStats,
  } = useSelector(selectMembers);
  const departments = useSelector(selectDepartments);

  const [addModalOpen,     setAddModalOpen]     = useState(false);
  const [editModalOpen,    setEditModalOpen]     = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen]  = useState(false);
  const [selectedMember,   setSelectedMember]   = useState<Member | null>(null);
  const [detailMember,     setDetailMember]     = useState<Member | null>(null);

  const [search,           setSearch]           = useState("");
  const [roleFilter,       setRoleFilter]       = useState<RoleFilter>("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [sortBy,           setSortBy]           = useState<SortOption>("newest");
  const [page,             setPage]             = useState(1);

  // Debounced search value
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 300);
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, roleFilter, departmentFilter, sortBy]);

  // Build params and dispatch fetchMembers
  const doFetch = useCallback((overridePage?: number) => {
    dispatch(fetchMembers({
      search:       debouncedSearch || undefined,
      departmentId: departmentFilter !== "all" ? departmentFilter : undefined,
      role:         roleFilter !== "all" ? roleFilter : undefined,
      ...SORT_MAP[sortBy],
      page:         overridePage ?? page,
      limit:        PAGE_SIZE,
    }));
  }, [dispatch, debouncedSearch, roleFilter, departmentFilter, sortBy, page]);

  useEffect(() => { doFetch(); }, [doFetch]);

  // Initial data
  useEffect(() => {
    dispatch(fetchInvitations());
    dispatch(fetchMemberStats());
    dispatch(fetchDepartments({}));
  }, [dispatch]);

  useEffect(() => {
    if (addMemberSuccess) {
      setAddModalOpen(false);
      dispatch(clearAddMemberSuccess());
      showToast({ message: "Team member invited successfully!", severity: "success" });
      dispatch(fetchInvitations());
      dispatch(fetchMemberStats());
      doFetch();
    }
  }, [addMemberSuccess, dispatch, showToast, doFetch]);

  useEffect(() => {
    if (updateRoleSuccess) {
      setEditModalOpen(false);
      setSelectedMember(null);
      dispatch(clearUpdateRoleSuccess());
      showToast({ message: "Member role updated successfully!", severity: "success" });
      doFetch();
    }
  }, [updateRoleSuccess, dispatch, showToast, doFetch]);

  useEffect(() => {
    if (deleteMemberSuccess) {
      setDeleteDialogOpen(false);
      setSelectedMember(null);
      setDetailMember(null);
      dispatch(clearDeleteMemberSuccess());
      showToast({ message: "Team member removed successfully!", severity: "success" });
      dispatch(fetchMemberStats());
      doFetch();
    }
  }, [deleteMemberSuccess, dispatch, showToast, doFetch]);

  const handleAddMember = useCallback(async (email: string, role: string, departmentId?: string) => {
    const apiRole = roleMapping[role] || "RH";
    const result = await dispatch(addEmployee({ email, role: apiRole, departmentId }));
    if (addEmployee.rejected.match(result)) {
      const msg = (result.payload as string) || "Failed to send invitation";
      showToast({ message: msg, severity: "error" });
      dispatch(clearError());
    }
  }, [dispatch, showToast]);

  const handleUpdateRole = useCallback(async (role: string, departmentId?: string) => {
    if (!selectedMember) throw new Error("No member selected");
    await dispatch(updateMemberRole({ membershipId: selectedMember._id, role: role as MemberRole, departmentId })).unwrap();
  }, [dispatch, selectedMember]);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedMember) return;
    try { await dispatch(deleteMember({ membershipId: selectedMember._id })).unwrap(); }
    catch (e) { console.error(e); }
  }, [dispatch, selectedMember]);

  const handleResendInvitation = useCallback(async (invitationId: string) => {
    try {
      await dispatch(resendInvitation(invitationId)).unwrap();
      showToast({ message: "Invitation resent successfully!", severity: "success" });
    } catch {
      showToast({ message: "Failed to resend invitation", severity: "error" });
    }
  }, [dispatch, showToast]);

  const handleCancelInvitation = useCallback(async (invitationId: string) => {
    try {
      await dispatch(cancelInvitation(invitationId)).unwrap();
      showToast({ message: "Invitation cancelled successfully!", severity: "success" });
      dispatch(fetchMemberStats());
    } catch {
      showToast({ message: "Failed to cancel invitation", severity: "error" });
    }
  }, [dispatch, showToast]);

  const active = members.filter((m) => m.status === "active").length;
  const owners = members.filter((m) => m.role === "Owner").length;

  return (
    <DashboardLayout>
      {detailMember ? (
        <Box>
          <EmployeeDetail
            member={detailMember}
            onBack={() => setDetailMember(null)}
            onEdit={(m) => { setSelectedMember(m); setEditModalOpen(true); }}
            onDelete={(m) => { setSelectedMember(m); setDeleteDialogOpen(true); }}
          />
        </Box>
      ) : (
        <Box>
          <PageHeader
            title="Employees"
            subtitle="Manage your team members, roles, and invitations."
            breadcrumbs={[
              { label: "Dashboard", href: "/company/dashboard" },
              { label: "Employees" },
            ]}
            actions={[
              <AppButton
                key="add"
                label="Add Employee"
                variant="contained"
                startIcon={<PersonAddOutlined />}
                size="medium"
                onClick={() => setAddModalOpen(true)}
              />,
            ]}
          />

          <EmployeesHeader
            stats={stats}
            loading={fetchingStats}
            active={active}
            owners={owners}
          />

          <EmployeesList
            members={members}
            loading={loading}
            error={error}
            search={search}
            onSearchChange={handleSearchChange}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            departmentFilter={departmentFilter}
            onDepartmentFilterChange={setDepartmentFilter}
            departments={departments}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onSelect={setDetailMember}
            onEdit={(m) => { setSelectedMember(m); setEditModalOpen(true); }}
            onDelete={(m) => { setSelectedMember(m); setDeleteDialogOpen(true); }}
            invitations={invitations}
            fetchingInvitations={fetchingInvitations}
            onResend={handleResendInvitation}
            onCancel={handleCancelInvitation}
            total={pageTotal}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </Box>
      )}

      <AddEmployeeModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddMember}
      />

      {selectedMember && (
        <EditRoleModal
          open={editModalOpen}
          onClose={() => { setEditModalOpen(false); setSelectedMember(null); }}
          onSave={handleUpdateRole}
          currentRole={selectedMember.role}
          currentDepartmentId={(selectedMember as any).department?._id ?? (selectedMember as any).departmentId ?? ""}
          memberName={selectedMember.user?.username || selectedMember.user?.email || "Member"}
        />
      )}

      <DeleteMemberDialog
        open={deleteDialogOpen}
        memberName={selectedMember?.user?.username || selectedMember?.user?.email || "this member"}
        onCancel={() => { setDeleteDialogOpen(false); setSelectedMember(null); }}
        onConfirm={handleConfirmDelete}
      />
    </DashboardLayout>
  );
};

export default EmployeesPage;
