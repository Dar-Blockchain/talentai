import { isEmpty, isInvalidNumber } from "@/utils/functions";

type ToastFn = (params: {
  message: string;
  severity: "error" | "success" | "info" | "warning";
}) => void;

/* =========================
   AGENT CONFIG – VALIDATION
========================= */

export const validateAgentConfig = (
  values: any,
  showToast: ToastFn
): boolean => {
  const {
    thresholdPercent,
    bidBudgetMin,
    bidBudgetMax,
    bidStep,
    maxCandidatesToBid,
    maxDailySpending,
    agentLifetimeDays,
    bidLifetimeDays,
  } = values || {};

  /* ---------- Threshold ---------- */
  if (isInvalidNumber(thresholdPercent)) {
    showToast({
      message: "Match threshold is required",
      severity: "error",
    });
    return false;
  }

  if (thresholdPercent < 0 || thresholdPercent > 100) {
    showToast({
      message: "Match threshold must be between 0 and 100",
      severity: "error",
    });
    return false;
  }

  /* ---------- Budget ---------- */
  if (isInvalidNumber(bidBudgetMin) || isInvalidNumber(bidBudgetMax)) {
    showToast({
      message: "Minimum and maximum bid budgets are required",
      severity: "error",
    });
    return false;
  }

  if (bidBudgetMin < 0 || bidBudgetMax < 0) {
    showToast({
      message: "Bid budgets must be greater than or equal to 0",
      severity: "error",
    });
    return false;
  }

  if (bidBudgetMin > bidBudgetMax) {
    showToast({
      message: "Minimum bid budget cannot exceed maximum bid budget",
      severity: "error",
    });
    return false;
  }

  /* ---------- Bid Step ---------- */
  if (isInvalidNumber(bidStep) || bidStep <= 0) {
    showToast({
      message: "Bid increment must be greater than 0",
      severity: "error",
    });
    return false;
  }

  /* ---------- Candidates ---------- */
  if (isInvalidNumber(maxCandidatesToBid) || maxCandidatesToBid < 1) {
    showToast({
      message: "Max candidates to bid must be at least 1",
      severity: "error",
    });
    return false;
  }

  /* ---------- Daily Spending ---------- */
  if (
    !isEmpty(maxDailySpending) &&
    (isNaN(Number(maxDailySpending)) || maxDailySpending < 0)
  ) {
    showToast({
      message: "Daily spending limit cannot be negative",
      severity: "error",
    });
    return false;
  }

  /* ---------- Lifecycle ---------- */
  if (isInvalidNumber(agentLifetimeDays) || agentLifetimeDays < 1) {
    showToast({
      message: "Agent lifetime must be at least 1 day",
      severity: "error",
    });
    return false;
  }

  if (isInvalidNumber(bidLifetimeDays) || bidLifetimeDays < 1) {
    showToast({
      message: "Bid lifetime must be at least 1 day",
      severity: "error",
    });
    return false;
  }

  return true;
};