import React from "react";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import { CheckCircle, Receipt, DollarSign } from "lucide-react";
import DashboardLayout from "@/modules/shared/layouts/dashboard/DashboardLayout";
import PageHeader      from "@/modules/shared/layouts/dashboard/PageHeader";
import StatCard        from "@/components/ui/StatCard";
import { useBillingPage } from "../hooks/useBillingPage";
import ActiveSubscriptionCard from "./ActiveSubscriptionCard";
import PaymentTable           from "./PaymentTable";

const BillingPageContent: React.FC = () => {
  const { history, loading, subByPaymentId, completedCount, lastPayment } = useBillingPage();

  const lastAmount = lastPayment
    ? `$${(lastPayment.amountCents ? lastPayment.amountCents / 100 : (lastPayment.planPrice || 0)).toFixed(0)}`
    : "—";

  return (
    <DashboardLayout>
      <PageHeader
        title="Billing & Payments"
        subtitle="View your active subscription usage and full payment history"
        breadcrumbs={[
          { label: "Dashboard", href: "/company/dashboard" },
          { label: "Billing" },
        ]}
        icon={ReceiptLongOutlined}
      />

      <ActiveSubscriptionCard />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={<CheckCircle />} label="Successful Payments" value={completedCount} color="#059669" />
        <StatCard icon={<Receipt />} label="Total Invoices" value={history.length} color="#7C3AED" />
        <StatCard icon={<DollarSign />} label="Last Payment" value={lastAmount} color="#D97706" />
      </div>

      <PaymentTable history={history} loading={loading} subByPaymentId={subByPaymentId} />
    </DashboardLayout>
  );
};

export default BillingPageContent;
