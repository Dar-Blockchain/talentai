import React from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
import { useCampaignDetail } from "@/modules/company/campaigns";
import CampaignDetail from "@/modules/company/campaigns/components/details/CampaignDetail";
import CampaignDetailSkeleton from "@/modules/company/campaigns/components/details/CampaignDetailSkeleton";
import CampaignDetailError from "@/modules/company/campaigns/components/details/CampaignDetailError";

const CampaignDetailsPage: React.FC = () => {
  const { checking } = useCompanyAccess("canViewCampaigns");
  const { id } = useRouter().query;

  const {
    campaign, loading, error,
    canEdit, canDelete, canPublish,
    handleDelete, handleChangeStatus, handleSaveConfig,
  } = useCampaignDetail(id);

  return (
    <DashboardLayout>
      {loading || checking ? (
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
        />
      ) : null}
    </DashboardLayout>
  );
};

export default CampaignDetailsPage;
