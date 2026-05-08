import ChatLayout from "@/components/layout/dashboard/ChatLayout";
import SharedChatConversationPage from "@/components/features/chat/SharedChatConversationPage";

export default function CandidateConversationPage() {
  return <SharedChatConversationPage basePath="/candidate/chat" isCompany={false} layout={ChatLayout} />;
}
