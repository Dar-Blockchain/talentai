import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import SharedChatIndexPage from "@/components/features/chat/SharedChatIndexPage";

export default function CompanyMessagesIndexPage() {
  return (
    <SharedChatIndexPage
      basePath="/company/messages"
      emptyText="Contact a candidate from a job post to start a conversation."
      layout={DashboardLayout}
    />
  );
}
