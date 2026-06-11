import React, { memo, useCallback } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import DashboardLayout from "@/modules/shared/layouts/dashboard/DashboardLayout";
import EditRoleModal from "./edit/EditRoleModal";
import DeleteMemberDialog from "./delete/DeleteMemberDialog";
import EmployeeDetail from "./details/EmployeeDetail";
import { useEmployeeDetail } from "../hooks/useEmployeeDetail";
import type { ExtendedMember } from "../types";

const LOADER_SX  = { display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 } as const;
const NOT_FOUND_SX = { display: "flex", flexDirection: "column", alignItems: "center", py: 10, gap: 2 } as const;

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
    <DashboardLayout>
      {loading && !member ? (
        <Box sx={LOADER_SX}>
          <CircularProgress sx={{ color: "#8310FF" }} />
        </Box>
      ) : !member ? (
        <Box sx={NOT_FOUND_SX}>
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
    </DashboardLayout>
  );
});

EmployeeDetailPageContent.displayName = "EmployeeDetailPageContent";
export default EmployeeDetailPageContent;
