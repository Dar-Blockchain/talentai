import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import dynamic from "next/dynamic";
import SettingsShellSkeleton from "./SettingsShellSkeleton";

const CandidateSettingsPage = dynamic(
  () => import("@/modules/settings/candidate/components/CandidateSettingsPage"),
  { ssr: false, loading: () => <SettingsShellSkeleton /> }
);
const CompanySettingsPage = dynamic(
  () => import("@/modules/settings/company/components/CompanySettingsPage"),
  { ssr: false, loading: () => <SettingsShellSkeleton /> }
);
const EmployeeSettingsPage = dynamic(
  () => import("@/modules/settings/employee/components/EmployeeSettingsPage"),
  { ssr: false, loading: () => <SettingsShellSkeleton /> }
);

const SettingsShell: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.connectedUser.user);
  const role = user?.role;

  if (role === "Candidate") return <CandidateSettingsPage />;
  if (role === "Company")   return <CompanySettingsPage />;
  if (role === "Employee")  return <EmployeeSettingsPage />;

  return <SettingsShellSkeleton />;
};

export default SettingsShell;
