import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import SharedChatIndexPage from "@/components/features/chat/SharedChatIndexPage";

export default function CompanyChatIndexPage() {
  return (
    <SharedChatIndexPage
      basePath="/company/chat"
      emptyText="Start chatting by contacting a candidate via the Applications page."
      layout={DashboardLayout}
    />
  );
}
