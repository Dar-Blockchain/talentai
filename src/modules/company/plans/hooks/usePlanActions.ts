import { useCallback } from "react";
import {
  useCancelSubscriptionMutation,
  useEnableAutoRenewMutation,
  useCheckoutMutation,
} from "../queries";
import type { Snack } from "../types";

interface Deps {
  cancelSubId:          string | null;
  downgradePlanSubId:   string | null;
  currentAutoRenew:     boolean;
  closeCancelDialog:    () => void;
  closeDowngradeDialog: () => void;
  showSnack:            Snack;
}

const DOWNGRADE_MSG = "Downgrade scheduled. Your current plan stays active until it expires.";

export function usePlanActions({
  cancelSubId,
  downgradePlanSubId,
  currentAutoRenew,
  closeCancelDialog,
  closeDowngradeDialog,
  showSnack,
}: Deps) {
  const cancelMutation    = useCancelSubscriptionMutation();
  const autoRenewMutation = useEnableAutoRenewMutation();
  const checkoutMutation  = useCheckoutMutation();

  const handleConfirmCancel = useCallback(() => {
    if (!cancelSubId) return;
    cancelMutation.mutateAsync({ subscriptionId: cancelSubId })
      .then(() => { closeCancelDialog(); showSnack("Auto-renewal disabled.", "success"); })
      .catch((err: Error) => { closeCancelDialog(); showSnack(err.message, "error"); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cancelSubId, closeCancelDialog, showSnack]);

  const handleConfirmDowngrade = useCallback(() => {
    if (!downgradePlanSubId) return;
    closeDowngradeDialog();
    if (currentAutoRenew === false) {
      showSnack(DOWNGRADE_MSG, "success");
      return;
    }
    cancelMutation.mutateAsync({ subscriptionId: downgradePlanSubId, reason: "downgrade" })
      .then(() => showSnack(DOWNGRADE_MSG, "success"))
      .catch((err: Error) => showSnack(err.message, "error"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downgradePlanSubId, currentAutoRenew, closeDowngradeDialog, showSnack]);

  const handleEnableAutoRenew = useCallback((subscriptionId: string) => {
    autoRenewMutation.mutateAsync(subscriptionId)
      .then(() => showSnack("Auto-renewal re-enabled.", "success"))
      .catch((err: Error) => showSnack(err.message, "error"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSnack]);

  const handleSubscribe = useCallback((planId: string) => {
    checkoutMutation.mutateAsync(planId)
      .catch((err: Error) => showSnack(err.message, "error"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSnack]);

  return {
    cancelling:  cancelMutation.isPending,
    checkingOut: checkoutMutation.isPending,
    handleConfirmCancel,
    handleConfirmDowngrade,
    handleEnableAutoRenew,
    handleSubscribe,
  };
}
