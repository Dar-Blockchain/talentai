import React from "react";
import { useRouter } from "next/router";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";

export default function withConversationRoute(
  Shell: React.ComponentType<{ conversationId: string | null }>
) {
  return function ConversationPage() {
    const router = useRouter();
    const { conversationId } = router.query;
    const routeId = typeof conversationId === "string" ? conversationId : null;

    if (!router.isReady) {
      return (
        <div className="flex flex-1 items-center justify-center min-h-[280px]">
          <Spinner style={{ color: "#0D9488" }} />
        </div>
      );
    }

    return <Shell conversationId={routeId} />;
  };
}
