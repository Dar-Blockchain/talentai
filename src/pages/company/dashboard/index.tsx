import { useEffect } from "react";
import { useRouter } from "next/router";

const CompanyDashboardRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/company/dashboard/hiring");
  }, [router]);

  return null;
};

export default CompanyDashboardRedirect;
