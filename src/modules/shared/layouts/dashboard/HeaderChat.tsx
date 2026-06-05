"use client";
import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { selectCandidateConversations } from "@/modules/chat/candidate-chat/store/candidateChatSlice";
import { useCandidateConversationsQuery } from "@/modules/chat/candidate-chat/queries/useCandidateChatQueries";
import { selectTeamConversations } from "@/modules/chat/team-chat/store/teamChatSlice";
import { useTeamConversationsQuery } from "@/modules/chat/team-chat/queries/useTeamChatQueries";
import { getTeamChatBasePath, getTeamChatConversationPath } from "@/modules/chat/team-chat/utils/routes";
import { getCandidateChatBasePath, getCandidateChatConversationPath } from "@/modules/chat/candidate-chat/utils/routes";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useChatUnreadBadges } from "@/modules/chat/shared/hooks/useChatUnreadBadges";
import { normalizeConversationUnreadCount } from "@/modules/chat/shared/utils/normalizeConversationUnread";
import { getParticipantDisplayName } from "@/modules/chat/shared/components/helpers";
import { TEAM_LAST_MESSAGE_DELETED_SENTINEL } from "@/modules/chat/team-chat/constants/lastMessagePreview";

const TEAL    = "#6AD39C";  // brand-mint
const TEAL_BG = "#EDFAF3";  // primary-light

const HeaderChat: React.FC = () => {
  const router = useRouter();
  const { t: tShared, i18n } = useTranslation("shared/chat");
  const { t: tTeam }       = useTranslation("modules/company/teamChat");
  const { t: tCandidate }  = useTranslation("modules/candidates/candidateChat");
  const { t: tCompanyHub } = useTranslation("modules/company/companyChat");

  const currentUser = useSelector((s: RootState) => s.user.connectedUser.user);
  const role        = currentUser?.role;
  const isEmployee  = role === "Employee";
  const usesCandidateChat = role === "Company" || role === "Candidate";

  const candidateConversations = useSelector(selectCandidateConversations);
  const teamConversations      = useSelector(selectTeamConversations);
  useTeamConversationsQuery(undefined,   { enabled: isEmployee       && !!currentUser?._id });
  useCandidateConversationsQuery(undefined, { enabled: usesCandidateChat && !!currentUser?._id });

  const conversations         = isEmployee ? teamConversations : candidateConversations;
  const { activeModuleUnread } = useChatUnreadBadges();
  const teamChatBasePath       = getTeamChatBasePath(role);
  const candidateChatBasePath  = getCandidateChatBasePath(role);

  const headerTitle = isEmployee ? tTeam("header.team")
    : role === "Company" ? tCompanyHub("header.company") : tCandidate("header.candidate");
  const emptyLabel = isEmployee ? tTeam("header.empty_team") : tShared("header.empty");
  const openLabel  = isEmployee ? tTeam("header.open_team")  : tShared("header.open");

  const fmtTime = (iso?: string): string => {
    if (!iso) return "";
    const d    = new Date(iso);
    const now  = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
    const locale = i18n.language?.startsWith("fr") ? "fr-FR" : "en-US";
    if (diff === 0) return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
    if (diff === 1) return tShared("header.yesterday");
    if (diff < 7)   return d.toLocaleDateString(locale, { weekday: "short" });
    return d.toLocaleDateString(locale, { month: "short", day: "numeric" });
  };

  const [open, setOpen] = useState(false);
  const totalBadge = activeModuleUnread;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative flex items-center justify-center size-8 rounded-[9px] cursor-pointer transition-colors text-gray-500 hover:bg-[#EDFAF3]"
      >
        <MessageSquare className="size-5" />
        {totalBadge > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-px leading-none">
            {totalBadge > 9 ? "9+" : totalBadge}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-[340px] rounded-[12px] border border-gray-200 overflow-hidden z-50 flex flex-col"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)", background: "#fff" }}
        >
          {/* Brand gradient top accent */}
          <div className="h-[3px] bg-brand-gradient w-full" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold text-gray-900">{headerTitle}</span>
              {totalBadge > 0 && (
                <span
                  className="size-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: TEAL }}
                >
                  {totalBadge > 9 ? "9+" : totalBadge}
                </span>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[340px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
            {conversations.length === 0 ? (
              <div className="py-12 text-center">
                <MessageSquare className="size-10 mx-auto mb-2 text-gray-300" />
                <p className="text-[13px] text-gray-400">{emptyLabel}</p>
              </div>
            ) : conversations.slice(0, 8).map((conv, i) => {
              const uid   = currentUser?._id != null ? String(currentUser._id) : "";
              const other = conv.participants?.find((p) => String(p._id) !== uid);
              const name  = getParticipantDisplayName(other);
              const initial    = name[0]?.toUpperCase() || "?";
              const lastMsg    = conv.lastMessage;
              const unreadN    = normalizeConversationUnreadCount(conv.unreadCount, uid || undefined);
              const teamLastPreviewDeleted = isEmployee
                && (!!lastMsg?.isDeletedForEveryone || lastMsg?.text === TEAM_LAST_MESSAGE_DELETED_SENTINEL);
              const hasUnread = unreadN > 0;
              const convPath  = isEmployee
                ? getTeamChatConversationPath(role, conv._id)
                : getCandidateChatConversationPath(role, conv._id);

              return (
                <React.Fragment key={conv._id}>
                  <button
                    onClick={() => { router.push(convPath); setOpen(false); }}
                    className="flex gap-3 w-full px-4 py-3 cursor-pointer transition-colors text-left"
                    style={{ background: hasUnread ? TEAL_BG : "transparent" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = hasUnread ? TEAL_BG : "transparent")}
                  >
                    {/* Avatar with unread badge */}
                    <div className="relative shrink-0">
                      <Avatar className="size-[38px] shrink-0" style={{ background: TEAL }}>
                        <AvatarFallback className="text-[14px] text-white" style={{ background: TEAL }}>
                          {initial}
                        </AvatarFallback>
                      </Avatar>
                      {unreadN > 0 && (
                        <span
                          className="absolute -bottom-0.5 -right-0.5 min-w-[16px] h-[16px] rounded-full text-white text-[9px] font-bold flex items-center justify-center px-px leading-none"
                          style={{ background: TEAL }}
                        >
                          {unreadN}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className={`text-[13px] truncate text-gray-900 ${hasUnread ? "font-bold" : "font-semibold"}`}>
                          {name}
                        </span>
                        <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                          {fmtTime(lastMsg?.timestamp)}
                        </span>
                      </div>
                      <p
                        className="text-[12px] truncate"
                        style={{
                          color:      hasUnread ? TEAL : "#6B7280",
                          fontWeight: hasUnread ? 600 : 400,
                          fontStyle:  teamLastPreviewDeleted ? "italic" : undefined,
                        }}
                      >
                        {teamLastPreviewDeleted
                          ? tShared("messages.this_message_was_deleted")
                          : lastMsg?.text || tShared("header.no_messages_yet")}
                      </p>
                    </div>
                  </button>
                  {i < Math.min(conversations.length, 8) - 1 && (
                    <hr className="border-t border-gray-100 mx-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-3">
            <button
              onClick={() => { router.push(isEmployee ? teamChatBasePath : candidateChatBasePath); setOpen(false); }}
              className="w-full py-1.5 text-[13px] font-semibold rounded-[8px] transition-colors cursor-pointer"
              style={{ color: TEAL }}
              onMouseEnter={(e) => (e.currentTarget.style.background = TEAL_BG)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {openLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderChat;
