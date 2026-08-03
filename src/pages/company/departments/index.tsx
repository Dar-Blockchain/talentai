import React, { useState, useCallback } from "react";
import { useSelector }    from "react-redux";
import { usePermissionsQuery } from "@/modules/company/employees/queries";
import { useTranslation } from "react-i18next";
import { Plus }           from "lucide-react";
import PageHeader         from "@/modules/shared/layouts/dashboard/PageHeader";
import { getDashboardLayout } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";
import { Button }         from "@/modules/shared/ui/shadcn/button";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { RootState }      from "@/store/store";
import { useToast }       from "@/hooks/useToast";
import { useDepartmentList } from "@/modules/company/departments/hooks";
import {
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} from "@/modules/company/departments/queries";
import {
  DepartmentFetchError,
  DepartmentGrid,
  DepartmentEmptyState,
} from "@/modules/company/departments/components/list";
import { DepartmentFormModal } from "@/modules/company/departments/components/shared";
import { DeleteDepartmentDialog } from "@/modules/company/departments/components/delete";
import { extractAxiosErrorMessage } from "@/modules/company/departments/utils/departmentI18n";
import type { Department } from "@/modules/company/departments/types";

const DepartmentsPage: NextPageWithLayout = () => {
  const { t }         = useTranslation("dashboard");
  const { showToast } = useToast();
  useCompanyAccess("canViewDepartments");

  const user      = useSelector((state: RootState) => state.user.connectedUser.user);
  const isEmp     = user?.role === "Employee";
  const { data: empPerms } = usePermissionsQuery(user?._id, isEmp);
  const canManage = !isEmp || !!empPerms?.canCreateDepartment;

  const { departments, total, loading, error, search, onSearch } = useDepartmentList();

  const createMutation = useCreateDepartmentMutation();
  const updateMutation = useUpdateDepartmentMutation();
  const deleteMutation = useDeleteDepartmentMutation();

  const [createOpen,   setCreateOpen]   = useState(false);
  const [editTarget,   setEditTarget]   = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  const handleCreate = useCallback((name: string, description: string) => {
    createMutation.mutate({ name, description }, {
      onSuccess: () => {
        showToast({ message: t("pages.departments.toast.created"), severity: "success" });
        setCreateOpen(false);
      },
    });
  }, [createMutation.mutate, showToast, t]);

  const handleSaveEdit = useCallback((name: string, description: string) => {
    if (!editTarget) return;
    updateMutation.mutate({ departmentId: editTarget._id, name, description }, {
      onSuccess: () => setEditTarget(null),
    });
  }, [updateMutation.mutate, editTarget]);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget._id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }, [deleteMutation.mutate, deleteTarget]);

  const createError = createMutation.error ? extractAxiosErrorMessage(createMutation.error) : null;
  const updateError = updateMutation.error ? extractAxiosErrorMessage(updateMutation.error) : null;
  const deleteError = deleteMutation.error ? extractAxiosErrorMessage(deleteMutation.error) : null;

  return (
    <>
      <PageHeader
        title={t("pages.departments.title")}
        subtitle={t("pages.departments.subtitle")}
        breadcrumbs={[
          { label: t("pages.common.dashboard"), href: "/company/dashboard" },
          { label: t("pages.departments.title") },
        ]}
        actions={canManage ? [
          <Button key="create" onClick={() => { createMutation.reset(); setCreateOpen(true); }}>
            <Plus className="size-4" />
            {t("pages.departments.new_department")}
          </Button>,
        ] : []}
      />

      <DepartmentFetchError error={error} />
      <DepartmentGrid
        departments={departments} total={total} loading={loading}
        search={search} onSearch={onSearch}
        onEdit={setEditTarget} onDelete={setDeleteTarget}
        canManage={canManage}
      />
      <DepartmentEmptyState
        departments={departments} loading={loading} search={search}
        onCreateClick={() => { createMutation.reset(); setCreateOpen(true); }}
        canManage={canManage}
      />

      <DepartmentFormModal
        open={createOpen}
        mode="create"
        onClose={() => { setCreateOpen(false); createMutation.reset(); }}
        onSave={handleCreate}
        saving={createMutation.isPending}
        error={createError}
      />
      <DeleteDepartmentDialog
        open={Boolean(deleteTarget)}
        departmentName={deleteTarget?.name ?? ""}
        onClose={() => { setDeleteTarget(null); deleteMutation.reset(); }}
        onConfirm={handleConfirmDelete}
        deleting={deleteMutation.isPending}
        error={deleteError}
      />
      <DepartmentFormModal
        open={Boolean(editTarget)}
        mode="edit"
        department={editTarget}
        onClose={() => { setEditTarget(null); updateMutation.reset(); }}
        onSave={handleSaveEdit}
        saving={updateMutation.isPending}
        error={updateError}
      />
    </>
  );
};
DepartmentsPage.getLayout = getDashboardLayout;

export default DepartmentsPage;
