import React from "react";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export { TEAL } from "@/modules/company/constants";

export const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  completed: { label: "Completed", bg: "#ecfdf5", color: "#059669", icon: React.createElement(CheckCircle, { size: 14 }) },
  failed:    { label: "Failed",    bg: "#fef2f2", color: "#dc2626", icon: React.createElement(XCircle,    { size: 14 }) },
  cancelled: { label: "Cancelled", bg: "#fef2f2", color: "#dc2626", icon: React.createElement(XCircle,    { size: 14 }) },
  pending:   { label: "Pending",   bg: "#fffbeb", color: "#d97706", icon: React.createElement(Clock,      { size: 14 }) },
};

export const PLAN_COLORS: Record<string, string> = {
  Standard: "#0D9488",
  Gold:     "#7C3AED",
  Platinum: "#0891B2",
  Diamond:  "#D97706",
};

export const SUB_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  active:    { bg: "#f0fdf4", color: "#16a34a" },
  cancelled: { bg: "#fef2f2", color: "#dc2626" },
  expired:   { bg: "#fef9c3", color: "#ca8a04" },
};
