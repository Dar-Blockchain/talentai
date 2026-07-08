import React from "react";
import { cn } from "@/lib/utils";
import { chatModulePageCn } from "@/modules/chat/shared/styles/modulePage";
import { companyChatCn } from "@/modules/chat/shared/styles/companyChat";

interface ChatModulePageFrameProps {
  title: string;
  /** Omitted or empty = no subtitle row (chat-focused layouts). */
  subtitle?: string;
  /** Shown before the title (e.g. icon tile). */
  titleStartAdornment?: React.ReactNode;
  headerAside?: React.ReactNode;
  /** Full-width row inside body card, above children (e.g. Messages / Colleagues). */
  bodyTopBar?: React.ReactNode;
  fillHeight?: boolean;
  /** With `fillHeight`, fill dashboard flex column instead of vh-based `rootFillViewport`. */
  expandToParentHeight?: boolean;
  embeddedInCompanyHub?: boolean;
  /** Tighter padding / gap so borders sit closer to chat content. */
  dense?: boolean;
  children: React.ReactNode;
}

const ChatModulePageFrame: React.FC<ChatModulePageFrameProps> = ({
  title,
  subtitle,
  titleStartAdornment,
  headerAside,
  bodyTopBar,
  fillHeight = false,
  expandToParentHeight = false,
  embeddedInCompanyHub = false,
  dense = false,
  children,
}) => {
  const bodyPaperClass = cn(
    chatModulePageCn.bodyPaper,
    dense && "px-[3px] sm:px-1 pt-[3px] sm:pt-1 pb-0.5 sm:pb-[3px]",
  );

  if (embeddedInCompanyHub) {
    const embeddedRootClass = fillHeight
      ? cn("flex flex-col gap-0", chatModulePageCn.rootFill)
      : "flex flex-col gap-0";

    const toolbarClass = dense
      ? cn(companyChatCn.toolbar, "px-3 py-1.5 gap-2")
      : companyChatCn.toolbar;

    const bodyTopBarClass = dense
      ? "shrink-0 -mx-[3px] sm:-mx-1 -mt-[3px] sm:-mt-1 px-[3px] sm:px-1 pt-0.5 sm:pt-[3px] pb-[3px] sm:pb-1 border-b border-[#F3F4F6] bg-[#FCFCFD]"
      : "shrink-0 px-4 py-2.5 border-b border-[#F3F4F6] bg-[#FCFCFD]";

    return (
      <div className={embeddedRootClass}>
        <div className={bodyPaperClass}>
          {headerAside && (
            <div className={toolbarClass}>
              {headerAside}
            </div>
          )}
          {bodyTopBar ? <div className={bodyTopBarClass}>{bodyTopBar}</div> : null}
          <div className="flex flex-1 min-h-0 flex-col">
            {children}
          </div>
        </div>
      </div>
    );
  }

  const gapClass = dense ? "gap-2" : "gap-4";
  const standaloneRootClass =
    fillHeight && expandToParentHeight
      ? cn("flex flex-col", gapClass, chatModulePageCn.rootFill)
      : fillHeight
        ? cn("flex flex-col", gapClass, chatModulePageCn.rootFillViewport)
        : cn("flex flex-col", gapClass, chatModulePageCn.defaultHeight);

  const headerPaperClass = cn(
    chatModulePageCn.headerPaper,
    dense && "px-3 py-2.5",
    headerAside && cn("flex items-center justify-between flex-wrap", dense ? "gap-2.5" : "gap-4"),
  );

  const hasSubtitle = Boolean(subtitle?.trim());
  const titleClass = cn(chatModulePageCn.title, dense && chatModulePageCn.titleDense);

  const titleBlock = titleStartAdornment ? (
    <div className={cn("flex min-w-0 gap-3", dense && "gap-2.5", hasSubtitle ? "items-start" : "items-center")}>
      <div className={cn("flex shrink-0 items-center justify-center", hasSubtitle && "mt-0.5")}>
        {titleStartAdornment}
      </div>
      <div className="min-w-0">
        <h1 className={titleClass}>{title}</h1>
        {hasSubtitle ? <p className={chatModulePageCn.subtitle}>{subtitle}</p> : null}
      </div>
    </div>
  ) : (
    <div>
      <h1 className={titleClass}>{title}</h1>
      {hasSubtitle ? <p className={chatModulePageCn.subtitle}>{subtitle}</p> : null}
    </div>
  );

  const standaloneBodyTopBarClass = dense
    ? "shrink-0 -mx-[3px] sm:-mx-1 -mt-[3px] sm:-mt-1 px-[3px] sm:px-1 pt-0.5 sm:pt-[3px] pb-[3px] sm:pb-1 border-b border-[#F3F4F6] bg-[#FCFCFD]"
    : "shrink-0 px-5 py-3 border-b border-[#F3F4F6] bg-[#FCFCFD]";

  return (
    <div className={standaloneRootClass}>
      <div className={headerPaperClass}>
        {titleBlock}
        {headerAside}
      </div>

      <div className={cn(bodyPaperClass, "flex flex-col")}>
        {bodyTopBar ? <div className={standaloneBodyTopBarClass}>{bodyTopBar}</div> : null}
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ChatModulePageFrame;
