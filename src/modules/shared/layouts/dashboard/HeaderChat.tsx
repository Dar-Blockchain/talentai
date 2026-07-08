"use client";

import React, { useState } from "react";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Avatar, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";
import { Popover, PopoverTrigger, PopoverContent } from "@/modules/shared/ui/shadcn/popover";
import { MessageCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { selectCandidateConversations } from "@/modules/chat/candidate-chat/store/candidateChatSlice";
import { useCandidateConversationsQuery } from "@/modules/chat/candidate-chat/queries/useCandidateChatQueries";
import { selectTeamConversations } from "@/modules/chat/team-chat/store/teamChatSlice";
import { useTeamConversationsQuery } from "@/modules/chat/team-chat/queries/useTeamChatQueries";
import { getTeamChatBasePath, getTeamChatConversationPath } from "@/modules/chat/team-chat/utils/routes";
import {
  getCandidateChatBasePath,
  getCandidateChatConversationPath,
} from "@/modules/chat/candidate-chat/utils/routes";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useChatUnreadBadges } from "@/modules/chat/shared/hooks/useChatUnreadBadges";
import { normalizeConversationUnreadCount } from "@/modules/chat/shared/utils/normalizeConversationUnread";
import { getParticipantDisplayName } from "@/modules/chat/shared/components/helpers";
import { TEAM_LAST_MESSAGE_DELETED_SENTINEL } from "@/modules/chat/team-chat/constants/lastMessagePreview";
import { cn } from "@/lib/utils";

const TEAL    = "#0D9488";
const TEAL_BG = "#F0FDFA";

const HeaderChat: React.FC = () => {
  const router   = useRouter();
  const { t: tShared, i18n } = useTranslation("shared/chat");
  const { t: tTeam } = useTranslation("modules/company/teamChat");
  const { t: tCandidate } = useTranslation("modules/candidates/candidateChat");
  const { t: tCompanyHub } = useTranslation("modules/company/companyChat");
  const currentUser = useSelector((state: RootState) => state.user.connectedUser.user);
  const role = currentUser?.role;
  const isEmployee = role === "Employee";
  const usesCandidateChat = role === "Company" || role === "Candidate";

  const candidateConversations = useSelector(selectCandidateConversations);
  const teamConversations = useSelector(selectTeamConversations);
  useTeamConversationsQuery(undefined, { enabled: isEmployee && !!currentUser?._id });
  useCandidateConversationsQuery(undefined, { enabled: usesCandidateChat && !!currentUser?._id });

  const conversations = isEmployee ? teamConversations : candidateConversations;
  const { activeModuleUnread } = useChatUnreadBadges();
  const teamChatBasePath = getTeamChatBasePath(role);
  const candidateChatBasePath = getCandidateChatBasePath(role);
  const headerTitle = isEmployee
    ? tTeam("header.team")
    : role === "Company"
      ? tCompanyHub("header.company")
      : tCandidate("header.candidate");
  const emptyLabel = isEmployee ? tTeam("header.empty_team") : tShared("header.empty");
  const openLabel = isEmployee ? tTeam("header.open_team") : tShared("header.open");

  const fmtTime = (iso?: string): string => {
    if (!iso) return "";
    const d    = new Date(iso);
    const now  = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
    const locale = i18n.language?.startsWith("fr") ? "fr-FR" : "en-US";
    if (diff === 0) return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
    if (diff === 1) return tShared("header.yesterday");
    if (diff < 7) return d.toLocaleDateString(locale, { weekday: "short" });
    return d.toLocaleDateString(locale, { month: "short", day: "numeric" });
  };

  const [open, setOpen] = useState(false);
  const totalBadge = activeModuleUnread;
  const close = () => setOpen(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative inline-flex items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <MessageCircle size={20} />
          {totalBadge > 0 && (
            <span className="absolute right-1.5 top-1.5 size-2.5 rounded-full bg-red-500 shadow-[0_0_0_2px_#fff]" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={4}
        className="w-[340px] overflow-hidden rounded-xl border border-gray-200 p-0 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-gray-900">{headerTitle}</span>
            {totalBadge > 0 && (
              <span
                className="flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: TEAL }}
              >
                {totalBadge > 9 ? "9+" : totalBadge}
              </span>
            )}
          </div>
        </div>

        <div className="max-h-[340px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-gray-200">
          {conversations.length === 0 ? (
            <div className="py-12 text-center">
              <MessageCircle size={40} color="#D1D5DB" className="mx-auto mb-2" />
              <p className="text-[13px] text-gray-400">{emptyLabel}</p>
            </div>
          ) : (
            conversations.slice(0, 8).map((conv, i) => {
              const uid = currentUser?._id != null ? String(currentUser._id) : "";
              const other = conv.participants?.find((p) => String(p._id) !== uid);
              const name = getParticipantDisplayName(other);
              const initial = name[0]?.toUpperCase() || "?";
              const lastMsg = conv.lastMessage;
              const unreadN = normalizeConversationUnreadCount(conv.unreadCount, uid || undefined);
              const teamLastPreviewDeleted =
                isEmployee
                && (!!lastMsg?.isDeletedForEveryone
                  || lastMsg?.text === TEAM_LAST_MESSAGE_DELETED_SENTINEL);
              const hasUnread = unreadN > 0;
              const conversationPath = isEmployee
                ? getTeamChatConversationPath(role, conv._id)
                : getCandidateChatConversationPath(role, conv._id);

              return (
                <React.Fragment key={conv._id}>
                  <div
                    onClick={() => { router.push(conversationPath); close(); }}
                    className="flex cursor-pointer gap-3 px-4 py-3 transition-colors duration-150 hover:bg-gray-50"
                    style={{ backgroundColor: hasUnread ? TEAL_BG : "transparent" }}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="size-[38px]" style={{ backgroundColor: TEAL }}>
                        <AvatarFallback className="bg-transparent text-sm text-white">{initial}</AvatarFallback>
                      </Avatar>
                      {unreadN > 0 && (
                        <span
                          className="absolute -bottom-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white ring-2 ring-white"
                          style={{ backgroundColor: TEAL }}
                        >
                          {unreadN}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-center justify-between">
                        <span
                          className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-gray-900"
                          style={{ fontWeight: hasUnread ? 700 : 600 }}
                        >
                          {name}
                        </span>
                        <span className="ml-2 shrink-0 text-[11px] text-gray-400">
                          {fmtTime(lastMsg?.timestamp)}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "overflow-hidden text-ellipsis whitespace-nowrap text-xs",
                          teamLastPreviewDeleted && "italic",
                        )}
                        style={{ color: hasUnread ? TEAL : "#6B7280", fontWeight: hasUnread ? 600 : 400 }}
                      >
                        {teamLastPreviewDeleted
                          ? tShared("messages.this_message_was_deleted")
                          : lastMsg?.text || tShared("header.no_messages_yet")}
                      </p>
                    </div>
                  </div>
                  {i < Math.min(conversations.length, 8) - 1 && <hr className="border-gray-100" />}
                </React.Fragment>
              );
            })
          )}
        </div>

        <div className="border-t border-gray-200 p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full rounded-lg font-semibold"
            onClick={() => {
              router.push(isEmployee ? teamChatBasePath : candidateChatBasePath);
              close();
            }}
            style={{ color: TEAL }}
          >
            {openLabel}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default HeaderChat;
