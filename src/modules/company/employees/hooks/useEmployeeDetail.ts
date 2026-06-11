import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  useMemberQuery, useUpdateRoleMutation, useRemoveMemberMutation, usePermissionsQuery,
} from "../queries";
import type { ExtendedMember } from "../types";
import { useToast } from "@/hooks/useToast";

export function useEmployeeDetail(id: string | undefined) {
  const router        = useRouter();
  const { showToast } = useToast();

  const user       = useSelector((state: RootState) => state.user.connectedUser.user);
  const isEmployee = user?.role === "Employee";
  const isOwner    = user?.role === "Company";

  const { data: empPerms }  = usePermissionsQuery(user?._id, isEmployee);
  const { data: memberRaw, isLoading: loading } = useMemberQuery(id);
  const updateRoleMut = useUpdateRoleMutation();
  const removeMut     = useRemoveMemberMutation();

  const canAssignRoles = !isEmployee || !!empPerms?.canAssignRoles;
  const canRemove      = !isEmployee || !!empPerms?.canRemoveEmployee;
  const canManagePerms = !isEmployee || !!empPerms?.canManagePermissions;

  const memberData = (memberRaw as any)?.data ?? memberRaw;
  const member     = (memberData as ExtendedMember | null) ?? null;

  const [editModalOpen,    setEditModalOpen]    = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember,   setSelectedMember]  = useState<ExtendedMember | null>(null);

  const handleUpdateRole = useCallback(async (role: string, departmentId?: string) => {
    if (!selectedMember) throw new Error("No member selected");
    return new Promise<void>((resolve, reject) => {
      updateRoleMut.mutate({ membershipId: selectedMember._id, role, departmentId }, {
        onSuccess: () => {
          setEditModalOpen(false);
          setSelectedMember(null);
          showToast({ message: "Member role updated successfully!", severity: "success" });
          resolve();
        },
        onError: (err) => reject(err),
      });
    });
  }, [updateRoleMut, selectedMember, showToast]);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedMember) return;
    removeMut.mutate(selectedMember._id, {
      onSuccess: () => {
        showToast({ message: "Team member removed successfully!", severity: "success" });
        router.push("/company/employees");
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message ?? "Failed to remove member";
        showToast({ message: msg, severity: "error" });
      },
    });
  }, [removeMut, selectedMember, showToast, router]);

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
    member, loading,
    user, isOwner,
    canAssignRoles, canRemove, canManagePerms,
    editModalOpen,    setEditModalOpen,
    deleteDialogOpen, setDeleteDialogOpen,
    selectedMember,   setSelectedMember,
    handleUpdateRole, handleConfirmDelete,
    handleEdit, handleDelete, handleBack,
  };
}
