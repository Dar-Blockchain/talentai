import React from "react";
import { FileText, Receipt, Loader2 } from "lucide-react";
import { Payment } from "@/store/slices/paymentSlice";
import PaymentRow from "./PaymentRow";

interface Props {
  history:         Payment[];
  loading:         boolean;
  subByPaymentId:  Record<string, { status: string }>;
}

const COLUMNS = ["#", "Plan", "Amount", "Payment", "Subscription", "Date", "Invoice"];

const PaymentTable: React.FC<Props> = ({ history, loading, subByPaymentId }) => (
  <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
    <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-5">
      <FileText size={20} className="text-teal-600" />
      <h2 className="text-[1rem] font-bold text-gray-900">Payment History</h2>
    </div>

    {loading ? (
      <div className="flex justify-center py-16">
        <Loader2 size={36} className="animate-spin text-teal-600" />
      </div>
    ) : history.length === 0 ? (
      <div className="py-16 text-center">
        <Receipt size={48} className="mx-auto mb-3 text-gray-300" />
        <p className="text-[0.95rem] text-gray-500">No payment records found</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              {COLUMNS.map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[0.8rem] font-bold text-gray-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {history.map((payment, idx) => (
              <PaymentRow
                key={payment._id}
                payment={payment}
                index={idx}
                subStatus={subByPaymentId[payment._id]?.status}
              />
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default PaymentTable;
