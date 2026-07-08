import React from "react";
import { useRouter } from "next/router";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";
import MessagesShell from "@/modules/chat/shared/components/MessagesShell";
import { getMessagesLayout } from "@/modules/chat/shared/components/MessagesLayout";
import type { NextPageWithLayout } from "@/pages/_app";

const MessagesConversationPage: NextPageWithLayout = function MessagesConversationPage() {
  const router = useRouter();
  const { conversationId } = router.query;
  const routeId = typeof conversationId === "string" ? conversationId : null;

  if (!router.isReady) {
    return (
      <div className="flex items-center justify-center min-h-[280px]">
        <Spinner style={{ color: "#0D9488" }} />
      </div>
    );
  }

  return <MessagesShell conversationId={routeId} />;
};
MessagesConversationPage.getLayout = getMessagesLayout;

export default MessagesConversationPage;
