"use client";

import React from "react";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
import { cn } from "@/lib/utils";

const SIZE_CLASS: Record<string, string> = {
  xs: "size-[26px] rounded-lg",
  sm: "size-8 rounded-lg",
  md: "size-9 rounded-[10px]",
};
const SIZE_ICON: Record<string, number> = { xs: 15, sm: 17, md: 18 };

// Soft, brand-teal hover for every item rendered inside this menu — scoped to
// this component (not the shared shadcn primitive) so other DropdownMenu
// usages elsewhere in the app keep their own look. Destructive items keep a
// soft red tint instead of teal.
const SOFT_ITEM_HOVER = cn(
  "[&_[data-slot=dropdown-menu-item]]:cursor-pointer",
  "[&_[data-slot=dropdown-menu-item]]:transition-colors",
  "[&_[data-slot=dropdown-menu-item]:not([data-variant=destructive])]:focus:bg-teal-50",
  "[&_[data-slot=dropdown-menu-item]:not([data-variant=destructive])]:focus:text-teal-700",
  "[&_[data-slot=dropdown-menu-item][data-variant=destructive]]:focus:bg-red-50",
);

export interface MoreOptionsMenuProps {
  /** DropdownMenuItem(s) / DropdownMenuSeparator(s) etc. */
  children: React.ReactNode;
  /** Controlled open state — omit for an uncontrolled menu. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Extra handler fired alongside the built-in stopPropagation, e.g. legacy
   * anchor-tracking (`onMenuOpen(e)`) call sites still expect. */
  onTriggerClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  icon?: React.ElementType;
  iconSize?: number;
  /** aria-label on the trigger button. */
  label?: string;
  size?: "xs" | "sm" | "md";
  /** Bordered/white-bg look (used in page headers) instead of the default
   * plain ghost-hover look (used in cards). */
  bordered?: boolean;
  disabled?: boolean;
  /** Extra classes merged onto the trigger button. */
  className?: string;
  /** Extra classes merged onto the dropdown content. */
  contentClassName?: string;
  /** Stops the trigger/content click from bubbling to a clickable parent
   * (card rows, table rows, etc.) — on by default since that's the common case. */
  stopPropagation?: boolean;
}

/** Reusable "three dots → dropdown" trigger + content shell. Menu items stay
 * fully custom children (DropdownMenuItem/DropdownMenuSeparator) — this only
 * standardizes the button that opens the menu and the propagation/sizing
 * boilerplate every call site otherwise repeats. */
export function MoreOptionsMenu({
  children,
  open,
  onOpenChange,
  onTriggerClick,
  align = "end",
  side,
  icon: Icon = MoreVertical,
  iconSize,
  label = "More options",
  size = "sm",
  bordered = false,
  disabled,
  className,
  contentClassName,
  stopPropagation = true,
}: MoreOptionsMenuProps) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={label}
          disabled={disabled}
          onClick={(e) => {
            if (stopPropagation) e.stopPropagation();
            onTriggerClick?.(e);
          }}
          className={cn(
            "flex shrink-0 cursor-pointer items-center justify-center outline-none transition-all duration-150 active:scale-90",
            bordered
              ? "border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-teal-50 hover:text-teal-600 hover:shadow-sm"
              : "text-slate-400 hover:bg-teal-50 hover:text-teal-600",
            "data-[state=open]:bg-teal-50 data-[state=open]:text-teal-600",
            "disabled:pointer-events-none disabled:opacity-40",
            SIZE_CLASS[size],
            className,
          )}
        >
          <Icon size={iconSize ?? SIZE_ICON[size]} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        side={side}
        onClick={(e) => { if (stopPropagation) e.stopPropagation(); }}
        className={cn("min-w-[188px] rounded-xl p-1.5 shadow-lg", SOFT_ITEM_HOVER, contentClassName)}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default MoreOptionsMenu;
