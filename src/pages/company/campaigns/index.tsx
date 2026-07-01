import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { usePermissionsQuery } from "@/modules/company/employees/queries";
import { useTranslation } from "react-i18next";

import PageHeader from "@/modules/shared/layouts/dashboard/PageHeader";
import AppButton from "@/components/ui/AppButton";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { RootState } from "@/store/store";
import { getDashboardLayout } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";

const AddOutlined = dynamic(() => import("@mui/icons-material/AddOutlined"));

const CampaignsStats = dynamic(
  () => import("@/modules/company/campaigns/components/list/Stats")
);

const CampaignsGrid = dynamic(
  () => import("@/modules/company/campaigns/components/list/CampaignsGrid"),
  { ssr: false }
);

const CampaignsPage: NextPageWithLayout = () => {
  const { t } = useTranslation("dashboard");
  useCompanyAccess("canViewCampaigns");

  const user     = useSelector((state: RootState) => state.user.connectedUser.user);
  const isEmp    = user?.role === "Employee";
  const { data: empPerms } = usePermissionsQuery(user?._id, isEmp);
  const canCreate = !isEmp || !!empPerms?.canCreateCampaign;

  return (
    <>
      <PageHeader
        title={t("pages.campaigns.title")}
        subtitle={t("pages.campaigns.subtitle")}
        breadcrumbs={[
          { label: t("pages.common.dashboard"), href: "/company/dashboard" },
          { label: t("pages.campaigns.title") },
        ]}
        actions={canCreate ? [
          <Link key="new" href="/company/campaigns/new">
            <AppButton
              label={t("pages.campaigns.new_campaign")}
              variant="contained"
              startIcon={<AddOutlined />}
              size="medium"
            />
          </Link>,
        ] : []}
      />

      <CampaignsStats />
      <CampaignsGrid />
    </>
  );
};
CampaignsPage.getLayout = getDashboardLayout;

export default CampaignsPage;