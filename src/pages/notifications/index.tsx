import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import NotificationsPanel from "@/modules/notifications/components/NotificationsPanel";

export default function NotificationsPage() {
  return (
    <DashboardLayout>
      <NotificationsPanel variant="page" />
    </DashboardLayout>
  );
}
