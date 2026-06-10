import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeesApi } from "../api";
import type { FetchMembersFilters, AddMemberPayload, UpdateRolePayload } from "@/store/slices/memberSlice";
import type { EmployeePermission } from "@/types/employeePermissions";

export const EMPLOYEE_QUERY_KEYS = {
  members: (filters: FetchMembersFilters) => ["employees", "list", filters] as const,
  member:  (userId: string)             => ["employees", "detail", userId] as const,
  stats:   ()                           => ["employees", "stats"] as const,
  departments: ()                       => ["employees", "departments"] as const,
  invitations: ()                       => ["employees", "invitations"] as const,
  permissions: (userId: string)         => ["employees", "permissions", userId] as const,
};

export function useMembersQuery(filters: FetchMembersFilters) {
  return useQuery({
    queryKey: EMPLOYEE_QUERY_KEYS.members(filters),
    queryFn: () => employeesApi.fetchMembers(filters),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useMemberQuery(userId: string | undefined) {
  return useQuery({
    queryKey: EMPLOYEE_QUERY_KEYS.member(userId ?? ""),
    queryFn: () => employeesApi.fetchMemberById(userId!),
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export function useMemberStatsQuery() {
  return useQuery({
    queryKey: EMPLOYEE_QUERY_KEYS.stats(),
    queryFn: () => employeesApi.fetchStats(),
    staleTime: 60_000,
  });
}

export function useDepartmentsQuery() {
  return useQuery({
    queryKey: EMPLOYEE_QUERY_KEYS.departments(),
    queryFn: () => employeesApi.fetchDepartments(),
    staleTime: 120_000,
  });
}

export function useInvitationsQuery() {
  return useQuery({
    queryKey: EMPLOYEE_QUERY_KEYS.invitations(),
    queryFn: () => employeesApi.fetchInvitations(),
    staleTime: 30_000,
  });
}

export function usePermissionsQuery(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: EMPLOYEE_QUERY_KEYS.permissions(userId ?? ""),
    queryFn: () => employeesApi.fetchPermissions(userId!),
    enabled: !!userId && enabled,
    staleTime: 60_000,
  });
}

export function useUpdatePermissionsMutation(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (permissions: Partial<EmployeePermission>) =>
      employeesApi.updatePermissions(userId, permissions),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: EMPLOYEE_QUERY_KEYS.permissions(userId) });
    },
  });
}

export function useInviteEmployeeMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddMemberPayload) => employeesApi.inviteEmployee(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useUpdateRoleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateRolePayload) => employeesApi.updateRole(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useRemoveMemberMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (membershipId: string) => employeesApi.removeMember(membershipId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}
