import React from "react";
import EmployeeMySkills from "@/components/features/employee/EmployeeMySkills";
import dynamic from "next/dynamic";
import { getDashboardLayout } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";

const EmployeeSkills: React.FC = () => {
  return <EmployeeMySkills />;
};

const EmployeeSkillsPage: NextPageWithLayout = dynamic(() => Promise.resolve(EmployeeSkills), {
  ssr: false,
});
EmployeeSkillsPage.getLayout = getDashboardLayout;

export default EmployeeSkillsPage;
