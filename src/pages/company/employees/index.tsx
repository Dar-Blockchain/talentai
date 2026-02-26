import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import RoleGuard from "@/components/guards/RoleGuard";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import AppButton from "@/components/ui/AppButton";
import PersonAddOutlined from "@mui/icons-material/PersonAddOutlined";
import AddEmployeeModal from "@/components/features/company/employees/create/AddEmployeeModal";
import EditRoleModal from "@/components/dashboard-company/EditRoleModal";
import DeleteMemberDialog from "@/components/profile/team-members/DeleteMemberDialog";
import EmployeesHeader from "@/components/features/company/employees/list/EmployeesHeader";
import EmployeesList from "@/components/features/company/employees/list/EmployeesList";
import EmployeeDetail from "@/components/features/company/employees/details/EmployeeDetail";
import { AppDispatch } from "@/store/store";
import {
  fetchMembers,
  fetchInvitations,
  addEmployee,
  updateMemberRole,
  deleteMember,
  resendInvitation,
  cancelInvitation,
  selectMembers,
  clearAddMemberSuccess,
  clearUpdateRoleSuccess,
  clearDeleteMemberSuccess,
  Member,
  MemberRole,
} from "@/store/slices/memberSlice";
import { useToast } from "@/hooks/useToast";

type TabType = "all" | "active" | "pending" | "inactive";

const roleMapping: Record<string, MemberRole> = {
  hr: "RH",
  technical_leader: "TechLead",
  supervisor: "Supervisor",
  manager: "Manager",
};

const EmployeesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const {
    members,
    loading,
    error,
    addMemberSuccess,
    updateRoleSuccess,
    deleteMemberSuccess,
    invitations,
    fetchingInvitations,
  } = useSelector(selectMembers);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [detailMember, setDetailMember] = useState<Member | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("all");

  useEffect(() => {
    dispatch(fetchMembers());
    dispatch(fetchInvitations());
  }, [dispatch]);

  useEffect(() => {
    if (addMemberSuccess) {
      setAddModalOpen(false);
      dispatch(clearAddMemberSuccess());
      showToast({ message: "Team member invited successfully!", severity: "success" });
      dispatch(fetchInvitations());
      dispatch(fetchMembers());
    }
  }, [addMemberSuccess, dispatch, showToast]);

  useEffect(() => {
    if (updateRoleSuccess) {
      setEditModalOpen(false);
      setSelectedMember(null);
      dispatch(clearUpdateRoleSuccess());
      showToast({ message: "Member role updated successfully!", severity: "success" });
      dispatch(fetchMembers());
    }
  }, [updateRoleSuccess, dispatch, showToast]);

  useEffect(() => {
    if (deleteMemberSuccess) {
      setDeleteDialogOpen(false);
      setSelectedMember(null);
      setDetailMember(null);
      dispatch(clearDeleteMemberSuccess());
      showToast({ message: "Team member removed successfully!", severity: "success" });
      dispatch(fetchMembers());
    }
  }, [deleteMemberSuccess, dispatch, showToast]);

  const handleAddMember = useCallback(async (email: string, role: string) => {
    const apiRole = roleMapping[role] || "RH";
    const result = await dispatch(addEmployee({ email, role: apiRole }));
    if (addEmployee.rejected.match(result)) {
      throw new Error((result.payload as string) || "Failed to send invitation");
    }
  }, [dispatch]);

  const handleUpdateRole = useCallback(async (role: string) => {
    if (!selectedMember) throw new Error("No member selected");
    await dispatch(updateMemberRole({ membershipId: selectedMember._id, role: role as MemberRole })).unwrap();
  }, [dispatch, selectedMember]);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedMember) return;
    try {
      await dispatch(deleteMember({ membershipId: selectedMember._id })).unwrap();
    } catch (e) { console.error(e); }
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
    } catch {
      showToast({ message: "Failed to cancel invitation", severity: "error" });
    }
  }, [dispatch, showToast]);

  const filteredMembers = useMemo(() => {
    let list = members;
    if (activeTab !== "all") list = list.filter((m) => m.status === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((m) =>
        m.user?.username?.toLowerCase().includes(q) ||
        m.user?.email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [members, activeTab, search]);

  const total   = members.length;
  const active  = members.filter((m) => m.status === "active").length;
  const owners  = members.filter((m) => m.role === "Owner").length;
  const pending = members.filter((m) => m.status === "pending").length;
  const inactive = members.filter((m) => m.status === "inactive").length;

  const tabItems = [
    { id: "all",      label: "All",      count: total    },
    { id: "active",   label: "Active",   count: active   },
    { id: "pending",  label: "Pending",  count: pending  },
    { id: "inactive", label: "Inactive", count: inactive },
  ];

  return (
    <RoleGuard allowedRoles={["Company"]}>
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
                  label="Add Member"
                  variant="contained"
                  startIcon={<PersonAddOutlined />}
                  size="medium"
                  onClick={() => setAddModalOpen(true)}
                />,
              ]}
            />

            <EmployeesHeader
              total={total}
              active={active}
              owners={owners}
              pending={pending}
              loading={loading}
            />

            <EmployeesList
              members={filteredMembers}
              loading={loading}
              error={error}
              search={search}
              onSearchChange={(v) => setSearch(v)}
              activeTab={activeTab}
              onTabChange={(t) => setActiveTab(t)}
              tabItems={tabItems}
              onSelect={(m) => setDetailMember(m)}
              onEdit={(m) => { setSelectedMember(m); setEditModalOpen(true); }}
              onDelete={(m) => { setSelectedMember(m); setDeleteDialogOpen(true); }}
              invitations={invitations}
              fetchingInvitations={fetchingInvitations}
              onResend={handleResendInvitation}
              onCancel={handleCancelInvitation}
            />
          </Box>
        )}

        {/* Modals — always mounted */}
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
    </RoleGuard>
  );
};

export default EmployeesPage;
