import { useRouter } from "next/router";
import { EmployeeDetailPageContent } from "@/modules/company/employees";
import { getDashboardLayout } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";

const EmployeeDetailPage: NextPageWithLayout = function EmployeeDetailPage() {
  const { id } = useRouter().query;
  return <EmployeeDetailPageContent id={id as string | undefined} />;
};
EmployeeDetailPage.getLayout = getDashboardLayout;

export default EmployeeDetailPage;
