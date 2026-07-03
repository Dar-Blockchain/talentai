"use client";

import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  candidateWorkspaceNavItems,
  isCandidateWorkspaceNavActive,
  type CandidateWorkspaceNavItem,
} from "./candidateWorkspaceNav";
import { useChatUnreadBadges } from "@/modules/chat/shared/hooks/useChatUnreadBadges";
import ChatUnreadBadge from "@/modules/chat/shared/components/ChatUnreadBadge";

const NAV_GROUPS = [
  { labelKey: "candidate.nav.group_main",      ids: ["dashboard", "messages"] },
  { labelKey: "candidate.nav.group_workspace", ids: ["applications", "skills", "interviews"] },
  { labelKey: "candidate.nav.group_account",   ids: ["settings"] },
];

// ─── Vertical nav item ────────────────────────────────────────────────────────

interface NavItemProps {
  item: CandidateWorkspaceNavItem & { label: string; sublabel: string; active: boolean };
  unreadCount?: number;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ item, unreadCount = 0, onClick }) => {
  const Icon = item.icon;
  const { classes, active } = item;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer",
        active
          ? cn("shadow-sm", classes.activeBg)
          : "border-transparent hover:bg-muted hover:border-border active:scale-[0.99]",
      )}
    >
      {/* Icon box */}
      <span className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-xl border transition-colors",
        active ? classes.iconBg : "bg-muted border-border",
      )}>
        <Icon className={cn("size-[17px]", active ? classes.text : "text-muted-foreground")} />
      </span>

      {/* Label + sublabel */}
      <span className="flex flex-col min-w-0 flex-1">
        <span className={cn(
          "text-[0.82rem] font-semibold leading-tight truncate",
          active ? classes.text : "text-foreground",
        )}>
          {item.label}
        </span>
        <span className="text-[0.65rem] text-muted-foreground leading-tight truncate mt-0.5">
          {item.sublabel}
        </span>
      </span>

      {/* Badges */}
      {item.id === "messages" && unreadCount > 0 && (
        <ChatUnreadBadge count={unreadCount} />
      )}
      {active && (
        <span className={cn("size-1.5 shrink-0 rounded-full", classes.dot)} />
      )}
    </button>
  );
};

// ─── Horizontal pill nav (inside mobile drawer) ───────────────────────────────

interface HorizontalNavProps {
  items: (CandidateWorkspaceNavItem & { label: string; active: boolean })[];
  unreadCount: number;
  onNavigate: (href: string) => void;
}

const HorizontalNav: React.FC<HorizontalNavProps> = ({ items, unreadCount, onNavigate }) => (
  <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
    {items.map((item) => {
      const Icon = item.icon;
      const { classes, active } = item;
      return (
        <button
          key={item.id}
          onClick={() => onNavigate(item.href)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 transition-all duration-150 cursor-pointer",
            active ? classes.activeBg : "bg-card border-border hover:bg-muted",
          )}
        >
          <Icon className={cn("size-[15px]", active ? classes.text : "text-muted-foreground")} />
          <span className={cn(
            "whitespace-nowrap text-[0.75rem]",
            active ? cn("font-bold", classes.text) : "font-medium text-foreground",
          )}>
            {item.label}
          </span>
          {item.id === "messages" && <ChatUnreadBadge count={unreadCount} size="md" />}
        </button>
      );
    })}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

interface CandidateQuickNavProps {
  variant?: "vertical" | "horizontal";
  onNavigate?: () => void;
}

const CandidateQuickNav: React.FC<CandidateQuickNavProps> = ({
  variant = "vertical",
  onNavigate,
}) => {
  const { t } = useTranslation("dashboard");
  const router = useRouter();
  const viewQuery = router.query.view;
  const { candidateChatUnread } = useChatUnreadBadges();

  const items = candidateWorkspaceNavItems.map((item) => ({
    ...item,
    label:    t(item.labelKey),
    sublabel: t(item.sublabelKey),
    active:   isCandidateWorkspaceNavActive(item, router.pathname, viewQuery),
  }));

  const handleNavigate = (href: string) => {
    onNavigate?.();
    router.push(href);
  };

  if (variant === "horizontal") {
    return (
      <HorizontalNav
        items={items}
        unreadCount={candidateChatUnread}
        onNavigate={handleNavigate}
      />
    );
  }

  return (
    <nav className="flex flex-col gap-5">
      {NAV_GROUPS.map((group) => {
        const groupItems = items.filter(item => group.ids.includes(item.id));
        if (!groupItems.length) return null;
        return (
          <div key={group.labelKey} className="flex flex-col gap-1">
            <p className="px-1 pb-1 text-[0.6rem] font-bold uppercase tracking-widest text-muted-foreground">
              {t(group.labelKey, { defaultValue: group.labelKey })}
            </p>
            {groupItems.map(item => (
              <NavItem
                key={item.id}
                item={item}
                unreadCount={item.id === "messages" ? candidateChatUnread : 0}
                onClick={() => handleNavigate(item.href)}
              />
            ))}
          </div>
        );
      })}
    </nav>
  );
};

export default CandidateQuickNav;
