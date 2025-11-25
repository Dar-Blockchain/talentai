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
import { fetchTokenBalance, PricingPlan } from "@/store/slices/tokenSlice";
import { STEPS } from "./TokenPurchaseModal";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { completePayment } from "@/store/slices/tokenSlice";

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
  setWalletInfo,
}: ConfirmTransactionProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const hasInsufficientBalance = walletInfo && walletInfo.balance < amount;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSendTransaction = async () => {
    if (!walletInfo) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result: TransactionResult =
        await hashConnectService.sendHbarTransaction(amount);

      if (result.status !== "success") {
        throw new Error(result.message || "Transaction failed");
      }

      if (selectedPlan?.id) {
        const response: any = await dispatch(
          completePayment({
            planId: selectedPlan.id,
            hederaTransactionId: result.transactionId,
          })
        );

        if (completePayment.rejected.match(response)) {
          setErrorMessage(
            `Payment sent but token distribution failed: ${response.payload}`
          );
        }
      }
    } catch (error: any) {
      console.error("Transaction failed:", error);
      setErrorMessage(`Transaction failed: ${error.message}`);
    } finally {
      dispatch(fetchTokenBalance());
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
            fontSize: "16px",
            lineHeight: "34px",
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
          }}
        >
          <Typography sx={{ color: "gray", fontSize: "14px", mb: 1 }}>
            Connected Wallet:
          </Typography>
          <Typography sx={{ fontFamily: "monospace", mb: 2 }}>
            {walletInfo?.accountId}
          </Typography>

          <Typography sx={{ color: "gray", fontSize: "14px", mb: 1 }}>
            Balance:
          </Typography>
          <Typography sx={{ mb: 2 }}>{walletInfo?.balance} HBAR</Typography>

          <Typography sx={{ color: "gray", fontSize: "14px", mb: 1 }}>
            Network:
          </Typography>
          <Typography>{walletInfo?.network}</Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Transaction Details */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontWeight: 600, mb: 2 }}>
            Transaction Details:
          </Typography>

          {priceUsd && (
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ color: "gray" }}>Plan Price:</Typography>
              <Typography>${priceUsd} USD</Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ color: "gray" }}>Total HBAR:</Typography>
            <Typography>{amount} HBAR</Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ color: "gray" }}>TAI Tokens:</Typography>
            <Typography>{tokens.toLocaleString()} TAI</Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ color: "gray" }}>To:</Typography>
            <Typography sx={{ fontFamily: "monospace" }}>
              {hashConnectService.getTargetAccountId()}
            </Typography>
          </Box>
        </Box>

        {/* Insufficient Balance */}
        {hasInsufficientBalance && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Insufficient balance. You need {amount} HBAR but have{" "}
            {walletInfo.balance} HBAR.
          </Alert>
        )}

        {/* Confirm Button */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Button
            variant="contained"
            disabled={isProcessing || hasInsufficientBalance}
            onClick={onSendTransaction}
            startIcon={
              isProcessing ? <CircularProgress size={16} /> : <SwapHorizIcon />
            }
            sx={{
              height: 42,
              backgroundColor: "white",
              color: "rgba(224,154,16,1)",
              border: "1px solid rgba(224,154,16,1)",
              borderRadius: "38px",
              textTransform: "none",
            }}
          >
            {isProcessing ? "Sending..." : `Send ${amount} HBAR`}
          </Button>

          <Button
            onClick={handleDisconnectWallet}
            sx={{ color: "rgba(133,169,227,1)" }}
          >
            Disconnect Wallet
          </Button>
        </Box>
      </Box>

      {/* Bottom Navigation */}
      <Box
        sx={{ display: "flex", justifyContent: "space-between", p: 3, pt: 2 }}
      >
        <Button onClick={onBack} sx={{ color: "rgba(133,169,227,1)" }}>
          Back
        </Button>

        <Button
          onClick={handleDisconnectWallet}
          sx={{ color: "rgba(133,169,227,1)" }}
        >
          Cancel
        </Button>
      </Box>
    </>
  );
};

export default ConfirmTransaction;
