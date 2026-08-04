import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

// HR-only gate: true for the company owner and for employees whose
// membership role is HR ("RH"), false for every other team role.
export const useIsHR = () => {
  const user              = useSelector((s: RootState) => s.user.connectedUser.user);
  const companyMembership = useSelector((s: RootState) => s.user.connectedUser.companyMembership);
  const isEmployee = user?.role === "Employee";
  return !isEmployee || companyMembership?.role === "RH";
};
