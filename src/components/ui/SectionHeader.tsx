/**
 * SectionHeader — consistent title block for each content section.
 *
 * Usage:
 *   <SectionHeader
 *     title="Skills Matrix"
 *     subtitle="View and manage skill levels across your team"
 *     action={<Button>Export</Button>}
 *   />
 */

import React from "react";
import { Box, Typography } from "@mui/material";

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional element rendered on the right (button, chips, etc.) */
  action?: React.ReactNode;
  /** Reduce vertical padding for use inside cards */
  compact?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
  compact = false,
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      mb: compact ? 2 : 3,
      gap: 2,
    }}
  >
    <Box>
      <Typography
        sx={{
          fontSize: compact ? "1rem" : "1.25rem",
          fontWeight: 700,
          color: "#111827",
          lineHeight: 1.3,
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          sx={{
            fontSize: "0.875rem",
            color: "#6b7280",
            mt: 0.5,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
    {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
  </Box>
);

export default SectionHeader;
