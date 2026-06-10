import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { AppDispatch, RootState } from "@/store/store";
import {
  fetchMembers, fetchInvitations, fetchMemberStats,
  addEmployee, updateMemberRole, deleteMember,
  resendInvitation, cancelInvitation,
  selectMembers, selectEmployeePermissions, selectFetchingPermissions,
  fetchEmployeePermissions,
  clearAddMemberSuccess, clearUpdateRoleSuccess, clearDeleteMemberSuccess, clearError,
} from "@/store/slices/memberSlice";
import type { ExtendedMember } from "../types";
import { fetchDepartments, selectDepartments } from "@/store/slices/departmentSlice";
import { useToast } from "@/hooks/useToast";
import type { RoleFilter, SortOption } from "@/modules/company/employees/components/list/EmployeesList";

const PAGE_SIZE = 9;

const SORT_MAP: Record<SortOption, { sortBy?: "name" | "date"; order?: "asc" | "desc" }> = {
  newest:      { sortBy: "date", order: "desc" },
  "name-asc":  { sortBy: "name", order: "asc"  },
  "name-desc": { sortBy: "name", order: "desc" },
};

export function useEmployeesList() {
  const { t }     = useTranslation("dashboard");
  const router    = useRouter();
  const dispatch  = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const user         = useSelector((state: RootState) => state.user.connectedUser.user);
  const empPerms     = useSelector(selectEmployeePermissions);
  const loadingPerms = useSelector(selectFetchingPermissions);
  const isEmployee   = user?.role === "Employee";
  const departments  = useSelector(selectDepartments);

  const {
    members, pageTotal, loading, error,
    addMemberSuccess, updateRoleSuccess, deleteMemberSuccess,
    invitations, fetchingInvitations, stats, fetchingStats,
  } = useSelector(selectMembers);

  // Modal state
  const [addModalOpen,     setAddModalOpen]     = useState(false);
  const [editModalOpen,    setEditModalOpen]     = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen]  = useState(false);
  const [selectedMember,   setSelectedMember]   = useState<ExtendedMember | null>(null);
  const [detailMember,     setDetailMember]     = useState<ExtendedMember | null>(null);

  // Filter state
  const [search,           setSearch]           = useState("");
  const [roleFilter,       setRoleFilter]       = useState<RoleFilter>("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [sortBy,           setSortBy]           = useState<SortOption>("newest");
  const [page,             setPage]             = useState(1);
  const [debouncedSearch,  setDebouncedSearch]  = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Permissions: fetch for employees, redirect if insufficient
  useEffect(() => {
    if (isEmployee && user?._id && !loadingPerms) {
      dispatch(fetchEmployeePermissions(user._id));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  useEffect(() => {
    if (!isEmployee) return;
    if (empPerms && !empPerms.canManageTeam && !empPerms.canManagePermissions) {
      router.replace("/unauthorized");
    }
  }, [isEmployee, empPerms, router]);

  const canInvite      = !isEmployee || !!empPerms?.canInviteMembers;
  const canAssignRoles = !isEmployee || !!empPerms?.canAssignRoles;
  const canRemove      = !isEmployee || !!empPerms?.canRemoveEmployee;
  const canManagePerms = !isEmployee || !!empPerms?.canManagePermissions;

  // Search debounce
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 300);
  }, []);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [debouncedSearch, roleFilter, departmentFilter, sortBy]);

  // Fetch members
  const doFetch = useCallback((overridePage?: number) => {
    dispatch(fetchMembers({
      search:       debouncedSearch || undefined,
      departmentId: departmentFilter !== "all" ? departmentFilter : undefined,
      role:         roleFilter !== "all" ? roleFilter : undefined,
      ...SORT_MAP[sortBy],
      page:         overridePage ?? page,
      limit:        PAGE_SIZE,
    }));
  }, [dispatch, debouncedSearch, roleFilter, departmentFilter, sortBy, page]);

  useEffect(() => { doFetch(); }, [doFetch]);

  // Initial data
  useEffect(() => {
    dispatch(fetchInvitations());
    dispatch(fetchMemberStats());
    dispatch(fetchDepartments({}));
  }, [dispatch]);

  // Success effects
  useEffect(() => {
    if (!addMemberSuccess) return;
    setAddModalOpen(false);
    dispatch(clearAddMemberSuccess());
    showToast({ message: t("pages.employees.invited_success"), severity: "success" });
    dispatch(fetchInvitations());
    dispatch(fetchMemberStats());
    doFetch();
  }, [addMemberSuccess, dispatch, showToast, doFetch, t]);

  useEffect(() => {
    if (!updateRoleSuccess) return;
    setEditModalOpen(false);
    setSelectedMember(null);
    dispatch(clearUpdateRoleSuccess());
    showToast({ message: t("pages.employees.role_updated"), severity: "success" });
    doFetch();
  }, [updateRoleSuccess, dispatch, showToast, doFetch, t]);

  useEffect(() => {
    if (!deleteMemberSuccess) return;
    setDeleteDialogOpen(false);
    setSelectedMember(null);
    setDetailMember(null);
    dispatch(clearDeleteMemberSuccess());
    showToast({ message: t("pages.employees.deleted_success"), severity: "success" });
    dispatch(fetchMemberStats());
    doFetch();
  }, [deleteMemberSuccess, dispatch, showToast, doFetch, t]);

  // Action handlers
  const handleAddMember = useCallback(async (email: string, role: string, departmentId?: string) => {
    const result = await dispatch(addEmployee({ email, role, departmentId }));
    if (addEmployee.rejected.match(result)) {
      const msg = (result.payload as string) || t("pages.employees.toast_invite_failed");
      showToast({ message: msg, severity: "error" });
      dispatch(clearError());
    }
  }, [dispatch, showToast, t]);

  const handleUpdateRole = useCallback(async (role: string, departmentId?: string) => {
    if (!selectedMember) throw new Error("No member selected");
    await dispatch(updateMemberRole({ membershipId: selectedMember._id, role, departmentId })).unwrap();
  }, [dispatch, selectedMember]);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedMember) return;
    try { await dispatch(deleteMember({ membershipId: selectedMember._id })).unwrap(); }
    catch (e) { console.error(e); }
  }, [dispatch, selectedMember]);

  const handleResendInvitation = useCallback(async (invitationId: string) => {
    try {
      await dispatch(resendInvitation(invitationId)).unwrap();
      showToast({ message: t("pages.employees.resend_success"), severity: "success" });
    } catch {
      showToast({ message: t("pages.employees.resend_error"), severity: "error" });
    }
  }, [dispatch, showToast, t]);

  const handleCancelInvitation = useCallback(async (invitationId: string) => {
    try {
      await dispatch(cancelInvitation(invitationId)).unwrap();
      showToast({ message: t("pages.employees.cancel_success"), severity: "success" });
      dispatch(fetchMemberStats());
    } catch {
      showToast({ message: t("pages.employees.cancel_error"), severity: "error" });
    }
  }, [dispatch, showToast, t]);

  const active = members.filter((m) => m.status === "active").length;
  const owners = members.filter((m) => m.role === "Owner").length;

  return {
    // data
    members: members as ExtendedMember[], pageTotal, loading, error,
    invitations, fetchingInvitations, stats, fetchingStats,
    departments,
    active, owners,
    // permissions
    canInvite, canAssignRoles, canRemove, canManagePerms,
    // filter state
    search, roleFilter, departmentFilter, sortBy, page,
    handleSearchChange,
    setRoleFilter, setDepartmentFilter, setSortBy, setPage,
    // modal state
    addModalOpen,     setAddModalOpen,
    editModalOpen,    setEditModalOpen,
    deleteDialogOpen, setDeleteDialogOpen,
    selectedMember,   setSelectedMember,
    detailMember,     setDetailMember,
    // action handlers
    handleAddMember, handleUpdateRole, handleConfirmDelete,
    handleResendInvitation, handleCancelInvitation,
    PAGE_SIZE,
  };
}
