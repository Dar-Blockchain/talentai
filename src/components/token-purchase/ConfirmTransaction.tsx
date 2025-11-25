import {
  Box,
  Typography,
  Button,
  Alert,
  Divider,
  CircularProgress,
} from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import hashConnectService, {
  TransactionResult,
  WalletInfo,
} from "@/services/hashConnectService";
import { useState } from "react";
import { PricingPlan } from "@/store/slices/tokenSlice";
import { useRouter } from "next/router";
import { STEPS } from "./TokenPurchaseModal";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:5000";

interface ConfirmTransactionProps {
  walletInfo: WalletInfo | null;
  isProcessing: boolean;
  amount: number;
  tokens: number;
  priceUsd?: number;
  selectedPlan: PricingPlan | null;
  onBack: () => void;
  setIsProcessing: (processing: boolean) => void;
  setCurrentStep: (step: number) => void;
  setWalletInfo: (walletInfo: WalletInfo | null) => void;
}

const ConfirmTransaction = ({
  walletInfo,
  isProcessing,
  amount,
  tokens,
  priceUsd,
  selectedPlan,
  onBack,
  setIsProcessing,
  setCurrentStep,
  setWalletInfo
}: ConfirmTransactionProps) => {
  const router = useRouter();
  const hasInsufficientBalance = walletInfo && walletInfo.balance < amount;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onPaymentComplete = async () => {
    setTimeout(() => {
      router.push("/dashboard/company?refreshBalance=true");
    }, 2000);
  };
  const onSendTransaction = async () => {
    if (!walletInfo) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Step 1: Send HBAR transaction via HashConnect
      const result: TransactionResult =
        await hashConnectService.sendHbarTransaction(amount);
      if (result.status === "success") {
        // Step 2: Call backend to verify payment and distribute TAI tokens
        if (selectedPlan?.id) {
          try {
            const apiUrl = `${API_BASE_URL}/payment/complete`;
            const token = localStorage.getItem("token");
            const response = await fetch(apiUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                planId: selectedPlan.id,
                hederaTransactionId: result.transactionId,
              }),
            });

            const data = await response.json();
            setTimeout(() => {
              onPaymentComplete();
            }, 2000);
            if (!data.success) {
              setErrorMessage(
                `Payment sent but token distribution failed: ${data.message}`
              );
            }
          } catch (backendError) {
            console.error("❌ Backend error:", backendError);
            setErrorMessage(
              `Payment sent but backend processing failed. Please contact support with transaction ID: ${result.transactionId}`
            );
            setTimeout(() => {
              onPaymentComplete();
            }, 2000);
          }
        } else {
          setTimeout(() => {
            onPaymentComplete();
          }, 2000);
        }
      } else {
        throw new Error(result.message || "Transaction failed");
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      setErrorMessage(`Transaction failed: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

    const handleDisconnectWallet = async () => {
    try {
      await hashConnectService.disconnectWallet();
      setWalletInfo(null);
      setCurrentStep(STEPS.PAYMENT_METHOD);
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };
  return (
    <>
      <Box
        sx={{ p: 3, pt: 2, borderBottom: "1px solid rgba(227, 229, 233, 1)" }}
      >
        <Typography
          variant="body2"
          sx={{
            mb: 3,
            fontFamily: "Poppins",
            fontWeight: 400,
            fontStyle: "normal",
            fontSize: "16px",
            lineHeight: "34px",
            letterSpacing: "0px",
            color: "rgba(0, 0, 0, 1)",
          }}
        >
          Confirm Transaction
        </Typography>

        {/* Wallet Info */}
        <Box
          sx={{
            backgroundColor: "rgba(249, 250, 251, 1)",
            padding: 2,
            borderRadius: "12px",
            border: "1px solid rgba(229, 231, 235, 1)",
            mb: 3,
            textAlign: "left",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "rgba(107, 114, 128, 1)",
              mb: 1,
              fontFamily: "Poppins",
              fontWeight: 400,
              fontSize: "14px",
            }}
          >
            Connected Wallet:
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: "monospace",
              mb: 2,
              fontWeight: 500,
              fontSize: "14px",
              color: "rgba(32, 45, 57, 1)",
            }}
          >
            {walletInfo?.accountId}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "rgba(107, 114, 128, 1)",
              mb: 1,
              fontFamily: "Poppins",
              fontWeight: 400,
              fontSize: "14px",
            }}
          >
            Balance:
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mb: 2,
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "14px",
              color: "rgba(32, 45, 57, 1)",
            }}
          >
            {walletInfo?.balance} HBAR
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "rgba(107, 114, 128, 1)",
              mb: 1,
              fontFamily: "Poppins",
              fontWeight: 400,
              fontSize: "14px",
            }}
          >
            Network:
          </Typography>
          <Typography
            variant="body2"
            sx={{
              textTransform: "capitalize",
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "14px",
              color: "rgba(32, 45, 57, 1)",
            }}
          >
            {walletInfo?.network}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Transaction Details */}
        <Box sx={{ textAlign: "left", mb: 3 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              mb: 2,
              fontFamily: "Poppins",
              fontSize: "14px",
              color: "rgba(32, 45, 57, 1)",
            }}
          >
            Transaction Details:
          </Typography>

          {priceUsd && (
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 400,
                  fontSize: "14px",
                  color: "rgba(107, 114, 128, 1)",
                }}
              >
                Plan Price:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontFamily: "Poppins",
                  fontSize: "14px",
                  color: "rgba(32, 45, 57, 1)",
                }}
              >
                ${priceUsd} USD
              </Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "Poppins",
                fontWeight: 400,
                fontSize: "14px",
                color: "rgba(107, 114, 128, 1)",
              }}
            >
              Total HBAR:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontFamily: "Poppins",
                fontSize: "14px",
                color: "rgba(32, 45, 57, 1)",
              }}
            >
              {amount} HBAR
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "Poppins",
                fontWeight: 400,
                fontSize: "14px",
                color: "rgba(107, 114, 128, 1)",
              }}
            >
              TAI Tokens:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "rgba(16, 185, 129, 1)",
                fontFamily: "Poppins",
                fontSize: "14px",
              }}
            >
              {tokens.toLocaleString()} TAI
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "Poppins",
                fontWeight: 400,
                fontSize: "14px",
                color: "rgba(107, 114, 128, 1)",
              }}
            >
              To:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "monospace",
                fontWeight: 500,
                fontSize: "14px",
                color: "rgba(32, 45, 57, 1)",
              }}
            >
              {hashConnectService.getTargetAccountId()}
            </Typography>
          </Box>
        </Box>

        {/* Insufficient Balance Warning */}
        {hasInsufficientBalance && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: "8px",
              "& .MuiAlert-message": {
                fontFamily: "Poppins",
                fontSize: "14px",
              },
            }}
          >
            Insufficient balance. You need {amount} HBAR but have{" "}
            {walletInfo.balance} HBAR.
          </Alert>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Button
            variant="contained"
            onClick={onSendTransaction}
            disabled={isProcessing || !walletInfo || hasInsufficientBalance}
            startIcon={
              isProcessing ? <CircularProgress size={16} /> : <SwapHorizIcon />
            }
            sx={{
              height: 42,
              backgroundColor: "white",
              color: "rgba(224, 154, 16, 1)",
              border: "1px solid rgba(224, 154, 16, 1)",
              borderRadius: "38px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
              textTransform: "none",
              fontFamily: "Poppins",
              fontWeight: 500,
              fontSize: "14px",
              "&:hover": {
                boxShadow: "0 4px 14px rgba(0,0,0,0.02)",
                backgroundColor: "rgba(224, 154, 16, 0.1)",
              },
              "&:disabled": {
                backgroundColor: "rgba(0, 0, 0, 0.12)",
                color: "rgba(0, 0, 0, 0.26)",
                border: "none",
              },
            }}
          >
            {isProcessing ? "Sending..." : `Send ${amount} HBAR`}
          </Button>

          <Button
            onClick={handleDisconnectWallet}
            sx={{
              fontFamily: "Poppins",
              fontWeight: 400,
              fontSize: "14px",
              color: "rgba(133, 169, 227, 1)",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "transparent",
                color: "rgba(133, 169, 227, 0.8)",
              },
            }}
          >
            Disconnect Wallet
          </Button>
        </Box>
      </Box>

      {/* Bottom Navigation */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          p: 3,
          pt: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={onBack}
          sx={{
            border: "none",
            background: "none",
            color: "rgba(133, 169, 227, 1)",
            textDecoration: "none",
            fontFamily: "Poppins",
            fontWeight: 400,
            fontSize: "14px",
            textTransform: "none",
            "&:hover": {
              background: "none",
              textDecoration: "none",
              color: "rgba(133, 169, 227, 0.8)",
            },
          }}
        >
          Back
        </Button>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleDisconnectWallet}
            sx={{
              border: "none",
              background: "none",
              color: "rgba(133, 169, 227, 1)",
              textDecoration: "none",
              fontFamily: "Poppins",
              fontWeight: 400,
              fontSize: "14px",
              textTransform: "none",
              "&:hover": {
                background: "none",
                textDecoration: "none",
                color: "rgba(133, 169, 227, 0.8)",
              },
            }}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default ConfirmTransaction;
