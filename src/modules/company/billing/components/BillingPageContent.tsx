import React from "react";
import Link from "next/link";
import { Receipt as ReceiptLongOutlined } from "lucide-react";
import { CheckCircle, Receipt, DollarSign, ArrowLeft } from "lucide-react";
import { Button }      from "@/modules/shared/ui/shadcn/button";
import PageHeader      from "@/modules/shared/layouts/dashboard/PageHeader";
import StatCard        from "@/modules/shared/ui/StatCard";
import { ACCENT_DARK } from "../constants";
import { useBillingPage } from "../hooks/useBillingPage";
import ActiveSubscriptionCard from "./ActiveSubscriptionCard";
import PaymentTable           from "./PaymentTable";

const BillingPageContent: React.FC = () => {
  const { history, loading, subByPaymentId, completedCount, lastPayment } = useBillingPage();

  const lastAmount = lastPayment
    ? `$${(lastPayment.amountCents ? lastPayment.amountCents / 100 : (lastPayment.planPrice || 0)).toFixed(0)}`
    : "—";

  return (
    <>
      <PageHeader
        title="Billing & Payments"
        subtitle="View your active subscription usage and full payment history"
        breadcrumbs={[
          { label: "Dashboard", href: "/company/dashboard" },
          { label: "Plans", href: "/company/plans" },
          { label: "Billing" },
        ]}
        icon={ReceiptLongOutlined}
        actions={
          <Link href="/company/plans">
            <Button variant="outline">
              <ArrowLeft size={18} />
              Back to Plans
            </Button>
          </Link>
        }
      />

      <ActiveSubscriptionCard />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={<CheckCircle />} label="Successful Payments" value={completedCount} color={ACCENT_DARK} />
        <StatCard icon={<Receipt />} label="Total Invoices" value={history.length} color={ACCENT_DARK} />
        <StatCard icon={<DollarSign />} label="Last Payment" value={lastAmount} color={ACCENT_DARK} />
      </div>

      <PaymentTable history={history} loading={loading} subByPaymentId={subByPaymentId} />
    </>
  );
};

export default BillingPageContent;
