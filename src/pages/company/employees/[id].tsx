import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import EditRoleModal from "@/components/features/company/employees/edit/EditRoleModal";
import DeleteMemberDialog from "@/components/features/company/employees/delete/DeleteMemberDialog";
import EmployeeDetail from "@/components/features/company/employees/details/EmployeeDetail";
import { AppDispatch } from "@/store/store";
import {
  fetchMembers,
  updateMemberRole,
  deleteMember,
  selectMembers,
  clearUpdateRoleSuccess,
  clearDeleteMemberSuccess,
  Member,
  MemberRole,
} from "@/store/slices/memberSlice";
import { useToast } from "@/hooks/useToast";

const EmployeeDetailPage: React.FC = () => {
  const router   = useRouter();
  const { id }   = router.query;
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const { members, loading, updateRoleSuccess, deleteMemberSuccess } = useSelector(selectMembers);

  const [editModalOpen, setEditModalOpen]       = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember]     = useState<Member | null>(null);

  // Load members if not yet loaded
  useEffect(() => {
    if (members.length === 0) dispatch(fetchMembers());
  }, [dispatch, members.length]);

  const member = members.find((m) => m._id === id) ?? null;

  // Role update success
  useEffect(() => {
    if (updateRoleSuccess) {
      setEditModalOpen(false);
      setSelectedMember(null);
      dispatch(clearUpdateRoleSuccess());
      showToast({ message: "Member role updated successfully!", severity: "success" });
      dispatch(fetchMembers());
    }
  }, [updateRoleSuccess, dispatch, showToast]);

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
    await dispatch(updateMemberRole({ membershipId: selectedMember._id, role: role as MemberRole, departmentId })).unwrap();
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
        {loading && members.length === 0 ? (
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
          />
        )}

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

export default EmployeeDetailPage;
