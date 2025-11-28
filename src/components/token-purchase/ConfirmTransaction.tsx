import {
  Box,
  Typography,
  Button,
  Alert,
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
        sx={{ p: 2, pt: 2, borderBottom: "1px solid rgba(227, 229, 233, 1)" }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: "13px",
            backgroundColor: "rgba(245, 245, 245, 0.27)",
            border: "1px solid rgba(230, 231, 235, 1)",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: "34px",
              letterSpacing: "0px",
              verticalAlign: "middle",
            }}
          >
            Transaction Details
          </Typography>
          <Box sx={{mt: 2, display: 'flex',flexDirection: 'column', gap: 2,}}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "Poppins",
                fontWeight: 400,
                fontSize: "13px",
                lineHeight: "100%",
                letterSpacing: "0%",
              }}
            >
              Plan Price:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "Poppins",
                fontWeight: 600,
                fontSize: "13px",
                lineHeight: "100%",
                letterSpacing: "0%",
                textAlign: "right",
              }}
            >
              ${priceUsd}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "Poppins",
                fontWeight: 400,
                fontSize: "13px",
                lineHeight: "100%",
                letterSpacing: "0%",
              }}
            >
              Total HBAR:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "Poppins",
                fontWeight: 600,
                fontSize: "13px",
                lineHeight: "100%",
                letterSpacing: "0%",
                textAlign: "right",
              }}
            >
              {amount} HBAR
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "Poppins",
                fontWeight: 400,
                fontSize: "13px",
                lineHeight: "100%",
                letterSpacing: "0%",
              }}
            >
              Talent Ai Token:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "Poppins",
                fontWeight: 600,
                fontSize: "13px",
                lineHeight: "100%",
                letterSpacing: "0%",
                textAlign: "right",
              }}
            >
              {tokens.toLocaleString()} TAI
            </Typography>
          </Box>
          </Box>
        </Box>

        <Box sx={{p: 2, pt: 3}}>
          <Typography
            variant="body2"
            sx={{
              mb: 2,
              fontFamily: "Poppins",
              fontWeight: 400,
              fontSize: "12px",
              lineHeight: "100%",
              letterSpacing: "0%",
            }}
          >
            Additional Informations
          </Typography>
          <Box sx={{ display: 'flex',flexDirection: 'column', gap: 2,  p: 2, borderTop: "1px solid rgba(84, 98, 116, 0.21)" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 400,
                  fontSize: "13px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                }}
              >
                Connected Wallet:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  fontSize: "13px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                  textAlign: "right",
                }}
              >
                {walletInfo?.accountId}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 400,
                  fontSize: "13px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                }}
              >
                Balance:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  fontSize: "13px",
                  lineHeight: "100%",
                  letterSpacing: "0%",
                  textAlign: "right",
                }}
              >
                {walletInfo?.balance} HBAR
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Insufficient Balance */}
        {hasInsufficientBalance && (
          <Alert severity="error">
            Insufficient balance. You need {amount} HBAR but have{" "}
            {walletInfo.balance} HBAR.
          </Alert>
        )}
      </Box>

      {/* Bottom Navigation */}
      <Box
        sx={{ display: "flex", justifyContent: "space-between", p: 3, pt: 2 }}
      >
        <Button onClick={onBack} sx={{ color: "rgba(133,169,227,1)" }}>
          Back
        </Button>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            onClick={handleDisconnectWallet}
            sx={{ color: "rgba(133,169,227,1)" }}
          >
            Disconnect Wallet
          </Button>

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
              '&:disabled': {
                border: 'unset'
              }
            }}
          >
            {isProcessing ? "Sending..." : `Send ${amount.toFixed(2)} HBAR`}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default ConfirmTransaction;
