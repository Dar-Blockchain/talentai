import { EmployeesPageContent } from "@/modules/company/employees";
import { getDashboardLayout } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";

const EmployeesPage: NextPageWithLayout = EmployeesPageContent;
EmployeesPage.getLayout = getDashboardLayout;

export default EmployeesPage;
