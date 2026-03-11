import React, { useEffect, useCallback } from "react";
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
  deleteCampaign,
  updateCampaignStatus,
  selectSelectedCampaign,
  selectDetailLoading,
  selectDetailError,
  clearSelectedCampaign,
  updateCampaign,
} from "@/store/slices/campaignSlice";
import { useToast } from "@/hooks/useToast";
import { CampaignModule, CampaignStatus, ModuleType } from "@/types/campaign";

const CampaignDetailsPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const campaign = useSelector(selectSelectedCampaign);
  const loading = useSelector(selectDetailLoading);
  const error = useSelector(selectDetailError);

  useEffect(() => {
    if (id && typeof id === "string") {
      dispatch(fetchCampaignById(id));
    }
    return () => {
      dispatch(clearSelectedCampaign());
    };
  }, [dispatch, id]);

  const handleDelete = useCallback(
    async (campaignId: string) => {
      try {
        await dispatch(deleteCampaign(campaignId)).unwrap();
        showToast({ message: "Campaign deleted successfully!", severity: "success" });
        router.push("/company/campaigns");
      } catch (e: any) {
        showToast({ message: e || "Failed to delete campaign", severity: "error" });
      }
    },
    [dispatch, router, showToast],
  );

  const handleChangeStatus = useCallback(
    async (campaignId: string, status: CampaignStatus) => {
      try {
        await dispatch(updateCampaignStatus({ campaignId, status })).unwrap();
        showToast({
          message: `Campaign status updated to ${status.toLowerCase()}`,
          severity: "success",
        });
      } catch (e: any) {
        showToast({ message: e || "Failed to update status", severity: "error" });
      }
    },
    [dispatch, showToast],
  );

  const handleSaveConfig = useCallback(
    async (
      campaignId: string,
      moduleType: ModuleType,
      config: NonNullable<CampaignModule["config"]>,
    ) => {
      try {
        const updatePayload = {
          module: {
            type: moduleType,
            config
          } as CampaignModule
        }
        await dispatch(updateCampaign({campaignId, updatePayload})).unwrap();
        showToast({ message: "Module configuration saved!", severity: "success" });
      } catch (e: any) {
        showToast({ message: e || "Failed to save module configuration", severity: "error" });
      }
    },
    [dispatch, showToast],
  );

  const breadcrumbTitle = loading
    ? "Loading..."
    : error
      ? "Not found"
      : campaign?.title ?? "";

  return (
      <DashboardLayout>
        <PageHeader
          title=""
          breadcrumbs={[
            { label: "Dashboard", href: "/company/dashboard" },
            { label: "Campaigns", href: "/company/campaigns" },
            { label: breadcrumbTitle },
          ]}
        />

        {loading ? (
          <CampaignDetailSkeleton />
        ) : error ? (
          <CampaignDetailError message={error} />
        ) : campaign ? (
          <CampaignDetail
            campaign={campaign}
            onDelete={handleDelete}
            onChangeStatus={handleChangeStatus}
            onSaveModuleConfig={handleSaveConfig}
          />
        ) : null}
      </DashboardLayout>
  );
};

export default CampaignDetailsPage;