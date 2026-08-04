'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import Link from "next/link";
import { Spinner } from "@/modules/shared/ui/shadcn/spinner";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { verifyPayment } from "@/store/slices/paymentSlice";
import { AppDispatch } from "@/store/store";
import { CheckCircle2 as CheckCircleOutlined, XCircle as CancelOutlined, ArrowLeft as ArrowBackOutlined, LayoutDashboard as DashboardOutlined } from "lucide-react";

const PaymentResultPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { status, session_id } = router.query;
  const [isSuccess, setIsSuccess] = useState(false);


  useEffect(() => {
    if (!router.isReady) return;
    if (status === "success" && session_id) {
      setIsSuccess(true);
      dispatch(verifyPayment({ sessionId: session_id as string }))
        .finally(() => localStorage.removeItem("pending_payment_id"));
    }
  }, [router.isReady, status]);

  if (!router.isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f9fafb] px-4">
      <div className="w-full max-w-[480px] rounded-2xl bg-white p-8 sm:p-12 text-center shadow-[0_8px_40px_rgba(0,0,0,0.10)]">
        {/* Icon */}
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: isSuccess ? "#d1fae5" : "#fee2e2" }}
        >
          {isSuccess ? (
            <CheckCircleOutlined size={44} color="#059669" />
          ) : (
            <CancelOutlined size={44} color="#dc2626" />
          )}
        </div>

        {/* Title */}
        <h5 className="mb-3 text-[1.5rem] font-extrabold text-[#111827]">
          {isSuccess ? "Payment Successful!" : "Payment Cancelled"}
        </h5>

        {/* Message */}
        <p className="mb-2 leading-[1.7] text-[#6b7280]">
          {isSuccess
            ? "Your subscription has been activated. You can now enjoy all the features of your new plan."
            : "Your payment was not completed. No charges were made to your account."}
        </p>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {!isSuccess && (
            <Link href="/company/plans">
              <Button variant="outline">
                <ArrowBackOutlined />
                View Plans
              </Button>
            </Link>
          )}
          <Link href="/company/dashboard">
            <Button variant="default">
              <DashboardOutlined />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
