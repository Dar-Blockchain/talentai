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
} from "@/services/hashConnectService";
import { useState } from "react";
import { fetchTokenBalance } from "@/store/slices/tokenSlice";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { completePayment } from "@/store/slices/tokenSlice";
import { toast } from "react-toastify";
import {
  closeModal,
  previousStep,
  setProcessing,
  setStep,
  setWalletInfo,
  STEPS,
} from "@/store/slices/tokenPurchaseSlice";
import { useSelector } from "react-redux";
import { calculateTaiTokens } from "@/utils/functions";

const ConfirmTransaction = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedPlan, walletInfo, isProcessing } = useSelector(
    (state: RootState) => state.tokenPurchase
  );
  const amount = selectedPlan?.totalHbar || 0;
  const priceUsd = selectedPlan?.priceUsd;
  const tokens = calculateTaiTokens(selectedPlan.priceUsd);
  const hasInsufficientBalance = walletInfo && walletInfo.balance < amount;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onBack = () => dispatch(previousStep());
  const onClose = () => dispatch(closeModal());

  const onSendTransaction = async () => {
    if (!walletInfo) return;

    dispatch(setProcessing(true));
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
      dispatch(setProcessing(false));
      onClose();
      toast.success("Tokens purchased successfully!", {
        theme: "light",
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await hashConnectService.disconnectWallet();
      dispatch(setWalletInfo(null));
      dispatch(setStep(STEPS.PAYMENT_METHOD));
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
