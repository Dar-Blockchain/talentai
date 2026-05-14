import React from "react";
import ChatModulePageFrame from "@/modules/shared/chat/components/ChatModulePageFrame";

export interface CompanyHubChatFrameProps {
  title: string;
  subtitle?: string;
  titleStartAdornment?: React.ReactNode;
  bodyTopBar?: React.ReactNode;
  fillHeight: boolean;
  embeddedInCompanyHub: boolean;
  children: React.ReactNode;
}

/**
 * Shared layout for company messages (team + candidates) inside the dashboard / hub:
 * dense frame, fill-height expansion, optional top bar (e.g. team tabs).
 */
const CompanyHubChatFrame: React.FC<CompanyHubChatFrameProps> = ({
  title,
  subtitle,
  titleStartAdornment,
  bodyTopBar,
  fillHeight,
  embeddedInCompanyHub,
  children,
}) => (
  <ChatModulePageFrame
    title={title}
    subtitle={subtitle}
    titleStartAdornment={embeddedInCompanyHub ? undefined : titleStartAdornment}
    fillHeight={fillHeight}
    expandToParentHeight={fillHeight}
    embeddedInCompanyHub={embeddedInCompanyHub}
    dense
    bodyTopBar={bodyTopBar}
  >
    {children}
  </ChatModulePageFrame>
);

export default CompanyHubChatFrame;
