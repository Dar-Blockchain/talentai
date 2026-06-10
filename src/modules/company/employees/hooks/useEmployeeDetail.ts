import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchMemberById, updateMemberRole, deleteMember,
  selectCurrentMember, selectFetchingMember, selectMembers,
  selectEmployeePermissions,
  clearUpdateRoleSuccess, clearDeleteMemberSuccess,
} from "@/store/slices/memberSlice";
import type { ExtendedMember } from "../types";
import { useToast } from "@/hooks/useToast";

export function useEmployeeDetail(id: string | undefined) {
  const router    = useRouter();
  const dispatch  = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const user         = useSelector((state: RootState) => state.user.connectedUser.user);
  const empPerms     = useSelector(selectEmployeePermissions);
  const isEmployee   = user?.role === "Employee";
  const isOwner      = user?.role === "Company";
  const canAssignRoles = !isEmployee || !!empPerms?.canAssignRoles;
  const canRemove      = !isEmployee || !!empPerms?.canRemoveEmployee;
  const canManagePerms = !isEmployee || !!empPerms?.canManagePermissions;

  const member  = useSelector(selectCurrentMember);
  const loading = useSelector(selectFetchingMember);
  const { updateRoleSuccess, deleteMemberSuccess } = useSelector(selectMembers);

  const [editModalOpen,    setEditModalOpen]    = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember,   setSelectedMember]  = useState<ExtendedMember | null>(null);

  useEffect(() => {
    if (id) dispatch(fetchMemberById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (!updateRoleSuccess) return;
    setEditModalOpen(false);
    setSelectedMember(null);
    dispatch(clearUpdateRoleSuccess());
    showToast({ message: "Member role updated successfully!", severity: "success" });
    if (id) dispatch(fetchMemberById(id));
  }, [updateRoleSuccess, dispatch, showToast, id]);

  useEffect(() => {
    if (!deleteMemberSuccess) return;
    dispatch(clearDeleteMemberSuccess());
    showToast({ message: "Team member removed successfully!", severity: "success" });
    router.push("/company/employees");
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

  const handleEdit = useCallback((m: ExtendedMember) => {
    setSelectedMember(m);
    setEditModalOpen(true);
  }, []);

  const handleDelete = useCallback((m: ExtendedMember) => {
    setSelectedMember(m);
    setDeleteDialogOpen(true);
  }, []);

  const handleBack = useCallback(() => {
    router.push("/company/employees");
  }, [router]);

  return {
    member: member as ExtendedMember | null, loading,
    user, isOwner,
    canAssignRoles, canRemove, canManagePerms,
    editModalOpen,    setEditModalOpen,
    deleteDialogOpen, setDeleteDialogOpen,
    selectedMember,   setSelectedMember,
    handleUpdateRole, handleConfirmDelete,
    handleEdit, handleDelete, handleBack,
  };
}
