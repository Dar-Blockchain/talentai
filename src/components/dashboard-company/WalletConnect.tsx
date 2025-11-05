import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:5000';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import LaunchIcon from '@mui/icons-material/Launch';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import hashConnectService, { WalletInfo, ConnectionStatus, TransactionResult } from '@/services/hashConnectService';

// Styled Components
const WalletCard = styled(Card)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(3),
  background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)',
  border: '1px solid #e0e7ff',
  borderRadius: '16px',
}));

const ConnectButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: '#ffffff',
  borderRadius: '12px',
  padding: '12px 32px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '16px',
  '&:hover': {
    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
  },
  '&:disabled': {
    background: '#e5e7eb',
    color: '#9ca3af',
  },
}));

const StatusChip = styled(Chip)(({ theme, status }: { theme?: any; status: 'disconnected' | 'connecting' | 'connected' | 'error' }) => ({
  fontWeight: 600,
  ...(status === 'disconnected' && {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
  }),
  ...(status === 'connecting' && {
    backgroundColor: '#fef3c7',
    color: '#d97706',
  }),
  ...(status === 'connected' && {
    backgroundColor: '#d1fae5',
    color: '#047857',
  }),
  ...(status === 'error' && {
    backgroundColor: '#fecaca',
    color: '#dc2626',
  }),
}));

// Types
interface WalletConnectProps {
  amount: number;
  tokens: number;
  priceUsd?: number;
  planId?: string;
  onPaymentComplete: () => void;
}

// WalletInfo is now imported from hashConnectService

const WalletConnect: React.FC<WalletConnectProps> = ({
  amount,
  tokens,
  priceUsd,
  planId,
  onPaymentComplete,
}) => {
  const [walletStatus, setWalletStatus] = useState<ConnectionStatus>('disconnected');
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHashConnectReady, setIsHashConnectReady] = useState(false);

  const steps = [
    'Connect HashPack Wallet',
    'Confirm Transaction',
    'Payment Complete',
  ];

  // Initialize HashConnect event handlers
  useEffect(() => {
    // Only initialize on client side
    if (typeof window === 'undefined') return;

    // Set up event handlers
    hashConnectService.setEventHandlers({
      onConnectionStatusChange: (status: ConnectionStatus) => {
        setWalletStatus(status);
        if (status === 'connected') {
          setActiveStep(1);
        } else if (status === 'disconnected') {
          setActiveStep(0);
          setWalletInfo(null);
          setTransactionHash(null);
        }
      },
      onWalletConnected: (info: WalletInfo) => {
        setWalletInfo(info);
        setErrorMessage(null);
      },
      onWalletDisconnected: () => {
        setWalletInfo(null);
        setActiveStep(0);
        setTransactionHash(null);
      },
      onError: (error: string) => {
        setErrorMessage(error);
        setWalletStatus('error');
      },
      onInitialized: () => {
        setIsHashConnectReady(true);
        console.log('HashConnect is ready');
      }
    });

    // Check if HashConnect is already ready
    const checkExistingConnection = async () => {
      if (hashConnectService.isReady()) {
        setIsHashConnectReady(true);
        const initialStatus = hashConnectService.getConnectionStatus();
        setWalletStatus(initialStatus);

        if (initialStatus === 'connected') {
          const info = await hashConnectService.getWalletInfo();
          if (info) {
            setWalletInfo(info);
            setActiveStep(1);
          }
        }
      }
    };

    checkExistingConnection();

    // No timeout needed as we now rely on the onInitialized callback
  }, []);

  // Check if HashPack is available
  const isHashPackAvailable = () => {
    return hashConnectService.isHashPackAvailable();
  };

  const connectWallet = async () => {
    try {
      setErrorMessage(null);
      await hashConnectService.connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setErrorMessage(`Failed to connect wallet: ${error}`);
      setWalletStatus('error');
    }
  };

  const disconnectWallet = async () => {
    try {
      await hashConnectService.disconnectWallet();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      setErrorMessage(`Failed to disconnect wallet: ${error}`);
    }
  };

  const sendTransaction = async () => {
    if (!walletInfo) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Step 1: Send HBAR transaction via HashConnect
      const result: TransactionResult = await hashConnectService.sendHbarTransaction(amount);
      console.log(planId,"******")
      if (result.status === 'success') {
        setTransactionHash(result.transactionId);
        setActiveStep(2);

        // Step 2: Call backend to verify payment and distribute TAI tokens
        if (planId) {
          try {
            const apiUrl = `${API_BASE_URL}/payment/complete`;
            console.log('💰 Completing payment on backend...', {
              apiUrl,
              planId,
              transactionId: result.transactionId
            });

            const token = localStorage.getItem('token');
            console.log('🔑 Auth token:', token ? 'exists' : 'MISSING!');

            const response = await fetch(apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                planId,
                hederaTransactionId: result.transactionId
              })
            });

            console.log('📡 Payment API response status:', response.status, response.statusText);

            const data = await response.json();
            console.log('📦 Payment API response data:', data);

            if (data.success) {
              console.log('✅ Payment completed successfully:', data);
              console.log(`🎉 You received ${data.data.taiTokens} TAI tokens!`);
              console.log(`⛽ Gas fee: ${data.data.gasFeeHbar} HBAR`);

              // Complete payment after a short delay
              setTimeout(() => {
                onPaymentComplete();
              }, 2000);
            } else {
              console.warn('⚠️  Backend payment completion failed:', data.message);
              setErrorMessage(`Payment sent but token distribution failed: ${data.message}`);
              // Still call onPaymentComplete as HBAR was sent
              setTimeout(() => {
                onPaymentComplete();
              }, 2000);
            }
          } catch (backendError) {
            console.error('❌ Backend error:', backendError);
            setErrorMessage(`Payment sent but backend processing failed. Please contact support with transaction ID: ${result.transactionId}`);
            // Still call onPaymentComplete as HBAR was sent
            setTimeout(() => {
              onPaymentComplete();
            }, 2000);
          }
        } else {
          // No planId, just complete (legacy flow)
          setTimeout(() => {
            onPaymentComplete();
          }, 2000);
        }
      } else {
        throw new Error(result.message || 'Transaction failed');
      }

    } catch (error) {
      console.error('Transaction failed:', error);
      setErrorMessage(`Transaction failed: ${error}`);
      setWalletStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const openHashPack = () => {
    window.open('https://www.hashpack.app/', '_blank');
  };

  const renderConnectStep = () => (
    <WalletCard>
      <Box sx={{ mb: 3 }}>
        <Avatar sx={{
          width: 64,
          height: 64,
          margin: '0 auto',
          mb: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <AccountBalanceWalletIcon sx={{ fontSize: 32 }} />
        </Avatar>

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Connect Your HashPack Wallet
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Connect your wallet to send HBAR and receive tokens on Hedera Testnet
        </Typography>

        <Box sx={{ mb: 3, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1565c0', mb: 1 }}>
            ⚠️ Important: Hedera Testnet Network
          </Typography>
          <Typography variant="body2" sx={{ color: '#1565c0' }}>
            Make sure your wallet is set to Hedera Testnet network before connecting.
          </Typography>
        </Box>

        <StatusChip
          status={walletStatus}
          label={
            walletStatus === 'disconnected' ? 'Wallet Disconnected' :
            walletStatus === 'connecting' ? 'Connecting...' :
            walletStatus === 'connected' ? 'Wallet Connected' :
            'Connection Error'
          }
          icon={
            walletStatus === 'connecting' ? <CircularProgress size={16} /> :
            walletStatus === 'connected' ? <CheckCircleIcon /> :
            walletStatus === 'error' ? <ErrorIcon /> : undefined
          }
        />
      </Box>

      {walletStatus === 'disconnected' && (
        <Box>
          {!isHashConnectReady && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Initializing HashConnect...
                </Typography>
              </Box>
            </Alert>
          )}

          {isHashConnectReady && !isHashPackAvailable() && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                No wallet detected. You can connect using:
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  • HashPack Extension (recommended)
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  • WalletConnect compatible wallets
                </Typography>
              </Box>
              <Button
                size="small"
                startIcon={<LaunchIcon />}
                onClick={openHashPack}
                sx={{ mt: 2 }}
              >
                Download HashPack
              </Button>
            </Alert>
          )}

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="body2">
                {errorMessage}
              </Typography>
            </Alert>
          )}

          <ConnectButton
            onClick={connectWallet}
            disabled={!isHashConnectReady}
            startIcon={<AccountBalanceWalletIcon />}
          >
            {!isHashConnectReady ? 'Loading HashConnect...' : 'Connect Wallet'}
          </ConnectButton>
        </Box>
      )}

      {walletStatus === 'connecting' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Connecting to HashPack...</Typography>
        </Box>
      )}

      {walletStatus === 'error' && (
        <Alert severity="error">
          <Typography variant="body2">
            {errorMessage || 'Failed to connect to HashPack. Please try again.'}
          </Typography>
          <Button
            size="small"
            onClick={connectWallet}
            sx={{ mt: 1 }}
          >
            Retry Connection
          </Button>
        </Alert>
      )}
    </WalletCard>
  );

  const renderTransactionStep = () => (
    <WalletCard>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Confirm Transaction
        </Typography>

        {/* Wallet Info */}
        <Box sx={{
          backgroundColor: '#f9fafb',
          padding: 2,
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          mb: 3,
          textAlign: 'left'
        }}>
          <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
            Connected Wallet:
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2 }}>
            {walletInfo?.accountId}
          </Typography>

          <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
            Balance:
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {walletInfo?.balance} HBAR
          </Typography>

          <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
            Network:
          </Typography>
          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
            {walletInfo?.network}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Transaction Details */}
        <Box sx={{ textAlign: 'left', mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Transaction Details:
          </Typography>

          {priceUsd && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Plan Price:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>${priceUsd} USD</Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Total HBAR:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{amount} HBAR</Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">TAI Tokens:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#10b981' }}>{tokens.toLocaleString()} TAI</Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">To:</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{hashConnectService.getTargetAccountId()}</Typography>
          </Box>
        </Box>

        {/* Insufficient Balance Warning */}
        {walletInfo && walletInfo.balance < amount && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Insufficient balance. You need {amount} HBAR but have {walletInfo.balance} HBAR.
            </Typography>
          </Alert>
        )}

        {/* Send Transaction Button */}
        <ConnectButton
          onClick={sendTransaction}
          disabled={isProcessing || !walletInfo || walletInfo.balance < amount}
          startIcon={isProcessing ? <CircularProgress size={16} /> : <SwapHorizIcon />}
        >
          {isProcessing ? 'Sending...' : `Send ${amount} HBAR`}
        </ConnectButton>

        <Button
          onClick={disconnectWallet}
          sx={{ mt: 2, display: 'block', mx: 'auto' }}
          color="inherit"
        >
          Disconnect Wallet
        </Button>
      </Box>
    </WalletCard>
  );

  const renderCompleteStep = () => (
    <WalletCard>
      <Box sx={{ mb: 3 }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: '#10b981', mb: 2 }} />

        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Payment Successful!
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {tokens.toLocaleString()} tokens have been added to your account
        </Typography>

        {transactionHash && (
          <Box sx={{
            backgroundColor: '#f9fafb',
            padding: 2,
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            textAlign: 'left'
          }}>
            <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
              Transaction Hash:
            </Typography>
            <Typography variant="body2" sx={{
              fontFamily: 'monospace',
              wordBreak: 'break-all'
            }}>
              {transactionHash}
            </Typography>
          </Box>
        )}
      </Box>
    </WalletCard>
  );

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderConnectStep();
      case 1:
        return renderTransactionStep();
      case 2:
        return renderCompleteStep();
      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Payment Summary */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Connect your HashPack wallet to send <strong>{amount} HBAR</strong> and receive <strong>{tokens.toLocaleString()} tokens</strong>
        </Typography>
      </Alert>

      {/* Steps */}
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              {renderStepContent(index)}
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {/* Help Text */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> Make sure you have enough HBAR in your HashPack wallet to complete the transaction.
          Transaction fees may apply.
        </Typography>
      </Alert>
    </Box>
  );
};

export default WalletConnect;