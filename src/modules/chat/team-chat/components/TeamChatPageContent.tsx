import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { Dialog, DialogContent } from "@/modules/shared/ui/shadcn/dialog";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/modules/shared/ui/shadcn/tooltip";
import { Users as GroupsRounded, MessageSquarePlus as AddCommentOutlined, X as CloseRounded } from "lucide-react";
import { RootState } from "@/store/store";
import CompanyHubChatFrame from "@/modules/chat/shared/components/CompanyHubChatFrame";
import CompanyHubMintChatShell from "@/modules/chat/shared/components/CompanyHubMintChatShell";
import { useTeamChatSession } from "@/modules/chat/team-chat/hooks/useTeamChatSession";
import TeamChatColleaguesPanel from "./TeamChatColleaguesPanel";
import { getTeamChatBasePath } from "@/modules/chat/team-chat/utils/routes";

// Static icon node — defined outside the component so it's never recreated.
const titleIcon = (
  <div
    aria-hidden
    className="flex h-9 w-9 items-center justify-center rounded-xl text-[#10B981] bg-[#ECFDF5] border border-[rgba(52,211,153,0.25)] shadow-[0_4px_20px_rgba(15,23,42,0.05)]"
  >
    <GroupsRounded size={20} />
  </div>
);

interface TeamChatPageContentProps {
  initialConversationId: string | null;
  fillHeight?: boolean;
  embeddedInCompanyHub?: boolean;
  onConversationChange?: (id: string) => void;
}

const TeamChatPageContent = memo(function TeamChatPageContent({
  initialConversationId,
  fillHeight = false,
  embeddedInCompanyHub = false,
  onConversationChange,
}: TeamChatPageContentProps) {
  const { t } = useTranslation("modules/company/teamChat");
  const router = useRouter();
  const role = useSelector((state: RootState) => state.user.connectedUser.user?.role);
  const teamChatBasePath = getTeamChatBasePath(role);
  const [colleaguesOpen, setColleaguesOpen] = useState(false);

  useEffect(() => {
    if (router.query.tab === "colleagues") setColleaguesOpen(true);
  }, [router.query.tab]);

  const handleConversationChange = useCallback(
    (id: string) => {
      onConversationChange?.(id);
      void router.replace(`${teamChatBasePath}/${id}`, undefined, { scroll: false });
    },
    [onConversationChange, teamChatBasePath, router],
  );

  const session = useTeamChatSession({
    initialConversationId,
    deleteRedirectRoute: teamChatBasePath,
    onConversationChange: handleConversationChange,
  });

  const newChatButton = useMemo(
    () => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setColleaguesOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#10B981] text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-px hover:bg-[#059669] hover:shadow-[0_4px_14px_rgba(16,185,129,0.45)]"
            >
              <AddCommentOutlined size={18} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{t("tabs.colleagues")}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
    [t],
  );

  return (
    <>
      <CompanyHubChatFrame
        title={t("title")}
        subtitle={role === "Employee" ? undefined : t("subtitle")}
        titleStartAdornment={titleIcon}
        fillHeight={fillHeight}
        embeddedInCompanyHub={embeddedInCompanyHub}
      >
        <CompanyHubMintChatShell
          isCompany
          conversations={session.conversations}
          conversation={session.conversation}
          messages={session.messages}
          activeConversationId={session.activeConversationId}
          currentUserId={session.currentUserId}
          otherUser={session.otherUser}
          loading={session.loading}
          sending={session.sending}
          teamScopedMessageDeletes
          deleteConversationTitle={t("delete_chat_title")}
          deleteConversationDescription={t("delete_chat_for_me_body")}
          onSend={session.handleSendMessage}
          onDeleteMessage={session.handleDeleteMessage}
          onDeleteConversation={session.executeDeleteConversation}
          onSelectConversation={session.handleSelectConversation}
          sidebarFooter={newChatButton}
        />
      </CompanyHubChatFrame>

      <Dialog open={colleaguesOpen} onOpenChange={(next) => { if (!next) setColleaguesOpen(false); }}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-sm p-0 gap-0 flex flex-col h-[72vh] overflow-hidden rounded-[20px] border border-[#E5E7EB] shadow-[0_24px_48px_rgba(15,23,42,0.14)]"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-white px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-[30px] w-[30px] items-center justify-center rounded-[10px] border border-[rgba(52,211,153,0.25)] bg-[#ECFDF5]">
                <GroupsRounded size={16} color="#10B981" />
              </div>
              <span className="text-[0.9375rem] font-bold tracking-[-0.02em] text-[#111827]">
                {t("tabs.colleagues")}
              </span>
            </div>
            <button
              onClick={() => setColleaguesOpen(false)}
              className="rounded-[10px] p-1.5 text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]"
            >
              <CloseRounded size={20} />
            </button>
          </div>
          <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
            <TeamChatColleaguesPanel onClose={() => { setColleaguesOpen(false); }} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

export default TeamChatPageContent;
