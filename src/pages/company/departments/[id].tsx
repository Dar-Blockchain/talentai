import React, { useCallback, useState } from "react";
import { useRouter }        from "next/router";
import { useSelector }      from "react-redux";
import { useDispatch }      from "react-redux";
import { Building2 }        from "lucide-react";
import DashboardLayout      from "@/components/layout/dashboard/DashboardLayout";
import {
  DepartmentDetailHeader,
  DepartmentMembersSection,
} from "@/modules/company/departments/components/details";
import { EditDepartmentModal }    from "@/modules/company/departments/components/edit";
import { DeleteDepartmentDialog } from "@/modules/company/departments/components/delete";
import EditRoleModal        from "@/components/features/company/employees/edit/EditRoleModal";
import DeleteMemberDialog   from "@/components/features/company/employees/delete/DeleteMemberDialog";
import { AppDispatch, RootState } from "@/store/store";
import {
  selectMembers, selectEmployeePermissions,
  updateMemberRole, deleteMember,
  clearUpdateRoleSuccess, clearDeleteMemberSuccess,
  Member,
} from "@/store/slices/memberSlice";
import { useToast }       from "@/hooks/useToast";
import { useTranslation } from "react-i18next";
import { useEffect }      from "react";
import {
  useDepartmentDetail,
} from "@/modules/company/departments/hooks";
import {
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} from "@/modules/company/departments/queries";
import { extractAxiosErrorMessage } from "@/modules/company/departments/utils/departmentI18n";

const DepartmentDetailPage: React.FC = () => {
  const router   = useRouter();
  const id       = typeof router.query.id === "string" ? router.query.id : null;
  const dispatch = useDispatch<AppDispatch>();
  const { t }    = useTranslation("dashboard");
  const { showToast } = useToast();

  const user           = useSelector((state: RootState) => state.user.connectedUser.user);
  const empPerms       = useSelector(selectEmployeePermissions);
  const isEmp          = user?.role === "Employee";
  const canEdit        = !isEmp || !!empPerms?.canEditDepartment;
  const canDelete      = !isEmp || !!empPerms?.canDeleteDepartment;
  const canInvite      = !isEmp || !!empPerms?.canInviteMembers;
  const canAssignRoles = !isEmp || !!empPerms?.canAssignRoles;
  const canRemove      = !isEmp || !!empPerms?.canRemoveEmployee;

  const { department, loading: loadingDept, error: deptError } = useDepartmentDetail(id);
  const { pageTotal, updateRoleSuccess, deleteMemberSuccess }  = useSelector(selectMembers);

  const updateMutation = useUpdateDepartmentMutation();
  const deleteMutation = useDeleteDepartmentMutation();

  const [editOpen,         setEditOpen]         = useState(false);
  const [deleteOpen,       setDeleteOpen]        = useState(false);
  const [memberEditOpen,   setMemberEditOpen]    = useState(false);
  const [memberDeleteOpen, setMemberDeleteOpen]  = useState(false);
  const [selectedMember,   setSelectedMember]    = useState<Member | null>(null);

  const handleSaveEdit = useCallback((name: string, description: string) => {
    if (!department) return;
    updateMutation.mutate({ departmentId: department._id, name, description }, {
      onSuccess: () => { setEditOpen(false); updateMutation.reset(); },
    });
  }, [updateMutation, department]);

  const handleConfirmDelete = useCallback(() => {
    if (!department) return;
    deleteMutation.mutate(department._id, {
      onSuccess: () => router.push("/company/departments"),
    });
  }, [deleteMutation, department, router]);

  const handleUpdateMemberRole = useCallback(async (role: string, departmentId?: string) => {
    if (!selectedMember) throw new Error("No member selected");
    await dispatch(updateMemberRole({ membershipId: selectedMember._id, role, departmentId })).unwrap();
  }, [dispatch, selectedMember]);

  useEffect(() => {
    if (updateRoleSuccess) {
      setMemberEditOpen(false); setSelectedMember(null);
      dispatch(clearUpdateRoleSuccess());
      showToast({ message: t("pages.employees.role_updated"), severity: "success" });
    }
  }, [updateRoleSuccess, dispatch, showToast, t]);

  const handleConfirmMemberDelete = useCallback(async () => {
    if (!selectedMember) return;
    try { await dispatch(deleteMember({ membershipId: selectedMember._id })).unwrap(); }
    catch (e) { console.error(e); }
  }, [dispatch, selectedMember]);

  useEffect(() => {
    if (deleteMemberSuccess) {
      setMemberDeleteOpen(false); setSelectedMember(null);
      dispatch(clearDeleteMemberSuccess());
      showToast({ message: t("pages.employees.deleted_success"), severity: "success" });
    }
  }, [deleteMemberSuccess, dispatch, showToast, t]);

  const updateError = updateMutation.error ? extractAxiosErrorMessage(updateMutation.error) ?? null : null;
  const deleteError = deleteMutation.error ? extractAxiosErrorMessage(deleteMutation.error) ?? null : null;

  if (deptError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 className="size-14 text-gray-300 mb-4" />
          <p className="text-lg font-bold text-gray-700">
            {t("pages.departments.detail.not_found_title")}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {t("pages.departments.detail.not_found_subtitle")}
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <DepartmentDetailHeader
          department={department} loading={loadingDept}
          membersTotal={pageTotal} loadingMembers={false}
          onEdit={() => setEditOpen(true)}
          onDelete={() => setDeleteOpen(true)}
          canEdit={canEdit} canDelete={canDelete}
        />

        {id && (
          <DepartmentMembersSection
            departmentId={id}
            canManage={canInvite} canAssignRoles={canAssignRoles} canRemove={canRemove}
            onEdit={m => { setSelectedMember(m); setMemberEditOpen(true); }}
            onDelete={m => { setSelectedMember(m); setMemberDeleteOpen(true); }}
          />
        )}
      </div>

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
            open={editOpen} department={department}
            onClose={() => { setEditOpen(false); updateMutation.reset(); }}
            onSave={handleSaveEdit} saving={updateMutation.isPending} error={updateError}
          />
          <DeleteDepartmentDialog
            open={deleteOpen} departmentName={department.name} memberCount={pageTotal}
            onClose={() => { setDeleteOpen(false); deleteMutation.reset(); }}
            onConfirm={handleConfirmDelete} deleting={deleteMutation.isPending} error={deleteError}
          />
        </>
      )}
    </DashboardLayout>
  );
};

export default DepartmentDetailPage;
