import { useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { selectEmployeePermissions } from "@/store/slices/memberSlice";
import {
  fetchCampaignById, deleteCampaign, updateCampaignStatus, updateCampaign,
  selectSelectedCampaign, selectDetailLoading, selectDetailError, clearSelectedCampaign,
} from "@/store/slices/campaignSlice";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "react-i18next";
import { CampaignModule, CampaignStatus, ModuleType } from "@/types/campaign";

export function useCampaignDetail(id: string | string[] | undefined) {
  const dispatch   = useDispatch<AppDispatch>();
  const router     = useRouter();
  const { showToast } = useToast();
  const { t }      = useTranslation("dashboard");
  const toastBase  = "pages.campaigns.toast";

  const campaign = useSelector(selectSelectedCampaign);
  const loading  = useSelector(selectDetailLoading);
  const error    = useSelector(selectDetailError);

  const user     = useSelector((state: RootState) => state.user.connectedUser.user);
  const empPerms = useSelector(selectEmployeePermissions);
  const isEmp    = user?.role === "Employee";
  const canEdit    = !isEmp || (empPerms !== null && (!!empPerms.canEditCampaign || !!empPerms.canCreateCampaign));
  const canDelete  = !isEmp || (empPerms !== null && !!empPerms.canDeleteCampaign);
  const canPublish = !isEmp || (empPerms !== null && !!empPerms.canPublishCampaign);

  useEffect(() => {
    if (id && typeof id === "string") dispatch(fetchCampaignById(id));
    return () => { dispatch(clearSelectedCampaign()); };
  }, [dispatch, id]);

  const handleDelete = useCallback(async (campaignId: string, _title?: string) => {
    try {
      await dispatch(deleteCampaign(campaignId)).unwrap();
      showToast({ message: t(`${toastBase}.deleted_success`), severity: "success" });
      router.push("/company/campaigns");
    } catch (e: any) {
      showToast({ message: e || t(`${toastBase}.delete_failed`), severity: "error" });
    }
  }, [dispatch, router, showToast, t]);

  const handleChangeStatus = useCallback(async (campaignId: string, status: CampaignStatus) => {
    try {
      await dispatch(updateCampaignStatus({ campaignId, status })).unwrap();
      showToast({
        message: t(`${toastBase}.status_updated`, { status: t(`pages.campaigns.status.${status}`) }),
        severity: "success",
      });
    } catch (e: any) {
      showToast({ message: e || t(`${toastBase}.status_failed`), severity: "error" });
    }
  }, [dispatch, showToast, t]);

  const handleSaveConfig = useCallback(async (
    campaignId: string,
    moduleType: ModuleType,
    config: NonNullable<CampaignModule["config"]>,
  ) => {
    try {
      await dispatch(updateCampaign({ campaignId, updatePayload: { module: { type: moduleType, config } as CampaignModule } })).unwrap();
      showToast({ message: t(`${toastBase}.module_saved`), severity: "success" });
    } catch (e: any) {
      showToast({ message: e || t(`${toastBase}.module_save_failed`), severity: "error" });
    }
  }, [dispatch, showToast, t]);

  return {
    campaign, loading, error,
    canEdit, canDelete, canPublish,
    handleDelete: canDelete ? handleDelete : undefined,
    handleChangeStatus: canPublish ? handleChangeStatus : undefined,
    handleSaveConfig: canEdit ? handleSaveConfig : undefined,
  };
}
