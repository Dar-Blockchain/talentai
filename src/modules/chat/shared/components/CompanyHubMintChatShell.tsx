import React from "react";
import ChatShell, { type ChatShellProps } from "./ChatShell";

/**
 * Company-side messages shell: same compact mint chrome as team chat.
 * Passes through all {@link ChatShellProps}; unset fields get hub defaults.
 */
const CompanyHubMintChatShell: React.FC<ChatShellProps> = (props) => (
  <ChatShell
    {...props}
    compactInFrame={props.compactInFrame ?? true}
    mintLightTeamUi={props.mintLightTeamUi ?? true}
    isCompany={props.isCompany ?? true}
    showConversationSidebar={props.showConversationSidebar ?? true}
    enableDeletes={props.enableDeletes ?? true}
    showDeleteConversation={props.showDeleteConversation ?? true}
    deleteConversationFromSidebar={props.deleteConversationFromSidebar ?? false}
  />
);

export default CompanyHubMintChatShell;
