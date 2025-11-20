import React, { useState, useEffect } from 'react';
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
  Divider,
  Chip,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000';

interface PaymentConfirmationDialogProps {
  open: boolean;
  postId: string;
  agentId: string;
  numberOfSteps: number;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

interface PriceData {
  totalPrice: number;
  baseFee: number;
  stepRate: number;
  breakdown: {
    baseFee: string;
    stepsCharge: string;
    total: string;
  };
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    minWidth: 500,
    [theme.breakpoints.down('sm')]: {
      minWidth: '90%',
      margin: 16,
    },
  },
}));

const PriceBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: 12,
  padding: theme.spacing(3),
  color: '#ffffff',
  textAlign: 'center',
  marginBottom: theme.spacing(2),
}));

const BreakdownRow = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 0',
  '&:not(:last-child)': {
    borderBottom: '1px solid #e1e5e9',
  },
});

const PaymentConfirmationDialog: React.FC<PaymentConfirmationDialogProps> = ({
  open,
  postId,
  agentId,
  numberOfSteps,
  onClose,
  onPaymentSuccess,
}) => {
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Fetch price when dialog opens
  useEffect(() => {
    if (open && postId) {
      fetchPrice();
    }
  }, [open, postId]);

  const fetchPrice = async () => {
    setIsLoadingPrice(true);
    setError(null);

    try {
      let token = Cookies.get('api_token');
      if (!token && typeof window !== 'undefined') {
        token =
          window.localStorage.getItem('api_token') ||
          window.localStorage.getItem('token') ||
          undefined;
      }

      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch(
        `${API_BASE_URL}/post/payment/calculate-price/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to calculate price');
      }

      const result = await response.json();
      setPriceData(result.data);
    } catch (err: any) {
      console.error('Error fetching price:', err);
      setError(err.message || 'Failed to calculate payment amount');
    } finally {
      setIsLoadingPrice(false);
    }
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      let token = Cookies.get('api_token');
      if (!token && typeof window !== 'undefined') {
        token =
          window.localStorage.getItem('api_token') ||
          window.localStorage.getItem('token') ||
          undefined;
      }

      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/post/payment/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: postId,
          agentId: agentId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment processing failed');
      }

      const result = await response.json();
      console.log('Payment successful:', result);

      setPaymentSuccess(true);

      // Wait a moment to show success state, then notify parent
      setTimeout(() => {
        onPaymentSuccess();
      }, 1500);
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <MonetizationOnIcon sx={{ color: '#667eea', fontSize: 28 }} />
            <Typography variant="h6" fontWeight={600}>
              Payment Required
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            disabled={isProcessing}
            size="small"
            sx={{ color: '#666' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {isLoadingPrice ? (
          <Box textAlign="center" py={4}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary" mt={2}>
              Calculating payment amount...
            </Typography>
          </Box>
        ) : error && !paymentSuccess ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : paymentSuccess ? (
          <Box textAlign="center" py={4}>
            <CheckCircleIcon sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Payment Successful!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your job post is now active and ready to receive applications.
            </Typography>
          </Box>
        ) : priceData ? (
          <>
            <PriceBox>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                Total Amount
              </Typography>
              <Typography variant="h3" fontWeight={700}>
                {priceData.totalPrice.toLocaleString()} TAI
              </Typography>
              <Chip
                label={`${numberOfSteps} Pipeline ${numberOfSteps === 1 ? 'Step' : 'Steps'}`}
                size="small"
                sx={{
                  mt: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontWeight: 600,
                }}
              />
            </PriceBox>

            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Price Breakdown
            </Typography>

            <Box sx={{ backgroundColor: '#f8fafc', borderRadius: 2, p: 2, mb: 2 }}>
              <BreakdownRow>
                <Typography variant="body2" color="text.secondary">
                  Base Fee
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {priceData.baseFee} TAI
                </Typography>
              </BreakdownRow>

              <BreakdownRow>
                <Typography variant="body2" color="text.secondary">
                  Pipeline Steps ({numberOfSteps} × {priceData.stepRate} TAI)
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {numberOfSteps * priceData.stepRate} TAI
                </Typography>
              </BreakdownRow>

              <Divider sx={{ my: 1 }} />

              <BreakdownRow>
                <Typography variant="body1" fontWeight={600}>
                  Total
                </Typography>
                <Typography variant="body1" fontWeight={700} color="primary">
                  {priceData.totalPrice} TAI
                </Typography>
              </BreakdownRow>
            </Box>

            <Alert severity="info" icon={<AccountBalanceWalletIcon />}>
              Payment will be processed using your connected Hedera wallet. TAI tokens will
              be transferred to the platform.
            </Alert>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        {!paymentSuccess && (
          <>
            <Button
              onClick={handleClose}
              disabled={isProcessing || isLoadingPrice}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPayment}
              variant="contained"
              disabled={isProcessing || isLoadingPrice || !priceData}
              startIcon={isProcessing && <CircularProgress size={16} color="inherit" />}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
              }}
            >
              {isProcessing
                ? 'Processing Payment...'
                : priceData
                ? `Confirm & Pay ${priceData.totalPrice} TAI`
                : 'Confirm Payment'}
            </Button>
          </>
        )}
      </DialogActions>
    </StyledDialog>
  );
};

export default PaymentConfirmationDialog;
