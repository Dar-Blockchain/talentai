/**
 * StatusBadge — coloured chip/pill for status labels (Active, Completed, Pending…).
 *
 * Usage:
 *   <StatusBadge status="active" />
 *   <StatusBadge status="completed" />
 *   <StatusBadge status="pending" label="In Review" color="#2563EB" />
 */

import React from "react";
import { Box, Typography } from "@mui/material";

// Built-in preset statuses
type PresetStatus =
  | "active"
  | "completed"
  | "pending"
  | "in_progress"
  | "paused"
  | "cancelled"
  | "error"
  | "success"
  | "warning"
  | "info";

const PRESETS: Record<PresetStatus, { bg: string; color: string; dot: string; label: string }> = {
  active:      { bg: "#d1fae5", color: "#065f46", dot: "#10b981", label: "Active" },
  completed:   { bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6", label: "Completed" },
  pending:     { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b", label: "Pending" },
  in_progress: { bg: "#ede9fe", color: "#5b21b6", dot: "#7c3aed", label: "In Progress" },
  paused:      { bg: "#f3f4f6", color: "#374151", dot: "#9ca3af", label: "Paused" },
  cancelled:   { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444", label: "Cancelled" },
  error:       { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444", label: "Error" },
  success:     { bg: "#d1fae5", color: "#065f46", dot: "#10b981", label: "Success" },
  warning:     { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b", label: "Warning" },
  info:        { bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6", label: "Info" },
};

export interface StatusBadgeProps {
  /** One of the built-in preset keys OR a custom string when using custom colours */
  status: PresetStatus | string;
  /** Override the displayed text */
  label?: string;
  /** Override background colour (hex / rgba) */
  bg?: string;
  /** Override text colour */
  color?: string;
  /** Override dot colour */
  dot?: string;
  /** Hide the leading dot */
  noDot?: boolean;
  size?: "sm" | "md";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  bg,
  color,
  dot,
  noDot = false,
  size = "md",
}) => {
  const preset = PRESETS[status as PresetStatus];
  const resolvedBg = bg ?? preset?.bg ?? "#f3f4f6";
  const resolvedColor = color ?? preset?.color ?? "#374151";
  const resolvedDot = dot ?? preset?.dot ?? "#9ca3af";
  const resolvedLabel = label ?? preset?.label ?? status;

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.625,
        px: size === "sm" ? 1 : 1.25,
        py: size === "sm" ? 0.25 : 0.5,
        borderRadius: 10,
        backgroundColor: resolvedBg,
      }}
    >
      {!noDot && (
        <Box
          sx={{
            width: size === "sm" ? 5 : 6,
            height: size === "sm" ? 5 : 6,
            borderRadius: "50%",
            backgroundColor: resolvedDot,
            flexShrink: 0,
          }}
        />
      )}
      <Typography
        sx={{
          fontSize: size === "sm" ? "0.6875rem" : "0.75rem",
          fontWeight: 600,
          color: resolvedColor,
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        {resolvedLabel}
      </Typography>
    </Box>
  );
};

export default StatusBadge;
