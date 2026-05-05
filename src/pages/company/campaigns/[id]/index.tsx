import React, { useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import CampaignDetail from "@/components/features/company/campaigns/details/CampaignDetail";
import CampaignDetailSkeleton from "@/components/features/company/campaigns/details/CampaignDetailSkeleton";
import CampaignDetailError from "@/components/features/company/campaigns/details/CampaignDetailError";
import { AppDispatch, RootState } from "@/store/store";
import { selectEmployeePermissions } from "@/store/slices/memberSlice";
import { useCompanyAccess } from "@/hooks/useCompanyAccess";
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
  const { checking } = useCompanyAccess("canViewCampaigns");
  const { t } = useTranslation("dashboard");
  const toastBase = "pages.campaigns.toast";

  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const campaign = useSelector(selectSelectedCampaign);
  const loading  = useSelector(selectDetailLoading);
  const error    = useSelector(selectDetailError);

  const user     = useSelector((state: RootState) => state.user.connectedUser.user);
  const empPerms = useSelector(selectEmployeePermissions);
  const isEmp    = user?.role === "Employee";
  // For employees: deny until permissions are actually loaded (null = still loading)
  // canCreateCampaign implies the right to configure a just-created campaign
  const canEdit    = !isEmp || (empPerms !== null && (!!empPerms.canEditCampaign || !!empPerms.canCreateCampaign));
  const canDelete  = !isEmp || (empPerms !== null && !!empPerms.canDeleteCampaign);
  const canPublish = !isEmp || (empPerms !== null && !!empPerms.canPublishCampaign);

  useEffect(() => {
    if (id && typeof id === "string") {
      dispatch(fetchCampaignById(id));
    }
    return () => {
      dispatch(clearSelectedCampaign());
    };
  }, [dispatch, id]);

  const handleDelete = useCallback(
    async (campaignId: string, _title?: string) => {
      try {
        await dispatch(deleteCampaign(campaignId)).unwrap();
        showToast({ message: t(`${toastBase}.deleted_success`), severity: "success" });
        router.push("/company/campaigns");
      } catch (e: any) {
        showToast({ message: e || t(`${toastBase}.delete_failed`), severity: "error" });
      }
    },
    [dispatch, router, showToast, t, toastBase],
  );

  const handleChangeStatus = useCallback(
    async (campaignId: string, status: CampaignStatus) => {
      try {
        await dispatch(updateCampaignStatus({ campaignId, status })).unwrap();
        showToast({
          message: t(`${toastBase}.status_updated`, {
            status: t(`pages.campaigns.status.${status}`),
          }),
          severity: "success",
        });
      } catch (e: any) {
        showToast({ message: e || t(`${toastBase}.status_failed`), severity: "error" });
      }
    },
    [dispatch, showToast, t, toastBase],
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
        showToast({ message: t(`${toastBase}.module_saved`), severity: "success" });
      } catch (e: any) {
        showToast({ message: e || t(`${toastBase}.module_save_failed`), severity: "error" });
      }
    },
    [dispatch, showToast, t, toastBase],
  );

  return (
      <DashboardLayout>

        {loading || checking ? (
          <CampaignDetailSkeleton />
        ) : error ? (
          <CampaignDetailError message={error} />
        ) : campaign ? (
          <CampaignDetail
            campaign={campaign}
            onDelete={canDelete ? handleDelete : undefined}
            onChangeStatus={canPublish ? handleChangeStatus : undefined}
            onSaveModuleConfig={canEdit ? handleSaveConfig : undefined}
            canEdit={canEdit}
            canDelete={canDelete}
            canPublish={canPublish}
          />
        ) : null}
      </DashboardLayout>
  );
};

export default CampaignDetailsPage;
