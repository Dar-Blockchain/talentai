"use client";

import * as React from "react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/modules/shared/hooks/useMediaQuery";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/modules/shared/ui/shadcn/tooltip";

// ─── Constants ────────────────────────────────────────────────────────────────

export const SIDEBAR_WIDTH      = "240px";
export const SIDEBAR_WIDTH_ICON = "64px";

// ─── Context ──────────────────────────────────────────────────────────────────

type SidebarState = "expanded" | "collapsed";

interface SidebarCtxValue {
  state:          SidebarState;
  open:           boolean;
  setOpen:        (open: boolean) => void;
  openMobile:     boolean;
  setOpenMobile:  (open: boolean) => void;
  isMobile:       boolean;
  toggleSidebar:  () => void;
}

const SidebarCtx = React.createContext<SidebarCtxValue | null>(null);

export function useSidebar(): SidebarCtxValue {
  const ctx = React.useContext(SidebarCtx);
  if (!ctx) throw new Error("useSidebar must be used within <SidebarProvider>.");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface SidebarProviderProps extends React.ComponentProps<"div"> {
  defaultOpen?:          boolean;
  open?:                 boolean;
  onOpenChange?:         (open: boolean) => void;
  openMobile?:           boolean;
  onOpenMobileChange?:   (open: boolean) => void;
}

export function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  openMobile: openMobileProp,
  onOpenMobileChange: setOpenMobileProp,
  className,
  style,
  children,
  ...props
}: SidebarProviderProps) {
  const isMobile = useIsMobile(768);

  const [_open,       _setOpen]       = React.useState(defaultOpen);
  const [_openMobile, _setOpenMobile] = React.useState(false);

  const open       = openProp       ?? _open;
  const openMobile = openMobileProp ?? _openMobile;

  const setOpen = React.useCallback((value: boolean) => {
    if (setOpenProp) { setOpenProp(value); } else { _setOpen(value); }
  }, [setOpenProp]);

  const setOpenMobile = React.useCallback((value: boolean) => {
    if (setOpenMobileProp) { setOpenMobileProp(value); } else { _setOpenMobile(value); }
  }, [setOpenMobileProp]);

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) { setOpenMobile(!openMobile); } else { setOpen(!open); }
  }, [isMobile, open, openMobile, setOpen, setOpenMobile]);

  const state: SidebarState = open ? "expanded" : "collapsed";

  const ctx = React.useMemo<SidebarCtxValue>(
    () => ({ state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar }),
    [state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar],
  );

  return (
    <SidebarCtx.Provider value={ctx}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={{
            "--sidebar-width":      SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            ...style,
          } as React.CSSProperties}
          className={cn("flex min-h-screen w-full", className)}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarCtx.Provider>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar({ className, children, ...props }: React.ComponentProps<"div">) {
  const { state, openMobile, setOpenMobile } = useSidebar();

  const panelCls = cn(
    "dark flex flex-col overflow-hidden",
    "border-r border-sidebar-border bg-card",
    "shadow-[4px_0_20px_rgba(0,0,0,0.15)]",
    "transition-[width] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
    className,
  );
  const panelWidth = state === "expanded"
    ? "var(--sidebar-width)"
    : "var(--sidebar-width-icon)";

  return (
    <>
      {/* ── Desktop permanent sidebar ── */}
      <div
        data-slot="sidebar"
        data-state={state}
        className="hidden md:block shrink-0 transition-[width] duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ width: panelWidth }}
      >
        <div
          className={cn(panelCls, "fixed inset-y-0 left-0")}
          style={{ width: panelWidth }}
          {...props}
        >
          {children}
        </div>
      </div>

      {/* ── Mobile overlay drawer ── */}
      {openMobile && (
        <div data-slot="sidebar-mobile" className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpenMobile(false)}
          />
          <div
            className={cn(panelCls, "absolute inset-y-0 left-0")}
            style={{ width: "var(--sidebar-width)" }}
            {...props}
          >
            {children}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Structural sections ──────────────────────────────────────────────────────

export function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="sidebar-header" className={cn("flex shrink-0 flex-col", className)} {...props} />
  );
}

export function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="sidebar-footer" className={cn("flex shrink-0 flex-col", className)} {...props} />
  );
}

export function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn("flex flex-1 flex-col overflow-y-auto overflow-x-hidden py-2 px-1", className)}
      style={{ scrollbarWidth: "thin", scrollbarColor: "hsl(var(--sidebar-border)) transparent" }}
      {...props}
    />
  );
}

export function SidebarSeparator({ className, ...props }: React.ComponentProps<"div">) {
  const { state } = useSidebar();
  return (
    <div
      data-slot="sidebar-separator"
      className={cn("my-[6px] h-px", state === "collapsed" ? "mx-auto w-6" : "w-full", className)}
      style={{ backgroundColor: "hsl(var(--sidebar-border))" }}
      {...props}
    />
  );
}

// ─── Groups ───────────────────────────────────────────────────────────────────

export function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="sidebar-group" className={cn("mb-[6px]", className)} {...props} />
  );
}

interface SidebarGroupLabelProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

export function SidebarGroupLabel({ asChild = false, className, ...props }: SidebarGroupLabelProps) {
  const { state } = useSidebar();
  if (state === "collapsed") return null;
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="sidebar-group-label"
      className={cn(
        "px-[10px] pb-[5px] text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarGroupContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="sidebar-group-content" className={cn("flex flex-col gap-[2px]", className)} {...props} />
  );
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

export function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul data-slot="sidebar-menu" className={cn("flex flex-col gap-[2px]", className)} {...props} />
  );
}

interface SidebarMenuItemProps extends React.ComponentProps<"li"> {
  isActive?: boolean;
}

export function SidebarMenuItem({ isActive, className, children, ...props }: SidebarMenuItemProps) {
  const { state } = useSidebar();
  return (
    <li data-slot="sidebar-menu-item" className={cn("relative", className)} {...props}>
      {/* Active left accent bar */}
      {isActive && state === "expanded" && (
        <span
          className="pointer-events-none absolute left-0 w-[3px] rounded-r-[3px] bg-brand-green"
          style={{ top: "20%", bottom: "20%" }}
        />
      )}
      {children}
    </li>
  );
}

// ─── Menu Button ──────────────────────────────────────────────────────────────

interface SidebarMenuButtonProps extends React.ComponentProps<"button"> {
  asChild?:  boolean;
  isActive?: boolean;
  tooltip?:  string;
}

export function SidebarMenuButton({
  asChild   = false,
  isActive  = false,
  tooltip,
  className,
  ...props
}: SidebarMenuButtonProps) {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;
  const Comp: React.ElementType = asChild ? Slot.Root : "button";

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-active={isActive || undefined}
      className={cn(
        "relative flex w-full items-center rounded-[9px] cursor-pointer overflow-hidden",
        "outline-none transition-[background-color,color] duration-[120ms]",
        isCollapsed
          ? "justify-center h-[42px] px-0"
          : "gap-[10px] px-[10px] py-[7px]",
        isActive
          ? "bg-brand-mint/[.13] text-brand-mint font-semibold hover:bg-brand-mint/20"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
      {...props}
    />
  );

  if (tooltip && isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right">{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

// ─── Menu Badge ───────────────────────────────────────────────────────────────

export function SidebarMenuBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="sidebar-menu-badge"
      className={cn(
        "ml-auto min-w-[18px] h-[18px] rounded-full",
        "bg-brand-mint text-white text-[9px] font-bold",
        "flex items-center justify-center px-px leading-none shrink-0",
        className,
      )}
      {...props}
    />
  );
}
