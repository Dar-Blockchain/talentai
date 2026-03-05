/**
 * DataRow — a standard member / participant list row with avatar, info and actions.
 *
 * Usage:
 *   <DataRow
 *     avatar="JS"
 *     primary="Jane Smith"
 *     secondary="Product Designer · Paris"
 *     badge={<StatusBadge status="active" />}
 *     actions={<IconButton><MoreVertIcon /></IconButton>}
 *   />
 */

import React from "react";
import { Avatar, Box, Divider, Typography } from "@mui/material";

export interface DataRowProps {
  /** Initials or full URL for the avatar */
  avatar?: string;
  /** Avatar background colour — used when initials are shown */
  avatarColor?: string;
  /** Main label (name, title…) */
  primary: string;
  /** Secondary text below primary */
  secondary?: string;
  /** Optional badge / chip aligned to the right of primary text */
  badge?: React.ReactNode;
  /** Action buttons rendered at the far right */
  actions?: React.ReactNode;
  /** Show a bottom divider (default true) */
  divider?: boolean;
  /** Optional click handler for the entire row */
  onClick?: () => void;
}

const DataRow: React.FC<DataRowProps> = ({
  avatar,
  avatarColor = "#0D9488",
  primary,
  secondary,
  badge,
  actions,
  divider = true,
  onClick,
}) => {
  // If avatar looks like a URL (starts with http or /) treat as image src
  const isUrl = avatar ? /^(https?:\/\/|\/)/.test(avatar) : false;

  return (
    <>
      <Box
        onClick={onClick}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          py: 1.5,
          px: 0,
          cursor: onClick ? "pointer" : "default",
          transition: "background-color 0.15s",
          borderRadius: 1,
          "&:hover": onClick ? { backgroundColor: "#f9fafb" } : {},
        }}
      >
        {/* Avatar */}
        {avatar !== undefined && (
          <Avatar
            src={isUrl ? avatar : undefined}
            sx={{
              width: 38,
              height: 38,
              backgroundColor: avatarColor,
              fontSize: "0.875rem",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {!isUrl ? avatar : undefined}
          </Avatar>
        )}

        {/* Text */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "0.9375rem",
                color: "#111827",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {primary}
            </Typography>
            {badge}
          </Box>
          {secondary && (
            <Typography
              sx={{
                fontSize: "0.8125rem",
                color: "#6b7280",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {secondary}
            </Typography>
          )}
        </Box>

        {/* Actions */}
        {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
      </Box>
      {divider && <Divider sx={{ borderColor: "#f3f4f6" }} />}
    </>
  );
};

export default DataRow;
