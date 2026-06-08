import { useState, useCallback } from "react";
import { PlanLimit } from "@/store/slices/planLimitsSlice";
import type { DowngradePlan, Snack, SnackbarState } from "../types";

export function usePlanDialogs() {
  const [snackbar, setSnackbar]           = useState<SnackbarState>({ open: false, message: "", severity: "success" });
  const [confirmOpen, setConfirmOpen]     = useState(false);
  const [cancelSubId, setCancelSubId]     = useState<string | null>(null);
  const [contactOpen, setContactOpen]     = useState(false);
  const [downgradePlan, setDowngradePlan] = useState<DowngradePlan | null>(null);

  const showSnack = useCallback<Snack>((message, severity) =>
    setSnackbar({ open: true, message, severity }), []);

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
    snackbar, setSnackbar, showSnack,
    confirmOpen, cancelSubId, openCancelDialog, closeCancelDialog,
    contactOpen, setContactOpen,
    downgradePlan, openDowngradeDialog, closeDowngradeDialog,
  };
}
