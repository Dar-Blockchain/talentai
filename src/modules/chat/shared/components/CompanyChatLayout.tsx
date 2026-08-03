import React from "react";
import { cn } from "@/lib/utils";
import CompanyChatTopNav from "@/modules/chat/shared/components/CompanyChatTopNav";
import type { CompanyChatChannel } from "@/modules/chat/shared/constants/companyChannels";
import { companyChatCn } from "@/modules/chat/shared/styles/companyChat";

interface CompanyChatLayoutProps {
  activeChannel: CompanyChatChannel;
  children: React.ReactNode;
}

const CompanyChatLayout: React.FC<CompanyChatLayoutProps> = ({ activeChannel, children }) => (
  <div className={cn(companyChatCn.workspace, activeChannel === "team" && companyChatCn.workspaceTeamDense)}>
    <CompanyChatTopNav activeChannel={activeChannel} />
    <div className={companyChatCn.content}>{children}</div>
  </div>
);

export default CompanyChatLayout;
