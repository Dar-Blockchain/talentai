import { useState, useCallback } from "react";
import { toast } from "sonner";
import { PlanLimit } from "@/store/slices/planLimitsSlice";
import type { DowngradePlan, Snack } from "../types";

export function usePlanDialogs() {
  const [confirmOpen, setConfirmOpen]     = useState(false);
  const [cancelSubId, setCancelSubId]     = useState<string | null>(null);
  const [contactOpen, setContactOpen]     = useState(false);
  const [downgradePlan, setDowngradePlan] = useState<DowngradePlan | null>(null);

  const showSnack = useCallback<Snack>((message, severity) => toast[severity](message), []);

  const openCancelDialog = useCallback((subscriptionId: string) => {
    setCancelSubId(subscriptionId);
    setConfirmOpen(true);
  }, []);

  const closeCancelDialog = useCallback(() => {
    setConfirmOpen(false);
    setCancelSubId(null);
  }, []);

  const openDowngradeDialog = useCallback((plan: PlanLimit, currentSubId: string) =>
    setDowngradePlan({ plan, currentSubId }), []);

  const closeDowngradeDialog = useCallback(() => setDowngradePlan(null), []);

  return {
    showSnack,
    confirmOpen, cancelSubId, openCancelDialog, closeCancelDialog,
    contactOpen, setContactOpen,
    downgradePlan, openDowngradeDialog, closeDowngradeDialog,
  };
}
