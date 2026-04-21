'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Box, Typography, CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";
import AppButton from "@/components/ui/AppButton";

const CheckCircleOutlined = dynamic(() => import("@mui/icons-material/CheckCircleOutlined"));
const CancelOutlined = dynamic(() => import("@mui/icons-material/CancelOutlined"));
const ArrowBackOutlined = dynamic(() => import("@mui/icons-material/ArrowBackOutlined"));
const DashboardOutlined = dynamic(() => import("@mui/icons-material/DashboardOutlined"));

const PaymentResultPage: React.FC = () => {
  const router = useRouter();
  const { status } = router.query;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  const isSuccess = status === "success";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f9fafb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Box
        sx={{
          bgcolor: "#fff",
          borderRadius: 4,
          boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
          p: { xs: 4, sm: 6 },
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: isSuccess ? "#d1fae5" : "#fee2e2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          {isSuccess ? (
            <CheckCircleOutlined sx={{ fontSize: 44, color: "#059669" }} />
          ) : (
            <CancelOutlined sx={{ fontSize: 44, color: "#dc2626" }} />
          )}
        </Box>

        {/* Title */}
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, color: "#111827", mb: 1.5 }}
        >
          {isSuccess ? "Payment Successful!" : "Payment Cancelled"}
        </Typography>

        {/* Message */}
        <Typography
          variant="body1"
          sx={{ color: "#6b7280", mb: 1, lineHeight: 1.7 }}
        >
          {isSuccess
            ? "Your subscription has been activated. You can now enjoy all the features of your new plan."
            : "Your payment was not completed. No charges were made to your account."}
        </Typography>

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 3, flexWrap: "wrap" }}>
          {!isSuccess && (
            <Link href="/company/plans">
              <AppButton
                label="View Plans"
                variant="outlined"
                startIcon={<ArrowBackOutlined />}
              />
            </Link>
          )}
          <Link href="/company/dashboard">
            <AppButton
              label="Go to Dashboard"
              variant="contained"
              startIcon={<DashboardOutlined />}
            />
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default PaymentResultPage;
