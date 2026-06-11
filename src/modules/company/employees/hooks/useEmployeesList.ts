import { useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { RootState } from "@/store/store";
import {
  useMembersQuery, useInvitationsQuery, useMemberStatsQuery,
  useDepartmentsQuery, useInviteEmployeeMutation, useUpdateRoleMutation,
  useRemoveMemberMutation, usePermissionsQuery,
  useResendInvitationMutation, useCancelInvitationMutation,
} from "../queries";
import type { ExtendedMember } from "../types";
import { useToast } from "@/hooks/useToast";
import type { RoleFilter, SortOption } from "@/modules/company/employees/components/list/EmployeesList";

const PAGE_SIZE = 9;

const SORT_MAP: Record<SortOption, { sortBy?: "name" | "date"; order?: "asc" | "desc" }> = {
  newest:      { sortBy: "date", order: "desc" },
  "name-asc":  { sortBy: "name", order: "asc"  },
  "name-desc": { sortBy: "name", order: "desc" },
};

export function useEmployeesList() {
  const { t }         = useTranslation("dashboard");
  const router        = useRouter();
  const { showToast } = useToast();

  const user       = useSelector((state: RootState) => state.user.connectedUser.user);
  const isEmployee = user?.role === "Employee";

  const { data: empPerms }   = usePermissionsQuery(user?._id, isEmployee);
  const inviteMut            = useInviteEmployeeMutation();
  const updateRoleMut        = useUpdateRoleMutation();
  const removeMut            = useRemoveMemberMutation();
  const resendMut            = useResendInvitationMutation();
  const cancelMut            = useCancelInvitationMutation();

  if (!isEmployee && empPerms && !empPerms.canManageTeam && !empPerms.canManagePermissions) {
    void router.replace("/unauthorized");
  }

  const canInvite      = !isEmployee || !!empPerms?.canInviteMembers;
  const canAssignRoles = !isEmployee || !!empPerms?.canAssignRoles;
  const canRemove      = !isEmployee || !!empPerms?.canRemoveEmployee;
  const canManagePerms = !isEmployee || !!empPerms?.canManagePermissions;

  // Modal state
  const [addModalOpen,     setAddModalOpen]     = useState(false);
  const [editModalOpen,    setEditModalOpen]     = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(value); setPage(1); }, 300);
  }, []);

  const memberFilters = useMemo(() => ({
    search:       debouncedSearch || undefined,
    departmentId: departmentFilter !== "all" ? departmentFilter : undefined,
    role:         roleFilter !== "all" ? roleFilter : undefined,
    ...SORT_MAP[sortBy],
    page,
    limit: PAGE_SIZE,
  }), [debouncedSearch, roleFilter, departmentFilter, sortBy, page]);

  const { data: membersRaw, isLoading: loading, error: membersError } = useMembersQuery(memberFilters);
  const { data: invitationsRaw, isLoading: fetchingInvitations }      = useInvitationsQuery();
  const { data: statsRaw,       isLoading: fetchingStats }            = useMemberStatsQuery();
  const { data: deptsRaw }                                            = useDepartmentsQuery();

  const members       = (membersRaw as any)?.members     ?? [];
  const pageTotal     = (membersRaw as any)?.total       ?? 0;
  const invitations   = Array.isArray(invitationsRaw)    ? invitationsRaw : [];
  const stats         = statsRaw ?? null;
  const departments   = (Array.isArray(deptsRaw) ? deptsRaw : (deptsRaw as any)?.data) ?? [];
  const error         = membersError ? String(membersError) : null;

  const handleAddMember = useCallback(async (email: string, role: string, departmentId?: string) => {
    inviteMut.mutate({ email, role, departmentId }, {
      onSuccess: () => {
        setAddModalOpen(false);
        showToast({ message: t("pages.employees.invited_success"), severity: "success" });
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message ?? err?.message ?? t("pages.employees.toast_invite_failed");
        showToast({ message: msg, severity: "error" });
      },
    });
  }, [inviteMut, showToast, t]);

  const handleUpdateRole = useCallback(async (role: string, departmentId?: string) => {
    if (!selectedMember) throw new Error("No member selected");
    return new Promise<void>((resolve, reject) => {
      updateRoleMut.mutate({ membershipId: selectedMember._id, role, departmentId }, {
        onSuccess: () => {
          setEditModalOpen(false);
          setSelectedMember(null);
          showToast({ message: t("pages.employees.role_updated"), severity: "success" });
          resolve();
        },
        onError: (err) => reject(err),
      });
    });
  }, [updateRoleMut, selectedMember, showToast, t]);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedMember) return;
    removeMut.mutate(selectedMember._id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setSelectedMember(null);
        setDetailMember(null);
        showToast({ message: t("pages.employees.deleted_success"), severity: "success" });
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message ?? t("pages.employees.toast_delete_failed");
        showToast({ message: msg, severity: "error" });
      },
    });
  }, [removeMut, selectedMember, showToast, t]);

  const active = (members as any[]).filter((m) => m.status === "active").length;
  const owners = (members as any[]).filter((m) => m.role === "Owner").length;

  return {
    members: members as ExtendedMember[], pageTotal, loading, error,
    invitations, fetchingInvitations,
    stats, fetchingStats,
    departments,
    active, owners,
    canInvite, canAssignRoles, canRemove, canManagePerms,
    search, roleFilter, departmentFilter, sortBy, page,
    handleSearchChange,
    setRoleFilter: (f: RoleFilter) => { setRoleFilter(f); setPage(1); },
    setDepartmentFilter: (d: string) => { setDepartmentFilter(d); setPage(1); },
    setSortBy: (s: SortOption) => { setSortBy(s); setPage(1); },
    setPage,
    addModalOpen,     setAddModalOpen,
    editModalOpen,    setEditModalOpen,
    deleteDialogOpen, setDeleteDialogOpen,
    selectedMember,   setSelectedMember,
    detailMember,     setDetailMember,
    handleAddMember, handleUpdateRole, handleConfirmDelete,
    handleResendInvitation: useCallback(async (invitationId: string) => {
      resendMut.mutate(invitationId, {
        onSuccess: () => showToast({ message: t("pages.employees.resend_success"), severity: "success" }),
        onError:   () => showToast({ message: t("pages.employees.resend_error"),   severity: "error"   }),
      });
    }, [resendMut, showToast, t]),
    handleCancelInvitation: useCallback(async (invitationId: string) => {
      cancelMut.mutate(invitationId, {
        onSuccess: () => showToast({ message: t("pages.employees.cancel_success"), severity: "success" }),
        onError:   () => showToast({ message: t("pages.employees.cancel_error"),   severity: "error"   }),
      });
    }, [cancelMut, showToast, t]),
    PAGE_SIZE,
  };
}
