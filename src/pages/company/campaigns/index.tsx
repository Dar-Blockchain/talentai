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
} from "@/store/slices/campaignSlice";

const CampaignsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchCampaigns());
  }, [dispatch]);

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
            <Link href='/company/campaigns/new'>
            <AppButton
              key="new"
              label="New Campaign"
              variant="contained"
              startIcon={<AddOutlined />}
              size="medium"
            /></Link>,
          ]}
        />
        <CampaignsStats />
        <CampaignsGrid />
      </DashboardLayout>
    </RoleGuard>
  );
};

export default CampaignsPage;
