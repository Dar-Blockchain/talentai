import { useRouter } from "next/router";
import { EmployeeDetailPageContent } from "@/modules/company/employees";

export default function EmployeeDetailPage() {
  const { id } = useRouter().query;
  return <EmployeeDetailPageContent id={id as string | undefined} />;
}
