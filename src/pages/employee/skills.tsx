import React from "react";
import DashboardLayout from "@/modules/shared/layouts/dashboard/DashboardLayout";
import EmployeeMySkills from "@/components/features/employee/EmployeeMySkills";
import dynamic from "next/dynamic";

const EmployeeSkillsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <EmployeeMySkills />
    </DashboardLayout>
  );
};

export default dynamic(() => Promise.resolve(EmployeeSkillsPage), {
  ssr: false,
});
