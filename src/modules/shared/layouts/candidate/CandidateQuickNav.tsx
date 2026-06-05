import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import {
  candidateWorkspaceNavItems,
  isCandidateWorkspaceNavActive,
} from "@/modules/shared/layouts/candidate/candidateWorkspaceNav";
import { useChatUnreadBadges } from "@/modules/chat/shared/hooks/useChatUnreadBadges";
import ChatUnreadBadge from "@/modules/chat/shared/components/ChatUnreadBadge";

interface CandidateQuickNavProps {
  variant?:    "vertical" | "horizontal";
  onNavigate?: () => void;
}

const CandidateQuickNav: React.FC<CandidateQuickNavProps> = ({
  variant = "vertical",
  onNavigate,
}) => {
  const { t }   = useTranslation("dashboard");
  const router  = useRouter();
  const viewQuery = router.query.view;
  const { candidateChatUnread } = useChatUnreadBadges();

  const handleNavigate = (href: string) => {
    onNavigate?.();
    router.push(href);
  };

  const items = candidateWorkspaceNavItems.map((item) => ({
    ...item,
    label:    t(item.labelKey),
    sublabel: t(item.sublabelKey),
    active:   isCandidateWorkspaceNavActive(item, router.pathname, viewQuery),
  }));

  if (variant === "horizontal") {
    return (
      <div className="flex gap-[6px] overflow-x-auto pb-[2px] [&::-webkit-scrollbar]:h-1">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => handleNavigate(item.href)}
            className="flex items-center gap-[6px] px-[10px] py-[7px] rounded-[12px] cursor-pointer shrink-0 transition-all duration-[0.18s]"
            style={{
              border:          `1px solid ${item.active ? item.border : "#E5E7EB"}`,
              backgroundColor: item.active ? item.bg : "#fff",
            }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = item.border; el.style.backgroundColor = item.bg; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = item.active ? item.border : "#E5E7EB"; el.style.backgroundColor = item.active ? item.bg : "#fff"; }}
          >
            <item.icon size={16} style={{ color: item.active ? item.color : "#6B7280" }} />
            <span
              className="text-[0.78rem] whitespace-nowrap"
              style={{ fontWeight: item.active ? 700 : 500, color: item.active ? item.color : "#374151" }}
            >
              {item.label}
            </span>
            {item.id === "messages" && <ChatUnreadBadge count={candidateChatUnread} size="md" />}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[16px] border border-[#E5E7EB] p-4 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <p className="text-[0.72rem] font-bold text-[#94A3B8] uppercase tracking-[0.06em] mb-[10px]">
        {t("candidate.nav.navigation")}
      </p>
      <div className="flex flex-col gap-[6px]">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => handleNavigate(item.href)}
            className="flex items-center gap-[10px] px-[12px] py-[9px] rounded-[12px] cursor-pointer transition-all duration-[0.18s]"
            style={{
              border:          `1px solid ${item.active ? item.border : "#E5E7EB"}`,
              backgroundColor: item.active ? item.bg : "#FAFAFA",
            }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = item.border; el.style.backgroundColor = item.bg; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = item.active ? item.border : "#E5E7EB"; el.style.backgroundColor = item.active ? item.bg : "#FAFAFA"; }}
          >
            <div
              className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0"
              style={{
                backgroundColor: item.active ? `${item.color}18` : "#fff",
                border:          `1px solid ${item.active ? item.border : "#E5E7EB"}`,
              }}
            >
              <item.icon size={16} style={{ color: item.active ? item.color : "#6B7280" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[0.82rem] leading-[1.2]"
                style={{ fontWeight: item.active ? 700 : 500, color: item.active ? item.color : "#374151" }}
              >
                {item.label}
              </p>
              <p className="text-[0.62rem] text-[#94A3B8]">{item.sublabel}</p>
            </div>
            {item.id === "messages" && <ChatUnreadBadge count={candidateChatUnread} />}
            {item.active && (
              <div className="w-[6px] h-[6px] rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandidateQuickNav;
