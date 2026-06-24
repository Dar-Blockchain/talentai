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

// ─── Nav groups ───────────────────────────────────────────────────────────────

const NAV_GROUPS = [
  { labelKey: "candidate.nav.group_main",      ids: ["dashboard", "messages"] },
  { labelKey: "candidate.nav.group_workspace", ids: ["applications", "skills", "interviews"] },
  { labelKey: "candidate.nav.group_account",   ids: ["notifications", "settings"] },
];

// ─── Single nav item ──────────────────────────────────────────────────────────

interface NavItemProps {
  item: CandidateWorkspaceNavItem & { label: string; sublabel: string; active: boolean };
  unreadCount?: number;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ item, unreadCount = 0, onClick }) => {
  const Icon = item.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-150",
        item.active
          ? "border-transparent shadow-sm"
          : "border-transparent hover:bg-gray-50 hover:border-gray-200 active:scale-[0.99]"
      )}
      style={
        item.active
          ? { backgroundColor: `${item.color}12`, borderColor: `${item.color}30` }
          : undefined
      }
    >
      {/* Icon box */}
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors"
        style={{
          backgroundColor: item.active ? `${item.color}20` : "#F3F4F6",
          borderColor:     item.active ? `${item.color}40` : "#E5E7EB",
        }}
      >
        <Icon
          sx={{ fontSize: 17 }}
          style={{ color: item.active ? item.color : "#9CA3AF" }}
        />
      </span>

      {/* Label + sublabel */}
      <span className="flex flex-col min-w-0 flex-1">
        <span
          className="text-[0.82rem] font-semibold leading-tight truncate"
          style={{ color: item.active ? item.color : "#1F2937" }}
        >
          {item.label}
        </span>
        <span className="text-[0.65rem] text-gray-400 leading-tight truncate mt-0.5">
          {item.sublabel}
        </span>
      </span>

      {/* Badges / indicators */}
      {item.id === "messages" && unreadCount > 0 && (
        <ChatUnreadBadge count={unreadCount} />
      )}
      {item.active && (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: item.color }}
        />
      )}
    </button>
  );
};

// ─── Horizontal pill (mobile top bar) ────────────────────────────────────────

interface HorizontalNavProps {
  items: (CandidateWorkspaceNavItem & { label: string; active: boolean })[];
  unreadCount: number;
  onNavigate: (href: string) => void;
}

const HorizontalNav: React.FC<HorizontalNavProps> = ({ items, unreadCount, onNavigate }) => (
  <div className="flex gap-1.5 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:h-1">
    {items.map((item) => {
      const Icon = item.icon;
      return (
        <button
          key={item.id}
          onClick={() => onNavigate(item.href)}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 transition-all duration-150"
          style={{
            backgroundColor: item.active ? item.bg   : "#fff",
            borderColor:     item.active ? item.border : "#E5E7EB",
          }}
        >
          <Icon
            sx={{ fontSize: 15 }}
            style={{ color: item.active ? item.color : "#6B7280" }}
          />
          <span
            className="whitespace-nowrap text-[0.75rem]"
            style={{
              fontWeight: item.active ? 700 : 500,
              color:      item.active ? item.color : "#374151",
            }}
          >
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
        const groupItems = items.filter((item) => group.ids.includes(item.id));
        if (!groupItems.length) return null;

        const groupLabel = t(group.labelKey, { defaultValue: group.labelKey });

        return (
          <div key={group.labelKey} className="flex flex-col gap-1">
            <p className="px-1 pb-1 text-[0.6rem] font-bold uppercase tracking-widest text-gray-400">
              {groupLabel}
            </p>
            {groupItems.map((item) => (
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
