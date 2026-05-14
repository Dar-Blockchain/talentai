import { useLegacyRouteRedirect } from "@/modules/shared/chat/hooks/useLegacyRouteRedirect";
import { MESSAGES_BASE_PATH } from "@/modules/shared/chat/constants/messagesRoutes";

export default function LegacyCandidateMessagesRedirectPage() {
  useLegacyRouteRedirect(MESSAGES_BASE_PATH);
  return null;
}
