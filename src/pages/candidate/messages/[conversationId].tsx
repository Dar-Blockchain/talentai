import { useRouter } from "next/router";
import { useLegacyRouteRedirect } from "@/modules/shared/chat/hooks/useLegacyRouteRedirect";
import { MESSAGES_BASE_PATH } from "@/modules/shared/chat/constants/messagesRoutes";

export default function LegacyCandidateMessagesConversationRedirectPage() {
  const router = useRouter();
  const { conversationId } = router.query;
  const routeId = typeof conversationId === "string" ? conversationId : "";
  const target = routeId ? `${MESSAGES_BASE_PATH}/${routeId}` : MESSAGES_BASE_PATH;

  useLegacyRouteRedirect(target);
  return null;
}
