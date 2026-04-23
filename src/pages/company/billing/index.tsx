'use client';
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import PageHeader from "@/components/layout/dashboard/PageHeader";
import StatCard from "@/components/ui/StatCard";
import {
  Box, Chip, CircularProgress, Grid, LinearProgress, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Tooltip,
} from "@mui/material";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import PendingOutlined from "@mui/icons-material/PendingOutlined";
import AttachMoneyOutlined from "@mui/icons-material/AttachMoneyOutlined";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import ArticleOutlined from "@mui/icons-material/ArticleOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import VideoCallOutlined from "@mui/icons-material/VideoCallOutlined";
import {
  fetchCompanyPaymentHistory, selectPaymentHistory, selectPaymentHistoryLoading,
  fetchActiveSubscription, selectActiveSubscription, selectActiveSubscriptionLoading,
  fetchSubscriptionDetails, selectSubscriptionDetails, selectSubscriptionDetailsLoading,
  fetchCompanySubscriptions, selectCompanySubscriptions,
  Payment,
} from "@/store/slices/paymentSlice";
import { AppDispatch } from "@/store/store";
import { jsPDF } from "jspdf";

// ─── Config ──────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: "success" | "error" | "warning" | "default"; icon: React.ReactNode }> = {
  completed: { label: "Completed", color: "success", icon: <CheckCircleOutlined sx={{ fontSize: 14 }} /> },
  failed:    { label: "Failed",    color: "error",   icon: <CancelOutlined sx={{ fontSize: 14 }} /> },
  cancelled: { label: "Cancelled", color: "error",   icon: <CancelOutlined sx={{ fontSize: 14 }} /> },
  pending:   { label: "Pending",   color: "warning", icon: <PendingOutlined sx={{ fontSize: 14 }} /> },
};

const PLAN_COLORS: Record<string, string> = {
  Standard: "#0D9488",
  Gold:     "#7C3AED",
  Platinum: "#0891B2",
  Diamond:  "#D97706",
};

// ─── PDF helpers ─────────────────────────────────────────

const loadLogoDataUrl = (): Promise<string> => {
  const svgString = `<svg width="144" height="31" viewBox="0 0 144 31" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M139.3 0.647629H109.501C106.905 0.647629 104.801 2.75175 104.801 5.34731V25.6527C104.801 28.2482 106.905 30.3524 109.501 30.3524H139.3C141.896 30.3524 144 28.2482 144 25.6527V5.34731C144 2.75175 141.896 0.647629 139.3 0.647629Z" fill="#00FF9D"/><path d="M113.949 5.6899H119.304L124.338 24.9694H120.269L119.25 20.5517H113.868L112.849 24.9694H108.806L113.947 5.6899H113.949ZM118.501 17.4173L117.028 11.071C116.975 10.8041 116.921 10.5126 116.868 10.2003C116.815 9.888 116.769 9.58895 116.733 9.30314C116.697 9.00031 116.661 8.688 116.625 8.36624H116.464C116.428 8.688 116.385 9.00031 116.33 9.30314C116.294 9.58895 116.254 9.888 116.209 10.2003C116.163 10.5126 116.107 10.8022 116.035 11.071L114.589 17.4173H118.497H118.501Z" fill="white"/><path d="M126.615 21.3278H131.837V13.8571H127.285V10.242H135.587V21.3278H139.738V24.9694H126.617V21.3278H126.615ZM131.033 6.35993C131.033 5.78832 131.216 5.33406 131.582 4.99526C131.947 4.65646 132.433 4.48611 133.041 4.48611H133.844C134.451 4.48611 134.938 4.65646 135.303 4.99526C135.668 5.33406 135.852 5.79022 135.852 6.35993C135.852 6.92965 135.668 7.3858 135.303 7.7246C134.938 8.0634 134.442 8.23375 133.817 8.23375H133.041C132.433 8.23375 131.947 8.06529 131.582 7.7246C131.216 7.3858 131.033 6.92965 131.033 6.35993Z" fill="white"/><path d="M15.583 6.20094V10.4577H10.3344V24.9429H5.24669V10.4577H0V6.20094H15.583Z" fill="#191919"/><path d="M31.3287 6.22745V24.9713H26.294V21.8653H20.4568L19.1981 24.9713H13.4404L19.0902 11.3151C20.8031 7.19085 21.9558 6.22745 26.2921 6.22745H31.3268H31.3287ZM26.294 10.5107C25.1697 10.6981 24.5546 11.7694 23.5893 14.1259L22.1962 17.6066H26.2921V10.5107H26.294Z" fill="#191919"/><path d="M47.2864 20.7126V24.9694H37.5407C35.2107 24.9694 34.4612 23.8716 34.4612 21.7025V6.22745H39.5489V19.9101C39.5489 20.4987 39.6833 20.7126 40.3249 20.7126H47.2864Z" fill="#191919"/><path d="M54.1685 11.2868V13.4558H61.9061V17.7391H54.1685V19.9082C54.1685 20.4968 54.3029 20.7107 54.9445 20.7107H63.2442V24.9675H52.1584C49.8284 24.9675 49.0789 23.8697 49.0789 21.7006V9.52082C49.0789 7.32524 49.8284 6.22745 52.1584 6.22745H63.2442V10.4842H54.9445C54.301 10.4842 54.1685 10.6981 54.1685 11.2868Z" fill="#191919"/><path d="M83.0328 6.22745V24.9713H79.4442C77.0877 24.9713 76.0429 24.4356 74.9735 22.2666L71.0366 14.4211V24.9713H65.9489V6.22745H69.4562C72.106 6.22745 72.9634 7.00347 73.9552 9.01167L77.9451 16.9915V6.22745H83.0328Z" fill="#191919"/><path d="M100.465 6.20094V10.4577H95.2164V24.9429H90.1287V10.4577H84.8801V6.20094H100.463H100.465Z" fill="#191919"/></svg>`;
  return new Promise((resolve) => {
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url  = URL.createObjectURL(blob);
    const img  = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 576; canvas.height = 124;
      canvas.getContext("2d")!.drawImage(img, 0, 0, 576, 124);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.src = url;
  });
};

const downloadInvoice = async (payment: Payment) => {
  const logoDataUrl = await loadLogoDataUrl();
  const subtotal  = payment.amountCents ? payment.amountCents / 100 : (payment.planPrice || 0);
  const total     = subtotal;
  const invoiceNo = `INV-${payment._id.slice(-8).toUpperCase()}`;
  const issueDate = new Date(payment.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, H = 297, L = 20, R = 190, CW = R - L;

  const grey1  = [249, 250, 251] as [number, number, number];
  const grey2  = [229, 231, 235] as [number, number, number];
  const dark   = [17, 24, 39]   as [number, number, number];
  const mid    = [55, 65, 81]   as [number, number, number];
  const light  = [107, 114, 128] as [number, number, number];
  const accent = [13, 148, 136] as [number, number, number];

  doc.setFillColor(...accent); doc.rect(0, 0, W, 3, "F");
  doc.addImage(logoDataUrl, "PNG", L, 10, 48, 10.3);
  doc.setFont("helvetica", "bold"); doc.setFontSize(28); doc.setTextColor(...dark);
  doc.text("INVOICE", R, 18, { align: "right" });
  doc.setDrawColor(...grey2); doc.setLineWidth(0.4); doc.line(L, 26, R, 26);

  let y = 34;
  const metaLabel = (label: string, value: string, yy: number) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...light); doc.text(label, 130, yy);
    doc.setFont("helvetica", "bold"); doc.setTextColor(...dark); doc.text(value, R, yy, { align: "right" });
  };
  metaLabel("Invoice Number:", invoiceNo, y);
  metaLabel("Issue Date:", issueDate, y + 6);
  metaLabel("Due Date:", issueDate, y + 12);
  metaLabel("Status:", "PAID", y + 18);

  const blockTitle = (t: string, yy: number) => { doc.setFont("helvetica", "bold"); doc.setFontSize(7.5); doc.setTextColor(...accent); doc.text(t, L, yy); };
  const blockLine  = (t: string, yy: number, bold = false) => { doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setFontSize(9); doc.setTextColor(...(bold ? dark : mid)); doc.text(t, L, yy); };

  blockTitle("FROM", y);
  blockLine("TalentAI Platform", y + 6, true);
  blockLine("app.talentai.bid", y + 12);
  blockLine("support@talentai.bid", y + 18);
  doc.setDrawColor(...grey2); doc.line(L, y + 24, 100, y + 24);
  y += 30;
  blockTitle("BILL TO", y);
  blockLine("Subscription Customer", y + 6, true);
  blockLine(`Plan: ${payment.planName || "—"}`, y + 12);
  y += 26;
  doc.setDrawColor(...grey2); doc.line(L, y, R, y); y += 8;

  doc.setFillColor(...accent); doc.rect(L, y, CW, 9, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(255, 255, 255);
  doc.text("DESCRIPTION", L + 3, y + 6);
  doc.text("QTY", L + 95, y + 6, { align: "center" });
  doc.text("UNIT PRICE", L + 120, y + 6, { align: "center" });
  doc.text("AMOUNT", R - 3, y + 6, { align: "right" });
  y += 9;

  doc.setFillColor(...grey1); doc.rect(L, y, CW, 11, "F");
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...mid);
  doc.text(`TalentAI ${payment.planName || ""} Plan — Monthly Subscription`, L + 3, y + 7.2);
  doc.text("1", L + 95, y + 7.2, { align: "center" });
  doc.text(`$${subtotal.toFixed(2)}`, L + 120, y + 7.2, { align: "center" });
  doc.setFont("helvetica", "bold"); doc.setTextColor(...dark);
  doc.text(`$${subtotal.toFixed(2)}`, R - 3, y + 7.2, { align: "right" });
  y += 11;
  doc.setDrawColor(...grey2); doc.line(L, y, R, y); y += 8;

  const totalsX = R - 70;
  const totalRow = (label: string, value: string, yy: number, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setFontSize(bold ? 10 : 9);
    doc.setTextColor(...(bold ? dark : mid));
    doc.text(label, totalsX, yy); doc.text(value, R, yy, { align: "right" });
  };
  totalRow("Subtotal:", `$${subtotal.toFixed(2)}`, y);
  totalRow("Tax (0%):", "$0.00", y + 7);
  y += 14;
  doc.setDrawColor(...accent); doc.setLineWidth(0.6); doc.line(totalsX, y, R, y); y += 6;
  doc.setFillColor(...accent); doc.roundedRect(totalsX, y, R - totalsX, 11, 2, 2, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(255, 255, 255);
  doc.text("TOTAL DUE", totalsX + 4, y + 7.5);
  doc.text(`$${total.toFixed(2)} USD`, R - 4, y + 7.5, { align: "right" });
  y += 18;

  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...accent);
  doc.text("PAYMENT INFORMATION", L, y); y += 6;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...mid);
  doc.text("Payment Method:  Credit / Debit Card (via Stripe)", L, y);
  doc.text(`Payment Date:    ${issueDate}`, L, y + 6);
  doc.text("Currency:        USD", L, y + 12);
  y += 24;

  doc.setDrawColor(...grey2); doc.setLineWidth(0.3); doc.line(L, y, R, y); y += 6;
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...accent);
  doc.text("TERMS & CONDITIONS", L, y); y += 5;
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...light);
  [
    "1. This invoice is generated automatically upon successful payment processing.",
    "2. All subscriptions are billed monthly. Cancellation takes effect at the end of the current billing period.",
    "3. Refunds are subject to TalentAI refund policy. Contact support@talentai.bid within 7 days of payment.",
    "4. This document serves as an official receipt and proof of payment.",
  ].forEach((line, i) => doc.text(line, L, y + i * 5));

  doc.setFillColor(...dark); doc.rect(0, H - 16, W, 16, "F");
  doc.setFillColor(...accent); doc.rect(0, H - 16, 3, 16, "F");
  doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(200, 200, 200);
  doc.text("TalentAI  ·  app.talentai.bid  ·  support@talentai.bid", W / 2, H - 9, { align: "center" });
  doc.setTextColor(...accent); doc.text(invoiceNo, W / 2, H - 4, { align: "center" });

  doc.save(`${invoiceNo}.pdf`);
};

// ─── Active Subscription Card ─────────────────────────────

const ActiveSubscriptionCard: React.FC = () => {
  const dispatch   = useDispatch<AppDispatch>();
  const activeSub  = useSelector(selectActiveSubscription);
  const subLoading = useSelector(selectActiveSubscriptionLoading);
  const details    = useSelector(selectSubscriptionDetails);
  const detLoading = useSelector(selectSubscriptionDetailsLoading);

  useEffect(() => {
    if (activeSub?._id) {
      dispatch(fetchSubscriptionDetails(activeSub._id));
    }
  }, [activeSub?._id, dispatch]);

  if (subLoading || detLoading) return (
    <Paper sx={{ borderRadius: 3, p: 3, mb: 3, display: "flex", justifyContent: "center" }}>
      <CircularProgress size={24} sx={{ color: "#0D9488" }} />
    </Paper>
  );
  if (!activeSub || !details || details.planName === "Trial") return null;

  const planName = details.planName;
  const color    = PLAN_COLORS[planName] ?? "#0D9488";
  const fmt      = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const postsPct       = details.usage.posts.limit > 0
    ? Math.min(100, Math.round((details.usage.posts.used / details.usage.posts.limit) * 100)) : 0;
  const interviewsPct  = details.usage.monthlyInterviews.limit > 0
    ? Math.min(100, Math.round((details.usage.monthlyInterviews.used / details.usage.monthlyInterviews.limit) * 100)) : 0;
  const totalDays      = Math.max(1, Math.round(
    (new Date(details.endDate).getTime() - new Date(details.startDate).getTime()) / 86400000
  ));
  const elapsedPct     = Math.min(100, Math.round(((totalDays - details.daysRemaining) / totalDays) * 100));

  const UsageBar: React.FC<{ label: string; used: number; limit: number; remaining: number; pct: number; icon: React.ReactNode }> = ({ label, used, limit, remaining, pct, icon }) => (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.6 }}>
        <Box sx={{ color, display: "flex" }}>{icon}</Box>
        <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151", flex: 1 }}>{label}</Typography>
        <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: pct >= 90 ? "#ef4444" : color }}>
          {used} / {limit}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{ height: 7, borderRadius: 4, bgcolor: "#f3f4f6", "& .MuiLinearProgress-bar": { bgcolor: pct >= 90 ? "#ef4444" : color, borderRadius: 4 } }}
      />
      <Typography sx={{ fontSize: "0.69rem", color: "#9ca3af", mt: 0.4 }}>{remaining} remaining</Typography>
    </Box>
  );

  return (
    <Paper sx={{ borderRadius: 3, overflow: "hidden", boxShadow: `0 4px 20px ${color}18`, border: `1.5px solid ${color}25`, mb: 3 }}>
      <Box sx={{ height: 4, bgcolor: color }} />
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircleOutlined sx={{ color, fontSize: 22 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#111827" }}>
                Active — {planName} Plan
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", color: "#6b7280" }}>
                {fmt(details.startDate)} → {fmt(details.endDate)}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              icon={<CalendarTodayOutlined sx={{ fontSize: "13px !important" }} />}
              label={`${details.daysRemaining} day${details.daysRemaining !== 1 ? "s" : ""} left`}
              size="small"
              sx={{ bgcolor: `${color}12`, color, fontWeight: 700, fontSize: "0.75rem", "& .MuiChip-icon": { color } }}
            />
            <Chip
              label={activeSub.autoRenew ? "Auto-renew on" : "Auto-renew off"}
              size="small"
              sx={{
                bgcolor: activeSub.autoRenew ? "#f0fdf4" : "#fef2f2",
                color: activeSub.autoRenew ? "#16a34a" : "#dc2626",
                fontWeight: 600, fontSize: "0.75rem",
              }}
            />
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.6 }}>
                <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151" }}>Subscription period</Typography>
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color }}>
                  {100 - elapsedPct}% left
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={elapsedPct}
                sx={{ height: 7, borderRadius: 4, bgcolor: `${color}18`, "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 4 } }}
              />
              <Typography sx={{ fontSize: "0.69rem", color: "#9ca3af", mt: 0.4 }}>
                {details.daysRemaining} of {totalDays} days remaining
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <UsageBar
              label="Job Posts"
              used={details.usage.posts.used}
              limit={details.usage.posts.limit}
              remaining={details.usage.posts.remaining}
              pct={postsPct}
              icon={<WorkOutlined sx={{ fontSize: 15 }} />}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <UsageBar
              label="Interviews (this month)"
              used={details.usage.monthlyInterviews.used}
              limit={details.usage.monthlyInterviews.limit}
              remaining={details.usage.monthlyInterviews.remaining}
              pct={interviewsPct}
              icon={<VideoCallOutlined sx={{ fontSize: 15 }} />}
            />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

// ─── Page ────────────────────────────────────────────────

const BillingPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const history  = useSelector(selectPaymentHistory);
  const loading  = useSelector(selectPaymentHistoryLoading);

  const subscriptions = useSelector(selectCompanySubscriptions);

  useEffect(() => {
    dispatch(fetchCompanyPaymentHistory());
    dispatch(fetchActiveSubscription());
    dispatch(fetchCompanySubscriptions());
  }, [dispatch]);

  // Build paymentId → subscription status lookup
  const subByPaymentId = React.useMemo(() => {
    const map: Record<string, { status: string; cancelledAt?: string }> = {};
    subscriptions.forEach((s) => {
      if (s.paymentId) map[String(s.paymentId)] = { status: s.status, cancelledAt: s.cancelledAt };
    });
    return map;
  }, [subscriptions]);

  const totalSpent     = history.filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + (p.amountCents ? p.amountCents / 100 : (p.planPrice || 0)), 0);
  const completedCount = history.filter((p) => p.status === "completed").length;
  const lastPayment    = history[0];

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

      {/* Active subscription usage */}
      <ActiveSubscriptionCard />

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard icon={<AttachMoneyOutlined />} label="Total Spent" value={`$${totalSpent.toFixed(0)}`} color="#0D9488" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard icon={<CheckCircleOutlined />} label="Successful Payments" value={completedCount} color="#059669" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard icon={<ReceiptLongOutlined />} label="Total Invoices" value={history.length} color="#7C3AED" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            icon={<AttachMoneyOutlined />}
            label="Last Payment"
            value={lastPayment ? `$${(lastPayment.amountCents ? lastPayment.amountCents / 100 : (lastPayment.planPrice || 0)).toFixed(0)}` : "—"}
            color="#D97706"
          />
        </Grid>
      </Grid>

      {/* Payment history table */}
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
                  {["#", "Plan", "Amount", "Payment", "Subscription", "Date", "Invoice"].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, color: "#374151", fontSize: "0.8rem" }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((payment, idx) => {
                  const statusCfg  = STATUS_CONFIG[payment.status] || STATUS_CONFIG.pending;
                  const planColor  = PLAN_COLORS[payment.planName] || "#6b7280";
                  const amount     = payment.amountCents
                    ? `$${(payment.amountCents / 100).toFixed(2)}`
                    : payment.planPrice ? `$${payment.planPrice.toFixed(2)}` : "—";
                  const date       = new Date(payment.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
                  const invoiceNo  = `INV-${payment._id.slice(-8).toUpperCase()}`;
                  const subInfo    = subByPaymentId[payment._id];
                  const subStatus  = subInfo?.status;

                  return (
                    <TableRow key={payment._id} sx={{ "&:hover": { bgcolor: "#f9fafb" } }}>
                      <TableCell>
                        <Typography sx={{ fontSize: "0.8rem", color: "#9ca3af", fontWeight: 500 }}>
                          {String(idx + 1).padStart(2, "0")}
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
                          icon={statusCfg.icon as any}
                          label={statusCfg.label}
                          color={statusCfg.color}
                          size="small"
                          sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                        />
                      </TableCell>
                      <TableCell>
                        {subStatus ? (
                          <Chip
                            label={subStatus.charAt(0).toUpperCase() + subStatus.slice(1)}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              bgcolor: subStatus === "active" ? "#f0fdf4"
                                : subStatus === "cancelled" ? "#fef2f2"
                                : subStatus === "expired" ? "#fef9c3"
                                : "#f3f4f6",
                              color: subStatus === "active" ? "#16a34a"
                                : subStatus === "cancelled" ? "#dc2626"
                                : subStatus === "expired" ? "#ca8a04"
                                : "#6b7280",
                            }}
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
