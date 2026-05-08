import ChatLayout from "@/components/layout/dashboard/ChatLayout";
import SharedChatIndexPage from "@/components/features/chat/SharedChatIndexPage";

export default function CandidateChatIndexPage() {
  return (
    <SharedChatIndexPage
      basePath="/candidate/chat"
      emptyText="Start chatting by contacting a company or candidate."
      layout={ChatLayout}
    />
  );
}
