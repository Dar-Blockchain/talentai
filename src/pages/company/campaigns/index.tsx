import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import AppButton from "@/components/ui/AppButton";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { RootState } from "@/store/store";
import { selectEmployeePermissions } from "@/store/slices/memberSlice";

const AddOutlined = dynamic(() => import("@mui/icons-material/AddOutlined"));

const CampaignsStats = dynamic(
  () => import("@/components/features/company/campaigns/list/Stats")
);

const CampaignsGrid = dynamic(
  () => import("@/components/features/company/campaigns/list/CampaignsGrid"),
  { ssr: false }
);

const CampaignsPage: React.FC = () => {
  const { t } = useTranslation(["campaign", "dashboard"]);
  useCompanyAccess("canViewCampaigns");

  const user     = useSelector((state: RootState) => state.user.connectedUser.user);
  const empPerms = useSelector(selectEmployeePermissions);
  const isEmp    = user?.role === "Employee";
  const canCreate = !isEmp || !!empPerms?.canCreateCampaign;

  return (
    <DashboardLayout>
      <PageHeader
        title={t("pages.title")}
        subtitle={t("pages.subtitle")}
        breadcrumbs={[
          { label: t("pages.common.dashboard"), href: "/company/dashboard" },
          { label: t("pages.title") },
        ]}
        actions={canCreate ? [
          <Link key="new" href="/company/campaigns/new">
            <AppButton
              label={t("pages.new_campaign")}
              variant="contained"
              startIcon={<AddOutlined />}
              size="medium"
            />
          </Link>,
        ] : []}
      />

      <CampaignsStats />
      <CampaignsGrid />
    </DashboardLayout>
  );
};

export default CampaignsPage;