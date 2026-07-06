import React from "react";
import { useRouter } from "next/router";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { useCampaignDetail } from "@/modules/company/campaigns";
import CampaignDetail from "@/modules/company/campaigns/components/details/CampaignDetail";
import CampaignDetailSkeleton from "@/modules/company/campaigns/components/details/CampaignDetailSkeleton";
import CampaignDetailError from "@/modules/company/campaigns/components/details/CampaignDetailError";
import { getDashboardLayout } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";

const CampaignDetailsPage: NextPageWithLayout = () => {
  const { checking } = useCompanyAccess("canViewCampaigns");
  const { id } = useRouter().query;

  const {
    campaign, loading, error,
    canEdit, canDelete, canPublish,
    handleDelete, handleChangeStatus, handleSaveConfig,
    statusLoading, configLoading,
  } = useCampaignDetail(id);

  return loading || checking ? (
    <CampaignDetailSkeleton />
  ) : error ? (
    <CampaignDetailError message={error} />
  ) : campaign ? (
    <CampaignDetail
      campaign={campaign}
      onDelete={handleDelete}
      onChangeStatus={handleChangeStatus}
      onSaveModuleConfig={handleSaveConfig}
      canEdit={canEdit}
      canDelete={canDelete}
      canPublish={canPublish}
      statusLoading={statusLoading}
      configLoading={configLoading}
    />
  ) : null;
};
CampaignDetailsPage.getLayout = getDashboardLayout;

export default CampaignDetailsPage;