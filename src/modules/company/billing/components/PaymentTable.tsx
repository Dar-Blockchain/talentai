import React from "react";
import {
  Box, CircularProgress, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography,
} from "@mui/material";
import ArticleOutlined    from "@mui/icons-material/ArticleOutlined";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import { Payment } from "@/store/slices/paymentSlice";
import PaymentRow from "./PaymentRow";

interface Props {
  history:         Payment[];
  loading:         boolean;
  subByPaymentId:  Record<string, { status: string }>;
}

const COLUMNS = ["#", "Plan", "Amount", "Payment", "Subscription", "Date", "Invoice"];

const PaymentTable: React.FC<Props> = ({ history, loading, subByPaymentId }) => (
  <Paper sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
    <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 1 }}>
      <ArticleOutlined sx={{ color: "#0D9488", fontSize: 20 }} />
      <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#111827" }}>Payment History</Typography>
    </Box>

    {loading ? (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={36} sx={{ color: "#0D9488" }} />
      </Box>
    ) : history.length === 0 ? (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <ReceiptLongOutlined sx={{ fontSize: 48, color: "#d1d5db", mb: 1.5 }} />
        <Typography sx={{ color: "#6b7280", fontSize: "0.95rem" }}>No payment records found</Typography>
      </Box>
    ) : (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f9fafb" }}>
              {COLUMNS.map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, color: "#374151", fontSize: "0.8rem" }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((payment, idx) => (
              <PaymentRow
                key={payment._id}
                payment={payment}
                index={idx}
                subStatus={subByPaymentId[payment._id]?.status}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </Paper>
);

export default PaymentTable;
