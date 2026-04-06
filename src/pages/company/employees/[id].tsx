import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import EditRoleModal from "@/components/features/company/employees/edit/EditRoleModal";
import DeleteMemberDialog from "@/components/features/company/employees/delete/DeleteMemberDialog";
import EmployeeDetail from "@/components/features/company/employees/details/EmployeeDetail";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchMemberById,
  updateMemberRole,
  deleteMember,
  selectCurrentMember,
  selectFetchingMember,
  selectMembers,
  selectEmployeePermissions,
  clearUpdateRoleSuccess,
  clearDeleteMemberSuccess,
  Member,
} from "@/store/slices/memberSlice";
import { useToast } from "@/hooks/useToast";

const EmployeeDetailPage: React.FC = () => {
  const router   = useRouter();
  const { id }   = router.query;
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const user        = useSelector((state: RootState) => state.user.connectedUser.user);
  const empPerms    = useSelector(selectEmployeePermissions);
  const isEmployee  = user?.role === "Employee";
  const canAssignRoles     = !isEmployee || !!empPerms?.canAssignRoles;
  const canRemove          = !isEmployee || !!empPerms?.canRemoveEmployee;
  const canManagePerms     = !isEmployee || !!empPerms?.canManagePermissions;

  const member       = useSelector(selectCurrentMember);
  const loading      = useSelector(selectFetchingMember);
  const { updateRoleSuccess, deleteMemberSuccess } = useSelector(selectMembers);

  const [editModalOpen, setEditModalOpen]       = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember]     = useState<Member | null>(null);

  // Load member by user ID
  useEffect(() => {
    if (id) dispatch(fetchMemberById(id as string));
  }, [dispatch, id]);

  // Role update success
  useEffect(() => {
    if (updateRoleSuccess) {
      setEditModalOpen(false);
      setSelectedMember(null);
      dispatch(clearUpdateRoleSuccess());
      showToast({ message: "Member role updated successfully!", severity: "success" });
      if (id) dispatch(fetchMemberById(id as string));
    }
  }, [updateRoleSuccess, dispatch, showToast, id]);

  // Delete success → go back to list
  useEffect(() => {
    if (deleteMemberSuccess) {
      dispatch(clearDeleteMemberSuccess());
      showToast({ message: "Team member removed successfully!", severity: "success" });
      router.push("/company/employees");
    }
  }, [deleteMemberSuccess, dispatch, showToast, router]);

  const handleUpdateRole = useCallback(async (role: string, departmentId?: string) => {
    if (!selectedMember) throw new Error("No member selected");
    await dispatch(updateMemberRole({ membershipId: selectedMember._id, role, departmentId })).unwrap();
  }, [dispatch, selectedMember]);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedMember) return;
    try { await dispatch(deleteMember({ membershipId: selectedMember._id })).unwrap(); }
    catch (e) { console.error(e); }
  }, [dispatch, selectedMember]);

  const handleEdit = useCallback((m: Member) => {
    setSelectedMember(m);
    setEditModalOpen(true);
  }, []);

  const handleDelete = useCallback((m: Member) => {
    setSelectedMember(m);
    setDeleteDialogOpen(true);
  }, []);

  const handleBack = useCallback(() => {
    router.push("/company/employees");
  }, [router]);

  return (
      <DashboardLayout>
        {loading && !member ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
            <CircularProgress sx={{ color: "#8310FF" }} />
          </Box>
        ) : !member ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 10, gap: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#374151" }}>
              Member not found
            </Typography>
            <Typography sx={{ fontSize: "0.875rem", color: "#9CA3AF" }}>
              This member may have been removed or the link is invalid.
            </Typography>
          </Box>
        ) : (
          <EmployeeDetail
            member={member}
            onBack={handleBack}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canAssignRoles={canAssignRoles}
            canRemove={canRemove}
            canManagePermissions={canManagePerms}
          />
        )}

        {selectedMember && (
          <EditRoleModal
            open={editModalOpen}
            onClose={() => { setEditModalOpen(false); setSelectedMember(null); }}
            onSave={handleUpdateRole}
            currentRole={selectedMember.role}
            currentDepartmentId={(selectedMember as any).department?._id ?? (selectedMember as any).departmentId ?? ""}
            memberName={selectedMember.username || selectedMember.email || "Member"}
          />
        )}

        <DeleteMemberDialog
          open={deleteDialogOpen}
          memberName={selectedMember?.username || selectedMember?.email || "this member"}
          onCancel={() => { setDeleteDialogOpen(false); setSelectedMember(null); }}
          onConfirm={handleConfirmDelete}
        />
      </DashboardLayout>
  );
};

export default EmployeeDetailPage;
