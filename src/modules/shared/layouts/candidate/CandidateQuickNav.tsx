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

// One shared gray-forward treatment for every item -- active is a light
// neutral row with a single thin brand-accent bar (no black fill, no
// per-page accent color), inactive is a quiet hover state.
const NavItem: React.FC<NavItemProps> = ({ item, unreadCount = 0, onClick }) => {
  const Icon = item.icon;
  const { active } = item;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-full flex items-center gap-3 pl-3.5 pr-3 py-2.5 rounded-xl border text-left transition-colors duration-150 cursor-pointer",
        active
          ? "bg-gray-50 border-gray-200"
          : "border-transparent hover:bg-gray-50 hover:border-gray-200",
      )}
    >
      {/* Active accent bar */}
      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-primary-dark" />
      )}

      {/* Icon box */}
      <span className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-xl border transition-colors",
        active ? "bg-white border-gray-300" : "bg-gray-100 border-gray-200",
      )}>
        <Icon className={cn("size-[17px]", active ? "text-gray-900" : "text-gray-500")} />
      </span>

      {/* Label + sublabel */}
      <span className="flex flex-col min-w-0 flex-1">
        <span className={cn(
          "text-[0.82rem] leading-tight truncate",
          active ? "font-bold text-gray-900" : "font-semibold text-gray-900",
        )}>
          {item.label}
        </span>
        <span className="text-[0.65rem] leading-tight truncate mt-0.5 text-gray-400">
          {item.sublabel}
        </span>
      </span>

      {/* Badges */}
      {item.id === "messages" && unreadCount > 0 && (
        <ChatUnreadBadge count={unreadCount} />
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
      const { active } = item;
      return (
        <button
          key={item.id}
          onClick={() => onNavigate(item.href)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 transition-colors duration-150 cursor-pointer",
            active ? "bg-gray-50 border-gray-300" : "bg-white border-gray-200 hover:bg-gray-50",
          )}
        >
          <Icon className={cn("size-[15px]", active ? "text-gray-900" : "text-gray-500")} />
          <span className={cn(
            "whitespace-nowrap text-[0.75rem]",
            active ? "font-bold text-gray-900" : "font-medium text-gray-900",
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
    <nav className="flex flex-col gap-5 bg-white rounded-2xl border border-gray-200 p-3 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      {NAV_GROUPS.map((group) => {
        const groupItems = items.filter(item => group.ids.includes(item.id));
        if (!groupItems.length) return null;
        return (
          <div key={group.labelKey} className="flex flex-col gap-1">
            <p className="px-1 pb-1 text-[0.6rem] font-bold uppercase tracking-widest text-gray-400">
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
