import React, { useState } from "react";
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
  Chip,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  processPostPayment,
  selectPostPayment,
} from "@/store/slices/postSlice";

interface PaymentConfirmationModalProps {
  open: boolean;
  onClose: () => void;
}

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

const PriceBox = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  borderRadius: 12,
  padding: theme.spacing(3),
  color: "#ffffff",
  textAlign: "center",
  marginBottom: theme.spacing(2),
}));

const BreakdownRow = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
  "&:not(:last-child)": {
    borderBottom: "1px solid #e1e5e9",
  },
});

const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
  open,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const savedPost = useSelector((state: any) => state.post.savePost.savedPost);
  const recruitmentFlow = useSelector(
    (state: any) => state.post.recruitmentFlow
  );
  const { value: agent } = useSelector(
    (state: RootState) => state.agentConfig.createConfig
  );
  const { data, loading, error } = useSelector(selectPostPayment);
  const numberOfSteps = recruitmentFlow?.nodes.length;
  const [totalPrice, setTotalPrice] = useState(null)

  const calculateTotalPrice = () => {
    
  }

  const handleConfirm = () => {
    dispatch(
      processPostPayment({
        postId: savedPost?.jobData?._id,
        agentId: agent?.agentId,
      })
    );
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <MonetizationOnIcon sx={{ color: "#667eea", fontSize: 28 }} />
            <Typography variant="h6" fontWeight={600}>
              Payment Required
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            disabled={loading}
            size="small"
            sx={{ color: "#666" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading && (
          <Box textAlign="center" py={4}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary" mt={2}>
              Payment in progress...
            </Typography>
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {true && (
          <Box textAlign="center" py={4}>
            <CheckCircleIcon sx={{ fontSize: 64, color: "#4caf50", mb: 2 }} />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Payment Successful!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your job post is now active and ready to receive applications.
            </Typography>
          </Box>
        )}
        <Alert
          severity="info"
          icon={<MonetizationOnIcon />}
          sx={{
            mb: 3,
            borderRadius: 2,
            backgroundColor: "rgba(139, 92, 246, 0.05)",
            border: "1px solid rgba(139, 92, 246, 0.2)",
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight={600}
            gutterBottom
            sx={{ color: "#0F172A" }}
          >
            💰 Pipeline Pricing Information
          </Typography>
          <Typography variant="body2" sx={{ color: "#475569" }}>
            Base Fee: <strong>1,000 TAI</strong> + <strong>100 TAI</strong> per
            interview step
            <br />
            <Box
              component="span"
              sx={{
                fontSize: "0.85rem",
                color: "#64748b",
                mt: 0.5,
                display: "block",
              }}
            >
              Examples: 1 step = 1,100 TAI | 2 steps = 1,200 TAI | 5 steps =
              1,500 TAI | 10 steps = 2,000 TAI
            </Box>
          </Typography>
        </Alert>
        <Box sx={{ backgroundColor: "#f8fafc", borderRadius: 2, p: 2, mb: 2 }}>
          <BreakdownRow>
            <Typography variant="body1" fontWeight={600}>
              Total
            </Typography>
            <Typography variant="body1" fontWeight={700} color="primary">
              1500 TAI
            </Typography>
          </BreakdownRow>
        </Box>

        <Alert severity="info" icon={<AccountBalanceWalletIcon />}>
          Payment will be processed using your connected Hedera wallet. TAI
          tokens will be transferred to the platform.
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} color="inherit" />}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            textTransform: "none",
            fontWeight: 600,
            px: 3,
          }}
        >
          {loading ? "Processing Payment..." : "Confirm Payment"}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default PaymentConfirmationModal;
