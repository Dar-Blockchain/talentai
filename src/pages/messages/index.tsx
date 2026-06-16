import React from "react";
import MessagesShell from "@/modules/chat/shared/components/MessagesShell";
import { getMessagesLayout } from "@/modules/chat/shared/components/MessagesLayout";
import type { NextPageWithLayout } from "@/pages/_app";

const MessagesIndexPage: NextPageWithLayout = function MessagesIndexPage() {
  return <MessagesShell conversationId={null} />;
};
MessagesIndexPage.getLayout = getMessagesLayout;

export default MessagesIndexPage;
