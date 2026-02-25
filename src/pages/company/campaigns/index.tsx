import React, { useEffect } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import RoleGuard from "@/components/guards/RoleGuard";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import AppButton from "@/components/ui/AppButton";
import AddOutlined from "@mui/icons-material/AddOutlined";
import CampaignsStats from "@/components/features/company/campaigns/list/Stats";
import CampaignsGrid from "@/components/features/company/campaigns/list/CampaignsGrid";
import {
  fetchCampaigns,
  selectCampaignLimit,
  selectCampaignPage,
  selectCampaignCount,
  setPage,
  setLimit
} from "@/store/slices/campaignSlice";
import { useSelector } from "react-redux";
import Pagination from "@/components/ui/Pagination";
import CampaignOutlined from "@mui/icons-material/CampaignOutlined";
import EmptyState from "@/components/ui/EmptyState"; 

const CampaignsPage: React.FC = () => {


  return (
    <RoleGuard allowedRoles={["Company"]}>
      <DashboardLayout>
        <PageHeader
          title="Campaigns"
          subtitle="Manage and monitor all company campaigns"
          breadcrumbs={[
            { label: "Dashboard", href: "/company/dashboard" },
            { label: "Campaigns" },
          ]}
          actions={[
            <Link href="/company/campaigns/new">
              <AppButton
                key="new"
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
    </RoleGuard>
  );
};

export default CampaignsPage;