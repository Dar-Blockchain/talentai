import React from "react";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlined      from "@mui/icons-material/CancelOutlined";
import PendingOutlined     from "@mui/icons-material/PendingOutlined";

export { TEAL } from "@/modules/company/constants";

export const STATUS_CONFIG: Record<string, { label: string; color: "success" | "error" | "warning" | "default"; icon: React.ReactNode }> = {
  completed: { label: "Completed", color: "success", icon: React.createElement(CheckCircleOutlined, { sx: { fontSize: 14 } }) },
  failed:    { label: "Failed",    color: "error",   icon: React.createElement(CancelOutlined,       { sx: { fontSize: 14 } }) },
  cancelled: { label: "Cancelled", color: "error",   icon: React.createElement(CancelOutlined,       { sx: { fontSize: 14 } }) },
  pending:   { label: "Pending",   color: "warning", icon: React.createElement(PendingOutlined,      { sx: { fontSize: 14 } }) },
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
