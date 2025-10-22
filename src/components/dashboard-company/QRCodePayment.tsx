import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QrCodeIcon from '@mui/icons-material/QrCode';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { QRCodeSVG } from 'qrcode.react';

// Styled Components
const QRCard = styled(Card)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(3),
  background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)',
  border: '1px solid #e0e7ff',
  borderRadius: '16px',
}));

const CopyButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: '#f3f4f6',
  color: '#6b7280',
  '&:hover': {
    backgroundColor: '#e5e7eb',
    color: '#374151',
  },
}));

const StatusChip = styled(Chip)(({ theme, status }: { theme?: any; status: 'waiting' | 'confirmed' | 'failed' }) => ({
  fontWeight: 600,
  ...(status === 'waiting' && {
    backgroundColor: '#fef3c7',
    color: '#d97706',
  }),
  ...(status === 'confirmed' && {
    backgroundColor: '#d1fae5',
    color: '#047857',
  }),
  ...(status === 'failed' && {
    backgroundColor: '#fecaca',
    color: '#dc2626',
  }),
}));

// Types
interface QRCodePaymentProps {
  amount: number;
  tokens: number;
  onPaymentComplete: () => void;
}

// Hedera account info from env
const HEDERA_ACCOUNT_ID = '0.0.1378'; // From your .env
const HEDERA_NETWORK = 'testnet';

const QRCodePayment: React.FC<QRCodePaymentProps> = ({
  amount,
  tokens,
  onPaymentComplete,
}) => {
  const [paymentStatus, setPaymentStatus] = useState<'waiting' | 'confirmed' | 'failed'>('waiting');
  const [isChecking, setIsChecking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [copied, setCopied] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  // Generate payment URL for QR code
  const paymentUrl = `https://hashpack.app/send?to=${HEDERA_ACCOUNT_ID}&amount=${amount}&memo=Token_Purchase_${Date.now()}`;

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-check for payment (simulation)
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (paymentStatus === 'waiting' && timeLeft > 0) {
        checkPaymentStatus();
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(checkInterval);
  }, [paymentStatus, timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const checkPaymentStatus = async () => {
    if (isChecking) return;

    setIsChecking(true);

    // Simulate payment verification with Hedera
    // In real implementation, this would check Hedera blockchain
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate random payment confirmation for demo
      const isPaymentReceived = Math.random() > 0.7; // 30% chance of "payment"

      if (isPaymentReceived) {
        setPaymentStatus('confirmed');
        setTransactionHash('0.0.1378@1234567890.123456789');
        setTimeout(() => {
          onPaymentComplete();
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to check payment status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const steps = [
    'Scan QR Code with HashPack',
    'Send HBAR Payment',
    'Wait for Confirmation',
  ];

  const activeStep = paymentStatus === 'waiting' ? 0 : paymentStatus === 'confirmed' ? 2 : 1;

  return (
    <Box>
      {/* Payment Summary */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Send <strong>${amount} HBAR</strong> to the address below to receive <strong>{tokens.toLocaleString()} tokens</strong>
        </Typography>
      </Alert>

      {/* QR Code and Details */}
      <QRCard>
        <Box sx={{ mb: 3 }}>
          <QrCodeIcon sx={{ fontSize: 32, color: '#667eea', mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Scan with HashPack Wallet
          </Typography>

          {/* QR Code */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 3,
            p: 2,
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e0e7ff'
          }}>
            <QRCodeSVG
              value={paymentUrl}
              size={200}
              bgColor="#ffffff"
              fgColor="#000000"
              level="M"
              includeMargin={true}
            />
          </Box>

          {/* Payment Status */}
          <StatusChip
            status={paymentStatus}
            label={
              paymentStatus === 'waiting' ? 'Waiting for Payment' :
              paymentStatus === 'confirmed' ? 'Payment Confirmed' :
              'Payment Failed'
            }
            icon={paymentStatus === 'confirmed' ? <CheckCircleIcon /> : undefined}
          />
        </Box>

        {/* Account Details */}
        <Box sx={{ textAlign: 'left', mb: 3 }}>
          <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
            Hedera Account ID:
          </Typography>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f9fafb',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            mb: 2
          }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', flex: 1 }}>
              {HEDERA_ACCOUNT_ID}
            </Typography>
            <Tooltip title={copied ? 'Copied!' : 'Copy Account ID'}>
              <CopyButton
                size="small"
                onClick={() => copyToClipboard(HEDERA_ACCOUNT_ID)}
              >
                <ContentCopyIcon fontSize="small" />
              </CopyButton>
            </Tooltip>
          </Box>

          <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
            Amount:
          </Typography>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f9fafb',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            mb: 2
          }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', flex: 1 }}>
              {amount} HBAR
            </Typography>
            <Tooltip title={copied ? 'Copied!' : 'Copy Amount'}>
              <CopyButton
                size="small"
                onClick={() => copyToClipboard(amount.toString())}
              >
                <ContentCopyIcon fontSize="small" />
              </CopyButton>
            </Tooltip>
          </Box>

          <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
            Network:
          </Typography>
          <Typography variant="body2" sx={{
            backgroundColor: '#f9fafb',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            textTransform: 'capitalize'
          }}>
            {HEDERA_NETWORK}
          </Typography>
        </Box>

        {/* Timer */}
        {paymentStatus === 'waiting' && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
              Time remaining:
            </Typography>
            <Typography variant="h6" sx={{
              color: timeLeft > 300 ? '#10b981' : '#ef4444',
              fontWeight: 600
            }}>
              {formatTime(timeLeft)}
            </Typography>
          </Box>
        )}

        {/* Transaction Hash */}
        {transactionHash && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
              Transaction Hash:
            </Typography>
            <Typography variant="body2" sx={{
              fontFamily: 'monospace',
              backgroundColor: '#f9fafb',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              wordBreak: 'break-all'
            }}>
              {transactionHash}
            </Typography>
          </Box>
        )}

        {/* Manual Check Button */}
        {paymentStatus === 'waiting' && (
          <Button
            onClick={checkPaymentStatus}
            disabled={isChecking}
            startIcon={isChecking ? <CircularProgress size={16} /> : <RefreshIcon />}
            variant="outlined"
            sx={{ mt: 2 }}
          >
            {isChecking ? 'Checking...' : 'Check Payment Status'}
          </Button>
        )}
      </QRCard>

      {/* Steps */}
      <Box sx={{ mt: 3 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>
                <Typography variant="body2">{label}</Typography>
              </StepLabel>
              {index === 0 && (
                <StepContent>
                  <Typography variant="caption" color="text.secondary">
                    Open HashPack wallet and scan the QR code above
                  </Typography>
                </StepContent>
              )}
              {index === 1 && (
                <StepContent>
                  <Typography variant="caption" color="text.secondary">
                    Confirm the transaction in your HashPack wallet
                  </Typography>
                </StepContent>
              )}
              {index === 2 && (
                <StepContent>
                  <Typography variant="caption" color="text.secondary">
                    Your tokens will be added to your account once confirmed
                  </Typography>
                </StepContent>
              )}
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Help Text */}
      <Alert severity="warning" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Important:</strong> Make sure to send the exact amount ({amount} HBAR) to avoid delays in processing.
          Payments are automatically verified on the Hedera network.
        </Typography>
      </Alert>
    </Box>
  );
};

export default QRCodePayment;