/**
 * SectionCard — white card wrapper for any content section.
 * Provides consistent padding, border-radius and shadow.
 *
 * Usage:
 *   <SectionCard>
 *     <SectionHeader title="Top Performers" />
 *     ...
 *   </SectionCard>
 *
 *   <SectionCard noPadding>
 *     <DataTable ... />
 *   </SectionCard>
 */

import React from "react";
import { Box } from "@mui/material";

export interface SectionCardProps {
  children: React.ReactNode;
  /** Remove internal padding (e.g. for full-bleed tables) */
  noPadding?: boolean;
  /** Custom sx overrides */
  sx?: object;
}

const SectionCard: React.FC<SectionCardProps> = ({
  children,
  noPadding = false,
  sx = {},
}) => (
  <Box
    sx={{
      backgroundColor: "#fff",
      borderRadius: 3,
      border: "1px solid #f3f4f6",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      p: noPadding ? 0 : 3,
      overflow: noPadding ? "hidden" : "visible",
      ...sx,
    }}
  >
    {children}
  </Box>
);

export default SectionCard;
