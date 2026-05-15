import { useRouter } from "next/router";
import { useLegacyRouteRedirect } from "@/modules/shared/chat/hooks/useLegacyRouteRedirect";
import { MESSAGES_CANDIDATES_PATH } from "@/modules/shared/chat/constants/messagesRoutes";

export default function LegacyCompanyCandidateChatConversationRedirectPage() {
  const router = useRouter();
  const { conversationId } = router.query;
  const routeId = typeof conversationId === "string" ? conversationId : "";
  const target = routeId ? `${MESSAGES_CANDIDATES_PATH}/${routeId}` : MESSAGES_CANDIDATES_PATH;

  useLegacyRouteRedirect(target);
  return null;
}
