"use client";
import React, { useState } from "react";
import { MessageCircle, ExternalLink, Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { selectCandidateConversations } from "@/modules/chat/candidate-chat/store/candidateChatSlice";
import { useCandidateConversationsQuery } from "@/modules/chat/candidate-chat/queries/useCandidateChatQueries";
import {
  getCandidateChatBasePath,
  getCandidateChatConversationPath,
} from "@/modules/chat/candidate-chat/utils/routes";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/modules/shared/ui/shadcn/popover";
import { Avatar, AvatarImage, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";
import { cn } from "@/lib/utils";

interface HeaderMessagesDropdownProps {
  userId:             string | undefined;
  unreadMessageCount: number;
}

const HeaderMessagesDropdown: React.FC<HeaderMessagesDropdownProps> = ({
  userId,
  unreadMessageCount,
}) => {
  const router = useRouter();
  const { t }       = useTranslation("modules/candidates/candidateChat");
  const { t: tShared } = useTranslation("shared/chat");
  const role          = useSelector((state: RootState) => state.user.connectedUser.user?.role);
  const conversations = useSelector(selectCandidateConversations);
  const conversationsQuery = useCandidateConversationsQuery({ limit: 5 }, { enabled: !!userId });
  const loadingConversations = conversationsQuery.isLoading;

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    conversationsQuery.refetch();
  };

  const getOtherParticipant = (conversation: any) => {
    if (!conversation?.participants || !userId) return null;
    return conversation.participants.find((p: any) => p._id !== userId);
  };

  const getDisplayName = (participant: any) => {
    if (!participant) return "Unknown User";
    if (participant.profile?.type === "Company" && participant.profile?.companyDetails?.name) {
      return participant.profile.companyDetails.name;
    }
    const firstName = participant.profile?.firstName || participant.firstName || "";
    const lastName  = participant.profile?.lastName  || participant.lastName  || "";
    if (firstName || lastName) return `${firstName} ${lastName}`.trim();
    if (participant.email) {
      const emailName = participant.email.split("@")[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return "Unknown User";
  };

  const getInitial = (participant: any) => {
    if (!participant) return "U";
    const firstName = participant.profile?.firstName || participant.firstName || "";
    if (firstName) return firstName.charAt(0).toUpperCase();
    if (participant.email) return participant.email.charAt(0).toUpperCase();
    return "U";
  };

  const formatMessageTime = (dateString: string) => {
    const date    = new Date(dateString);
    const now     = new Date();
    const diffMs  = now.getTime() - date.getTime();
    const diffMins  = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays  = Math.floor(diffMs / 86400000);
    if (diffMins  < 1)  return "Just now";
    if (diffMins  < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays  < 7)  return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          onClick={handleOpen}
          className={cn(
            "relative size-8 rounded-lg flex items-center justify-center cursor-pointer",
            "transition-all duration-150",
            open
              ? "bg-primary/12 text-primary"
              : "text-gray-500 hover:bg-primary/10 hover:text-primary",
          )}
        >
          <MessageCircle className="size-[17px]" />
          {unreadMessageCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-px rounded-full bg-red-500 border-[1.5px] border-white flex items-center justify-center text-[9px] font-bold text-white leading-none">
              {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] max-h-[480px] p-0 rounded-[14px] border border-[#EEF0F2] shadow-[0_10px_40px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#EEF0F2] flex-shrink-0">
          <span className="font-semibold text-[15px] text-[#111827]">Messages</span>
          {unreadMessageCount > 0 && (
            <span className="inline-flex items-center h-5 px-2.5 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-600 border border-violet-200">
              {unreadMessageCount} new
            </span>
          )}
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto min-h-0 max-h-[340px] custom-scrollbar">
          {loadingConversations ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-6 animate-spin text-violet-500" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <MessageCircle className="size-10 text-gray-200 mb-2" />
              <span className="text-[13.5px] text-gray-500">{t("dropdown.empty")}</span>
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherUser   = getOtherParticipant(conversation);
              const lastMessage = conversation.lastMessage;
              const isUnread    = conversation.unreadCount > 0;

              return (
                <button
                  key={conversation._id}
                  onClick={() => {
                    setOpen(false);
                    router.push(getCandidateChatConversationPath(role, conversation._id));
                  }}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3 text-left cursor-pointer transition-colors duration-100",
                    "border-b border-[#EEF0F2] last:border-b-0",
                    "border-l-[3px]",
                    isUnread
                      ? "bg-violet-50/40 border-l-violet-500 hover:bg-violet-50/70"
                      : "bg-transparent border-l-transparent hover:bg-gray-50",
                  )}
                >
                  <Avatar className="size-11 flex-shrink-0 rounded-full">
                    <AvatarImage src={otherUser?.profilePicture} className="rounded-full" />
                    <AvatarFallback className="rounded-full bg-violet-500 text-white text-[14px] font-semibold">
                      {getInitial(otherUser)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={cn(
                        "text-[13.5px] text-[#111827] truncate",
                        isUnread ? "font-semibold" : "font-medium",
                      )}>
                        {getDisplayName(otherUser)}
                      </span>
                      <span className={cn(
                        "text-[11px] flex-shrink-0 ml-2",
                        isUnread ? "text-violet-500 font-semibold" : "text-gray-400",
                      )}>
                        {lastMessage?.timestamp
                          ? formatMessageTime(lastMessage.timestamp)
                          : conversation.updatedAt
                          ? formatMessageTime(conversation.updatedAt)
                          : ""}
                      </span>
                    </div>
                    <span className={cn(
                      "text-[12.5px] truncate block",
                      isUnread ? "text-gray-700 font-medium" : "text-gray-500",
                    )}>
                      {lastMessage?.text || tShared("header.no_messages_yet")}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-3 py-2 border-t border-[#EEF0F2]">
          <button
            onClick={() => {
              setOpen(false);
              router.push(getCandidateChatBasePath(role));
            }}
            className="w-full flex items-center justify-center gap-1.5 text-[13px] font-semibold text-violet-600 rounded-[8px] py-1.5 hover:bg-violet-50 transition-colors"
          >
            {t("dropdown.view_all")}
            <ExternalLink className="size-[13px]" />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default HeaderMessagesDropdown;
