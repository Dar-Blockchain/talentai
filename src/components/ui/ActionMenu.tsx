/**
 * ActionMenu — three-dot icon button that opens a simple MUI Menu.
 *
 * Usage:
 *   <ActionMenu
 *     items={[
 *       { label: "Edit",   icon: <EditOutlined />, onClick: handleEdit },
 *       { label: "Delete", icon: <DeleteOutlined />, onClick: handleDelete, danger: true },
 *     ]}
 *   />
 */

import React, { useState } from "react";
import { IconButton, Menu, MenuItem, ListItemIcon, Typography } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  /** Render the item in red / destructive style */
  danger?: boolean;
  disabled?: boolean;
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  /** Accessible label for the trigger button */
  ariaLabel?: string;
  /** Size of the trigger button */
  size?: "small" | "medium";
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  items,
  ariaLabel = "More options",
  size = "small",
}) => {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const open = Boolean(anchor);

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setAnchor(e.currentTarget);
  };
  const handleClose = () => setAnchor(null);

  return (
    <>
      <IconButton
        size={size}
        aria-label={ariaLabel}
        aria-controls={open ? "action-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleOpen}
        sx={{ color: "#9ca3af", "&:hover": { backgroundColor: "#f3f4f6" } }}
      >
        <MoreVertIcon sx={{ fontSize: 20 }} />
      </IconButton>

      <Menu
        id="action-menu"
        anchorEl={anchor}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            sx: {
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              borderRadius: 2,
              minWidth: 160,
              border: "1px solid #e5e7eb",
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {items.map((item) => (
          <MenuItem
            key={item.label}
            onClick={item.onClick}
            disabled={item.disabled}
            sx={{
              gap: 1.5,
              px: 2,
              py: 1,
              color: item.danger ? "#dc2626" : "#374151",
              "&:hover": {
                backgroundColor: item.danger ? "#fef2f2" : "#f9fafb",
              },
            }}
          >
            {item.icon && (
              <ListItemIcon sx={{ minWidth: "auto", color: "inherit" }}>
                {item.icon}
              </ListItemIcon>
            )}
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
              {item.label}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ActionMenu;
