import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import AppButton from "@/components/ui/AppButton";

const AddOutlined = dynamic(() => import("@mui/icons-material/AddOutlined"));

const CampaignsStats = dynamic(
  () => import("@/components/features/company/campaigns/list/Stats")
);

const CampaignsGrid = dynamic(
  () => import("@/components/features/company/campaigns/list/CampaignsGrid"),
  { ssr: false }
);

const CampaignsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <PageHeader
        title="Campaigns"
        subtitle="Manage and monitor all company campaigns"
        breadcrumbs={[
          { label: "Dashboard", href: "/company/dashboard" },
          { label: "Campaigns" },
        ]}
        actions={[
          <Link key="new" href="/company/campaigns/new">
            <AppButton
              label="New Campaign"
              variant="contained"
              startIcon={<AddOutlined />}
              size="medium"
            />
          </Link>,
        ]}
      />

      <CampaignsStats />
      <CampaignsGrid />
    </DashboardLayout>
  );
};

export default CampaignsPage;