import React, { memo, useCallback } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import AppButton from "@/components/ui/AppButton";
import PersonAddOutlined from "@mui/icons-material/PersonAddOutlined";
import AddEmployeeModal from "./create/AddEmployeeModal";
import EditRoleModal from "./edit/EditRoleModal";
import DeleteMemberDialog from "./delete/DeleteMemberDialog";
import EmployeesHeader from "./list/EmployeesHeader";
import EmployeesList from "./list/EmployeesList";
import EmployeeDetail from "./details/EmployeeDetail";
import { useEmployeesList } from "../hooks/useEmployeesList";
import type { ExtendedMember } from "../types";

const EmployeesPageContent: React.FC = memo(() => {
  const { t } = useTranslation("dashboard");

  const {
    members, pageTotal, loading, error,
    invitations, fetchingInvitations, stats, fetchingStats,
    departments, active, owners,
    canInvite, canAssignRoles, canRemove, canManagePerms,
    search, roleFilter, departmentFilter, sortBy, page,
    handleSearchChange, setRoleFilter, setDepartmentFilter, setSortBy, setPage,
    addModalOpen,     setAddModalOpen,
    editModalOpen,    setEditModalOpen,
    deleteDialogOpen, setDeleteDialogOpen,
    selectedMember,   setSelectedMember,
    detailMember,     setDetailMember,
    handleAddMember, handleUpdateRole, handleConfirmDelete,
    handleResendInvitation, handleCancelInvitation,
    PAGE_SIZE,
  } = useEmployeesList();

  const openAddModal   = useCallback(() => setAddModalOpen(true),  [setAddModalOpen]);
  const closeAddModal  = useCallback(() => setAddModalOpen(false), [setAddModalOpen]);
  const closeEditModal = useCallback(() => { setEditModalOpen(false); setSelectedMember(null); }, [setEditModalOpen, setSelectedMember]);
  const cancelDelete   = useCallback(() => { setDeleteDialogOpen(false); setSelectedMember(null); }, [setDeleteDialogOpen, setSelectedMember]);
  const clearDetail    = useCallback(() => setDetailMember(null), [setDetailMember]);

  const handleEdit = useCallback((m: ExtendedMember) => { setSelectedMember(m); setEditModalOpen(true); }, [setSelectedMember, setEditModalOpen]);
  const handleDelete = useCallback((m: ExtendedMember) => { setSelectedMember(m); setDeleteDialogOpen(true); }, [setSelectedMember, setDeleteDialogOpen]);

  const addButton = canInvite ? [
    <AppButton
      key="add"
      label={t("pages.employees.add_employee")}
      variant="contained"
      startIcon={<PersonAddOutlined />}
      size="medium"
      onClick={openAddModal}
    />,
  ] : [];

  return (
    <DashboardLayout>
      {detailMember ? (
        <Box>
          <EmployeeDetail
            member={detailMember}
            onBack={clearDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canAssignRoles={canAssignRoles}
            canRemove={canRemove}
            canManagePermissions={canManagePerms}
          />
        </Box>
      ) : (
        <Box>
          <PageHeader
            title={t("pages.employees.title")}
            subtitle={t("pages.employees.subtitle")}
            breadcrumbs={[
              { label: t("pages.common.dashboard"), href: "/company/dashboard" },
              { label: t("pages.employees.title") },
            ]}
            actions={addButton}
          />

          <EmployeesHeader stats={stats} loading={fetchingStats} active={active} owners={owners} />

          <EmployeesList
            members={members}
            loading={loading}
            error={error}
            search={search}
            onSearchChange={handleSearchChange}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            departmentFilter={departmentFilter}
            onDepartmentFilterChange={setDepartmentFilter}
            departments={departments}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onSelect={setDetailMember}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canInvite={canInvite}
            canAssignRoles={canAssignRoles}
            canRemove={canRemove}
            invitations={invitations}
            fetchingInvitations={fetchingInvitations}
            onResend={handleResendInvitation}
            onCancel={handleCancelInvitation}
            total={pageTotal}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </Box>
      )}

      <AddEmployeeModal open={addModalOpen} onClose={closeAddModal} onSave={handleAddMember} />

      {selectedMember && (
        <EditRoleModal
          open={editModalOpen}
          onClose={closeEditModal}
          onSave={handleUpdateRole}
          currentRole={selectedMember.role}
          currentDepartmentId={selectedMember.department?._id ?? selectedMember.departmentId ?? ""}
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

EmployeesPageContent.displayName = "EmployeesPageContent";
export default EmployeesPageContent;
