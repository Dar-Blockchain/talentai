import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  processPostPayment,
  selectPostPayment,
  selectPostStepsLoading,
} from "@/store/slices/postSlice";

interface PaymentConfirmationModalProps {
  open: boolean;
  onClose: () => void;
}

/* ================= Styles ================= */

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: 16,
    minWidth: 500,
    [theme.breakpoints.down("sm")]: {
      minWidth: "90%",
      margin: 16,
    },
  },
}));

const BreakdownRow = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
});

/* ================= Component ================= */

const PaymentConfirmationModal: React.FC<
  PaymentConfirmationModalProps
> = ({ open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  /* ===== Redux State ===== */
  const saveStepsLoading = useSelector(selectPostStepsLoading);
  const { data, loading: paymentLoading, error } =
    useSelector(selectPostPayment);

  const savedPost = useSelector(
    (state: any) => state.post.savePost.savedPost
  );
  const recruitmentFlow = useSelector(
    (state: any) => state.post.recruitmentFlow
  );
  const { value: agent } = useSelector(
    (state: RootState) => state.agentConfig.createConfig
  );

  /* ===== Derived State ===== */
  const numberOfSteps = recruitmentFlow?.nodes?.length || 0;
  const totalPrice = 1000 + numberOfSteps * 100;

  const isSavingSteps = saveStepsLoading;
  const isProcessingPayment = paymentLoading;
  const isBusy = isSavingSteps || isProcessingPayment;

  const dialogTitle = isSavingSteps
  ? "Saving Recruitment Pipeline"
  : "Publish Job Post";

  /* ===== Handlers ===== */

  const handleConfirm = () => {
    dispatch(
      processPostPayment({
        postId: savedPost?.jobData?._id,
        agentId: agent?.agentId,
      })
    );
  };

  const handleClose = () => {
    if (!isBusy) {
      onClose();
    }
  };

  /* ================= Render ================= */

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      {/* ===== Title ===== */}
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight={600}>
              {dialogTitle}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={isBusy}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* ===== Content ===== */}
      <DialogContent>
        {/* STEP 1: Saving recruitment steps */}
        {isSavingSteps && (
          <Box textAlign="center" py={4}>
            <CircularProgress size={40} />
            <Typography mt={2} color="text.secondary">
              Saving recruitment pipeline...
            </Typography>
          </Box>
        )}

        {/* STEP 2: Processing payment */}
        {!isSavingSteps && isProcessingPayment && (
          <Box textAlign="center" py={4}>
            <CircularProgress size={40} />
            <Typography mt={2} color="text.secondary">
              Processing payment...
            </Typography>
          </Box>
        )}

        {/* STEP 3: Success */}
        {!isSavingSteps && !isProcessingPayment && data && (
          <Box textAlign="center" py={4}>
            <CheckCircleIcon
              sx={{ fontSize: 64, color: "#4caf50", mb: 2 }}
            />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Payment Successful!
            </Typography>
            <Typography color="text.secondary">
              Your job post is now active and ready to receive applications.
            </Typography>
          </Box>
        )}

        {/* STEP 4: Payment confirmation */}
        {!isSavingSteps && !isProcessingPayment && !data && (
          <>
            <Alert
              severity="info"
              icon={<MonetizationOnIcon />}
              sx={{ mb: 3 }}
            >
              <Typography fontWeight={600} gutterBottom>
                Pipeline Pricing
              </Typography>
              <Typography variant="body2">
                Base Fee: <strong>1,000 TAI</strong> +{" "}
                <strong>100 TAI</strong> per interview step
              </Typography>
            </Alert>

            <Box
              sx={{
                backgroundColor: "#f8fafc",
                borderRadius: 2,
                p: 2,
                mb: 2,
              }}
            >
              <BreakdownRow>
                <Typography fontWeight={600}>Steps</Typography>
                <Typography>{numberOfSteps}</Typography>
              </BreakdownRow>
              <BreakdownRow>
                <Typography fontWeight={600}>Total</Typography>
                <Typography fontWeight={700} color="primary">
                  {totalPrice} TAI
                </Typography>
              </BreakdownRow>
            </Box>

            <Alert severity="info" icon={<AccountBalanceWalletIcon />}>
              Payment will be processed using your connected Hedera wallet.
            </Alert>
          </>
        )}

        {error && <Alert severity="error">{error}</Alert>}
      </DialogContent>

      {/* ===== Actions ===== */}
      {!isSavingSteps && <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} disabled={isBusy}>
          Cancel
        </Button>

        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={isBusy || !!data}
          startIcon={
            isProcessingPayment && (
              <CircularProgress size={16} color="inherit" />
            )
          }
          sx={{
            color: "white",
            background:
              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            fontWeight: 600,
            px: 3,
          }}
        >
          {isProcessingPayment
            ? "Processing Payment..."
            : "Confirm Payment"}
        </Button>
      </DialogActions>}
    </StyledDialog>
  );
};

export default PaymentConfirmationModal;
