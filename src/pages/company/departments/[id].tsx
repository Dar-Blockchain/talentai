import React, { useCallback, useEffect, useState } from "react";
import { useRouter }        from "next/router";
import { useSelector } from "react-redux";
import { Building2 }        from "lucide-react";
import { getDashboardLayout } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";
import {
  DepartmentDetailHeader,
  DepartmentMembersSection,
} from "@/modules/company/departments/components/details";
import { DepartmentFormModal }    from "@/modules/company/departments/components/shared";
import { DeleteDepartmentDialog } from "@/modules/company/departments/components/delete";
import { RootState } from "@/store/store";
import type { Member } from "@/modules/company/members/types";
import {
  useUpdateRoleMutation,
  useRemoveMemberMutation,
  useMembersQuery,
  usePermissionsQuery,
} from "@/modules/company/employees/queries";
import { useToast }       from "@/hooks/useToast";
import { useTranslation } from "react-i18next";
import {
  useDepartmentDetail,
} from "@/modules/company/departments/hooks";
import {
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} from "@/modules/company/departments/queries";
import { extractAxiosErrorMessage } from "@/modules/company/departments/utils/departmentI18n";
import EditRoleModal from "@/modules/company/employees/components/edit/EditRoleModal";
import DeleteMemberDialog from "@/modules/company/employees/components/delete/DeleteMemberDialog";

const DepartmentDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  const id     = typeof router.query.id === "string" ? router.query.id : null;
  const { t }  = useTranslation("dashboard");
  const { showToast } = useToast();

  const user   = useSelector((state: RootState) => state.user.connectedUser.user);
  const isEmp  = user?.role === "Employee";

  const { data: empPerms }     = usePermissionsQuery(isEmp ? user?._id : undefined);
  const canEdit        = !isEmp || !!empPerms?.canEditDepartment;
  const canDelete      = !isEmp || !!empPerms?.canDeleteDepartment;
  const canInvite      = !isEmp || !!empPerms?.canInviteMembers;
  const canAssignRoles = !isEmp || !!empPerms?.canAssignRoles;
  const canRemove      = !isEmp || !!empPerms?.canRemoveEmployee;

  const { department, loading: loadingDept, error: deptError } = useDepartmentDetail(id);
  const { data: membersData } = useMembersQuery({ departmentId: id ?? "" });
  const pageTotal = membersData?.total ?? 0;

  const updateDeptMutation   = useUpdateDepartmentMutation();
  const deleteDeptMutation   = useDeleteDepartmentMutation();
  const updateRoleMutation   = useUpdateRoleMutation();
  const removeMemberMutation = useRemoveMemberMutation();

  const [editOpen,         setEditOpen]         = useState(false);
  const [deleteOpen,       setDeleteOpen]        = useState(false);
  const [memberEditOpen,   setMemberEditOpen]    = useState(false);
  const [memberDeleteOpen, setMemberDeleteOpen]  = useState(false);
  const [selectedMember,   setSelectedMember]    = useState<Member | null>(null);

  const handleSaveEdit = useCallback((name: string, description: string) => {
    if (!department) return;
    updateDeptMutation.mutate({ departmentId: department._id, name, description }, {
      onSuccess: () => { setEditOpen(false); updateDeptMutation.reset(); },
    });
  }, [updateDeptMutation, department]);

  const handleConfirmDelete = useCallback(() => {
    if (!department) return;
    deleteDeptMutation.mutate(department._id, {
      onSuccess: () => router.push("/company/departments"),
    });
  }, [deleteDeptMutation, department, router]);

  const handleUpdateMemberRole = useCallback(async (role: string, departmentId?: string) => {
    if (!selectedMember) throw new Error("No member selected");
    await updateRoleMutation.mutateAsync({ membershipId: selectedMember._id, role, departmentId });
    setMemberEditOpen(false); setSelectedMember(null);
    showToast({ message: t("pages.employees.role_updated"), severity: "success" });
  }, [updateRoleMutation, selectedMember, showToast, t]);

  const handleConfirmMemberDelete = useCallback(async () => {
    if (!selectedMember) return;
    try {
      await removeMemberMutation.mutateAsync(selectedMember._id);
      setMemberDeleteOpen(false); setSelectedMember(null);
      showToast({ message: t("pages.employees.deleted_success"), severity: "success" });
    } catch (e) { console.error(e); }
  }, [removeMemberMutation, selectedMember, showToast, t]);

  const updateError = updateDeptMutation.error ? extractAxiosErrorMessage(updateDeptMutation.error) : null;
  const deleteError = deleteDeptMutation.error ? extractAxiosErrorMessage(deleteDeptMutation.error) : null;

  if (deptError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Building2 className="size-14 text-gray-300 mb-4" />
        <p className="text-lg font-bold text-gray-700">
          {t("pages.departments.detail.not_found_title")}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {t("pages.departments.detail.not_found_subtitle")}
        </p>
      </div>
    );
  }

  return (
    <>
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
            departmentName={department?.name}
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
          <DepartmentFormModal
            open={editOpen} mode="edit" department={department}
            onClose={() => { setEditOpen(false); updateDeptMutation.reset(); }}
            onSave={handleSaveEdit} saving={updateDeptMutation.isPending} error={updateError}
          />
          <DeleteDepartmentDialog
            open={deleteOpen} departmentName={department.name} memberCount={pageTotal}
            onClose={() => { setDeleteOpen(false); deleteDeptMutation.reset(); }}
            onConfirm={handleConfirmDelete} deleting={deleteDeptMutation.isPending} error={deleteError}
          />
        </>
      )}
    </>
  );
};
DepartmentDetailPage.getLayout = getDashboardLayout;

export default DepartmentDetailPage;