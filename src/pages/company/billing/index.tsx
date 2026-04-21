'use client';
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import StatCard from "@/components/ui/StatCard";
import { Box, Chip, CircularProgress, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import PendingOutlined from "@mui/icons-material/PendingOutlined";
import AttachMoneyOutlined from "@mui/icons-material/AttachMoneyOutlined";
import { fetchCompanyPaymentHistory, selectPaymentHistory, selectPaymentHistoryLoading } from "@/store/slices/paymentSlice";
import { AppDispatch } from "@/store/store";

const STATUS_CONFIG: Record<string, { label: string; color: "success" | "error" | "warning" | "default"; icon: React.ReactNode }> = {
  completed: { label: "Completed", color: "success", icon: <CheckCircleOutlined sx={{ fontSize: 14 }} /> },
  failed: { label: "Failed", color: "error", icon: <CancelOutlined sx={{ fontSize: 14 }} /> },
  cancelled: { label: "Cancelled", color: "error", icon: <CancelOutlined sx={{ fontSize: 14 }} /> },
  pending: { label: "Pending", color: "warning", icon: <PendingOutlined sx={{ fontSize: 14 }} /> },
};

const BillingPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const history = useSelector(selectPaymentHistory);
  const loading = useSelector(selectPaymentHistoryLoading);
  useEffect(() => {
    dispatch(fetchCompanyPaymentHistory());
  }, []);

  const totalSpent = history
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + (p.amountCents || 0) / 100, 0);

  const completedCount = history.filter((p) => p.status === "completed").length;
  const lastPayment = history[0];

  return (
    <DashboardLayout>
      <PageHeader
        title="Billing & Payments"
        subtitle="View your payment history and subscription invoices"
        breadcrumbs={[
          { label: "Dashboard", href: "/company/dashboard" },
          { label: "Billing" },
        ]}
        icon={ReceiptLongOutlined}
      />

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={<AttachMoneyOutlined />}
            label="Total Spent"
            value={`$${totalSpent.toFixed(0)}`}
            color="#0D9488"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={<CheckCircleOutlined />}
            label="Successful Payments"
            value={completedCount}
            color="#059669"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={<ReceiptLongOutlined />}
            label="Total Invoices"
            value={history.length}
            color="#7C3AED"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={<AttachMoneyOutlined />}
            label="Last Payment"
            value={lastPayment ? `$${((lastPayment.amountCents || 0) / 100).toFixed(0)}` : "—"}
            color="#D97706"
          />
        </Grid>
      </Grid>

      {/* Table */}
      <Paper sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid #f3f4f6" }}>
          <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#111827" }}>
            Payment History
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={36} sx={{ color: "#0D9488" }} />
          </Box>
        ) : history.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <ReceiptLongOutlined sx={{ fontSize: 48, color: "#d1d5db", mb: 1.5 }} />
            <Typography sx={{ color: "#6b7280", fontSize: "0.95rem" }}>
              No payment records found
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f9fafb" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#374151", fontSize: "0.8rem" }}>Plan</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151", fontSize: "0.8rem" }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151", fontSize: "0.8rem" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#374151", fontSize: "0.8rem" }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((payment) => {
                  const statusCfg = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
                  const amount = payment.amountCents
                    ? `$${(payment.amountCents / 100).toFixed(2)}`
                    : payment.planPrice
                    ? `$${payment.planPrice.toFixed(2)}`
                    : "—";
                  const date = new Date(payment.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <TableRow key={payment._id} sx={{ "&:hover": { bgcolor: "#f9fafb" } }}>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, color: "#111827", fontSize: "0.875rem" }}>
                          {payment.planName || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ color: "#374151", fontSize: "0.875rem", fontWeight: 500 }}>
                          {amount}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={statusCfg.icon as any}
                          label={statusCfg.label}
                          color={statusCfg.color}
                          size="small"
                          sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ color: "#6b7280", fontSize: "0.875rem" }}>
                          {date}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </DashboardLayout>
  );
};

export default BillingPage;
