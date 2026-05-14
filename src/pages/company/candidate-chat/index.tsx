import { useLegacyRouteRedirect } from "@/modules/shared/chat/hooks/useLegacyRouteRedirect";
import { MESSAGES_CANDIDATES_PATH } from "@/modules/shared/chat/constants/messagesRoutes";

export default function LegacyCompanyCandidateChatRedirectPage() {
  useLegacyRouteRedirect(MESSAGES_CANDIDATES_PATH);
  return null;
}
