import React from "react";
import { Grid } from "@mui/material";
import AttachMoneyOutlined from "@mui/icons-material/AttachMoneyOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader      from "@/components/layout/dashboard/PageHeader";
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

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <StatCard icon={<CheckCircleOutlined />} label="Successful Payments" value={completedCount} color="#059669" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <StatCard icon={<ReceiptLongOutlined />} label="Total Invoices" value={history.length} color="#7C3AED" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <StatCard icon={<AttachMoneyOutlined />} label="Last Payment" value={lastAmount} color="#D97706" />
        </Grid>
      </Grid>

      <PaymentTable history={history} loading={loading} subByPaymentId={subByPaymentId} />
    </DashboardLayout>
  );
};

export default BillingPageContent;
