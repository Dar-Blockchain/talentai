import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import NotificationsPanel from "@/components/features/notifications/NotificationsPanel";

export default function CompanyNotificationsPage() {
  return (
    <DashboardLayout>
      <NotificationsPanel variant="page" />
    </DashboardLayout>
  );
}
