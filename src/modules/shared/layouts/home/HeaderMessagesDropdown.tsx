"use client";
import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, Loader2, ExternalLink } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";
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

interface HeaderMessagesDropdownProps {
  userId:             string | undefined;
  unreadMessageCount: number;
}

const HeaderMessagesDropdown: React.FC<HeaderMessagesDropdownProps> = ({
  userId,
  unreadMessageCount,
}) => {
  const router   = useRouter();
  const { t }          = useTranslation("modules/candidates/candidateChat");
  const { t: tShared } = useTranslation("shared/chat");
  const role         = useSelector((s: RootState) => s.user.connectedUser.user?.role);
  const conversations  = useSelector(selectCandidateConversations);
  const conversationsQuery = useCandidateConversationsQuery({ limit: 5 }, { enabled: !!userId });
  const loadingConversations = conversationsQuery.isLoading;

  const [open, setOpen]   = useState(false);
  const containerRef      = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = () => {
    setOpen((p) => !p);
    conversationsQuery.refetch();
  };

  const getOtherParticipant = (conv: any) => {
    if (!conv?.participants || !userId) return null;
    return conv.participants.find((p: any) => p._id !== userId);
  };

  const getDisplayName = (participant: any) => {
    if (!participant) return "Unknown User";
    if (participant.profile?.type === "Company" && participant.profile?.companyDetails?.name)
      return participant.profile.companyDetails.name;
    const firstName = participant.profile?.firstName || participant.firstName || "";
    const lastName  = participant.profile?.lastName  || participant.lastName  || "";
    if (firstName || lastName) return `${firstName} ${lastName}`.trim();
    if (participant.email) {
      const n = participant.email.split("@")[0];
      return n.charAt(0).toUpperCase() + n.slice(1);
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

  const formatTime = (d: string) => {
    const date  = new Date(d);
    const now   = new Date();
    const ms    = now.getTime() - date.getTime();
    const mins  = Math.floor(ms / 60000);
    const hours = Math.floor(ms / 3600000);
    const days  = Math.floor(ms / 86400000);
    if (mins  < 1)  return "Just now";
    if (mins  < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days  < 7)  return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center size-8 rounded-[9px] cursor-pointer transition-colors hover:bg-teal-600/10 hover:shadow-[0_0_0_3px_rgba(13,148,136,0.08)]"
      >
        <MessageCircle className="size-[18px] text-gray-700" />
        {unreadMessageCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-px leading-none"
            style={{ boxShadow: "0 0 0 1.5px #fff" }}
          >
            {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-[360px] max-h-[480px] rounded-[12px] border overflow-hidden z-50 flex flex-col"
          style={{
            borderColor: "rgba(238,240,242,1)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
            background: "#fff",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(238,240,242,1)" }}>
            <span className="font-semibold text-[16px] text-gray-900">Messages</span>
            {unreadMessageCount > 0 && (
              <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "rgba(131,16,255,0.1)", color: "#8310FF" }}>
                {unreadMessageCount} new
              </span>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: 340 }}>
            {loadingConversations ? (
              <div className="flex justify-center py-8">
                <Loader2 className="size-6 animate-spin" style={{ color: "#8310FF" }} />
              </div>
            ) : conversations.length === 0 ? (
              <div className="py-8 text-center">
                <MessageCircle className="size-10 mx-auto mb-2 text-gray-300" />
                <p className="text-[14px] text-gray-500">{t("dropdown.empty")}</p>
              </div>
            ) : conversations.map((conv) => {
              const other    = getOtherParticipant(conv);
              const isUnread = (conv as any).unreadCount > 0;
              return (
                <button
                  key={(conv as any)._id}
                  onClick={() => { setOpen(false); router.push(getCandidateChatConversationPath(role, (conv as any)._id)); }}
                  className="w-full flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors text-left not-last:border-b"
                  style={{
                    background:   isUnread ? "rgba(131,16,255,0.04)" : "transparent",
                    borderLeft:   `3px solid ${isUnread ? "#8310FF" : "transparent"}`,
                    borderBottomColor: "rgba(238,240,242,1)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = isUnread ? "rgba(131,16,255,0.04)" : "transparent")}
                >
                  <Avatar className="size-11 rounded-full shrink-0">
                    <AvatarImage src={(other as any)?.profilePicture} />
                    <AvatarFallback className="text-[16px] font-semibold text-white" style={{ background: "#8310FF" }}>
                      {getInitial(other)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className={`text-[14px] truncate text-gray-900 ${isUnread ? "font-semibold" : "font-medium"}`}>
                        {getDisplayName(other)}
                      </span>
                      <span className="text-[11px] shrink-0 ml-2" style={{ color: isUnread ? "#8310FF" : "#9ca3af", fontWeight: isUnread ? 600 : 400 }}>
                        {(conv as any).lastMessage?.timestamp ? formatTime((conv as any).lastMessage.timestamp) : (conv as any).updatedAt ? formatTime((conv as any).updatedAt) : ""}
                      </span>
                    </div>
                    <p className={`text-[13px] truncate ${isUnread ? "text-gray-700 font-medium" : "text-gray-500"}`}>
                      {(conv as any).lastMessage?.text || tShared("header.no_messages_yet")}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <hr className="border-t border-gray-100" />
          <div className="p-3">
            <button
              onClick={() => { setOpen(false); router.push(getCandidateChatBasePath(role)); }}
              className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-[8px] text-[14px] font-semibold transition-colors cursor-pointer hover:bg-purple-50"
              style={{ color: "#8310FF" }}
            >
              {t("dropdown.view_all")}
              <ExternalLink className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderMessagesDropdown;
