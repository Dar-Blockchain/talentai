import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import AppButton from "@/components/ui/AppButton";
import { AppDispatch } from "@/store/store";
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  clearCreateStatus,
  clearUpdateStatus,
  clearDeleteStatus,
  selectDepartmentCreating,
  selectDepartmentCreateSuccess,
  selectDepartmentCreateError,
  selectDepartmentUpdating,
  selectDepartmentUpdateSuccess,
  selectDepartmentUpdateError,
  selectDepartmentDeleting,
  selectDepartmentDeleteSuccess,
  selectDepartmentDeleteError,
  Department,
} from "@/store/slices/departmentSlice";
import DepartmentSearch from "@/components/features/company/departments/list/DepartmentSearch";
import DepartmentFetchError from "@/components/features/company/departments/list/DepartmentFetchError";
import DepartmentGrid from "@/components/features/company/departments/list/DepartmentGrid";
import DepartmentEmptyState from "@/components/features/company/departments/list/DepartmentEmptyState";
import CreateDepartmentModal from "@/components/features/company/departments/new/CreateDepartmentModal";
import EditDepartmentModal from "@/components/features/company/departments/edit/EditDepartmentModal";
import DeleteDepartmentDialog from "@/components/features/company/departments/delete/DeleteDepartmentDialog";
import AddOutlined from "@mui/icons-material/AddOutlined";

const DepartmentsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const creating = useSelector(selectDepartmentCreating);
  const createSuccess = useSelector(selectDepartmentCreateSuccess);
  const createError = useSelector(selectDepartmentCreateError);
  const updating = useSelector(selectDepartmentUpdating);
  const updateSuccess = useSelector(selectDepartmentUpdateSuccess);
  const updateError = useSelector(selectDepartmentUpdateError);
  const deleting = useSelector(selectDepartmentDeleting);
  const deleteSuccess = useSelector(selectDepartmentDeleteSuccess);
  const deleteError = useSelector(selectDepartmentDeleteError);

  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);

  useEffect(() => {
    dispatch(fetchDepartments({}));
  }, [dispatch]);

  useEffect(() => {
    if (createSuccess) {
      setCreateOpen(false);
      dispatch(clearCreateStatus());
    }
  }, [createSuccess, dispatch]);

  useEffect(() => {
    if (updateSuccess) {
      setEditTarget(null);
      dispatch(clearUpdateStatus());
    }
  }, [updateSuccess, dispatch]);

  useEffect(() => {
    if (deleteSuccess) {
      setDeleteTarget(null);
      dispatch(clearDeleteStatus());
    }
  }, [deleteSuccess, dispatch]);

  const handleCreate = useCallback(
    (name: string, description: string) => {
      dispatch(createDepartment({ name, description }));
    },
    [dispatch],
  );

  const handleSaveEdit = useCallback(
    (name: string, description: string) => {
      if (!editTarget) return;
      dispatch(
        updateDepartment({ departmentId: editTarget._id, name, description }),
      );
    },
    [dispatch, editTarget],
  );

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    dispatch(deleteDepartment(deleteTarget._id));
  }, [dispatch, deleteTarget]);

  const openCreate = () => {
    dispatch(clearCreateStatus());
    setCreateOpen(true);
  };

  return (
      <DashboardLayout>
        <PageHeader
          title="Departments"
          subtitle="Manage your company's organizational departments."
          breadcrumbs={[
            { label: "Dashboard", href: "/company/dashboard" },
            { label: "Departments" },
          ]}
          actions={[
            <AppButton
              key="create"
              label="New Department"
              variant="contained"
              startIcon={<AddOutlined />}
              size="medium"
              onClick={openCreate}
            />,
          ]}
        />

        <DepartmentSearch onSearch={setSearch} />
        <DepartmentFetchError />
        <DepartmentGrid onEdit={setEditTarget} onDelete={setDeleteTarget} />
        <DepartmentEmptyState search={search} onCreateClick={openCreate} />

        <CreateDepartmentModal
          open={createOpen}
          onClose={() => {
            setCreateOpen(false);
            dispatch(clearCreateStatus());
          }}
          onSave={handleCreate}
          saving={creating}
          error={createError}
        />

        <DeleteDepartmentDialog
          open={Boolean(deleteTarget)}
          departmentName={deleteTarget?.name ?? ""}
          onClose={() => {
            setDeleteTarget(null);
            dispatch(clearDeleteStatus());
          }}
          onConfirm={handleConfirmDelete}
          deleting={deleting}
          error={deleteError}
        />

        <EditDepartmentModal
          open={Boolean(editTarget)}
          department={editTarget}
          onClose={() => {
            setEditTarget(null);
            dispatch(clearUpdateStatus());
          }}
          onSave={handleSaveEdit}
          saving={updating}
          error={updateError}
        />
      </DashboardLayout>
  );
};

export default DepartmentsPage;
