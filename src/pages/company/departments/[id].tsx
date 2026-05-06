import React, { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography } from "@mui/material";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import DepartmentDetailHeader from "@/components/features/company/departments/details/DepartmentDetailHeader";
import DepartmentMembersSection from "@/components/features/company/departments/details/DepartmentMembersSection";
import EditDepartmentModal from "@/components/features/company/departments/edit/EditDepartmentModal";
import DeleteDepartmentDialog from "@/components/features/company/departments/delete/DeleteDepartmentDialog";
import EditRoleModal from "@/components/features/company/employees/edit/EditRoleModal";
import DeleteMemberDialog from "@/components/features/company/employees/delete/DeleteMemberDialog";
import { AppDispatch } from "@/store/store";
import {
  fetchDepartmentById,
  updateDepartment,
  deleteDepartment,
  clearUpdateStatus,
  clearDeleteStatus,
  selectCurrentDepartment,
  selectCurrentDepartmentLoading,
  selectCurrentDepartmentError,
  selectDepartmentUpdating,
  selectDepartmentUpdateSuccess,
  selectDepartmentUpdateError,
  selectDepartmentDeleting,
  selectDepartmentDeleteSuccess,
  selectDepartmentDeleteError,
} from "@/store/slices/departmentSlice";
import {
  selectMembers, selectEmployeePermissions,
  updateMemberRole, deleteMember,
  clearUpdateRoleSuccess, clearDeleteMemberSuccess,
  Member,
} from "@/store/slices/memberSlice";
import { RootState } from "@/store/store";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "react-i18next";

const DepartmentDetailPage: React.FC = () => {
  const router   = useRouter();
  const { id }   = router.query;
  const dispatch = useDispatch<AppDispatch>();
  const { t }    = useTranslation("dashboard");

  const user      = useSelector((state: RootState) => state.user.connectedUser.user);
  const empPerms  = useSelector(selectEmployeePermissions);
  const isEmp          = user?.role === "Employee";
  const canEdit        = !isEmp || !!empPerms?.canEditDepartment;
  const canDelete      = !isEmp || !!empPerms?.canDeleteDepartment;
  const canInvite      = !isEmp || !!empPerms?.canInviteMembers;
  const canAssignRoles = !isEmp || !!empPerms?.canAssignRoles;
  const canRemove      = !isEmp || !!empPerms?.canRemoveEmployee;

  const department    = useSelector(selectCurrentDepartment);
  const loadingDept   = useSelector(selectCurrentDepartmentLoading);
  const deptError     = useSelector(selectCurrentDepartmentError);
  const { pageTotal } = useSelector(selectMembers);
  const updating      = useSelector(selectDepartmentUpdating);
  const updateSuccess = useSelector(selectDepartmentUpdateSuccess);
  const updateError   = useSelector(selectDepartmentUpdateError);
  const deleting      = useSelector(selectDepartmentDeleting);
  const deleteSuccess = useSelector(selectDepartmentDeleteSuccess);
  const deleteError   = useSelector(selectDepartmentDeleteError);

  const { updateRoleSuccess, deleteMemberSuccess } = useSelector(selectMembers);
  const { showToast } = useToast();

  const [editOpen,         setEditOpen]         = useState(false);
  const [deleteOpen,       setDeleteOpen]       = useState(false);
  const [memberEditOpen,   setMemberEditOpen]   = useState(false);
  const [memberDeleteOpen, setMemberDeleteOpen] = useState(false);
  const [selectedMember,   setSelectedMember]   = useState<Member | null>(null);

  useEffect(() => {
    if (id && typeof id === "string") dispatch(fetchDepartmentById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (updateSuccess) { setEditOpen(false); dispatch(clearUpdateStatus()); }
  }, [updateSuccess, dispatch]);

  useEffect(() => {
    if (deleteSuccess) { dispatch(clearDeleteStatus()); router.push("/company/departments"); }
  }, [deleteSuccess, dispatch, router]);

  const handleSaveEdit = useCallback((name: string, description: string) => {
    if (!department) return;
    dispatch(updateDepartment({ departmentId: department._id, name, description }));
  }, [dispatch, department]);

  const handleConfirmDelete = useCallback(() => {
    if (!department) return;
    dispatch(deleteDepartment(department._id));
  }, [dispatch, department]);

  // Member role update
  const handleUpdateMemberRole = useCallback(async (role: string, departmentId?: string) => {
    if (!selectedMember) throw new Error("No member selected");
    await dispatch(updateMemberRole({ membershipId: selectedMember._id, role, departmentId })).unwrap();
  }, [dispatch, selectedMember]);

  useEffect(() => {
    if (updateRoleSuccess) {
      setMemberEditOpen(false);
      setSelectedMember(null);
      dispatch(clearUpdateRoleSuccess());
      showToast({ message: t("pages.employees.role_updated"), severity: "success" });
    }
  }, [updateRoleSuccess, dispatch, showToast, t]);

  // Member delete
  const handleConfirmMemberDelete = useCallback(async () => {
    if (!selectedMember) return;
    try { await dispatch(deleteMember({ membershipId: selectedMember._id })).unwrap(); }
    catch (e) { console.error(e); }
  }, [dispatch, selectedMember]);

  useEffect(() => {
    if (deleteMemberSuccess) {
      setMemberDeleteOpen(false);
      setSelectedMember(null);
      dispatch(clearDeleteMemberSuccess());
      showToast({ message: t("pages.employees.deleted_success"), severity: "success" });
    }
  }, [deleteMemberSuccess, dispatch, showToast, t]);

  if (deptError) {
    return (
      <DashboardLayout>
        <Box sx={{ textAlign: "center", py: 12 }}>
          <BusinessOutlined sx={{ fontSize: 52, color: "#D1D5DB", mb: 2 }} />
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#374151" }}>{t("pages.departments.detail.not_found_title")}</Typography>
          <Typography sx={{ fontSize: "0.875rem", color: "#9CA3AF", mt: 0.5 }}>
            {t("pages.departments.detail.not_found_subtitle")}
          </Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box>
        <DepartmentDetailHeader
          department={department}
          loading={loadingDept}
          membersTotal={pageTotal}
          loadingMembers={false}
          onEdit={() => setEditOpen(true)}
          onDelete={() => setDeleteOpen(true)}
          canEdit={canEdit}
          canDelete={canDelete}
        />

        {id && typeof id === "string" && (
          <DepartmentMembersSection
            departmentId={id}
            canManage={canInvite}
            canAssignRoles={canAssignRoles}
            canRemove={canRemove}
            onEdit={(m) => { setSelectedMember(m); setMemberEditOpen(true); }}
            onDelete={(m) => { setSelectedMember(m); setMemberDeleteOpen(true); }}
          />
        )}
      </Box>

      {selectedMember && (
        <EditRoleModal
          open={memberEditOpen}
          onClose={() => { setMemberEditOpen(false); setSelectedMember(null); }}
          onSave={handleUpdateMemberRole}
          currentRole={selectedMember.role}
          currentDepartmentId={(selectedMember as any).department?._id ?? (selectedMember as any).departmentId ?? ""}
          memberName={selectedMember.username || selectedMember.email || "Member"}
        />
      )}

      <DeleteMemberDialog
        open={memberDeleteOpen}
        memberName={selectedMember?.username || selectedMember?.email || "this member"}
        onCancel={() => { setMemberDeleteOpen(false); setSelectedMember(null); }}
        onConfirm={handleConfirmMemberDelete}
      />

      {department && (
        <>
          <EditDepartmentModal
            open={editOpen}
            department={department}
            onClose={() => { setEditOpen(false); dispatch(clearUpdateStatus()); }}
            onSave={handleSaveEdit}
            saving={updating}
            error={updateError}
          />
          <DeleteDepartmentDialog
            open={deleteOpen}
            departmentName={department.name}
            memberCount={pageTotal}
            onClose={() => { setDeleteOpen(false); dispatch(clearDeleteStatus()); }}
            onConfirm={handleConfirmDelete}
            deleting={deleting}
            error={deleteError}
          />
        </>
      )}
    </DashboardLayout>
  );
};

export default DepartmentDetailPage;
