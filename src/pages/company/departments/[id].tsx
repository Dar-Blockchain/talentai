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
import { selectMembers, selectEmployeePermissions } from "@/store/slices/memberSlice";
import { RootState } from "@/store/store";

const DepartmentDetailPage: React.FC = () => {
  const router   = useRouter();
  const { id }   = router.query;
  const dispatch = useDispatch<AppDispatch>();

  const user      = useSelector((state: RootState) => state.user.connectedUser.user);
  const empPerms  = useSelector(selectEmployeePermissions);
  const canManage = user?.role !== "Employee" || !!empPerms?.canCreateDepartment;

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

  const [editOpen,   setEditOpen]   = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

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

  if (deptError) {
    return (
      <DashboardLayout>
        <Box sx={{ textAlign: "center", py: 12 }}>
          <BusinessOutlined sx={{ fontSize: 52, color: "#D1D5DB", mb: 2 }} />
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#374151" }}>Department not found</Typography>
          <Typography sx={{ fontSize: "0.875rem", color: "#9CA3AF", mt: 0.5 }}>
            This department may have been deleted.
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
          canManage={canManage}
        />

        {id && typeof id === "string" && (
          <DepartmentMembersSection departmentId={id} />
        )}
      </Box>

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
