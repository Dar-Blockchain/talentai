import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Payment } from "@/store/slices/paymentSlice";
import { STATUS_CONFIG, SUB_STATUS_STYLE, ACCENT } from "../constants";
import { downloadInvoice } from "../utils/invoice";

interface Props {
  payment:    Payment;
  index:      number;
  subStatus?: string;
}

const PaymentRow: React.FC<Props> = ({ payment, index, subStatus }) => {
  const statusCfg = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
  const amount    = payment.amountCents
    ? `$${(payment.amountCents / 100).toFixed(2)}`
    : payment.planPrice ? `$${payment.planPrice.toFixed(2)}` : "—";
  const date      = new Date(payment.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const invoiceNo = `INV-${payment._id.slice(-8).toUpperCase()}`;
  const subStyle  = subStatus ? (SUB_STATUS_STYLE[subStatus] ?? { bg: "#f3f4f6", color: "#6b7280" }) : null;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <span className="text-[0.8rem] font-medium text-gray-400">
          {String(index + 1).padStart(2, "0")}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: ACCENT }} />
          <span className="text-[0.875rem] font-semibold text-gray-900">
            {payment.planName || "—"}
          </span>
        </div>
      </td>

      <td className="px-4 py-3">
        <span className="text-[0.875rem] font-semibold text-gray-700">{amount}</span>
      </td>

      <td className="px-4 py-3">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.75rem] font-semibold"
          style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
        >
          {statusCfg.icon}
          {statusCfg.label}
        </span>
      </td>

      <td className="px-4 py-3">
        {subStyle && subStatus ? (
          <span
            className="inline-flex rounded-full px-2.5 py-1 text-[0.75rem] font-semibold"
            style={{ backgroundColor: subStyle.bg, color: subStyle.color }}
          >
            {subStatus.charAt(0).toUpperCase() + subStatus.slice(1)}
          </span>
        ) : (
          <span className="text-[0.8rem] text-gray-300">—</span>
        )}
      </td>

      <td className="px-4 py-3">
        <span className="text-[0.875rem] text-gray-500">{date}</span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.75rem] text-gray-400">{invoiceNo}</span>
          {payment.status === "completed" && (
            <Button
              variant="ghost"
              title="Download Invoice"
              onClick={() => void downloadInvoice(payment)}
              className="h-7 w-7 p-0 rounded-md text-emerald-600 hover:bg-emerald-100"
              style={{ backgroundColor: "#f0fdf4" }}
            >
              <Download size={16} />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default PaymentRow;
