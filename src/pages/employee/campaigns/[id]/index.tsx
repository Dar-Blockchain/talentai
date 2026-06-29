import React from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import CampaignDetail from "@/modules/company/campaigns/components/details/CampaignDetail";
import CampaignDetailSkeleton from "@/modules/company/campaigns/components/details/CampaignDetailSkeleton";
import CampaignDetailError from "@/modules/company/campaigns/components/details/CampaignDetailError";
import { RootState } from "@/store/store";
import { apiFetchCampaignById } from "@/modules/company/campaigns/api";
import dynamic from "next/dynamic";
import { getDashboardLayout } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";

const EmployeeCampaignDetailsPage: React.FC = () => {
  const router   = useRouter();
  const { id }   = router.query;
  const authUser = useSelector((state: RootState) => state.user.connectedUser.user);

  const campaignId = typeof id === "string" ? id : undefined;

  const { data: campaign, isLoading, error } = useQuery({
    queryKey:  ["campaign-detail", campaignId, authUser?._id],
    queryFn:   () => apiFetchCampaignById(campaignId!, authUser!._id),
    enabled:   !!campaignId && !!authUser?._id,
    staleTime: 30_000,
  });

  return isLoading ? (
    <CampaignDetailSkeleton />
  ) : error ? (
    <CampaignDetailError message={(error as Error).message ?? "Failed to load campaign"} />
  ) : campaign ? (
    <CampaignDetail campaign={campaign} mode="employee" />
  ) : null;
};

const EmployeeCampaignDetailsPageDynamic: NextPageWithLayout = dynamic(
  () => Promise.resolve(EmployeeCampaignDetailsPage),
  { ssr: false },
);
EmployeeCampaignDetailsPageDynamic.getLayout = getDashboardLayout;

export default EmployeeCampaignDetailsPageDynamic;
