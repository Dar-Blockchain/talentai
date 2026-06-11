import React from "react";
import { Box, Chip, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import { Payment } from "@/store/slices/paymentSlice";
import { STATUS_CONFIG, PLAN_COLORS, SUB_STATUS_STYLE } from "../constants";
import { downloadInvoice } from "../utils/invoice";

interface Props {
  payment:    Payment;
  index:      number;
  subStatus?: string;
}

const PaymentRow: React.FC<Props> = ({ payment, index, subStatus }) => {
  const statusCfg = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
  const planColor = PLAN_COLORS[payment.planName] || "#6b7280";
  const amount    = payment.amountCents
    ? `$${(payment.amountCents / 100).toFixed(2)}`
    : payment.planPrice ? `$${payment.planPrice.toFixed(2)}` : "—";
  const date      = new Date(payment.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const invoiceNo = `INV-${payment._id.slice(-8).toUpperCase()}`;
  const subStyle  = subStatus ? (SUB_STATUS_STYLE[subStatus] ?? { bg: "#f3f4f6", color: "#6b7280" }) : null;

  return (
    <TableRow sx={{ "&:hover": { bgcolor: "#f9fafb" } }}>
      <TableCell>
        <Typography sx={{ fontSize: "0.8rem", color: "#9ca3af", fontWeight: 500 }}>
          {String(index + 1).padStart(2, "0")}
        </Typography>
      </TableCell>

      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: planColor, flexShrink: 0 }} />
          <Typography sx={{ fontWeight: 600, color: "#111827", fontSize: "0.875rem" }}>
            {payment.planName || "—"}
          </Typography>
        </Box>
      </TableCell>

      <TableCell>
        <Typography sx={{ color: "#374151", fontSize: "0.875rem", fontWeight: 600 }}>{amount}</Typography>
      </TableCell>

      <TableCell>
        <Chip
          icon={statusCfg.icon as React.ReactElement}
          label={statusCfg.label}
          color={statusCfg.color}
          size="small"
          sx={{ fontWeight: 600, fontSize: "0.75rem" }}
        />
      </TableCell>

      <TableCell>
        {subStyle && subStatus ? (
          <Chip
            label={subStatus.charAt(0).toUpperCase() + subStatus.slice(1)}
            size="small"
            sx={{ fontWeight: 600, fontSize: "0.75rem", bgcolor: subStyle.bg, color: subStyle.color }}
          />
        ) : (
          <Typography sx={{ fontSize: "0.8rem", color: "#d1d5db" }}>—</Typography>
        )}
      </TableCell>

      <TableCell>
        <Typography sx={{ color: "#6b7280", fontSize: "0.875rem" }}>{date}</Typography>
      </TableCell>

      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af", fontFamily: "monospace" }}>
            {invoiceNo}
          </Typography>
          {payment.status === "completed" && (
            <Tooltip title="Download Invoice">
              <Box
                onClick={() => void downloadInvoice(payment)}
                sx={{
                  width: 28, height: 28, borderRadius: "6px", display: "flex",
                  alignItems: "center", justifyContent: "center", cursor: "pointer",
                  bgcolor: "#f0fdf4", color: "#059669",
                  "&:hover": { bgcolor: "#dcfce7" },
                  transition: "all 0.15s",
                }}
              >
                <DownloadOutlined sx={{ fontSize: 16 }} />
              </Box>
            </Tooltip>
          )}
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default PaymentRow;
