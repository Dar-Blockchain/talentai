import React, { memo, useCallback } from "react";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";
import EditRoleModal from "./edit/EditRoleModal";
import DeleteMemberDialog from "./delete/DeleteMemberDialog";
import EmployeeDetail from "./details/EmployeeDetail";
import { useEmployeeDetail } from "../hooks/useEmployeeDetail";
import type { ExtendedMember } from "../types";

interface Props {
  id: string | undefined;
}

const EmployeeDetailPageContent: React.FC<Props> = memo(({ id }) => {
  const {
    member, loading,
    user, isOwner,
    canAssignRoles, canRemove, canManagePerms,
    editModalOpen,    setEditModalOpen,
    deleteDialogOpen, setDeleteDialogOpen,
    selectedMember,   setSelectedMember,
    handleUpdateRole, handleConfirmDelete,
    handleEdit, handleDelete, handleBack,
  } = useEmployeeDetail(id);

  const closeEditModal = useCallback(() => { setEditModalOpen(false); setSelectedMember(null); }, [setEditModalOpen, setSelectedMember]);
  const cancelDelete   = useCallback(() => { setDeleteDialogOpen(false); setSelectedMember(null); }, [setDeleteDialogOpen, setSelectedMember]);

  return (
    <>
      {loading && !member ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Spinner className="size-8" style={{ color: "#8310FF" }} />
        </div>
      ) : !member ? (
        <div className="flex flex-col items-center gap-4 py-20">
          <p className="text-[1.1rem] font-bold text-[#374151]">
            Member not found
          </p>
          <p className="text-sm text-[#9CA3AF]">
            This member may have been removed or the link is invalid.
          </p>
        </div>
      ) : (
        <EmployeeDetail
          member={member}
          onBack={handleBack}
          onEdit={handleEdit}
          onDelete={handleDelete}
          canAssignRoles={canAssignRoles}
          canRemove={canRemove}
          canManagePermissions={canManagePerms}
          isOwner={isOwner}
          isSelf={member.userId === user?._id}
        />
      )}

      {selectedMember && (
        <EditRoleModal
          open={editModalOpen}
          onClose={closeEditModal}
          onSave={handleUpdateRole}
          currentRole={selectedMember.role}
          currentDepartmentId={(selectedMember as ExtendedMember).department?._id ?? (selectedMember as ExtendedMember).departmentId ?? ""}
          memberName={selectedMember.username || selectedMember.email || "Member"}
        />
      )}

      <DeleteMemberDialog
        open={deleteDialogOpen}
        memberName={selectedMember?.username || selectedMember?.email || "this member"}
        onCancel={cancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
});

EmployeeDetailPageContent.displayName = "EmployeeDetailPageContent";
export default EmployeeDetailPageContent;
