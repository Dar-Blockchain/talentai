import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { usePermissionsQuery } from "../queries";

export interface RolePermissions {
  isEmployee: boolean;
  isOwner: boolean;
  canInvite: boolean;
  canAssignRoles: boolean;
  canRemove: boolean;
  canManagePerms: boolean;
}

export function useRolePermissions(): RolePermissions {
  const user       = useSelector((state: RootState) => state.user.connectedUser.user);
  const isEmployee = user?.role === "Employee";
  const isOwner    = user?.role === "Company";

  const { data: empPerms } = usePermissionsQuery(user?._id, isEmployee);

  return {
    isEmployee,
    isOwner,
    canInvite:      !isEmployee || !!empPerms?.canInviteMembers,
    canAssignRoles: !isEmployee || !!empPerms?.canAssignRoles,
    canRemove:      !isEmployee || !!empPerms?.canRemoveEmployee,
    canManagePerms: !isEmployee || !!empPerms?.canManagePermissions,
  };
}
