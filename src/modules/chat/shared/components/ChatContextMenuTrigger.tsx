import React, { memo } from "react";
import { IconButton, Tooltip, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { CHAT_CONTEXT_MENU_EASE } from "./helpers";
import { safeAlpha } from "@/utils/safeMuiAlpha";

export type ChatContextMenuTriggerVisibility = "always" | "fadeOnRowHover";

export interface ChatContextMenuTriggerProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  "aria-label": string;
  /** Shown while menu is open (pressed / active look). */
  menuOpen?: boolean;
  /** `fadeOnRowHover`: hidden until parent row uses `&:hover .delete-btn { opacity: 1 }` (same as message bubbles). */
  visibility?: ChatContextMenuTriggerVisibility;
  /** Extra classes; for fade mode include `delete-btn` so `MessageList` row hover still reveals the control. */
  className?: string;
  tooltipTitle?: string;
  children: React.ReactNode;
}

/**
 * Shared ⋮ trigger — same surface / hover / open state as team message row menus.
 */
const ChatContextMenuTrigger = memo(function ChatContextMenuTrigger({
  onClick,
  "aria-label": ariaLabel,
  menuOpen = false,
  visibility = "always",
  className,
  tooltipTitle,
  children,
}: ChatContextMenuTriggerProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const primary = theme.palette.primary.main;

  const surfaceSx = {
    width: 36,
    height: 36,
    borderRadius: "50%",
    p: 0,
    bgcolor: isDark ? safeAlpha(theme.palette.common.white, 0.08) : safeAlpha(theme.palette.common.white, 0.95),
    border: `1px solid ${alpha(theme.palette.divider, isDark ? 0.42 : 0.2)}`,
    color: isDark ? safeAlpha(theme.palette.common.white, 0.88) : alpha(theme.palette.text.secondary, 1),
    boxShadow: isDark
      ? `0 1px 5px ${alpha("#000", 0.4)}`
      : `0 1px 3px ${alpha("#0f172a", 0.07)}`,
    transition: `opacity 0.22s ${CHAT_CONTEXT_MENU_EASE}, transform 0.2s ${CHAT_CONTEXT_MENU_EASE}, background-color 0.2s ${CHAT_CONTEXT_MENU_EASE}, border-color 0.2s ${CHAT_CONTEXT_MENU_EASE}, box-shadow 0.2s ${CHAT_CONTEXT_MENU_EASE}`,
    "@media (hover: hover)": {
      "&:hover": {
        bgcolor: isDark ? alpha(primary, 0.24) : alpha(primary, 0.12),
        borderColor: alpha(primary, isDark ? 0.55 : 0.42),
        color: primary,
        transform: "scale(1.06)",
        boxShadow: isDark
          ? `0 4px 16px ${alpha(primary, 0.35)}`
          : `0 4px 14px ${alpha(primary, 0.24)}`,
      },
    },
    ...(menuOpen
      ? {
          bgcolor: isDark ? alpha(primary, 0.22) : alpha(primary, 0.11),
          borderColor: alpha(primary, isDark ? 0.5 : 0.4),
          color: primary,
        }
      : {}),
  };

  const visibilitySx =
    visibility === "fadeOnRowHover"
      ? {
          opacity: menuOpen ? 1 : 0,
        }
      : {
          opacity: 1,
        };

  const button = (
    <IconButton
      size="small"
      className={className}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={menuOpen ? true : undefined}
      sx={{
        ...visibilitySx,
        ...surfaceSx,
      }}
    >
      {children}
    </IconButton>
  );

  if (tooltipTitle) {
    return <Tooltip title={tooltipTitle}>{button}</Tooltip>;
  }

  return button;
});

export default ChatContextMenuTrigger;
