import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { usePermissionsQuery } from "@/modules/company/employees/queries";
import { EmployeePermissionKey } from "@/types/employeePermissions";

export function useCompanyAccess(permission: EmployeePermissionKey) {
  const router = useRouter();
  const user   = useSelector((state: RootState) => state.user.connectedUser.user);

  const isEmployee = user?.role === "Employee";

  const { data: permissions, isLoading } = usePermissionsQuery(
    isEmployee ? user?._id : undefined,
  );

  useEffect(() => {
    if (!isEmployee) return;
    if (permissions && !permissions[permission]) {
      router.replace("/unauthorized");
    }
  }, [isEmployee, permissions, permission]);

  return { checking: isEmployee && (!permissions || isLoading) };
}
