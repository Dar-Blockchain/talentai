import React, { createContext, useContext, useState, useCallback, useMemo, memo, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";
import { MessageCircle as ChatOutlined, ArrowLeft as ArrowBackOutlined, Briefcase as WorkOutlined } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Participant } from "./helpers";
import ConversationSidebar      from "./ConversationSidebar";
import ConversationHeader       from "./ConversationHeader";
import MessageList              from "./MessageList";
import MessageInput             from "./MessageInput";
import DeleteConversationDialog from "./DeleteConversationDialog";

// ── Constants (accent; primary palette still drives most surfaces) ──
const ACCENT = "#0D9488";

// ── Types ─────────────────────────────────────────────────
export interface ReturnToPost {
  postId:   string;
  jobTitle: string;
  onReturn: () => void;
}

export interface ChatShellProps {
  // session data (from useChatSession)
  conversations:        any[];
  conversation:         any;
  messages:             any[];
  activeConversationId: string | null;
  currentUserId:        string | undefined;
  otherUser:            Participant | undefined;
  loading:              boolean;
  sending:              boolean;
  isCompany:            boolean;
  showConversationSidebar?: boolean;
  /** Tighter gap / sidebar chrome (e.g. team module framed layout). */
  compactInFrame?: boolean;
  enableDeletes?:       boolean;
  /** Team chat: per-message delete for me / for everyone */
  teamScopedMessageDeletes?: boolean;
  /** Team chat: show header trash for Company + Employee */
  showDeleteConversation?: boolean;
  /** Optional copy for delete-conversation dialog body */
  deleteConversationDescription?: string;
  deleteConversationTitle?: string;
  /** Team chat: light mint / SaaS-style surfaces (does not affect candidate DMs). */
  mintLightTeamUi?: boolean;
  /** Node rendered at the bottom of the conversations sidebar (e.g. Colleagues button). */
  sidebarFooter?: React.ReactNode;
  /** When set, replaces the right-side chat panel content (e.g. Colleagues panel). */
  overridePanel?: React.ReactNode;
  // handlers
  onSend:               (text: string) => Promise<void>;
  onDeleteMessage:      (id: string, scope?: "me" | "everyone") => void;
  onDeleteConversation: (targetId: string) => Promise<void>;
  onSelectConversation: (id: string) => void;
  /** Team chat: delete from sidebar row menu instead of header trash. */
  deleteConversationFromSidebar?: boolean;
  // optional
  returnTo?: ReturnToPost;
}

// ── Internal context (avoids deep prop-drilling) ──────────
// Mobile vs. desktop layout is resolved purely via Tailwind breakpoints below
// (`md:flex` always overrides the mobile-only `hidden`/`flex` toggle), so the
// context only needs to track which pane is active on narrow screens.
interface Ctx {
  showChat:  boolean;
  setShowChat: (v: boolean) => void;
}
const ShellCtx = createContext<Ctx>({ showChat: true, setShowChat: () => {} });
const useShell = () => useContext(ShellCtx);

// ── Root ──────────────────────────────────────────────────
const ChatShell: React.FC<ChatShellProps> = (p) => {
  const [showChat, setShowChat] = useState(!!p.activeConversationId);
  const enableDeletes = p.enableDeletes ?? true;
  const showConversationSidebar = p.showConversationSidebar ?? p.isCompany;
  const compactInFrame = p.compactInFrame ?? false;
  const mintLightTeamUi = p.mintLightTeamUi ?? false;
  const sidebarDeleteMenu = Boolean(p.deleteConversationFromSidebar);
  const headerShowDeleteConversation = sidebarDeleteMenu ? false : p.showDeleteConversation;

  const deleteTargetRef = useRef<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSelect = useCallback((id: string) => {
    p.onSelectConversation(id);
    setShowChat(true);
  }, [p.onSelectConversation]);

  const requestDeleteConversation = useCallback((conversationId: string) => {
    deleteTargetRef.current = conversationId;
    setDeleteDialogOpen(true);
  }, []);

  const handleOpenDeleteDialog = useCallback(() => {
    if (p.activeConversationId) requestDeleteConversation(p.activeConversationId);
  }, [p.activeConversationId, requestDeleteConversation]);

  const handleCloseDeleteDialog = useCallback(() => {
    if (isDeleting) return;
    deleteTargetRef.current = null;
    setDeleteDialogOpen(false);
  }, [isDeleting]);

  const handleConfirmDelete = useCallback(async () => {
    const targetId = deleteTargetRef.current;
    if (!targetId) return;
    setIsDeleting(true);
    try {
      await p.onDeleteConversation(targetId);
      setDeleteDialogOpen(false);
      deleteTargetRef.current = null;
    } finally {
      setIsDeleting(false);
    }
  }, [p.onDeleteConversation]);

  const ctxValue = useMemo(
    () => ({ showChat, setShowChat }),
    [showChat],
  );

  return (
    <ShellCtx.Provider value={ctxValue}>
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">

        {p.returnTo && <ReturnBanner {...p.returnTo} />}

        <div
          className={cn(
            "flex min-h-0 flex-1 items-stretch overflow-hidden",
            compactInFrame ? (mintLightTeamUi ? "gap-3.5" : "gap-2") : "gap-4",
            mintLightTeamUi && "rounded-[20px] bg-[#F8FAFC] p-2 sm:p-2.5",
          )}
        >
          {showConversationSidebar && (
            <Sidebar
              conversations={p.conversations}
              activeConversationId={p.activeConversationId}
              currentUserId={p.currentUserId}
              onSelect={handleSelect}
              compact={compactInFrame}
              conversationMenuDelete={sidebarDeleteMenu}
              onRequestDeleteConversation={sidebarDeleteMenu ? requestDeleteConversation : undefined}
              mintLightTeamUi={mintLightTeamUi}
              viewerIsCompany={p.isCompany}
              footer={p.sidebarFooter}
            />
          )}
          <Panel
            hasConversations={p.conversations.length > 0}
            conversation={p.conversation}
            messages={p.messages}
            currentUserId={p.currentUserId}
            otherUser={p.otherUser}
            loading={p.loading}
            sending={p.sending}
            isCompany={p.isCompany}
            onSend={p.onSend}
            onDeleteMessage={p.onDeleteMessage}
            onDeleteConversation={handleOpenDeleteDialog}
            enableDeletes={enableDeletes}
            teamScopedMessageDeletes={p.teamScopedMessageDeletes}
            showDeleteConversation={headerShowDeleteConversation}
            compactFooter={compactInFrame}
            mintLightTeamUi={mintLightTeamUi}
            overrideContent={p.overridePanel}
          />
        </div>

        {enableDeletes && (
          <DeleteConversationDialog
            open={deleteDialogOpen}
            onClose={handleCloseDeleteDialog}
            onConfirm={handleConfirmDelete}
            isDeleting={isDeleting}
            description={p.deleteConversationDescription}
            title={p.deleteConversationTitle}
          />
        )}
      </div>
    </ShellCtx.Provider>
  );
};

// ── Return-to-post banner ─────────────────────────────────
const ReturnBanner = memo(function ReturnBanner({ jobTitle, onReturn }: ReturnToPost) {
  const { t } = useTranslation("shared/chat");
  return (
    <div
      className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border px-4 py-2.5"
      style={{ borderColor: "#0D948840", backgroundColor: "#0D94880F" }}
    >
      <div className="flex flex-row items-center gap-2">
        <WorkOutlined size={18} color={ACCENT} />
        <p className="text-[0.8125rem] font-semibold text-[#111827]">
          {t("banner.chatting_about")}{" "}
          <span className="font-bold" style={{ color: ACCENT }}>
            {jobTitle || t("banner.job_post")}
          </span>
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={onReturn}
        className="rounded-lg text-xs font-semibold"
        style={{ borderColor: "#0D948873", color: ACCENT }}
      >
        <ArrowBackOutlined size={16} />
        {t("banner.return_to_post")}
      </Button>
    </div>
  );
});

// ── Sidebar ───────────────────────────────────────────────
interface SidebarProps {
  conversations: any[];
  activeConversationId: string | null;
  currentUserId: string | undefined;
  onSelect: (id: string) => void;
  compact?: boolean;
  conversationMenuDelete?: boolean;
  onRequestDeleteConversation?: (conversationId: string) => void;
  mintLightTeamUi?: boolean;
  viewerIsCompany: boolean;
  footer?: React.ReactNode;
}

const Sidebar = memo(function Sidebar({
  conversations,
  activeConversationId,
  currentUserId,
  onSelect,
  compact = false,
  conversationMenuDelete = false,
  onRequestDeleteConversation,
  mintLightTeamUi = false,
  viewerIsCompany,
  footer,
}: SidebarProps) {
  const { showChat } = useShell();
  const { t } = useTranslation("shared/chat");
  return (
    <aside
      id="chat-conversations-sidebar"
      className={cn(
        "w-full shrink-0 flex-col self-stretch overflow-hidden border border-[#E5E7EB] bg-white md:flex md:w-[300px]",
        mintLightTeamUi ? "rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.05)]" : "rounded-lg",
        showChat ? "hidden" : "flex",
      )}
    >
      <div
        id="chat-sidebar-header"
        className={cn(
          "flex items-center justify-between gap-2 border-b border-[#E5E7EB]",
          compact ? "px-3 py-2.5" : "px-4 py-3.5",
          mintLightTeamUi ? "bg-white" : "bg-[#0D94880A]",
        )}
      >
        <p
          id="chat-sidebar-title"
          className={cn(
            "font-extrabold leading-[1.2] tracking-[-0.03em] text-[#111827]",
            compact ? "text-[0.8125rem]" : "text-sm",
          )}
        >
          {t("sidebar.title", { defaultValue: "Conversations" })}
        </p>
        {conversations.length > 0 && (
          <span
            className="inline-flex h-[22px] min-w-[28px] items-center justify-center rounded-full px-2 text-[0.6875rem] font-bold leading-none tracking-[0.01em]"
            style={{
              backgroundColor: mintLightTeamUi ? "#ECFDF5" : "#0D94881A",
              color: mintLightTeamUi ? "#059669" : ACCENT,
              border: mintLightTeamUi ? "1px solid rgba(52,211,153,0.3)" : "1px solid #0D948833",
            }}
          >
            {conversations.length}
          </span>
        )}
      </div>
      <ConversationSidebar
        conversations={conversations}
        currentConversationId={activeConversationId ?? ""}
        currentUserId={currentUserId}
        onSelectConversation={onSelect}
        conversationMenuDelete={conversationMenuDelete}
        onRequestDeleteConversation={onRequestDeleteConversation}
        compact={compact}
        mintLightTeamUi={mintLightTeamUi}
        viewerIsCompany={viewerIsCompany}
      />
      {footer && (
        <div
          className={cn(
            "flex shrink-0 justify-end border-t border-[#E5E7EB]",
            compact ? "px-2.5 py-2" : "px-3 py-2.5",
            mintLightTeamUi && "bg-white",
          )}
        >
          {footer}
        </div>
      )}
    </aside>
  );
});

// ── Chat panel ────────────────────────────────────────────
interface PanelProps {
  hasConversations: boolean;
  conversation:   any;
  messages:       any[];
  currentUserId:  string | undefined;
  otherUser:      Participant | undefined;
  loading:        boolean;
  sending:        boolean;
  isCompany:      boolean;
  onSend:         (text: string) => Promise<void>;
  onDeleteMessage:(id: string, scope?: "me" | "everyone") => void;
  onDeleteConversation: () => void;
  enableDeletes: boolean;
  teamScopedMessageDeletes?: boolean;
  showDeleteConversation?: boolean;
  compactFooter?: boolean;
  mintLightTeamUi?: boolean;
  overrideContent?: React.ReactNode;
}

const Panel = memo(function Panel(p: PanelProps) {
  const { showChat, setShowChat } = useShell();
  const handleBack = useCallback(() => setShowChat(false), [setShowChat]);
  return (
    <div
      id="chat-message-panel"
      className={cn(
        "min-h-0 min-w-0 flex-1 flex-col self-stretch overflow-hidden border border-[#E5E7EB] bg-white md:flex",
        p.mintLightTeamUi ? "rounded-[20px] shadow-[0_4px_20px_rgba(15,23,42,0.05)]" : "rounded-lg",
        showChat ? "flex" : "hidden",
      )}
    >
      {p.overrideContent ? (
        <div className="min-h-0 flex-1 overflow-auto">{p.overrideContent}</div>
      ) : p.loading ? (
        <div className="flex min-h-[200px] flex-1 items-center justify-center">
          <Spinner className="size-9" style={{ color: ACCENT }} />
        </div>
      ) : !p.conversation ? (
        <EmptyPanel hasConversations={p.hasConversations} isCompany={p.isCompany} mintLightTeamUi={p.mintLightTeamUi} />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Back"
            className="m-1 self-start rounded-lg p-1 text-[#6B7280] transition-colors hover:bg-[#F3F4F6] md:hidden"
          >
            <ArrowBackOutlined size={20} />
          </button>
          <ConversationHeader
            otherUser={p.otherUser}
            isCompany={p.isCompany}
            onDeleteConversation={p.onDeleteConversation}
            enableDeletes={p.enableDeletes}
            showDeleteConversation={p.showDeleteConversation}
            compact={p.compactFooter}
            mintLightTeamUi={p.mintLightTeamUi}
          />
          <div className="flex min-h-0 flex-1 flex-col">
            <MessageList
              messages={p.messages}
              threadLastMessage={p.conversation?.lastMessage}
              currentUserId={p.currentUserId}
              otherUser={p.otherUser}
              isCompany={p.isCompany}
              onDeleteMessage={p.onDeleteMessage}
              enableDeletes={p.enableDeletes}
              teamScopedDeletes={p.teamScopedMessageDeletes}
              mintLightTeamUi={p.mintLightTeamUi}
            />
          </div>
          {/* key resets the internal input state when switching conversations */}
          <MessageInput
            key={p.conversation._id}
            onSend={p.onSend}
            sending={p.sending}
            compact={p.compactFooter}
            mintLightTeamUi={p.mintLightTeamUi}
          />
        </div>
      )}
    </div>
  );
});

// ── Empty state ───────────────────────────────────────────
const EmptyPanel = memo(function EmptyPanel({
  hasConversations,
  isCompany,
  mintLightTeamUi = false,
}: { hasConversations: boolean; isCompany: boolean; mintLightTeamUi?: boolean }) {
  const { setShowChat } = useShell();
  const handleBack = useCallback(() => setShowChat(false), [setShowChat]);
  const { t } = useTranslation("shared/chat");
  const { t: tCandidate } = useTranslation("modules/candidates/candidateChat");
  const { t: tCompanyHub } = useTranslation("modules/company/companyChat");
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center",
        mintLightTeamUi && "bg-[#F8FAFC]",
      )}
    >
      <div
        className={cn(
          "flex h-[68px] w-[68px] items-center justify-center",
          mintLightTeamUi ? "rounded-[18px]" : "rounded-full",
        )}
        style={{
          backgroundColor: mintLightTeamUi ? "#ECFDF5" : "#0D94881A",
          border: mintLightTeamUi ? "1px solid rgba(52, 211, 153, 0.22)" : "1px solid #0D948833",
          boxShadow: mintLightTeamUi ? "0 4px 20px rgba(15, 23, 42, 0.05)" : undefined,
        }}
      >
        <ChatOutlined size={34} color={mintLightTeamUi ? "#10B981" : ACCENT} />
      </div>
      <p className="text-[0.9375rem] font-bold text-[#111827]">
        {hasConversations ? t("panel.select_conversation") : t("panel.no_conversations")}
      </p>
      <p className="max-w-[300px] text-[0.8125rem] text-[#6B7280]">
        {hasConversations
          ? t("panel.choose_from_sidebar")
          : (isCompany ? tCompanyHub("panel.contact_candidate") : tCandidate("panel.contact_recruiter"))}
      </p>
      <Button variant="ghost" onClick={handleBack} className="font-semibold md:hidden">
        <ArrowBackOutlined />
        {t("panel.back_to_conversations")}
      </Button>
    </div>
  );
});

export default ChatShell;
