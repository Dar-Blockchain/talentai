import { usePlanDialogs } from "./usePlanDialogs";
import { usePlanData } from "./usePlanData";
import { usePlanActions } from "./usePlanActions";

export function usePlans() {
  const dialogs = usePlanDialogs();
  const data    = usePlanData(dialogs.showSnack);

  const currentAutoRenew = data.currentPlanName
    ? (data.activeSubByPlanName[data.currentPlanName]?.autoRenew ?? true)
    : true;

  const cancellingPlanName =
    dialogs.cancelSubId
      ? (data.combined?.subscriptions?.find((s) => s.id === dialogs.cancelSubId)?.planName ?? "this plan")
      : "this plan";

  const actions = usePlanActions({
    cancelSubId:          dialogs.cancelSubId,
    downgradePlanSubId:   dialogs.downgradePlan?.currentSubId ?? null,
    currentAutoRenew,
    closeCancelDialog:    dialogs.closeCancelDialog,
    closeDowngradeDialog: dialogs.closeDowngradeDialog,
    showSnack:            dialogs.showSnack,
  });

  return {
    ...data,
    ...dialogs,
    cancellingPlanName,
    currentAutoRenew,
    ...actions,
  };
}
