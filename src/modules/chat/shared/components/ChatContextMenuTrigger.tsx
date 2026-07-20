import React, { memo } from "react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/modules/shared/ui/shadcn/tooltip";
import { cn } from "@/lib/utils";

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
  const button = (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-expanded={menuOpen ? true : undefined}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(15,23,42,0.2)] bg-white/95 p-0 text-[#6B7280] shadow-[0_1px_3px_rgba(15,23,42,0.07)]",
        "transition-[opacity,transform,background-color,border-color,box-shadow] duration-200",
        "hover:scale-[1.06] hover:border-[#0D948866] hover:bg-[#0D948820] hover:text-[#0D9488] hover:shadow-[0_4px_14px_rgba(13,148,136,0.24)]",
        menuOpen && "border-[#0D948866] bg-[#0D94881c] text-[#0D9488]",
        visibility === "fadeOnRowHover" ? (menuOpen ? "opacity-100" : "opacity-0") : "opacity-100",
        className,
      )}
    >
      {children}
    </button>
  );

  if (tooltipTitle) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>{tooltipTitle}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
});

export default ChatContextMenuTrigger;
