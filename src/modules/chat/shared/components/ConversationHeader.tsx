import React, { memo } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/modules/shared/ui/shadcn/avatar";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/modules/shared/ui/shadcn/tooltip";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/modules/shared/ui/shadcn/dropdown-menu";
import { Trash2 as DeleteOutlined, MoreVertical as MoreVert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Participant, getParticipantDisplayName, getParticipantInitial, chatContextMenuContentCn, chatContextMenuItemCn } from "./helpers";

const ease = "cubic-bezier(0.4, 0, 0.2, 1)";
const PRIMARY = "#0D9488";

interface ConversationHeaderProps {
  otherUser: Participant | undefined;
  isCompany: boolean;
  onDeleteConversation: () => void;
  enableDeletes?: boolean;
  /** When true, show delete-chat with enableDeletes (Company + Employee team chat). */
  showDeleteConversation?: boolean;
  /** Shorter header row (team chat in module frame). */
  compact?: boolean;
  /** Team chat mint: light SaaS header chrome. */
  mintLightTeamUi?: boolean;
}

const ConversationHeader = memo(function ConversationHeader({
  otherUser,
  isCompany,
  onDeleteConversation,
  enableDeletes = true,
  showDeleteConversation,
  compact = false,
  mintLightTeamUi = false,
}: ConversationHeaderProps) {
  const { t } = useTranslation("shared/chat");
  const showMenu =
    enableDeletes && (showDeleteConversation !== undefined ? showDeleteConversation : isCompany);
  const primary = mintLightTeamUi ? "#34D399" : PRIMARY;
  const handleDelete = () => onDeleteConversation();

  const h = compact
    ? {
        pyClass: "py-2 sm:py-2.5",
        pxClass: "px-2.5 sm:px-3.5",
        gapClass: "gap-2.5",
        avatarClass: "size-9",
        titleClass: "text-[0.8125rem] leading-[1.28]",
        dividerClass: "my-0.5",
        trashIcon: 20,
      }
    : {
        pyClass: "py-3.5",
        pxClass: "px-3 sm:px-5",
        gapClass: "gap-3",
        avatarClass: "size-11",
        titleClass: "text-[0.9375rem] leading-[1.35]",
        dividerClass: "my-1",
        trashIcon: 22,
      };

  return (
    <header
      className={cn(h.pxClass, h.pyClass, "border-b")}
      style={{
        borderColor: mintLightTeamUi ? "#E5E7EB" : "#E5E7EB",
        backgroundColor: mintLightTeamUi ? "#FFFFFF" : "#fff",
      }}
    >
      <div className={cn("flex flex-row items-center", h.gapClass)}>
        <Avatar
          className={cn(h.avatarClass, "font-bold text-white transition-transform hover:scale-105")}
          style={{
            backgroundColor: mintLightTeamUi ? undefined : primary,
            backgroundImage: mintLightTeamUi ? "linear-gradient(135deg, #34D399 0%, #10B981 100%)" : undefined,
            boxShadow: mintLightTeamUi ? "0 4px 14px rgba(52, 211, 153, 0.35)" : `0 2px 8px ${primary}59`,
            transition: `transform 0.24s ${ease}, box-shadow 0.24s ${ease}`,
          }}
        >
          <AvatarFallback className="bg-transparent font-bold text-white">
            {getParticipantInitial(otherUser)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p
            className={cn(h.titleClass, "truncate font-bold")}
            style={{ color: mintLightTeamUi ? "#111827" : "#111827" }}
          >
            {getParticipantDisplayName(otherUser)}
          </p>
        </div>

        {showMenu && (
          <>
            <div className={cn("w-px self-stretch", h.dividerClass)} style={{ backgroundColor: mintLightTeamUi ? "#E5E7EB" : "#E5E7EBCC" }} />
            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <button
                        aria-label={t("header.actions", { defaultValue: "More actions" })}
                        className="rounded-lg p-1.5 transition-transform hover:scale-[1.08]"
                        style={{ color: mintLightTeamUi ? "#6B7280" : "#6B7280" }}
                      >
                        <MoreVert size={h.trashIcon} />
                      </button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>{t("header.actions", { defaultValue: "More actions" })}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent align="end" className={chatContextMenuContentCn}>
                <DropdownMenuItem onClick={handleDelete} variant="destructive" className={cn(chatContextMenuItemCn, "font-semibold gap-2")}>
                  <DeleteOutlined size={18} />
                  {t("delete_dialog.title")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </header>
  );
});

export default ConversationHeader;
