import { useCallback } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { usePermissionsQuery } from "@/modules/company/employees/queries";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "react-i18next";
import { CampaignModule, CampaignStatus, ModuleType } from "@/modules/company/campaigns/types/campaign";
import {
  useCampaignDetailQuery,
  useUpdateCampaignMutation,
  useUpdateCampaignStatusMutation,
  useDeleteCampaignMutation,
} from "../queries";

export function useCampaignDetail(id: string | string[] | undefined) {
  const router        = useRouter();
  const { showToast } = useToast();
  const { t }         = useTranslation("dashboard");
  const toastBase     = "pages.campaigns.toast";

  const campaignId = typeof id === "string" ? id : undefined;

  const detailQ   = useCampaignDetailQuery(campaignId);
  const updateMut = useUpdateCampaignMutation(campaignId ?? "");
  const statusMut = useUpdateCampaignStatusMutation(campaignId ?? "");
  const deleteMut = useDeleteCampaignMutation();

  const user     = useSelector((s: RootState) => s.user.connectedUser.user);
  const isEmp    = user?.role === "Employee";
  const { data: empPerms } = usePermissionsQuery(user?._id, isEmp);
  const canEdit    = !isEmp || (empPerms !== null && (!!empPerms.canEditCampaign || !!empPerms.canCreateCampaign));
  const canDelete  = !isEmp || (empPerms !== null && !!empPerms.canDeleteCampaign);
  const canPublish = !isEmp || (empPerms !== null && !!empPerms.canPublishCampaign);

  const handleDelete = useCallback(async (cId: string) => {
    try {
      await deleteMut.mutateAsync(cId);
      showToast({ message: t(`${toastBase}.deleted_success`), severity: "success" });
      router.push("/company/campaigns");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : undefined;
      showToast({ message: message || t(`${toastBase}.delete_failed`), severity: "error" });
    }
  }, [deleteMut, router, showToast, t]);

  const handleChangeStatus = useCallback(async (cId: string, status: CampaignStatus) => {
    try {
      await statusMut.mutateAsync(status);
      showToast({
        message: t(`${toastBase}.status_updated`, { status: t(`pages.campaigns.status.${status}`) }),
        severity: "success",
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : undefined;
      showToast({ message: message || t(`${toastBase}.status_failed`), severity: "error" });
    }
  }, [statusMut, showToast, t]);

  const handleSaveConfig = useCallback(async (
    cId: string,
    moduleType: ModuleType,
    config: NonNullable<CampaignModule["config"]>,
  ) => {
    try {
      await updateMut.mutateAsync({ module: { type: moduleType, config } as CampaignModule });
      showToast({ message: t(`${toastBase}.module_saved`), severity: "success" });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : undefined;
      showToast({ message: message || t(`${toastBase}.module_save_failed`), severity: "error" });
    }
  }, [updateMut, showToast, t]);

  return {
    campaign:     detailQ.data ?? null,
    loading:      detailQ.isLoading,
    error:        detailQ.error ? String(detailQ.error) : null,
    statusLoading: statusMut.isPending,
    configLoading: updateMut.isPending,
    canEdit, canDelete, canPublish,
    handleDelete:       canDelete  ? handleDelete       : undefined,
    handleChangeStatus: canPublish ? handleChangeStatus : undefined,
    handleSaveConfig:   canEdit    ? handleSaveConfig   : undefined,
    refetch: detailQ.refetch,
  };
}
