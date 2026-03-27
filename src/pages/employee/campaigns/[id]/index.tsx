import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import CampaignDetail from "@/components/features/company/campaigns/details/CampaignDetail";
import CampaignDetailSkeleton from "@/components/features/company/campaigns/details/CampaignDetailSkeleton";
import CampaignDetailError from "@/components/features/company/campaigns/details/CampaignDetailError";
import { AppDispatch } from "@/store/store";
import {
  fetchCampaignById,
  selectSelectedCampaign,
  selectDetailLoading,
  selectDetailError,
  clearSelectedCampaign,
} from "@/store/slices/campaignSlice";
import dynamic from "next/dynamic";

const EmployeeCampaignDetailsPage: React.FC = () => {
  const router   = useRouter();
  const { id }   = router.query;
  const dispatch = useDispatch<AppDispatch>();

  const campaign = useSelector(selectSelectedCampaign);
  const loading  = useSelector(selectDetailLoading);
  const error    = useSelector(selectDetailError);

  useEffect(() => {
    if (id && typeof id === "string") dispatch(fetchCampaignById(id));
    return () => { dispatch(clearSelectedCampaign()); };
  }, [dispatch, id]);

  const breadcrumbTitle = loading ? "Loading…" : error ? "Not found" : campaign?.title ?? "";

  return (
    <DashboardLayout>
      <PageHeader
        title=""
        breadcrumbs={[
          { label: "Dashboard", href: "/employee/dashboard" },
          { label: "My Campaigns", href: "/employee/campaigns" },
          { label: breadcrumbTitle },
        ]}
      />

      {loading ? (
        <CampaignDetailSkeleton />
      ) : error ? (
        <CampaignDetailError message={error} />
      ) : campaign ? (
        <CampaignDetail campaign={campaign} mode="employee" />
      ) : null}
    </DashboardLayout>
  );
};

export default dynamic(() => Promise.resolve(EmployeeCampaignDetailsPage), { ssr: false });
