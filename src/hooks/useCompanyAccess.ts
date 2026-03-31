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

    // Fetch permissions if not loaded and not already fetching
    if (!permissions && !loading && user?._id) {
      dispatch(fetchEmployeePermissions(user._id));
      return;
    }

    // Once loaded, check permission
    if (permissions && !permissions[permission]) {
      router.replace("/unauthorized");
    }
  }, [isEmployee, permissions, loading, permission, user?._id]);

  // Returns true while we're still determining access (show nothing / spinner)
  return { checking: isEmployee && (!permissions || loading) };
}
