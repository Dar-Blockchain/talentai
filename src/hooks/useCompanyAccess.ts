import { useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import {
  fetchEmployeePermissions,
  selectEmployeePermissions,
  selectFetchingPermissions,
} from "@/store/slices/memberSlice";
import { EmployeePermissionKey } from "@/types/employeePermissions";

/**
 * Guards a /company page for employees.
 * - Company users: always allowed (no-op).
 * - Employee users: must have the given permission; redirects to /unauthorized otherwise.
 * - Fetches permissions if not yet loaded.
 */
export function useCompanyAccess(permission: EmployeePermissionKey) {
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const user        = useSelector((state: RootState) => state.user.connectedUser.user);
  const permissions = useSelector(selectEmployeePermissions);
  const loading     = useSelector(selectFetchingPermissions);

  const isEmployee = user?.role === "Employee";

  useEffect(() => {
    if (!isEmployee) return; // Company users are always allowed

    // Always re-fetch on mount so permissions reflect latest state
    if (user?._id && !loading) {
      dispatch(fetchEmployeePermissions(user._id));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  useEffect(() => {
    if (!isEmployee) return;

    // Once loaded, check permission
    if (permissions && !permissions[permission]) {
      router.replace("/unauthorized");
    }
  }, [isEmployee, permissions, permission]);

  // Returns true while we're still determining access (show nothing / spinner)
  return { checking: isEmployee && (!permissions || loading) };
}
